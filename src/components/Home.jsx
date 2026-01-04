import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { CirclePlus, Trash2 } from 'lucide-react';

export default function Home({ session }) {
    const [decks, setDecks] = useState([]);
    const [showCreateDeckPopup, setShowCreateDeckPopup] = useState(false);

    useEffect(() => {
        // define the function inside effect to avoid dependency issues
        async function fetchDecks() {
            const cachedDecks = localStorage.getItem('supabase_decks_cache');
            if (cachedDecks) {
                const parsed = JSON.parse(cachedDecks);
                if (Array.isArray(parsed)) {
                    setDecks(parsed);
                }
            }

            if (!session?.user?.id) return;

            console.log('Fetching fresh decks from Supabase...');
            const { data, error } = await supabase
                .from('decks')
                .select('*')
                .eq('user_id', session.user.id);

            if (error) {
                console.error('Error fetching decks:', error);
            } else {
                const validData = data || [];
                // prevent unnecessary re-renders
                if (JSON.stringify(validData) !== cachedDecks) {
                    setDecks(validData);
                    localStorage.setItem('supabase_decks_cache', JSON.stringify(validData));
                }
            }
        }

        fetchDecks();

    // re-run whenever session ID changes
    }, [session?.user?.id]);

    const handleAddDeck = async (e) => {
        e.preventDefault();
    };

    const handleDeleteDeck = async (deckId) => {
        setDecks(decks.filter(deck => deck.id !== deckId)); // optimistic UI update
        const { error } = await supabase.from('decks').delete().eq('id', deckId);
        if (error) {
            console.error('Error deleting deck:', error);
            fetchDecks(); // revert UI on error
        }
    };

    return (
        <div className='home'>
            {console.log("Rendering Home Component. Decks:", decks)}
            <h3 style={{paddingLeft: '10px'}}>Your decks</h3>
            <div className='decks-container'>
                {decks.length === 0 && <p>No decks yet.</p>}

                {decks.map(deck => (
                    <div key={deck.id} className='container-box'>
                        <div className='deck-row' style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                            <span>{deck.name}</span>
                            <button className='viewDeckBtn'>
                                View deck
                            </button>
                            <button className='sub-button'>
                                Review
                            </button>
                            <button className='sub-button'>
                                Quiz
                            </button>
                            {/* TODO: have icon class in css just for cursor pointer */}
                            <Trash2 onClick={() => handleDeleteDeck(deck.id)} style={{cursor: 'pointer'}}/>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className='container-box' style={{display: 'flex', flexDirection: 'row', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center'}}>
                {!showCreateDeckPopup ? (
                    <div onClick={() => setShowCreateDeckPopup(true)} style={{cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                        <CirclePlus className='my-icon'/>
                        <span>Create New Deck</span>
                    </div>
                ) : (
                    <div className='mini-popup'>
                        <h3>Create New Deck</h3>
                        <form onSubmit={handleAddDeck}>
                            <input type='text' placeholder='Deck Name' required />
                            <div>
                                <button type='submit'>Create</button>
                                <button 
                                    type='button' 
                                    onClick={() => setShowCreateDeckPopup(false)}
                                    style={{backgroundColor: '#b0b0b0'}}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}
                
            </div>
        </div>
    )
}

