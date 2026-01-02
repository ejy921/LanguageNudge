import { createClient } from "@supabase/supabase-js";

// tell supabase to use chrome.storage instead of window.localStorage
const chromeStorageAdapter = {
  getItem: (key) => {
    return new Promise((resolve) => {
      // We wrap this in a Promise because chrome.storage is asynchronous
      chrome.storage.local.get([key], (result) => {
        resolve(result[key] || null);
      });
    });
  },
  setItem: (key, value) => {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, () => resolve());
    });
  },
  removeItem: (key) => {
    return new Promise((resolve) => {
      chrome.storage.local.remove([key], () => resolve());
    });
  },
};

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
        storage: chromeStorageAdapter,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false
    }
  }
);