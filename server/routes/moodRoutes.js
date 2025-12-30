const express = require('express');
const router = express.Router();
const Mood = require('../models/Mood');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   POST /api/moods
// @desc    Submit a mood for a district (Protected - requires authentication)
router.post('/', auth, async (req, res) => {
    try {
        const { district, mood } = req.body;

        if (!district || !mood) {
            return res.status(400).json({ error: 'District and mood are required' });
        }

        // Check if user has already submitted mood
        if (req.user.hasMoodSubmitted) {
            return res.status(403).json({
                error: 'You have already submitted your mood. Each user can only submit once.'
            });
        }

        // Save the mood
        const newMood = new Mood({ district, mood });
        await newMood.save();

        // Update user's mood submission status
        await User.findByIdAndUpdate(req.user._id, {
            hasMoodSubmitted: true,
            moodSubmittedAt: new Date()
        });

        res.status(201).json({
            message: 'Mood submitted successfully!',
            mood: newMood
        });
    } catch (err) {
        console.error('Error saving mood:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   GET /api/moods
// @desc    Get dominant mood for each district (last 24 hours)
router.get('/', async (req, res) => {
    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const moods = await Mood.aggregate([
            { $match: { createdAt: { $gte: twentyFourHoursAgo } } },
            {
                $group: {
                    _id: { district: '$district', mood: '$mood' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $group: {
                    _id: '$_id.district',
                    topMood: { $first: '$_id.mood' },
                    count: { $first: '$count' }
                }
            },
            {
                $project: {
                    district: '$_id',
                    mood: '$topMood',
                    count: 1,
                    _id: 0
                }
            }
        ]);

        res.json(moods);
    } catch (err) {
        console.error('Error fetching moods:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
