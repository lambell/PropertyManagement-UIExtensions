# JWT実装ガイド - Vercelプロジェクト側

## 概要
HubSpot UI ExtensionsからVercelプロジェクトにアクセスする際のJWT認証実装ガイドです。

## 実装要件

### 1. 環境変数の設定
Vercelプロジェクトに以下の環境変数を設定してください：
```
JWT_SECRET=axWUFBq4fganvcuR1hywASePVs27/34R8lw67uWeluM=
```
※ 本番環境では別の強力なランダム文字列を使用してください

### 2. JWT検証の実装

#### 必要なパッケージ
```bash
npm install jsonwebtoken
```

#### 検証ミドルウェアの例（Next.js API Routes）
```javascript
// utils/auth.js
import jwt from 'jsonwebtoken';

export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { valid: true, decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

export function withAuth(handler) {
  return async (req, res) => {
    const token = req.query.token || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }
    
    const { valid, decoded, error } = verifyToken(token);
    
    if (!valid) {
      return res.status(401).json({ error: 'Invalid token', details: error });
    }
    
    // トークンの有効期限をチェック（JWTライブラリが自動でチェックしますが、明示的に）
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    // リクエストにデコードされた情報を追加
    req.auth = decoded;
    
    return handler(req, res);
  };
}
```

#### ページコンポーネントでの実装例（Next.js）
```javascript
// pages/index.js または app/page.js
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function PropertyManagement() {
  const searchParams = useSearchParams();
  const [dealId, setDealId] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = searchParams.get('token');
    const dealIdParam = searchParams.get('dealId');
    
    if (!token || !dealIdParam) {
      setAuthError('認証情報が不足しています');
      setLoading(false);
      return;
    }

    // トークンをローカルで検証（オプション）
    // または、APIエンドポイントに送信して検証
    validateToken(token, dealIdParam);
  }, [searchParams]);

  const validateToken = async (token, dealIdParam) => {
    try {
      const response = await fetch(`/api/validate?token=${token}&dealId=${dealIdParam}`);
      
      if (!response.ok) {
        throw new Error('認証に失敗しました');
      }
      
      const data = await response.json();
      setDealId(data.dealId);
      setLoading(false);
    } catch (error) {
      setAuthError(error.message);
      setLoading(false);
    }
  };

  if (loading) return <div>認証中...</div>;
  if (authError) return <div>エラー: {authError}</div>;

  return (
    <div>
      <h1>物件管理システム</h1>
      <p>Deal ID: {dealId}</p>
      {/* ここに物件管理の実装 */}
    </div>
  );
}
```

#### API検証エンドポイントの例
```javascript
// pages/api/validate.js または app/api/validate/route.js
import { verifyToken } from '../../utils/auth';

export default function handler(req, res) {
  const { token, dealId } = req.query;
  
  if (!token || !dealId) {
    return res.status(400).json({ error: 'Token and dealId required' });
  }
  
  const { valid, decoded, error } = verifyToken(token);
  
  if (!valid) {
    return res.status(401).json({ error: 'Invalid token', details: error });
  }
  
  // トークンのdealIdとパラメータのdealIdが一致するか確認
  if (decoded.dealId !== dealId) {
    return res.status(403).json({ error: 'Deal ID mismatch' });
  }
  
  return res.status(200).json({ 
    valid: true, 
    dealId: decoded.dealId,
    // 必要に応じて他の情報も返す
  });
}
```

## トークンのペイロード構造
HubSpot側から送信されるJWTトークンには以下の情報が含まれます：
```javascript
{
  dealId: "123456",        // HubSpotの取引ID
  iat: 1634567890,        // 発行時刻（Unix timestamp）
  exp: 1634571490         // 有効期限（Unix timestamp、発行から1時間後）
}
```

## セキュリティ考慮事項

1. **HTTPS必須**: 本番環境では必ずHTTPS通信を使用
2. **JWT_SECRET管理**: 
   - 十分に長く複雑な文字列を使用（最低32文字推奨）
   - 環境変数として管理し、コードにハードコードしない
   - 定期的な更新を検討
3. **CORS設定**: HubSpotドメインからのアクセスのみ許可
4. **有効期限**: トークンの有効期限（1時間）を厳密にチェック
5. **ペイロード検証**: dealIdの一致を必ず確認

## トラブルシューティング

### よくあるエラーと対処法

1. **"Invalid token"**
   - JWT_SECRETがHubSpot側と一致しているか確認
   - トークンが正しく渡されているか確認

2. **"Token expired"**
   - トークンの有効期限（1時間）が切れている
   - HubSpot側で新しいトークンを生成

3. **"Deal ID mismatch"**
   - URLパラメータのdealIdとトークン内のdealIdが一致しない
   - 正しいdealIdが渡されているか確認

## 実装チェックリスト

- [ ] JWT_SECRET環境変数の設定
- [ ] jsonwebpackageのインストール
- [ ] トークン検証ロジックの実装
- [ ] エラーハンドリングの実装
- [ ] CORS設定の確認
- [ ] HTTPS通信の確認（本番環境）
- [ ] ローカル開発環境でのテスト
- [ ] 本番環境でのテスト