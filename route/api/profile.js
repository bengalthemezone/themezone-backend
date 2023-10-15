const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const upload = require("../../utils/uploadFiles");

// Load Profile Model
const Profile = require("../../models/Profile");
// Load User Model
const User = require("../../models/User");

//load validation
const validateProfileInput = require("../../validator/profile");
const validateExperienceInput = require("../../validator/experience");
const validateEducationInput = require("../../validator/education");
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

// @route   GET api/profile/test
// @desc    Tests profile route
// @access  Public
router.get("/test", (req, res) => res.json({ msg: "Profile Works" }));

// @route   GET api/profile
// @desc    Get current users profile
// @access  Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id })
      .populate("user", ["name", "email"])
      .then((profile) => {
        if (!profile) {
          errors.noprofile = "There is no profile for this user";
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch((err) => res.status(404).json(err));
  }
);

// @route   GET api/profile/all
// @desc    Get all profiles
// @access  Public
router.get("/all", (req, res) => {
  const errors = {};

  Profile.find()
    .populate("user", ["name"])
    .then((profiles) => {
      if (!profiles) {
        errors.noprofile = "There are no profiles";
        return res.status(404).json(errors);
      }

      res.json(profiles);
    })
    .catch((err) => res.status(404).json({ profile: "There are no profiles" }));
});

// @route GET api/user/query
// @desc GET a user via field
// @access Public
router.get("/query", async (req,res) => {
  const errors = {};
  const match = {};
  try {
  const features = new APIfeatures(Profile.find().populate("user",["name"]), req.query)
      .filtering()
      .sorting()
  
  const users = await features.query;
  res.status(200).json(users)
} catch(err) {
  res.status(404).json({
      status : "Fail",
      message : err
  })
}
})

// @route   GET api/profile/handle/:handle
// @desc    Get profile by handle
// @access  Public

router.get("/handle/:handle", (req, res) => {
  const errors = {};

  Profile.findOne({ handle: req.params.handle })
    .populate("user", ["name", "email"])
    .then((profile) => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        res.status(404).json(errors);
      }

      res.json(profile);
    })
    .catch((err) => res.status(404).json(err));
});

// @route GET api/profile/user/user:id
// @desc GET profile by user id
// @access Public
router.get('/user/:id', (req,res) => {
  const errors = {};

  Profile.findOne({user : req.params.id })
    .populate("user", ["name"])
    .then(profile => {
      if(!profile){
      errors.noprofile = "There is no profile for the user";
      res.status(404).json(errors);
    }
    else {
      res.json(profile)
    }
  })
  .catch(err => {
    res.status(404).json({ profile: 'There is no profile for this user' })
  })
    
})
  

// @route   POST api/profile
// @desc    Create or edit user profile
// @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  upload.single("profilePicture"),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }

    // Get fields
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.nationality) profileFields.nationality = req.body.nationality;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.dob) profileFields.dob = req.body.dob;
    if (req.body.hourlyRate) profileFields.hourlyRate = req.body.hourlyRate;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.maritalStatus)
      profileFields.maritalStatus = req.body.maritalStatus;
    if (req.file?.path) profileFields.profilePicture = req.file.path;            
    if (req.body.caption) profileFields.caption = req.body.caption;
    if (req.body.religion) profileFields.religion = req.body.maritalStatus;
    if (req.body.mobile1) profileFields.mobile1 = req.body.mobile1;
    if (req.body.mobile2) profileFields.mobile2 = req.body.mobile2;
    if (req.body.nationalId) profileFields.nationalId = req.body.nationalId;
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;
    // Skills - Spilt into array
    if (typeof req.body.skills !== "undefined") {
      profileFields.skills = req.body.skills.split(",");
    }
    //Language -Split into array
    if (typeof req.body.language !== "undefined") {
      profileFields.language = req.body.language.split(",");
    }

    // Social
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

    Profile.findOne({ user: req.user.id }).then((profile) => {
      if (profile) {
        // Update
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).then((profile) => res.json(profile));
      } else {
        // Create

        // Check if handle exists
        Profile.findOne({ handle: profileFields.handle }).then((profile) => {
          if (profile) {
            errors.handle = "That handle already exists";
            res.status(400).json(error);
          }

          // Save Profile
          new Profile(profileFields)
            .save()
            .then((profile) => res.json(profile));
        });
      }
    });
  }
);

