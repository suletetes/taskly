import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Task from "../models/Task.js";
import User from "../models/User.js";
import { getAvatarUrl, initializeAvatars } from "../utils/cloudinarySeeder.js";

// MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/taskly');
        console.log('MongoDB connected successfully.');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

// Random Data Generators
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomDate = (daysFromNow) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date;
};

// Comprehensive user data
const userData = [
    {
        fullname: "John Doe",
        username: "johndoe",
        email: "john@example.com",
        password: "password123",
        avatar: getAvatarUrl(0)
    },
    {
        fullname: "Jane Smith",
        username: "janesmith",
        email: "jane@example.com",
        password: "password123",
        avatar: getAvatarUrl(1)
    },
    {
        fullname: "Mike Johnson",
        username: "mikejohnson",
        email: "mike@example.com",
        password: "password123",
        avatar: getAvatarUrl(2)
    },
    {
        fullname: "Sarah Wilson",
        username: "sarahwilson",
        email: "sarah@example.com",
        password: "password123",
        avatar: getAvatarUrl(3)
    },
    {
        fullname: "David Brown",
        username: "davidbrown",
        email: "david@example.com",
        password: "password123",
        avatar: getAvatarUrl(4)
    },
    {
        fullname: "Emily Davis",
        username: "emilydavis",
        email: "emily@example.com",
        password: "password123",
        avatar: getAvatarUrl(5)
    },
    {
        fullname: "Alex Rodriguez",
        username: "alexrodriguez",
        email: "alex@example.com",
        password: "password123",
        avatar: getAvatarUrl(6)
    },
    {
        fullname: "Lisa Anderson",
        username: "lisaanderson",
        email: "lisa@example.com",
        password: "password123",
        avatar: getAvatarUrl(7)
    },
    {
        fullname: "Chris Taylor",
        username: "christaylor",
        email: "chris@example.com",
        password: "password123",
        avatar: getAvatarUrl(8)
    },
    {
        fullname: "Amanda White",
        username: "amandawhite",
        email: "amanda@example.com",
        password: "password123",
        avatar: getAvatarUrl(9)
    },
    {
        fullname: "Ryan Martinez",
        username: "ryanmartinez",
        email: "ryan@example.com",
        password: "password123",
        avatar: getAvatarUrl(10)
    },
    {
        fullname: "Jessica Garcia",
        username: "jessicagarcia",
        email: "jessica@example.com",
        password: "password123",
        avatar: getAvatarUrl(11)
    },
    {
        fullname: "Kevin Lee",
        username: "kevinlee",
        email: "kevin@example.com",
        password: "password123",
        avatar: getAvatarUrl(12)
    },
    {
        fullname: "Michelle Thompson",
        username: "michellethompson",
        email: "michelle@example.com",
        password: "password123",
        avatar: getAvatarUrl(13)
    },
    {
        fullname: "Daniel Clark",
        username: "danielclark",
        email: "daniel@example.com",
        password: "password123",
        avatar: getAvatarUrl(14)
    }
];

// Comprehensive task templates
const taskTemplates = [
    {
        title: "Complete project proposal",
        description: "Write and submit the quarterly project proposal with budget analysis and timeline.",
        priority: "high",
        tags: ["work", "urgent", "proposal"]
    },
    {
        title: "Review team performance",
        description: "Conduct quarterly performance reviews for all team members and provide feedback.",
        priority: "medium",
        tags: ["management", "review", "team"]
    },
    {
        title: "Update website content",
        description: "Refresh the company website with new product information and testimonials.",
        priority: "medium",
        tags: ["web", "content", "marketing"]
    },
    {
        title: "Prepare presentation slides",
        description: "Create presentation slides for the upcoming client meeting next week.",
        priority: "high",
        tags: ["presentation", "client", "meeting"]
    },
    {
        title: "Organize team building event",
        description: "Plan and organize a team building event for the entire department.",
        priority: "low",
        tags: ["team", "event", "planning"]
    },
    {
        title: "Code review for new feature",
        description: "Review the code implementation for the new user authentication feature.",
        priority: "high",
        tags: ["code", "review", "development"]
    },
    {
        title: "Database optimization",
        description: "Optimize database queries to improve application performance.",
        priority: "medium",
        tags: ["database", "optimization", "performance"]
    },
    {
        title: "Write technical documentation",
        description: "Create comprehensive documentation for the new API endpoints.",
        priority: "medium",
        tags: ["documentation", "api", "technical"]
    },
    {
        title: "Client feedback analysis",
        description: "Analyze recent client feedback and prepare improvement recommendations.",
        priority: "low",
        tags: ["analysis", "feedback", "client"]
    },
    {
        title: "Security audit",
        description: "Conduct a comprehensive security audit of the application infrastructure.",
        priority: "high",
        tags: ["security", "audit", "infrastructure"]
    },
    {
        title: "Budget planning meeting",
        description: "Attend the quarterly budget planning meeting and present department needs.",
        priority: "medium",
        tags: ["budget", "meeting", "planning"]
    },
    {
        title: "Employee training session",
        description: "Conduct training session on new company policies and procedures.",
        priority: "low",
        tags: ["training", "policies", "education"]
    },
    {
        title: "Market research report",
        description: "Compile market research data and create comprehensive analysis report.",
        priority: "medium",
        tags: ["research", "market", "analysis"]
    },
    {
        title: "System backup verification",
        description: "Verify that all system backups are working correctly and data is recoverable.",
        priority: "high",
        tags: ["backup", "system", "verification"]
    },
    {
        title: "Social media campaign",
        description: "Launch new social media campaign for product promotion.",
        priority: "low",
        tags: ["social", "campaign", "marketing"]
    }
];

