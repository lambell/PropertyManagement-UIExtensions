const jwt = require('jsonwebtoken');

exports.main = async (context = {}) => {
  const { dealId } = context.parameters;
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return {
      statusCode: 500,
      body: { error: 'JWT_SECRET is not configured' }
    };
  }

  if (!dealId) {
    return {
      statusCode: 400,
      body: { error: 'dealId is required' }
    };
  }

  try {
    const payload = {
      dealId: dealId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiration
    };

    const token = jwt.sign(payload, jwtSecret);

    return {
      statusCode: 200,
      body: token
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: { error: 'Failed to generate token' }
    };
  }
};