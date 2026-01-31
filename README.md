# LangNudge

LangNudge is a to-be Chrome Extension that bridges the gap between passive browsing and active recall. It integrates into daily workflows via randomized browser notifications that is adapted to user performance.

---

## Key Features
* Import .csv files containing vocab, or use a built-in start pack
* Smart review: nudges vocabulary based on user performance
* AI-powered example sentences for contextual learning
* Streak tracker to track your progress

## Technical Features
* JavaScript, HTML5, CSS3 with Supabase Auth and Storage (PostgreSQL)
* Weighted priority queue that takes in user performance used for smart review
* OpenAI API (RAG-based contextual sentence generation)
* Chrome Alarms API & Background Service Workers for nudges
* Optimistic UI
* CI pipeline + linting

## Program Architecture
![Picture of LangNudge program architecture](images/program_architecture.png)