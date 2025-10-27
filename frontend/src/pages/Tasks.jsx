import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  ViewColumnsIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import { Button } from '../components/ui/Button';

const Tasks = () => {
  const [view, setView] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');

  const mockTasks = [
    {
      id: 1,
      title: 'Complete project documentation',
      description: 'Write comprehensive documentation for the new feature',
      priority: 'high',
      status: 'in-progress',
      dueDate: '2024-01-20',
      tags: ['documentation', 'project']
    },
    {
      id: 2,
      title: 'Review pull requests',
      description: 'Review and approve pending pull requests',
      priority: 'medium',
      status: 'todo',
      dueDate: '2024-01-18',
      tags: ['review', 'code']
    },
    {
      id: 3,
      title: 'Update dependencies',
      description: 'Update all project dependencies to latest versions',
      priority: 'low',
      status: 'completed',
      dueDate: '2024-01-15',
      tags: ['maintenance', 'dependencies']
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-error-600 bg-error-100 dark:bg-error-900/20';
      case 'medium': return 'text-warning-600 bg-warning-100 dark:bg-warning-900/20';
      case 'low': return 'text-success-600 bg-success-100 dark:bg-success-900/20';
      default: return 'text-secondary-600 bg-secondary-100 dark:bg-secondary-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-success-600 bg-success-100 dark:bg-success-900/20';
      case 'in-progress': return 'text-info-600 bg-info-100 dark:bg-info-900/20';
      case 'todo': return 'text-secondary-600 bg-secondary-100 dark:bg-secondary-800';
      default: return 'text-secondary-600 bg-secondary-100 dark:bg-secondary-800';
    }
  };

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
        <Button leftIcon={<PlusIcon className="w-4 h-4" />}>
          New Task
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-64"
            />
          </div>

          {/* Filter */}
          <Button variant="outline" leftIcon={<FunnelIcon className="w-4 h-4" />}>
            Filter
          </Button>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={view === 'list' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setView('list')}
            leftIcon={<ListBulletIcon className="w-4 h-4" />}
          >
            List
          </Button>
          <Button
            variant={view === 'board' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setView('board')}
            leftIcon={<ViewColumnsIcon className="w-4 h-4" />}
          >
            Board
          </Button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {mockTasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card p-6 hover:shadow-medium transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                    {task.title}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>
                <p className="text-secondary-600 dark:text-secondary-400 mb-3">
                  {task.description}
                </p>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-secondary-500 dark:text-secondary-400">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    {task.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {mockTasks.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <ListBulletIcon className="w-8 h-8 text-secondary-400" />
          </div>
          <h3 className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">
            No tasks found
          </h3>
          <p className="text-secondary-600 dark:text-secondary-400 mb-6">
            Get started by creating your first task.
          </p>
          <Button leftIcon={<PlusIcon className="w-4 h-4" />}>
            Create Task
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default Tasks;