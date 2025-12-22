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
    })

    document.getElementById('goToSignIn').addEventListener('click', (e) => {
        e.preventDefault();
        hideAllPages();
        signInPage.style.display = 'block';
        document.getElementById('signInEmail').focus();
    });

    document.getElementById('signOutBtn').addEventListener('click', async () => {
        console.log('Attempt to sign out');
        await signOut();
        hideAllPages();
        signInPage.style.display = 'block';
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