import { createClient } from '@supabase/supabase-js';

const chromeStorageAdapter = {
    getItem: (key) => {
        return new Promise((resolve) => {
            chrome.storage.local.get([key], (result) => {
                resolve(result[key] || null);
            });
        });
    }, 
    setItem: (key, value) => {
        chrome.storage.local.set({ [key]: value });
    },
    removeItem: (key) => {
        chrome.storage.local.remove([key]);
    }
}

const supabase = createClient(
  'https://doszhbvpoawlgsezbkiz.supabase.co',
  'sb_publishable_mgJOABvdgM4BaWv19FRunA_WMOJeNOL',
  {
    auth: {
        storage: chromeStorageAdapter,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false
    }
  }
);
let isSigningUp = false;

// functions

async function signUpNewUser(email, password) {
    if (isSigningUp) return;
    isSigningUp = true;
    if (password.length < 6) {
        document.getElementById('passwordTooShort').style.display = 'block';
        isSigningUp = false;
        return;
    }
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });
        if (error) {
            if (error.code === 'user_already_exists') {
                document.getElementById('userAlreadyExists').style.display = 'block';
            }
            console.error(error);
            return;
        }
        if (data?.user) {
            console.log('Sign up success for user', data.user.id);

            document.getElementById('signUpEmail').value = '';
            document.getElementById('signUpPassword').value = '';

            document.getElementById('signUpPage').style.display = 'none';
            document.getElementById('signInPage').style.display = 'none';
            document.getElementById('welcomePage').style.display = 'block';
            return;
        }
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
        document.getElementById('signInPage').style.display = 'none';
        document.getElementById('homePage').style.display = 'block';
        
    }
}

async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error(error.message);
  } else {
    // clear cache
    localStorage.removeItem('supabase_decks_cashe');
  }
}

function renderDecksHTML(decks) {
    const decksContainer = document.getElementById('decksContainer');
    decksContainer.innerHTML = '';

    decks.forEach(deck => {
        const deckElement = document.createElement('div');
        deckElement.className = 'container-box';
        deckElement.innerHTML = `
            <div class="deck-row" style="display: flex; flex-direction: row; justify-content: space-between; align-items: center;">
                <p>${deck.name}</p>
                <button class="viewDeckBtn" data-id="${deck.id}">View deck</button>
                <button class="reviewBtn" data-id="${deck.id}">Review</button>
                </div>
            </div>
        `;
        decksContainer.appendChild(deckElement);
    });
}

async function displayDecks() {
    // check for cached data first
    const cachedDecks = localStorage.getItem('supabase_decks_cache');
    if (cachedDecks) {
        renderDecksHTML(JSON.parse(cachedDecks));
    }
    // fetch fresh data from supabase
    const { data: decks, error } = await supabase
        .from('decks')
        .select('*');
    if (error) {
        console.error('Error fetching decks:', error);
        return;
    }
    // only re-render if new data is different from cache
    if (JSON.stringify(decks) !== cachedDecks) {
        localStorage.setItem('supabase_decks_cache', JSON.stringify(decks));
        renderDecksHTML(decks);
    }
}

async function displayVocabCard(currentDeckId) {
    const vocabRowContainer = document.getElementById('vocabRowContainer');
    vocabRowContainer.innerHTML = 'Loading';
    
    const { data: vocabs, error } = await supabase
        .from('vocab')
        .select('*')
        .eq('deck_id', currentDeckId);
    if (error) {
        console.error('Error fetching vocab', error);
        return;
    }

    console.log(currentDeckId);
    console.log(vocabs);

    vocabRowContainer.innerHTML = '';
    vocabs.forEach(vocab => {
        const rowElement = document.createElement('div');
        rowElement.className = 'vocab-row';
        rowElement.innerHTML = `
                <p>${vocab.front}</p>
                <p>${vocab.back}</p>
                <div class="options" style="position: relative; display: inline-block;">
                    <img class="icon options-trigger" id="optionsBtn" src="images/icons/threedots.png" alt="options">
                    <div class="dropdown-content" id="dropdownContent">
                        <a href="#" class="edit-vocab" data-id="${vocab.id}">Edit</a>
                        <a href="#" class="delete-vocab" data-id="${vocab.id}">Delete</a>
                    </div>
                </div>
        `;
        vocabRowContainer.appendChild(rowElement);
    });
}

async function deleteVocab(id, element) {
    try {
        const { error } = await supabase
            .from('vocab')
            .delete()
            .eq('id', id);
        if (error) throw error;

        element.style.transition = "opacity 0.3s ease";
        element.style.opacity = "0";
        setTimeout(() => element.remove(), 100);

    } catch (err) {
        console.error('Error deleting vocab:', err.message);
        alert('Failed to delete the card.');
    }
}

