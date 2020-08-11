const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const fetch = require('node-fetch');

const { User } = require('../models');

router.post('/signup', async (req, res) => {

  // check Content-Type
  if (!req.is('application/json')) {
    return res.status(400).json({ error: 'Incorrect Content-Type.' });
  }

  const { name, email, password } = req.body;

  // avoid empty
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // check user exist
  let user_found;
  try {
    user_found = await User.findOne({ where: { email } });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }

  if (user_found) {
    return res.status(403).json({ error: 'Email already exists' });
  }

  // create
  let user;
  try {
    user = await User.create({ name, email, password: hash_with_salt(password) });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }

  const { id, provider } = user.get();

  const access_token = getJWT({ id, provider, name, email, picture: 'picture url' });
  const data = {
    access_token,
    access_expired: 3600,
    user: {
      id, provider, name, email, picture: 'picture url'
    }
  };

  return res.json(data);


});

router.post('/signin', async (req, res) => {

  // check Content-Type
  if (!req.is('application/json')) {
    return res.status(400).json({ error: 'Incorrect Content-Type.' });
  }

  const { provider } = req.body;

  if (!provider) {
    return res.status(400).json({ error: 'Please provide provider.' });
  }

  let status, user, error;

  if (provider === 'native') {
    const { email, password } = req.body;
    ({ status, user, error } = await nativeLogin(email, password));

  } else {
    const { access_token } = req.body;
    ({ status, user, error } = await thirdLogin(access_token, provider));

  }

  if (error) {
    return res.status(status).json({ error });
  }

  const { id, name } = user;

  // const access_token = getJWT({ id, provider, name, email, picture: 'picture url' });
  const data = {
    access_token: getJWT({ id, provider, name, email: user.email, picture: 'picture url' }),
    access_expired: 3600,
    user: {
      id, provider, name, email: user.email, picture: 'picture url'
    }
  };

  return res.json(data);


});

router.get('/profile', async (req, res) => {
  const auth_header = req.headers.authorization;
  const JWT = auth_header.replace(/Bearer/, '').replace(/\s/g, '');
  const data = decodeJWT(JWT);

  if (data.error) {
    return res.status(403).json({ error: data.error });
  }

  delete data.exp;

  return res.json({ data });

});

module.exports = router;




async function nativeLogin(email, password) {
  // return {status, error or user}

  // avoid empty
  if (!email || !password) {
    return { status: 400, error: 'All fields are required.' };
  }

  let user;
  try {
    user = await User.findOne({ where: { email } });
  } catch (err) {
    return { status: 500, error: 'Server error' };
  }

  if (!user) {
    return { status: 403, error: 'Email does not exists' };
  }

  // check password
  if (!isPasswordMatch(password, user.password)) {
    return { status: 403, error: 'Wrong password' };
  }

  return { status: 200, user: user.get() };
}






async function thirdLogin(token, provider) {

  if (!token) {
    return { status: 400, error: 'Please provide token.' };
  }

  const url = 'https://graph.facebook.com/me?fields=id,name,email&access_token=' + token;

  const data_third = await fetch(url)
    .then(res => res.json());

  const { name, email, error } = data_third;

  if (error) {
    return { status: 400, error: error.message };
  }

  if (!name || !email) {
    return { status: 400, error: 'Please authorize name and email.' };
  }

  let user;
  try {
    user = await User.findOne({ where: { email } });
  } catch (err) {
    return { status: 500, error: 'Server error' };
  }

  if (!user) {
    // if user does not exist, create one
    try {
      // create random password for creating user
      const password = hash_with_salt(Math.random().toString(36).split('.')[1]);
      user = await User.create({ name, email, password, provider });
    } catch (err) {
      return { status: 500, error: 'Server error' };
    }
  }

  return { status: 200, user: user.get() };

}






function hash_with_salt(password) {
  const random_salt = Math.random().toString(36).split('.')[1];

  // easy method, directly add to the last position
  const password_add_salt = password + random_salt;

  const hash_password = crypto
    .createHash('sha256')
    .update(password_add_salt)
    .digest('hex');

  return `${random_salt}.${hash_password}`;
}



function isPasswordMatch(raw, hash) {
  const salt = hash.split('.')[0];

  const raw_hash = crypto
    .createHash('sha256')
    .update(raw + salt)
    .digest('hex');

  return salt + '.' + raw_hash === hash;
}




function getJWT(data) {
  // JWT Hmac SHA256

  // header
  const header = Buffer.from(JSON.stringify({
    alg: 'HS256',
    typ: 'JWT'
  })).toString('base64');

  // payload
  // add exp time 60 mins
  data.exp = Date.now() + 1000 * 3600;
  const payload = Buffer.from(JSON.stringify(data)).toString('base64');

  // signature
  const signature = crypto.createHmac('sha256', process.env.JWT_secret).update(`${header}.${payload}`).digest('base64');

  return `${header}.${payload}.${signature}`;
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