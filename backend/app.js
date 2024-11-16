const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const fs = require('fs');

const sequelize = require('./config/database');
require('./models/index');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

// API routes
app.use('/api', require('./routes/api'));
app.use('/api/categories', categoryRoutes);

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: err.message || 'Something went wrong!' });
});

// Database connection and server start
const PORT = process.env.PORT || 5001;

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
        
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Error starting server:', err);
        process.exit(1);
    }
};

startServer();

module.exports = app;
