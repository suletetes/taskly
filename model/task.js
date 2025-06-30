const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
        },
        due: {
            type: Date,
            required: [true, "Due date is required"],
        },
        priority: {
            type: String,
            required: [true, "Priority is required"],
            enum: ["Low", "Medium", "High"],
        },
        /*
        priorityClass: {
            type: String,
            default: "secondary",
        },
        iconClass: {
            type: String,
            default: "primary",
        },
        */
        description: {
            type: String,
            trim: true,
        },
        tags: {
            type: [String],
            default: [],
        },
        status: {
            type: String,
            default: "in-progress",
            enum: ["in-progress", "failed", "completed"],
        },
        // Reference to the user who owns the task
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Reference to the User model
            required: true, // Ensure every task is linked to a user
        },
    },
    { timestamps: true }
);

// Pre-save hook to update priority class dynamically
taskSchema.pre("save", function (next) {
    const priorityMapping = {
        High: "danger",
        Medium: "warning",
        Low: "success",
    };
    this.priorityClass = priorityMapping[this.priority] || "secondary";
    next();
});

// Export the Task model
const Task = mongoose.model("Task", taskSchema);
module.exports = Task;