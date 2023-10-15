const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const Order = require("../../models/Order");

// @route   GET api/posts/test
// @desc    Tests post route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Posts Works' }));


// @route get api/order
// @desc GET all the orders
// @access Public
router.get("/",(req,res) => {
    const errors = {};
  
    Order.find()
      .then((order) => {
        if (!order) {
          errors.noorder = "There are no order";
          return res.status(404).json(errors);
        }
  
        res.json(order);
      })
      .catch((err) => res.status(404).json({ Orders: "There are no Orders" }));
  })

module.exports = router;