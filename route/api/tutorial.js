const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const upload = require("../../utils/uploadFiles");
const { getVideoDurationInSeconds } = require('get-video-duration')

//Load Service model
const Tutorial = require("../../models/Tutorial");

//importing validation for services
const validateTutorialInput = require("../../validator/tutorial");
const validateChapterInput = require("../../validator/chapter");

class APIfeatures {
  constructor(query, queryString){
      this.query = query;
      this.queryString = queryString;
  }
  filtering(){
      const queryObj = {...this.queryString};
      const excludedfields = ['page',"sort",'limit'];
      excludedfields.forEach(el => delete queryObj[el]);
      let querystr = JSON.stringify(queryObj);
      querystr = querystr.replace(/\b(gte||gt||lt||lte)\b/g, match => `${match}`);
      this.query.find(JSON.parse(querystr));
      return this
  }
  sorting(){
      if(this.queryString.sort){
          const sortby = this.queryString.sort.split(",").join(" ");
          this.query = this.query.sort(sortby);
      }
      else {
          this.query = this.query.sort("-createdAt");
      }
      return this
  }
  pagination(){
      const page = this.queryString.page * 1 || 1;
      const limit = this.queryString.limit *1 || 4;
      const skip = (page-1) * limit;
      this.query = this.query.skip(skip).limit(limit);
      return this;
  }
}

// @route   GET api/tutorial/test
// @desc    Tests tutorial route
// @access  Public
router.get("/test", (req, res) => res.json({ msg: "tutorial Works" }));

// @route GET api/tutorial
// @desc Gets all the tutorials
// @access Public
router.get("/", (req, res) => {
  const errors = {};

  Tutorial.find()
    .then((tutorials) => {
      if (!tutorials) {
        errors.notutorials = "No tutorials found";
        return res.status(404).json(errors);
      } else {
        res.json(tutorials);
      }
    })
    .catch((err) =>
      res.status(404).json({ tutorials: "There are no profiles" })
    );
});

// @route GET api/tutorial/query
// @desc GET a tutorial via field
// @access Public
router.get("/query", async (req,res) => {
  try {
    const queryObj = { ...req.query };
    let queryStr = JSON.stringify(queryObj)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|eq|ne)\b/g, match => `$${match}`);
    // queryStr  : {"ratings":{"$gt":"3"}}
    const tutorials = await Tutorial.find(JSON.parse(queryStr));
    res.json(tutorials)
} catch (err) {
    res.status(401).json({
        status: 'error',
        message: 'Error in post finding',
        error: err
    })
}
})

// @route   POST api/tutorial/activate/:id
// @desc    Activate a Tutorial
// @access  Private
router.patch(
  '/activate/:id',
  //passport.authenticate('jwt', {session: false}),
  (req,res)=> {
    const error = {};
    Tutorial
    .findById(req.params.id)
    .then(tutorial => {
      if(!tutorial){
        error.notutorial = "No tutorial Found";
        res.status(404).json(error);
      }
      else {
        tutorial.activate = !tutorial.activate;
        tutorial.save().then(tutorial => res.json(tutorial)).catch(err => console.log(err));
      }
    })
    .catch(err => {
      res.status(400).json(err);
    })
  }
);


// @route POST api/tutorial
// @desc create a tutorial post
// @access Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  //upload.single("coverPicture"),
  //upload.single("video"),
  upload.fields([{
    name: 'introVideo', maxCount: 1
  },{
    name : 'cardpicture', maxCount : 1
  }]),
  (req, res) => {
    const { errors, isValid } = validateTutorialInput(req.body);

    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }

    const videoFile = req.files.introVideo;
    //const coverPictureFile = req.files.cardpicture[0];
    const tutorialFields = {};

    tutorialFields.user = req.user.id;
    console.log(videoFile);
    //console.log(coverPictureFile);

    //tutorialFields.profile = req.profile.handle;

    if (req.body.category) tutorialFields.category = req.body.category;
    if (req.body.requirements) tutorialFields.requirements = req.body.requirements;
    if (req.files.introVideo[0].path) tutorialFields.introVideo = req.files.introVideo[0].path;
    if (req.files.cardpicture[0].path) tutorialFields.cardpicture = req.files.cardpicture[0].path;
    if (req.body.header) tutorialFields.header = req.body.header;
    if (req.body.price) tutorialFields.price = req.body.price;
    if (req.body.description) tutorialFields.description = req.body.description;

    new Tutorial(tutorialFields).save().then((tutorial) => res.json(tutorial));
  }
);


// @route POST api/tutorial
// @desc create a tutorial post
// @access Private
router.post(
  "/chapter/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateChapterInput(req.body);

    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }

    Tutorial.findOne({ tutorial : req.params.id }).then((tutorial) => {
      const newVideo = {
        title: req.body.title,
        chapter: req.body.chapter,
        numberOfLecture : req.body.numberOfLecture,
        summary: req.body.summary,
      };
      

      // Add chapter array
      tutorial.tutorialVideo.unshift(newVideo);
      tutorial.save().then((tutorial)=> res.json(tutorial));

      // Add to exp array
      /*
      profile.experience.unshift(newExp);
      profile.save().then((profile) => res.json(profile));
      */
      
    })
    .catch(err => {
      res.status(404).json({noTutorial : "No tutorial found with the id" })
    })
  }
);

// @route GET api/tutorial/:id
// @desc Get the tutorial by the id
// @access Public

router.get("/:id", (req,res)=> {
  const errors = {}

  Tutorial.findById(req.params.id)
    .then(tutorial => {
      if(!tutorial){
        errors.notutorials = "No tutorial found with this id"
        res.status(404).json(errors);
      }
      else {
        res.json(tutorial)
      }
    })
    .catch(err => res.status(404).json({tutorial : "No tutorial found with this id"}))
})

// @route GET api/tutorial/user/:id
// @desc Get the tutorials by the user
// @access Public

router.get('/user/:id', (req,res)=> {
  const errors = {}

  Tutorial.find({ user : req.params.id})
    .then(tutorials => {
      if(!tutorials) {
        errors.notutorials = "There are no tutorials for the user"
        res.status(404).json(errors);
      }
      else {
        res.json(tutorials)
      }
    })
    .catch(err => {
      res.status(404).json({tutorials : "There are no tutorials for the user"})
    })
})


module.exports = router;
