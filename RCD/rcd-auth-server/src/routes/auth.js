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
router.get('/discord', (req, res, next) => {
  if (!DISCORD_ENABLED) {
    return res.status(503).json({ message: 'Discord login is not configured' });
  }
  const state = encodeState(buildStatePayload(req));
  writeStateCookie(res, state);
  passport.authenticate('discord', {
    scope: ['identify', 'email'],
    session: false,
    state,
  })(req, res, next);
});

router.get(
  '/discord/callback',
  (req, res, next) => {
    const inlineState = decodeState(req.query?.state);
    const cookieStateRaw = consumeStateCookie(req, res);
    const cookieState = decodeState(cookieStateRaw);
    req.oauthState =
      inlineState && Object.keys(inlineState).length > 0 ? inlineState : cookieState;
    next();
  },
  passport.authenticate('discord', {
    failureRedirect,
    session: false,
  }),
  handleOAuthSuccess
);

router.delete('/providers/:provider', authMiddleware, unlinkProvider);

module.exports = router;