import React, { useState } from "react";
import {
  Button,
  Flex,
  Box,
  Heading,
  Text,
  Alert,
} from "@hubspot/ui-extensions";
import { hubspot } from "@hubspot/ui-extensions";

hubspot.extend(({ context, runServerlessFunction, actions }) => (
  <PropertyManagementCard
    context={context}
    runServerless={runServerlessFunction}
    actions={actions}
  />
));

const PropertyManagementCard = ({ context, runServerless, actions }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null); // デバッグ用（後で削除）

  const portalId = context.portal.id;
  const objectId = context.crm.objectId;
  const objectType = context.crm.objectType || 'deals'; // デフォルトでdealsを設定
  
  const handleOpenPropertyManagement = async () => {
    setLoading(true);
    setError(null);

    try {
      
      const tokenResponse = await runServerless({
        name: "generate-token",
        parameters: { 
          dealId: objectId  // サーバーレス関数内ではdealIdとして処理
        },
      });

      if (tokenResponse.status === "SUCCESS") {
        const token = tokenResponse.response;
        
        // デバッグ用：JWT_SECRETの情報を取得（後で削除）
        const debugResponse = await runServerless({
          name: "generate-token",
          parameters: { 
            dealId: objectId,
            debug: true  // デバッグモードフラグ
          },
        });
        
        if (debugResponse.status === "SUCCESS" && debugResponse.response.debugInfo) {
          setDebugInfo(debugResponse.response.debugInfo);
        }
        
        const isSandbox = portalId === 45016714;
        const baseUrl = isSandbox 
          ? "https://property-mgmt-xi.vercel.app"  // Vercel preview links will be used for sandbox
          : "https://property-mgmt-xi.vercel.app";
        
        // URLパラメータを構築
        // 現在は特定の部屋（deal）のみ指定
        // 将来的に建物での絞り込みが必要な場合は ?building=<建物ID> を使用
        const url = `${baseUrl}?deal=${objectId}&token=${token}`;

        // HubSpot iframeモーダルのエラー回避のため、少し遅延を入れる
        setTimeout(() => {
          try {
            actions.openIframeModal({
              uri: url,
              height: 1440,
              width: 1440,
              title: "物件管理システム",
            });
          } catch (modalError) {
            // フォールバック: 新しいタブで開く
            window.open(url, '_blank');
          }
        }, 100);
      } else {
        setError("トークンの生成に失敗しました");
      }
    } catch (err) {
      setError(`エラーが発生しました: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Flex direction="column" gap="medium">
        <Heading>物件管理システム</Heading>
        
        <Text>
          物件の詳細情報を管理・編集するためのシステムです。
          ボタンをクリックして物件管理画面を開いてください。
        </Text>

        {error && (
          <Alert title="エラー" variant="error">
            {error}
          </Alert>
        )}

        {/* デバッグ情報（後で削除） */}
        {debugInfo && (
          <Alert title="デバッグ情報" variant="info">
            <Text>JWT_SECRET長さ: {debugInfo.length}</Text>
            <Text>最初の10文字: {debugInfo.first10}</Text>
            <Text>最後の10文字: {debugInfo.last10}</Text>
            <Text>Base64形式: {debugInfo.isBase64 ? "はい" : "いいえ"}</Text>
          </Alert>
        )}

        <Button
          type="button"
          onClick={handleOpenPropertyManagement}
          disabled={loading}
          variant="primary"
          size="medium"
        >
          {loading ? "読み込み中..." : "物件管理画面を開く"}
        </Button>
      </Flex>
    </Box>
  );
};