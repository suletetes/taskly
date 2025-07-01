import mongoose from "mongoose";
import Task from "../model/task";
import User from "../model/user";

// MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/taskly', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully.');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

// Seed data
const taskData = [
    {
        title: "Finalize design proposal",
        due: "2025-06-30",
        priority: "High",
        description: "Complete the final design proposal and send it to the client for approval.",
        tags: ["Work", "Design"],
        status: "in-progress"
    },
    {
        title: "Update project documentation",
        due: "2025-07-02",
        priority: "Medium",
        description: "Add new API endpoints and update diagrams.",
        tags: ["Docs", "API"],
        status: "in-progress"
    },
    {
        title: "Team meeting",
        due: "2025-07-03",
        priority: "Low",
        description: "Weekly sync with the team.",
        tags: ["Meeting"],
        status: "in-progress"
    },
];

const userData = [
    { fullname: "Alice Doe", username: "alice", email: "alice@example.com", avatar: "../../public/img/avatars/avatar-1.jpg" },
    { fullname: "Bob Smith", username: "bob", email: "bob@example.com", avatar: "../../public/img/avatars/avatar-2.jpg" },
    { fullname: "Carol Johnson", username: "carol", email: "carol@example.com", avatar: "../../public/img/avatars/avatar-3.jpg" },
];

// Function to seed the database
const seedDB = async () => {
    try {
        // Clear existing database data
        await Task.deleteMany({});
        await User.deleteMany({});
        console.log('Existing collections cleared.');

        // Insert users and retrieve created users
        const createdUsers = await User.insertMany(userData);
        console.log(`${createdUsers.length} users created.`);

        // Assign each task to a random user
        const tasksWithUsers = taskData.map(task => ({
            ...task,
            user: createdUsers[Math.floor(Math.random() * createdUsers.length)]._id,
        }));

        // Insert tasks
        const createdTasks = await Task.insertMany(tasksWithUsers);
        console.log(`${createdTasks.length} tasks created.`);
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await mongoose.connection.close(); // Close the connection once done
    }
};

// Run the seed script
connectDB().then(() => seedDB());