import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, CreditCard, Calendar, Star, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import type { UserProfile as UserProfileType } from '../types/user';
import { BookingList } from '../components/admin/BookingList';
import toast from 'react-hot-toast';

export function UserProfile() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [activeTab, setActiveTab] = useState<'bookings' | 'reviews' | 'settings'>('bookings');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const data = await userService.getUserProfile(user!.id);
      setProfile(data);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePreferences = async (preferences: UserProfileType['preferences']) => {
    try {
      await userService.updateUserPreferences(user!.id, preferences);
      toast.success('Preferences updated successfully');
      loadProfile();
    } catch (error) {
      toast.error('Failed to update preferences');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await userService.updateUserAvatar(user!.id, reader.result as string);
        toast.success('Avatar updated successfully');
        loadProfile();
      } catch (error) {
        toast.error('Failed to update avatar');
      }
    };
    reader.readAsDataURL(file);
  };

  if (isLoading || !profile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <img
                  src={profile.avatar || 'https://via.placeholder.com/150'}
                  alt={profile.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
                <label className="absolute bottom-0 right-0 bg-amber-500 p-1 rounded-full cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                  <Settings className="w-4 h-4 text-white" />
                </label>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                <p className="text-gray-600">{profile.email}</p>
              </div>
            </div>

            <div className="mt-8 border-t pt-8">
              <div className="flex space-x-8 border-b">
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`pb-4 ${
                    activeTab === 'bookings'
                      ? 'border-b-2 border-amber-500 text-amber-600'
                      : 'text-gray-500'
                  }`}
                >
                  <Calendar className="inline-block w-5 h-5 mr-2" />
                  Bookings
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-4 ${
                    activeTab === 'reviews'
                      ? 'border-b-2 border-amber-500 text-amber-600'
                      : 'text-gray-500'
                  }`}
                >
                  <Star className="inline-block w-5 h-5 mr-2" />
                  Reviews
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`pb-4 ${
                    activeTab === 'settings'
                      ? 'border-b-2 border-amber-500 text-amber-600'
                      : 'text-gray-500'
                  }`}
                >
                  <Settings className="inline-block w-5 h-5 mr-2" />
                  Settings
                </button>
              </div>

              <div className="mt-8">
                {activeTab === 'bookings' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-amber-50 p-6 rounded-lg">
                        <h3 className="text-lg font-medium text-amber-900">
                          Total Bookings
                        </h3>
                        <p className="text-3xl font-bold text-amber-600">
                          {profile.bookings.total}
                        </p>
                      </div>
                      <div className="bg-green-50 p-6 rounded-lg">
                        <h3 className="text-lg font-medium text-green-900">
                          Upcoming
                        </h3>
                        <p className="text-3xl font-bold text-green-600">
                          {profile.bookings.upcoming}
                        </p>
                      </div>
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <h3 className="text-lg font-medium text-blue-900">
                          Completed
                        </h3>
                        <p className="text-3xl font-bold text-blue-600">
                          {profile.bookings.completed}
                        </p>
                      </div>
                    </div>
                    <BookingList />
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            Your Reviews
                          </h3>
                          <p className="text-gray-600">
                            Total Reviews: {profile.reviews.total}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                          <span className="ml-1 text-lg font-medium">
                            {profile.reviews.averageRating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Add ReviewList component here */}
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Preferences
                      </h3>
                      <div className="space-y-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={profile.preferences?.notifications}
                            onChange={(e) =>
                              handleUpdatePreferences({
                                ...profile.preferences,
                                notifications: e.target.checked,
                              })
                            }
                            className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                          />
                          <span className="ml-2 text-gray-700">
                            Email Notifications
                          </span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={profile.preferences?.newsletter}
                            onChange={(e) =>
                              handleUpdatePreferences({
                                ...profile.preferences,
                                newsletter: e.target.checked,
                              })
                            }
                            className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                          />
                          <span className="ml-2 text-gray-700">
                            Subscribe to Newsletter
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Account
                      </h3>
                      <button
                        onClick={logout}
                        className="flex items-center text-red-600 hover:text-red-700"
                      >
                        <LogOut className="w-5 h-5 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 