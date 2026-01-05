// import { createClient } from '@supabase/supabase-js';

// const chromeStorageAdapter = {
//     getItem: (key) => {
//         return new Promise((resolve) => {
//             chrome.storage.local.get([key], (result) => {
//                 resolve(result[key] || null);
//             });
//         });
//     }, 
//     setItem: (key, value) => {
//         chrome.storage.local.set({ [key]: value });
//     },
//     removeItem: (key) => {
//         chrome.storage.local.remove([key]);
//     }
// }

// const supabase = createClient(
//     process.env.SUPABASE_URL,
//     process.env.SUPABASE_ANON_KEY,
//   {
//     auth: {
//         storage: chromeStorageAdapter,
//         persistSession: true,
//         autoRefreshToken: true,
//         detectSessionInUrl: false
//     }
//   }
// );

// let isSigningUp = false;

// createIcons({
//     icons: {
//         CirclePlus,
//         Trash2
//     }
// });

// // functions

// async function signUpNewUser(email, password) {
//     if (isSigningUp) return;
//     isSigningUp = true;
//     if (password.length < 6) {
//         document.getElementById('passwordTooShort').style.display = 'block';
//         isSigningUp = false;
//         return;
//     }
//     try {
//         const { data, error } = await supabase.auth.signUp({
//             email,
//             password
//         });
//         if (error) {
//             if (error.code === 'user_already_exists') {
//                 document.getElementById('userAlreadyExists').style.display = 'block';
//             }
//             console.error(error);
//             return;
//         }
//         if (data?.user) {
//             console.log('Sign up success for user', data.user.id);

//             document.getElementById('signUpEmail').value = '';
//             document.getElementById('signUpPassword').value = '';

//             document.getElementById('signUpPage').style.display = 'none';
//             document.getElementById('signInPage').style.display = 'none';
//             document.getElementById('welcomePage').style.display = 'block';
//             return;
//         }
//     } finally {
//         isSigningUp = false;
//     }
// }

// async function signIn(email, password) {
//     const { data, error } = await supabase.auth.signInWithPassword({ email, password });
//     if (error) {
//         console.error(error.message);
//     } else {
//         console.log('Logged in user:', data.user);
//         document.getElementById('signInPage').style.display = 'none';
//         document.getElementById('homePage').style.display = 'block';
        
//     }
// }

// async function signOut() {
//   const { error } = await supabase.auth.signOut();
//   if (error) {
//     console.error(error.message);
//   } else {
//     // clear cache
//     localStorage.removeItem('supabase_decks_cashe');
//   }
// }

// function renderDecksHTML(decks) {
//     const decksContainer = document.getElementById('decksContainer');
//     decksContainer.innerHTML = '';

//     decks.forEach(deck => {
//         const deckElement = document.createElement('div');
//         deckElement.className = 'container-box';
//         deckElement.innerHTML = `
//             <div class="deck-row" style="display: flex; flex-direction: row; justify-content: space-between; align-items: center;">
//                 <p>${deck.name}</p>
//                 <button class="viewDeckBtn" data-id="${deck.id} style="">View deck</button>
//                 <button class="sub-button reviewBtn" data-id="${deck.id}">Review</button>
//                 <button class="sub-button quizBtn" data-id="${deck.id}">Quiz</button>
//                 <img class="icon deleteDeckBtn" data-id="${deck.id}" src="images/icons/delete.png" alt="delete" style="width: 16px; height: 16px;">
//                 </div>
//             </div>
//         `;
//         decksContainer.appendChild(deckElement);
//     });
// }

// async function displayDecks() {
//     // check for cached data first
//     const cachedDecks = localStorage.getItem('supabase_decks_cache');
//     if (cachedDecks) {
//         renderDecksHTML(JSON.parse(cachedDecks));
//     }
//     // fetch fresh data from supabase
//     const { data: decks, error } = await supabase
//         .from('decks')
//         .select('*');
//     if (error) {
//         console.error('Error fetching decks:', error);
//         return;
//     }
//     // only re-render if new data is different from cache
//     const freshDecks = JSON.stringify(decks);
//     if (freshDecks !== cachedDecks) {
//         localStorage.setItem('supabase_decks_cache', freshDecks);
//         renderDecksHTML(decks);
//     }
// }

