import React from 'react';
import { motion } from 'framer-motion';
import { UserMinusIcon } from '@heroicons/react/24/outline';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';

const TeamMembersList = ({ members, onRemoveMember }) => {
  return (
    <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-6">
      <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
        Team Members
      </h3>

      <div className="space-y-3">
        {members && members.length > 0 ? (
          members.map((member, index) => (
            <motion.div
              key={member.user._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-900 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <Avatar
                  src={member.user.avatar}
                  name={member.user.fullname}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-secondary-900 dark:text-secondary-100 truncate">
                    {member.user.fullname}
                  </p>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 truncate">
                    @{member.user.username}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                {/* Role Badge */}
                <Badge variant="secondary" size="sm">
                  {member.role}
                </Badge>

                {/* Task Count */}
                <div className="text-xs text-secondary-600 dark:text-secondary-400 px-2 py-1 bg-secondary-200 dark:bg-secondary-700 rounded">
                  {member.completedTaskCount}/{member.taskCount}
                </div>

                {/* Remove Button */}
                {onRemoveMember && member.role !== 'owner' && (
                  <button
                    onClick={() => onRemoveMember(member.user._id)}
                    className="p-1 text-secondary-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Remove member"
                  >
                    <UserMinusIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-6">
            <p className="text-secondary-500 dark:text-secondary-400">
              No team members yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamMembersList;
