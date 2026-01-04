import React from 'react';
import { supabase } from '../supabaseClient';

export default function Settings() {

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) console.error('Error signing out:', error.message);
    };

    return (
        <div className='settings'>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <h2>Settings</h2>
                <div className='style-option'>
                    <h4>Flashcard</h4>
                    <div className='style-box'>
                        <img className='example-img' src='images/flashcard.png' alt='flashcard'></img>
                    </div>
                </div>
                <div className='style-option'>
                    <h4>Quiz</h4>
                    <div className='style-box'>
                        <img className='example-img' src='images/quiz.png' alt='quiz'></img>
                    </div>
                </div>
            </div>

            <div className='container-box'>
                <div className='settings-row'>
                    <p className='settings-text'>Example sentences</p>
                    <label className='switch'>
                        <input type='checkbox' />
                        <span className='slider round'></span>
                    </label>
                </div>
                <div className='settings-row'>
                    <p className='settings-text'>Nudge frequency</p>
                </div>
            </div>
            <button style={{ backgroundColor: 'red', padding: '8px' }}>Sign Out</button>
        </div>
    )
}

