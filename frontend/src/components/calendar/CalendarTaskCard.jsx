import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import { taskCalendarUtils } from '../../utils/taskCalendarUtils';
import { dateUtils } from '../../utils/dateUtils';
import RecurringTaskIndicator from './RecurringTaskIndicator';

const CalendarTaskCard = ({
  task,
  onClick,
  onEdit,
  onDelete,
  onStatusChange,
  size = 'sm',
  showTooltip = true,
  isDraggable = true,
  className = ''
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Handle task click
  const handleClick = useCallback((event) => {
    event.stopPropagation();
    if (onClick) {
      onClick(task, event);
    }
  }, [task, onClick]);

  // Handle drag start
  const handleDragStart = useCallback((event) => {
    if (!isDraggable) {
      event.preventDefault();
      return;
    }

    setIsDragging(true);
    
    // Set drag data
    event.dataTransfer.setData('text/plain', JSON.stringify({
      taskId: task._id || task.id,
      originalDate: task.due,
      task: task
    }));
    
    event.dataTransfer.effectAllowed = 'move';
    
    // Add dragging class for global styling
    document.body.classList.add('task-dragging');
  }, [task, isDraggable]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    document.body.classList.remove('task-dragging');
  }, []);

  // Handle status change
  const handleStatusChange = useCallback((newStatus, event) => {
    event.stopPropagation();
    if (onStatusChange) {
      onStatusChange(task, newStatus);
    }
  }, [task, onStatusChange]);

  // Handle edit
  const handleEdit = useCallback((event) => {
    event.stopPropagation();
    setShowActions(false);
    if (onEdit) {
      onEdit(task);
    }
  }, [task, onEdit]);

  // Handle delete
  const handleDelete = useCallback((event) => {
    event.stopPropagation();
    setShowActions(false);
    if (onDelete) {
      onDelete(task);
    }
  }, [task, onDelete]);

  // Get task status info
  const getStatusInfo = () => {
    const isOverdue = dateUtils.isTaskOverdue(task);
    const isCompleted = task.status === 'completed';
    const isFailed = task.status === 'failed';

    return {
      isOverdue,
      isCompleted,
      isFailed,
      icon: isCompleted ? CheckCircleIcon : 
            isOverdue ? ExclamationTriangleIcon : 
            ClockIcon,
      iconColor: isCompleted ? 'text-green-500' : 
                 isOverdue ? 'text-red-500' : 
                 'text-blue-500'
    };
  };

  // Get size classes
  const getSizeClasses = () => {
    const sizeMap = {
      xs: {
        container: 'p-1 text-xs',
        title: 'text-xs',
        meta: 'text-xs',
        icon: 'w-3 h-3'
      },
      sm: {
        container: 'p-1.5 text-xs',
        title: 'text-xs',
        meta: 'text-xs',
        icon: 'w-3 h-3'
      },
      md: {
        container: 'p-2 text-sm',
        title: 'text-sm',
        meta: 'text-xs',
        icon: 'w-4 h-4'
      },
      lg: {
        container: 'p-3 text-sm',
        title: 'text-sm font-medium',
        meta: 'text-xs',
        icon: 'w-4 h-4'
      }
    };

    return sizeMap[size] || sizeMap.sm;
  };

  const statusInfo = getStatusInfo();
  const sizeClasses = getSizeClasses();
  const StatusIcon = statusInfo.icon;

  return (
    <motion.div
      className={`
        relative calendar-task-card cursor-pointer rounded transition-all duration-200
        ${taskCalendarUtils.getTaskColor(task)}
        text-white hover:shadow-md group
        ${isDragging ? 'opacity-50 scale-95' : ''}
        ${sizeClasses.container}
        ${className}
      `}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      title={showTooltip ? taskCalendarUtils.getTaskTooltipText(task) : undefined}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      {/* Task content */}
      <div className="flex items-start justify-between min-w-0">
        <div className="flex-1 min-w-0">
          {/* Task title */}
          <div className={`
            font-medium truncate leading-tight flex items-center space-x-1
            ${task.status === 'completed' ? 'line-through opacity-75' : ''}
            ${sizeClasses.title}
          `}>
            <span className="truncate">
              {taskCalendarUtils.getTaskDisplayText(task, size === 'xs' ? 10 : size === 'sm' ? 15 : 25)}
            </span>
            <RecurringTaskIndicator 
              task={task} 
              size={size === 'xs' ? 'xs' : 'sm'} 
              showTooltip={showTooltip}
            />
          </div>

          {/* Task metadata */}
          {size !== 'xs' && (
            <div className={`flex items-center space-x-1 mt-0.5 opacity-90 ${sizeClasses.meta}`}>
              {/* Priority indicator */}
              <div className={`
                w-1.5 h-1.5 rounded-full flex-shrink-0
                ${task.priority === 'high' ? 'bg-red-200' : 
                  task.priority === 'medium' ? 'bg-yellow-200' : 'bg-green-200'}
              `} />
              
              {/* Time info */}
              {task.due && (
                <span className="truncate">
                  {dateUtils.formatTimeSlot(task.due)}
                </span>
              )}
              
              {/* Tags (only for larger sizes) */}
              {size === 'lg' && task.tags && task.tags.length > 0 && (
                <span className="truncate">
                  • {task.tags[0]}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Status icon */}
        <div className="flex-shrink-0 ml-1">
          <StatusIcon className={`${sizeClasses.icon} ${statusInfo.iconColor}`} />
        </div>
      </div>

      {/* Quick actions (visible on hover) */}
      {showActions && size !== 'xs' && (onEdit || onDelete || onStatusChange) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-1 -right-1 flex items-center space-x-1"
        >
          {/* Status toggle */}
          {onStatusChange && task.status !== 'completed' && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => handleStatusChange('completed', e)}
              className="w-5 h-5 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-sm"
              title="Mark as completed"
            >
              <CheckCircleIcon className="w-3 h-3" />
            </motion.button>
          )}

          {/* Actions menu */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
            className="w-5 h-5 bg-secondary-600 hover:bg-secondary-700 text-white rounded-full flex items-center justify-center shadow-sm"
            title="More actions"
          >
            <EllipsisHorizontalIcon className="w-3 h-3" />
          </motion.button>
        </motion.div>
      )}

      {/* Actions dropdown */}
      {showActions && size !== 'xs' && (
        <TaskActionsDropdown
          task={task}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          onClose={() => setShowActions(false)}
        />
      )}

      {/* Drag handle indicator */}
      {isDraggable && size !== 'xs' && (
        <div className="absolute top-0 left-0 w-1 h-full bg-white/20 rounded-l opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </motion.div>
  );
};

// Task actions dropdown component
const TaskActionsDropdown = ({ task, onEdit, onDelete, onStatusChange, onClose }) => {
  const actions = [
    {
      label: 'Edit Task',
      onClick: onEdit,
      icon: '✏️',
      show: !!onEdit
    },
    {
      label: task.status === 'completed' ? 'Mark Incomplete' : 'Mark Complete',
      onClick: (e) => onStatusChange(task.status === 'completed' ? 'in-progress' : 'completed', e),
      icon: task.status === 'completed' ? '↩️' : '✅',
      show: !!onStatusChange
    },
    {
      label: 'Delete Task',
      onClick: onDelete,
      icon: '🗑️',
      show: !!onDelete,
      danger: true
    }
  ].filter(action => action.show);

  if (actions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: -5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -5 }}
      className="absolute top-full right-0 mt-1 bg-white dark:bg-secondary-800 rounded-lg shadow-lg border border-secondary-200 dark:border-secondary-700 z-50 min-w-[120px]"
      onMouseLeave={onClose}
    >
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={(e) => {
            action.onClick(e);
            onClose();
          }}
          className={`
            w-full px-3 py-2 text-left text-xs hover:bg-secondary-50 dark:hover:bg-secondary-700 
            flex items-center space-x-2 transition-colors
            ${index === 0 ? 'rounded-t-lg' : ''}
            ${index === actions.length - 1 ? 'rounded-b-lg' : ''}
            ${action.danger ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-secondary-700 dark:text-secondary-300'}
          `}
        >
          <span>{action.icon}</span>
          <span>{action.label}</span>
        </button>
      ))}
    </motion.div>
  );
};

export default CalendarTaskCard;