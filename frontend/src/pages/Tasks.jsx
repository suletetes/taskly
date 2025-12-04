import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useLocation } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ViewColumnsIcon,
  ListBulletIcon,
  CheckIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  TagIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import taskService from '../services/taskService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TaskFormModal from '../components/task/TaskFormModal';

const Tasks = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { projectId } = useParams();
  const location = useLocation();

  // //console.log('  [Tasks] ========== COMPONENT RENDER ==========');
  // //console.log('  [Tasks] URL params:', { projectId });
  // //console.log('  [Tasks] Location:', location.pathname);
  // //console.log('  [Tasks] User:', user ? { id: user._id, username: user.username } : 'No user');

  // State management
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [view, setView] = useState('list');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Load tasks on component mount and when user or projectId changes
  useEffect(() => {
    // //console.log('🔄 [Tasks] useEffect triggered - user:', !!user, 'projectId:', projectId);
    if (user) {
      loadTasks();
    }
  }, [user, projectId]);

  const loadTasks = async () => {
    // //console.log('  [Tasks] ========== LOADING TASKS ==========');
    // //console.log('  [Tasks] User check:', !!user);
    // //console.log('  [Tasks] Project ID:', projectId);
    
    if (!user) {
      // //console.log('❌ [Tasks] No user found, skipping load');
      return;
    }

    try {
      setLoading(true);
      
      let response;
      if (projectId) {
        // //console.log('  [Tasks] Loading tasks for project:', projectId);
        response = await taskService.getProjectTasks(projectId, {
          limit: 100,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        });
        // //console.log('  [Tasks] Project tasks response:', response);
      } else {
        // //console.log('  [Tasks] Loading all user tasks');
        response = await taskService.getUserTasks(null, {
          limit: 100,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        });
        // //console.log('  [Tasks] User tasks response:', response);
      }
      
      // apiService.get() returns response.data directly
      // For project tasks: backend sends array directly, so response is the array
      // For user tasks: backend sends {tasks: [...], ...}, so response.tasks is the array
      const tasksData = Array.isArray(response) ? response : (response.tasks || response.data || []);
      // //console.log('  [Tasks] Tasks data:', tasksData);
      // //console.log('  [Tasks] Tasks count:', Array.isArray(tasksData) ? tasksData.length : 'Not an array');
      // //console.log('  [Tasks] First task sample:', tasksData[0]);
      
      setTasks(Array.isArray(tasksData) ? tasksData : []);
    } catch (error) {
      //console.error('❌ [Tasks] Failed to load tasks:', error);
      //console.error('❌ [Tasks] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      showError('Failed to load tasks. Please try again.');
      setTasks([]);
    } finally {
      setLoading(false);
      // //console.log('✅ [Tasks] Loading complete');
    }
  };

  // Task operations
  const handleCreateTask = () => {
    setEditingTask(null);
    setShowTaskModal(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleTaskSubmit = async (taskData) => {
    setSubmitting(true);

    //console.log('📋 [Tasks] ========== TASK SUBMISSION ==========');
    //console.log('📋 [Tasks] Task data being submitted:', taskData);

    try {
      if (editingTask) {
        // Update existing task
        //console.log('📋 [Tasks] Updating existing task:', editingTask._id);
        const response = await taskService.updateTask(editingTask._id, taskData);
        //console.log('📋 [Tasks] Update response:', response);
        
        const updatedTask = response.data.task || response.data;
        //console.log('📋 [Tasks] Updated task:', updatedTask);
        
        showSuccess('Task updated successfully!');
        setTasks(prev => (Array.isArray(prev) ? prev : []).map(task =>
          task._id === editingTask._id ? updatedTask : task
        ));
      } else {
        // Create new task - user ID is extracted from auth token by backend
        //console.log('📋 [Tasks] Creating new task');
        const response = await taskService.createTask(taskData);
        //console.log('📋 [Tasks] ========== CREATE RESPONSE ==========');
        //console.log('📋 [Tasks] Full response:', response);
        //console.log('📋 [Tasks] Response.data:', response.data);
        //console.log('📋 [Tasks] Response.data.task:', response.data?.task);
        
        // Handle both response formats: { data: task } or { data: { task: task } }
        const newTask = response.data.task || response.data;
        //console.log('📋 [Tasks] New task extracted:', newTask);
        //console.log('📋 [Tasks] Task details:', {
          id: newTask._id,
          title: newTask.title,
          priority: newTask.priority,
          status: newTask.status,
          assignee: newTask.assignee,
          project: newTask.project,
          team: newTask.team,
          tags: newTask.tags,
          due: newTask.due
        });
        
        showSuccess('Task created successfully!');
        setTasks(prev => {
          const updated = [newTask, ...(Array.isArray(prev) ? prev : [])];
          //console.log('📋 [Tasks] Updated tasks list:', {
            previousCount: prev.length,
            newCount: updated.length,
            newTaskId: newTask._id
          });
          return updated;
        });
      }

      setShowTaskModal(false);
      setEditingTask(null);
      //console.log('✅ [Tasks] Task submission completed successfully');
    } catch (error) {
      //console.error('❌ [Tasks] Failed to save task:', error);
      //console.error('❌ [Tasks] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Extract detailed error message
      let errorMessage = 'Failed to save task. Please try again.';
      
      if (error.response?.data?.error) {
        const apiError = error.response.data.error;
        
        // If there are validation details, show them
        if (apiError.details && Array.isArray(apiError.details) && apiError.details.length > 0) {
          errorMessage = apiError.details.map(d => d.message).join(', ');
        } else if (apiError.message) {
          errorMessage = apiError.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async (task) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await taskService.deleteTask(task._id);
      showSuccess('Task deleted successfully!');
      setTasks(prev => (Array.isArray(prev) ? prev : []).filter(t => t._id !== task._id));
    } catch (error) {
      //console.error('Failed to delete task:', error);
      showError('Failed to delete task. Please try again.');
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      const newStatus = task.status === 'completed' ? 'in-progress' : 'completed';
      const response = await taskService.updateTaskStatus(task._id, newStatus);
      showSuccess(`Task marked as ${newStatus === 'completed' ? 'completed' : 'incomplete'}!`);
      setTasks(prev => (Array.isArray(prev) ? prev : []).map(t =>
        t._id === task._id ? { ...t, status: newStatus } : t
      ));
    } catch (error) {
      //console.error('Failed to update task status:', error);
      showError('Failed to update task status. Please try again.');
    }
  };

  // Utility functions
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-700 bg-red-100 dark:bg-red-900/20 dark:text-red-300';
      case 'medium': return 'text-yellow-700 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low': return 'text-green-700 bg-green-100 dark:bg-green-900/20 dark:text-green-300';
      default: return 'text-secondary-600 bg-secondary-100 dark:bg-secondary-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-700 bg-green-100 dark:bg-green-900/20 dark:text-green-300';
      case 'in-progress': return 'text-blue-700 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300';
      case 'todo': return 'text-secondary-600 bg-secondary-100 dark:bg-secondary-800';
      default: return 'text-secondary-600 bg-secondary-100 dark:bg-secondary-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Filter tasks based on search and filters
  const filteredTasks = (Array.isArray(tasks) ? tasks : []).filter(task => {
    const matchesSearch = !searchTerm ||
      task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
            Tasks
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            Manage and organize your tasks efficiently.
          </p>
        </div>
        <button
          onClick={handleCreateTask}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          New Task
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 sm:w-auto w-full">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Filters and View Toggle */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded-lg transition-colors ${view === 'list'
                ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                : 'text-secondary-600 hover:bg-secondary-100 dark:hover:bg-secondary-800'
                }`}
            >
              <ListBulletIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('board')}
              className={`p-2 rounded-lg transition-colors ${view === 'board'
                ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                : 'text-secondary-600 hover:bg-secondary-100 dark:hover:bg-secondary-800'
                }`}
            >
              <ViewColumnsIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 && !loading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-secondary-100 dark:bg-secondary-800 rounded-full">
            <ListBulletIcon className="w-8 h-8 text-secondary-400" />
          </div>
          <h3 className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">
            {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
              ? 'No tasks match your filters'
              : 'No tasks found'
            }
          </h3>
          <p className="text-secondary-600 dark:text-secondary-400 mb-6">
            {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
              ? 'Try adjusting your search or filters to find what you\'re looking for.'
              : 'Get started by creating your first task.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task, index) => (
            <motion.div
              key={task._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-xl p-6 shadow-sm hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Checkbox */}
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${task.status === 'completed'
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-secondary-300 dark:border-secondary-600 hover:border-green-500'
                        }`}
                    >
                      {task.status === 'completed' && <CheckIcon className="w-3 h-3" />}
                    </button>

                    {/* Task Content */}
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold mb-2 ${task.status === 'completed'
                        ? 'line-through text-secondary-500'
                        : 'text-secondary-900 dark:text-secondary-100'
                        }`}>
                        {task.title}
                      </h3>

                      {task.description && (
                        <p className="text-secondary-600 dark:text-secondary-400 mb-3">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                          {task.priority || 'medium'}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                          {task.status ? task.status.replace('-', ' ') : 'in-progress'}
                        </span>
                      </div>

                      {task.due && (
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-secondary-400" />
                          <span className="text-sm text-secondary-600 dark:text-secondary-400">
                            Due: {formatDate(task.due)}
                          </span>
                        </div>
                      )}

                      {task.assignee && (
                        <div className="flex items-center gap-2 mt-2">
                          <svg className="w-4 h-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-sm text-secondary-600 dark:text-secondary-400">
                            Assigned to: {task.assignee.fullname || task.assignee.username || 'Unknown'}
                          </span>
                        </div>
                      )}

                      {task.tags && task.tags.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <TagIcon className="w-4 h-4 text-secondary-400" />
                          <div className="flex gap-1">
                            {task.tags.map((tag, tagIndex) => (
                              <span
                                key={`${task._id}-tag-${tag}-${tagIndex}`}
                                className="px-2 py-1 text-xs bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditTask(task)}
                    className="p-2 text-secondary-600 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task)}
                    className="p-2 text-secondary-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Task Modal */}
      <TaskFormModal
        isOpen={showTaskModal}
        task={editingTask}
        onSubmit={handleTaskSubmit}
        onClose={() => {
          setShowTaskModal(false);
          setEditingTask(null);
        }}
        loading={submitting}
      />
    </div>
  );
};

export default Tasks;