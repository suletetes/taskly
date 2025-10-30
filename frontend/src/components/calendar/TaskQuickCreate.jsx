import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  FlagIcon,
  TagIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { dateUtils } from '../../utils/dateUtils';
import { taskCalendarUtils } from '../../utils/taskCalendarUtils';

const TaskQuickCreate = ({
  isOpen,
  onClose,
  onSubmit,
  selectedDate,
  selectedTime,
  initialData = {},
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due: '',
    time: '',
    priority: 'medium',
    tags: [],
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const [newTag, setNewTag] = useState('');

  // Initialize form data when modal opens or date changes
  useEffect(() => {
    if (isOpen && selectedDate) {
      const dateStr = dateUtils.formatCalendarDate(selectedDate);
      const timeStr = selectedTime ? dateUtils.formatTimeSlot(selectedTime) : '';
      
      setFormData(prev => ({
        ...prev,
        due: dateStr,
        time: timeStr,
        ...initialData
      }));
      setErrors({});
    }
  }, [isOpen, selectedDate, selectedTime, initialData]);

  // Handle form field changes
  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  }, [errors]);

  // Handle tag addition
  const handleAddTag = useCallback(() => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  }, [newTag, formData.tags]);

  // Handle tag removal
  const handleRemoveTag = useCallback((tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }, []);

  // Handle tag input key press
  const handleTagKeyPress = useCallback((event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddTag();
    }
  }, [handleAddTag]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }

    if (!formData.due) {
      newErrors.due = 'Due date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Combine date and time
    let dueDateTime = formData.due;
    if (formData.time) {
      const [time, period] = formData.time.split(' ');
      const [hours, minutes] = time.split(':');
      let hour24 = parseInt(hours);
      
      if (period === 'PM' && hour24 !== 12) {
        hour24 += 12;
      } else if (period === 'AM' && hour24 === 12) {
        hour24 = 0;
      }
      
      const dateTime = new Date(formData.due);
      dateTime.setHours(hour24, parseInt(minutes) || 0, 0, 0);
      dueDateTime = dateTime.toISOString();
    }

    const taskData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      due: dueDateTime,
      priority: formData.priority,
      tags: formData.tags,
      status: 'in-progress'
    };

    if (onSubmit) {
      onSubmit(taskData);
    }
  }, [formData, onSubmit]);

  // Handle modal close
  const handleClose = useCallback(() => {
    if (!isLoading) {
      setFormData({
        title: '',
        description: '',
        due: '',
        time: '',
        priority: 'medium',
        tags: []
      });
      setErrors({});
      setNewTag('');
      onClose();
    }
  }, [isLoading, onClose]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((event) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  }, [handleClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white dark:bg-secondary-800 rounded-xl shadow-xl border border-secondary-200 dark:border-secondary-700 w-full max-w-md max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-secondary-200 dark:border-secondary-700">
            <div>
              <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                Quick Create Task
              </h2>
              {selectedDate && (
                <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1">
                  {dateUtils.formatDisplayDate(selectedDate)}
                  {selectedTime && ` at ${dateUtils.formatTimeSlot(selectedTime)}`}
                </p>
              )}
            </div>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <XMarkIcon className="w-5 h-5 text-secondary-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Enter task title..."
                className={`
                  w-full px-3 py-2 border rounded-lg bg-white dark:bg-secondary-900 
                  text-secondary-900 dark:text-secondary-100 placeholder-secondary-400
                  focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors
                  ${errors.title ? 'border-red-300 dark:border-red-600' : 'border-secondary-300 dark:border-secondary-600'}
                `}
                disabled={isLoading}
                autoFocus
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Add a description..."
                rows={3}
                className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-900 text-secondary-900 dark:text-secondary-100 placeholder-secondary-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
                disabled={isLoading}
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  <CalendarIcon className="w-4 h-4 inline mr-1" />
                  Due Date *
                </label>
                <input
                  type="date"
                  value={formData.due}
                  onChange={(e) => handleChange('due', e.target.value)}
                  className={`
                    w-full px-3 py-2 border rounded-lg bg-white dark:bg-secondary-900 
                    text-secondary-900 dark:text-secondary-100
                    focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors
                    ${errors.due ? 'border-red-300 dark:border-red-600' : 'border-secondary-300 dark:border-secondary-600'}
                  `}
                  disabled={isLoading}
                />
                {errors.due && (
                  <p className="text-red-500 text-xs mt-1">{errors.due}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  <ClockIcon className="w-4 h-4 inline mr-1" />
                  Time
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleChange('time', e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-900 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                <FlagIcon className="w-4 h-4 inline mr-1" />
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-900 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                disabled={isLoading}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                <TagIcon className="w-4 h-4 inline mr-1" />
                Tags
              </label>
              
              {/* Existing tags */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {formData.tags.map((tag, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex items-center px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-primary-900 dark:hover:text-primary-100"
                        disabled={isLoading}
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </motion.span>
                  ))}
                </div>
              )}

              {/* Add new tag */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  placeholder="Add a tag..."
                  className="flex-1 px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-900 text-secondary-900 dark:text-secondary-100 placeholder-secondary-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={!newTag.trim() || isLoading}
                  className="px-3 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-secondary-300 dark:disabled:bg-secondary-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-secondary-200 dark:border-secondary-700">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <motion.button
                type="submit"
                disabled={isLoading || !formData.title.trim()}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-secondary-300 dark:disabled:bg-secondary-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed flex items-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <PlusIcon className="w-4 h-4" />
                    <span>Create Task</span>
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TaskQuickCreate;