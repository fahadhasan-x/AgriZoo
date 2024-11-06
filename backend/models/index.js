const User = require('./User');
const Post = require('./Post');
const Comment = require('./Comment');
const Like = require('./Like');
const Product = require('./Product');

// User-Post relationship
User.hasMany(Post, {
    foreignKey: 'user_id',
    as: 'posts'
});
Post.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

// Post-Comment relationship
Post.hasMany(Comment, {
    foreignKey: 'post_id',
    as: 'comments'
});
Comment.belongsTo(Post, {
    foreignKey: 'post_id',
    as: 'post'
});

// User-Comment relationship
User.hasMany(Comment, {
    foreignKey: 'user_id',
    as: 'comments'
});
Comment.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

// Post-Like relationship (Many-to-Many)
Post.belongsToMany(User, {
    through: Like,
    as: 'likers',
    foreignKey: 'post_id'
});
User.belongsToMany(Post, {
    through: Like,
    as: 'likedPosts',
    foreignKey: 'user_id'
});

// User-Product relationship
User.hasMany(Product, {
    foreignKey: 'user_id',
    as: 'products'
});
Product.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

module.exports = {
    User,
    Post,
    Comment,
    Like,
    Product
};
