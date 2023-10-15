const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//importing the schema
const Work = require("../../models/Work");

//importing validation
const validateWorkInput = require("../../validator/work")

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

// @route TEST api/work/test
// @desc Testing the route
// @access Public
router.get("/test", (req, res) => res.json({ msg: "working Route Works" }));

// @route GET api/work/all
// @desc Get all the work posts
// @access Public
router.get("/all", (req,res)=> {
    const errors = {};

    Work.find()
        .then((work)=> {
            if(!work){
                errors.noWork = "There are no work posts currently";
                return res.status(404).json(errors);
            }
            res.json(work);
        })
        .catch((err => {
            res.status(404).json({work : "There are no working posts curretly"});
        }))
})
// @route GET api/Work/query
// @desc GET a Work via field
// @access Public
router.get("/query", async (req,res) => {
    const errors = {};
    const match = {};
    try {
    const features = new APIfeatures(Work.find(), req.query)
        .filtering()
        .sorting()
    
    const works = await features.query;
    res.status(200).json(works)
} catch(err) {
    res.status(404).json({
        status : "Fail",
        message : err
    })
}
})


// @route GET api/work/:id
// @desc Get work post of the id
// @access Public
router.get("/:id", (req,res)=> {
    const errors = {}
    
    Work.findById(req.params.id)
        .then((work) => {
            if(!work) {
                errors.noWork = "There are no working posts currently"
                res.status(404).json(errors);
            }
            res.json(work)
        })
        .catch(err => {
            res.status(404).json(err);
        })
})

// @route GET api/work/user/:id
// @desc Get all the work post of the id
// @access Public
router.get("user/:id", (req,res) => {
    const errors = {}

    Work.find({user : req.params.id})
        .then((work) => {
            if(!work) {
                errors.noWork = "There are no posts by this user"
                res.status(404).json(errors);
            }
            res.json(work);
        })
        .catch(err => {
            res.status(404).json(err);
        })
})

// @route POST api/work
// @desc Post a work
// @access Private
router.post(
    "/",
    passport.authenticate("jwt", {session : false}),
    (req,res)=> {
        
    const {errors, isValid} = validateWorkInput(req.body);

    // Check Validation
    if(!isValid) {
        // Return any errors with 400 status
        return res.status(400).json(errors);
    }
    else {
    // Get fields
    const workFields = {};
    workFields.user = req.user.id;
    if(req.body.category) workFields.category = req.body.category;
    if(req.body.subCategory) workFields.subCategory = req.body.subCategory;
    if(req.body.company) workFields.company = req.body.company;
    if(req.body.title) workFields.title = req.body.title;
    if(req.body.description) workFields.description = req.body.description;
    if(req.body.typeOfProject) workFields.typeOfProject = req.body.typeOfProject;
    if(req.body.vacancy) workFields.vacancy = req.body.vacancy;
    if(req.body.location) workFields.location = req.body.location;
    if(req.body.experience) workFields.experience = req.body.experience;
    if(req.body.salary) workFields.salary = req.body.salary;
    if(req.body.projectLength) workFields.projectLength = req.body.projectLength;
    if(req.body.jobStatus) workFields.jobStatus = req.body.jobStatus
    if(req.body.deadline) workFields.deadline = req.body.deadline;
    
    // Skills - Spilt into array
    if (typeof req.body.skills !== "undefined") {
        workFields.skills = req.body.skills.split(",");
    }

    // Save Work Post
    new Work(workFields)
    .save()
    .then((work)=> res.json(work))
    .catch(err => res.status(404).json(err))
    }
})  

// @route POST api/work/apply
// @desc Apply for a position
// @access private
router.post(
    "/apply/:id",
    passport.authenticate("jwt", {session : false}),
    (req,res) => {
        const errors = {};

        const appliedUser = req.user.id;
        Work.findById(req.params.id )
            .then((work)=> {
                if(!work){
                    errors.noWork = "There is no such work"
                    res.status(404).json(errors);
                }
                else {
                    // Add to apply array
                    work.apply.unshift(appliedUser);
                    work.save().then((work)=> res.json(work));
                }
            })
            .catch(err => {
                res.status(404).json(err);
            })
    }
)

// @route   POST api/work/activate/:id
// @desc    Activate a work
// @access  Private
router.post(
    '/activate/:id',
    //passport.authenticate('jwt', {session: false}),
    (req,res)=> {
      const error = {};
      Work
      .findById(req.params.id)
      .then(work => {
        if(!work){
          error.nowork = "No work Found";
          res.status(404).json(error);
        }
        else {
          work.activate = !work.activate;
          work.save().then(work => res.json(work))
        }
      })
      .catch(err => {
        res.status(400).json(err);
      })
    }
  );  

module.exports = router;