// Determine which page to show with React State

import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; 
import Auth from './components/Auth';
import Home from './components/Home';
import Vocabs from './components/Vocabs';
import Settings from './components/Settings';
import NudgeCard from './components/NudgeCard';
import NudgeQuiz from './components/NudgeQuiz';
import { Settings as SettingsIcon, House } from 'lucide-react';

export default function App() {
    const [session, setSession] = useState(null);
    const [currentPage, setCurrentPage] = useState('loading');
    const [selectedDeckId, setSelectedDeckId] = useState(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {    
            setSession(session);
            setCurrentPage(session ? 'home' : 'auth');
        });

        const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
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
        // TODO: Replace with a proper loading spinner
        return <p>Loading...</p>;
    }

    return (
        <div>
            <div className="header">LangNudge
                <House onClick={() => navigate('home')} className='my-icon' style={{position: 'absolute', right: '10px', marginTop: '3px', color: 'white'}}/>
                <SettingsIcon onClick={() => navigate('settings')} className='my-icon' style={{position: 'absolute', right: '40px', marginTop: '3px', color: 'white'}}/>
                <label className='switch'>
                    <input type='checkbox' />
                    <span className='slider round'></span>
                </label>
            </div>
            <div className='app-container'>
                {currentPage === 'auth' && <Auth onLoginSuccess={() => navigate('home')} />}
                {currentPage === 'home' && (<Home session={session} navigate={navigate} />)}
                {currentPage === 'vocabs' && <Vocabs deckId={selectedDeckId} navigate={navigate} />}
                {currentPage === 'settings' && <Settings navigate={navigate} />}
                {currentPage === 'review' && <NudgeCard deckId={selectedDeckId} mode='review' navigate={navigate} />}
                {currentPage === 'quiz' && <NudgeQuiz deckId={selectedDeckId} mode='quiz' navigate={navigate} />}
            </div>
        </div>
    );
}