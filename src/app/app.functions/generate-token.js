const jwt = require('jsonwebtoken');

exports.main = async (context) => {
  try {
    const { dealId } = context.parameters;
    
    const token = jwt.sign({ dealId }, process.env.JWT_SECRET, { 
      expiresIn: '1h',
      algorithm: 'HS256'
    });
    
    return token;
  } catch (error) {
    console.error('JWT generation error:', error);
    throw error;
  }
}