const Category = require('../models/Category');
const Product = require('../models/Product');
const User = require('../models/User');
const { Op } = require('sequelize');

exports.getAllCategories = async (req, res) => {
  try {
    const parentSlug = req.query.parent || 'all';
    console.log('Fetching categories for parent:', parentSlug);
    
    // First find the parent category
    const parentCategory = await Category.findOne({
      where: { slug: parentSlug }
    });

    if (!parentCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Get all nested levels of children categories
    const categories = await Category.findAll({
      where: {
        parent_id: parentCategory.id
      },
      include: [{
        model: Category,
        as: 'children',
        include: [{
          model: Category,
          as: 'children',
          include: [{
            model: Category,
            as: 'children',
            include: [{
              model: Category,
              as: 'children',
              include: [{
                model: Category,
                as: 'children'
              }]
            }]
          }]
        }]
      }],
      order: [['name', 'ASC']]
    });

    res.json(categories);
  } catch (error) {
    console.error('Error in getAllCategories:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const { userId } = req.query;
    const whereClause = userId ? { user_id: userId } : {};

    if (req.params.slug === 'all') {
      const products = await Product.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'full_name', 'profile_picture']
          },
          {
            model: Category,
            as: 'category',
            attributes: ['name']
          }
        ],
        order: [['created_at', 'DESC']]
      });
      return res.json(products);
    }

    // Find the requested category with all its nested children
    const category = await Category.findOne({
      where: { slug: req.params.slug },
      include: [{
        model: Category,
        as: 'children',
        include: [{
          model: Category,
          as: 'children',
          include: [{
            model: Category,
            as: 'children'
          }]
        }]
      }]
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Get all category IDs including the root category
    const getAllCategoryIds = (cat) => {
      let ids = [cat.id];
      if (cat.children) {
        cat.children.forEach(child => {
          ids = [...ids, ...getAllCategoryIds(child)];
        });
      }
      return ids;
    };

    const categoryIds = getAllCategoryIds(category);

    // Find products from all categories
    const products = await Product.findAll({
      where: {
        ...whereClause,
        category_id: categoryIds
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'profile_picture']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(products);
  } catch (error) {
    console.error('Error in getProductsByCategory:', error);
    res.status(500).json({ error: error.message });
  }
}; 