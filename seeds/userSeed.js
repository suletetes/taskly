import mongoose from "mongoose";
import Task from "../model/task.js";
import User from "../model/user.js";

// MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/taskly'); // Removed deprecated options
        console.log('MongoDB connected successfully.');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

// Random Data Generators
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Define labels for users
const labels = ["Admin", "Manager", "Developer", "Tester", "Guest", "Contributor"];

// Sample data arrays for random generation
const sampleNames = ["Alice Doe", "Bob Smith", "Carol Johnson", "David Warner", "Eve Adams", "Frank Bell"];
const sampleUsernames = ["alice", "bob", "carol", "david", "eve", "frank"];
const sampleAvatars = [
    "../../public/img/avatars/avatar-1.jpg",
    "../../public/img/avatars/avatar-2.jpg",
    "../../public/img/avatars/avatar-3.jpg",
];

// Generate random users
const generateRandomUsers = (count) => {
    const users = [];
    for (let i = 0; i < count; i++) {
        const name = getRandomItem(sampleNames) + ` ${i}`;
        users.push({
            fullname: name,
            username: getRandomItem(sampleUsernames) + i,
            email: `${getRandomItem(sampleUsernames)}${getRandomNumber(1, 1000)}@example.com`,
            avatar: getRandomItem(sampleAvatars),
            labels: Array.from(new Set(
                Array(getRandomNumber(1, 3))
                    .fill(null)
                    .map(() => getRandomItem(labels))
            )), // Assign 1-3 unique labels
        });
    }
    return users;
};

// Generate random tasks
const generateRandomTasks = (userIds, count) => {
    const tasks = [];
    for (let i = 0; i < count; i++) {
        tasks.push({
            title: `Task ${i + 1}`,
            due: new Date(new Date().getTime() + getRandomNumber(1, 30) * 24 * 60 * 60 * 1000), // Due in 1-30 days
            priority: getRandomItem(["Low", "Medium", "High"]),
            description: "This is a random task description.",
            tags: ["Work", "Urgent"], // Example tags
            labels: getRandomItem(labels), // Assign random task label
            status: getRandomItem(["completed", "in-progress", "failed"]),
            user: getRandomItem(userIds), // Assign random user
        });
    }
    return tasks;
};

// Seed database
const seedDB = async () => {
    try {
        // Clear existing database data
        await Task.deleteMany({});
        await User.deleteMany({});
        console.log("Existing collections cleared.");

        // Generate and insert users
        const randomUsers = generateRandomUsers(25); // Generate 25 random users
        const createdUsers = await User.insertMany(randomUsers);
        console.log(`${createdUsers.length} users created.`);

        // Generate and insert tasks
        const userIds = createdUsers.map(user => user._id);
        const randomTasks = generateRandomTasks(userIds, 60); // Generate 60 tasks for users
        const createdTasks = await Task.insertMany(randomTasks);
        console.log(`${createdTasks.length} tasks created.`);

        // Update users with task references
        for (const task of createdTasks) {
            await User.findByIdAndUpdate(task.user, { $push: { tasks: task._id } });
        }

        console.log("Database seeded successfully with users and tasks!");
    } catch (error) {
        console.error("Error seeding database:", error);
    } finally {
        mongoose.connection.close(); // Close the connection after seeding is complete
    }
};

// Run the seed script
connectDB().then(() => seedDB());