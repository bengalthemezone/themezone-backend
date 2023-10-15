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
const User = require("../../models/User");

// @route   get api/users/test
// @desc    Tests users route
// @access  Public
router.get("/test", (req, res) => res.json({ msg: "Users Works" }));

// @route get api/users/all
// @desc GET all the users
// @access Public
router.get("/all", (req, res) => {
  const errors = {};

  User.find()
    .then((users) => {
      if (!users) {
        errors.noUsers = "There are no users";
        return res.status(404).json(errors);
      }

      res.json(users);
    })
    .catch((err) => res.status(404).json({ users: "There are no users" }));
})

// @route post api/users/register
// @desc Registers users.
// @access Public
router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  //Validation Checks
  if (!isValid) {
    res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email }).then((user) => {
    if (user) {
      errors.email = "Email already exists";
      return res.status(400).json(errors);
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        role: req.body.role || 'user',
        password: req.body.password,
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then((user) => res.json(user))
            .catch((err) => console.log(err));
        });
      });
    }
  });
});

// @route   POST api/users/register
// @desc    Login users route
// @access  Public
router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  //Validation checks
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email }).then((user) => {
    //check for user or email
    if (!user) {
      errors.email = "User not found";
      return res.status(404).json(errors);
    }
    //check for password
    bcrypt.compare(password, user.password).then((isMatch) => {
      if (isMatch) {
        //User matched!
        const payload = { id: user.id, name: user.name, role: user.role || 'user' }; //Creating JWT payload
        //sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 28800 },
          (err, token) => {
            res.json({
              success: true, user: {
                name: user.name,
                email: user.email
              }, token: "Bearer " + token
            });
          }
        );
      } else {
        errors.password = "Incorrect Password";
        return res.status(404).json(errors);
      }
    });
  });
});

// @route GET api/users/user:id
// @desc Get all the services
// @access Public

router.get("/:id", (req, res) => {
  const errors = {};

  User.findOne({ user: req.params.id })
    .select("profile")
    .populate("user", ["name"])
    .then((services) => {
      if (!services) {
        return res.status(404).json({ msg: "no profile" });
      }
      res.json(services);
    })
    .catch((err) => res.status(404).json({ profile: "There are no profiles" }));
});

module.exports = router;
