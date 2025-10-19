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
                    const now = new Date();
                    return value >= new Date(now.getFullYear(), now.getMonth(), now.getDate()); // No past dates but allow today
                },
                message: "Due date cannot be in the past.",
            },
        },
        priority: {
            type: String,
            required: [true, "Priority is required"],
            enum: ["low", "medium", "high"], // Limited allowed values for priority
        },
        description: {
            type: String,
            trim: true,
        },
        tags: {
            type: [String],
            default: [], // Default empty array for tags
        },
        labels: {
            type: [String],
            validate: {
                validator: function (labels) {
                    return Array.isArray(labels) && labels.every(label => typeof label === "string");
                },
                message: "Labels must be an array of strings.",
            },
            default: [], // Default empty array for labels
        },
        status: {
            type: String,
            enum: ["in-progress", "failed", "completed"], // Ensure limited possible values for status
            default: "in-progress",
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Mongoose reference to User model
            required: true,
        },
    },
    { timestamps: true } // Auto-handling createdAt and updatedAt fields
);

// Pre-save hook for dynamic status update
taskSchema.pre("save", function (next) {
    const now = new Date();

    if (this.status !== "completed") {
        this.status = this.due < now ? "failed" : "in-progress";
    }

    next();
});

// Define reusable method to mark tasks as completed manually
taskSchema.methods.completeTask = function () {
    this.status = "completed";
    return this.save();
};

const Task = mongoose.model("Task", taskSchema);
module.exports = Task;