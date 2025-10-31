import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  FolderIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { useTeam } from '../../context/TeamContext';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../layout/DashboardLayout';
import StatCard from '../common/StatCard';
import ActivityFeed from '../common/ActivityFeed';
import Chart from '../common/Chart';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const TeamDashboard = ({ teamId }) => {
  const { user } = useAuth();
  const {
    currentTeam,
    teamStats,
    teamActivity,
    fetchTeam,
    fetchTeamStats,
    fetchTeamActivity,
    loading,
    errors,
    canPerformAction
  } = useTeam();

  const {
    projects,
    fetchProjects,
    loading: projectLoading
  } = useProject();

  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [dashboardData, setDashboardData] = useState({
    overview: {},
    charts: {},
    recentActivity: []
  });

  // Fetch team data on mount
  useEffect(() => {
    if (teamId) {
      fetchTeam(teamId);
      fetchTeamStats(teamId);
      fetchTeamActivity(teamId, { limit: 10 });
      fetchProjects({ teamId });
    }
  }, [teamId, fetchTeam, fetchTeamStats, fetchTeamActivity, fetchProjects]);

  // Process dashboard data
  useEffect(() => {
    if (currentTeam && teamStats && projects) {
      const teamProjects = projects.filter(p => p.team === teamId);
      
      const overview = {
        totalMembers: currentTeam.members?.length || 0,
        totalProjects: teamProjects.length,
        activeProjects: teamProjects.filter(p => p.status === 'active').length,
        completedProjects: teamProjects.filter(p => p.status === 'completed').length,
        totalTasks: teamStats.taskCount || 0,
        completedTasks: teamStats.completedTasks || 0,
        overdueTasks: teamStats.overdueTasks || 0,
        teamProductivity: calculateProductivity(teamStats)
      };

      const charts = {
        projectStatus: generateProjectStatusChart(teamProjects),
        taskProgress: generateTaskProgressChart(teamStats),
        memberActivity: generateMemberActivityChart(currentTeam.members),
        productivity: generateProductivityChart(teamStats, selectedPeriod)
      };

      setDashboardData({
        overview,
        charts,
        recentActivity: teamActivity || []
      });
    }
  }, [currentTeam, teamStats, projects, teamActivity, selectedPeriod, teamId]);

  // Calculate team productivity score
  const calculateProductivity = (stats) => {
    if (!stats || !stats.taskCount) return 0;
    const completionRate = (stats.completedTasks / stats.taskCount) * 100;
    const overdueRate = (stats.overdueTasks / stats.taskCount) * 100;
    return Math.max(0, Math.min(100, completionRate - (overdueRate * 0.5)));
  };

  // Generate chart data
  const generateProjectStatusChart = (teamProjects) => {
    const statusCounts = teamProjects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {});

    return {
      type: 'doughnut',
      data: {
        labels: Object.keys(statusCounts),
        datasets: [{
          data: Object.values(statusCounts),
          backgroundColor: [
            '#10B981', // completed - green
            '#3B82F6', // active - blue
            '#F59E0B', // planning - yellow
            '#EF4444', // on-hold - red
            '#6B7280'  // cancelled - gray
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    };
  };

  const generateTaskProgressChart = (stats) => {
    return {
      type: 'bar',
      data: {
        labels: ['Total', 'Completed', 'In Progress', 'Overdue'],
        datasets: [{
          label: 'Tasks',
          data: [
            stats.taskCount || 0,
            stats.completedTasks || 0,
            (stats.taskCount || 0) - (stats.completedTasks || 0) - (stats.overdueTasks || 0),
            stats.overdueTasks || 0
          ],
          backgroundColor: ['#6B7280', '#10B981', '#3B82F6', '#EF4444']
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    };
  };

  const generateMemberActivityChart = (members) => {
    if (!members) return null;
    
    const activityData = members.map(member => ({
      name: member.user.name,
      activity: Math.floor(Math.random() * 100) // Placeholder - would come from real activity data
    }));

    return {
      type: 'horizontalBar',
      data: {
        labels: activityData.map(m => m.name),
        datasets: [{
          label: 'Activity Score',
          data: activityData.map(m => m.activity),
          backgroundColor: '#3B82F6'
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    };
  };

  const generateProductivityChart = (stats, period) => {
    // Placeholder data - would come from time-series data
    const labels = period === 'week' 
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : period === 'month'
      ? Array.from({ length: 30 }, (_, i) => i + 1)
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

    return {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Productivity Score',
          data: labels.map(() => Math.floor(Math.random() * 40) + 60),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    };
  };

  if (loading.currentTeam || loading.stats || projectLoading.projects) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (errors.currentTeam || errors.stats) {
    return (
      <DashboardLayout>
        <ErrorMessage 
          message={errors.currentTeam || errors.stats} 
          onRetry={() => {
            fetchTeam(teamId);
            fetchTeamStats(teamId);
          }}
        />
      </DashboardLayout>
    );
  }

  if (!currentTeam) {
    return (
      <DashboardLayout>
        <ErrorMessage message="Team not found" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
              {currentTeam.name}
            </h1>
            <p className="text-secondary-600 dark:text-secondary-400 mt-1">
              {currentTeam.description || 'Team Dashboard'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {canPerformAction(teamId, 'manage_settings') && (
              <button className="btn-secondary">
                <Cog6ToothIcon className="w-4 h-4 mr-2" />
                Settings
              </button>
            )}
            {canPerformAction(teamId, 'manage_projects') && (
              <button className="btn-primary">
                <PlusIcon className="w-4 h-4 mr-2" />
                New Project
              </button>
            )}
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Team Members"
            value={dashboardData.overview.totalMembers}
            icon={UsersIcon}
            color="blue"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Active Projects"
            value={dashboardData.overview.activeProjects}
            icon={FolderIcon}
            color="green"
            subtitle={`${dashboardData.overview.totalProjects} total`}
          />
          <StatCard
            title="Tasks Completed"
            value={dashboardData.overview.completedTasks}
            icon={CheckCircleIcon}
            color="emerald"
            subtitle={`${dashboardData.overview.totalTasks} total`}
          />
          <StatCard
            title="Productivity Score"
            value={`${Math.round(dashboardData.overview.teamProductivity)}%`}
            icon={ChartBarIcon}
            color="purple"
            trend={{ 
              value: Math.round(dashboardData.overview.teamProductivity - 75), 
              isPositive: dashboardData.overview.teamProductivity > 75 
            }}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project Status Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-6"
          >
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
              Project Status Distribution
            </h3>
            {dashboardData.charts.projectStatus && (
              <Chart {...dashboardData.charts.projectStatus} />
            )}
          </motion.div>

          {/* Task Progress Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-6"
          >
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
              Task Progress
            </h3>
            {dashboardData.charts.taskProgress && (
              <Chart {...dashboardData.charts.taskProgress} />
            )}
          </motion.div>

          {/* Productivity Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                Productivity Trend
              </h3>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="text-sm border border-secondary-300 dark:border-secondary-600 rounded-md px-3 py-1 bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
            </div>
            {dashboardData.charts.productivity && (
              <Chart {...dashboardData.charts.productivity} />
            )}
          </motion.div>

          {/* Member Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-6"
          >
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
              Member Activity
            </h3>
            {dashboardData.charts.memberActivity && (
              <Chart {...dashboardData.charts.memberActivity} />
            )}
          </motion.div>
        </div>

        {/* Recent Activity and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-6"
          >
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
              Recent Activity
            </h3>
            <ActivityFeed 
              activities={dashboardData.recentActivity}
              loading={loading.activity}
              emptyMessage="No recent activity in this team"
            />
          </motion.div>

          {/* Quick Actions & Team Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            {/* Team Info */}
            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
                Team Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-600 dark:text-secondary-400">Created</span>
                  <span className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                    {new Date(currentTeam.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-600 dark:text-secondary-400">Owner</span>
                  <span className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                    {currentTeam.owner?.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-600 dark:text-secondary-400">Privacy</span>
                  <span className={`text-sm font-medium ${
                    currentTeam.isPrivate 
                      ? 'text-yellow-600 dark:text-yellow-400' 
                      : 'text-green-600 dark:text-green-400'
                  }`}>
                    {currentTeam.isPrivate ? 'Private' : 'Public'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                {canPerformAction(teamId, 'invite_members') && (
                  <button className="w-full btn-secondary justify-start">
                    <UsersIcon className="w-4 h-4 mr-2" />
                    Invite Members
                  </button>
                )}
                {canPerformAction(teamId, 'manage_projects') && (
                  <button className="w-full btn-secondary justify-start">
                    <FolderIcon className="w-4 h-4 mr-2" />
                    Create Project
                  </button>
                )}
                <button className="w-full btn-secondary justify-start">
                  <ChartBarIcon className="w-4 h-4 mr-2" />
                  View Reports
                </button>
              </div>
            </div>

            {/* Alerts */}
            {dashboardData.overview.overdueTasks > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                      Overdue Tasks
                    </h4>
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {dashboardData.overview.overdueTasks} tasks are overdue and need attention
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeamDashboard;