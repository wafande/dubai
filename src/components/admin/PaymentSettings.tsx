import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, DollarSign, Key, Lock, Save, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

interface PaymentGateway {
  id: string;
  name: string;
  isEnabled: boolean;
  apiKey: string;
  secretKey?: string;
  webhookSecret?: string;
  testMode: boolean;
  supportedCurrencies: string[];
  features: {
    refunds: boolean;
    partialPayments: boolean;
    recurringBilling: boolean;
    disputes: boolean;
  };
}

interface PaymentSettings {
  currency: string;
  currencySymbol: string;
  gateways: PaymentGateway[];
  depositPercentage: number;
  refundPolicy: {
    type: 'flexible' | 'moderate' | 'strict';
    deadlineHours: number;
    refundPercentage: number;
  };
  taxSettings: {
    enabled: boolean;
    percentage: number;
    taxNumber: string;
  };
}

const defaultSettings: PaymentSettings = {
  currency: 'AED',
  currencySymbol: 'د.إ',
  depositPercentage: 20,
  refundPolicy: {
    type: 'flexible',
    deadlineHours: 24,
    refundPercentage: 90
  },
  taxSettings: {
    enabled: true,
    percentage: 5,
    taxNumber: ''
  },
  gateways: [
    {
      id: 'stripe',
      name: 'Stripe',
      isEnabled: false,
      apiKey: '',
      secretKey: '',
      webhookSecret: '',
      testMode: true,
      supportedCurrencies: ['AED', 'USD', 'EUR', 'GBP'],
      features: {
        refunds: true,
        partialPayments: true,
        recurringBilling: true,
        disputes: true
      }
    },
    {
      id: 'paypal',
      name: 'PayPal',
      isEnabled: false,
      apiKey: '',
      secretKey: '',
      testMode: true,
      supportedCurrencies: ['AED', 'USD', 'EUR', 'GBP'],
      features: {
        refunds: true,
        partialPayments: true,
        recurringBilling: true,
        disputes: true
      }
    },
    {
      id: 'square',
      name: 'Square',
      isEnabled: false,
      apiKey: '',
      secretKey: '',
      testMode: true,
      supportedCurrencies: ['AED', 'USD'],
      features: {
        refunds: true,
        partialPayments: true,
        recurringBilling: false,
        disputes: true
      }
    },
    {
      id: 'tap',
      name: 'Tap Payments',
      isEnabled: false,
      apiKey: '',
      secretKey: '',
      testMode: true,
      supportedCurrencies: ['AED', 'SAR', 'KWD', 'BHD', 'QAR', 'OMR'],
      features: {
        refunds: true,
        partialPayments: true,
        recurringBilling: false,
        disputes: false
      }
    }
  ]
};

