import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
// Register user
export const register = async (req, res) => {
    try {
        const { username, email, password, fullName } = req.body;
        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: existingUser.email === email
                    ? 'Email already registered'
                    : 'Username already taken'
            });
        }
        // Create user
        const user = await User.create({
            username,
            email,
            password,
            fullName
        });
        // Generate token
        const token = generateToken(user._id.toString());
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user,
                token
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error registering user'
        });
    }
};
// Login user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }
        // Check for user (include password field)
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        // Check if password matches
        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        // Generate token
        const token = generateToken(user._id.toString());
        // Remove password from response
        user.password = undefined;
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user,
                token
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error logging in'
        });
    }
};
// Get current user
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).json({
            success: true,
            data: { user }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching user'
        });
    }
};
// Update user profile
export const updateProfile = async (req, res) => {
    try {
        const { fullName, avatar } = req.body;
        const user = await User.findByIdAndUpdate(req.user._id, { fullName, avatar }, { new: true, runValidators: true });
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: { user }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error updating profile'
        });
    }
};
// Get user stats
export const getUserStats = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).json({
            success: true,
            data: {
                stats: user?.stats
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching stats'
        });
    }
};
//# sourceMappingURL=authController.js.map