//==============================//
// DOM Loaded                   //
//==============================//

document.addEventListener('DOMContentLoaded', async function () {
    const popupDeckName = document.getElementById('popupDeckName');
    const signUpPage = document.getElementById('signUpPage');
    const homePage = document.getElementById('homePage');
    const welcomePage = document.getElementById('welcomePage');
    const settingsPage = document.getElementById('settingsPage');
    const vocabsPage = document.getElementById('vocabsPage');
    const flashcardPage = document.getElementById('flashcardPage');
    const quizPage = document.getElementById('quizPage');
    const signInPage = document.getElementById('signInPage');

    const { data: { session }, error } = await supabase.auth.getSession();

    // Screen changes
    
    function hideAllPages() {
        homePage.style.display = 'none';
        settingsPage.style.display = 'none';
        vocabsPage.style.display = 'none';
        flashcardPage.style.display = 'none';
        quizPage.style.display = 'none';
        welcomePage.style.display = 'none';
        signUpPage.style.display = 'none';
        signInPage.style.display = 'none';
    }

    if (session) {
        await displayDecks();
        hideAllPages();
        homePage.style.display = 'block';
    } else {
        hideAllPages();
        signUpPage.style.display = 'block';
        document.getElementById('signUpEmail').focus();
    }

    document.getElementById('homeBtn').addEventListener('click', () => {
        if (session) {
            hideAllPages();
            homePage.style.display = 'block';
        }
    });

    document.getElementById('settingsBtn').addEventListener('click', () => {
        if (session) {
            hideAllPages();
            settingsPage.style.display = 'block';
        }
    });


    // Authentication

    const signUpBtn = document.getElementById('signUpBtn');
    const signInBtn = document.getElementById('signInBtn');

    signUpBtn.onclick = async () => {
        const emailInput = document.getElementById('signUpEmail');
        const passwordInput = document.getElementById('signUpPassword');

        // disable button to prevent double-clicks
        signUpBtn.disabled = true;

        await signUpNewUser(emailInput.value, passwordInput.value);
        // re-enable button 
        signUpBtn.disabled = false;
    }
    
    document.getElementById('signUpPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('signUpBtn').click();
        }
    });

    signInBtn.onclick = async () => {
        const emailInput = document.getElementById('signInEmail');
        const passwordInput = document.getElementById('signInPassword');

        signInBtn.disabled = true;
        await signIn(emailInput.value, passwordInput.value);
        signInBtn.disabled = false;
    }

    document.getElementById('signInPassword').addEventListener('keypress', (e) => {
        if (e.key == 'Enter') {
            document.getElementById('signInBtn').click();
        }
    });

    document.getElementById('goToSignIn').addEventListener('click', (e) => {
        e.preventDefault();
        hideAllPages();
        signInPage.style.display = 'block';
        document.getElementById('signInEmail').focus();
    });

    document.getElementById('goToSignUp').addEventListener('click', (e) => {
        e.preventDefault();
        hideAllPages();
        signUpPage.style.display = 'block';
        document.getElementById('signInEmail').focus();
    });

    document.getElementById('signOutBtn').addEventListener('click', async () => {
        console.log('Attempt to sign out');
        await signOut();
        hideAllPages();
        signInPage.style.display = 'block';
    });


    // Manage Decks

    let currentDeckId = null;

    document.getElementById('addDeckBtn').addEventListener('click', () => {
        document.getElementById('deckAddPopup').style.display = 'flex';
        popupDeckName.value = '';
        popupDeckName.focus();
    });

    // Create new deck and store in Supabase
    document.getElementById('createDeckBtn').addEventListener('click', async () => {
        const deckName = popupDeckName.value.trim();
        if (!deckName) {
            alert('Please enter a deck name');
            return;
        }

        const { data: { user }, error: userError} = await supabase.auth.getUser();
        if ( userError || !user ) {
            console.error('No user logging in');
            return;
        }
        // Get rid of popup
        document.getElementById('deckAddPopup').style.display = 'none';
        currentDeckId = crypto.randomUUID();
        const newDeck = {
            id: currentDeckId,
            name: deckName,
            user_id: user.id
        };
        const { data, error } = await supabase
            .from('decks')
            .insert([newDeck])
            .select();
        console.log('Deck in supabase for', data[0]?.user_id, data);
        if (!error && data) {
            const cachedDecks = JSON.parse(localStorage.getItem('supabase_decks_cache'));
            cachedDecks.push(data[0]);
            localStorage.setItem('supabase_decks_cache', JSON.stringify(cachedDecks));
        }
        homePage.style.display = 'block';  
    });

    document.getElementById('cancelDeckBtn').addEventListener('click', () => {
        document.getElementById('deckAddPopup').style.display = 'none';
        popupDeckName.value = '';
    });



    document.getElementById('decksContainer').addEventListener('click', (e) => {
        if (e.target.classList.contains('viewDeckBtn')) {
            const deckId = e.target.getAttribute('data-id');
            currentDeckId = deckId;
            hideAllPages();
            // TODO: await displayCards()
            vocabsPage.style.display = 'block';
            displayVocabCard(currentDeckId);
        }
    });

    document.querySelectorAll('.uploadBtn').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('body').querySelector('.fileInput').click();
            console.log('Button clicked');
        })
    })

    // document.querySelectorAll('.fileInput').forEach(input => {
    //     addEventListener('change', (event) => {
    //         const file = event.target.files[0];
    //         if (!file) return;
    //         const reader = new FileReader();
    //         reader.onload = function(e) {
    //             const content = e.target.result;
    //             document.getElementById('output').textContent = content;
    //         };
    //         reader.readAsText(file);
    //     });
    // });


    // Manage Cards

    const vocabFront = document.getElementById('vocabFront');
    const vocabBack = document.getElementById('vocabBack');
    const vocabRowContainer = document.getElementById('vocabRowContainer');

    document.getElementById('addVocabBtn').addEventListener('click', () => {
        document.getElementById('vocabAddPopup').style.display = 'flex';
    });

    vocabFront.addEventListener('keypress', (e) => {
        if (e.key == 'Enter') {
            vocabBack.focus();
        }
    });

    // document.getElementById('vocabBack').addEventListener('keypress', (e) => {
    //     if (e.key == 'Enter') {
    //         // TODO: createVocab
    //     }
    // });

    document.getElementById('createVocabBtn').addEventListener('click', async () => {
        const frontText = vocabFront.value.trim();
        const backText = vocabBack.value.trim();
        if (!frontText || !backText) {
            alert('Please insert values for both sides of the card');
            return;
        }        
        
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if ( userError || !user ) {
            console.error('You must be logged in to create cards.');
            return;
        }

        document.getElementById('vocabAddPopup').style.display = 'none';

        const newVocab = {
            id: crypto.randomUUID(),
            deck_id: currentDeckId,
            user_id: user.id,
            front: frontText,
            back: backText
        };

        const { data, error } = await supabase
            .from('vocab')
            .insert([newVocab])
            .select();
        console.log(newVocab);
        if (error) {
            console.error('Error inserting vocab:', error.message);
            alert('Failed to save card');
        } else {
            console.log('Created card', data);
            document.getElementById('vocabAddPopup').style.display = 'none';
            vocabFront.value = '';
            vocabBack.value = '';
        }
    });
    
    document.getElementById('cancelVocabBtn').addEventListener('click', () => {
        document.getElementById('vocabAddPopup').style.display = 'none';
        vocabFront.value = '';
        vocabBack.value = '';
    });

    vocabRowContainer.addEventListener('click', async (e) => {
        // dropdown toggle
        if (e.target.classList.contains('options-trigger')) {
            const menu = e.target.parentElement.querySelector('.dropdown-content');

            document.querySelectorAll('.dropdown-content').forEach(el => {
                if (el !== menu) el.style.display = 'none';
            });
            const isVisible = menu.style.display == 'block';
            menu.style.display = isVisible ? 'none' : 'block';

            e.stopPropagation();
        }
        // delete
        if (e.target.classList.contains('delete-vocab')) {
            e.preventDefault();
            const vocabId = e.target.getAttribute('data-id');
            const confirmDelete = confirm("Are you sure you want to delete this card?");
            if (confirmDelete) {
                await deleteVocab(vocabId, e.target.closest('.vocab-row'));
            }
        }
    });

}); // DOMContent loaded


function parseData(data) {
    if (!data || typeof data !== 'string') return [];

    // 1. Better Delimiter Detection (prioritize Tab -> Semicolon -> Comma)
    const firstLine = data.split('\n')[0];
    let delimiter = ',';
    if (firstLine.includes('\t')) delimiter = '\t';
    else if (firstLine.includes(';')) delimiter = ';';

    const lines = data.trim().split(/\r?\n/); // Handles both Windows (\r\n) and Unix (\n)
    
    const splitRegex = new RegExp(`${delimiter}(?=(?:(?:[^"]*"){2})*[^"]*$)`);

    const headers = lines[0].split(splitRegex).map(h => h.replace(/^"|"$/g, '').trim());

    const parsedData = lines.slice(1).map(line => {
        const values = line.split(splitRegex).map(v => v.replace(/^"|"$/g, '').trim());
        const entry = {};
        
        headers.forEach((header, index) => {
            entry[header] = values[index] ?? '';
        });
        return entry;
    });

    return parsedData;
}