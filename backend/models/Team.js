import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Team name is required"],
            trim: true,
            maxlength: [100, "Team name cannot exceed 100 characters"],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [1000, "Description cannot exceed 1000 characters"],
            default: "",
        },
        avatar: {
            type: String,
            default: null,
        },
        avatarPublicId: {
            type: String,
            default: null,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        
        // Team members with roles and permissions
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
            joinedAt: {
                type: Date,
                default: Date.now,
            },
            invitedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                default: null,
            },
            permissions: {
                type: [String],
                default: ['read', 'create', 'comment'],
            },
            status: {
                type: String,
                enum: ['active', 'inactive', 'pending'],
                default: 'active',
            },
        }],
        
        // Team settings
        settings: {
            visibility: {
                type: String,
                enum: ['private', 'public'],
                default: 'private',
            },
            allowInvites: {
                type: Boolean,
                default: true,
            },
            defaultRole: {
                type: String,
                enum: ['member', 'viewer'],
                default: 'member',
            },
            requireApproval: {
                type: Boolean,
                default: false,
            },
            allowPublicProjects: {
                type: Boolean,
                default: false,
            },
            maxMembers: {
                type: Number,
                default: 50,
            },
        },
        
        // Team statistics
        stats: {
            totalMembers: {
                type: Number,
                default: 1, // Owner counts as 1
            },
            activeMembers: {
                type: Number,
                default: 1,
            },
            totalProjects: {
                type: Number,
                default: 0,
            },
            completedTasks: {
                type: Number,
                default: 0,
            },
            totalTasks: {
                type: Number,
                default: 0,
            },
            averageProductivity: {
                type: Number,
                default: 0,
            },
            lastActivity: {
                type: Date,
                default: Date.now,
            },
        },
        
        // Team categories and tags
        category: {
            type: String,
            default: "general",
        },
        tags: {
            type: [String],
            default: [],
        },
        
        // Invitation settings
        inviteCode: {
            type: String,
            unique: true,
            sparse: true,
        },
        inviteCodeExpires: {
            type: Date,
            default: null,
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
teamSchema.index({ owner: 1 });
teamSchema.index({ 'members.user': 1 });
teamSchema.index({ inviteCode: 1 });
teamSchema.index({ archived: 1 });

// Virtual for completion rate
teamSchema.virtual('completionRate').get(function () {
    if (this.stats.totalTasks === 0) return 0;
    return Math.round((this.stats.completedTasks / this.stats.totalTasks) * 100);
});

// Pre-save hook to update member count
teamSchema.pre('save', function (next) {
    this.stats.totalMembers = this.members.length;
    this.stats.activeMembers = this.members.filter(m => m.status === 'active').length;
    next();
});

// Method to add member
teamSchema.methods.addMember = function (userId, role = 'member', invitedBy = null, permissions = ['read', 'create', 'comment']) {
    const existingMember = this.members.find(m => m.user.toString() === userId.toString());
    if (existingMember) {
        throw new Error('User is already a member of this team');
    }
    
    if (this.members.length >= this.settings.maxMembers) {
        throw new Error('Team has reached maximum member limit');
    }
    
    this.members.push({
        user: userId,
        role,
        invitedBy,
        permissions,
        status: this.settings.requireApproval ? 'pending' : 'active',
    });
    
    return this.save();
};

// Method to remove member
teamSchema.methods.removeMember = function (userId) {
    if (this.owner.toString() === userId.toString()) {
        throw new Error('Cannot remove team owner');
    }
    
    this.members = this.members.filter(m => m.user.toString() !== userId.toString());
    return this.save();
};

// Method to update member role
teamSchema.methods.updateMemberRole = function (userId, role, permissions) {
    const member = this.members.find(m => m.user.toString() === userId.toString());
    if (!member) {
        throw new Error('User is not a member of this team');
    }
    
    member.role = role;
    if (permissions) {
        member.permissions = permissions;
    }
    
    return this.save();
};

// Method to approve pending member
teamSchema.methods.approveMember = function (userId) {
    const member = this.members.find(m => m.user.toString() === userId.toString());
    if (!member) {
        throw new Error('User is not a member of this team');
    }
    
    member.status = 'active';
    return this.save();
};

// Method to generate invite code
teamSchema.methods.generateInviteCode = function (expiresInDays = 7) {
    this.inviteCode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    this.inviteCodeExpires = new Date(Date.now() + (expiresInDays * 24 * 60 * 60 * 1000));
    return this.save();
};

// Method to revoke invite code
teamSchema.methods.revokeInviteCode = function () {
    this.inviteCode = undefined;
    this.inviteCodeExpires = undefined;
    return this.save();
};

// Method to check if user can join via invite code
teamSchema.methods.canJoinWithCode = function (code) {
    return this.inviteCode === code && 
           this.inviteCodeExpires && 
           this.inviteCodeExpires > new Date() &&
           this.settings.allowInvites;
};

// Method to update team statistics
teamSchema.methods.updateStats = function (totalProjects, completedTasks, totalTasks, avgProductivity) {
    this.stats.totalProjects = totalProjects || 0;
    this.stats.completedTasks = completedTasks || 0;
    this.stats.totalTasks = totalTasks || 0;
    this.stats.averageProductivity = avgProductivity || 0;
    this.stats.lastActivity = new Date();
    
    return this.save();
};

// Method to archive team
teamSchema.methods.archive = function (userId) {
    this.archived = true;
    this.archivedAt = new Date();
    this.archivedBy = userId;
    return this.save();
};

// Method to restore team
teamSchema.methods.restore = function () {
    this.archived = false;
    this.archivedAt = null;
    this.archivedBy = null;
    return this.save();
};

// Static method to find teams by user
teamSchema.statics.findByUser = function (userId) {
    return this.find({
        $or: [
            { owner: userId },
            { 'members.user': userId, 'members.status': 'active' }
        ],
        archived: false
    }).populate('owner', 'fullname username avatar')
      .populate('members.user', 'fullname username avatar');
};

// Static method to find by invite code
teamSchema.statics.findByInviteCode = function (code) {
    return this.findOne({
        inviteCode: code,
        inviteCodeExpires: { $gt: new Date() },
        'settings.allowInvites': true,
        archived: false
    });
};

const Team = mongoose.model("Team", teamSchema);
export default Team;