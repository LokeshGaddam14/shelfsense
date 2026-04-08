# ShelfSense Proof-of-Work: Screenshot & Recording Guide

## Web Screenshots Needed:
* [ ] **1. Dashboard page** — Capture all analytics cards displaying real numbers.
* [ ] **2. AI Chat page** — Screenshot a real Gemini response answering an inventory-specific question.
* [ ] **3. Voice active state** — Ensure the mic button is visibly glowing/active with the speech transcript visible on screen.
* [ ] **4. Products page** — Capture the main product list with Add/Edit/Delete action buttons visible.
* [ ] **5. Products (Add Modal)** — Show the Add Product modal open with the fields actively filled in.
* [ ] **6. Products (Edit Modal)** — Show the Edit Product modal open with existing product data pre-filled.
* [ ] **7. Inventory page** — Capture an inline edit actively taking place (e.g., cursor inside an input field changing stock).
* [ ] **8. Role switch** — Create a side-by-side composite screenshot showing Manager view vs Worker view.
* [ ] **9. Network tab (Chat Request)** — Screenshot Chrome DevTools showing the POST request to `/api/ai/chat` with a 200 OK status.
* [ ] **10. Network tab (DB Response)** — Screenshot DevTools showing the actual database JSON array payload returned in a GET API response.

## Mobile Screenshots Needed:
* [ ] **1. Chat screen** — Capture a real AI response visible in the Expo mobile UI.
* [ ] **2. Voice recording active** — Capture the mic button in its pressed/recording active state.
* [ ] **3. Transcription result** — Screenshot the transcribed text appearing inside the chat input box.
* [ ] **4. Inventory screen** — Capture the mobile inventory list rendering live stock data.
* [ ] **5. Role-based screen difference** — Capture the mobile UI missing Manager-only buttons, proving restricted access.

## Screen Recording Needed:
* [ ] **1. Full voice assistant flow (Web)** — Record clicking the mic, speaking, the transcript appearing, the AI responding in text, and the computer reading the response aloud.
* [ ] **2. Full voice assistant flow (Mobile)** — Record pressing the mic, speaking, text appearing, AI response generation, and the TTS speech playing.
* [ ] **3. E2E Data Flow** — Record adding a new product, navigating to the inventory page to see it appear, and checking the analytics dashboard to see total product metrics accurately update.
* [ ] **4. Security/Roles** — Record a Manager successfully completing an action, followed by attempting the exact same action while logged in as a Worker to show the failure/blocking mechanism.
