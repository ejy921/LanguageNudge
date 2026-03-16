import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { CirclePlus, Trash2, EllipsisVertical, ChevronDown } from 'lucide-react';
import { sortVocabs, getVocabsCacheKey } from '../utils/vocabUtils';

export default function Vocabs({ deckId, navigate }) {
    const [vocabs, setVocabs] = useState([]);
    const [deckName, setDeckName] = useState('');
    const [popup, setPopup] = useState({ type: null, vocab: null });
    const [formData, setFormData] = useState({ front: '', back: '' });

    const [activeMenuId, setActiveMenuId] = useState(null);
    const [activeSortbyId, setActiveSortbyId] = useState(null);
    const [sortBy, setSortBy] = useState('oldest'); // 'name', 'newest', 'oldest'

    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchVocabs(deckId);
        fetchDeckName(deckId);
        console.log('Rendering Vocabs Component. Vocabs:', vocabs);
        const handleClickOutside = () => setActiveMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [deckId]);

    // watch state and sync to local storage
    useEffect(() => {
        if (deckId && vocabs.length > 0) {
            localStorage.setItem(getVocabsCacheKey(deckId), JSON.stringify(vocabs));
        }
    }, [vocabs, deckId]);

    async function fetchDeckName(id) {
        const { data, error } = await supabase
            .from('decks')
            .select('name')
            .eq('id', id)
            .single();
        if (!error && data) {
            setDeckName(data.name);
        }
    }

    async function fetchVocabs() {
        const cachedVocabs = localStorage.getItem(getVocabsCacheKey(deckId));
        if (cachedVocabs) {
            const parsed = JSON.parse(cachedVocabs);
            if (Array.isArray(parsed)) {
                setVocabs(JSON.parse(cachedVocabs));
            }
        }
        console.log('Fetching vocabs for deckId:', deckId);

        const { data, error } = await supabase
            .from('vocab')
            .select('*')
            .eq('deck_id', deckId);
        if (error) {
            console.error('Error fetching vocabs:', error);
        } else {
            setVocabs(data || []);
        }
    };

    const toggleMenu = (e, vocabId) => {
        e.stopPropagation();
        // if already open, close; if not, open menu
        setActiveMenuId(prev => prev === vocabId? null : vocabId);
    }

    const toggleSortbyMenu = (e) => {
        e.stopPropagation();
        setActiveSortbyId(prev => prev === deckId ? null : deckId);
    }

    const closePopup = () => {
        setPopup({ type: null, vocab: null });
        setFormData({ front: '', back: '' });
    };

    async function handleDelete() {
        if (popup.type === 'delete' && popup.vocab) {
            await deleteCard(popup.vocab.id);
        } else if (popup.type === 'deletedeck') {
            await deleteDeck();
        }
    }

    async function deleteDeck() {
        const { error } = await supabase   
            .from('decks')
            .delete()
            .eq('id', deckId);
        if (error) {
            console.error('Error deleting card:', error);
        } else {
            localStorage.removeItem(getVocabsCacheKey(deckId));
            if (navigate) {
                navigate('home');
            }
        }
    }

    async function deleteCard(id) {
        const { error } = await supabase
            .from('vocab')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting card:', error);
        } else {
            const updatedVocabs = vocabs.filter(v => v.id !== id);
            setVocabs(updatedVocabs);
            closePopup();
        }
    }

    async function handleSaveNewCard() {
        if (!formData.front || !formData.back) {
            alert('Both front and back fields are required.');
            return;
        }
        const { data, error } = await supabase
            .from('vocab')
            .insert([{ front: formData.front, back: formData.back, deck_id: deckId }])
            .select();

        if (error) {
            console.error('Error adding new card:', error);
            alert('Failed to add card');
        }
        else {
            if (data) {
                const newVocabList = [...vocabs, ...data];
                setVocabs(newVocabList);
                closePopup();
            }
        }
    };

    async function handleSaveEditedCard() {
        if (!formData.front || !formData.back) {
            alert('Both front and back fields are required.');
            return;
        }
        const { data, error } = await supabase
            .from('vocab')
            .update({ front: formData.front, back: formData.back })
            .eq('id', popup.vocab.id)
            .select();

        if (error) {
            console.error('Error updating card:', error);
            alert('Failed to update card');
        } else {
            if (data && data.length > 0) {
                const updatedVocabs = vocabs.map(vocab => vocab.id === popup.vocab.id ? data[0] : vocab);
                setVocabs(updatedVocabs);
                closePopup();
            }
        }
    } 
    
    const filteredVocabs = vocabs.filter(vocab => {
        const query = searchQuery.toLowerCase();

        const frontMatch = (vocab.front || '').toLowerCase().includes(query);
        const backMatch = (vocab.back || '').toLowerCase().includes(query);
        return frontMatch || backMatch;
    });

    const vocabsToDisplay = useMemo(() => {
        return sortVocabs(filteredVocabs, sortBy);
    }, [vocabs, searchQuery, sortBy]);
    
    
    return (
        <div className='vocabs' style={{display: 'flex', flexDirection: 'column'}}>
            <h3 style={{ textAlign: 'left', paddingLeft: '10px', margin: '5px 0' }}>{deckName}</h3>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: '90%', justifyContent: 'space-between', margin: '10px', gap: '12px' }}>
                <input type='text' className='text-input' placeholder='Search vocab...' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', columnGap: '0px', cursor: 'pointer', borderStyle: 'solid', borderWidth: '1px', borderColor: 'lightgray', borderRadius: '4px', padding: '2px', minWidth: '50px' }}>
                    <p style={{ fontSize: '10px', margin: 0}}>Sort by</p>
                    <ChevronDown style={{width: '15px', height: '15px'}} className='my-icon' onClick={(e) => toggleSortbyMenu(e)}/>
                    {activeSortbyId === deckId && (
                        <div className='dropdown-content' style={{alignItems: 'stretch', textAlign: 'left', right: '60px', top: '90px'}}>
                            <p onClick={() => { setSortBy('name'); setActiveSortbyId(null); }}>Name</p>
                            <p onClick={() => { setSortBy('newest'); setActiveSortbyId(null); }}>Newest</p>
                            <p onClick={() => { setSortBy('oldest'); setActiveSortbyId(null); }}>Oldest</p>
                        </div>
                    )}
                </div>
                <CirclePlus className='my-icon' onClick={() => {
                    setFormData({ front: '', back: '' });
                    setPopup({ type: 'add', vocab: null });
                }}/>
                <Trash2 className='my-icon' onClick={() => setPopup({type: 'deletedeck', vocab: null})}/>
            </div>

            <div className='container-box' style={{ borderWidth: '1px', borderColor: 'lightgray', padding: 0, minHeight: '20px', minWidth: '90%' }}>
                {vocabsToDisplay.map(vocab => (
                    <div className='vocab-row' key={vocab.id}> 
                        <span>{vocab.front}</span>
                        <span>{vocab.back}</span>
                        <div className='options' style={{ position: 'relative', display: 'inline-block' }}>
                            <EllipsisVertical className='my-icon' onClick={(e) => toggleMenu(e, vocab.id)}/>
                            {activeMenuId === vocab.id && (
                                <div className='dropdown-content'>
                                    <p onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMenuId(null);
                                        setFormData({front: vocab.front, back: vocab.back});
                                        setPopup({type: 'edit', vocab});}}
                                        style={{cursor: 'pointer'}}>
                                        Edit
                                    </p>
                                    <p onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMenuId(null);
                                        setPopup({type: 'delete', vocab});}}
                                        style={{cursor: 'pointer'}}>
                                        Delete
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {(popup.type === 'add' || popup.type === 'edit') && (
                <div className='mini-popup' style={{ width: '190px' }}>
                    <p style={{ fontSize: '13px', margin: '3px' }}>{popup.type === 'add' ? 'Add new card' : 'Edit card'}</p>
                    <input type='text' placeholder='Front' value={formData.front} onChange={(e) => setFormData({ ...formData, front: e.target.value })} style={{ padding: '2px', display: 'block' }} />
                    <input type='text' placeholder='Back' value={formData.back} onChange={(e) => setFormData({ ...formData, back: e.target.value })} style={{ padding: '2px', display: 'block' }} />
                    <div>
                        <button onClick={popup.type === 'add' ? handleSaveNewCard : handleSaveEditedCard} style={{ padding: '5px', fontSize: '10px' }}>Save</button>
                        <button onClick={closePopup} style={{ padding: '5px', fontSize: '10px', backgroundColor: '#b0b0b0' }}>Cancel</button>
                    </div>
                </div>
            )}

            {(popup.type === 'delete' || popup.type === 'deletedeck') && (
                <div className='mini-popup' style={{ width: '190px' }}>
                    <p style={{ fontSize: '13px', margin: '3px' }}>{popup.type === 'delete' ? 'Delete card' : 'Delete deck'}</p>
                    <div>
                        <button onClick={handleDelete} style={{ padding: '5px', fontSize: '10px', backgroundColor: 'red' }}>Delete</button>
                        <button onClick={closePopup} style={{ padding: '5px', fontSize: '10px', backgroundColor: '#b0b0b0' }}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    )
}