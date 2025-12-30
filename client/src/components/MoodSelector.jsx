import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { moodColors } from '../data/districts';
import axios from 'axios';

const moods = [
    { id: 'happy', label: 'Happy', emoji: '😊' },
    { id: 'excited', label: 'Excited', emoji: '🤩' },
    { id: 'neutral', label: 'Neutral', emoji: '😐' },
    { id: 'sad', label: 'Sad', emoji: '😢' },
    { id: 'angry', label: 'Angry', emoji: '😡' },
];

const MoodSelector = ({ isOpen, onClose, selectedDistrict, onMoodSubmit }) => {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (mood) => {
        setLoading(true);
        try {
            const apiUrl = import.meta.env.PROD ? '/api/moods' : 'http://localhost:5000/api/moods';
            const token = localStorage.getItem('token');

            await axios.post(apiUrl, {
                district: selectedDistrict.name,
                mood: mood.id
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            alert('Mood submitted successfully! 🎉');
            onMoodSubmit(); // Refresh data
            onClose();
        } catch (error) {
            console.error('Failed to submit mood', error);
            const errorMessage = error.response?.data?.error || 'Failed to submit mood. Please try again.';
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-slate-800 border border-slate-700 p-6 rounded-3xl shadow-2xl w-full max-w-sm"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2 className="text-2xl font-bold text-white mb-2 text-center">
                        How is {selectedDistrict?.name}?
                    </h2>
                    <p className="text-slate-400 text-center mb-6">Select the overall vibe right now.</p>

                    <div className="grid grid-cols-3 gap-4">
                        {moods.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => handleSubmit(m)}
                                disabled={loading}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl hover:bg-slate-700 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <span className="text-4xl mb-2">{m.emoji}</span>
                                <span className="text-sm text-slate-300 font-medium">{m.label}</span>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={onClose}
                        className="mt-6 w-full py-3 rounded-xl bg-slate-700 text-white font-semibold hover:bg-slate-600 transition-colors"
                    >
                        Cancel
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default MoodSelector;
