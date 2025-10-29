import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LinkIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowPathIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui';

const WebhookManager = ({ className = '' }) => {
  const [webhooks, setWebhooks] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState(null);
  const [showLogs, setShowLogs] = useState(false);
  const [webhookLogs, setWebhookLogs] = useState([]);
  
  // Sample webhooks
  useEffect(() => {
    const sampleWebhooks = [
      {
        id: 'webhook-1',
        name: 'Slack Notifications',
        url: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
        events: ['task.created', 'task.completed', 'task.overdue'],
        isActive: true,
        secret: 'whsec_1234567890abcdef',
        createdAt: new Date('2024-01-15'),
        lastTriggered: new Date(Date.now() - 30 * 60 * 1000),
        successCount: 45,
        failureCount: 2,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'TaskFlow-Webhook/1.0'
        }
      },
      {
        id: 'webhook-2',
        name: 'Project Management Tool',
        url: 'https://api.projecttool.com/webhooks/taskflow',
        events: ['project.created', 'project.completed'],
        isActive: true,
        secret: 'whsec_abcdef1234567890',
        createdAt: new Date('2024-01-10'),
        lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000),
        successCount: 23,
        failureCount: 0,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token123'
        }
      },
      {
        id: 'webhook-3',
        name: 'Analytics Dashboard',
        url: 'https://analytics.company.com/api/webhooks/tasks',
        events: ['task.created', 'task.updated', 'task.deleted'],
        isActive: false,
        secret: 'whsec_fedcba0987654321',
        createdAt: new Date('2024-01-05'),
        lastTriggered: null,
        successCount: 0,
        failureCount: 0,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    ];
    
    setWebhooks(sampleWebhooks);
    
    // Sample webhook logs
    setWebhookLogs([
      {
        id: 'log-1',
        webhookId: 'webhook-1',
        event: 'task.completed',
        status: 'success',
        statusCode: 200,
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        responseTime: 245,
        payload: { taskId: 'task-123', title: 'Complete project proposal' },
        response: { success: true, message: 'Notification sent' }
      },
      {
        id: 'log-2',
        webhookId: 'webhook-1',
        event: 'task.created',
        status: 'success',
        statusCode: 200,
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        responseTime: 189,
        payload: { taskId: 'task-124', title: 'Review budget proposal' },
        response: { success: true, message: 'Notification sent' }
      },
      {
        id: 'log-3',
        webhookId: 'webhook-2',
        event: 'project.created',
        status: 'failure',
        statusCode: 500,
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        responseTime: 5000,
        payload: { projectId: 'project-456', name: 'Website Redesign' },
        response: { error: 'Internal server error' }
      }
    ]);
  }, []);
  
  const availableEvents = [
    { id: 'task.created', name: 'Task Created', description: 'When a new task is created' },
    { id: 'task.updated', name: 'Task Updated', description: 'When a task is modified' },
    { id: 'task.completed', name: 'Task Completed', description: 'When a task is completed' },
    { id: 'task.deleted', name: 'Task Deleted', description: 'When a task is deleted' },
    { id: 'task.overdue', name: 'Task Overdue', description: 'When a task becomes overdue' },
    { id: 'project.created', name: 'Project Created', description: 'When a new project is created' },
    { id: 'project.updated', name: 'Project Updated', description: 'When a project is modified' },
    { id: 'project.completed', name: 'Project Completed', description: 'When a project is completed' },
    { id: 'user.created', name: 'User Created', description: 'When a new user joins' },
    { id: 'team.updated', name: 'Team Updated', description: 'When team membership changes' }
  ];
  
  const toggleWebhook = (webhookId) => {
    setWebhooks(prev =>
      prev.map(webhook =>
        webhook.id === webhookId
          ? { ...webhook, isActive: !webhook.isActive }
          : webhook
      )
    );
  };
  
  const deleteWebhook = (webhookId) => {
    setWebhooks(prev => prev.filter(webhook => webhook.id !== webhookId));
  };
  
  const testWebhook = async (webhookId) => {
    const webhook = webhooks.find(w => w.id === webhookId);
    if (!webhook) return;
    
    // Simulate webhook test
    const testPayload = {
      event: 'webhook.test',
      timestamp: new Date().toISOString(),
      data: {
        message: 'This is a test webhook from TaskFlow',
        webhookId: webhook.id
      }
    };
    
    console.log('Testing webhook:', webhook.url, testPayload);
    
    // Add test log entry
    const testLog = {
      id: `log-test-${Date.now()}`,
      webhookId: webhook.id,
      event: 'webhook.test',
      status: 'success',
      statusCode: 200,
      timestamp: new Date(),
      responseTime: 156,
      payload: testPayload,
      response: { success: true, message: 'Test webhook received' }
    };
    
    setWebhookLogs(prev => [testLog, ...prev]);
  };
  
  const copyWebhookUrl = (url) => {
    navigator.clipboard.writeText(url);
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'text-success-600 dark:text-success-400';
      case 'failure':
        return 'text-error-600 dark:text-error-400';
      default:
        return 'text-secondary-600 dark:text-secondary-400';
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return CheckCircleIcon;
      case 'failure':
        return ExclamationTriangleIcon;
      default:
        return ClockIcon;
    }
  };
  
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Never';
    
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };
  
  const CreateWebhookModal = () => {
    const [newWebhook, setNewWebhook] = useState({
      name: '',
      url: '',
      events: [],
      secret: '',
      headers: {},
      isActive: true
    });
    
    const [customHeader, setCustomHeader] = useState({ key: '', value: '' });
    
    const handleSubmit = (e) => {
      e.preventDefault();
      
      const webhook = {
        ...newWebhook,
        id: `webhook-${Date.now()}`,
        createdAt: new Date(),
        lastTriggered: null,
        successCount: 0,
        failureCount: 0
      };
      
      setWebhooks(prev => [...prev, webhook]);
      setShowCreateModal(false);
      
      // Reset form
      setNewWebhook({
        name: '',
        url: '',
        events: [],
        secret: '',
        headers: {},
        isActive: true
      });
    };
    
    const toggleEvent = (eventId) => {
      setNewWebhook(prev => ({
        ...prev,
        events: prev.events.includes(eventId)
          ? prev.events.filter(e => e !== eventId)
          : [...prev.events, eventId]
      }));
    };
    
    const addCustomHeader = () => {
      if (customHeader.key && customHeader.value) {
        setNewWebhook(prev => ({
          ...prev,
          headers: {
            ...prev.headers,
            [customHeader.key]: customHeader.value
          }
        }));
        setCustomHeader({ key: '', value: '' });
      }
    };
    
    const removeHeader = (key) => {
      setNewWebhook(prev => {
        const newHeaders = { ...prev.headers };
        delete newHeaders[key];
        return { ...prev, headers: newHeaders };
      });
    };
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl bg-white dark:bg-secondary-800 rounded-xl shadow-2xl border border-secondary-200 dark:border-secondary-700 max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                Create Webhook
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </Button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Webhook Name
                  </label>
                  <input
                    type="text"
                    value={newWebhook.name}
                    onChange={(e) => setNewWebhook(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Webhook URL
                  </label>
                  <input
                    type="url"
                    value={newWebhook.url}
                    onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
                    className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100"
                    placeholder="https://your-app.com/webhooks/taskflow"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Secret (Optional)
                  </label>
                  <input
                    type="text"
                    value={newWebhook.secret}
                    onChange={(e) => setNewWebhook(prev => ({ ...prev, secret: e.target.value }))}
                    className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100"
                    placeholder="whsec_..."
                  />
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                    Used to verify webhook authenticity
                  </p>
                </div>
              </div>
              
              {/* Events */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-3">
                  Events to Subscribe
                </label>
                
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {availableEvents.map((event) => (
                    <label key={event.id} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newWebhook.events.includes(event.id)}
                        onChange={() => toggleEvent(event.id)}
                        className="rounded border-secondary-300 dark:border-secondary-600"
                      />
                      <div>
                        <div className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                          {event.name}
                        </div>
                        <div className="text-xs text-secondary-500 dark:text-secondary-400">
                          {event.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Custom Headers */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-3">
                  Custom Headers
                </label>
                
                {/* Existing Headers */}
                {Object.entries(newWebhook.headers).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={key}
                      readOnly
                      className="flex-1 px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-secondary-50 dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100"
                    />
                    <input
                      type="text"
                      value={value}
                      readOnly
                      className="flex-1 px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-secondary-50 dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeHeader(key)}
                      className="p-2 text-error-600"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                
                {/* Add New Header */}
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Header name"
                    value={customHeader.key}
                    onChange={(e) => setCustomHeader(prev => ({ ...prev, key: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100"
                  />
                  <input
                    type="text"
                    placeholder="Header value"
                    value={customHeader.value}
                    onChange={(e) => setCustomHeader(prev => ({ ...prev, value: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addCustomHeader}
                    disabled={!customHeader.key || !customHeader.value}
                  >
                    <PlusIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Submit */}
              <div className="flex space-x-3 pt-4">
                <Button type="submit" variant="primary" className="flex-1">
                  Create Webhook
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    );
  };
  
  return (
    <div className={`bg-white dark:bg-secondary-800 rounded-xl p-6 border border-secondary-200 dark:border-secondary-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
            <LinkIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
              Webhooks
            </h3>
            <p className="text-sm text-secondary-600 dark:text-secondary-400">
              {webhooks.length} webhook{webhooks.length !== 1 ? 's' : ''} • {webhooks.filter(w => w.isActive).length} active
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLogs(!showLogs)}
          >
            <EyeIcon className="w-4 h-4 mr-2" />
            Logs
          </Button>
          
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCreateModal(true)}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Webhook
          </Button>
        </div>
      </div>
      
      {/* Webhooks List */}
      <div className="space-y-4 mb-6">
        {webhooks.map((webhook) => (
          <motion.div
            key={webhook.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
              p-4 rounded-lg border transition-all duration-200
              ${webhook.isActive 
                ? 'border-success-200 dark:border-success-800 bg-success-50 dark:bg-success-900/10' 
                : 'border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-700/50'
              }
            `}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="text-sm font-semibold text-secondary-900 dark:text-secondary-100">
                    {webhook.name}
                  </h4>
                  <span className={`
                    text-xs px-2 py-1 rounded-full
                    ${webhook.isActive 
                      ? 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-300' 
                      : 'bg-secondary-200 text-secondary-700 dark:bg-secondary-600 dark:text-secondary-300'
                    }
                  `}>
                    {webhook.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 mb-2">
                  <code className="text-xs bg-secondary-100 dark:bg-secondary-700 px-2 py-1 rounded font-mono text-secondary-700 dark:text-secondary-300">
                    {webhook.url.length > 50 ? `${webhook.url.substring(0, 50)}...` : webhook.url}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyWebhookUrl(webhook.url)}
                    className="p-1"
                  >
                    <DocumentDuplicateIcon className="w-3 h-3" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-2">
                  {webhook.events.slice(0, 3).map((event) => (
                    <span key={event} className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 rounded">
                      {event}
                    </span>
                  ))}
                  {webhook.events.length > 3 && (
                    <span className="text-xs text-secondary-500 dark:text-secondary-400">
                      +{webhook.events.length - 3} more
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => testWebhook(webhook.id)}
                  className="p-2"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleWebhook(webhook.id)}
                  className="p-2"
                >
                  <Cog6ToothIcon className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteWebhook(webhook.id)}
                  className="p-2 text-error-600 hover:text-error-700"
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex items-center justify-between pt-3 border-t border-secondary-200 dark:border-secondary-600">
              <div className="flex items-center space-x-4 text-xs text-secondary-500 dark:text-secondary-400">
                <div className="flex items-center space-x-1">
                  <CheckCircleIcon className="w-3 h-3 text-success-500" />
                  <span>{webhook.successCount} success</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ExclamationTriangleIcon className="w-3 h-3 text-error-500" />
                  <span>{webhook.failureCount} failed</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ClockIcon className="w-3 h-3" />
                  <span>Last: {formatTimestamp(webhook.lastTriggered)}</span>
                </div>
              </div>
              
              <span className="text-xs text-secondary-400 dark:text-secondary-500">
                Created {webhook.createdAt.toLocaleDateString()}
              </span>
            </div>
          </motion.div>
        ))}
        
        {webhooks.length === 0 && (
          <div className="text-center py-8">
            <LinkIcon className="w-12 h-12 text-secondary-300 dark:text-secondary-600 mx-auto mb-3" />
            <p className="text-secondary-500 dark:text-secondary-400">
              No webhooks configured
            </p>
            <p className="text-xs text-secondary-400 dark:text-secondary-500 mt-1">
              Add webhooks to integrate with external services
            </p>
          </div>
        )}
      </div>
      
      {/* Webhook Logs */}
      <AnimatePresence>
        {showLogs && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-6 border-t border-secondary-200 dark:border-secondary-700"
          >
            <h4 className="text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-4">
              Recent Webhook Logs
            </h4>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {webhookLogs.slice(0, 10).map((log) => {
                const StatusIcon = getStatusIcon(log.status);
                const webhook = webhooks.find(w => w.id === log.webhookId);
                
                return (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        log.status === 'success' 
                          ? 'bg-success-100 dark:bg-success-900/20' 
                          : 'bg-error-100 dark:bg-error-900/20'
                      }`}>
                        <StatusIcon className={`w-3 h-3 ${getStatusColor(log.status)}`} />
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                          {webhook?.name || 'Unknown Webhook'}
                        </div>
                        <div className="text-xs text-secondary-500 dark:text-secondary-400">
                          {log.event} • {log.statusCode} • {log.responseTime}ms
                        </div>
                      </div>
                    </div>
                    
                    <span className="text-xs text-secondary-500 dark:text-secondary-400">
                      {formatTimestamp(log.timestamp)}
                    </span>
                  </div>
                );
              })}
              
              {webhookLogs.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-secondary-500 dark:text-secondary-400">
                    No webhook logs yet
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Create Webhook Modal */}
      <AnimatePresence>
        {showCreateModal && <CreateWebhookModal />}
      </AnimatePresence>
    </div>
  );
};

export default WebhookManager;