import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', function () {
    const popupDeckName = document.getElementById('popupDeckName');
    const homePage = document.getElementById('homePage');
    const settingsPage = document.getElementById('settingsPage');
    const vocabsPage = document.getElementById('vocabsPage');
    const flashcardPage = document.getElementById('flashcardPage');
    const quizPage = document.getElementById('quizPage');
    
    function hideAllPages() {
        homePage.style.display = 'none';
        settingsPage.style.display = 'none';
        vocabsPage.style.display = 'none';
        flashcardPage.style.display = 'none';
        quizPage.style.display = 'none';
    }

    document.getElementById('homeBtn').addEventListener('click', () => {
        hideAllPages();
        homePage.style.display = 'block';
    });

    document.getElementById('settingsBtn').addEventListener('click', () => {
        hideAllPages();
        settingsPage.style.display = 'block';
    });

    document.getElementById('addDeckBtn').addEventListener('click', function() {
        document.getElementById('deckAddPopup').style.display = 'flex';
        popupDeckName.value = '';
        popupDeckName.focus();
    });

    document.getElementById('createDeckBtn').addEventListener('click', function() {
        const deckName = popupDeckName.value.trim();
        if (deckName) {
            console.log('Creating deck:', deckName);
            document.getElementById('deckAddPopup').style.display = 'none';

            const newDeck = {
                id: crypto.randomUUID(),
                name: deckName,
            };

            chrome.storage.local.get(['decks'], function(result) {
                const decks = result.decks || [];
                decks.push(newDeck);
                chrome.storage.local.set({ decks }, function() {
                    console.log('Deck saved:', newDeck);
                });
            });

            hideAllPages();
            // TBD: show vocabs page of that deck
            vocabsPage.style.display = 'block';  
        } else {
            alert('Please enter a deck name.');
        }
    });

    document.getElementById('cancelDeckBtn').addEventListener('click', function() {
        document.getElementById('deckAddPopup').style.display = 'none';
        popupDeckName.value = '';
    });

    document.getElementById('uploadBtn').addEventListener('click', function() {
        document.getElementById('fileInput').click();
    });

    document.getElementById('fileInput').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const content = e.target.result;
                document.getElementById('output').textContent = content;
            };
            reader.readAsText(file);
        }
    });
});

function parseData(data) {
    let delimiter = ',';
    if (data.indexOf('\t') !== -1) {
        delimiter = '\t';
    } else if (data.indexOf(';') !== -1) {
        delimiter = ';';
    }

    const lines = data.trim().split('\n');
    if (!delimiter) {
        return lines;
    }

    const headers = lines[0].split(delimiter).map(h => h.trim());
    const parsedData = lines.slice(1).map(line => {
        const values = line.split(delimiter).map(v => v.trim());
        const entry = {};
        headers.forEach((header, index) => {
            entry[header] = values[index] || '';
        });
        return entry;
    });
    console.log(parsedData);
    return parsedData;
}