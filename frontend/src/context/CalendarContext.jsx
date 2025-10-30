import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { dateUtils } from '../utils/dateUtils';
import { taskCalendarUtils } from '../utils/taskCalendarUtils';

// Initial state
const initialState = {
  // View configuration
  currentView: 'month',
  currentDate: new Date(),
  selectedDate: new Date(),
  dateRange: {
    start: null,
    end: null
  },
  
  // Task data organized by date
  tasksByDate: {},
  allTasks: [],
  
  // UI state
  isLoading: false,
  draggedTask: null,
  selectedTasks: [],
  
  // Filters
  filters: {
    priority: [],
    status: [],
    tags: []
  },
  
  // Settings
  settings: {
    weekStartsOn: 0, // Sunday
    timeFormat: '12h',
    showWeekends: true,
    defaultView: 'month',
    reminderSettings: {
      enabled: true,
      defaultReminder: 15 // minutes before
    }
  },
  
  // Error handling
  error: null
};

// Action types
const CALENDAR_ACTIONS = {
  SET_VIEW: 'SET_VIEW',
  SET_CURRENT_DATE: 'SET_CURRENT_DATE',
  SET_SELECTED_DATE: 'SET_SELECTED_DATE',
  SET_DATE_RANGE: 'SET_DATE_RANGE',
  SET_TASKS: 'SET_TASKS',
  ADD_TASK: 'ADD_TASK',
  UPDATE_TASK: 'UPDATE_TASK',
  REMOVE_TASK: 'REMOVE_TASK',
  SET_LOADING: 'SET_LOADING',
  SET_DRAGGED_TASK: 'SET_DRAGGED_TASK',
  SET_SELECTED_TASKS: 'SET_SELECTED_TASKS',
  ADD_SELECTED_TASK: 'ADD_SELECTED_TASK',
  REMOVE_SELECTED_TASK: 'REMOVE_SELECTED_TASK',
  SET_FILTERS: 'SET_FILTERS',
  UPDATE_FILTER: 'UPDATE_FILTER',
  CLEAR_FILTERS: 'CLEAR_FILTERS',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  NAVIGATE_DATE: 'NAVIGATE_DATE',
  GO_TO_TODAY: 'GO_TO_TODAY'
};

// Reducer function
const calendarReducer = (state, action) => {
  switch (action.type) {
    case CALENDAR_ACTIONS.SET_VIEW:
      return {
        ...state,
        currentView: action.payload,
        dateRange: calculateDateRange(state.currentDate, action.payload, state.settings.weekStartsOn)
      };

    case CALENDAR_ACTIONS.SET_CURRENT_DATE:
      return {
        ...state,
        currentDate: action.payload,
        dateRange: calculateDateRange(action.payload, state.currentView, state.settings.weekStartsOn)
      };

    case CALENDAR_ACTIONS.SET_SELECTED_DATE:
      return {
        ...state,
        selectedDate: action.payload
      };

    case CALENDAR_ACTIONS.SET_DATE_RANGE:
      return {
        ...state,
        dateRange: action.payload
      };

    case CALENDAR_ACTIONS.SET_TASKS:
      return {
        ...state,
        allTasks: action.payload,
        tasksByDate: taskCalendarUtils.groupTasksByDate(action.payload),
        isLoading: false,
        error: null
      };

    case CALENDAR_ACTIONS.ADD_TASK:
      const newAllTasks = [...state.allTasks, action.payload];
      return {
        ...state,
        allTasks: newAllTasks,
        tasksByDate: taskCalendarUtils.groupTasksByDate(newAllTasks)
      };

    case CALENDAR_ACTIONS.UPDATE_TASK:
      const updatedTasks = state.allTasks.map(task => 
        (task._id || task.id) === (action.payload._id || action.payload.id) 
          ? action.payload 
          : task
      );
      return {
        ...state,
        allTasks: updatedTasks,
        tasksByDate: taskCalendarUtils.groupTasksByDate(updatedTasks)
      };

    case CALENDAR_ACTIONS.REMOVE_TASK:
      const filteredTasks = state.allTasks.filter(task => 
        (task._id || task.id) !== action.payload
      );
      return {
        ...state,
        allTasks: filteredTasks,
        tasksByDate: taskCalendarUtils.groupTasksByDate(filteredTasks),
        selectedTasks: state.selectedTasks.filter(id => id !== action.payload)
      };

    case CALENDAR_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case CALENDAR_ACTIONS.SET_DRAGGED_TASK:
      return {
        ...state,
        draggedTask: action.payload
      };

    case CALENDAR_ACTIONS.SET_SELECTED_TASKS:
      return {
        ...state,
        selectedTasks: action.payload
      };

    case CALENDAR_ACTIONS.ADD_SELECTED_TASK:
      return {
        ...state,
        selectedTasks: [...state.selectedTasks, action.payload]
      };

    case CALENDAR_ACTIONS.REMOVE_SELECTED_TASK:
      return {
        ...state,
        selectedTasks: state.selectedTasks.filter(id => id !== action.payload)
      };

    case CALENDAR_ACTIONS.SET_FILTERS:
      return {
        ...state,
        filters: action.payload
      };

    case CALENDAR_ACTIONS.UPDATE_FILTER:
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.type]: action.payload.value
        }
      };

    case CALENDAR_ACTIONS.CLEAR_FILTERS:
      return {
        ...state,
        filters: {
          priority: [],
          status: [],
          tags: []
        }
      };

    case CALENDAR_ACTIONS.UPDATE_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        }
      };

    case CALENDAR_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case CALENDAR_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case CALENDAR_ACTIONS.NAVIGATE_DATE:
      const newDate = navigateDate(state.currentDate, state.currentView, action.payload);
      return {
        ...state,
        currentDate: newDate,
        dateRange: calculateDateRange(newDate, state.currentView, state.settings.weekStartsOn)
      };

    case CALENDAR_ACTIONS.GO_TO_TODAY:
      const today = new Date();
      return {
        ...state,
        currentDate: today,
        selectedDate: today,
        dateRange: calculateDateRange(today, state.currentView, state.settings.weekStartsOn)
      };

    default:
      return state;
  }
};

