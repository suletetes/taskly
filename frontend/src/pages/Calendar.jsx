import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

// Calendar components
import { CalendarProvider, useCalendar } from '../context/CalendarContext';
import CalendarHeader from '../components/calendar/CalendarHeader';
import MonthView from '../components/calendar/views/MonthView';
import WeekView from '../components/calendar/views/WeekView';
import DayView from '../components/calendar/views/DayView';
import AgendaView from '../components/calendar/views/AgendaView';
import CalendarFilters from '../components/calendar/CalendarFilters';
import CalendarSearch from '../components/calendar/CalendarSearch';
import CalendarNotifications from '../components/calendar/CalendarNotifications';
import CalendarIndicators from '../components/calendar/CalendarIndicators';
import CalendarMobile from '../components/calendar/CalendarMobile';
import CalendarBreadcrumbs from '../components/calendar/CalendarBreadcrumbs';
import TaskQuickCreate from '../components/calendar/TaskQuickCreate';
import TaskDragPreview, { useDragAndDrop } from '../components/calendar/TaskDragPreview';

// Task components
import EnhancedTaskForm from '../components/task/EnhancedTaskForm';

// Hooks and services
import { useTasks, useTaskOperations } from '../hooks/useTasks';
import { useAuth } from '../hooks/useAuth';

// Calendar routing utilities
import { 
  parseCalendarParams, 
  updateCalendarUrl, 
  validateCalendarParams,
  CALENDAR_VIEWS,
  DEFAULT_VIEW
} from '../utils/calendarRouting';

const Calendar = () => {
  return (
    <CalendarProvider>
      <CalendarContent />
    </CalendarProvider>
  );
};

