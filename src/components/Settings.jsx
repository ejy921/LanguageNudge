import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { X } from 'lucide-react';

export default function Settings({ preferences, updatePreference }) {

    const { nudgeStyle, nudgeFrequency, blockedSites, flashcardStartSide } = preferences;
    const [siteInput, setSiteInput] = useState('');

    const TIME_OPTIONS = [
        { label: '15m', value: 15 },
        { label: '30m', value: 30 },
        { label: '1h',  value: 60 },
        { label: '2h',  value: 120 },
        { label: '4h',  value: 240 },
        { label: '8h',  value: 480 },
        { label: '24h', value: 1440 },
    ];   

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) console.error('Error signing out:', error.message);
    };

    return (
        <div className='settings'>
            <h3>Settings</h3>

            <div className='container-box'>
                <p className='settings-text'>Nudge style</p>
                <div className='segmented-control' style={{marginBottom: '15px', display: 'inline-flex'}}>
                    <button
                        className={`segment ${nudgeStyle === 'flashcard' ? 'segment-active' : ''}`}
                        onClick={() => updatePreference('nudgeStyle', 'flashcard')}>
                        Flashcard
                    </button>
                    <button
                        className={`segment ${nudgeStyle === 'quiz' ? 'segment-active' : ''}`}
                        onClick={() => updatePreference('nudgeStyle', 'quiz')}>
                        Quiz
                    </button>
                    <button
                        className={`segment ${nudgeStyle === 'random' ? 'segment-active' : ''}`}
                        onClick={() => updatePreference('nudgeStyle', 'random')}>
                        Random
                    </button>
                </div>

                <p className='settings-text'>Nudge frequency</p>
                <div className='segmented-control' style={{display: 'inline-flex'}}>
                    {TIME_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            className={`segment ${nudgeFrequency === option.value ? 'segment-active' : ''}`}
                            onClick={() => updatePreference('nudgeFrequency', option.value)}
                            style={{marginBlock: '0px', marginInline: '0px'}}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className='container-box'>
                <p className='settings-text'>Blocked Pages</p>
                <div className='blocked-sites'>
                    {blockedSites.map((site) => (
                        <span key={site} className='site-chip'>
                            {site}
                            <X
                                className='chip-remove'
                                size={12}
                                onClick={() => updatePreference('blockedSites', blockedSites.filter((s) => s !== site))}
                            />
                        </span>
                    ))}
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const trimmed = siteInput.trim();
                        if (trimmed && !blockedSites.includes(trimmed)) {
                            updatePreference('blockedSites', [...blockedSites, trimmed]);
                            setSiteInput('');
                        }}}>
                        <input
                            className='site-input'
                            type='text'
                            placeholder='Add website...'
                            value={siteInput}
                            onChange={(e) => setSiteInput(e.target.value)}
                        />
                    </form>
                </div>
            </div>

            <div className='container-box'>
                <p className='settings-text'>Flashcard start side</p>
                <div className='segmented-control' style={{display: 'inline-flex'}}>
                    <button
                        className={`segment ${flashcardStartSide === 'front' ? 'segment-active' : ''}`}
                        onClick={() => updatePreference('flashcardStartSide', 'front')}>
                        Front
                    </button>
                    <button
                        className={`segment ${flashcardStartSide === 'back' ? 'segment-active' : ''}`}
                        onClick={() => updatePreference('flashcardStartSide', 'back')}>
                        Back
                    </button>
                    <button
                        className={`segment ${flashcardStartSide === 'random' ? 'segment-active' : ''}`}
                        onClick={() => updatePreference('flashcardStartSide', 'random')}>
                        Random
                    </button>
                </div>
            </div>

            <div className='settings-actions'>
                <button className='btn-signout' onClick={handleSignOut}>Sign Out</button>
                <button className='btn-delete'>Delete Account</button>
            </div>
        </div>
    )
}

