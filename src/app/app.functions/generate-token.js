const jwt = require('jsonwebtoken');

exports.main = async (context) => {
  try {
    const { dealId, debug } = context.parameters;

    // JWT_SECRETがBase64エンコードされている場合とそうでない場合の両方に対応
    let secret = process.env.JWT_SECRET;
    
    // デバッグモード（後で削除）
    if (debug) {
      const isBase64 = /^[A-Za-z0-9+/]+=*$/.test(secret) && secret.length % 4 === 0;
      
      return {
        debugInfo: {
          length: secret.length,
          first10: secret.substring(0, 10),
          last10: secret.substring(secret.length - 10),
          isBase64: isBase64
        }
      };
    }
    
    const token = jwt.sign({ dealId }, secret, { 
      expiresIn: '1h',
      algorithm: 'HS256'
    });
    
    return token;
  } catch (error) {
    console.error('JWT generation error:', error);
    throw error;
  }
}