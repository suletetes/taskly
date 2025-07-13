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
const indexRoutes = require('./routes/index');

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

// ✅ Middleware to parse incoming form and JSON data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Other middleware
app.use(methodOverride("_method"));
app.use(express.static(path.join(path.resolve(), "public")));

// Optional: Sanitize data to prevent MongoDB operator injection
/*
app.use(
    mongoSanitize({
        allowDots: true,
        replaceWith: '_',
    })
);
*/

// Set EJS as the view engine
app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));

// Session configuration
const sessionConfig = {
    secret: "thisshouldbeasecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24,
        maxAge: 1000 * 60 * 60 * 24,
    },
};
app.use(session(sessionConfig));
app.use(flash());
// Middleware to make `currentUser` available in all templates
app.use((req, res, next) => {
    res.locals.currentUser = req.user || null; // `req.user` is set by Passport.js if authenticated
    next();
});

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
app.use('/', indexRoutes);
app.use("/users", userRoutes);
// app.use("/tasks", taskRoutes);

// Mock login middleware for development/testing
/*app.use(async (req, res, next) => {
    if (process.env.NODE_ENV === "development") {
        try {
            const mockUserId = "6873dbd84307aecaf4fb6496";
            const mockUser = await User.findById(mockUserId);

            if (!mockUser) {
                throw new Error("Mock user not found. Please ensure the mock user exists in the database.");
            }

            req.user = mockUser; // Attach mock user to the request
            res.locals.currentUser = mockUser; // Make it available in templates
            console.log("Mock user logged in:", mockUser.username); // Optional: Log for debugging
        } catch (error) {
            console.error("Error in mock login middleware:", error.message);
            return next(error);
        }
    }
    next();
});*/
// Catch-all for unmatched routes
/*
app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error", { message });
});
*/

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serving on port ${PORT}`);
});
