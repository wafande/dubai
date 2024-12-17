import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Calendar, Star, CreditCard } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import type { Notification } from '../types/notification';
import { useAuth } from '../context/AuthContext';

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadNotifications();
      const unsubscribe = notificationService.subscribe(handleNewNotification);
      return unsubscribe;
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    
    const [userNotifications, count] = await Promise.all([
      notificationService.getNotificationsByUser(user.id),
      notificationService.getUnreadCount(user.id),
    ]);
    
    setNotifications(userNotifications);
    setUnreadCount(count);
  };

  const handleNewNotification = (notification: Notification) => {
    if (notification.userId === user?.id) {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await notificationService.markAsRead(notificationId);
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    await notificationService.markAllAsRead(user.id);
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
    setUnreadCount(0);
  };

  const handleClearAll = async () => {
    if (!user) return;
    await notificationService.clearAllNotifications(user.id);
    setNotifications([]);
    setUnreadCount(0);
    setIsOpen(false);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'booking_confirmed':
      case 'booking_cancelled':
        return <Calendar className="w-5 h-5" />;
      case 'review_posted':
        return <Star className="w-5 h-5" />;
      case 'payment_received':
        return <CreditCard className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-25"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50"
            >
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Notifications
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleClearAll}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No notifications
                  </div>
                ) : (
                  notifications.map(notification => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 border-b hover:bg-gray-50 ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 ${
                          !notification.read ? 'text-blue-500' : 'text-gray-400'
                        }`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="ml-3 flex-1">
                          <p className={`text-sm font-medium ${
                            !notification.read ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </p>
                          <p className={`mt-1 text-sm ${
                            !notification.read ? 'text-blue-700' : 'text-gray-500'
                          }`}>
                            {notification.message}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
} 