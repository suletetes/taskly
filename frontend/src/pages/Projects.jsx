import React from 'react';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  FolderIcon,
  UsersIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { Button } from '../components/ui/Button';

const Projects = () => {
  const mockProjects = [
    {
      id: 1,
      name: 'Website Redesign',
      description: 'Complete redesign of the company website with modern UI/UX',
      status: 'active',
      progress: 75,
      members: 5,
      dueDate: '2024-02-15',
      color: 'bg-primary-500'
    },
    {
      id: 2,
      name: 'Mobile App Development',
      description: 'Native mobile application for iOS and Android platforms',
      status: 'active',
      progress: 45,
      members: 8,
      dueDate: '2024-03-30',
      color: 'bg-success-500'
    },
    {
      id: 3,
      name: 'API Documentation',
      description: 'Comprehensive API documentation for developers',
      status: 'completed',
      progress: 100,
      members: 3,
      dueDate: '2024-01-10',
      color: 'bg-info-500'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-success-600 bg-success-100 dark:bg-success-900/20';
      case 'completed': return 'text-info-600 bg-info-100 dark:bg-info-900/20';
      case 'on-hold': return 'text-warning-600 bg-warning-100 dark:bg-warning-900/20';
      default: return 'text-secondary-600 bg-secondary-100 dark:bg-secondary-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
            Projects
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            Organize and track your projects effectively.
          </p>
        </div>
        <Button leftIcon={<PlusIcon className="w-4 h-4" />}>
          New Project
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card p-6 hover:shadow-medium transition-shadow cursor-pointer"
          >
            {/* Project Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className={`w-3 h-3 ${project.color} rounded-full mr-3`}></div>
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                    {project.name}
                  </h3>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Project Description */}
            <p className="text-secondary-600 dark:text-secondary-400 mb-4 text-sm">
              {project.description}
            </p>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                  Progress
                </span>
                <span className="text-sm text-secondary-500 dark:text-secondary-400">
                  {project.progress}%
                </span>
              </div>
              <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${project.color} transition-all duration-300`}
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Project Meta */}
            <div className="flex items-center justify-between text-sm text-secondary-500 dark:text-secondary-400">
              <div className="flex items-center">
                <UsersIcon className="w-4 h-4 mr-1" />
                <span>{project.members} members</span>
              </div>
              <div className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-1" />
                <span>{new Date(project.dueDate).toLocaleDateString()}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {mockProjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderIcon className="w-8 h-8 text-secondary-400" />
          </div>
          <h3 className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">
            No projects found
          </h3>
          <p className="text-secondary-600 dark:text-secondary-400 mb-6">
            Create your first project to get started.
          </p>
          <Button leftIcon={<PlusIcon className="w-4 h-4" />}>
            Create Project
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default Projects;