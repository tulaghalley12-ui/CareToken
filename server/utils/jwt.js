const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'replace_with_a_secure_random_secret') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be configured with a secure key in production');
    }
    return 'default_hospital_dev_secret_key_change_in_prod';
  }
  return secret;
};

const generateToken = (payload, expiresIn = '24h') => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn });
};

const verifyToken = (token) => {
  return jwt.verify(token, getJwtSecret());
};

module.exports = {
  generateToken,
  verifyToken
};
