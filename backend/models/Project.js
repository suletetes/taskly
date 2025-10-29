import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Project name is required"],
            trim: true,
            maxlength: [100, "Project name cannot exceed 100 characters"],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [1000, "Description cannot exceed 1000 characters"],
            default: "",
        },
        color: {
            type: String,
            default: "#3b82f6", // Default blue color
            match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Please provide a valid hex color"],
        },
        icon: {
            type: String,
            default: "folder", // Icon identifier
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
            default: null,
        },
        
        // Project members (if not part of a team)
        members: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            role: {
                type: String,
                enum: ['owner', 'admin', 'member', 'viewer'],
                default: 'member',
            },
            addedAt: {
                type: Date,
                default: Date.now,
            },
            permissions: {
                type: [String],
                default: ['read', 'create'],
            },
        }],
        
        // Project settings
        settings: {
            defaultPriority: {
                type: String,
                enum: ['low', 'medium', 'high'],
                default: 'medium',
            },
            autoAssign: {
                type: Boolean,
                default: false,
            },
            notifications: {
                type: Boolean,
                default: true,
            },
            visibility: {
                type: String,
                enum: ['private', 'team', 'public'],
                default: 'private',
            },
            allowComments: {
                type: Boolean,
                default: true,
            },
            requireApproval: {
                type: Boolean,
                default: false,
            },
        },
        
        // Project status and dates
        status: {
            type: String,
            enum: ['planning', 'active', 'on-hold', 'completed', 'archived'],
            default: 'planning',
        },
        startDate: {
            type: Date,
            default: null,
        },
        endDate: {
            type: Date,
            default: null,
        },
        deadline: {
            type: Date,
            default: null,
        },
        
        // Analytics and statistics
        stats: {
            totalTasks: {
                type: Number,
                default: 0,
            },
            completedTasks: {
                type: Number,
                default: 0,
            },
            overdueTasks: {
                type: Number,
                default: 0,
            },
            averageCompletionTime: {
                type: Number, // in minutes
                default: 0,
            },
            completionRate: {
                type: Number,
                default: 0,
            },
            lastActivity: {
                type: Date,
                default: Date.now,
            },
        },
        
        // Project tags and categories
        tags: {
            type: [String],
            default: [],
        },
        category: {
            type: String,
            default: "general",
        },
        
        // Archive information
        archived: {
            type: Boolean,
            default: false,
        },
        archivedAt: {
            type: Date,
            default: null,
        },
        archivedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    { 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Indexes for performance
projectSchema.index({ owner: 1, status: 1 });
projectSchema.index({ team: 1, status: 1 });
projectSchema.index({ 'members.user': 1 });
projectSchema.index({ archived: 1, status: 1 });

// Virtual for progress percentage
projectSchema.virtual('progress').get(function () {
    if (this.stats.totalTasks === 0) return 0;
    return Math.round((this.stats.completedTasks / this.stats.totalTasks) * 100);
});

// Virtual for overdue status
projectSchema.virtual('isOverdue').get(function () {
    return this.deadline && new Date() > this.deadline && this.status !== 'completed';
});

// Virtual for days remaining
projectSchema.virtual('daysRemaining').get(function () {
    if (!this.deadline || this.status === 'completed') return null;
    const now = new Date();
    const remaining = this.deadline - now;
    return Math.ceil(remaining / (1000 * 60 * 60 * 24));
});

// Method to add member
projectSchema.methods.addMember = function (userId, role = 'member', permissions = ['read', 'create']) {
    const existingMember = this.members.find(m => m.user.toString() === userId.toString());
    if (existingMember) {
        throw new Error('User is already a member of this project');
    }
    
    this.members.push({
        user: userId,
        role,
        permissions,
    });
    
    return this.save();
};

// Method to remove member
projectSchema.methods.removeMember = function (userId) {
    this.members = this.members.filter(m => m.user.toString() !== userId.toString());
    return this.save();
};

// Method to update member role
projectSchema.methods.updateMemberRole = function (userId, role, permissions) {
    const member = this.members.find(m => m.user.toString() === userId.toString());
    if (!member) {
        throw new Error('User is not a member of this project');
    }
    
    member.role = role;
    if (permissions) {
        member.permissions = permissions;
    }
    
    return this.save();
};

// Method to update statistics
projectSchema.methods.updateStats = function (totalTasks, completedTasks, overdueTasks, avgCompletionTime) {
    this.stats.totalTasks = totalTasks || 0;
    this.stats.completedTasks = completedTasks || 0;
    this.stats.overdueTasks = overdueTasks || 0;
    this.stats.averageCompletionTime = avgCompletionTime || 0;
    this.stats.completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    this.stats.lastActivity = new Date();
    
    return this.save();
};

// Method to archive project
projectSchema.methods.archive = function (userId) {
    this.archived = true;
    this.archivedAt = new Date();
    this.archivedBy = userId;
    this.status = 'archived';
    return this.save();
};

// Method to restore project
projectSchema.methods.restore = function () {
    this.archived = false;
    this.archivedAt = null;
    this.archivedBy = null;
    this.status = 'active';
    return this.save();
};

// Static method to find projects by user
projectSchema.statics.findByUser = function (userId) {
    return this.find({
        $or: [
            { owner: userId },
            { 'members.user': userId }
        ],
        archived: false
    }).populate('owner', 'fullname username avatar')
      .populate('members.user', 'fullname username avatar')
      .populate('team', 'name');
};

const Project = mongoose.model("Project", projectSchema);
export default Project;