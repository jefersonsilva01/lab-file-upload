const router = require("express").Router();
const multer = require("multer");
const upload = multer({ dest: './public/uploads' });
const Post = require("../models/Post.model");
const Comment = require("../models/Comment.model");

const { isLoggedIn } = require("../middleware/route-guard.js");

router.get("/post-create", isLoggedIn, (req, res, next) => res.render('posts/post-create'));

router.get("/post-details/:id", isLoggedIn, (req, res, next) => {
  const errorMessage = req.session.errorMessage;
  req.session.errorMessage = null;

  const id = req.params.id;

  let postComments

  Comment.find({ $eleMatch: { postId: id } })
    .populate('authorId')
    .then(comments => postComments = comments)
    .catch(error => console.log(error));

  Post.findById(id)
    .populate('creatorId')
    .then(post => {
      res.render('posts/post-details', { post, postComments, errorMessage });
    })
    .catch(error => console.log(error));
});

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
    .then(() => res.redirect('/'))
    .catch(error => console.log(error));
});

router.post("/create-comment/:id", isLoggedIn, upload.single('filename'), (req, res) => {

  const content = req.body.content;
  const postId = req.params.id;
  const authorId = req.session.currentUser._id;
  let imagePath, imageName;

  if (req.file) {
    imagePath = `/uploads/${req.file.filename}`;
    imageName = req.file.originalname;
  } else {
    imagePath = '';
  }

  console.log(content);

  if (!content) {
    req.session.errorMessage = 'Content field cannot be empty';
    res.redirect(`/post-details/${postId}`);
    return;
  }

  const comment = new Comment({
    content,
    authorId,
    postId,
    imagePath,
    imageName
  });

  comment.save()
    .then(() => res.redirect(`/post-details/${postId}`))
    .catch(error => console.log(error));
});

module.exports = router;