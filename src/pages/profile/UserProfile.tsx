import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { UserProfile as IUserProfile } from '../../types/user';

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<IUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'bookings' | 'preferences'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      try {
        const userProfile = await userService.getUserProfile(user.id);
        if (userProfile) {
          setProfile(userProfile);
          setFormData({
            name: userProfile.name,
            email: userProfile.email,
            phone: userProfile.phone || '',
          });
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const updatedUser = await userService.updateUserProfile(user.id, formData);
      setProfile(prev => prev ? { ...prev, ...updatedUser } : null);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                User Profile
              </h3>
              {activeTab === 'profile' && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  Edit Profile
                </button>
              )}
            </div>
            <div className="mt-4 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {(['profile', 'bookings', 'preferences'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`
                      whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                      ${
                        activeTab === tab
                          ? 'border-teal-500 text-teal-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className="px-4 py-5 sm:p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                      />
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Name</h4>
                      <p className="mt-1 text-sm text-gray-900">{profile?.name}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Email</h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {profile?.email}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {profile?.phone || 'Not provided'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'bookings' && profile && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Booking Statistics
                  </h4>
                  <dl className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Bookings
                      </dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">
                        {profile.bookings.total}
                      </dd>
                    </div>
                    <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Upcoming Bookings
                      </dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">
                        {profile.bookings.upcoming}
                      </dd>
                    </div>
                    <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Completed Bookings
                      </dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">
                        {profile.bookings.completed}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && profile && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Notification Preferences
                  </h4>
                  <div className="mt-2 space-y-4">
                    <div className="flex items-center">
                      <input
                        id="notifications"
                        name="notifications"
                        type="checkbox"
                        checked={profile.preferences?.notifications}
                        onChange={async (e) => {
                          if (user) {
                            await userService.updateUserPreferences(user.id, {
                              ...profile.preferences,
                              notifications: e.target.checked,
                            });
                          }
                        }}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="notifications"
                        className="ml-3 text-sm text-gray-700"
                      >
                        Receive email notifications
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="newsletter"
                        name="newsletter"
                        type="checkbox"
                        checked={profile.preferences?.newsletter}
                        onChange={async (e) => {
                          if (user) {
                            await userService.updateUserPreferences(user.id, {
                              ...profile.preferences,
                              newsletter: e.target.checked,
                            });
                          }
                        }}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="newsletter"
                        className="ml-3 text-sm text-gray-700"
                      >
                        Subscribe to newsletter
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="language"
                    className="block text-sm font-medium text-gray-500"
                  >
                    Language
                  </label>
                  <select
                    id="language"
                    name="language"
                    aria-label="Select language"
                    value={profile.preferences?.language || 'en'}
                    onChange={async (e) => {
                      if (user) {
                        await userService.updateUserPreferences(user.id, {
                          ...profile.preferences,
                          language: e.target.value,
                        });
                      }
                    }}
                    className="mt-2 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
                  >
                    <option value="en">English</option>
                    <option value="ar">Arabic</option>
                    <option value="fr">French</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 