// filepath: /rcd-auth-server/rcd-auth-server/src/routes/auth.js
const express = require('express');
const passport = require('passport');
const { loginUser, registerUser, changePassword } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const {
  buildStatePayload,
  encodeState,
  handleOAuthSuccess,
  failureRedirect,
  DISCORD_ENABLED,
  GOOGLE_ENABLED,
  unlinkProvider,
} = require('../controllers/oauthController');
const { decodeState, writeStateCookie, consumeStateCookie } = require('../utils/oauthState');

const router = express.Router();

// Route for user login
router.post('/login', loginUser);

// Route for user registration
router.post('/register', registerUser);

// Change password (authenticated user only)
router.post('/change-password', authMiddleware, changePassword);

// OAuth: Discord
const oauthProviders = [
  {
    name: 'discord',
    enabled: () => DISCORD_ENABLED,
    strategy: 'discord',
    scope: ['identify', 'email'],
  },
  {
    name: 'google',
    enabled: () => GOOGLE_ENABLED,
    strategy: 'google',
    scope: ['profile', 'email'],
  },
];

oauthProviders.forEach(({ name, enabled, strategy, scope }) => {
  router.get(`/${name}`, (req, res, next) => {
    if (!enabled()) {
      return res.status(503).json({ message: `${name} login is not configured` });
    }
    const state = encodeState(buildStatePayload(req));
    writeStateCookie(res, state);
    passport.authenticate(strategy, {
      scope,
      session: false,
      state,
    })(req, res, next);
  });

  router.get(
    `/${name}/callback`,
    (req, res, next) => {
      const inlineState = decodeState(req.query?.state);
      const cookieStateRaw = consumeStateCookie(req, res);
      const cookieState = decodeState(cookieStateRaw);
      req.oauthState =
        inlineState && Object.keys(inlineState).length > 0 ? inlineState : cookieState;
      next();
    },
    passport.authenticate(strategy, {
      failureRedirect,
      session: false,
    }),
    handleOAuthSuccess
  );
});

router.delete('/providers/:provider', authMiddleware, unlinkProvider);

// Provider status for frontend UI (enabled/disabled)
router.get('/providers/status', (req, res) => {
  try {
    res.json({
      discord: typeof DISCORD_ENABLED !== 'undefined' ? !!DISCORD_ENABLED : false,
      google: typeof GOOGLE_ENABLED !== 'undefined' ? !!GOOGLE_ENABLED : false,
    });
  } catch (err) {
    console.error('[oauth] status error', err);
    res.status(500).json({ message: 'Failed to fetch provider status' });
  }
});

module.exports = router;