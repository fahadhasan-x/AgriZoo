const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Protected routes (require authentication)
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);
router.put('/profile-picture', auth, upload.single('profile_picture'), userController.updateProfilePicture);
router.get('/:id/posts', userController.getUserPosts);
router.get('/:id', userController.getUserProfile);

module.exports = router; 
