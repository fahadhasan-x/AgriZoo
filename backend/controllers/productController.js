const Product = require('../models/Product');
const User = require('../models/User');

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    let imageUrl = null;

    if (req.file) {
      imageUrl = `http://localhost:5001/uploads/${req.file.filename}`;
    }

    const product = await Product.create({
      user_id: req.user.id,
      name,
      description,
      price,
      category,
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

exports.getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { category: req.params.category },
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