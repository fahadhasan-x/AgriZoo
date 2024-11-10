-- First disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Drop all tables
DROP TABLE IF EXISTS likes;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS posts_backup;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS product_categories;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS categories;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Create Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    profile_picture VARCHAR(255),
    bio TEXT,
    location VARCHAR(100),
    reset_token VARCHAR(255),
    reset_token_expiry DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_email (email)
);

-- Create Posts table with CASCADE
CREATE TABLE posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    content TEXT,
    media_type ENUM('text', 'image', 'video') DEFAULT 'text',
    media_url VARCHAR(255),
    visibility ENUM('public', 'private') DEFAULT 'public',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Create Posts backup table
CREATE TABLE posts_backup (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    content TEXT,
    media_type ENUM('text', 'image', 'video'),
    media_url VARCHAR(255),
    visibility ENUM('public', 'private') DEFAULT 'private',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Comments table with CASCADE
CREATE TABLE comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Create Likes table with CASCADE and unique constraint
CREATE TABLE likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_like (post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Create Categories table
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    parent_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Create Products table
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category_id INT,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Insert root category
INSERT INTO categories (name, slug, parent_id) VALUES ('All', 'all', NULL);

-- Insert main categories under 'All'
INSERT INTO categories (name, slug, parent_id) 
SELECT 'Food', 'food', id FROM categories WHERE slug = 'all';

INSERT INTO categories (name, slug, parent_id) 
SELECT 'Baby Food & Care', 'baby-food-care', id FROM categories WHERE slug = 'all';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Home Cleaning', 'home-cleaning', id FROM categories WHERE slug = 'all';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Beauty & Health', 'beauty-health', id FROM categories WHERE slug = 'all';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Gadget', 'gadget', id FROM categories WHERE slug = 'all';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Others', 'root-others', id FROM categories WHERE slug = 'all';

-- Food subcategories (Level 1)
INSERT INTO categories (name, slug, parent_id)
SELECT 'Fruits & Vegetables', 'fruits-vegetables', id FROM categories WHERE slug = 'food';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Meat & Fish', 'meat-fish', id FROM categories WHERE slug = 'food';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Baking Needs', 'baking-needs', id FROM categories WHERE slug = 'food';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Drinks', 'drinks', id FROM categories WHERE slug = 'food';

-- Fruits & Vegetables subcategories (Level 2)
INSERT INTO categories (name, slug, parent_id)
SELECT 'Fresh Fruits', 'fresh-fruits', id FROM categories WHERE slug = 'fruits-vegetables';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Fresh Vegetables', 'fresh-vegetables', id FROM categories WHERE slug = 'fruits-vegetables';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Dry Fruits', 'dry-fruits', id FROM categories WHERE slug = 'fruits-vegetables';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Dry Vegetables', 'dry-vegetables', id FROM categories WHERE slug = 'fruits-vegetables';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Others', 'fruits-vegetables-others', id FROM categories WHERE slug = 'fruits-vegetables';

-- Meat & Fish subcategories
INSERT INTO categories (name, slug, parent_id)
SELECT 'Fish', 'fish', id FROM categories WHERE slug = 'meat-fish';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Meat', 'meat', id FROM categories WHERE slug = 'meat-fish';

-- Fish subcategories
INSERT INTO categories (name, slug, parent_id)
SELECT 'Fresh Water Fish', 'fresh-water-fish', id FROM categories WHERE slug = 'fish';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Sea Fish', 'sea-fish', id FROM categories WHERE slug = 'fish';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Others', 'fish-others', id FROM categories WHERE slug = 'fish';

-- Meat subcategories
INSERT INTO categories (name, slug, parent_id)
SELECT 'Beef', 'beef', id FROM categories WHERE slug = 'meat';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Chicken', 'chicken', id FROM categories WHERE slug = 'meat';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Mutton', 'mutton', id FROM categories WHERE slug = 'meat';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Other Birds', 'other-birds', id FROM categories WHERE slug = 'meat';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Eggs', 'eggs', id FROM categories WHERE slug = 'meat';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Others', 'meat-others', id FROM categories WHERE slug = 'meat';

-- Baking Needs subcategories
INSERT INTO categories (name, slug, parent_id)
SELECT 'Baking Ingredients', 'baking-ingredients', id FROM categories WHERE slug = 'baking-needs';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Atta Maida & Suji', 'atta-maida-suji', id FROM categories WHERE slug = 'baking-needs';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Colours & Flavors', 'colours-flavors', id FROM categories WHERE slug = 'baking-needs';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Others', 'baking-needs-others', id FROM categories WHERE slug = 'baking-needs';

-- Drinks subcategories
INSERT INTO categories (name, slug, parent_id)
SELECT 'Tea', 'tea', id FROM categories WHERE slug = 'drinks';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Coffee', 'coffee', id FROM categories WHERE slug = 'drinks';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Juice', 'juice', id FROM categories WHERE slug = 'drinks';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Soft Drinks', 'soft-drinks', id FROM categories WHERE slug = 'drinks';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Energy & Malted Drinks', 'energy-malted-drinks', id FROM categories WHERE slug = 'drinks';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Syrups & Powder Drinks', 'syrups-powder-drinks', id FROM categories WHERE slug = 'drinks';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Drinking Water', 'drinking-water', id FROM categories WHERE slug = 'drinks';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Others', 'drinks-others', id FROM categories WHERE slug = 'drinks';

-- Tea subcategories
INSERT INTO categories (name, slug, parent_id)
SELECT 'Black Tea', 'black-tea', id FROM categories WHERE slug = 'tea';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Green Tea', 'green-tea', id FROM categories WHERE slug = 'tea';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Flavored Tea', 'flavored-tea', id FROM categories WHERE slug = 'tea';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Tea Others', 'tea-others', id FROM categories WHERE slug = 'tea';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Others', 'tea-general-others', id FROM categories WHERE slug = 'tea';

-- Coffee subcategories
INSERT INTO categories (name, slug, parent_id)
SELECT 'Instant Coffee', 'instant-coffee', id FROM categories WHERE slug = 'coffee';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Coffee Mate', 'coffee-mate', id FROM categories WHERE slug = 'coffee';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Coffee Others', 'coffee-others', id FROM categories WHERE slug = 'coffee';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Others', 'coffee-general-others', id FROM categories WHERE slug = 'coffee';

-- Snacks subcategories
INSERT INTO categories (name, slug, parent_id)
SELECT 'Snacks', 'snacks', id FROM categories WHERE slug = 'food';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Noodles', 'noodles', id FROM categories WHERE slug = 'snacks';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Pasta', 'pasta', id FROM categories WHERE slug = 'snacks';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Macaroni', 'macaroni', id FROM categories WHERE slug = 'snacks';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Soup', 'soup', id FROM categories WHERE slug = 'snacks';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Cakes', 'cakes', id FROM categories WHERE slug = 'snacks';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Biscuits', 'biscuits', id FROM categories WHERE slug = 'snacks';

-- Biscuits subcategories
INSERT INTO categories (name, slug, parent_id)
SELECT 'Energy Biscuit', 'energy-biscuit', id FROM categories WHERE slug = 'biscuits';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Milk Biscuits', 'milk-biscuits', id FROM categories WHERE slug = 'biscuits';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Cream & Sandwich Biscuits', 'cream-sandwich-biscuits', id FROM categories WHERE slug = 'biscuits';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Toast Biscuit', 'toast-biscuit', id FROM categories WHERE slug = 'biscuits';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Salted', 'salted-biscuits', id FROM categories WHERE slug = 'biscuits';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Sugar Free Biscuits', 'sugar-free-biscuits', id FROM categories WHERE slug = 'biscuits';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Dry-Cake', 'dry-cake', id FROM categories WHERE slug = 'biscuits';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Biscuits Others', 'biscuits-others', id FROM categories WHERE slug = 'biscuits';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Others', 'biscuits-general-others', id FROM categories WHERE slug = 'biscuits';

-- More Snacks subcategories
INSERT INTO categories (name, slug, parent_id)
SELECT 'Local Snacks', 'local-snacks', id FROM categories WHERE slug = 'snacks';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Popcorn & Nuts', 'popcorn-nuts', id FROM categories WHERE slug = 'snacks';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Chips & Pretzels', 'chips-pretzels', id FROM categories WHERE slug = 'snacks';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Dried Fruits', 'dried-fruits', id FROM categories WHERE slug = 'snacks';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Mayonnaise', 'mayonnaise', id FROM categories WHERE slug = 'snacks';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Shemai', 'shemai', id FROM categories WHERE slug = 'snacks';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Others', 'snacks-others', id FROM categories WHERE slug = 'snacks';

-- Frozen subcategories
INSERT INTO categories (name, slug, parent_id)
SELECT 'Frozen', 'frozen', id FROM categories WHERE slug = 'food';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Paratha & Roti', 'paratha-roti', id FROM categories WHERE slug = 'frozen';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Singara', 'singara', id FROM categories WHERE slug = 'frozen';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Samosa', 'samosa', id FROM categories WHERE slug = 'frozen';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Nuggets', 'nuggets', id FROM categories WHERE slug = 'frozen';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Sausage', 'sausage', id FROM categories WHERE slug = 'frozen';

INSERT INTO categories (name, slug, parent_id)
SELECT 'French Fries', 'french-fries', id FROM categories WHERE slug = 'frozen';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Frozen Snacks Others', 'frozen-snacks-others', id FROM categories WHERE slug = 'frozen';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Others', 'frozen-general-others', id FROM categories WHERE slug = 'frozen';

-- Canned Food subcategories
INSERT INTO categories (name, slug, parent_id)
SELECT 'Canned Food', 'canned-food', id FROM categories WHERE slug = 'food';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Canned Vegetables', 'canned-vegetables', id FROM categories WHERE slug = 'canned-food';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Canned Fish', 'canned-fish', id FROM categories WHERE slug = 'canned-food';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Canned Fruits', 'canned-fruits', id FROM categories WHERE slug = 'canned-food';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Canned Meat', 'canned-meat', id FROM categories WHERE slug = 'canned-food';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Others', 'canned-food-others', id FROM categories WHERE slug = 'canned-food';

-- Ice Cream category
INSERT INTO categories (name, slug, parent_id)
SELECT 'Ice Cream', 'ice-cream', id FROM categories WHERE slug = 'food';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Others', 'ice-cream-others', id FROM categories WHERE slug = 'ice-cream';

-- Candy & Chocolate category
INSERT INTO categories (name, slug, parent_id)
SELECT 'Candy & Chocolate', 'candy-chocolate', id FROM categories WHERE slug = 'food';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Others', 'candy-chocolate-others', id FROM categories WHERE slug = 'candy-chocolate';

-- Dairy subcategories
INSERT INTO categories (name, slug, parent_id)
SELECT 'Dairy', 'dairy', id FROM categories WHERE slug = 'food';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Ghee', 'ghee', id FROM categories WHERE slug = 'dairy';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Butter', 'butter', id FROM categories WHERE slug = 'dairy';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Cheese', 'cheese', id FROM categories WHERE slug = 'dairy';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Condensed Milk & Cream', 'condensed-milk-cream', id FROM categories WHERE slug = 'dairy';

-- Liquid & UHT Milk subcategories
INSERT INTO categories (name, slug, parent_id)
SELECT 'Liquid & UHT Milk', 'liquid-uht-milk', id FROM categories WHERE slug = 'dairy';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Low Fat Milk', 'low-fat-milk', id FROM categories WHERE slug = 'liquid-uht-milk';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Milk Others', 'milk-others', id FROM categories WHERE slug = 'liquid-uht-milk';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Others', 'liquid-milk-general-others', id FROM categories WHERE slug = 'liquid-uht-milk';

-- Powder Milk subcategories
INSERT INTO categories (name, slug, parent_id)
SELECT 'Powder Milk', 'powder-milk', id FROM categories WHERE slug = 'dairy';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Full Cream Milk', 'full-cream-milk', id FROM categories WHERE slug = 'powder-milk';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Diabetic Milk', 'diabetic-milk', id FROM categories WHERE slug = 'powder-milk';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Low Fat Milk', 'powder-low-fat-milk', id FROM categories WHERE slug = 'powder-milk';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Non Fat Milk', 'non-fat-milk', id FROM categories WHERE slug = 'powder-milk';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Powder Milk Others', 'powder-milk-others', id FROM categories WHERE slug = 'powder-milk';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Others', 'powder-milk-general-others', id FROM categories WHERE slug = 'powder-milk';

-- More Dairy subcategories
INSERT INTO categories (name, slug, parent_id)
SELECT 'Yogurt', 'yogurt', id FROM categories WHERE slug = 'dairy';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Laban', 'laban', id FROM categories WHERE slug = 'dairy';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Lacchi', 'lacchi', id FROM categories WHERE slug = 'dairy';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Others', 'dairy-others', id FROM categories WHERE slug = 'dairy';

-- Breakfast subcategories
INSERT INTO categories (name, slug, parent_id)
SELECT 'Breakfast', 'breakfast', id FROM categories WHERE slug = 'food';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Breads', 'breads', id FROM categories WHERE slug = 'breakfast';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Jam & Jelly', 'jam-jelly', id FROM categories WHERE slug = 'breakfast';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Dips & Spreads', 'dips-spreads', id FROM categories WHERE slug = 'breakfast';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Honey', 'honey', id FROM categories WHERE slug = 'breakfast';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Cereals', 'cereals', id FROM categories WHERE slug = 'breakfast';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Others', 'breakfast-others', id FROM categories WHERE slug = 'breakfast';

-- Sauces & Pickles subcategories
INSERT INTO categories (name, slug, parent_id)
SELECT 'Sauces & Pickles', 'sauces-pickles', id FROM categories WHERE slug = 'food';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Pickle & Condiments', 'pickle-condiments', id FROM categories WHERE slug = 'sauces-pickles';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Dipping Sauce', 'dipping-sauce', id FROM categories WHERE slug = 'sauces-pickles';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Cooking Sauce', 'cooking-sauce', id FROM categories WHERE slug = 'sauces-pickles';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Others', 'sauces-pickles-others', id FROM categories WHERE slug = 'sauces-pickles';

-- Cooking subcategories
INSERT INTO categories (name, slug, parent_id)
SELECT 'Cooking', 'cooking', id FROM categories WHERE slug = 'food';

-- Rice subcategories
INSERT INTO categories (name, slug, parent_id)
SELECT 'Rice', 'rice', id FROM categories WHERE slug = 'cooking';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Loose Rice', 'loose-rice', id FROM categories WHERE slug = 'rice';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Packed Rice', 'packed-rice', id FROM categories WHERE slug = 'rice';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Others', 'rice-others', id FROM categories WHERE slug = 'rice';

-- Dal or Lentil subcategories
INSERT INTO categories (name, slug, parent_id)
SELECT 'Dal or Lentil', 'dal-lentil', id FROM categories WHERE slug = 'cooking';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Loose Daal', 'loose-daal', id FROM categories WHERE slug = 'dal-lentil';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Packed Daal', 'packed-daal', id FROM categories WHERE slug = 'dal-lentil';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Others', 'dal-lentil-others', id FROM categories WHERE slug = 'dal-lentil';

-- Oil subcategories
INSERT INTO categories (name, slug, parent_id)
SELECT 'Oil', 'oil', id FROM categories WHERE slug = 'cooking';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Soybean Oil', 'soybean-oil', id FROM categories WHERE slug = 'oil';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Rice Bran Oil', 'rice-bran-oil', id FROM categories WHERE slug = 'oil';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Sunflower Oil', 'sunflower-oil', id FROM categories WHERE slug = 'oil';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Olive Oil', 'olive-oil', id FROM categories WHERE slug = 'oil';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Mustard Oil', 'mustard-oil', id FROM categories WHERE slug = 'oil';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Flavored Oil', 'flavored-oil', id FROM categories WHERE slug = 'oil';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Others', 'oil-others', id FROM categories WHERE slug = 'oil';

-- Spices subcategories
INSERT INTO categories (name, slug, parent_id)
SELECT 'Spices', 'spices', id FROM categories WHERE slug = 'cooking';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Regular Spice', 'regular-spice', id FROM categories WHERE slug = 'spices';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Mixed Spice', 'mixed-spice', id FROM categories WHERE slug = 'spices';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Wholespice', 'wholespice', id FROM categories WHERE slug = 'spices';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Others', 'spices-others', id FROM categories WHERE slug = 'spices';

-- Salt & Sugar subcategories
INSERT INTO categories (name, slug, parent_id)
SELECT 'Salt & Sugar', 'salt-sugar', id FROM categories WHERE slug = 'cooking';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Salt', 'salt', id FROM categories WHERE slug = 'salt-sugar';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Sugar', 'sugar', id FROM categories WHERE slug = 'salt-sugar';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Others', 'salt-sugar-others', id FROM categories WHERE slug = 'salt-sugar';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Others', 'cooking-others', id FROM categories WHERE slug = 'cooking';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Others', 'food-others', id FROM categories WHERE slug = 'food';

-- Baby Food & Care subcategories
INSERT INTO categories (name, slug, parent_id)
SELECT 'Baby Food', 'baby-food', id FROM categories WHERE slug = 'baby-food-care';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Baby Wipes', 'baby-wipes', id FROM categories WHERE slug = 'baby-food-care';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Baby Bath & Skincare', 'baby-bath-skincare', id FROM categories WHERE slug = 'baby-food-care';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Baby Oral Care', 'baby-oral-care', id FROM categories WHERE slug = 'baby-food-care';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Baby Accessories', 'baby-accessories', id FROM categories WHERE slug = 'baby-food-care';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Others', 'baby-food-care-others', id FROM categories WHERE slug = 'baby-food-care';

-- Home Cleaning subcategories
INSERT INTO categories (name, slug, parent_id)
SELECT 'Dish Cleaner', 'dish-cleaner', id FROM categories WHERE slug = 'home-cleaning';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Laundry', 'laundry', id FROM categories WHERE slug = 'home-cleaning';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Air Fresheners', 'air-fresheners', id FROM categories WHERE slug = 'home-cleaning';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Floor Glass & Wood Cleaners', 'floor-glass-wood-cleaners', id FROM categories WHERE slug = 'home-cleaning';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Toilet Cleaners', 'toilet-cleaners', id FROM categories WHERE slug = 'home-cleaning';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Pest Control', 'pest-control', id FROM categories WHERE slug = 'home-cleaning';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Trash Supplies', 'trash-supplies', id FROM categories WHERE slug = 'home-cleaning';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Others', 'home-cleaning-others', id FROM categories WHERE slug = 'home-cleaning';

-- Beauty & Health subcategories
INSERT INTO categories (name, slug, parent_id)
SELECT 'Beauty Care', 'beauty-care', id FROM categories WHERE slug = 'beauty-health';

-- Beauty Care subcategories
INSERT INTO categories (name, slug, parent_id)
SELECT 'Body Wash', 'body-wash', id FROM categories WHERE slug = 'beauty-care';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Skincare', 'skincare', id FROM categories WHERE slug = 'beauty-care';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Talcum Powder', 'talcum-powder', id FROM categories WHERE slug = 'beauty-care';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Shampoo', 'shampoo', id FROM categories WHERE slug = 'beauty-care';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Conditioners', 'conditioners', id FROM categories WHERE slug = 'beauty-care';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Cream & Lotion', 'cream-lotion', id FROM categories WHERE slug = 'beauty-care';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Cosmetics', 'cosmetics', id FROM categories WHERE slug = 'beauty-care';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Hair Care', 'hair-care', id FROM categories WHERE slug = 'beauty-care';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Shaving & Facial Care', 'shaving-facial-care', id FROM categories WHERE slug = 'beauty-care';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Feminine Care', 'feminine-care', id FROM categories WHERE slug = 'beauty-care';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Others', 'beauty-care-others', id FROM categories WHERE slug = 'beauty-care';

-- More Beauty & Health subcategories
INSERT INTO categories (name, slug, parent_id)
SELECT 'Oral Care', 'oral-care', id FROM categories WHERE slug = 'beauty-health';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Deodorant', 'deodorant', id FROM categories WHERE slug = 'beauty-health';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Tissue & Wipes', 'tissue-wipes', id FROM categories WHERE slug = 'beauty-health';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Personal Grooming', 'personal-grooming', id FROM categories WHERE slug = 'beauty-health';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Handwash & Handrub', 'handwash-handrub', id FROM categories WHERE slug = 'beauty-health';

-- Health Care subcategories
INSERT INTO categories (name, slug, parent_id)
SELECT 'Health Care', 'health-care', id FROM categories WHERE slug = 'beauty-health';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Herbal & Digestive Aids', 'herbal-digestive-aids', id FROM categories WHERE slug = 'health-care';

INSERT INTO categories (name, slug, parent_id)
SELECT 'First Aid & Antiseptics', 'first-aid-antiseptics', id FROM categories WHERE slug = 'health-care';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Diabetic Sugar', 'diabetic-sugar', id FROM categories WHERE slug = 'health-care';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Medical Devices', 'medical-devices', id FROM categories WHERE slug = 'health-care';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Others', 'health-care-others', id FROM categories WHERE slug = 'health-care';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Others', 'beauty-health-others', id FROM categories WHERE slug = 'beauty-health';

-- Gadget subcategories
INSERT INTO categories (name, slug, parent_id)
SELECT 'Mobile Phones', 'mobile-phones', id FROM categories WHERE slug = 'gadget';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Laptops', 'laptops', id FROM categories WHERE slug = 'gadget';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Tablets', 'tablets', id FROM categories WHERE slug = 'gadget';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Smartwatches', 'smartwatches', id FROM categories WHERE slug = 'gadget';

-- Headphones subcategories
INSERT INTO categories (name, slug, parent_id)
SELECT 'Headphones', 'headphones', id FROM categories WHERE slug = 'gadget';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Wired Headphones', 'wired-headphones', id FROM categories WHERE slug = 'headphones';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Wireless Headphones', 'wireless-headphones', id FROM categories WHERE slug = 'headphones';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Noise-Cancelling Headphones', 'noise-cancelling-headphones', id FROM categories WHERE slug = 'headphones';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Others', 'headphones-others', id FROM categories WHERE slug = 'headphones';

-- Speakers subcategories
INSERT INTO categories (name, slug, parent_id)
SELECT 'Speakers', 'speakers', id FROM categories WHERE slug = 'gadget';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Bluetooth Speakers', 'bluetooth-speakers', id FROM categories WHERE slug = 'speakers';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Portable Speakers', 'portable-speakers', id FROM categories WHERE slug = 'speakers';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Others', 'speakers-others', id FROM categories WHERE slug = 'speakers';

-- Smart Home Devices subcategories
INSERT INTO categories (name, slug, parent_id)
SELECT 'Smart Home Devices', 'smart-home-devices', id FROM categories WHERE slug = 'gadget';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Smart Lights', 'smart-lights', id FROM categories WHERE slug = 'smart-home-devices';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Smart Thermostats', 'smart-thermostats', id FROM categories WHERE slug = 'smart-home-devices';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Smart Security Cameras', 'smart-security-cameras', id FROM categories WHERE slug = 'smart-home-devices';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Others', 'smart-home-devices-others', id FROM categories WHERE slug = 'smart-home-devices';

-- Gaming subcategories
INSERT INTO categories (name, slug, parent_id)
SELECT 'Gaming', 'gaming', id FROM categories WHERE slug = 'gadget';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Gaming Consoles', 'gaming-consoles', id FROM categories WHERE slug = 'gaming';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Gaming Controllers', 'gaming-controllers', id FROM categories WHERE slug = 'gaming';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Gaming Headsets', 'gaming-headsets', id FROM categories WHERE slug = 'gaming';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Others', 'gaming-others', id FROM categories WHERE slug = 'gaming';

-- Accessories subcategories
INSERT INTO categories (name, slug, parent_id)
SELECT 'Accessories', 'accessories', id FROM categories WHERE slug = 'gadget';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Chargers', 'chargers', id FROM categories WHERE slug = 'accessories';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Power Banks', 'power-banks', id FROM categories WHERE slug = 'accessories';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Phone Cases', 'phone-cases', id FROM categories WHERE slug = 'accessories';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Laptop Bags', 'laptop-bags', id FROM categories WHERE slug = 'accessories';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Others', 'accessories-others', id FROM categories WHERE slug = 'accessories';

INSERT INTO categories (name, slug, parent_id)
SELECT 'Others', 'gadget-others', id FROM categories WHERE slug = 'gadget';

