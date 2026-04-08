# ShelfSense Run of Show (30 Minutes)

## Min 0–2: Team Intro & The Problem
**Speaker:** "Hey everyone, we're team ShelfSense. Have you ever walked into a retail store looking for something, and the store associate has to pull out an ancient tablet or ring the back room to check inventory? It's chaos. Store managers are dealing with 10 different spreadsheets to figure out what's selling, what's out of stock, and where the anomalies are. We built ShelfSense to stop that. It's an intelligent AI companion that turns complex retail data into simple, actionable conversations."

## Min 2–5: Architecture Walkthrough
**Speaker:** *(Pointing at Slide 2)* "Here's what is happening under the hood. Our managers are mostly on their feet, so we built a mobile app that talks directly to our Next.js backend. The magic happens right here in the middle: when a user asks a question, we don't just let the AI guess—we use Gemini 1.5 Flash to map their intent, query our database securely, and synthesize the live result. It is blazing fast and grounded in absolute truth."

## Min 5–20: Live Demo Flow (Web & Mobile)
1. **Web Dashboard (5 mins):** 
   - *Action:* Open the web dashboard.
   - *Speaker:* "This is the manager's morning view. Clean, instant visibility."
   - *Action:* Type a query into the web interface: *"Show me the top selling electronics from yesterday."*
   - *Action:* Point out the speed as the chatbot streams the exact database result.
2. **Mobile App (10 mins):**
   - *Action:* Switch screen mirroring to phone.
   - *Speaker:* "But managers aren't at desks. They are on the floor."
   - *Action:* Type: *"Do we have any smartwatches left in the backroom?"* 
   - *Action:* Show the response. 
   - *Action:* Type a complex analytical query: *"Why did sales drop in the apparel section this week?"* to show the agent reasoning over real data.

## Min 20–25: Voice Input Demo (The Differentiator)
- *Action:* Tap the voice input icon on the mobile app.
- *Speaker:* "Typing is slow. Voice is fast. Let's ask it naturally in Hinglish."
- *Action (Say aloud):* "Weekend pe kitne laptops bik gaye? Find the exact number."
- *Speaker:* "Because we use advanced intent mapping, the system handles the colloquial context, structures the SQL query, and gives us the exact count instantly. Real people talk like this."

## Min 25–30: Q&A Prep (Top 5 Questions & Quick Answers)
1. **Judge:** "How does this scale to 1,000 stores?"
   **Answer:** "We'll swap SQLite for PostgreSQL and deploy stateless Next.js instances on Kubernetes so it auto-scales seamlessly based on traffic."
2. **Judge:** "Is the AI hallucinating inventory numbers?"
   **Answer:** "No, we strictly use Gemini for natural language understanding and structuring SQL parameters; the numbers come directly from hard database records."
3. **Judge:** "What if an employee asks for the manager's payroll data?"
   **Answer:** "We implemented strict schema scoping; the AI only has access to the inventory and sales queries, making arbitrary data breaches impossible by design."
4. **Judge:** "How do you handle API costs when hitting Gemini?"
   **Answer:** "We use the ultra-fast, affordable Flash tier and employ caching for repeated queries to keep token usage strictly minimized."
5. **Judge:** "What happens if there's no internet in the back room?"
   **Answer:** "The app has a offline cache capability for previous responses, and for production, we map edge synchronization so they can still browse foundational local stock."
