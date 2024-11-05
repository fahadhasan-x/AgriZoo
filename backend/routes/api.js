const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const postController = require('../controllers/postController');
const userController = require('../controllers/userController');
const productController = require('../controllers/productController');
const searchController = require('../controllers/searchController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Auth routes
router.post('/auth/signup', authController.signup);
router.post('/auth/login', authController.login);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/reset-password', authController.resetPassword);

// Post routes
router.get('/posts', postController.getFeed);
router.post('/posts', auth, upload.single('media'), postController.createPost);
router.post('/posts/:id/like', auth, postController.likePost);
router.post('/posts/:id/comments', auth, postController.commentOnPost);
router.delete('/posts/:id', auth, postController.deletePost);
router.patch('/posts/:id/visibility', auth, postController.updatePostVisibility);
router.put('/posts/:id', auth, postController.updatePost);

// User routes
router.get('/users/profile', auth, userController.getProfile);
router.put('/users/profile', auth, userController.updateProfile);
router.put('/users/profile-picture', auth, upload.single('profile_picture'), userController.updateProfilePicture);
router.get('/users/:id/posts', userController.getUserPosts);
router.get('/users/:id', userController.getUserProfile);

// Product routes
router.post('/products', auth, upload.single('image'), productController.createProduct);
router.get('/products', productController.getAllProducts);
router.get('/users/:userId/products', productController.getUserProducts);
router.get('/products/category/:category', productController.getProductsByCategory);

// Search route
router.get('/search', searchController.search);

module.exports = router;
