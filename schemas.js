const BaseJoi = require("joi");
const sanitizeHtml = require("sanitize-html");

// Extend Joi to add an escapeHTML rule
const extension = (joi) => ({
    type: "string",
    base: joi.string(),
    messages: {
        "string.escapeHTML": "{{#label}} must not include HTML!",
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error("string.escapeHTML", { value });
                return clean;
            },
        },
    },
});

const Joi = BaseJoi.extend(extension);

// Task Schema
const taskSchema = Joi.object({
    task: Joi.object({
        title: Joi.string().required().escapeHTML(),
        due: Joi.date().required(),
        priority: Joi.string().required().valid("Low", "Medium", "High"),
        priorityClass: Joi.string().optional().escapeHTML(),
        iconClass: Joi.string().optional().escapeHTML(),
        description: Joi.string().optional().escapeHTML(),
        tags: Joi.array().items(Joi.string().escapeHTML()).default([]),
        status: Joi.string().valid("in-progress", "failed", "completed").default("in-progress"),
    }).required(),
});

// User Schema
const userSchema = Joi.object({
    user: Joi.object({
        fullname: Joi.string().required().escapeHTML(),
        username: Joi.string().required().escapeHTML(),
        email: Joi.string().required().email().escapeHTML(),
        password: Joi.string().required().min(6),
        avatar: Joi.string().optional().uri().escapeHTML(),
    }).required(),
});

// Export both schemas
module.exports = {
    taskSchema,
    userSchema,
};