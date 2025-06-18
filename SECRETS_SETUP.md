# HubSpot UI Extensions - Secrets設定手順

## JWT_SECRET の設定方法

### 方法1: HubSpot CLIを使用（推奨）

```bash
# プロジェクトディレクトリで実行
hs secrets add JWT_SECRET

# プロンプトが表示されたら、以下の値を入力:
# axWUFBq4fganvcuR1hywASePVs27/34R8lw67uWeluM=
```

### 方法2: hubspot.config.ymlに追加

```yaml
defaultPortal: '1'
portals:
  - name: '1'
    portalId: 45016714
    # ... 他の設定 ...
    secrets:
      - name: JWT_SECRET
        value: axWUFBq4fganvcuR1hywASePVs27/34R8lw67uWeluM=
```

### 方法3: HubSpotのプライベートアプリ設定画面から

1. HubSpotアカウントにログイン
2. 設定 > 統合 > プライベートアプリ
3. 該当のアプリを選択
4. 「Serverless Functions」タブ
5. 「Environment variables」セクション
6. 「Add secret」をクリック
7. 以下を入力:
   - Name: `JWT_SECRET`
   - Value: `axWUFBq4fganvcuR1hywASePVs27/34R8lw67uWeluM=`

## 確認方法

設定後、以下のコマンドで確認できます：

```bash
hs secrets list
```

## 重要な注意事項

1. **本番環境では必ず別のJWT_SECRETを生成してください**
   - 現在の値は開発用です
   - 本番用の強力なランダム文字列を生成してください

2. **JWT_SECRET生成方法（本番用）**
   ```bash
   # Node.jsで生成
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   
   # またはOpenSSLで生成
   openssl rand -base64 32
   ```

3. **Vercel側にも同じJWT_SECRETを設定**
   - Vercelダッシュボード > Settings > Environment Variables
   - または `.env.local` ファイル（開発環境）

## トラブルシューティング

- エラー「JWT_SECRET is not configured」が出る場合
  - `hs project deploy` でデプロイし直す
  - Secretsが正しく設定されているか確認

- トークン検証エラーが出る場合
  - HubSpot側とVercel側のJWT_SECRETが一致しているか確認
  - 値の前後に余分なスペースがないか確認