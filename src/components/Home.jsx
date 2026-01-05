import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { CirclePlus, Trash2 } from 'lucide-react';

export default function Home({ session, navigate }) {
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

    const handleViewDeck = (deckId) => {
        navigate('vocabs', deckId);
    };

    const handleAddDeck = async (e) => {
        e.preventDefault();
    };

    // const handleDeleteDeck = async (deckId) => {
    //     setDecks(decks.filter(deck => deck.id !== deckId)); // optimistic UI update
    //     const { error } = await supabase.from('decks').delete().eq('id', deckId);
    //     if (error) {
    //         console.error('Error deleting deck:', error);
    //         fetchDecks(); // revert UI on error
    //     }
    // };

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
                            <button className='viewDeckBtn' onClick={() => handleViewDeck(deck.id)}>View deck</button>
                            <button className='sub-button'>Review</button>
                            <button className='sub-button'>Quiz</button>
                            <Trash2 className='my-icon' onClick={() => handleDeleteDeck(deck.id)}/>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className='container-box' style={{display: 'flex', flexDirection: 'row', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center'}}>
                {!showCreateDeckPopup ? (
                    <CirclePlus className='my-icon' onClick={() => setShowCreateDeckPopup(true)}/>
                ) : (
                    <div className='mini-popup'>
                        <h3>Create New Deck</h3>
                        <form onSubmit={handleAddDeck}>
                            <input type='text' placeholder='Deck Name' required />
                            <div>
                                <button type='submit'>Create</button>
                                <button type='button' onClick={() => setShowCreateDeckPopup(false)} style={{backgroundColor: '#b0b0b0'}}>Cancel</button>
                            </div>
                        </form>
                    </div>
                )}
                
            </div>
        </div>
    )
}

