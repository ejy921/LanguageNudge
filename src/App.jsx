// Determine which page to show with React State

import React, { useState } from 'react';
import { supabase } from './supabaseClient'; 
import Auth from './components/Auth';
import Home from './components/Home';
import Settings from './components/Settings';

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
        return <div>Loading...</div>;
    }

    return (
        <div className='app-container'>
            {/* Conditional Rendering */}
            {currentPage === 'auth' && <Auth onLoginSucces={() => navigate('home')} />}
            {currentPage === 'home' && (<Home session={session} navigate={navigate} />)}
            {currentPage === 'settings' && <Settings navigate={navigate} />}
        </div>
    );
}