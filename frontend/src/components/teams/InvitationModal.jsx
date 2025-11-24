import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Avatar from '../common/Avatar';
import { useApi } from '../../hooks/useApi';

const InvitationModal = ({ isOpen, onClose, user, team }) => {
  const [role, setRole] = useState('member');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const { api } = useApi();

  const handleSendInvitation = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/teams/${team._id}/invitations`, {
        userId: user._id,
        role,
        message: message || undefined
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setRole('member');
          setMessage('');
        }, 2000);
      }
    } catch (err) {
      console.error('Error sending invitation:', err);
      setError(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-secondary-800 rounded-lg shadow-xl max-w-md w-full"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-200 dark:border-secondary-700">
          <h2 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100">
            Invite to Team
          </h2>
          <button
            onClick={onClose}
            className="text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {success ? (
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex justify-center mb-4"
              >
                <CheckCircleIcon className="w-16 h-16 text-green-500" />
              </motion.div>
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                Invitation Sent!
              </h3>
              <p className="text-secondary-600 dark:text-secondary-400">
                {user.fullname} will receive an invitation to join {team.name}
              </p>
            </div>
          ) : (
            <>
              {/* User Preview */}
              <div className="flex items-center space-x-4 p-4 bg-secondary-50 dark:bg-secondary-900 rounded-lg">
                <Avatar
                  src={user.avatar}
                  name={user.fullname}
                  size="lg"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">
                    {user.fullname}
                  </h3>
                  <p className="text-sm text-secondary-500 dark:text-secondary-400">
                    @{user.username}
                  </p>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Team Preview */}
              <div className="flex items-center space-x-4 p-4 bg-secondary-50 dark:bg-secondary-900 rounded-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold">
                    {team.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">
                    {team.name}
                  </h3>
                  <p className="text-sm text-secondary-500 dark:text-secondary-400 truncate">
                    {team.description || 'No description'}
                  </p>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-secondary-900 dark:text-secondary-100 mb-2">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2 bg-secondary-50 dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-secondary-100"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
                <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                  {role === 'admin'
                    ? 'Admins can manage team members and projects'
                    : 'Members can participate in projects and tasks'}
                </p>
              </div>

              {/* Message Input */}
              <div>
                <label className="block text-sm font-medium text-secondary-900 dark:text-secondary-100 mb-2">
                  Personal Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, 500))}
                  placeholder="Add a personal message to the invitation..."
                  maxLength={500}
                  rows={3}
                  className="w-full px-4 py-2 bg-secondary-50 dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-secondary-100 resize-none"
                />
                <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                  {message.length}/500 characters
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-secondary-200 dark:border-secondary-700">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSendInvitation}
              disabled={loading}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <span>Send Invitation</span>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default InvitationModal;
