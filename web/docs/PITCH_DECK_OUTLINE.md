# ShelfSense Demo Day Pitch

## Slide 1: Introduction
- **Team Name:** ShelfSense
- **Problem Statement:** Store managers are flying blind, drowning in complex spreadsheets instead of acting on real-time data. ShelfSense is the intelligent chatbot that puts actionable retail data at their fingertips.

## Slide 2: Architecture
*(Use the diagram below)*
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

## Slide 3: Demo
- **LIVE DEMO HERE**

## Slide 4: Production Scale
- **Performance:** 
  - Sub-second API response times through optimized edge routing.
  - Streaming LLM outputs so the user never waits for a full block of text.
  - Caching frequent queries (like "top-selling products today") to bypass redundant AI processing.
- **Scalability:** 
  - Shifting from local SQLite to horizontal PostgreSQL for heavy read/writes.
  - Architected into stateless microservices ready to scale out on Kubernetes.
  - Connection pooling to handle peak hour requests from thousands of retail locations concurrently.
- **Security:** 
  - JWT-based authentication ensuring strict data compartmentalization (managers only see their store's data).
  - Implementation of proxy rate-limiting via Redis to stop DDoS or API abuse.
  - Prompt boundary enforcement and strict schema scoping so AI only has read-access to the DB, preventing prompt-injection attacks from mutating records.
