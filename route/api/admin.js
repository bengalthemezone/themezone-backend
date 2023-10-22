const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const keys = require("../../config/keys");

//load validation
const validateRegisterInput = require("../../validator/register");
const validateLoginInput = require("../../validator/login");

//Load Schema
const Admin = require("../../models/Admin");

// @route   get api/admins/test
// @desc    Tests admins route
// @access  Public
router.get("/test", (req, res) => res.json({ msg: "admins Works" }));

// @route get api/admins/all
// @desc GET all the admins
// @access Public
router.get("/all", (req, res) => {
  const errors = {};

  Admin.find()
    .then((admins) => {
      if (!admins) {
        errors.noadmins = "There are no admins";
        return res.status(404).json(errors);
      }

      res.json(admins);
    })
    .catch((err) => res.status(404).json({ admins: "There are no admins" }));
})

// @route post api/admins/register
// @desc Registers admins.
// @access Public
router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  //Validation Checks
  if (!isValid) {
    res.status(400).json(errors);
  }

  Admin.findOne({ email: req.body.email }).then((admin) => {
    if (admin) {
      errors.email = "Email already exists";
      return res.status(400).json(errors);
    } else {
      const newadmin = new Admin({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newadmin.password, salt, (err, hash) => {
          if (err) throw err;
          newadmin.password = hash;
          newadmin
            .save()
            .then((admin) => res.json(admin))
            .catch((err) => console.log(err));
        });
      });
    }
  });
});

// @route   POST api/admins/register
// @desc    Login admins route
// @access  Public
router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  //Validation checks
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  Admin.findOne({ email }).then((admin) => {
    //check for admin or email
    if (!admin) {
      errors.email = "admin not found";
      return res.status(404).json(errors);
    }
    //check for password
    bcrypt.compare(password, admin.password).then((isMatch) => {
      if (isMatch) {
        //admin matched!
        const payload = { id: admin.id, name: admin.name }; //Creating JWT payload
        //sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 28800 },
          (err, token) => {
            res.json({ success: true, token: "Bearer " + token, admin: { name: admin.name, email: admin.email } });
          }
        );
      } else {
        errors.password = "Incorrect Password";
        return res.status(404).json(errors);
      }
    });
  });
});

module.exports = router;