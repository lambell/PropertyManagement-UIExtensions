const jwt = require('jsonwebtoken');

exports.main = async (context) => {
  try {
    console.log('Generating token for context:', context);
    const { dealId } = context.parameters;

    const token = jwt.sign({ dealId }, process.env.JWT_SECRET, { 
      expiresIn: '1h',
      algorithm: 'HS256'
    });
    
    console.log('Generated token for dealId:', dealId);
    
    // 直接tokenを返す
    return {
      token
    };
  } catch (error) {
    console.error('Token generation error:', error);
    throw error;
  }
}