// Determine which page to show with React State

import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; 
import Auth from './components/Auth';
import Home from './components/Home';
import Settings from './components/Settings';
import { Settings as SettingsIcon, House } from 'lucide-react';

export default function App() {
    const [session, setSession] = useState(null);
    const [currentPage, setCurrentPage] = useState('loading');

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

    const navigate = (page) => setCurrentPage(page);

    if (currentPage === 'loading') {
        // TODO: Replace with a proper loading spinner
        return <p>Loading...</p>;
    }

    return (
        <div>
            <div className="header">LangNudge
                <House onClick={() => navigate('home')} style={{position: 'absolute', right: '10px', top: '10px'}}/>
                <SettingsIcon onClick={() => navigate('settings')} style={{position: 'absolute', right: '40px', top: '10px'}}/>
            </div>
            <div className='app-container'>
                {/* Conditional Rendering */}
                {currentPage === 'auth' && <Auth onLoginSuccess={() => navigate('home')} />}
                {currentPage === 'home' && (<Home session={session} navigate={navigate} />)}
                {currentPage === 'settings' && <Settings navigate={navigate} />}
            </div>
        </div>
    );
}