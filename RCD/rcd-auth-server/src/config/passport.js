const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { decodeState } = require('../utils/oauthState');

const DISCORD_SCOPES = (process.env.DISCORD_SCOPES || 'identify email').split(/\s+/).filter(Boolean);

function verifyLinkToken(token) {
  if (!token) return null;
  const secret = process.env.JWT_SECRET || 'change_this_secret_in_env';
  try {
    const decoded = jwt.verify(token, secret);
    return decoded?.id || null;
  } catch (err) {
    console.warn('[oauth] Failed to verify link token', err.message);
    return null;
  }
}

function configureDiscordStrategy() {
  const clientID = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const callbackURL = process.env.DISCORD_CALLBACK_URL;
  if (!clientID || !clientSecret || !callbackURL) {
    console.warn('[oauth] Discord credentials missing. Set DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_CALLBACK_URL to enable Discord login.');
    return;
  }

  passport.use(
    new DiscordStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
        scope: DISCORD_SCOPES,
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const state = decodeState(req?.query?.state);
          const mode = state?.mode === 'link' ? 'link' : 'login';
          const linkTargetId = mode === 'link' ? verifyLinkToken(state?.token) : null;
          if (mode === 'link' && !linkTargetId) {
            throw new Error('Invalid or missing link token');
          }

          const user = await User.linkOAuthProfile('discord', profile, linkTargetId);
          const needsEmail = !profile?.email && (!user.email || user.email.endsWith('@oauth.local'));

          req.oauthState = state;
          done(null, user, { provider: 'discord', mode, needsEmail });
        } catch (err) {
          done(err);
        }
      }
    )
  );

  console.log('[oauth] Discord strategy configured');
}

function configurePassport() {
  configureDiscordStrategy();
}

module.exports = { configurePassport };

