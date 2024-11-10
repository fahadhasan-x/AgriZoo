const Post = require('../models/Post');
const User = require('../models/User');
const Like = require('../models/Like');
const Comment = require('../models/Comment');
const { Op } = require('sequelize');

exports.createPost = async (req, res) => {
    try {
        const { content } = req.body;
        console.log('Creating post:', { 
            userId: req.user.id,
            content,
            file: req.file 
        });

        // Validate request
        if (!content && !req.file) {
            return res.status(400).json({ error: 'Content or media is required' });
        }

        // Handle media upload
        let mediaType = 'text';
        let mediaUrl = null;

        if (req.file) {
            mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
            mediaUrl = `http://localhost:5001/uploads/${req.file.filename}`;
        }

        // Create post
        const post = await Post.create({
            user_id: req.user.id,
            content,
            media_type: mediaType,
            media_url: mediaUrl,
            visibility: 'public'  // Default visibility
        });

        console.log('Post created:', post.toJSON());

        // Fetch complete post data with associations
        const postWithData = await Post.findOne({
            where: { id: post.id },
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
                    attributes: ['id'],
                    through: { attributes: [] }
                }
            ]
        });

        if (!postWithData) {
            throw new Error('Failed to fetch created post');
        }

        const plainPost = postWithData.get({ plain: true });
        plainPost.created_at = postWithData.created_at;
        plainPost.updated_at = postWithData.updated_at;
        plainPost.isLiked = false;  // New post, so not liked yet
        plainPost.comments = [];    // New post, so no comments yet
        plainPost.likers = [];      // New post, so no likes yet

        console.log('Sending post response:', plainPost);
        res.status(201).json(plainPost);
    } catch (error) {
        console.error('Error in createPost:', error);
        res.status(400).json({ error: error.message });
    }
};

exports.getFeed = async (req, res) => {
    try {
        let whereClause = {};
        
        if (req.user) {
            // If user is logged in, show:
            // 1. All public posts
            // 2. Their own private posts
            whereClause = {
                [Op.or]: [
                    { visibility: 'public' },
                    {
                        visibility: 'private',
                        user_id: req.user.id
                    }
                ]
            };
        } else {
            // If no user is logged in, show only public posts
            whereClause = { visibility: 'public' };
        }

        const posts = await Post.findAll({
            where: whereClause,
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
                    attributes: ['id'],
                    through: { attributes: [] }
                }
            ],
            order: [['created_at', 'DESC']]
        });

        const postsWithLikeStatus = posts.map(post => {
            const plainPost = post.get({ plain: true });
            plainPost.isLiked = req.user ? 
                plainPost.likers.some(liker => liker.id === req.user.id) : 
                false;
            return plainPost;
        });

        res.json(postsWithLikeStatus);
    } catch (error) {
        console.error('Error in getFeed:', error);
        res.status(400).json({ error: error.message });
    }
};

exports.likePost = async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const existingLike = await Like.findOne({
            where: {
                post_id: post.id,
                user_id: req.user.id
            }
        });

        if (existingLike) {
            await existingLike.destroy();
            res.json({ liked: false, likeCount: await Like.count({ where: { post_id: post.id } }) });
        } else {
            await Like.create({
                post_id: post.id,
                user_id: req.user.id
            });
            res.json({ liked: true, likeCount: await Like.count({ where: { post_id: post.id } }) });
        }
    } catch (error) {
        console.error('Error in likePost:', error);
        res.status(400).json({ error: error.message });
    }
};

exports.commentOnPost = async (req, res) => {
    try {
        const { content } = req.body;
        const post = await Post.findByPk(req.params.id);
        
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const comment = await Comment.create({
            content,
            post_id: post.id,
            user_id: req.user.id
        });

        const commentWithUser = await Comment.findByPk(comment.id, {
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'full_name', 'profile_picture']
            }]
        });

        res.status(201).json(commentWithUser);
    } catch (error) {
        console.error('Error in commentOnPost:', error);
        res.status(400).json({ error: error.message });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id);
        
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await post.destroy();
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updatePostVisibility = async (req, res) => {
    try {
        const { visibility } = req.body;
        const post = await Post.findByPk(req.params.id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Update post visibility
        await post.update({ visibility });

        // Fetch updated post with all associations
        const updatedPost = await Post.findOne({
            where: { id: post.id },
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
                    attributes: ['id'],
                    through: { attributes: [] }
                }
            ]
        });

        const plainPost = updatedPost.get({ plain: true });
        plainPost.isLiked = plainPost.likers.some(liker => liker.id === req.user.id);

        console.log('Updated post visibility:', {
            id: post.id,
            visibility: visibility,
            userId: post.user_id
        });

        res.json(plainPost);
    } catch (error) {
        console.error('Error in updatePostVisibility:', error);
        res.status(400).json({ error: error.message });
    }
};

exports.updatePost = async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id);
        
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await post.update({
            content: req.body.content,
            updated_at: new Date()
        });

        res.json(post);
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(400).json({ error: error.message });
    }
};

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
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
          order: [['created_at', 'DESC']]
        },
        {
          model: User,
          as: 'likers',
          attributes: ['id'],
          through: { attributes: [] }
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const formattedPosts = posts.map(post => {
      const postJson = post.get({ plain: true });
      return {
        ...postJson,
        created_at: post.created_at,
        updated_at: post.updated_at,
        comments: postJson.comments?.map(comment => ({
          ...comment,
          created_at: comment.created_at,
          updated_at: comment.updated_at
        }))
      };
    });

    res.json(formattedPosts);
  } catch (error) {
    console.error('Error in getAllPosts:', error);
    res.status(500).json({ error: error.message });
  }
}; 