// Generate tasks for users
const generateTasksForUsers = (users) => {
    const tasks = [];
    
    users.forEach((user, userIndex) => {
        const numTasks = getRandomNumber(3, 8); // Each user gets 3-8 tasks
        
        for (let i = 0; i < numTasks; i++) {
            const template = getRandomItem(taskTemplates);
            const status = getRandomItem(["completed", "in-progress", "failed"]);
            
            // Create realistic due dates based on status
            let dueDate;
            if (status === 'completed') {
                // Completed tasks can have past due dates (they were finished)
                dueDate = getRandomDate(getRandomNumber(-20, -1));
            } else if (status === 'failed') {
                // Failed tasks should have past due dates (they missed the deadline)
                dueDate = getRandomDate(getRandomNumber(-15, -1));
            } else {
                // In-progress tasks should have future due dates
                dueDate = getRandomDate(getRandomNumber(1, 30));
            }
            
            tasks.push({
                title: `${template.title} - ${user.fullname.split(' ')[0]}`,
                description: template.description,
                due: dueDate,
                priority: template.priority,
                tags: template.tags,
                status: status,
                user: user._id,
                createdAt: getRandomDate(getRandomNumber(-60, -1)), // Created 1-60 days ago
                updatedAt: getRandomDate(getRandomNumber(-10, 0)) // Updated within last 10 days
            });
        }
    });
    
    return tasks;
};

// Calculate user statistics
const calculateUserStats = async (userId) => {
    const userTasks = await Task.find({ user: userId });
    
    const completed = userTasks.filter(task => task.status === 'completed').length;
    const failed = userTasks.filter(task => task.status === 'failed').length;
    const ongoing = userTasks.filter(task => task.status === 'in-progress').length;
    const total = userTasks.length;
    
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const streak = getRandomNumber(0, 15); // Random streak for demo
    const avgTime = `${getRandomNumber(1, 8)} hrs`; // Random average time
    
    return {
        completed,
        failed,
        ongoing,
        completionRate,
        streak,
        avgTime
    };
};

// Seed database
const seedDB = async () => {
    try {
        console.log("Starting database seeding...");
        
        // Initialize avatars (upload local images to Cloudinary)
        await initializeAvatars();
        
        // Clear existing data
        await Task.deleteMany({});
        await User.deleteMany({});
        console.log("Existing collections cleared.");

        // Create users with hashed passwords
        const users = [];
        for (const user of userData) {
            const hashedPassword = await bcrypt.hash(user.password, 12);
            users.push({
                ...user,
                password: hashedPassword,
                created_at: getRandomDate(getRandomNumber(-365, -30)) // Created 30-365 days ago
            });
        }
        
        const createdUsers = await User.insertMany(users);
        console.log(`${createdUsers.length} users created.`);

        // Generate and create tasks
        const tasks = generateTasksForUsers(createdUsers);
        const createdTasks = await Task.insertMany(tasks);
        console.log(`${createdTasks.length} tasks created.`);

        // Update users with statistics
        for (const user of createdUsers) {
            const stats = await calculateUserStats(user._id);
            await User.findByIdAndUpdate(user._id, { stats });
        }
        console.log("User statistics calculated and updated.");

        console.log("\n=== SEEDING COMPLETE ===");
        console.log(`Created ${createdUsers.length} users with ${createdTasks.length} tasks`);
        console.log("Sample login credentials:");
        console.log("Email: john@example.com | Password: password123");
        console.log("Email: jane@example.com | Password: password123");
        console.log("Email: mike@example.com | Password: password123");
        
    } catch (error) {
        console.error("Error seeding database:", error);
    } finally {
        mongoose.connection.close();
    }
};

// Run the seed script
connectDB().then(() => seedDB());