const CalendarContent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const {
    currentView,
    setView,
    currentDate,
    setCurrentDate,
    selectedDate,
    setSelectedDate,
    allTasks,
    setTasks,
    addTask,
    updateTask,
    removeTask,
    isLoading,
    setLoading,
    error,
    setError,
    filters,
    updateFilter,
    clearFilters
  } = useCalendar();

  const { tasks, fetchTasks, refreshTasks } = useTasks(user?.id || user?._id);
  const { createTask, updateTaskStatus, deleteTask, loading: operationLoading } = useTaskOperations();

  // UI state
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [quickCreateDate, setQuickCreateDate] = useState(null);
  const [quickCreateTime, setQuickCreateTime] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [urlInitialized, setUrlInitialized] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize calendar state from URL parameters
  useEffect(() => {
    if (!urlInitialized) {
      // Validate URL parameters
      if (!validateCalendarParams(params)) {
        // Redirect to default calendar view if invalid
        updateCalendarUrl(navigate, DEFAULT_VIEW, new Date(), { replace: true });
        return;
      }

      // Parse URL parameters
      const urlState = parseCalendarParams(params, searchParams);
      
      // Update calendar state
      if (urlState.view !== currentView) {
        setView(urlState.view);
      }
      
      if (urlState.date.getTime() !== currentDate.getTime()) {
        setCurrentDate(urlState.date);
      }
      
      // Apply filters from URL
      Object.entries(urlState.filters).forEach(([filterType, filterValue]) => {
        updateFilter(filterType, filterValue);
      });
      
      // Handle selected task
      if (urlState.selectedTaskId) {
        const selectedTask = allTasks.find(task => task._id === urlState.selectedTaskId);
        if (selectedTask) {
          setEditingTask(selectedTask);
          setShowTaskForm(true);
        }
      }
      
      setUrlInitialized(true);
    }
  }, [params, searchParams, urlInitialized, currentView, currentDate, allTasks, setView, setCurrentDate, updateFilter, navigate]);

  // Update URL when calendar state changes
  useEffect(() => {
    if (urlInitialized) {
      updateCalendarUrl(navigate, currentView, currentDate, {
        filters,
        selectedTaskId: editingTask?._id,
        replace: true
      });
    }
  }, [currentView, currentDate, filters, editingTask, urlInitialized, navigate]);

  // Drag and drop
  const {
    dragState,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd
  } = useDragAndDrop({
    onTaskDrop: handleTaskDrop,
    validateDrop: (task, dropZone) => {
      // Basic validation - can be enhanced
      return dropZone && dropZone.date;
    }
  });

  // Load tasks on mount and sync with calendar context
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      setTasks(tasks);
    }
  }, [tasks, setTasks]);

  // Handle task operations
  const handleCreateTask = useCallback(async (taskData) => {
    try {
      setLoading(true);
      const newTask = await createTask(taskData);
      addTask(newTask);
      toast.success('Task created successfully!');
      setShowQuickCreate(false);
      setShowTaskForm(false);
      setQuickCreateDate(null);
      setQuickCreateTime(null);
    } catch (error) {
      console.error('Failed to create task:', error);
      toast.error('Failed to create task');
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [createTask, addTask, setLoading, setError]);

  const handleUpdateTask = useCallback(async (taskData) => {
    try {
      setLoading(true);
      const updatedTask = await updateTaskStatus(editingTask._id, taskData);
      updateTask(updatedTask);
      toast.success('Task updated successfully!');
      setShowTaskForm(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Failed to update task');
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [editingTask, updateTaskStatus, updateTask, setLoading, setError]);

  const handleDeleteTask = useCallback(async (taskId) => {
    try {
      setLoading(true);
      await deleteTask(taskId);
      removeTask(taskId);
      toast.success('Task deleted successfully!');
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Failed to delete task');
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [deleteTask, removeTask, setLoading, setError]);

  const handleTaskStatusToggle = useCallback(async (taskId, newStatus) => {
    try {
      const updatedTask = await updateTaskStatus(taskId, { status: newStatus });
      updateTask(updatedTask);
      toast.success(`Task ${newStatus === 'completed' ? 'completed' : 'updated'}!`);
    } catch (error) {
      console.error('Failed to update task status:', error);
      toast.error('Failed to update task');
    }
  }, [updateTaskStatus, updateTask]);

  // Handle drag and drop
  async function handleTaskDrop(task, dropZone, originalDate) {
    try {
      const newDate = dropZone.date;
      const updatedTaskData = {
        ...task,
        due: dropZone.timeSlot 
          ? new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate(), 
                     dropZone.timeSlot.hour, dropZone.timeSlot.minutes).toISOString()
          : newDate.toISOString()
      };

      const updatedTask = await updateTaskStatus(task._id, updatedTaskData);
      updateTask(updatedTask);
      toast.success('Task rescheduled successfully!');
    } catch (error) {
      console.error('Failed to reschedule task:', error);
      toast.error('Failed to reschedule task');
    }
  }

  // Handle UI interactions
  const handleDateClick = useCallback((date, event) => {
    setQuickCreateDate(date);
    setShowQuickCreate(true);
  }, []);

  const handleTaskClick = useCallback((task, event) => {
    setEditingTask(task);
    setShowTaskForm(true);
  }, []);

  const handleCreateTaskClick = useCallback((date = null, time = null) => {
    setQuickCreateDate(date || selectedDate || new Date());
    setQuickCreateTime(time);
    setShowQuickCreate(true);
  }, [selectedDate]);

  const handleNotificationClick = useCallback((notification) => {
    if (notification.task) {
      handleTaskClick(notification.task);
    }
  }, [handleTaskClick]);

  const handleTaskSearch = useCallback((task) => {
    handleTaskClick(task);
  }, [handleTaskClick]);

  // Render current view
  const renderCurrentView = () => {
    const commonProps = {
      onDateClick: handleDateClick,
      onTaskClick: handleTaskClick,
      onTaskDrop: handleTaskDrop,
      onCreateTask: handleCreateTaskClick
    };

    switch (currentView) {
      case 'month':
        return <MonthView {...commonProps} />;
      case 'week':
        return <WeekView {...commonProps} />;
      case 'day':
        return <DayView {...commonProps} />;
      case 'agenda':
        return <AgendaView {...commonProps} />;
      default:
        return <MonthView {...commonProps} />;
    }
  };

  // Render mobile or desktop version
  if (isMobile) {
    return (
      <div className="calendar-page h-full">
        <CalendarMobile
          onTaskClick={handleTaskClick}
          onTaskCreate={handleCreateTask}
          onTaskUpdate={handleUpdateTask}
          onTaskDelete={handleDeleteTask}
        />

        {/* Mobile Modals */}
        {showTaskForm && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white dark:bg-secondary-800 rounded-t-xl shadow-xl w-full max-h-[90vh] overflow-y-auto"
            >
              <EnhancedTaskForm
                task={editingTask}
                onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
                onCancel={() => {
                  setShowTaskForm(false);
                  setEditingTask(null);
                }}
                loading={operationLoading}
                calendarContext={true}
                preselectedDate={quickCreateDate}
                preselectedTime={quickCreateTime}
                mobile={true}
              />
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="calendar-page h-full flex flex-col">
      {/* Fixed Header */}
      <div className="flex-shrink-0 space-y-4 mb-6">
        {/* Breadcrumbs */}
        <CalendarBreadcrumbs />
        
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <CalendarSearch
              onTaskSelect={handleTaskSearch}
              placeholder="Search tasks or try 'today', 'overdue', '#work'..."
              className="w-96"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <CalendarNotifications
              onNotificationClick={handleNotificationClick}
              onSettingsClick={() => {/* Handle settings */}}
            />
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters 
                  ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'bg-secondary-100 text-secondary-600 dark:bg-secondary-700 dark:text-secondary-400'
              } hover:bg-secondary-200 dark:hover:bg-secondary-600`}
              title="Toggle filters"
            >
              <Cog6ToothIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Header */}
        <CalendarHeader onCreateTask={() => handleCreateTaskClick()} />

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <CalendarFilters />
          </motion.div>
        )}
      </div>

      {/* Main Calendar Content */}
      <div className="flex-1 relative overflow-hidden">
        {isLoading && allTasks.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-secondary-600 dark:text-secondary-400">Loading calendar...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400 mb-4">Failed to load calendar</p>
              <button
                onClick={() => {
                  setError(null);
                  refreshTasks();
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-auto">
            {renderCurrentView()}
          </div>
        )}
      </div>

      {/* Visual Indicators */}
      <CalendarIndicators
        position="top-right"
        showTodayIndicator={true}
        showOverdueIndicator={true}
        showStreakIndicator={true}
        showProductivityIndicator={true}
      />

      {/* Drag Preview */}
      <TaskDragPreview
        draggedTask={dragState.draggedTask}
        dragPosition={dragState.dragPosition}
        dropZone={dragState.dropZone}
        isValidDrop={dragState.isValidDrop}
        onDragEnd={handleDragEnd}
      />

      {/* Modals */}
      {showQuickCreate && (
        <TaskQuickCreate
          isOpen={showQuickCreate}
          onClose={() => {
            setShowQuickCreate(false);
            setQuickCreateDate(null);
            setQuickCreateTime(null);
          }}
          onSubmit={handleCreateTask}
          selectedDate={quickCreateDate}
          selectedTime={quickCreateTime}
          isLoading={operationLoading}
        />
      )}

      {showTaskForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <EnhancedTaskForm
              task={editingTask}
              onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
              onCancel={() => {
                setShowTaskForm(false);
                setEditingTask(null);
              }}
              loading={operationLoading}
              calendarContext={true}
              preselectedDate={quickCreateDate}
              preselectedTime={quickCreateTime}
            />
          </div>
        </div>
      )}

      {/* Floating Action Button - Desktop Only */}
      <motion.button
        onClick={() => handleCreateTaskClick()}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <PlusIcon className="w-6 h-6" />
      </motion.button>
    </div>
  );
};

export default Calendar;