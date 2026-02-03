import React from 'react';
import { supabase } from '../supabaseClient';
import { ChevronDown } from 'lucide-react';

export default function Settings() {

    const [activeFrequency, setActiveFrequency] = useState(null);

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) console.error('Error signing out:', error.message);
    };

    return (
        <div className='settings'>
            <h2>Settings</h2>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
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
                    <p className='settings-text'>Nudge frequency</p>
                    <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', columnGap: '0px', cursor: 'pointer', borderStyle: 'solid', borderWidth: '1px', borderColor: '#ccc', borderRadius: '5px', padding: '2px 5px'}}> 
                        <p>Freq</p>
                        <ChevronDown style={{width: '12px', height: '12px'}} className='my-icon'/>
                        {activeFrequency && (
                            <div className='dropdown-content' style={{alignItems: 'stretch', textAlign: 'left', right: '60px', top: '90px'}}>
                                <p>Hello</p>
                                <p>World</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className='settings-row'>
                    <p className='settings-text'>'Blocked' Pages</p>
                </div>
                <div className='settings-row'>
                    <p className='settings-text'>Example sentences</p>
                    <label className='switch'>
                        <input type='checkbox' />
                        <span className='slider round'></span>
                    </label>
                </div>
            </div>
            <button onClick={handleSignOut} style={{ backgroundColor: 'grey', padding: '8px' }}>Sign Out</button>
            <button style={{ backgroundColor: 'red', padding: '8px' }}>Delete Account</button>
        </div>
    )
}