// function renderVocabHTML(vocabs) {
//     const vocabRowContainer = document.getElementById('vocabRowContainer');
//     vocabRowContainer.innerHTML = '';
//     vocabs.forEach(vocab => {
//         const rowElement = document.createElement('div');
//         rowElement.className = 'vocab-row';
//         rowElement.innerHTML = `
//                 <p>${vocab.front}</p>
//                 <p>${vocab.back}</p>
//                 <div class="options" style="position: relative; display: inline-block;">
//                     <img class="icon options-trigger" id="optionsBtn" src="images/icons/threedots.png" alt="options">
//                     <div class="dropdown-content" id="dropdownContent">
//                         <a href="#" class="edit-vocab" data-id="${vocab.id}">Edit</a>
//                         <a href="#" class="delete-vocab" data-id="${vocab.id}">Delete</a>
//                     </div>
//                 </div>
//         `;
//         vocabRowContainer.appendChild(rowElement);
//     });
// }

// async function displayVocabCard(currentDeckId) {
//     // check for cached data
//     const cachedVocabs = localStorage.getItem('vocabs_cached');
//     if (cachedVocabs) {
//         renderVocabHTML(JSON.parse(cachedVocabs));
//     }
//     currentDeckId = currentDeckId.trim().split(' ')[0];
//     const { data: vocabs, error } = await supabase
//         .from('vocab')
//         .select('*')
//         .eq('deck_id', currentDeckId);
//     if (error) {
//         console.error('Error fetching vocab', error);
//         return;
//     }

//     const freshVocabs = JSON.stringify(vocabs);
//     if (freshVocabs !== cachedVocabs) {
//         localStorage.setItem('vocabs_cached', freshVocabs);
//         renderVocabHTML(vocabs);
//     }
// }

async function createVocab(front, back, deckId) {
    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if ( userError || !user ) {
            console.error('You must be logged in to create cards.');
            return;
        }
        const newVocab = {
            id: crypto.randomUUID(),
            deck_id: deckId,
            front: front,
            back: back
        };
        // insert into supabase
        const { data, error } = await supabase
            .from('vocab')
            .insert([newVocab])
            .select();
        if (error) throw error;
        // local storage + render
        const rawCache = localStorage.getItem('vocabs_cached');
        const cachedVocabs = rawCache ? JSON.parse(rawCache) : [];
        cachedVocabs.push(data[0]);
        localStorage.setItem('vocabs_cached', JSON.stringify(cachedVocabs));
        renderVocabHTML(cachedVocabs);
    } catch (err) {
        console.error('Error saving vocab:', err.message);
    }
}

async function deleteDeck(deckId) {
    try {
        const { error } = await supabase
            .from('decks')
            .delete()
            .eq('id', deckId);
        if (error) throw error;
        
        await displayDecks();
        homePage.style.display = 'block';
    } catch (err) {
        console.error('Error deleting deck:', err.message);
    }
}

async function deleteVocab(id, deckId) {
    try {
        const { data, error } = await supabase
            .from('vocab')
            .delete()
            .eq('id', id)
            .select();
        if (error) throw error;

        console.log("Deleted successfully:", data);

        const rawCache = localStorage.getItem('vocabs_cached');
        if (rawCache) {
            const cachedVocabs = JSON.parse(rawCache);
            const updatedCache = cachedVocabs.filter(v => v.id !== id);
            localStorage.setItem('vocabs_cached', JSON.stringify(updatedCache));
        }
        // display updated list
        if (deckId) {
            await displayVocabCard(deckId);
        }
    } catch (err) {
        console.error('Error deleting vocab:', err.message);
    }
}

