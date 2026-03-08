import { useState } from 'react';


export default function NudgeCard(deckId) {

    const [currentCard, setCurrentCard] = useState(nextCard({deckId}));
    const [flipped, setFlipped] = useState(false);

    return (
        <div className='nudge-flashcard'>
            <h1>{currentCard.front}</h1>
            <button onClick={() => setFlipped(!flipped)}>Flip</button>
        </div>
    )
}

