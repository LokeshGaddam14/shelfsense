# DEVLOG - ShelfSense QA Audit & Stabilization

This log documents the end-to-end stabilization and feature completion of the ShelfSense retail intelligence platform leading up to the Hackathon submission. The system is now fully featured, seeded with realistic data, and secure.

## Final QA Summary

### 1. What was the exact root cause of the "Cannot find the middleware module" error during npm run build, and how did I fix it?
The root cause was an internal architectural change in Next.js 16.2.2 (Turbopack). The framework expected the traditional `middleware.ts` to export a default function matching its exact module resolution, but the old file structure conflicted with the new routing compiler. I fixed it by remaining compliant with Next.js 16.2.2 rules: I renamed `src/middleware.ts` to `src/proxy.ts` and updated the export to `export default function proxy`, correctly intercepting requests without triggering the module compiler bug.

### 2. Why did the AI Chat return HTTP 500 originally, and what fallback mechanism did I implement to fix it for demos?
The AI Chat was returning an HTTP 500 error because the `GEMINI_API_KEY` was missing from `.env.local`. When the system instantiated the `@google/generative-ai` SDK with an undefined key, it immediately crashed the route. To fix this for demos, I implemented a Graceful Fallback Mechanism: If the key equals `dummy_gemini_key` (or is missing), the API intercepts the request, runs the actual localized Prisma database query to retrieve real business context, and streams that raw JSON context string directly to the chat interface. This ensures judges can evaluate the exact DB parameters without needing a paid API key.

### 3. Does the system use cookie-based, local storage, or JWT for Next.js session parsing?
The system utilizes purely **cookie-based** session parsing. The Next.js API routes and server components inspect `req.headers.get('cookie')` (and `headers()` on RSCs) utilizing the `parseSession` helper. This is significantly more secure against XSS attacks compared to `localStorage` because the credentials remain entirely HTTP-transmitted.

### 4. Why does `localhost` break React Native networking, and what did I have to change for the mobile app?
`localhost` refers to the loopback interface natively mapping to the device executing the code. When a React Native app runs on an Android Simulator or physical device, `localhost` points to the *phone's internal loopback*, not the host machine running the Next.js server! I updated the `DEFAULT_BASE_URL` in `mobile/src/config.ts` from `http://localhost:3000` to `http://10.0.2.2:3000`, which is the Magic IP bridging the Android Simulator directly to the host machine's `localhost` ports.

### 5. How many products are seeded in the DB, and how many are set as 'dead stock'?
Exactly **40** distinct products are seeded across 5 specific retail categories (Electronics, Grocery, Clothing, Personal Care, and Stationery). From these, exactly **8** products were programmatically forced into 'dead stock' (having massive stagnant inventory and zero sales recorded in the entire 90-day mock generation matrix).

### 6. Why did I change the rate limit to 20 requests per minute?
I changed the rate limit from its initial 10 requests to 20 requests per minute via the in-memory Maps structure on the `src/app/api/chat/route.ts` API endpoint. During a fast-paced Hackathon demo presentation, users or judges tend to rapid-fire button clicks (like the 6 Quick Action intent chips) to test responsiveness. 10 requests would throttle judges prematurely, degrading the user experience during a high-stakes 3-minute pitch, whereas 20 retains basic anti-spam security while keeping the demo perfectly fluid.
