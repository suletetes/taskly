import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import flash from "connect-flash";
import passport from "passport";
import LocalStrategy from "passport-local";
import methodOverride from "method-override";
import mongoSanitize from "express-mongo-sanitize";
import path from "path";
import userRoutes from "./routes/user.js";
import taskRoutes from "./routes/task.js";
import ExpressError from "./utils/ExpressError.js";
import User from "./model/user.js";

// Initialize Express app
const app = express();

// Database connection
mongoose.connect("mongodb://127.0.0.1:27017/taskly", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

// Middleware to parse incoming requests
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(path.resolve(), "public")));
app.use(
    mongoSanitize({
        replaceWith: "_",
    })
);

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(path.resolve(), "views"));

// Session configuration
const sessionConfig = {
    secret: "thisshouldbeasecretkey", // Change this to a secure secret
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24, // 1 day
        maxAge: 1000 * 60 * 60 * 24,
    },
};
app.use(session(sessionConfig));
app.use(flash());

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash messages middleware
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

// Routes
app.use("/users", userRoutes);
app.use("/tasks", taskRoutes);

// Root route
app.get("/", (req, res) => {
    res.render("home", { message: "Welcome to Taskly!" }); // Render a home page with a message
});

// Error handling for unmatched routes
app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

// Global error handler
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error", { message }); // Render an error view
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serving on port ${PORT}`);
});