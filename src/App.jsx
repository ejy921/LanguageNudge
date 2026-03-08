// Determine which page to show with React State

import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; 
import Auth from './components/Auth';
import Home from './components/Home';
import Vocabs from './components/Vocabs';
import Settings from './components/Settings';
import NudgeCard from './components/NudgeCard';
import NudgeQuiz from './components/NudgeQuiz';
import { Settings as SettingsIcon, House, Bell, BellOff } from 'lucide-react';

const DEFAULT_PREFERENCES = {
    nudgeStyle: 'flashcard',
    nudgeFrequency: 60,
    blockedSites: ['netflix.com'],
    flashcardStartSide: 'front',
};

export default function App() {
    const [session, setSession] = useState(null);
    const [currentPage, setCurrentPage] = useState('loading');
    const [selectedDeckId, setSelectedDeckId] = useState(null);
    const [nudgesEnabled, setNudgesEnabled] = useState(true);
    const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);

    useEffect(() => {
        chrome.storage.sync.get(DEFAULT_PREFERENCES, (result) => {
            setPreferences(result);
        });
    }, []);

    const updatePreference = (key, value) => {
        setPreferences(prev => ({ ...prev, [key]: value }));
        chrome.storage.sync.set({ [key]: value });
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setCurrentPage(session ? 'home' : 'auth');
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setCurrentPage(session ? 'home' : 'auth');
        });

        return () => subscription.unsubscribe();
    }, []);

    const navigate = (page, data) => {
        setCurrentPage(page);
        if (data) {
            setSelectedDeckId(data);
        }
    };

    if (currentPage === 'loading') {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <div className="header">
                <span>LangNudge</span>
                <div className='header-actions'>
                    {nudgesEnabled
                        ? <Bell onClick={() => setNudgesEnabled(false)} className='header-icon'/>
                        : <BellOff onClick={() => setNudgesEnabled(true)} className='header-icon' style={{opacity: 0.6}}/>
                    }
                    <SettingsIcon onClick={() => navigate('settings')} className='header-icon'/>
                    <House onClick={() => navigate('home')} className='header-icon'/>
                </div>
            </div>
            <div className='app-container'>
                {currentPage === 'auth' && <Auth onLoginSuccess={() => navigate('home')} />}
                {currentPage === 'home' && (<Home session={session} navigate={navigate} />)}
                {currentPage === 'vocabs' && <Vocabs deckId={selectedDeckId} navigate={navigate} />}
                {currentPage === 'settings' && <Settings navigate={navigate} preferences={preferences} updatePreference={updatePreference} />}
                {currentPage === 'review' && <NudgeCard deckId={selectedDeckId} mode='review' navigate={navigate} preferences={preferences} />}
                {currentPage === 'quiz' && <NudgeQuiz deckId={selectedDeckId} mode='quiz' navigate={navigate} />}
            </div>
        </div>
    );
}