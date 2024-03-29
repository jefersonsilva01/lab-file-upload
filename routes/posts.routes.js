const router = require("express").Router();
const multer = require("multer");
const upload = multer({ dest: './public/uploads' });
const Post = require("../models/Post.model");

const { isLoggedIn, isLoggedOut } = require("../middleware/route-guard.js");

router.get("/post-create", isLoggedIn, (req, res, next) => res.render('posts/post-create'));

router.post("/post-create", isLoggedIn, upload.single('filename'), (req, res) => {
  const content = req.body.content;
  const id = req.session.currentUser._id;
  const picPath = `/uploads/${req.file.filename}`;
  const picName = req.file.originalname;

  if (!content) {
    res.render('posts/post-create', {
      errorMessage: 'Content field cannot without text'
    });
    return;
  }

  const post = new Post({
    content,
    creatorId: id,
    picPath,
    picName
  });

  post.save()
    .then(() => res.redirect('/index'))
    .catch(error => console.log(error));
})

module.exports = router;