// Helper functions
const calculateDateRange = (date, view, weekStartsOn = 0) => {
  switch (view) {
    case 'month':
      return dateUtils.getMonthRange(date);
    case 'week':
      return dateUtils.getWeekRange(date, weekStartsOn);
    case 'day':
      return dateUtils.getDayRange(date);
    case 'agenda':
      // For agenda view, show next 30 days
      return {
        start: new Date(),
        end: dateUtils.navigateDay(new Date(), 'next', 30)
      };
    default:
      return dateUtils.getMonthRange(date);
  }
};

const navigateDate = (currentDate, view, direction) => {
  switch (view) {
    case 'month':
      return dateUtils.navigateMonth(currentDate, direction);
    case 'week':
      return dateUtils.navigateWeek(currentDate, direction);
    case 'day':
      return dateUtils.navigateDay(currentDate, direction);
    default:
      return currentDate;
  }
};

// Create context
const CalendarContext = createContext();

// CalendarProvider component
export const CalendarProvider = ({ children }) => {
  const [state, dispatch] = useReducer(calendarReducer, {
    ...initialState,
    dateRange: calculateDateRange(initialState.currentDate, initialState.currentView, initialState.settings.weekStartsOn)
  });

  // Actions
  const setView = useCallback((view) => {
    dispatch({ type: CALENDAR_ACTIONS.SET_VIEW, payload: view });
  }, []);

  const setCurrentDate = useCallback((date) => {
    dispatch({ type: CALENDAR_ACTIONS.SET_CURRENT_DATE, payload: date });
  }, []);

  const setSelectedDate = useCallback((date) => {
    dispatch({ type: CALENDAR_ACTIONS.SET_SELECTED_DATE, payload: date });
  }, []);

  const setTasks = useCallback((tasks) => {
    dispatch({ type: CALENDAR_ACTIONS.SET_TASKS, payload: tasks });
  }, []);

  const addTask = useCallback((task) => {
    dispatch({ type: CALENDAR_ACTIONS.ADD_TASK, payload: task });
  }, []);

  const updateTask = useCallback((task) => {
    dispatch({ type: CALENDAR_ACTIONS.UPDATE_TASK, payload: task });
  }, []);

  const removeTask = useCallback((taskId) => {
    dispatch({ type: CALENDAR_ACTIONS.REMOVE_TASK, payload: taskId });
  }, []);

  const setLoading = useCallback((loading) => {
    dispatch({ type: CALENDAR_ACTIONS.SET_LOADING, payload: loading });
  }, []);

  const setDraggedTask = useCallback((task) => {
    dispatch({ type: CALENDAR_ACTIONS.SET_DRAGGED_TASK, payload: task });
  }, []);

  const setSelectedTasks = useCallback((taskIds) => {
    dispatch({ type: CALENDAR_ACTIONS.SET_SELECTED_TASKS, payload: taskIds });
  }, []);

  const addSelectedTask = useCallback((taskId) => {
    dispatch({ type: CALENDAR_ACTIONS.ADD_SELECTED_TASK, payload: taskId });
  }, []);

  const removeSelectedTask = useCallback((taskId) => {
    dispatch({ type: CALENDAR_ACTIONS.REMOVE_SELECTED_TASK, payload: taskId });
  }, []);

  const setFilters = useCallback((filters) => {
    dispatch({ type: CALENDAR_ACTIONS.SET_FILTERS, payload: filters });
  }, []);

  const updateFilter = useCallback((type, value) => {
    dispatch({ type: CALENDAR_ACTIONS.UPDATE_FILTER, payload: { type, value } });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: CALENDAR_ACTIONS.CLEAR_FILTERS });
  }, []);

  const updateSettings = useCallback((settings) => {
    dispatch({ type: CALENDAR_ACTIONS.UPDATE_SETTINGS, payload: settings });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: CALENDAR_ACTIONS.SET_ERROR, payload: error });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: CALENDAR_ACTIONS.CLEAR_ERROR });
  }, []);

  const navigateDate = useCallback((direction) => {
    dispatch({ type: CALENDAR_ACTIONS.NAVIGATE_DATE, payload: direction });
  }, []);

  const goToToday = useCallback(() => {
    dispatch({ type: CALENDAR_ACTIONS.GO_TO_TODAY });
  }, []);

  // Computed values
  const getTasksForDate = useCallback((date) => {
    return dateUtils.getTasksForDate(state.allTasks, date);
  }, [state.allTasks]);

  const getFilteredTasks = useCallback(() => {
    let filtered = [...state.allTasks];

    // Apply priority filter
    if (state.filters.priority.length > 0) {
      filtered = filtered.filter(task => 
        state.filters.priority.includes(task.priority)
      );
    }

    // Apply status filter
    if (state.filters.status.length > 0) {
      filtered = filtered.filter(task => 
        state.filters.status.includes(task.status)
      );
    }

    // Apply tags filter
    if (state.filters.tags.length > 0) {
      filtered = filtered.filter(task => 
        task.tags && task.tags.some(tag => 
          state.filters.tags.includes(tag)
        )
      );
    }

    return filtered;
  }, [state.allTasks, state.filters]);

  const getTasksInCurrentRange = useCallback(() => {
    const filtered = getFilteredTasks();
    return taskCalendarUtils.getTasksInDateRange(
      filtered, 
      state.dateRange.start, 
      state.dateRange.end
    );
  }, [getFilteredTasks, state.dateRange]);

  // Context value
  const value = {
    // State
    currentView: state.currentView,
    currentDate: state.currentDate,
    selectedDate: state.selectedDate,
    dateRange: state.dateRange,
    tasksByDate: state.tasksByDate,
    allTasks: state.allTasks,
    isLoading: state.isLoading,
    draggedTask: state.draggedTask,
    selectedTasks: state.selectedTasks,
    filters: state.filters,
    settings: state.settings,
    error: state.error,

    // Actions
    setView,
    setCurrentDate,
    setSelectedDate,
    setTasks,
    addTask,
    updateTask,
    removeTask,
    setLoading,
    setDraggedTask,
    setSelectedTasks,
    addSelectedTask,
    removeSelectedTask,
    setFilters,
    updateFilter,
    clearFilters,
    updateSettings,
    setError,
    clearError,
    navigateDate,
    goToToday,

    // Computed values
    getTasksForDate,
    getFilteredTasks,
    getTasksInCurrentRange
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};

// Custom hook to use calendar context
export const useCalendar = () => {
  const context = useContext(CalendarContext);
  
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  
  return context;
};

export default CalendarContext;