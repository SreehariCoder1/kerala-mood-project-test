import React from 'react';
import { motion } from 'framer-motion';
import { districts, moodColors } from '../data/districts';

const DistrictMap = ({ districtData, onDistrictClick }) => {
    return (
        <div className="w-full max-w-2xl mx-auto p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-fr">
                {districts.map((district) => {
                    const currentMood = districtData[district.name]?.mood || 'default';
                    const colorClass = moodColors[currentMood];
                    const count = districtData[district.name]?.count || 0;

                    return (
                        <motion.div
                            key={district.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onDistrictClick(district)}
                            className={`${colorClass} p-6 rounded-2xl shadow-lg cursor-pointer backdrop-blur-md bg-opacity-80 border border-white/10 flex flex-col items-center justify-center text-center transition-colors duration-500`}
                        >
                            <h3 className="text-white font-bold text-lg drop-shadow-md">{district.name}</h3>
                            {count > 0 && (
                                <span className="text-white/80 text-xs mt-1">{count} reports</span>
                            )}
                            <span className="text-2xl mt-2">
                                {currentMood === 'happy' && '😊'}
                                {currentMood === 'sad' && '😢'}
                                {currentMood === 'angry' && '😡'}
                                {currentMood === 'excited' && '🤩'}
                                {currentMood === 'neutral' && '😐'}
                            </span>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default DistrictMap;
