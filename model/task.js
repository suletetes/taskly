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
            validate: {
                validator: function (value) {
                    return value >= new Date(); // Ensure the due date is not in the past
                },
                message: "Due date cannot be in the past.",
            },
        },
        priority: {
            type: String,
            required: [true, "Priority is required"],
            enum: ["Low", "Medium", "High"],
        },
        description: {
            type: String,
            trim: true,
        },
        tags: {
            type: [String],
            default: [],
        },
        labels: {
            type: [String], // Array of labels for categorization
            default: [],
            validate: {
                validator: function (labels) {
                    return Array.isArray(labels) && labels.every(label => typeof label === "string");
                },
                message: "Labels must be an array of strings.",
            },
        },
        status: {
            type: String,
            enum: ["in-progress", "failed", "completed"],
            default: "in-progress",
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Reference to the User model
            required: true, // Ensure every task is linked to a user
        },
    },
    { timestamps: true }
);

// Pre-save hook to dynamically update the status based on the due date
taskSchema.pre("save", function (next) {
    const now = new Date(); // Get the current date

    // Update the task status based on the due date, only if not completed
    if (this.status !== "completed") {
        if (this.due < now) {
            this.status = "failed"; // Past due date
        } else {
            this.status = "in-progress"; // Before due date
        }
    }

    next();
});

// Method to manually mark a task as completed
taskSchema.methods.completeTask = function () {
    this.status = "completed";
    return this.save(); // Save the updated document
};

// Export the Task model
const Task = mongoose.model("Task", taskSchema);
module.exports = Task;