async function editVocab(id, front, back, deckId) {
    try {
        const { data, error } = await supabase
            .from('vocab')
            .update({ front: front, back: back })
            .eq('id', id)
            .select();
        if (error) throw error;

        if (!data || data.length === 0) {
            throw new Error(`No row updated! Check if ID ${id} exists and matches RLS policies.`);
        }

        const rawCache = localStorage.getItem('vocabs_cached');
        if (rawCache) {
            let cachedVocabs = rawCache ? JSON.parse(rawCache) : [];
            const updatedCache = cachedVocabs.map(v => v.id === id ? { ...v, front: front, back: back } : v);
            localStorage.setItem('vocabs_cached', JSON.stringify(updatedCache));
        }
        // display updated list
        await displayVocabCard(deckId);
    } catch (err) {
        console.error('Error editing vocab:', err.message);
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

    // // immediate cache render
    // const cachedDecks = localStorage.getItem('supabase_decks_cache');
    // if (cachedDecks) {
    //     renderDecksHTML(JSON.parse(cachedDecks));
    //     homePage.style.display = 'block';   
    // }

    // const { data: { session }, error } = await supabase.auth.getSession();

    // // Screen changes
    
    // function hideAllPages() {
    //     homePage.style.display = 'none';
    //     settingsPage.style.display = 'none';
    //     vocabsPage.style.display = 'none';
    //     flashcardPage.style.display = 'none';
    //     quizPage.style.display = 'none';
    //     welcomePage.style.display = 'none';
    //     signUpPage.style.display = 'none';
    //     signInPage.style.display = 'none';
    // }

    // if (session) {
    //     await displayDecks();
    //     hideAllPages();
    //     homePage.style.display = 'block';
    // } else {
    //     hideAllPages();
    //     signUpPage.style.display = 'block';
    //     document.getElementById('signUpEmail').focus();
    // }

    // document.getElementById('homeBtn').addEventListener('click', () => {
    //     if (session) {
    //         hideAllPages();
    //         homePage.style.display = 'block';
    //     }
    // });

    // document.getElementById('settingsBtn').addEventListener('click', () => {
    //     if (session) {
    //         hideAllPages();
    //         settingsPage.style.display = 'block';
    //     }
    // });


    // Authentication

    // const signUpBtn = document.getElementById('signUpBtn');
    // const signInBtn = document.getElementById('signInBtn');

    // signUpBtn.onclick = async () => {
    //     const emailInput = document.getElementById('signUpEmail');
    //     const passwordInput = document.getElementById('signUpPassword');

    //     // disable button to prevent double-clicks
    //     signUpBtn.disabled = true;

    //     await signUpNewUser(emailInput.value, passwordInput.value);
    //     // re-enable button 
    //     signUpBtn.disabled = false;
    // }
    
    // document.getElementById('signUpPassword').addEventListener('keypress', (e) => {
    //     if (e.key === 'Enter') {
    //         document.getElementById('signUpBtn').click();
    //     }
    // });

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

    // document.getElementById('goToSignIn').addEventListener('click', (e) => {
    //     e.preventDefault();
    //     hideAllPages();
    //     signInPage.style.display = 'block';
    //     document.getElementById('signInEmail').focus();
    // });

    // document.getElementById('goToSignUp').addEventListener('click', (e) => {
    //     e.preventDefault();
    //     hideAllPages();
    //     signUpPage.style.display = 'block';
    //     document.getElementById('signInEmail').focus();
    // });

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
            
        if (!error && data) {
            await displayDecks();
            hideAllPages();
            homePage.style.display = 'block';  
        } else {
            console.error('Error creating deck', error.message);
            alert('Failed to create deck');
        }
    });

    document.getElementById('cancelDeckBtn').addEventListener('click', () => {
        document.getElementById('deckAddPopup').style.display = 'none';
        popupDeckName.value = '';
    });


    document.getElementById('decksContainer').addEventListener('click', (e) => {
        // view deck
        if (e.target.classList.contains('viewDeckBtn')) {
            const deckId = e.target.getAttribute('data-id');
            currentDeckId = deckId.trim().split(' ')[0];
            hideAllPages();
            vocabsPage.style.display = 'block';
            displayVocabCard(currentDeckId);
        }
        // delete deck
        if (e.target.classList.contains('deleteDeckBtn')) {
            const deckId = e.target.getAttribute('data-id');
            document.getElementById('confirmDeleteDeckPopup').style.display = 'flex';
            document.getElementById('confirmDeleteDeckBtn').onclick = () => {
                document.getElementById('confirmDeleteDeckPopup').style.display = 'none';
                deleteDeck(deckId);
            }
            document.getElementById('cancelDeleteDeckBtn').onclick = () => {
                document.getElementById('confirmDeleteDeckPopup').style.display = 'none';
            }
        }
    });

    document.getElementById('deleteDeckInPage').addEventListener('click', () => {
        deleteDeck(currentDeckId);
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


    // Manage Cards / Vocab Page

    const vocabFront = document.getElementById('vocabFront');
    const vocabBack = document.getElementById('vocabBack');
    const vocabRowContainer = document.getElementById('vocabRowContainer');
    const vocabEditId = document.getElementById('vocabEditId');

    document.getElementById('addVocabBtn').addEventListener('click', () => {
        document.getElementById('vocabSavePopup').style.display = 'flex';
        document.getElementById('vocabFront').focus();
    });

    vocabFront.addEventListener('keypress', (e) => {
        if (e.key == 'Enter') {
            vocabBack.focus();
        }
    });

    document.getElementById('vocabBack').addEventListener('keypress', (e) => {
        if (e.key == 'Enter') {
            e.preventDefault();
            document.getElementById('saveVocabBtn').click();
        }
    });

    document.getElementById('saveVocabBtn').addEventListener('click', () => {
        const frontText = vocabFront.value.trim();
        const backText = vocabBack.value.trim();
        const vocabId = vocabEditId.value;

        if (!frontText || !backText) {
            alert('Please insert values for both sides of the card');
            return;
        }        
        if (vocabId) {
            editVocab(vocabId, frontText, backText, currentDeckId);
        } else {
            createVocab(frontText, backText, currentDeckId);
        }
        document.getElementById('vocabSavePopup').style.display = 'none';
        vocabFront.value = '';
        vocabBack.value = '';
        vocabEditId.value = '';
    });
    
    document.getElementById('cancelVocabBtn').addEventListener('click', () => {
        document.getElementById('vocabSavePopup').style.display = 'none';
        vocabFront.value = '';
        vocabBack.value = '';
    });

    vocabRowContainer.addEventListener('click', async (e) => {
        // dropdown toggle for edit/delete
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
            document.getElementById('confirmDeleteVocabPopup').style.display = 'flex';
            document.getElementById('confirmDeleteVocabBtn').onclick = () => {
                document.getElementById('confirmDeleteVocabPopup').style.display = 'none';
                deleteVocab(vocabId, currentDeckId);
            }   
            document.getElementById('cancelDeleteVocabBtn').onclick = () => {
                document.getElementById('confirmDeleteVocabPopup').style.display = 'none';
            }
        }
        
        if (e.target.classList.contains('edit-vocab')) {
            e.preventDefault();
            const menu = e.target.closest('.dropdown-content');
            menu.style.display = 'none';

            const vocabId = e.target.getAttribute('data-id');
            const vocabSavePopup = document.getElementById('vocabSavePopup');
            const vocabEditId = document.getElementById('vocabEditId');
            const vocabFront = document.getElementById('vocabFront');
            const vocabBack = document.getElementById('vocabBack');

            // Populate the edit form with current values
            const rawCache = localStorage.getItem('vocabs_cached');
            const cachedVocabs = rawCache ? JSON.parse(rawCache) : [];
            const currentVocab = cachedVocabs.find(v => v.id === vocabId);
            if (currentVocab) {
                vocabEditId.value = currentVocab.id;
                vocabFront.value = currentVocab.front;
                vocabBack.value = currentVocab.back;
            }

            vocabSavePopup.style.display = 'flex';
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