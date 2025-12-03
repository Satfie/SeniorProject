const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { encodeState, decodeState } = require('../utils/oauthState');

const successRedirect =
  process.env.OAUTH_SUCCESS_REDIRECT ||
  (process.env.NODE_ENV === 'production'
    ? 'https://eshield.live/auth/callback'
    : 'http://localhost:3000/auth/callback');

const failureRedirect =
  process.env.OAUTH_FAILURE_REDIRECT ||
  (process.env.NODE_ENV === 'production'
    ? 'https://eshield.live/login'
    : 'http://localhost:3000/login');

const DISCORD_ENABLED = Boolean(
  process.env.DISCORD_CLIENT_ID &&
  process.env.DISCORD_CLIENT_SECRET &&
  process.env.DISCORD_CALLBACK_URL
);
const GOOGLE_ENABLED = Boolean(
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CALLBACK_URL
);

function buildStatePayload(req) {
  const mode = req.query?.mode === 'link' ? 'link' : 'login';
  const statePayload = {
    mode,
  };
  if (req.query?.returnTo) {
    statePayload.returnTo = req.query.returnTo;
  }
  if (mode === 'link' && req.query?.token) {
    statePayload.token = req.query.token;
  }
  return statePayload;
}

function buildRedirectUrl(base, params = {}) {
  const target = new URL(base);
  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === 'undefined' || value === null) return;
    target.searchParams.set(key, String(value));
  });
  return target.toString();
}

function handleOAuthSuccess(req, res) {
  try {
    const user = req.user;
    if (!user) {
      throw new Error('Missing user in OAuth success handler');
    }
    const token = user.generateAuthToken();
    const info = req.authInfo || {};
    const state = req.oauthState || decodeState(req.query?.state);
    const redirectUrl = buildRedirectUrl(successRedirect, {
      token,
      provider: info.provider || 'discord',
      mode: info.mode || state?.mode || 'login',
      needsEmail: info.needsEmail ? '1' : undefined,
      returnTo: state?.returnTo,
    });
    res.redirect(redirectUrl);
  } catch (err) {
    console.error('[oauth] Success handler error', err);
    res.redirect(
      buildRedirectUrl(failureRedirect, {
        error: 'oauth_failed',
        message: 'Unable to complete OAuth flow',
      })
    );
  }
}

async function unlinkProvider(req, res) {
  const provider = req.params?.provider;
  if (!provider) {
    return res.status(400).json({ message: 'Provider is required' });
  }
  if (provider === 'password') {
    return res.status(400).json({ message: 'Cannot unlink password provider' });
  }
  try {
    const user = req.user;
    const externalProviders = (user.providers || []).filter((p) => p.provider !== 'password');
    const hasRealEmailPassword = !!(user.email && !String(user.email).endsWith('@oauth.local'));
    const totalUsableMethods = externalProviders.length + (hasRealEmailPassword ? 1 : 0);

    // Enforce: never allow unlinking the last usable login method
    if (totalUsableMethods <= 1) {
      return res.status(400).json({
        message: 'You need at least one other login method (password or another OAuth) before removing this provider.',
        code: 'last_auth_method_denied',
      });
    }

    // If unlinking an external provider would result in zero external and no real password, block


    const removed = user.unlinkProvider(provider);
    if (!removed) {
      return res.status(404).json({ message: 'Provider not linked' });
    }
    await user.save();
    res.json(user.toSafeObject());
  } catch (err) {
    console.error('[oauth] unlink error', err);
    res.status(500).json({ message: 'Failed to unlink provider' });
  }
}

module.exports = {
  encodeState,
  decodeState,
  buildStatePayload,
  handleOAuthSuccess,
  unlinkProvider,
  successRedirect,
  failureRedirect,
  DISCORD_ENABLED,
  GOOGLE_ENABLED,
};

