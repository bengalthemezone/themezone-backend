const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Post model
const Post = require('../../models/Post');
// Profile model
const Profile = require('../../models/Profile');

// Validation
const validatePostInput = require("../../validator/post");
const validationCommentInput = require("../../validator/comment");


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

// @route   GET api/posts/test
// @desc    Tests post route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Posts Works' }));

// @route   GET api/posts
// @desc    Get posts
// @access  Public
router.get('/', (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ nopostsfound: 'No posts found' }));
});

// @route GET api/post/query
// @desc GET a Post via field
// @access Public
router.get("/query", async (req,res) => {
  const errors = {};
  const match = {};
  try {
  const features = new APIfeatures(Post.find(), req.query)
      .filtering()
      .sorting()
  
  const posts = await features.query;
  res.status(200).json(posts)
} catch(err) {
  res.status(404).json({
      status : "Fail",
      message : err
  })
}
})

// @route   POST api/posts
// @desc    Create post
// @access  Private
router.post(
    '/',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
      const { errors, isValid } = validatePostInput(req.body);
      // Check Validation
      if (!isValid) {
        // If any errors, send 400 with errors object
        return res.status(400).json(errors);
      }

      const postFields = {};
      postFields.user = req.user.id
      postFields.activation = false
      if (req.body.topic) postFields.topic = req.body.topic;
      if (req.body.question) postFields.question = req.body.question;
      new Post(postFields)
        .save()
        .then(post => res.json(post));
    }
);

// @route   DELETE api/posts/:id
// @desc    Delete post
// @access  Private
router.delete(
    '/:id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
      Profile.findOne({ user: req.user.id }).then(profile => {
        Post.findById(req.params.id)
          .then(post => {
            // Check for post owner
            if (post.user.toString() !== req.user.id) {
              return res
                .status(401)
                .json({ notauthorized: 'User not authorized' });
            }
  
            // Delete
            post.remove().then(() => res.json({ success: true }));
          })
          .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
      });
    }
  );
  
  // @route   POST api/posts/like/:id
  // @desc    Like post
  // @access  Private
  router.post(
    '/like/:id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
      Profile.findOne({ user: req.user.id }).then(profile => {
        Post.findById(req.params.id)
          .then(post => {
            if (
              post.likes.filter(like => like.user.toString() === req.user.id)
                .length > 0
            ) {
              return res
                .status(400)
                .json({ alreadyliked: 'User already liked this post' });
            }
  
            // Add user id to likes array
            post.likes.unshift({ user: req.user.id });
  
            post.save().then(post => res.json(post));
          })
          .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
      });
    }
  );
  
  // @route   POST api/posts/unlike/:id
  // @desc    Unlike post
  // @access  Private
  router.post(
    '/unlike/:id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
      Profile.findOne({ user: req.user.id }).then(profile => {
        Post.findById(req.params.id)
          .then(post => {
            if (
              post.likes.filter(like => like.user.toString() === req.user.id)
                .length === 0
            ) {
              return res
                .status(400)
                .json({ notliked: 'You have not yet liked this post' });
            }
  
            // Get remove index
            const removeIndex = post.likes
              .map(item => item.user.toString())
              .indexOf(req.user.id);
  
            // Splice out of array
            post.likes.splice(removeIndex, 1);
  
            // Save
            post.save().then(post => res.json(post));
          })
          .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
      });
    }
  );
  
  // @route   POST api/posts/comment/:id
  // @desc    Add comment to post
  // @access  Private
  router.post(
    '/comment/:id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
      const { errors, isValid } = validationCommentInput(req.body);
  
      // Check Validation
      if (!isValid) {
        // If any errors, send 400 with errors object
        return res.status(400).json(errors);
      }
  
      Post.findById(req.params.id)
        .then(post => {
          const newComment = {
            comment : req.body.comment,
            user: req.user.id
          };
  
          // Add to comments array
          post.comments.unshift(newComment);
  
          // Save
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
    }
  );

// @route   POST api/posts/activate
// @desc    Activate a post
// @access  Private
router.post(
  '/activate/:id',
  //passport.authenticate('jwt', {session: false}),
  (req,res)=> {
    const error = {};
    Post
    .findById(req.params.id)
    .then(post => {
      if(!post){
        error.noPost = "No Post Found";
        res.status(404).json(error);
      }
      else {
        post.activate = !post.activate;
        post.save().then(post => res.json(post))
      }
    })
    .catch(err => {
      res.status(400).json(err);
    })
  }
);

  
module.exports = router