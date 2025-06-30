const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
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
        enum: ["Low", "Medium", "High"], // Priority levels
    },
    priorityClass: {
        type: String,
        default: "secondary", // Could map to classes like 'danger', 'warning', or 'success'
    },
    iconClass: {
        type: String,
        default: "primary", // Default Bootstrap icon class
    },
    description: {
        type: String,
        trim: true,
    },
    tags: {
        type: [String], // Array of strings for task tags
        default: [],
    },
    status: {
        type: String,
        default: "in-progress", // Default when the task is created
        enum: ["in-progress", "failed", "completed"], // Valid statuses
    },
});

// Pre-save hook for updating the status based on the due date
taskSchema.pre("save", function (next) {
    const currentDate = new Date();
    if (this.status !== "completed") {
        if (currentDate > this.due) {
            this.status = "failed";
        } else {
            this.status = "in-progress";
        }
    }
    next();
});

// Method to mark the task as "completed" when the user clicks "Done"
taskSchema.methods.markAsCompleted = function () {
    this.status = "completed";
};

// Export the model
const Task = mongoose.model("Task", taskSchema);
module.exports = Task;