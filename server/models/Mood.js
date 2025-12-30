const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
    district: {
        type: String,
        required: true,
        enum: [
            'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha',
            'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad',
            'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasargod'
        ]
    },
    mood: {
        type: String,
        required: true,
        enum: ['happy', 'sad', 'angry', 'excited', 'neutral']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Mood', moodSchema);
