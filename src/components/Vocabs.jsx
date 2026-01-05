import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { CirclePlus, Trash2, EllipsisVertical, ChevronDown } from 'lucide-react';

export default function Vocabs({ deckId, navigate }) {
    const [vocabs, setVocabs] = useState([]);
    const [popup, setPopup] = useState({ type: null, card: null });
    const [formData, setFormData] = useState({ front: '', back: '' });

    const [activeMenuId, setActiveMenuId] = useState(null);
    const [deletingVocabPopup, setDeletingVocabPopup] = useState(null);
    const [editingVocabPopup, setEditingVocabPopup] = useState(null);

    useEffect(() => {
        fetchVocabs(deckId);
        console.log('Rendering Vocabs Component. Vocabs:', vocabs);
        const handleClickOutside = () => setActiveMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [deckId]);

    const toggleMenu = (e, vocabId) => {
        e.stopPropagation();
        setActiveMenuId(prev => prev === vocabId? null : vocabId);
    }

    async function fetchVocabs() {
        const cachedVocabs = localStorage.getItem(`supabase_vocabs_cache_${deckId}`);
        if (cachedVocabs) {
            const parsed = JSON.parse(cachedVocabs);
            if (Array.isArray(parsed)) {
                setVocabs(parsed);
            }
        }

        if (!deckId) {
            console.error('No deckId provided to Vocabs component.');
            return;
        }
        console.log('Fetching vocabs for deckId:', deckId);
        const { data, error } = await supabase
            .from('vocab')
            .select('*')
            .eq('deck_id', deckId);
        if (error) {
            console.error('Error fetching vocabs:', error);
        } else {
            const cachedVocabsStr = JSON.stringify(data);
            if (cachedVocabsStr !== cachedVocabs) {
                setVocabs(data || []);
                localStorage.setItem(`supabase_vocabs_cache_${deckId}`, cachedVocabsStr);
            }
        }
    };

    const openAddCardPopup = () => {
        setFormData({ front: '', back: '' });
        setPopup({ type: 'add', card: null });
    };

    const openDeleteCardPopup = (card) => {
        setPopup({ type: 'delete', card });
    };

    const openEditCardPopup = (card) => {
        setFormData({ front: card.front, back: card.back });
        setPopup({ type: 'edit', card });
    }

    const closePopup = () => {
        setPopup({ type: null, card: null });
        setFormData({ front: '', back: '' });
    };

    async function confirmDelete(id) {
        const { error } = await supabase
            .from('vocab')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting card:', error);
            alert('Failed to delete card');
        } else {
            const updatedVocabs = vocabs.filter(v => v.id !== id);
            setVocabs(updatedVocabs);
            localStorage.setItem(`supabase_vocabs_cache_${deckId}`, JSON.stringify(updatedVocabs));
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
                localStorage.setItem(`supabase_vocabs_cache_${deckId}`, JSON.stringify(newVocabList));
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
            .eq('id', popup.card.id)
            .select();

        if (error) {
            console.error('Error updating card:', error);
            alert('Failed to update card');
        } else {
            if (data) {
                const updatedVocabs = vocabs.map(vocab => vocab.id === popup.card.id ? data[0] : vocab);
                setVocabs(updatedVocabs);
                localStorage.setItem(`supabase_vocabs_cache_${deckId}`, JSON.stringify(updatedVocabs));
                closePopup();
            }
        }
    } 

    return (
        <div className='vocabs' style={{display: 'flex', flexDirection: 'column'}}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', margin: '7px', gap: '10px' }}>
                <input type='text' className='text-input' placeholder='Search vocab...' />
                <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', columnGap: '5px', cursor: 'pointer', borderStyle: 'solid', borderWidth: '1px', borderColor: 'lightgray', borderRadius: '4px', padding: '2px' }}>
                    <p style={{ fontSize: '8px', margin: 0}}>Sort by</p>
                    <ChevronDown className='my-icon' />
                </div>
                <CirclePlus onClick={() => openAddCardPopup()} className='my-icon' />
                <Trash2 className='my-icon' />
            </div>

            <div className='container-box' style={{ borderWidth: '1px', borderColor: 'lightgray', padding: 0, minHeight: '20px', minWidth: '90%' }}>
                {vocabs.map(vocab => (
                    <div className='vocab-row' key={vocab.id}> 
                        <span>{vocab.front}</span>
                        <span>{vocab.back}</span>
                        <div className='options' style={{ position: 'relative', display: 'inline-block' }}>
                            <EllipsisVertical className='my-icon' />
                            <div className='dropdown-content options-trigger'>
                                <p onClick={() => openEditCardPopup(vocab)}>Edit</p>
                                <p onClick={() => openDeleteCardPopup(vocab)}>Delete</p>
                            </div>
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

            {(popup.type === 'delete') && (
                <div className='mini-popup' style={{ width: '190px' }}>
                    <p style={{ fontSize: '13px', margin: '3px' }}>Delete card</p>
                    <div>
                        <button onClick={() => confirmDelete(popup.card.id)} style={{ padding: '5px', fontSize: '10px', backgroundColor: 'red' }}>Delete</button>
                        <button onClick={closePopup} style={{ padding: '5px', fontSize: '10px', backgroundColor: '#b0b0b0' }}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    )
}