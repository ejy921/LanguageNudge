import { supabase } from './supabaseClient.js';

const ALARM_NAME = 'nudgeAlarm';

// Alarm scheduling

async function scheduleNudge() {
  const { nudgeFrequency } = await chrome.storage.sync.get({
    nudgeFrequency: 60});
    chrome.alarms.create(ALARM_NAME, { periodInMinutes: nudgeFrequency });
}

chrome.runtime.onInstalled.addListener(scheduleNudge);
chrome.runtime.onStartup.addListener(scheduleNudge);

// reschedule alarm if user changes preference
chrome.storage.sync.onChanged.addListener((changes) => {
  if (changes.nudgeFrequency) {
    scheduleNudge();
  }
});

// Open NudgeCard window on alarm

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== ALARM_NAME) return;

  const { nudgesEnabled } = await chrome.storage.sync.get({ nudgesEnabled: true });
  if (!nudgesEnabled) return;

  // Get the user's first deck from cache
  const cached = await chrome.storage.local.get('supabase_decks_cache');
  const decks = cached.supabase_decks_cache;
  if (!decks || decks.length === 0) return;

  const deckId = decks[0].id;
  chrome.windows.create({
    url: chrome.runtime.getURL(`dist/nudge.html?deckId=${deckId}`),
    type: 'popup',
    width: 350,
    height: 400,
  });
});

supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT') {
    chrome.storage.local.remove('supabase_decks_cache');
    chrome.alarms.clear(ALARM_NAME);
    console.log('User signed out, cache cleared.');
  }  
});
