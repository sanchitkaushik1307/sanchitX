# SanchitX

> **Think. Generate. Innovate.**

[![CI](https://github.com/sanchitkaushik1307/sanchitX/actions/workflows/ci.yml/badge.svg)](https://github.com/sanchitkaushik1307/sanchitX/actions/workflows/ci.yml)

SanchitX is a full-stack AI chatbot application designed to provide a modern conversational AI experience with persistent conversations, secure authentication, chat management, and AI-powered responses using the Groq API.

## 🚀 Live Demo

**[SanchitX — Live Demo](https://sanchitx.onrender.com)**
## ✨ Features

* 🤖 AI-powered conversational chat using Groq
* 🔐 User authentication and authorization
* 👤 Secure user sessions
* 💬 Persistent conversation history
* ➕ Create new conversations
* 🔄 Switch between previous chats
* ✏️ Rename conversations
* 🗑️ Delete conversations
* 📱 Responsive and modern UI
* 🌙 Dark-themed interface
* ⚡ Fast AI responses
* 🔒 User-specific chat data
* 🧠 Configurable AI model
* 🚪 Secure logout
* 🎨 Custom SanchitX branding

## 🛠️ Tech Stack

### Frontend

* HTML / CSS / JavaScript
* Modern responsive UI
* Component-based architecture where applicable

### Backend

* Node.js
* Express.js
* REST API

### AI

* Groq API
* OpenAI-compatible API interface
* Llama-based AI model

### Authentication & Database

* Supabase Authentication
* Supabase Database
* Row Level Security (RLS)

### Deployment

* Render
* GitHub

## 🏗️ Architecture

```text
                   ┌─────────────────────┐
                   │      SanchitX       │
                   │     Frontend UI     │
                   └──────────┬──────────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │    Node.js / API    │
                   │       Backend       │
                   └──────────┬──────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
       ┌─────────────────┐         ┌─────────────────┐
       │    Supabase     │         │      Groq       │
       │ Auth + Database │         │    AI Models    │
       └─────────────────┘         └─────────────────┘
```

## 💡 Core Functionality

### Authentication

Users can create accounts and securely sign in to SanchitX.

The authentication system provides:

* Account registration
* Login
* Logout
* Session persistence
* Protected application access
* User-specific data access

### Chat Management

Each user can maintain multiple conversations.

Users can:

* Create a new chat
* Switch between conversations
* Continue previous conversations
* Rename chats
* Delete chats

### AI Chat

Messages are sent from the frontend to the backend, which communicates with the Groq API.

```text
User Message
     ↓
SanchitX Frontend
     ↓
Backend API
     ↓
Groq API
     ↓
AI Model
     ↓
Backend
     ↓
SanchitX Frontend
```

Conversation messages are stored so users can return to previous conversations.

## 🔐 Security

SanchitX follows server-side API security practices.

* Groq API keys are stored as environment variables.
* Sensitive API keys are never exposed to the frontend.
* Supabase authentication manages user sessions.
* Row Level Security protects user-specific data.
* Users can only access their own conversations.
* Environment files are excluded from Git.

## ⚙️ Local Development

### 1. Clone the repository

```bash
git clone https://github.com/sanchitkaushik1307/sanchitX.git
cd sanchitX
```

### 2. Install dependencies

Install frontend dependencies:

```bash
npm install
```

If the project contains a separate backend:

```bash
cd backend
npm install
```

### 3. Configure environment variables

Create the appropriate `.env` files based on the project's `.env.example`.

Typical variables include:

```env
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=your_groq_model

SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

VITE_API_BASE_URL=http://localhost:YOUR_BACKEND_PORT
```

Never commit real API keys or passwords to GitHub.

### 4. Start the backend

```bash
npm run dev
```

or use the project's configured backend start command.

### 5. Start the frontend

```bash
npm run dev
```

Open the local development URL shown in the terminal.

## 🌐 Production Deployment

SanchitX is deployed using Render.

Production architecture:

```text
Frontend
https://sanchitx.onrender.com

        ↓

Backend
https://sanchitxbackend.onrender.com

        ↓

Supabase + Groq
```

Production environment variables must be configured directly in the hosting platform.

Do not commit production secrets to GitHub.

## 🔄 Continuous Integration (CI)

SanchitX uses **GitHub Actions** for automated Continuous Integration on every push and pull request targeting the `main` branch.

The CI pipeline runs automated checks across both frontend and backend:

* **Frontend CI**: Sets up Node.js with caching, installs dependencies using `npm ci`, and builds the React application (`npm run build`).
* **Backend CI**: Sets up Node.js with caching, installs dependencies using `npm ci`, runs the automated backend test suite (`npm test`), and validates backend syntax (`node --check server.js`).

## 🧪 Automated Testing

Automated backend tests verify authentication, session verification, user data isolation, conversation lifecycle, input validation, and AI utility resilience using **Jest** and **Supertest**.

### Run Backend Tests

```bash
cd Backend
npm test
```

### Generate Coverage Report

```bash
cd Backend
npm run test:coverage
```

## 📁 Project Structure

The exact structure may vary depending on the current implementation, but the project follows a structure similar to:

```text
sanchitX/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── server.js
│   └── package.json
│
├── .gitignore
├── .env.example
└── README.md
```

## 🔑 Environment Variables

| Variable            | Purpose                            |
| ------------------- | ---------------------------------- |
| `GROQ_API_KEY`      | Groq API authentication            |
| `GROQ_MODEL`        | AI model used by SanchitX          |
| `SUPABASE_URL`      | Supabase project URL               |
| `SUPABASE_ANON_KEY` | Supabase public authentication key |
| `VITE_API_BASE_URL` | Backend API URL for the frontend   |

Use only the variables required by your current project configuration.

## 📌 Important Notes

* Never commit `.env` files.
* Never expose `GROQ_API_KEY` in frontend code.
* Never expose `SUPABASE_SERVICE_ROLE_KEY` to the frontend.
* Configure production environment variables through Render.
* Make sure the production frontend URL is configured in Supabase authentication settings.
* Configure backend CORS to allow the production frontend URL.

## 🔮 Future Improvements

Potential future improvements include:

* Google authentication
* Streaming AI responses
* Voice input
* Voice output
* File uploads
* Image understanding
* AI-generated conversation titles
* Search across conversation history
* Model comparison
* Custom system prompts
* Conversation export
* User profile customization
* Usage analytics

## 👨‍💻 Author

**Sanchit Kaushik**

GitHub: **[sanchitkaushik1307](https://github.com/sanchitkaushik1307)**

## 📄 License

This project is intended for educational and portfolio purposes.

---

### SanchitX

**Think. Generate. Innovate.**
