import { useState } from 'react';
import {
  Save,
  Bell,
  DollarSign,
  Clock,
  Globe,
  Shield,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';

export function Settings() {
  const [settings, setSettings] = useState({
    notifications: {
      emailAlerts: true,
      bookingNotifications: true,
      marketingEmails: false,
      smsAlerts: false,
      pushNotifications: true,
      reminderHours: 24
    },
    booking: {
      advanceBookingDays: 30,
      cancellationHours: 24,
      depositPercentage: 20,
      minGroupSize: 1,
      maxGroupSize: 10,
      allowInstantBooking: true,
      requirePhoneNumber: true
    },
    payment: {
      currency: 'USD',
      taxRate: 5,
      depositRequired: true,
      acceptedMethods: {
        creditCard: true,
        paypal: true,
        bankTransfer: false,
        crypto: false
      },
      refundPolicy: 'flexible'
    },
    localization: {
      defaultLanguage: 'en',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      timezone: 'UTC',
      currencies: ['USD', 'EUR', 'AED']
    },
    security: {
      requireEmailVerification: true,
      twoFactorAuth: false,
      passwordExpiration: 90,
      sessionTimeout: 30,
      ipWhitelist: []
    },
    media: {
      maxFileSize: 5,
      allowedTypes: ['image/jpeg', 'image/png'],
      optimizeImages: true,
      storageProvider: 'local'
    },
    communication: {
      emailProvider: 'smtp',
      smsProvider: 'twilio',
      chatEnabled: true,
      supportEmail: 'support@example.com'
    }
  });

  const handleSaveSettings = () => {
    // TODO: Implement settings save logic
    console.log('Saving settings:', settings);
    toast.success('Settings saved successfully');
  };

  const renderToggle = (
    section: keyof typeof settings,
    key: string,
    label: string,
    description?: string
  ) => {
    const value = settings[section][key as keyof typeof settings[typeof section]];
    return (
      <label className="flex items-center justify-between py-3 border-b border-gray-200">
        <div className="space-y-1">
          <span className="text-gray-700 font-medium">{label}</span>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
        <input
          type="checkbox"
          checked={value}
          onChange={(e) =>
            setSettings({
              ...settings,
              [section]: {
                ...settings[section as keyof typeof settings],
                [key]: e.target.checked
              }
            })
          }
          className="form-checkbox h-5 w-5 text-amber-600 rounded focus:ring-amber-500"
        />
      </label>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <button
          onClick={handleSaveSettings}
          className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-4">
              <Bell className="w-5 h-5 text-gray-500 mr-2" />
              <h2 className="text-lg font-medium">Notifications</h2>
            </div>
            <div className="space-y-4">
              {renderToggle(
                'notifications',
                'emailAlerts',
                'Email Alerts',
                'Receive booking and system notifications via email'
              )}
              {renderToggle(
                'notifications',
                'smsAlerts',
                'SMS Alerts',
                'Receive important updates via SMS'
              )}
              {renderToggle(
                'notifications',
                'pushNotifications',
                'Push Notifications',
                'Enable browser push notifications'
              )}
              <div>
                <label htmlFor="reminder-hours" className="block text-sm font-medium text-gray-700">
                  Reminder Hours Before Tour
                </label>
                <input
                  id="reminder-hours"
                  type="number"
                  title="Set reminder hours"
                  placeholder="Enter hours"
                  value={settings.notifications.reminderHours}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        reminderHours: parseInt(e.target.value)
                      }
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-4">
              <Clock className="w-5 h-5 text-gray-500 mr-2" />
              <h2 className="text-lg font-medium">Booking Settings</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="advance-booking" className="block text-sm font-medium text-gray-700">
                  Advance Booking Days
                </label>
                <input
                  id="advance-booking"
                  type="number"
                  title="Set advance booking days"
                  placeholder="Enter days"
                  value={settings.booking.advanceBookingDays}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      booking: {
                        ...settings.booking,
                        advanceBookingDays: parseInt(e.target.value)
                      }
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
              {renderToggle(
                'booking',
                'allowInstantBooking',
                'Allow Instant Booking',
                'Enable customers to book without admin approval'
              )}
              {renderToggle(
                'booking',
                'requirePhoneNumber',
                'Require Phone Number',
                'Make phone number mandatory for bookings'
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-4">
              <Shield className="w-5 h-5 text-gray-500 mr-2" />
              <h2 className="text-lg font-medium">Security</h2>
            </div>
            <div className="space-y-4">
              {renderToggle(
                'security',
                'requireEmailVerification',
                'Email Verification',
                'Require email verification for new accounts'
              )}
              {renderToggle(
                'security',
                'twoFactorAuth',
                'Two-Factor Authentication',
                'Enable 2FA for admin accounts'
              )}
              <div>
                <label htmlFor="session-timeout" className="block text-sm font-medium text-gray-700">
                  Session Timeout (minutes)
                </label>
                <input
                  id="session-timeout"
                  type="number"
                  title="Set session timeout"
                  placeholder="Enter minutes"
                  value={settings.security.sessionTimeout}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      security: {
                        ...settings.security,
                        sessionTimeout: parseInt(e.target.value)
                      }
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-4">
              <DollarSign className="w-5 h-5 text-gray-500 mr-2" />
              <h2 className="text-lg font-medium">Payment Settings</h2>
            </div>
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Currency</span>
                <select
                  value={settings.payment.currency}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      payment: {
                        ...settings.payment,
                        currency: e.target.value
                      }
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="AED">AED (د.إ)</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Refund Policy</span>
                <select
                  value={settings.payment.refundPolicy}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      payment: {
                        ...settings.payment,
                        refundPolicy: e.target.value
                      }
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                >
                  <option value="flexible">Flexible</option>
                  <option value="moderate">Moderate</option>
                  <option value="strict">Strict</option>
                </select>
              </label>
              {renderToggle(
                'payment',
                'depositRequired',
                'Require Deposit',
                'Require upfront deposit for bookings'
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-4">
              <Globe className="w-5 h-5 text-gray-500 mr-2" />
              <h2 className="text-lg font-medium">Localization</h2>
            </div>
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Default Language</span>
                <select
                  value={settings.localization.defaultLanguage}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      localization: {
                        ...settings.localization,
                        defaultLanguage: e.target.value
                      }
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                >
                  <option value="en">English</option>
                  <option value="ar">Arabic</option>
                  <option value="fr">French</option>
                  <option value="es">Spanish</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Time Format</span>
                <select
                  value={settings.localization.timeFormat}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      localization: {
                        ...settings.localization,
                        timeFormat: e.target.value
                      }
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                >
                  <option value="12h">12-hour</option>
                  <option value="24h">24-hour</option>
                </select>
              </label>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-4">
              <MessageSquare className="w-5 h-5 text-gray-500 mr-2" />
              <h2 className="text-lg font-medium">Communication</h2>
            </div>
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Support Email</span>
                <input
                  type="email"
                  value={settings.communication.supportEmail}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      communication: {
                        ...settings.communication,
                        supportEmail: e.target.value
                      }
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </label>
              {renderToggle(
                'communication',
                'chatEnabled',
                'Enable Live Chat',
                'Allow customers to chat with support'
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 