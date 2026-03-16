import { createRoot } from 'react-dom/client';
import { useState, useEffect } from 'react';
import NudgeCard from './components/NudgeCard';

const DEFAULT_PREFERENCES = {
    nudgeStyle: 'flashcard',
    nudgeFrequency: 60,
    blockedSites: [],
    flashcardStartSide: 'front',
};

export default function NudgeWindow() {
    const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
    const deckId = new URLSearchParams(window.location.search).get('deckId');

    useEffect(() => {
        chrome.storage.sync.get(DEFAULT_PREFERENCES, (result) => {
            setPreferences(result);
        });
    }, []);

    if (!deckId) return <p>No deck selected.</p>;

    return (
        <NudgeCard
            deckId={deckId}
            preferences={preferences}
            navigate={() => window.close()}
        />
    );
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<NudgeWindow />);