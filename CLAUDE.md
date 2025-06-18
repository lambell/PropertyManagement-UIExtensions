# PropertyManagement-UIExtensions

## 概要
HubSpot UI Extensions を使用した物件管理システムです。CRMの取引（Deal）レコードから物件管理画面をiframeで開くことができます。

## プロジェクト構造
```
PropertyManagement-UIExtensions/
├── hsproject.json              # HubSpotプロジェクト設定
├── hubspot.config.yml          # HubSpot認証設定
├── src/app/
│   ├── app.json               # アプリケーション設定
│   ├── extensions/            # UI Extensions
│   │   ├── property-management-card.json    # CRMカード設定
│   │   ├── property-management.jsx          # Reactコンポーネント
│   │   └── package.json                     # 依存関係
│   └── serverless/            # サーバーレス関数
│       ├── serverless.json    # サーバーレス設定
│       ├── generate-token.js  # JWT生成関数
│       └── package.json       # 依存関係
└── CLAUDE.md                  # このドキュメント
```

## 主な機能
1. **CRMカード**: 取引レコードのタブに「物件管理システム」カードを表示
2. **iframeモーダル**: ボタンクリックでVercelホスティングの物件管理画面を開く
3. **JWT認証**: セキュアなトークンベース認証
4. **環境判定**: サンドボックス環境と本番環境の自動切り替え

## 設定手順

### 1. HubSpot設定
`hubspot.config.yml` のアクセスキーを設定:
```yaml
personalAccessKey: >-
  YOUR_ACCESS_KEY_HERE
```

### 2. JWT_SECRET設定
HubSpotのプライベートアプリ設定でJWT_SECRETを環境変数として設定

### 3. Vercelプロジェクト
以下のURLでホスティング:
- 本番: `property-mgmt-xi.vercel.app`
- プレビュー: VercelのプレビューリンクをサンドボックスEnvironmentで使用

## 開発・デプロイ

### ローカル開発
```bash
hs project dev
```

### デプロイ
```bash
hs project deploy
```

## 環境判定
- サンドボックス: Portal ID = 45016714
- 本番: その他のPortal ID

## トークン仕様
- 有効期限: 1時間
- ペイロード: dealId, iat, exp
- URLパラメータ: dealId, token