// @route POST api/profile/picture
// @desc Edit profile information
// @access private
router.post(
  '/edit',
  passport.authenticate("jwt", {session: false}),
  (req,res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }
    // Get fields
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.nationality) profileFields.nationality = req.body.nationality;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.dob) profileFields.dob = req.body.dob;
    if (req.body.hourlyRate) profileFields.hourlyRate = req.body.hourlyRate;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.maritalStatus) profileFields.maritalStatus = req.body.maritalStatus;          
    if (req.body.caption) profileFields.caption = req.body.caption;
    if (req.body.religion) profileFields.religion = req.body.maritalStatus;
    if (req.body.mobile1) profileFields.mobile1 = req.body.mobile1;
    if (req.body.mobile2) profileFields.mobile2 = req.body.mobile2;
    if (req.body.nationalId) profileFields.nationalId = req.body.nationalId;
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;
    // Skills - Spilt into array
    if (typeof req.body.skills !== "undefined") {
      profileFields.skills = req.body.skills.split(",");
    }
    //Language -Split into array
    if (typeof req.body.language !== "undefined") {
      profileFields.language = req.body.language.split(",");
    }

    // Social
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

    Profile.findOne({user : req.user.id}).then(profile => {
      if (profile) {
        // Update
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
        ).then((profile) => res.json(profile))
      }
  })
}
)

// @route POST api/profile/picture
// @desc Add profile picture
// @access Private
router.post(
  "/picture",
  passport.authenticate("jwt", { session: false }),
  upload.single("upload"),
  (req, res) => {
    Profile.findone({ user: req.user.id }).then((profile) => {
      if(profile) {
        profile.profilePicture = req.file.path;
        res.json(profile);
      }
      else {
        res.json("The profile was not found");
      }
    });
  }
);

// @route   POST api/profile/experience
// @desc    Add experience to profile
// @access  Private
router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateExperienceInput(req.body);

    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then((profile) => {
      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description,
      };

      // Add to exp array
      profile.experience.unshift(newExp);
      profile.save().then((profile) => res.json(profile));
    });
  }
);

// @route GET api/profile/service
// @desc Get all the services
// @access Public

router.get("/service", (req, res) => {
  const errors = {};

  Profile.find()
    .select("service")
    .populate("user", ["name"])
    .then((services) => {
      if (!services) {
        errors.noprofile = "There are no services";
        return res.status(404).json(errors);
      }
      res.json(services);
    })
    .catch((err) => res.status(404).json({ profile: "There are no profiles" }));
});

// @route   POST api/profile/service
// @desc    Add education to profile
// @access  Private
router.post(
  "/service",
  passport.authenticate("jwt", { session: false }),
  upload.single("coverPicture"),
  (req, res) => {
    const { errors, isValid } = validateServiceInput(req.body);

    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then((profile) => {
      const newService = {
        coverPicture: req.file.path,
        header: req.body.header,
        price: req.body.price,
        description: req.body.description,
        video: req.body.video,
      };

      // Add to exp array
      profile.service.unshift(newService);
      profile.save().then((profile) => res.json(profile));
    });
  }
);

// @route   POST api/profile/education
// @desc    Add education to profile
// @access  Private
router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateEducationInput(req.body);

    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then((profile) => {
      const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description,
      };

      // Add to exp array
      profile.education.unshift(newEdu);
      profile.save().then((profile) => res.json(profile));
    });
  }
);

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete experience from profile
// @access  Private
router.delete(
  "/experience/:exp_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        // Get remove index
        const removeIndex = profile.experience
          .map((item) => item.id)
          .indexOf(req.params.exp_id);

        // Splice out of array
        profile.experience.splice(removeIndex, 1);

        // Save
        profile.save().then((profile) => res.json(profile));
      })
      .catch((err) => res.status(404).json(err));
  }
);

// @route   DELETE api/profile/education/:edu_id
// @desc    Delete education from profile
// @access  Private
router.delete(
  "/education/:edu_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        // Get remove index
        const removeIndex = profile.education
          .map((item) => item.id)
          .indexOf(req.params.edu_id);

        // Splice out of array
        profile.education.splice(removeIndex, 1);

        // Save
        profile.save().then((profile) => res.json(profile));
      })
      .catch((err) => res.status(404).json(err));
  }
);
module.exports = router;
