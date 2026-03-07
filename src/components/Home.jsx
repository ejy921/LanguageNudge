import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { CirclePlus, Trash2 } from 'lucide-react';
import { createDeck } from '../utils/deck';

export default function Home({ session, navigate }) {
    const [decks, setDecks] = useState([]);
    const [showCreateDeckPopup, setShowCreateDeckPopup] = useState(false);
    const [showDeleteDeckPopup, setShowDeleteDeckPopup] = useState(false);

    useEffect(() => {
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
                if (JSON.stringify(validData) !== cachedDecks) {
                    setDecks(validData);
                    localStorage.setItem('supabase_decks_cache', JSON.stringify(validData));
                }
            }
        }
        fetchDecks();
    }, [session?.user?.id]);

    const handleAddDeck = async (e) => {
        // stop page reload when form is submitted
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const deckName = formData.get('deckName');
        if (!deckName) {
            alert('Please enter a deck name');
            return;
        }

        const { data: { user }, error: userError} = await supabase.auth.getUser();
        
        const newDeck = createDeck(deckName, user);
        const { data, error } = await supabase
            .from('decks')
            .insert([newDeck])
            .select();
        if (!error && data) {
            setDecks(prev => [...prev, data[0]]);
            setShowCreateDeckPopup(false);
        } else {
            console.error('Error creating deck', error.message);
        }
    };

    const handleDeleteDeck = async (id) => {
        const updatedDecks = decks.filter(deck => deck.id !== id);
        setDecks(updatedDecks); // optimistic UI update

        const { error } = await supabase
            .from('decks')
            .delete().
            eq('id', id);

        if (error) {
            console.error('Error deleting deck:', error);
        } else {
            localStorage.setItem('supabase_decks_cache', JSON.stringify(updatedDecks));
            setShowDeleteDeckPopup(false);
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
                            <button className='viewDeckBtn' onClick={() => navigate('vocabs', deck.id)}>View deck</button>
                            <button className='sub-button' onClick={() => navigate('review', deck.id)}>Review</button>
                            <button className='sub-button' onClick={() => navigate('quiz', deck.id)}>Quiz</button>
                            <Trash2 className='my-icon' onClick={() => setShowDeleteDeckPopup(true)}/>
                            {showDeleteDeckPopup && (
                                <div className='mini-popup'>
                                    <h5>Are you sure you want to delete this deck? All cards inside will be deleted alongside.</h5>
                                    <div>
                                        <button onClick={() => handleDeleteDeck(deck.id)} style={{backgroundColor: 'red'}}>Delete</button>
                                        <button onClick={() => setShowDeleteDeckPopup(false)} style={{backgroundColor: '#b0b0b0'}}>Cancel</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            
            <div className='container-box' style={{display: 'flex', flexDirection: 'row', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center'}}>
                <CirclePlus className='my-icon' onClick={() => setShowCreateDeckPopup(true)}/>
                {showCreateDeckPopup && (
                    <div className='mini-popup'>
                        <h3>Create New Deck</h3>
                        <form onSubmit={handleAddDeck}>
                            <input type='text' name='deckName' placeholder='Deck Name' required />
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

