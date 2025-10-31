import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  PlusIcon,
  FolderIcon
} from '@heroicons/react/24/outline';
import { useTeam } from '../context/TeamContext';
import { useAuth } from '../context/AuthContext';
import TeamDashboard from '../components/teams/TeamDashboard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { Button } from '../components/ui';

const TeamDashboardPage = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    currentTeam, 
    loading, 
    errors, 
    fetchTeam,
    canPerformAction 
  } = useTeam();

  useEffect(() => {
    if (teamId) {
      fetchTeam(teamId);
    }
  }, [teamId, fetchTeam]);

  const handleCreateProject = () => {
    navigate(`/teams/${teamId}/projects/new`);
  };

  const handleTeamSettings = () => {
    navigate(`/teams/${teamId}/settings`);
  };

  const handleTeamAnalytics = () => {
    navigate(`/teams/${teamId}/analytics`);
  };

  if (loading.currentTeam) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (errors.currentTeam) {
    return (
      <ErrorMessage 
        message={errors.currentTeam} 
        onRetry={() => fetchTeam(teamId)}
      />
    );
  }

  if (!currentTeam) {
    return (
      <ErrorMessage 
        message="Team not found" 
        action={{
          label: 'Back to Teams',
          onClick: () => navigate('/teams')
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
            <UsersIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">
              {currentTeam.name}
            </h1>
            <p className="text-secondary-600 dark:text-secondary-400 mt-1">
              {currentTeam.description || 'Team Dashboard'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {canPerformAction(teamId, 'create_projects') && (
            <Button
              onClick={handleCreateProject}
              leftIcon={<PlusIcon className="w-4 h-4" />}
            >
              New Project
            </Button>
          )}
          
          <Button
            variant="secondary"
            onClick={handleTeamAnalytics}
            leftIcon={<ChartBarIcon className="w-4 h-4" />}
          >
            Analytics
          </Button>

          {canPerformAction(teamId, 'manage_team_settings') && (
            <Button
              variant="secondary"
              onClick={handleTeamSettings}
              leftIcon={<Cog6ToothIcon className="w-4 h-4" />}
            >
              Settings
            </Button>
          )}
        </div>
      </motion.div>

      {/* Team Dashboard Component */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <TeamDashboard teamId={teamId} />
      </motion.div>
    </div>
  );
};

export default TeamDashboardPage;