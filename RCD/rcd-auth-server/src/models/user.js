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
  // Tracks if user has set their own password (vs auto-generated OAuth temp password)
  hasPassword: {
    type: Boolean,
    default: false
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
  // Whether email has been verified
  emailVerified: {
    type: Boolean,
    default: false
  },
  avatarUrl: { type: String },
  country: { type: String },
  region: { type: String },
  timezone: { type: String },
  social: {
    snapchat: { type: String },
    youtube: { type: String },
    discord: { type: String },
    twitch: { type: String },
    twitter: { type: String },
    instagram: { type: String },
  },
  gameIds: {
    playstation: { type: String },
    pubgMobile: { type: String },
    rocketLeague: { type: String },
    activision: { type: String },
    riot: { type: String },
    r6s: { type: String },
    mobileLegends: { type: String },
    battleNet: { type: String },
    steam: { type: String },
    codMobile: { type: String },
    streetFighter: { type: String },
    smashBros: { type: String },
  },
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
    const hasRealEmail = this.email && !String(this.email).endsWith('@oauth.local');
    const externalProviders = (this.providers || []).filter((p) => p.provider !== 'password');
    
    return {
        id: this._id,
        email: this.email,
        username: this.username,
        role: this.role || 'player',
        teamId: this.teamId,
        avatarUrl: this.avatarUrl,
        country: this.country,
        region: this.region,
        timezone: this.timezone,
        social: this.social,
        gameIds: this.gameIds,
        createdAt: this.createdAt,
        // Auth-related flags for frontend
        hasPassword: Boolean(this.hasPassword),
        hasRealEmail: hasRealEmail,
        emailVerified: Boolean(this.emailVerified),
        // Provider details
        providers: (this.providers || []).map((p) => ({
            provider: p.provider,
            providerId: p.providerId,
            displayName: p.displayName,
            linkedAt: p.linkedAt,
        })),
        // Computed auth state
        authMethods: {
            password: Boolean(this.hasPassword && hasRealEmail),
            oauth: externalProviders.map(p => p.provider),
            count: (this.hasPassword && hasRealEmail ? 1 : 0) + externalProviders.length,
        },
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
    const avatarUrl = profile?.avatar 
        ? `https://cdn.discordapp.com/avatars/${providerId}/${profile.avatar}.png`
        : profile?.photos?.[0]?.value || profile?.picture;

    // MODE: Linking to existing account
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
        // Update email if user doesn't have a real one
        if (email && (!targetUser.email || targetUser.email.endsWith('@oauth.local'))) {
            targetUser.email = email;
        }
        // Update avatar if not set
        if (avatarUrl && !targetUser.avatarUrl) {
            targetUser.avatarUrl = avatarUrl;
        }
        if (!targetUser.username && displayName) {
            targetUser.username = await this.generateUniqueUsername(displayName);
        }
        await targetUser.save();
        return targetUser;
    }

    // MODE: Login/Register - find existing user by provider
    let user = await this.findByProvider(provider, providerId);
    
    // If found by provider, update and return
    if (user) {
        user.attachProvider(provider, providerId, profile);
        // Update email if better one available
        if (email && user.email.endsWith('@oauth.local')) {
            user.email = email;
        }
        // Update avatar if newer/better
        if (avatarUrl && !user.avatarUrl) {
            user.avatarUrl = avatarUrl;
        }
        if (!user.username && displayName) {
            user.username = await this.generateUniqueUsername(displayName);
        }
        await user.save();
        return user;
    }

    // Try to find by email (only if OAuth email matches existing account)
    // This allows OAuth login to work for users who registered with email
    if (email) {
        user = await this.findOne({ email });
        if (user) {
            // Security: Only auto-link if user already has password auth
            // This prevents account takeover if someone signs up with your email via OAuth
            if (user.hasPassword) {
                user.attachProvider(provider, providerId, profile);
                if (avatarUrl && !user.avatarUrl) {
                    user.avatarUrl = avatarUrl;
                }
                await user.save();
                return user;
            } else {
                // User exists with this email but registered via different OAuth
                // Don't auto-merge - require manual linking from profile
                throw new Error('An account with this email already exists. Please log in with your existing method and link this provider from your profile.');
            }
        }
    }

    // Create new user
    const username = await this.generateUniqueUsername(displayName || `${provider}_${providerId.slice(0, 6)}`);
    const fallbackEmail = email || `${provider}_${providerId}@oauth.local`;
    const tempPassword = crypto.randomBytes(24).toString('hex');

    const newUser = new this({
        email: fallbackEmail,
        password: tempPassword,
        hasPassword: false, // OAuth user doesn't have a usable password
        emailVerified: Boolean(email), // OAuth emails are pre-verified
        username,
        role: 'player',
        avatarUrl,
    });
    newUser.attachProvider(provider, providerId, profile);
    await newUser.save();
    return newUser;
};

userSchema.methods.ensurePasswordProvider = function() {
    if (!this.providers) this.providers = [];
    const hasPasswordProvider = this.providers.some((p) => p.provider === 'password');
    // Only add password provider if user actually has a usable password set
    if (!hasPasswordProvider && this.hasPassword) {
        this.providers.unshift({
            provider: 'password',
            providerId: this.email || `password-${this._id}`,
            displayName: this.username || this.email,
            linkedAt: new Date(),
        });
    }
};

// Method to set/update password (used when OAuth user wants to add password auth)
userSchema.methods.setPassword = async function(newPassword) {
    if (!newPassword || newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters');
    }
    this.password = newPassword; // Will be hashed by pre-save hook
    this.hasPassword = true;
    // Add password provider if not present
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

// Check if user can authenticate with password
userSchema.methods.canUsePasswordAuth = function() {
    const hasRealEmail = this.email && !String(this.email).endsWith('@oauth.local');
    return Boolean(this.hasPassword && hasRealEmail);
};

// Get count of usable auth methods
userSchema.methods.getAuthMethodCount = function() {
    const hasRealEmail = this.email && !String(this.email).endsWith('@oauth.local');
    const passwordAuth = this.hasPassword && hasRealEmail ? 1 : 0;
    const oauthCount = (this.providers || []).filter((p) => p.provider !== 'password').length;
    return passwordAuth + oauthCount;
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