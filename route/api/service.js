const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const upload = require("../../utils/uploadFiles");

//Load Service model
const Service = require("../../models/Service");

//importing validation for services
const validateServiceInput = require("../../validator/service");

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

// @route   GET api/service/test
// @desc    Tests service route
// @access  Public
router.get("/test", (req, res) => res.json({ msg: "Service Works" }));

// @route GET api/service
// @desc Gets all the services
// @access Public
router.get("/", (req, res) => {
  const errors = {};

  Service.find()
    .then((services) => {
      if (!services) {
        errors.noServices = "No services found";
        return res.status(404).json(errors);
      } else {
        res.json(services);
      }
    })
    .catch((err) =>
      res.status(404).json({ services: "There are no profiles" })
    );
});

// @route GET api/service/query
// @desc GET a service via field
// @access Public
router.get("/query", async (req,res) => {
  try {
    const queryObj = { ...req.query };
    let queryStr = JSON.stringify(queryObj)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|eq|ne)\b/g, match => `$${match}`);
    // queryStr  : {"ratings":{"$gt":"3"}}
    const services = await Service.find(JSON.parse(queryStr));
    res.json(services)
} catch (err) {
    res.status(401).json({
        status: 'error',
        message: 'Error in post finding',
        error: err
    })
}
})

// @route POST api/service
// @desc create a service post
// @access Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  upload.single("coverPicture"),
  (req, res) => {
    const { errors, isValid } = validateServiceInput(req.body);

    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }

    const serviceFields = {};

    serviceFields.user = req.user.id;
    //serviceFields.profile = req.profile.handle;
    if (req.body.category) serviceFields.category = req.body.category;
    if (req.file.path) serviceFields.coverPicture = req.file.path;
    if (req.body.header) serviceFields.header = req.body.header;
    if (req.body.price) serviceFields.price = req.body.price;
    if (req.body.description) serviceFields.description = req.body.description;
    if (req.body.video) serviceFields.video = req.body.video;

    new Service(serviceFields).save().then((service) => res.json(service));
  }
);

// @route GET api/service/:id
// @desc Get the service by the id
// @access Public

router.get("/:id", (req,res)=> {
  const errors = {}

  Service.findById(req.params.id)
    .then(service => {
      if(!service){
        errors.noServices = "No service found with this id"
        res.status(404).json(errors);
      }
      else {
        res.json(service)
      }
    })
    .catch(err => res.status(404).json({service : "No service found with this id"}))
})

// @route GET api/service/user/:id
// @desc Get the services by the user
// @access Public

router.get('/user/:id', (req,res)=> {
  const errors = {}

  Service.find({ user : req.params.id})
    .then(services => {
      if(!services) {
        errors.noServices = "There are no services for the user"
        res.status(404).json(errors);
      }
      else {
        res.json(services)
      }
    })
    .catch(err => {
      res.status(404).json({services : "There are no services for the user"})
    })
})

// @route GET api/service
// @desc Gets all the services
// @access Public
router.get("/casual", (req, res) => {
  const errors = {};

  Service.find()
    .then((services) => {
      if (!services) {
        errors.noServices = "No services found";
        return res.status(404).json(errors);
      } else {
        res.json(services);
      }
    })
    .catch((err) =>
      res.status(404).json({ services: "There are no profiles" })
    );
});

// @route   POST api/posts/activate
// @desc    Activate a post
// @access  Private
router.put(
  '/activate/:id',
  //passport.authenticate('jwt', {session: false}),
  (req,res)=> {
    const error = {};
    Service
    .findById(req.params.id)
    .then(service => {
      if(!service){
        error.noservice = "No service Found";
        res.status(404).json(error);
      }
      else {
        service.activate = !service.activate;
        service.save().then(service => res.json(service))
      }
    })
    .catch(err => {
      res.status(400).json(err);
    })
  }
);

module.exports = router;
