import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { nextCard, resetQueue, nextReview } from '../utils/vocabQueue';


export default function NudgeCard({ deckId, preferences, navigate }) {

    const [currentCard, setCurrentCard] = useState(null);
    const [flipped, setFlipped] = useState(false);
    const [deckFinished, setDeckFinished] = useState(false);
    const { flashcardStartSide } = preferences;

    useEffect(() => {
        nextCard({ deckId }).then(result => {
            if (result) setCurrentCard(result.card);
        });
    }, [deckId]);

    // flashcardStartSide dependent on user preference
    const [startSide, setStartSide] = useState(() =>
        flashcardStartSide === 'random'
            ? (Math.random() < 0.5 ? 'front' : 'back')
            : flashcardStartSide
    );

    if (!currentCard) return <p>Loading...</p>;

    const flippedSide = startSide === 'front' ? 'back' : 'front';

    const handleNext = (score) => {
        setFlipped(false);
        nextCard({ deckId }).then(result => {
            if (!result) {
                setDeckFinished(true);
            } else {
                const { card, listSize } = result;
                const { next_review, streak } = nextReview(score, currentCard.review_time, currentCard.streak, 'nudge', listSize);
                setStartSide(flashcardStartSide === 'random'
                    ? (Math.random() < 0.5 ? 'front' : 'back')
                    : flashcardStartSide);
                setCurrentCard(card);
                // update streak and next_review in Supabase
                const { error } = supabase
                    .from('vocab')
                    .update({ next_review, streak })
                    .eq('id', card.id);
                if (error) console.error('Error updating card review time:', error.message);
            }
        })
    }

    const handleContinue = () => {
        resetQueue(deckId);
        setDeckFinished(false);
        nextCard({ deckId }).then(result => {
            if (result) {
                setStartSide(flashcardStartSide === 'random'
                    ? (Math.random() < 0.5 ? 'front' : 'back')
                    : flashcardStartSide);
                setCurrentCard(result.card);
            }
        });
    }

    return (
        <div className='nudge-card'>
            {deckFinished ? (
                <div className='mini-popup' style={{marginBottom: '10px'}}>
                    <p>You finished your deck! Would you still like to continue?</p>
                    <div>
                        <button onClick={handleContinue} style={{ padding: '10px', fontSize: '10px' }}>Yes</button>
                        <button onClick={() => navigate('home')} style={{ padding: '10px', fontSize: '10px', backgroundColor: '#b0b0b0' }}>No</button>
                    </div>
                </div>
            ) : (!flipped ? (
                    <div>
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <h1>{currentCard[startSide]}</h1>
                        </div>
                        <button onClick={() => setFlipped(!flipped)} style={{marginBottom: '3px', padding: '5px 10px'}}>
                            Flip
                        </button>
                    </div>
                ) : (
                    <div>
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <h1>{currentCard[flippedSide]}</h1>
                        </div>
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', columnGap: '20px'}}>
                            <ThumbsDown onClick={() => handleNext(0)} color='red' className='thumbs' style={{borderColor: 'red'}}/>
                            <ThumbsUp onClick={() => handleNext(1)} color="green" className='thumbs' style={{borderColor: 'green'}}/>
                        </div>
                    </div>
                    )
                )}
        </div>
    )
}