export function PaymentSettings() {
  const [settings, setSettings] = useState<PaymentSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [testConnection, setTestConnection] = useState<Record<string, 'success' | 'error' | 'pending'>>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await axios.get('/api/admin/payment-settings');
      if (response.data) {
        setSettings({
          ...defaultSettings,
          ...response.data,
          taxSettings: {
            ...defaultSettings.taxSettings,
            ...(response.data.taxSettings || {})
          },
          refundPolicy: {
            ...defaultSettings.refundPolicy,
            ...(response.data.refundPolicy || {})
          },
          gateways: response.data.gateways?.map((gateway: PaymentGateway) => ({
            ...defaultSettings.gateways.find(g => g.id === gateway.id),
            ...gateway
          })) || defaultSettings.gateways
        });
      }
    } catch (error) {
      const savedSettings = localStorage.getItem('payment_settings');
      if (savedSettings) {
        try {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings({
            ...defaultSettings,
            ...parsedSettings,
            taxSettings: {
              ...defaultSettings.taxSettings,
              ...(parsedSettings.taxSettings || {})
            },
            refundPolicy: {
              ...defaultSettings.refundPolicy,
              ...(parsedSettings.refundPolicy || {})
            },
            gateways: parsedSettings.gateways?.map((gateway: PaymentGateway) => ({
              ...defaultSettings.gateways.find(g => g.id === gateway.id),
              ...gateway
            })) || defaultSettings.gateways
          });
        } catch {
          setSettings(defaultSettings);
        }
      } else {
        setSettings(defaultSettings);
      }
      toast.error('Failed to load payment settings from server, using local data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-600">Error loading settings. Please try again.</div>
      </div>
    );
  }

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      await axios.post('/api/admin/payment-settings', settings);
      localStorage.setItem('payment_settings', JSON.stringify(settings));
      toast.success('Payment settings saved successfully');
    } catch (error) {
      toast.error('Failed to save payment settings');
    } finally {
      setIsLoading(false);
    }
  };

  const testGatewayConnection = async (gatewayId: string) => {
    setTestConnection(prev => ({ ...prev, [gatewayId]: 'pending' }));
    try {
      await axios.post(`/api/admin/test-gateway/${gatewayId}`, {
        apiKey: settings.gateways.find(g => g.id === gatewayId)?.apiKey,
        secretKey: settings.gateways.find(g => g.id === gatewayId)?.secretKey,
        testMode: settings.gateways.find(g => g.id === gatewayId)?.testMode
      });
      setTestConnection(prev => ({ ...prev, [gatewayId]: 'success' }));
      toast.success(`Successfully connected to ${gatewayId}`);
    } catch (error) {
      setTestConnection(prev => ({ ...prev, [gatewayId]: 'error' }));
      toast.error(`Failed to connect to ${gatewayId}`);
    }
  };

  const toggleGateway = (gatewayId: string) => {
    setSettings(prev => ({
      ...prev,
      gateways: prev.gateways.map(gateway =>
        gateway.id === gatewayId
          ? { ...gateway, isEnabled: !gateway.isEnabled }
          : gateway
      ),
    }));
  };

  const updateGatewayField = (
    gatewayId: string,
    field: keyof PaymentGateway,
    value: string | boolean
  ) => {
    setSettings(prev => ({
      ...prev,
      gateways: prev.gateways.map(gateway =>
        gateway.id === gatewayId ? { ...gateway, [field]: value } : gateway
      ),
    }));
  };

  const toggleSecretVisibility = (gatewayId: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [gatewayId]: !prev[gatewayId],
    }));
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Payment Settings</h2>
        <button
          onClick={handleSaveSettings}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </button>
      </div>

      {/* General Payment Settings */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Currency</label>
            <select
              value={settings.currency}
              onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
            >
              <option value="AED">AED - UAE Dirham</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Deposit Percentage</label>
            <input
              type="number"
              min="0"
              max="100"
              value={settings.depositPercentage}
              onChange={(e) => setSettings(prev => ({ ...prev, depositPercentage: Number(e.target.value) }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Tax Settings */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tax Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={settings.taxSettings.enabled}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                taxSettings: { ...prev.taxSettings, enabled: e.target.checked }
              }))}
              className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">Enable Tax</label>
          </div>
          {settings.taxSettings.enabled && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tax Percentage</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.taxSettings.percentage}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    taxSettings: { ...prev.taxSettings, percentage: Number(e.target.value) }
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tax Registration Number</label>
                <input
                  type="text"
                  value={settings.taxSettings.taxNumber}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    taxSettings: { ...prev.taxSettings, taxNumber: e.target.value }
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Refund Policy */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Refund Policy</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Policy Type</label>
            <select
              value={settings.refundPolicy.type}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                refundPolicy: { ...prev.refundPolicy, type: e.target.value as 'flexible' | 'moderate' | 'strict' }
              }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
            >
              <option value="flexible">Flexible (Full refund up to 24h before)</option>
              <option value="moderate">Moderate (50% refund up to 48h before)</option>
              <option value="strict">Strict (No refund)</option>
            </select>
          </div>
          {settings.refundPolicy.type !== 'strict' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Refund Deadline (hours before booking)</label>
                <input
                  type="number"
                  min="0"
                  value={settings.refundPolicy.deadlineHours}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    refundPolicy: { ...prev.refundPolicy, deadlineHours: Number(e.target.value) }
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Refund Percentage</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.refundPolicy.refundPercentage}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    refundPolicy: { ...prev.refundPolicy, refundPercentage: Number(e.target.value) }
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Payment Gateways */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Payment Gateways</h3>
        {settings.gateways.map((gateway) => (
          <motion.div
            key={gateway.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 p-4 rounded-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <CreditCard className={`h-5 w-5 ${gateway.isEnabled ? 'text-amber-600' : 'text-gray-400'}`} />
                <h4 className="text-lg font-medium text-gray-900">{gateway.name}</h4>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => testGatewayConnection(gateway.id)}
                  disabled={!gateway.isEnabled || !gateway.apiKey || !gateway.secretKey}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-amber-700 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
                >
                  Test Connection
                  {testConnection[gateway.id] === 'pending' && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-700 ml-2" />
                  )}
                  {testConnection[gateway.id] === 'success' && (
                    <span className="ml-2 text-green-600">✓</span>
                  )}
                  {testConnection[gateway.id] === 'error' && (
                    <AlertTriangle className="ml-2 h-4 w-4 text-red-500" />
                  )}
                </button>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gateway.isEnabled}
                    onChange={() => toggleGateway(gateway.id)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>
            </div>

            {gateway.isEnabled && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">API Key</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type={showSecrets[gateway.id] ? 'text' : 'password'}
                      value={gateway.apiKey}
                      onChange={(e) => updateGatewayField(gateway.id, 'apiKey', e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                      placeholder={`Enter ${gateway.name} API key`}
                    />
                    <button
                      type="button"
                      onClick={() => toggleSecretVisibility(gateway.id)}
                      className="absolute inset-y-0 right-0 px-3 flex items-center"
                    >
                      <Lock className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </div>

                {gateway.secretKey !== undefined && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Secret Key</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type={showSecrets[gateway.id] ? 'text' : 'password'}
                        value={gateway.secretKey}
                        onChange={(e) => updateGatewayField(gateway.id, 'secretKey', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                        placeholder={`Enter ${gateway.name} secret key`}
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecretVisibility(gateway.id)}
                        className="absolute inset-y-0 right-0 px-3 flex items-center"
                      >
                        <Lock className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                )}

                {gateway.webhookSecret !== undefined && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Webhook Secret</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type={showSecrets[gateway.id] ? 'text' : 'password'}
                        value={gateway.webhookSecret}
                        onChange={(e) => updateGatewayField(gateway.id, 'webhookSecret', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                        placeholder={`Enter ${gateway.name} webhook secret`}
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecretVisibility(gateway.id)}
                        className="absolute inset-y-0 right-0 px-3 flex items-center"
                      >
                        <Lock className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gateway.testMode}
                      onChange={(e) => updateGatewayField(gateway.id, 'testMode', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-700">Test Mode</span>
                  </label>
                </div>

                <div className="mt-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Supported Features</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(gateway.features).map(([feature, supported]) => (
                      <div key={feature} className={`flex items-center ${supported ? 'text-green-600' : 'text-gray-400'}`}>
                        <span className="mr-2">{supported ? '✓' : '×'}</span>
                        <span className="capitalize">{feature.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
} 