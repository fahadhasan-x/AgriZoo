const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
    try {
        const userProfile = await User.findOne({
            where: { id: req.params.id },
            attributes: { 
                exclude: ['password', 'reset_token', 'reset_token_expiry'] 
            },
            include: [{
                model: Post,
                as: 'posts',
                where: { visibility: 'public' },
                required: false,
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'full_name', 'profile_picture']
                    },
                    {
                        model: Comment,
                        as: 'comments',
                        include: [{
                            model: User,
                            as: 'user',
                            attributes: ['id', 'full_name', 'profile_picture']
                        }]
                    },
                    {
                        model: User,
                        as: 'likers',
                        attributes: ['id']
                    }
                ]
            }],
            order: [[{ model: Post, as: 'posts' }, 'created_at', 'DESC']]
        });

        if (!userProfile) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Convert to plain object and send
        const responseData = userProfile.get({ plain: true });
        
        // Add isLiked status to posts
        if (responseData.posts) {
            responseData.posts = responseData.posts.map(post => ({
                ...post,
                isLiked: req.user ? post.likers.some(liker => liker.id === req.user.id) : false
            }));
        }

        res.json(responseData);
    } catch (error) {
        console.error('Error in getUserProfile:', error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { fullName, bio, location } = req.body;

        // Validate input
        if (!fullName) {
            return res.status(400).json({ error: 'Full name is required' });
        }

        // Update user
        await User.update({
            full_name: fullName,
            bio: bio || null,
            location: location || null
        }, {
            where: { id: req.user.id }
        });

        // Get updated user
        const updatedUser = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });

        console.log('Profile updated:', updatedUser.toJSON());
        res.json(updatedUser);
    } catch (error) {
        console.error('Error in updateProfile:', error);
        res.status(400).json({ error: error.message });
    }
};

exports.getUserPosts = async (req, res) => {
    try {
        const requestedUserId = parseInt(req.params.id);
        const currentUserId = req.user?.id;

        console.log('Getting posts:', {
            requestedUserId,
            currentUserId,
            isOwnProfile: requestedUserId === currentUserId
        });

        const posts = await Post.findAll({
            where: { 
                user_id: requestedUserId 
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'full_name', 'profile_picture']
                },
                {
                    model: Comment,
                    as: 'comments',
                    include: [{
                        model: User,
                        as: 'user',
                        attributes: ['id', 'full_name', 'profile_picture']
                    }],
                    separate: true,
                    order: [['created_at', 'DESC']]
                },
                {
                    model: User,
                    as: 'likers',
                    attributes: ['id']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        console.log('Found posts:', posts.map(p => ({
            id: p.id,
            visibility: p.visibility,
            content: p.content.substring(0, 20)
        })));

        const postsWithLikeStatus = posts.map(post => {
            const plainPost = post.get({ plain: true });
            plainPost.isLiked = currentUserId ? 
                plainPost.likers.some(liker => liker.id === currentUserId) : 
                false;
            return plainPost;
        });

        res.json(postsWithLikeStatus);
    } catch (error) {
        console.error('Error in getUserPosts:', error);
        res.status(400).json({ error: error.message });
    }
};

exports.updateProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Check file type
        if (!req.file.mimetype.startsWith('image/')) {
            return res.status(400).json({ error: 'Please upload only images' });
        }

        const profilePicture = `http://localhost:5001/uploads/${req.file.filename}`;

        // Delete old profile picture if exists
        const user = await User.findByPk(req.user.id);
        if (user.profile_picture) {
            try {
                const oldPicturePath = user.profile_picture.replace('http://localhost:5001/uploads/', '');
                const fullPath = path.join(__dirname, '..', 'uploads', oldPicturePath);
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                }
            } catch (error) {
                console.error('Error deleting old profile picture:', error);
                // Continue even if old file deletion fails
            }
        }

        // Update user with new profile picture
        await User.update(
            { profile_picture: profilePicture },
            { where: { id: req.user.id } }
        );

        // Get updated user
        const updatedUser = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });

        console.log('Profile picture updated:', updatedUser.toJSON());
        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating profile picture:', error);
        res.status(500).json({ error: 'Failed to update profile picture' });
    }
};

exports.getUserProducts = async (req, res) => {
    try {
        console.log('Getting products for user:', req.params.id);
        
        const products = await Product.findAll({
            where: { user_id: req.params.id },
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'full_name']
            }]
        });
        
        console.log('Found products:', products);
        res.json(products);
    } catch (error) {
        console.error('Error getting user products:', error);
        res.status(500).json({ error: error.message });
    }
};
