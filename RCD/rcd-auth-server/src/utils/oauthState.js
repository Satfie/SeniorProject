const base64url = (input) => Buffer.from(input).toString('base64url');
const fromBase64url = (input) => Buffer.from(input, 'base64url').toString('utf8');

const STATE_COOKIE = 'rcd_oauth_state';
const FIVE_MINUTES = 5 * 60 * 1000;

function encodeState(payload = {}) {
  try {
    return base64url(JSON.stringify(payload));
  } catch (err) {
    console.warn('[oauth] Failed to encode state payload', err);
    return '';
  }
}

function decodeState(raw) {
  if (!raw || typeof raw !== 'string') return {};
  try {
    return JSON.parse(fromBase64url(raw));
  } catch (err) {
    console.warn('[oauth] Failed to decode state payload', err);
    return {};
  }
}

function writeStateCookie(res, value) {
  if (!value) return;
  const secure = process.env.NODE_ENV === 'production';
  res.cookie(STATE_COOKIE, value, {
    maxAge: FIVE_MINUTES,
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/api/auth',
  });
}

function parseCookies(req) {
  const header = req.headers?.cookie;
  if (!header) return {};
  return header.split(';').reduce((acc, part) => {
    const [key, ...rest] = part.split('=');
    if (!key) return acc;
    acc[key.trim()] = decodeURIComponent(rest.join('=').trim());
    return acc;
  }, {});
}

function consumeStateCookie(req, res) {
  const cookies = parseCookies(req);
  const value = cookies[STATE_COOKIE];
  if (value) {
    res.clearCookie(STATE_COOKIE, { path: '/api/auth' });
  }
  return value;
}

module.exports = {
  encodeState,
  decodeState,
  writeStateCookie,
  consumeStateCookie,
};

