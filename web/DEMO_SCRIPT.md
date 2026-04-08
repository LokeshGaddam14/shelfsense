# ShelfSense - Hackathon Demo Script (5 Min)

**Goal:** Show the judges how ShelfSense provides seamless Retail Intelligence through AI automation, covering both the Manager view and the Worker mobile view.

## 🕒 Step 1: Introduction & Login (1 Min)
**Action:** Explain the two personas (Manager overseeing all stores, Worker managing one store).
- Open the web application login page.
- Explain that we use role-based access to keep data secure and relevant.

**Login Credentials:**
*   **Manager (Ravi Sharma - All Stores)**
    *   Email: `manager@shelfsense.com`
    *   Password: `manager123`
*   **Worker 1 (Anita Singh - Store 1: Dharampeth)**
    *   Email: `worker1@shelfsense.com`
    *   Password: `worker123`
*   **Worker 2 (Suresh Patil - Store 2: Sitabuldi)**
    *   Email: `worker2@shelfsense.com`
    *   Password: `worker123`
*   **Worker 3 (Meena Joshi - Store 3: Ramdaspeth)**
    *   Email: `worker3@shelfsense.com`
    *   Password: `worker123`

*Tip: Use the "Quick Demo Login" buttons on the login page for faster transitions!*

## 🕒 Step 2: Manager Dashboard & Analytics (1 Min)
**Action:** Log in as **Manager**.
- **Highlight:** The Overview Dashboard. Show how the manager sees aggregate data (total revenue, critical low stock items across *all* stores).
- **Highlight:** Navigate to **Revenue** and **Inventory** tabs. Emphasize the clean charts (Recharts) and real-time inventory updates.

## 🕒 Step 3: Worker Mobile Experience (1 Min)
**Action:** Switch to the Mobile App Simulator (or log in as **Worker 1** on a narrower browser window).
- **Highlight:** The worker only sees data for **Store 1**. (Show the Inventory page and note that only Store 1 items are listed).
- **Highlight:** Explain how this focuses the worker on their specific store operations without overwhelming them.

## 🕒 Step 4: AI Voice Assistant (End-to-End Demo) (1.5 Min)
**Action:** Open the **ShelfSense AI Chat** (on Web or Mobile).
- **Feature:** Emphasize that it's voice-enabled for hands-free queries on the warehouse floor!
- **Demonstrate Voice Queries** (Use the Mic button and verify Audio transcription and TTS Response):
  1. *“Show me low stock items”* (AI will fetch and verify inventory).
  2. *“Which store performed best this month?”* (AI analyzes sales across branches).
  3. *“Generate my reorder list”* (AI compiles what needs immediate restocking).
- *Fallback: If noise level is too high, mention the environment and fallback to typing or using the quick-chips!*

## 🕒 Step 5: Architecture & Limitations (0.5 Min)
**Action:** Briefly show the stack and mention future improvements.
- **Highlight:** Next.js Serverless architecture, Prisma ORM, and Gemini API for natural language to SQL/Insights logic.

### ⚠️ Known Limitations to Mention Proactively
- **Voice Recognition in Noisy Environments:** The Web Speech API might struggle in a crowded hackathon hall. (If it fails, smoothly transition to text input).
- **Data Freshness:** The analytics dashboard currently uses seeded data for the demo, though it is engineered to be fully real-time.
- **Text-to-Speech Language:** Sometimes the TTS might pronounce Hinglish/Hindi names with an English accent.

---

## 🔄 How to Reset Demo Data (Between Judge Rounds)
To ensure every judge sees exactly the same low-stock items and fresh numbers:
1. **Via Browser:** Go to `[YOUR_APP_URL]/api/seed`. Wait for the JSON success response.
2. **Via Terminal:** Run `npx prisma db seed` or `npm test` or `tsx prisma/seed.ts` in the `web/` folder.
