import React, { useState, useEffect, useContext } from 'react';
import DistrictMap from './components/DistrictMap';
import MoodSelector from './components/MoodSelector';
import Login from './components/Login';
import Register from './components/Register';
import { AuthContext, AuthProvider } from './context/AuthContext';
import axios from 'axios';

function AppContent() {
  const [districtData, setDistrictData] = useState({});
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const { user, loading, logout } = useContext(AuthContext);

  const fetchMoods = async () => {
    try {
      const apiUrl = import.meta.env.PROD ? '/api/moods' : 'http://localhost:5000/api/moods';
      const response = await axios.get(apiUrl);
      // Transform array to object { DistrictName: { mood, count } }
      const dataMap = {};
      response.data.forEach(item => {
        dataMap[item.district] = { mood: item.mood, count: item.count };
      });
      setDistrictData(dataMap);
    } catch (error) {
      console.error('Error fetching moods:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMoods();
      const interval = setInterval(fetchMoods, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleDistrictClick = (district) => {
    if (user?.hasMoodSubmitted) {
      alert('You have already submitted your mood!');
      return;
    }
    setSelectedDistrict(district);
    setIsModalOpen(true);
  };

  // Show loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Show login/register if not authenticated
  if (!user) {
    return showRegister ? (
      <Register onSwitchToLogin={() => setShowRegister(false)} />
    ) : (
      <Login onSwitchToRegister={() => setShowRegister(true)} />
    );
  }

  // Main app (authenticated)
  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-pink-500 selection:text-white">
      <header className="py-8 text-center px-4">
        <div className="flex justify-between items-center max-w-6xl mx-auto mb-4">
          <div className="text-left">
            <p className="text-slate-400 text-sm">Welcome, <span className="text-purple-400 font-semibold">{user.username}</span></p>
            {user.hasMoodSubmitted && (
              <p className="text-green-400 text-xs">✓ Mood submitted</p>
            )}
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition"
          >
            Logout
          </button>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 mb-2">
          Kerala Mood Map
        </h1>
        <p className="text-slate-400 text-lg">
          {user.hasMoodSubmitted
            ? "Thanks for sharing! View the collective mood below."
            : "What's the vibe in your district today?"
          }
        </p>
      </header>

      <main className="container mx-auto pb-12">
        <DistrictMap
          districtData={districtData}
          onDistrictClick={handleDistrictClick}
        />
      </main>

      <MoodSelector
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDistrict={selectedDistrict}
        onMoodSubmit={() => {
          fetchMoods();
          // Refresh user data to update hasMoodSubmitted status
          window.location.reload();
        }}
      />

      <footer className="text-center py-6 text-slate-600 text-sm">
        <p>Built with MERN Stack</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

