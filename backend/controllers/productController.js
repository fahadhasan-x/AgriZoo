const Product = require('../models/Product');
const User = require('../models/User');
const Category = require('../models/Category');

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category_id } = req.body;
    let imageUrl = null;

    if (req.file) {
      imageUrl = `http://localhost:5001/uploads/${req.file.filename}`;
    }

    const product = await Product.create({
      user_id: req.user.id,
      name,
      description,
      price,
      category_id,
      image_url: imageUrl
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'full_name', 'profile_picture']
      }],
      order: [['created_at', 'DESC']]
    });
    res.json(products);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getUserProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { user_id: req.params.userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'profile_picture']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    if (req.params.slug === 'all') {
      const products = await Product.findAll({
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

    const category = await Category.findOne({
      where: { slug: req.params.slug },
      include: [{
        model: Category,
        as: 'children',
        include: [{
          model: Category,
          as: 'children'
        }]
      }]
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Get all subcategory IDs
    const categoryIds = [category.id];
    if (category.children) {
      category.children.forEach(child => {
        categoryIds.push(child.id);
        if (child.children) {
          child.children.forEach(grandChild => {
            categoryIds.push(grandChild.id);
          });
        }
      });
    }

    const products = await Product.findAll({
      where: {
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
    res.status(500).json({ error: error.message });
  }
}; 