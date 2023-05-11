const express = require('express');
const router = express.Router();
const BlogController = require('../controllers/blog.controller');

router.post('/create-post', BlogController.createPost);
router.get('/get-all-post', BlogController.getPosts);
router.get('/get-post-byId', BlogController.getPostbyId);
router.post('/delete', BlogController.deletePost);
router.post('/update-post', BlogController.updatePost);
router.get('/get-post-byUser', BlogController.getPostByUser);

module.exports = router;
