# ShelfSense Architecture

This document outlines the high-level architecture for the ShelfSense Retail Intelligence Chatbot.

## Flow Diagram

```ascii
[ Mobile App (React Native/Expo) ]
               |
               | (HTTPS / REST)
               v
[ Next.js API Routes (/api/chat) ]
       /               \
      / (Zod Valid)     \ (SQL)
     v                   v
[ Gemini 1.5 Flash ]  [ Database (Prisma + SQLite) ]
```

## Production Scalability Plan

The current MVP uses basic configurations suitable for a high-speed hackathon demo. To scale ShelfSense for thousands of retail stores, several production upgrades would be necessary:

| Hackathon Demo | Production Grade | Reason |
|:---|:---|:---|
| **SQLite** | **PostgreSQL** | SQLite is file-based and locks on writes. PostgreSQL (e.g., Supabase/Neon) flawlessly handles concurrent POS (Point of Sale) ingestion and complex analytics joins for multiple `Store`s and `Product`s. |
| **In-Memory Rate Limit** | **Redis Cache** | In-memory limits won't share state if the server is horizontally scaled. Redis provides centralized, un-bypassable API rate limits preventing DDoS attacks. |
| **Simple API Keys** | **JWT / Auth0** | For the demo, `sessionId` simulates state. In production, secure retail data requires JWT authorization tracking explicit user/store hierarchy permissions. |
| **Node.js process** | **Kubernetes (K8s) Cluster** | Standard deployments will struggle under massive parallel AI streams. Containerization enables auto-scaling pods depending on traffic volume. |
