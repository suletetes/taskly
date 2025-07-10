const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const User = require('./model/user');
const userRoutes = require('./routes/user');
const taskRoutes = require('./routes/task');
require("dotenv").config();

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
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(path.resolve(), "public")));
/*
app.use(
    mongoSanitize({
        allowDots: true, // Optional: Allow dots in keys (safely)
        replaceWith: '_', // Replace prohibited keys instead of removing them
    })
);
*/


// Set EJS as the view engine
app.engine('ejs', ejsMate); // Use ejs-mate for rendering EJS templates
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views')); // Path to views folder

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

// Mock login middleware for development/testing purposes
app.use((req, res, next) => {
    if (process.env.NODE_ENV === "development") { // Ensure it only works in development mode
        const mockUserId = "686a7bdc5d6cef03ecb8a905"; // Replace with a valid user ID from your database
        User.findById(mockUserId)
            .then((mockUser) => {
                req.user = mockUser; // Simulates an authenticated user
                res.locals.currentUser = mockUser; // Add the mock user to locals for templates
                next();
            })
            .catch(next);
    } else {
        next();
    }
});

// Root route
app.get("/", (req, res) => {
    res.render("home/home", {
        title: 'Home | Taskly',
        hideNavbar: false,
        hideFooter: false
    })
    // res.send("Welcome to Taskly!");
    // res.render("home", {message: "Welcome to Taskly!"}); // Render a home page with a message
    // res.render({message: "Welcome to Taskly!"}); // Render a home page with a message
});

// About route
app.get("/about", (req, res) => {
    res.render("info/about", {
        title: 'About | Taskly',
        hideNavbar: false,
        hideFooter: false
    })
});

// Error handling for unmatched routes
/*app.all("*", (req, res, next) => {
    res.send("Welcome to Taskly!");
    // next(new ExpressError("Page Not Found", 404));
    next(new ExpressError("Page Not Found", 404));
});*/

// Global error handler
/*
app.use((err, req, res, next) => {
    // const {statusCode = 500, message = "Something went wrong!"} = err;
    // res.status(statusCode).render("error", {message}); // Render an error view
    // res.render("new")
});
*/

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serving on port ${PORT}`);
});