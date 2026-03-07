import { supabase } from './supabaseClient.js';

supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT') {
    chrome.storage.local.remove('supabase_decks_cache');
    console.log('User signed out, cache cleared.');
  }  
});
