import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { CirclePlus, Trash2 } from 'lucide-react';

export default function Vocabs({ deckId }) {

    useEffect(() => {
        fetchVocabs();
    }, [deckId]);

    async function fetchVocabs() {
        const cachedVocabs = localStorage.getItem(`supabase_vocabs_cache_${deckId}`);
        if (cachedVocabs) {
        }

        if (!deckId) return;
        const { data, error } = await supabase
            .from('vocabs')
            .select('*')
            .eq('deck_id', deckId);
        if (error) {
            console.error('Error fetching vocabs:', error);
        } else {
            const cachedVocabsStr = JSON.stringify(data);
            if (cachedVocabsStr !== cachedVocabs) {
                localStorage.setItem(`supabase_vocabs_cache_${deckId}`, cachedVocabsStr);
            }
        }
    };

    return (
        <div className='vocabs'>
            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', margin: '10px'}}>
                <input type='text' class='text-input' placeholder='Search vocab...'/>
                <p style={{fontSize: '10px', margin: 0, padding: '4px', borderStyle: 'solid', borderWidth: '1px', borderRadius: '4px', borderColor: 'lightgray'}}>Sort by</p>
                <CirclePlus/>
                <Trash2/>
            </div>
            <div className='container-box' style={{borderWidth: '1px', borderColor: 'lightgray', padding: 0, minHeight: '20px'}}>
                <div className='vocab-row'></div>
            </div>

            <div className='mini-popup' style={{width: '190px'}}>
                <p style={{fontSize: '13px', margin: '3px'}}>Add new card</p>
                <input type='hidden'/>
                <input type='text' label='Front' style={{padding: '2px'}}/>
                <input type='text' label='Back' style={{padding: '2px'}}/>
                <div>
                    <button style={{padding: '5px', fontSize: '10px'}}>Save</button>
                    <button style={{padding: '5px', fontSize: '10px', backgroundColor: '#b0b0b0'}}>Cancel</button>
                </div>
            </div>

            <div className='mini-popup' style={{width: '190px'}}>
                <p style={{fontSize: '13px', margin: '3px'}}>Delete card?</p>
                <div>
                    <button style={{padding: '5px', fontSize: '10px', backgroundColor: 'red'}}>Delete</button>
                    <button style={{padding: '5px', fontSize: '10px', backgroundColor: '#b0b0b0'}}>Cancel</button>
                </div>
            </div>


        </div>
    )
}

