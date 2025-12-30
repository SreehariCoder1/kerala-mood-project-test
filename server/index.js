const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('./config/passport');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: [
        process.env.CLIENT_URL,
        'https://kerala-mood-project-testing.vercel.app',
        'http://localhost:5173'
    ].filter(Boolean),
    credentials: true
}));

// Session middleware for Passport
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
const connectDB = async () => {
    try {
        if (mongoose.connection.readyState === 1) return;
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }
};

// Connect immediately if not in serverless (local dev)
if (process.env.NODE_ENV !== 'production') {
    connectDB();
}

app.get('/', (req, res) => {
    res.send('Kerala Mood Map API Running');
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const moodRoutes = require('./routes/moodRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/moods', moodRoutes);

// For local dev
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Export for Vercel
module.exports = app;
