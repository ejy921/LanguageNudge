import { createClient } from '@supabase/supabase-js';

const supabase = createClient("https://doszhbvpoawlgsezbkiz.supabase.co", "sb_publishable_mgJOABvdgM4BaWv19FRunA_WMOJeNOL");

let isSigningUp = false;

async function signUpNewUser(email, password) {
    if (isSigningUp) return;
    isSigningUp = true;

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });

        if (error) {
            if (error.message.includes('User already registered')) {
                alert('Looks like your email is already registered. Please log in instead.')
            } else {
                console.error('Sign up error:', error.message);
            }
            console.error('Sign up error:', error.message);
            return;
        }
        
        console.log('Sign up success for user', data);

        document.getElementById('signUpPage').style.display = 'none';
        document.getElementById('signInPage').style.display = 'none';
        document.getElementById('welcomePage').style.display = 'block';
    } finally {
        isSigningUp = false;
    }
}

async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        console.error(error.message);
    } else {
        console.log('Logged in user:', data.user);
    }
}

async function signOut() {
  const { error } = await supabase.auth.signOut()
}


document.addEventListener('DOMContentLoaded', function () {
    const popupDeckName = document.getElementById('popupDeckName');
    const homePage = document.getElementById('homePage');
    const settingsPage = document.getElementById('settingsPage');
    const vocabsPage = document.getElementById('vocabsPage');
    const flashcardPage = document.getElementById('flashcardPage');
    const quizPage = document.getElementById('quizPage'); 

    // Screen changes
    
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


    // Authentication

    
    document.getElementById('signUpBtn').addEventListener('click', () => {
        signUpNewUser(document.getElementById('signUpEmail').value, document.getElementById('signUpPassword').value);
        document.getElementById('signUpEmail').value = '';
        document.getElementById('signUpPassword').value = '';
    });

    document.getElementById('signInBtn').addEventListener('click', () => {
        signIn(document.getElementById('signInEmail').value, document.getElementById('signInPassword').value);
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';
    });

    document.getElementById('goToSignIn').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('signUpPage').style.display = 'none';
        document.getElementById('signInPage').style.display = 'block';
    });


    // Manage Decks + Cards

    document.getElementById('addDeckBtn').addEventListener('click', () => {
        document.getElementById('deckAddPopup').style.display = 'flex';
        popupDeckName.value = '';
        popupDeckName.focus();
    });

    document.getElementById('createDeckBtn').addEventListener('click', () => {
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

    document.getElementById('cancelDeckBtn').addEventListener('click', () => {
        document.getElementById('deckAddPopup').style.display = 'none';
        popupDeckName.value = '';
    });

    document.getElementById('uploadBtn').addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });

    document.getElementById('fileInput').addEventListener('change', (event) => {
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