// filepath: /rcd-auth-server/rcd-auth-server/src/controllers/authController.js

const User = require('../models/user');

// Login user
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const normalizedEmail = User.normalizeEmail(email);
        const user = await User.findOne({ email: normalizedEmail });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate token (assuming a method exists in the User model)
        const token = user.generateAuthToken();
        res.status(200).json({
            token,
            user: user.toSafeObject(),
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Register user (defaults to minimal privileges as 'player')
exports.registerUser = async (req, res) => {
    const { email, password, username } = req.body;

    try {
        if (!username || typeof username !== 'string' || !username.trim()) {
            return res.status(400).json({ message: 'Username is required' });
        }
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }

        const normalizedEmail = User.normalizeEmail(email);
        const [existingEmail, existingUsername] = await Promise.all([
            User.findOne({ email: normalizedEmail }),
            User.findOne({ username })
        ]);

        if (existingEmail) {
            return res.status(400).json({ message: 'Email is already registered' });
        }
        if (existingUsername) {
            return res.status(400).json({ message: 'Username is already taken' });
        }

        const newUser = new User({ 
            email: normalizedEmail, 
            password, 
            username: username.trim(), 
            role: 'player',
            hasPassword: true, // User registered with password
            emailVerified: false, // Email not verified yet
        });
        // Add password provider
        newUser.providers = [{
            provider: 'password',
            providerId: normalizedEmail,
            displayName: username.trim(),
            linkedAt: new Date(),
        }];
        await newUser.save();

        // Generate token
        const token = newUser.generateAuthToken();
        res.status(201).json({
            token,
            user: newUser.toSafeObject(),
        });
    } catch (error) {
        // Handle duplicate key errors from the DB
        if (error && error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0] || 'field';
            return res.status(400).json({ message: `${field} already exists` });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

// Change password for authenticated user
exports.changePassword = async (req, res) => {
    try {
        const user = req.user; // from auth middleware
        if (!user) return res.status(401).json({ message: 'Unauthenticated' });
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: 'oldPassword and newPassword are required' });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'New password must be at least 8 characters' });
        }
        const matches = await user.comparePassword(oldPassword);
        if (!matches) {
            return res.status(401).json({ message: 'Old password incorrect' });
        }
        user.password = newPassword; // will be hashed by pre-save hook
        await user.save();
        return res.json({ message: 'Password updated' });
    } catch (err) {
        console.error('Change password error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Set password for OAuth-only users (or reset password)
exports.setPassword = async (req, res) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Unauthenticated' });
        
        const { newPassword, email } = req.body;
        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }

        // If user doesn't have a real email, they must provide one
        const hasRealEmail = user.email && !String(user.email).endsWith('@oauth.local');
        if (!hasRealEmail) {
            if (!email || !email.includes('@') || email.endsWith('@oauth.local')) {
                return res.status(400).json({ message: 'A valid email address is required to set up password login' });
            }
            // Check if email is already taken by another user
            const existingUser = await User.findOne({ email: User.normalizeEmail(email) });
            if (existingUser && existingUser.id !== user.id) {
                return res.status(400).json({ message: 'This email is already registered to another account' });
            }
            user.email = User.normalizeEmail(email);
        }

        // Set the password
        await user.setPassword(newPassword);
        await user.save();
        
        return res.json({ 
            message: 'Password set successfully. You can now log in with email and password.',
            user: user.toSafeObject(),
        });
    } catch (err) {
        console.error('Set password error:', err);
        return res.status(500).json({ message: err.message || 'Server error' });
    }
};

// Update email for authenticated user
exports.updateEmail = async (req, res) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Unauthenticated' });
        
        const { email, password } = req.body;
        if (!email || !email.includes('@') || email.endsWith('@oauth.local')) {
            return res.status(400).json({ message: 'A valid email address is required' });
        }

        // If user has password auth, require password confirmation
        if (user.hasPassword) {
            if (!password) {
                return res.status(400).json({ message: 'Password required to change email' });
            }
            const matches = await user.comparePassword(password);
            if (!matches) {
                return res.status(401).json({ message: 'Invalid password' });
            }
        }

        const normalizedEmail = User.normalizeEmail(email);
        
        // Check if email is already taken
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser && existingUser.id !== user.id) {
            return res.status(400).json({ message: 'This email is already registered' });
        }

        user.email = normalizedEmail;
        user.emailVerified = false; // New email needs verification
        
        // Update password provider ID if exists
        const passwordProvider = user.providers?.find(p => p.provider === 'password');
        if (passwordProvider) {
            passwordProvider.providerId = normalizedEmail;
        }
        
        await user.save();
        
        return res.json({ 
            message: 'Email updated successfully',
            user: user.toSafeObject(),
        });
    } catch (err) {
        console.error('Update email error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};