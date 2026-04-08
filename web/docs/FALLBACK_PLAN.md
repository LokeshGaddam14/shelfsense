# ShelfSense Contingency Plans (The "Oh Sh*t" Protocol)

Hackathon demos break. Having a backup is what separates the winners from the losers. Keep this document open on a secondary screen or printed out near your table.

## 1. Internet Goes Down
- **The Issue:** Hotel/Venue Wi-Fi crashes and the APIs are unreachable.
- **The Plan:** 
  - DO NOT panic on stage. 
  - Immediately switch to your `localhost` web environment running locally on your laptop if possible.
  - *What to say:* "The venue Wi-Fi seems to be dropping, but that's actually a great feature showcase. In a real store's dead-zone backroom, connectivity is always an issue. That's why ShelfSense relies on offline capabilities. As you can see, I can still pull up cached data we synced minutes ago."
  - *Backup #2:* If everything relies on the cloud DB, swap to playing the backup video immediately (see below).

## 2. Voice Input Fails on Mobile
- **The Issue:** Microphones pick up too much crowd noise, or the transcription API stalls during the Hinglish demo.
- **The Plan:**
  - Let it fail ONCE (max 3–5 seconds wait). Do not try speaking into it a second time.
  - Smoothly pivot to keyboard.
  - *What to say:* "Looks like the room noise is a bit too loud for the mic right now. But no problem, the real power is in the NLP intent engine."
  - Immediately type the exact Hinglish string you were going to speak.

## 3. AI API Rate Limits (Gemini Throttling or API keys expire)
- **The Issue:** Too many users hit your endpoint at once, or the Google API returns `429 Too Many Requests`.
- **The Plan:**
  - Have an `.mp4` video recording of a flawless run-through pre-loaded and paused on your laptop desktop before the pitch even starts.
  - Have a tab open with hardcoded/mocked JSON fallback responses serving directly from a dummy endpoint if you have time to set it up.
  - *What to say:* "We actually hit our free-tier rate limit because so many people are testing our live link right now, which is a great problem to have! Let me show you a quick recording of the live processing."
  - Play the video, narrate over it live as if you were doing it.

**General Rule of Thumb:** 
Acknowledge the glitch in 1 sentence, frame it as a known challenge that real systems face, and move to the backup. Judges care enormously about how founders handle pressure and recover from live failures.
