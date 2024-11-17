const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const crypto = require('crypto');
const sendEmail = require('../config/mailer');
const { Op } = require('sequelize');
const logger = require('../config/logger');

exports.signup = async (req, res) => {
    try {
        const { email, password, fullName, location } = req.body;
        
        console.log('Signup attempt:', { email, fullName, location });

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Create new user
        const user = await User.create({
            email,
            password,
            full_name: fullName,
            location
        });

        // Generate token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

        // Remove password from response
        const userWithoutPassword = { ...user.toJSON() };
        delete userWithoutPassword.password;

        console.log('Signup successful:', { email });
        res.status(201).json({ user: userWithoutPassword, token });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(400).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Log login attempt
        logger.info(`Login attempt for email: ${email}`);
        
        // Find user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            logger.error(`Login failed: User not found for email: ${email}`);
            return res.status(404).json({ error: 'User not found' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            logger.error(`Login failed: Invalid password for email: ${email}`);
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Generate token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

        // Remove password from response
        const userWithoutPassword = { ...user.toJSON() };
        delete userWithoutPassword.password;

        logger.info(`Login successful for user: ${email}`);
        res.json({ user: userWithoutPassword, token });
    } catch (error) {
        logger.error('Login error:', error);
        res.status(400).json({ error: error.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        // Check if user exists with this email
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ error: 'No user found with this email' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        // Save token to user
        await user.update({
            reset_token: resetToken,
            reset_token_expiry: resetTokenExpiry
        });

        // Create reset URL
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        // Email content
        const emailHtml = `
            <h1>Password Reset Request</h1>
            <p>You requested to reset your password. Click the link below to set a new password:</p>
            <a href="${resetUrl}">Reset Password</a>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
        `;

        // Send email using nodemailer
        await sendEmail(
            user.email,
            'Password Reset Request - AgriZoo',
            emailHtml
        );

        res.json({ message: 'Password reset link has been sent to your email' });
    } catch (error) {
        console.error('Error in forgotPassword:', error);
        res.status(500).json({ error: 'Failed to send reset email' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // Find user with valid reset token
        const user = await User.findOne({
            where: {
                reset_token: token,
                reset_token_expiry: {
                    [Op.gt]: new Date() // Token not expired
                }
            }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        // Hash new password and update user
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await user.update({
            password: hashedPassword,
            reset_token: null,
            reset_token_expiry: null
        });

        res.json({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.error('Error in resetPassword:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
};
