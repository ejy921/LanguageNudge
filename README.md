# LangNudge

LangNudge is a to-be Chrome Extension that bridges the gap between passive browsing and active recall. It integrates into daily workflows via randomized browser notifications powered by a custom SM-2 Spaced Repetition (SR) engine.

---

## Key Features
* Import .csv files containing vocab, or use a built-in start pack
* Spaced repetition scheduling: nudges vocabulary with an evidence-based learning system
* AI-powered example sentences for contextual learning
* Streak tracker to track your progress

## Technical Features
* JavaScript, HTML5, CSS3 with Supabase Auth and Storage (PostgreSQL)
* OpenAI API (RAG-based contextual sentence generation)
* Chrome Alarms API & Background Service Workers for nudges
* Optimistic UI

## Program Architecture
![Picture of LangNudge program architecture](images/program_architecture.png)

## Program Structure

LangNudge/
├── dist/                 
├── src/
│   ├── assets/            
│   ├── components/        (React components)
│   │   ├── Auth.jsx
│   │   ├── Home.jsx       (main Deck view)
│   │   └── Settings.jsx
│   ├── background.js      
│   ├── popup.jsx          (React Entry point)
│   ├── App.jsx            (Main Routing & Layout)
│   ├── supabaseClient.js  (Single source of truth)
│   ├── popup.html         
│   └── popup.css          
├── tests/
│   ├── setup.js
│   └── ...
├── build.js               
├── vitest.config.js
├── manifest.json
├── package.json
└── .env