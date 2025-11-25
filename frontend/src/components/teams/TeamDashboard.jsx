import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  FolderIcon,
  CheckCircleIcon,
  ClockIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import StatCard from '../common/StatCard';
import TeamMembersList from './TeamMembersList';

const TeamDashboard = ({ teamId }) => {
  const [stats, setStats] = useState(null);
  const [members, setMembers] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [teamId]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch team statistics
      const statsResponse = await api.get(`/teams/${teamId}/stats`);
      console.log('📊 [TeamDashboard] Stats response:', statsResponse.data);
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }

      // Fetch team members
      const membersResponse = await api.get(`/teams/${teamId}/members`);
      console.log('👥 [TeamDashboard] Members response:', membersResponse.data);
      if (membersResponse.data.success) {
        // Handle both response formats
        const membersData = membersResponse.data.data?.members || membersResponse.data.data || [];
        console.log('👥 [TeamDashboard] Members data:', membersData);
        setMembers(membersData);
      }

      // Fetch pending invitations
      try {
        const invitationsResponse = await api.get(`/teams/${teamId}/invitations`, {
          params: { status: 'pending' }
        });
        console.log('📨 [TeamDashboard] Invitations response:', invitationsResponse.data);
        if (invitationsResponse.data.success) {
          const invitationsData = invitationsResponse.data.data?.invitations || invitationsResponse.data.data || [];
          setPendingInvitations(invitationsData);
        }
      } catch (invErr) {
        console.log('📨 [TeamDashboard] No invitations endpoint or error:', invErr.message);
        setPendingInvitations([]);
      }
    } catch (err) {
      console.error('❌ [TeamDashboard] Error fetching dashboard data:', err);
      setError('Failed to load team dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <StatCard
              icon={UsersIcon}
              label="Members"
              value={stats.memberCount}
              color="blue"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <StatCard
              icon={FolderIcon}
              label="Projects"
              value={stats.projectCount}
              color="purple"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StatCard
              icon={CheckCircleIcon}
              label="Completed Tasks"
              value={stats.completedTasks}
              color="green"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <StatCard
              icon={ClockIcon}
              label="Overdue Tasks"
              value={stats.overdueTasks}
              color="red"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <StatCard
              icon={UserPlusIcon}
              label="Active Members"
              value={stats.activeMembers}
              color="indigo"
            />
          </motion.div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Members */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <TeamMembersList members={members} />
        </motion.div>

        {/* Pending Invitations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-6"
        >
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            Pending Invitations
          </h3>

          {pendingInvitations.length > 0 ? (
            <div className="space-y-3">
              {pendingInvitations.map((invitation) => (
                <div
                  key={invitation._id}
                  className="p-3 bg-secondary-50 dark:bg-secondary-900 rounded-lg"
                >
                  <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                    {invitation.invitee.fullname}
                  </p>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400">
                    @{invitation.invitee.username}
                  </p>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                    Role: <span className="capitalize font-medium">{invitation.role}</span>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <CheckCircleIcon className="w-8 h-8 text-secondary-300 dark:text-secondary-600 mx-auto mb-2" />
              <p className="text-sm text-secondary-500 dark:text-secondary-400">
                No pending invitations
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TeamDashboard;
