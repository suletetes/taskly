import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BellIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useNotification } from '../../context/NotificationContext';
import NotificationItem from './NotificationItem';

const NotificationBell = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotification();

  // Fetch unread count on mount
  useEffect(() => {
    fetchUnreadCount();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Fetch full notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification) => {
    setIsOpen(false);
    navigate('/settings?tab=notifications');
  };

  const handleViewAll = () => {
    setIsOpen(false);
    navigate('/settings?tab=notifications');
  };

  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-secondary-600 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-secondary-100 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
        aria-label="Notifications"
      >
        <BellIcon className="w-6 h-6" />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed lg:absolute right-4 lg:right-0 top-16 lg:top-auto lg:mt-2 w-80 sm:w-96 bg-white dark:bg-secondary-800 rounded-lg shadow-xl border border-secondary-200 dark:border-secondary-700 overflow-hidden z-[100]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-secondary-200 dark:border-secondary-700">
              <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center space-x-1 text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  <CheckIcon className="w-3 h-3" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500" />
                </div>
              ) : recentNotifications.length > 0 ? (
                <div>
                  {recentNotifications.map((notification) => (
                    <NotificationItem
                      key={notification._id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onDelete={deleteNotification}
                      onClick={handleNotificationClick}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-secondary-500 dark:text-secondary-400">
                  <BellIcon className="w-10 h-10 mb-2 opacity-50" />
                  <p className="text-sm">No notifications</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-secondary-200 dark:border-secondary-700">
                <button
                  onClick={handleViewAll}
                  className="w-full px-4 py-3 text-sm text-center text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors"
                >
                  View all notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
