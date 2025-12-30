const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_client_id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_client_secret',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user already exists with this Google ID
            let user = await User.findOne({ googleId: profile.id });

            if (user) {
                return done(null, user);
            }

            // Check if user exists with this email
            user = await User.findOne({ email: profile.emails[0].value });

            if (user) {
                // Link Google account to existing user
                user.googleId = profile.id;
                user.profilePicture = profile.photos[0]?.value;
                await user.save();
                return done(null, user);
            }

            // Create new user
            const newUser = new User({
                googleId: profile.id,
                username: profile.displayName.replace(/\s+/g, '_').toLowerCase() + '_' + Date.now(),
                email: profile.emails[0].value,
                password: 'oauth_user_' + Date.now(), // Dummy password for OAuth users
                profilePicture: profile.photos[0]?.value
            });

            await newUser.save();
            done(null, newUser);
        } catch (error) {
            console.error('Google OAuth error:', error);
            done(error, null);
        }
    }));

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;
