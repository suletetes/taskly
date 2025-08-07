const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./model/user');
const userRoutes = require('./routes/user');
const indexRoutes = require('./routes/index');
const ExpressError = require('./utils/ExpressError');
const dotenv = require("dotenv");

dotenv.config();

// Initialize Express app
const app = express();

// Database connection
const dbUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/taskly";
mongoose.connect(dbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

// Middleware to parse incoming form and JSON data
app.use(express.urlencoded({extended: true}));
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
    secret: process.env.SESSION_SECRET || 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // Expires in 7 days
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
};

app.use(session(sessionConfig));
app.use(flash());

// Passport configuration and middleware
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash and user middleware
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

// Routes
app.use("/", indexRoutes);
app.use("/users", userRoutes);

// Catch-all for unmatched routes
app.get('/{*any}', (req, res) => {
    res.status(404).render("error/notFound", {
        err: {statusCode: 404, message: "Page Not Found"},
        title: "404 | Taskly",
        hideNavbar: false,
        hideFooter: false
    });
});

// Error handler middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.statusCode || 500).render("error/notFound", {
        err: {
            statusCode: err.statusCode || 500,
            message: err.message || "Something went wrong",
            stack: err.stack
        },
        title: `${err.statusCode || 500} | Taskly`,
        hideNavbar: false,
        hideFooter: false
    });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serving on port ${PORT}`);
});