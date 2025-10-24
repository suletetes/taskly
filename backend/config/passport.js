const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const { comparePassword } = require('../utils/password');

// Local Strategy
passport.use(new LocalStrategy({
    usernameField: 'username', // Can be username or email
    passwordField: 'password'
}, async (username, password, done) => {
    try {
        // Find user by username or email
        const user = await User.findOne({
            $or: [{ username }, { email: username }]
        });

        if (!user) {
            return done(null, false, { message: 'Invalid credentials' });
        }

        // Check password
        const isPasswordValid = await comparePassword(password, user.password);

        if (!isPasswordValid) {
            return done(null, false, { message: 'Invalid credentials' });
        }

        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id).select('-password');
        done(null, user);
    } catch (error) {
        done(error);
    }
});

module.exports = passport;