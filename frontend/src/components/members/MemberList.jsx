import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  UserPlusIcon,
  ViewColumnsIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import { useTeam } from '../../context/TeamContext';
import { useProject } from '../../context/ProjectContext';
import MemberCard from './MemberCard';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import EmptyState from '../common/EmptyState';
import SearchInput from '../common/SearchInput';
import FilterDropdown from '../common/FilterDropdown';

const MemberList = ({ 
  teamId, 
  projectId, 
  onMemberSelect, 
  onInviteMember, 
  showInviteButton = true,
  viewMode: initialViewMode = 'grid'
}) => {
  const { 
    currentTeam, 
    loading: teamLoading, 
    errors: teamErrors,
    fetchTeam 
  } = useTeam();
  
  const { 
    currentProject, 
    loading: projectLoading, 
    errors: projectErrors,
    fetchProject 
  } = useProject();

  const [viewMode, setViewMode] = useState(initialViewMode);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Get members from team or project
  const members = React.useMemo(() => {
    if (projectId && currentProject) {
      return currentProject.members || [];
    }
    if (teamId && currentTeam) {
      return currentTeam.members || [];
    }
    return [];
  }, [teamId, projectId, currentTeam, currentProject]);

  // Filter and sort members
  const filteredMembers = React.useMemo(() => {
    let result = [...members];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(member =>
        member.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      result = result.filter(member => member.role === roleFilter);
    }

    // Apply status filter (if available)
    if (statusFilter !== 'all' && statusFilter === 'active') {
      result = result.filter(member => member.user.isActive !== false);
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = a.user.name.toLowerCase();
          bValue = b.user.name.toLowerCase();
          break;
        case 'email':
          aValue = a.user.email.toLowerCase();
          bValue = b.user.email.toLowerCase();
          break;
        case 'role':
          aValue = a.role;
          bValue = b.role;
          break;
        case 'joined':
          aValue = new Date(a.joinedAt || a.createdAt);
          bValue = new Date(b.joinedAt || b.createdAt);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [members, searchTerm, roleFilter, statusFilter, sortBy, sortOrder]);

  // Fetch data on mount
  useEffect(() => {
    if (teamId) {
      fetchTeam(teamId);
    }
    if (projectId) {
      fetchProject(projectId);
    }
  }, [teamId, projectId, fetchTeam, fetchProject]);

  const handleMemberClick = (member) => {
    if (onMemberSelect) {
      onMemberSelect(member);
    }
  };

  const handleInvite = () => {
    if (onInviteMember) {
      onInviteMember();
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Filter options
  const roleOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'owner', label: 'Owner' },
    { value: 'admin', label: 'Admin' },
    { value: 'member', label: 'Member' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  const loading = teamLoading.currentTeam || projectLoading.currentProject;
  const error = teamErrors.currentTeam || projectErrors.currentProject;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={() => {
          if (teamId) fetchTeam(teamId);
          if (projectId) fetchProject(projectId);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
            Members
          </h2>
          <p className="text-secondary-600 dark:text-secondary-400 mt-1">
            {projectId ? 'Project members' : 'Team members'} ({filteredMembers.length})
          </p>
        </div>
        {showInviteButton && (
          <button
            onClick={handleInvite}
            className="btn-primary"
          >
            <UserPlusIcon className="w-4 h-4 mr-2" />
            Invite Member
          </button>
        )}
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search */}
          <div className="w-full sm:w-80">
            <SearchInput
              placeholder="Search members..."
              value={searchTerm}
              onChange={setSearchTerm}
              icon={MagnifyingGlassIcon}
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <FilterDropdown
              label="Role"
              value={roleFilter}
              options={roleOptions}
              onChange={setRoleFilter}
              icon={FunnelIcon}
            />
            <FilterDropdown
              label="Status"
              value={statusFilter}
              options={statusOptions}
              onChange={setStatusFilter}
            />
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md ${
              viewMode === 'grid'
                ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400'
                : 'text-secondary-600 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-secondary-100'
            }`}
          >
            <ViewColumnsIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md ${
              viewMode === 'list'
                ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400'
                : 'text-secondary-600 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-secondary-100'
            }`}
          >
            <ListBulletIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex items-center space-x-4 text-sm">
        <span className="text-secondary-600 dark:text-secondary-400">Sort by:</span>
        <button
          onClick={() => handleSort('name')}
          className={`font-medium ${
            sortBy === 'name'
              ? 'text-primary-600 dark:text-primary-400'
              : 'text-secondary-600 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-secondary-100'
          }`}
        >
          Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => handleSort('role')}
          className={`font-medium ${
            sortBy === 'role'
              ? 'text-primary-600 dark:text-primary-400'
              : 'text-secondary-600 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-secondary-100'
          }`}
        >
          Role {sortBy === 'role' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => handleSort('joined')}
          className={`font-medium ${
            sortBy === 'joined'
              ? 'text-primary-600 dark:text-primary-400'
              : 'text-secondary-600 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-secondary-100'
          }`}
        >
          Joined {sortBy === 'joined' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
      </div>

      {/* Members Grid/List */}
      {filteredMembers.length === 0 ? (
        <EmptyState
          icon={UserPlusIcon}
          title="No members found"
          description={
            searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
              ? "No members match your current filters"
              : projectId
              ? "This project doesn't have any members yet"
              : "This team doesn't have any members yet"
          }
          action={
            showInviteButton && !searchTerm && roleFilter === 'all' && statusFilter === 'all'
              ? {
                  label: 'Invite Member',
                  onClick: handleInvite
                }
              : null
          }
        />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }
          >
            {filteredMembers.map((member, index) => (
              <motion.div
                key={member.user._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <MemberCard
                  member={member}
                  viewMode={viewMode}
                  onClick={() => handleMemberClick(member)}
                  teamId={teamId}
                  projectId={projectId}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default MemberList;