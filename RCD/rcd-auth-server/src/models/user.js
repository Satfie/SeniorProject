const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const providerSchema = new mongoose.Schema(
  {
    provider: { type: String, required: true },
    providerId: { type: String, required: true },
    displayName: { type: String },
    profile: { type: mongoose.Schema.Types.Mixed },
    linkedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// Define the User schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username must be at most 30 characters']
  },
  password: {
    type: String,
    required: true
  },
  // Role for RBAC: player, team_manager, admin
  role: {
    type: String,
    enum: ['player', 'team_manager', 'admin'],
    default: 'player'
  },
  // Team affiliation reference for convenience (optional, can be derived from team membership list)
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  avatarUrl: { type: String },
  providers: {
    type: [providerSchema],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.index({ 'providers.provider': 1, 'providers.providerId': 1 }, { unique: true, sparse: true });

userSchema.pre('save', async function(next) {
    const user = this;
    if (typeof user.ensurePasswordProvider === 'function') {
        user.ensurePasswordProvider();
    }
    if (!user.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Compare raw password with hashed
userSchema.methods.comparePassword = function(candidate) {
    if (!this.password || !candidate) return false;
    return bcrypt.compare(candidate, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
    const payload = { id: this._id };
    const secret = process.env.JWT_SECRET || 'change_this_secret_in_env';
    const token = jwt.sign(payload, secret, { expiresIn: '7d' });
    return token;
};

userSchema.methods.toSafeObject = function() {
    return {
        id: this._id,
        email: this.email,
        username: this.username,
        role: this.role || 'player',
        providers: (this.providers || []).map((p) => ({
            provider: p.provider,
            providerId: p.providerId,
            displayName: p.displayName,
            linkedAt: p.linkedAt,
        })),
    };
};

userSchema.methods.attachProvider = function(provider, providerId, profile) {
    if (!this.providers) this.providers = [];
    const existing = this.providers.find(
        (p) => p.provider === provider && p.providerId === providerId
    );
    if (existing) {
        existing.displayName = profile?.username || profile?.global_name || profile?.displayName || existing.displayName;
        existing.profile = profile;
        existing.linkedAt = new Date();
    } else {
        this.providers.push({
            provider,
            providerId,
            displayName: profile?.username || profile?.global_name || profile?.displayName,
            profile,
        });
    }
};

userSchema.methods.unlinkProvider = function(provider) {
    if (!this.providers) this.providers = [];
    const before = this.providers.length;
    this.providers = this.providers.filter((p) => p.provider !== provider);
    return before !== this.providers.length;
};

userSchema.statics.normalizeEmail = function(email) {
    return typeof email === 'string' ? email.trim().toLowerCase() : undefined;
};

userSchema.statics.generateUniqueUsername = async function(base) {
    const sanitized = (base || 'user').replace(/[^a-zA-Z0-9_]/g, '').slice(0, 24) || 'player';
    let candidate = sanitized;
    let suffix = 1;
    while (await this.findOne({ username: candidate })) {
        candidate = `${sanitized}${suffix}`;
        suffix += 1;
        if (suffix > 9999) {
            candidate = `${sanitized}${crypto.randomBytes(3).toString('hex')}`;
            break;
        }
    }
    return candidate;
};

userSchema.statics.findByProvider = function(provider, providerId) {
    return this.findOne({
        'providers.provider': provider,
        'providers.providerId': providerId,
    });
};

userSchema.statics.linkOAuthProfile = async function(provider, profile, linkTargetUserId) {
    const providerId = profile?.id;
    if (!providerId) {
        throw new Error('Provider profile missing id');
    }
    const email = this.normalizeEmail(profile?.email);
    const displayName = profile?.global_name || profile?.username || profile?.displayName;

    if (linkTargetUserId) {
        const targetUser = await this.findById(linkTargetUserId);
        if (!targetUser) {
            throw new Error('Link target user not found');
        }
        const existingOwner = await this.findByProvider(provider, providerId);
        if (existingOwner && existingOwner.id !== targetUser.id) {
            throw new Error('This provider is already linked to another account');
        }
        targetUser.attachProvider(provider, providerId, profile);
        if (email && !targetUser.email) {
            targetUser.email = email;
        }
        if (!targetUser.username && displayName) {
            targetUser.username = await this.generateUniqueUsername(displayName);
        }
        await targetUser.save();
        return targetUser;
    }

    let user = await this.findByProvider(provider, providerId);
    if (!user && email) {
        user = await this.findOne({ email });
    }

    if (user) {
        user.attachProvider(provider, providerId, profile);
        if (!user.username && displayName) {
            user.username = await this.generateUniqueUsername(displayName);
        }
        await user.save();
        return user;
    }

    const username = await this.generateUniqueUsername(displayName || `${provider}_${providerId.slice(0, 6)}`);
    const fallbackEmail = email || `${provider}_${providerId}@oauth.local`;
    const tempPassword = crypto.randomBytes(24).toString('hex');

    const newUser = new this({
        email: fallbackEmail,
        password: tempPassword,
        username,
        role: 'player',
    });
    newUser.attachProvider(provider, providerId, profile);
    await newUser.save();
    return newUser;
};

userSchema.methods.ensurePasswordProvider = function() {
    if (!this.providers) this.providers = [];
    const hasPasswordProvider = this.providers.some((p) => p.provider === 'password');
    if (!hasPasswordProvider) {
        this.providers.unshift({
            provider: 'password',
            providerId: this.email || `password-${this._id}`,
            displayName: this.username || this.email,
            linkedAt: new Date(),
        });
    }
};

// Method to find a user by username
userSchema.statics.findByUsername = function(username) {
    return this.findOne({ username });
};

// Method to find a user by email
userSchema.statics.findByEmail = function(email) {
    return this.findOne({ email });
};

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;