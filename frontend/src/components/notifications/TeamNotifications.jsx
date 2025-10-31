import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BellIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  UserPlusIcon,
  ChatBubbleLeftIcon,
  FlagIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useTeam } from '../../context/TeamContext';
import { useProject } from '../../context/ProjectContext';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import { formatDistanceToNow } from 'date-fns';

const TeamNotifications = ({ 
  teamId, 
  projectId, 
  onNotificationClick,
  maxNotifications = 10 
}) => {
  const { user } = useAuth();
  const { 
    notifications: teamNotifications, 
    markNotificationAsRead: markTeamNotificationAsRead,
    fetchNotifications: fetchTeamNotifications 
  } = useTeam();
  const { 
    notifications: projectNotifications, 
    markNotificationAsRead: markProjectNotificationAsRead,
    fetchNotifications: fetchProjectNotifications 
  } = useProject();

  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'mentions', 'assignments'
  const [isExpanded, setIsExpanded] = useState(false);

  // Combine and sort notifications
  useEffect(() => {
    let allNotifications = [];
    
    if (teamId && teamNotifications) {
      allNotifications = [...allNotifications, ...teamNotifications];
    }
    
    if (projectId && projectNotifications) {
      allNotifications = [...allNotifications, ...projectNotifications];
    }
    
    // Sort by creation date (newest first)
    allNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Apply filters
    let filteredNotifications = allNotifications;
    
    switch (filter) {
      case 'unread':
        filteredNotifications = allNotifications.filter(n => !n.read);
        break;
      case 'mentions':
        filteredNotifications = allNotifications.filter(n => n.type === 'mention');
        break;
      case 'assignments':
        filteredNotifications = allNotifications.filter(n => n.type === 'task_assigned');
        break;
      default:
        break;
    }
    
    // Limit to max notifications
    setNotifications(filteredNotifications.slice(0, maxNotifications));
  }, [teamNotifications, projectNotifications, filter, maxNotifications, teamId, projectId]);

  // Fetch notifications on mount
  useEffect(() => {
    if (teamId) {
      fetchTeamNotifications(teamId);
    }
    if (projectId) {
      fetchProjectNotifications(projectId);
    }
  }, [teamId, projectId, fetchTeamNotifications, fetchProjectNotifications]);

  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.read) {
      if (notification.teamId) {
        markTeamNotificationAsRead(notification._id);
      } else if (notification.projectId) {
        markProjectNotificationAsRead(notification._id);
      }
    }
    
    // Call external handler
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  const handleMarkAllAsRead = () => {
    notifications
      .filter(n => !n.read)
      .forEach(notification => {
        if (notification.teamId) {
          markTeamNotificationAsRead(notification._id);
        } else if (notification.projectId) {
          markProjectNotificationAsRead(notification._id);
        }
      });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_assigned':
        return FlagIcon;
      case 'task_completed':
        return CheckIcon;
      case 'task_overdue':
        return ExclamationTriangleIcon;
      case 'comment_added':
        return ChatBubbleLeftIcon;
      case 'mention':
        return ChatBubbleLeftIcon;
      case 'member_joined':
        return UserPlusIcon;
      case 'project_created':
        return FlagIcon;
      case 'deadline_approaching':
        return CalendarIcon;
      case 'meeting_scheduled':
        return ClockIcon;
      default:
        return InformationCircleIcon;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'task_assigned':
        return 'text-blue-600 dark:text-blue-400';
      case 'task_completed':
        return 'text-green-600 dark:text-green-400';
      case 'task_overdue':
        return 'text-red-600 dark:text-red-400';
      case 'comment_added':
      case 'mention':
        return 'text-purple-600 dark:text-purple-400';
      case 'member_joined':
        return 'text-green-600 dark:text-green-400';
      case 'project_created':
        return 'text-blue-600 dark:text-blue-400';
      case 'deadline_approaching':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'meeting_scheduled':
        return 'text-indigo-600 dark:text-indigo-400';
      default:
        return 'text-secondary-600 dark:text-secondary-400';
    }
  };

  const getNotificationMessage = (notification) => {
    const { type, data, actor } = notification;
    const actorName = actor?.name || 'Someone';
    
    switch (type) {
      case 'task_assigned':
        return `${actorName} assigned you to "${data.taskTitle}"`;
      case 'task_completed':
        return `${actorName} completed "${data.taskTitle}"`;
      case 'task_overdue':
        return `Task "${data.taskTitle}" is overdue`;
      case 'comment_added':
        return `${actorName} commented on "${data.taskTitle}"`;
      case 'mention':
        return `${actorName} mentioned you in "${data.taskTitle}"`;
      case 'member_joined':
        return `${actorName} joined ${data.teamName || data.projectName}`;
      case 'project_created':
        return `${actorName} created project "${data.projectName}"`;
      case 'deadline_approaching':
        return `Deadline approaching for "${data.taskTitle}"`;
      case 'meeting_scheduled':
        return `Meeting scheduled: "${data.meetingTitle}"`;
      default:
        return notification.message || 'New notification';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="relative p-2 text-secondary-600 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-secondary-100 transition-colors"
        aria-label="Notifications"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-secondary-800 rounded-lg shadow-lg border border-secondary-200 dark:border-secondary-700 z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-secondary-200 dark:border-secondary-700">
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                Notifications
              </h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex space-x-1 p-2 border-b border-secondary-200 dark:border-secondary-700">
              {[
                { key: 'all', label: 'All' },
                { key: 'unread', label: 'Unread' },
                { key: 'mentions', label: 'Mentions' },
                { key: 'assignments', label: 'Assignments' }
              ].map(filterOption => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    filter === filterOption.key
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                      : 'text-secondary-600 hover:bg-secondary-100 dark:text-secondary-400 dark:hover:bg-secondary-700'
                  }`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-secondary-500 dark:text-secondary-400">
                  <BellIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-secondary-200 dark:divide-secondary-700">
                  {notifications.map((notification) => {
                    const Icon = getNotificationIcon(notification.type);
                    const iconColor = getNotificationColor(notification.type);
                    
                    return (
                      <motion.div
                        key={notification._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 cursor-pointer transition-colors ${
                          !notification.read 
                            ? 'bg-primary-50 dark:bg-primary-900/10 hover:bg-primary-100 dark:hover:bg-primary-900/20' 
                            : 'hover:bg-secondary-50 dark:hover:bg-secondary-700'
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex space-x-3">
                          <div className={`flex-shrink-0 ${iconColor}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className={`text-sm ${
                                  !notification.read 
                                    ? 'font-medium text-secondary-900 dark:text-secondary-100' 
                                    : 'text-secondary-700 dark:text-secondary-300'
                                }`}>
                                  {getNotificationMessage(notification)}
                                </p>
                                
                                {notification.data?.description && (
                                  <p className="text-xs text-secondary-600 dark:text-secondary-400 mt-1 truncate">
                                    {notification.data.description}
                                  </p>
                                )}
                                
                                <div className="flex items-center space-x-2 mt-2">
                                  <span className="text-xs text-secondary-500 dark:text-secondary-400">
                                    {formatDistanceToNow(new Date(notification.createdAt))} ago
                                  </span>
                                  
                                  {notification.teamId && (
                                    <Badge variant="secondary" size="xs">
                                      Team
                                    </Badge>
                                  )}
                                  
                                  {notification.projectId && (
                                    <Badge variant="secondary" size="xs">
                                      Project
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              {notification.actor && (
                                <Avatar
                                  src={notification.actor.avatar}
                                  name={notification.actor.name}
                                  size="xs"
                                />
                              )}
                            </div>
                          </div>
                          
                          {!notification.read && (
                            <div className="flex-shrink-0">
                              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-secondary-200 dark:border-secondary-700 text-center">
                <button className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                  View all notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
};

export default TeamNotifications;