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

// Persist session
supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    chrome.storage.local.set({ supabaseSession: session });
  } else {
    chrome.storage.local.remove('supabaseSession');
  }
});

// Restore session on worker wake
chrome.runtime.onStartup.addListener(async () => {
  const { supabaseSession } = await chrome.storage.local.get('supabaseSession');
  if (supabaseSession) {
    await supabase.auth.setSession(supabaseSession);
  }
});


supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    console.log('User signed in:', session.user);
  } else if (event === 'SIGNED_OUT') {
    console.log('User signed out');
  }
});