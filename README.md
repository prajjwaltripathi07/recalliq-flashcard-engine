# RecallIQ – AI-Powered Flashcard Engine

RecallIQ is an AI-powered flashcard engine that transforms educational PDFs into high-quality, practice-ready flashcards for active recall learning.

Built as a full-stack application for the **AI Builder Challenge**, RecallIQ helps users upload study material, generate structured flashcards using AI, and review them through a lightweight spaced repetition workflow.

---

## 🚀 Features

- 📄 Upload educational PDFs (notes, concept sheets, study guides)
- 🧠 Generate AI-powered flashcards from PDF content
- 🔍 Supports **text-based PDFs**
- 🖼️ Supports **scanned PDFs** using **OCR fallback**
- 📚 Organize flashcards into decks
- 🎯 Study cards in a focused review interface
- 🔄 Lightweight spaced repetition with **Hard / Medium / Easy**
- 📊 Dashboard with overview stats:
  - Total decks
  - Total cards
  - Due cards
  - Mastered cards
- 💾 Persistent storage using MongoDB
- 🔐 Secure backend-only AI API integration (no frontend key exposure)

---

## 🧩 Problem Statement

**Problem Chosen:** Flashcard Engine

Students often study passively from notes, PDFs, and concept sheets, which leads to weaker long-term retention.

RecallIQ solves this by converting static study material into **active recall flashcards** that can be reviewed over time using a simple spaced repetition workflow.

---

## 🏗️ Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Axios
- React Router DOM

### Backend
- Node.js
- Express.js
- Multer
- MongoDB + Mongoose

### AI / Document Processing
- Anthropic Claude API
- `pdf-parse` for text-based PDFs
- OCR fallback for scanned PDFs (via OCR API integration)

### Deployment
- Vercel (Frontend)
- Render (Backend)

---

## ✨ How It Works

1. User uploads a PDF and optionally enters a deck title
2. Backend extracts text from the PDF
   - If it is a normal text PDF → use standard PDF parsing
   - If it is a scanned / low-text PDF → automatically use OCR fallback
3. Extracted content is sent securely to the AI model
4. AI returns structured flashcards in JSON format
5. Flashcards are stored in MongoDB as a deck + cards
6. User studies cards and rates each as:
   - **Hard**
   - **Medium**
   - **Easy**
7. Backend schedules the next review date based on difficulty and streak

---

## 🧠 Spaced Repetition Logic

RecallIQ uses a lightweight spaced repetition workflow designed for simplicity and usability.

### Review Ratings
- **Hard** → card returns sooner
- **Medium** → moderate review interval
- **Easy** → longer interval, increases with retention streak

This keeps the learning loop intuitive while still reinforcing difficult material more frequently.

---

## 📂 Project Structure

```bash
recalliq-flashcard-engine/
│
├── client/                     # React frontend
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── ...
│
├── server/                     # Node + Express backend
│   ├── models/
│   │   ├── Deck.js
│   │   └── Card.js
│   ├── routes/
│   │   ├── deckRoutes.js
│   │   └── cardRoutes.js
│   ├── services/
│   │   ├── anthropicService.js
│   │   └── pdfService.js
│   ├── uploads/
│   ├── index.js
│   └── .env
│
└── README.md
