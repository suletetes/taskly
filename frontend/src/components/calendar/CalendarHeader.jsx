import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  ViewColumnsIcon,
  Squares2X2Icon,
  ListBulletIcon,
  RectangleStackIcon
} from '@heroicons/react/24/outline';
import { useCalendar } from '../../context/CalendarContext';
import { dateUtils } from '../../utils/dateUtils';
import { updateCalendarUrl, getCalendarNavigationUrls } from '../../utils/calendarRouting';

const CalendarHeader = ({ onCreateTask }) => {
  const navigate = useNavigate();
  const {
    currentView,
    currentDate,
    dateRange,
    setView,
    setCurrentDate,
    navigateDate,
    goToToday,
    isLoading,
    filters
  } = useCalendar();

  const [showDatePicker, setShowDatePicker] = useState(false);

  // Handle view change with URL update
  const handleViewChange = (newView) => {
    setView(newView);
    updateCalendarUrl(navigate, newView, currentDate, { filters });
  };

  // Handle date navigation with URL update
  const handleDateNavigation = (direction) => {
    const newDate = navigateDate(direction);
    updateCalendarUrl(navigate, currentView, newDate, { filters });
  };

  // Handle go to today with URL update
  const handleGoToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    updateCalendarUrl(navigate, currentView, today, { filters });
  };

  // View options configuration
  const viewOptions = [
    {
      id: 'month',
      label: 'Month',
      icon: Squares2X2Icon,
      shortcut: 'M'
    },
    {
      id: 'week',
      label: 'Week',
      icon: ViewColumnsIcon,
      shortcut: 'W'
    },
    {
      id: 'day',
      label: 'Day',
      icon: RectangleStackIcon,
      shortcut: 'D'
    },
    {
      id: 'agenda',
      label: 'Agenda',
      icon: ListBulletIcon,
      shortcut: 'A'
    }
  ];

  // Get display text for current date/range
  const getDateDisplayText = () => {
    switch (currentView) {
      case 'month':
        return dateUtils.formatMonthYear(currentDate);
      case 'week':
        return dateUtils.formatWeekRange(dateRange.start, dateRange.end);
      case 'day':
        return dateUtils.formatDisplayDate(currentDate);
      case 'agenda':
        return 'Upcoming Tasks';
      default:
        return dateUtils.formatDisplayDate(currentDate);
    }
  };

  // Handle navigation
  const handleNavigate = (direction) => {
    handleDateNavigation(direction);
  };

  // Handle today button click
  const handleTodayClick = () => {
    handleGoToToday();
  };

  // Handle date picker (placeholder for now)
  const handleDatePickerClick = () => {
    setShowDatePicker(!showDatePicker);
  };

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.ctrlKey || event.metaKey) return;
      
      switch (event.key.toLowerCase()) {
        case 'm':
          if (currentView !== 'month') handleViewChange('month');
          break;
        case 'w':
          if (currentView !== 'week') handleViewChange('week');
          break;
        case 'd':
          if (currentView !== 'day') handleViewChange('day');
          break;
        case 'a':
          if (currentView !== 'agenda') handleViewChange('agenda');
          break;
        case 't':
          handleTodayClick();
          break;
        case 'arrowleft':
          event.preventDefault();
          handleNavigate('prev');
          break;
        case 'arrowright':
          event.preventDefault();
          handleNavigate('next');
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [currentView]);

  return (
    <div className="flex items-center justify-between mb-6 bg-white dark:bg-secondary-800 rounded-xl p-4 shadow-sm border border-secondary-200 dark:border-secondary-700">
      {/* Left section - Date navigation */}
      <div className="flex items-center space-x-4">
        {/* Navigation buttons */}
        <div className="flex items-center space-x-1">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleNavigate('prev')}
            disabled={isLoading}
            className="p-2 rounded-lg bg-secondary-100 dark:bg-secondary-700 hover:bg-secondary-200 dark:hover:bg-secondary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Previous"
          >
            <ChevronLeftIcon className="w-5 h-5 text-secondary-600 dark:text-secondary-300" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleNavigate('next')}
            disabled={isLoading}
            className="p-2 rounded-lg bg-secondary-100 dark:bg-secondary-700 hover:bg-secondary-200 dark:hover:bg-secondary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Next"
          >
            <ChevronRightIcon className="w-5 h-5 text-secondary-600 dark:text-secondary-300" />
          </motion.button>
        </div>

        {/* Today button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleTodayClick}
          disabled={isLoading}
          className="px-3 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Today
        </motion.button>

        {/* Current date/range display */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDatePickerClick}
          className="flex items-center space-x-2 px-3 py-2 text-lg font-semibold text-secondary-900 dark:text-secondary-100 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
          title="Select date"
        >
          <CalendarIcon className="w-5 h-5" />
          <span>{getDateDisplayText()}</span>
        </motion.button>
      </div>

      {/* Right section - View controls and actions */}
      <div className="flex items-center space-x-4">
        {/* View selector */}
        <div className="flex items-center bg-secondary-100 dark:bg-secondary-700 rounded-lg p-1">
          {viewOptions.map((option) => {
            const Icon = option.icon;
            const isActive = currentView === option.id;
            
            return (
              <motion.button
                key={option.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleViewChange(option.id)}
                disabled={isLoading}
                className={`
                  flex items-center space-x-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200
                  ${isActive 
                    ? 'bg-white dark:bg-secondary-800 text-primary-600 dark:text-primary-400 shadow-sm' 
                    : 'text-secondary-600 dark:text-secondary-300 hover:text-secondary-900 dark:hover:text-secondary-100'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                title={`${option.label} view (${option.shortcut})`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{option.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Create task button */}
        {onCreateTask && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCreateTask}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">New Task</span>
          </motion.button>
        )}
      </div>

      {/* Date picker modal (placeholder) */}
      {showDatePicker && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="absolute top-full left-0 mt-2 p-4 bg-white dark:bg-secondary-800 rounded-lg shadow-lg border border-secondary-200 dark:border-secondary-700 z-50"
        >
          <div className="text-sm text-secondary-600 dark:text-secondary-400">
            Date picker coming soon...
          </div>
          <button
            onClick={() => setShowDatePicker(false)}
            className="mt-2 px-3 py-1 text-xs bg-secondary-100 dark:bg-secondary-700 hover:bg-secondary-200 dark:hover:bg-secondary-600 rounded transition-colors"
          >
            Close
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default CalendarHeader;