import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { CirclePlus, Trash2 } from 'lucide-react';

export default function Home({ session }) {
    const [decks, setDecks] = useState([]);

    useEffect(() => {
        fetchDecks();
    }, [session]);

    async function fetchDecks() {
        console.log('Fetching decks for session:', session);
        const cachedDecks = localStorage.getItem('supabase_decks_cache');
        if (cachedDecks) {
            setDecks(JSON.parse(cachedDecks));
        }
        // ensure session and user ID exist
        if (!session?.user?.id) return;
        // fetch decks from supabase
        const { data, error } = await supabase
            .from('decks')
            .select('*')
            .eq('user_id', session.user.id);

        if (error) {
            console.error('Error fetching decks:', error);
        } else {
            const cachedDeckStr = JSON.stringify(data);
            if (cachedDeckStr !== cachedDecks) {
                setDecks(data || []);
                localStorage.setItem('supabase_decks_cache', cachedDeckStr);
            }
        }
    };

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
            <h3 style={{paddingLeft: '10px'}}>Your decks</h3>
            <div className='decks-container'>
                {decks.map(deck => (
                    <div key={deck.id} className='container-box'>
                        <div className='deck-row' style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                            <span>{deck.name}</span>
                            <button className='viewDeckBtn' key={deck.id}>
                                View deck
                            </button>
                            <button className='sub-button' key={deck.id}>
                                Review
                            </button>
                            <button className='sub-button' key={deck.id}>
                                Quiz
                            </button>
                            {/* TODO: have icon class in css just for cursor pointer */}
                            <Trash2 onClick={() => handleDeleteDeck(deck.id)} style={{cursor: 'pointer'}}/>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className='container-box' style={{display: 'flex', flexDirection: 'row', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center'}}>
                <CirclePlus className='my-icon'/>
                <div className='mini-popup'>
                    <h3>Create New Deck</h3>
                    <form onSubmit={handleAddDeck}>
                        <input type='text' placeholder='Deck Name' required />
                        <div>
                            <button type='submit'>Create</button>
                            <button type='button' style={{backgroundColor: '#b0b0b0'}}>Cancel</button>
                        </div>
                    </form>
                </div>
                <input type='file' className='fileInput' accept='.csv,.tsv,.txt'></input>
                <button className='uploadBtn' style={{paddingTop: '7px', paddingBottom: '4px'}}>Upload Vocabulary List</button>
            </div>
        </div>
    )
}

