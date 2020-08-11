const crypto = require('crypto');

module.exports = async (req, res, next) => {
  const auth_header = req.headers.authorization;

  if (!auth_header) {
    return res.json({ error: '如需使用此功能，請聯絡管理者。' });
  }

  const JWT = auth_header.replace(/Bearer/, '').replace(/\s/g, '');
  const data = decodeJWT(JWT);

  if (data.error || data.email !== 'admin@mail') {
    return res.json({ error: '如需使用此功能，請聯絡管理者。' });
  }

  next();

}

function decodeJWT(JWT) {
  // return user email

  // check JWT style
  if (!JWT.toString().match(/.+\..+\..+/)) {
    return { error: 'Wrong Token Style' };
  }

  const [header, payload, signature] = JWT.split('.');

  // check signature
  if (signature !== crypto.createHmac('sha256', process.env.JWT_secret).update(`${header}.${payload}`).digest('base64')) {
    return { error: 'Wrong Token Signature' };
  }

  // check exp
  const data = JSON.parse(Buffer.from(payload, 'base64').toString());
  if (Date.now() > data.exp) {
    return { error: 'Token Expired' };
  }

  return data;
}