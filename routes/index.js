const router = require("express").Router();
const Post = require('../models/Post.model');

/* GET home page */
router.get("/", (req, res, next) => {
  Post.find()
    .populate('creatorId')
    .then(posts => {
      res.render("index", { posts })
    })
    .catch(error => console.log(error));
});

module.exports = router;
