import React from 'react';
import {
  Alert,
  Box,
  Button,
  Flex,
  LoadingSpinner,
  Text,
  Panel,
  Statistics,
  StatisticsItem,
  hubspot
} from '@hubspot/ui-extensions';

// Define the property types and their configuration
const PROPERTY_TYPES = {
  development: { 
    label: '開発プロジェクト', 
    properties: ['lot_purchase_price', 'construction_cost', 'development_fee'] 
  },
  detached: { 
    label: '戸建プロジェクト', 
    properties: ['purchase_price', 'renovation_cost', 'selling_cost'] 
  },
  apartment: { 
    label: '区分プロジェクト', 
    properties: ['unit_price', 'repair_cost', 'management_fee'] 
  }
};

const PropertyManagement = () => {
  const [loading, setLoading] = React.useState(true);
  const [propertyData, setPropertyData] = React.useState(null);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    // Fetch contact properties when component mounts
    const fetchContactData = async () => {
      try {
        setLoading(true);
        
        // Get current contact ID from context
        const context = await hubspot.getDataFromCrm();
        const contactId = context.hs_object_id;
        
        if (!contactId) {
          throw new Error('Contact ID not found');
        }

        // Fetch contact properties
        const response = await hubspot.fetchCrmObjectProperties(
          'contacts',
          contactId,
          ['property_type', 'project_status', ...Object.values(PROPERTY_TYPES).flatMap(type => type.properties)]
        );

        setPropertyData(response);
      } catch (err) {
        console.error('Error fetching contact data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContactData();
  }, []);

  if (loading) {
    return (
      <Panel>
        <Flex direction="column" align="center" justify="center" gap="md">
          <LoadingSpinner label="データを読み込み中..." />
        </Flex>
      </Panel>
    );
  }

  if (error) {
    return (
      <Panel>
        <Alert title="エラー" variant="error">
          {error}
        </Alert>
      </Panel>
    );
  }

  const propertyType = propertyData?.property_type;
  const currentConfig = PROPERTY_TYPES[propertyType];

  if (!currentConfig) {
    return (
      <Panel>
        <Alert title="物件タイプが設定されていません" variant="warning">
          この連絡先には物件タイプが設定されていません。物件タイプを設定してください。
        </Alert>
      </Panel>
    );
  }

  const renderStatistics = () => {
    return (
      <Statistics>
        {currentConfig.properties.map(property => {
          const value = propertyData?.[property];
          return (
            <StatisticsItem
              key={property}
              label={property.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              number={value ? `¥${Number(value).toLocaleString()}` : '未設定'}
            />
          );
        })}
      </Statistics>
    );
  };

  return (
    <Panel>
      <Flex direction="column" gap="md">
        <Box>
          <Text format={{ fontWeight: "bold", fontSize: "lg" }}>
            {currentConfig.label}
          </Text>
          <Text>
            ステータス: {propertyData?.project_status || '未設定'}
          </Text>
        </Box>
        
        {renderStatistics()}

        <Flex gap="sm">
          <Button 
            variant="primary"
            onClick={() => {
              // Open property update form
              hubspot.openCrmRecord({
                objectType: 'contacts',
                objectId: propertyData.hs_object_id
              });
            }}
          >
            プロパティを編集
          </Button>
          
          <Button 
            variant="secondary"
            onClick={() => {
              // Generate property report
              console.log('Generate report for:', propertyData);
            }}
          >
            レポート生成
          </Button>
        </Flex>
      </Flex>
    </Panel>
  );
};

export default PropertyManagement;