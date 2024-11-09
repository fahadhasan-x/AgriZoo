const { Product, User, Post } = require('../models');
const { Op } = require('sequelize');

// Product search
exports.search = async (req, res) => {
  try {
    const { q, type = 'all' } = req.query;
    
    if (!q) {
      return res.json({
        products: [],
        users: [],
        posts: []
      });
    }

    // If searching for all
    if (type === 'all') {
      const [products, users, posts] = await Promise.all([
        Product.findAll({
          where: {
            [Op.or]: [
              { name: { [Op.like]: `%${q}%` } },
              { description: { [Op.like]: `%${q}%` } }
            ]
          },
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'full_name', 'profile_picture']
          }],
          order: [['created_at', 'DESC']]
        }),
        User.findAll({
          where: {
            full_name: { [Op.like]: `%${q}%` }
          },
          attributes: ['id', 'full_name', 'profile_picture'],
          order: [['full_name', 'ASC']]
        }),
        Post.findAll({
          where: {
            [Op.and]: [
              { content: { [Op.like]: `%${q}%` } },
              { visibility: 'public' }
            ]
          },
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'full_name', 'profile_picture']
          }],
          order: [['created_at', 'DESC']]
        })
      ]);

      return res.json({
        products,
        users,
        posts
      });
    }

    // Search based on type
    if (type === 'users') {
      const users = await User.findAll({
        where: {
          full_name: { [Op.like]: `%${q}%` }
        },
        attributes: ['id', 'full_name', 'profile_picture'],
        order: [['full_name', 'ASC']]
      });
      return res.json(users);
    }

    if (type === 'posts') {
      const posts = await Post.findAll({
        where: {
          [Op.and]: [
            { content: { [Op.like]: `%${q}%` } },
            { visibility: 'public' }
          ]
        },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'profile_picture']
        }],
        order: [['created_at', 'DESC']]
      });
      return res.json(posts);
    }

    // Default: search products
    const products = await Product.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${q}%` } },
          { description: { [Op.like]: `%${q}%` } }
        ]
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'full_name', 'profile_picture']
      }],
      order: [['created_at', 'DESC']]
    });

    res.json(products);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
};