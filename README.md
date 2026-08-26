# SanchitX

> Think. Generate. Innovate.

## Overview
**SanchitX** is an AI-powered conversational platform engineered for fast, intelligent, and seamless interaction. Built using modern web technologies, SanchitX delivers real-time AI capabilities, full thread management, user authentication, and responsive cross-device performance.

## Features
- **User Authentication**: Secure user registration, login, session persistence, and instant demo access.
- **AI Model Switcher**: Dynamic selection across multiple Groq-supported LLM models (e.g., `openai/gpt-oss-120b`, `llama-3.3-70b-versatile`).
- **Thread Management**: Create new chats, rename existing conversations, delete threads, and view organized history grouped by time (Today, Yesterday, Previous 7 Days, Older).
- **Responsive UI**: Sleek dark-mode interface with collapsible sidebar and mobile-friendly drawer navigation.
- **Resilient Fallback Mode**: Automatic in-memory fallback for authentication and chat storage when a database is offline or not configured.

## Tech Stack
- **Frontend**: React 19, Vite, Vanilla CSS, FontAwesome icons, `react-markdown` with `rehype-highlight` syntax highlighting.
- **Backend**: Node.js, Express 5, JWT authentication, `bcryptjs`.
- **Database**: MongoDB (via Mongoose) with fallback in-memory state management.
- **AI Engine**: Groq API (`openai` SDK integration).

## Architecture
SanchitX follows a modular client-server architecture:
```
[ Frontend (React + Vite) ]
          │  REST API Calls (JSON + Bearer JWT)
          ▼
[ Backend (Express 5 Server) ] ────► [ Groq AI API Engine ]
          │
          ▼
[ MongoDB Database / In-Memory Fallback ]
```

## Authentication
Authentication in SanchitX is powered by JSON Web Tokens (JWT) and `bcryptjs` password hashing.
- **Sign Up / Sign In**: Creates and verifies secure user accounts.
- **Session Verification**: The `/api/auth/me` endpoint restores active sessions on application load.
- **Demo Mode**: One-click demo access with pre-configured credentials.
- **Database Support**: Integrates with MongoDB, with optional environment configuration support for Supabase services if configured.

## Chat Management
- **Persistent Threads**: Each chat thread has a unique identifier and records message pairs (`user` and `assistant`).
- **Sidebar Organization**: Categorizes conversations chronologically (Today, Yesterday, 7 Days, Older).
- **Thread Control**: Inline modal controls allow instant thread renaming and deletion.

## AI Integration
SanchitX integrates with the **Groq API** using the standard OpenAI client SDK:
- **Fast Responses**: Low-latency inference across selected LLM models.
- **Dynamic Model Fetching**: The backend endpoint `/api/models` queries available Groq AI models.
- **Markdown & Code Highlighting**: Responses render rich markdown formatting with syntax highlighting.

## Security
- **JWT Authorization**: Secured endpoints require `Bearer` token validation.
- **Password Security**: Passwords hashed using `bcryptjs` before database storage.
- **CORS Control**: Dynamic CORS filtering allowing configured origins (`FRONTEND_URL`) and development environments.
- **Secret Protection**: API keys and database credentials strictly isolated via server-side environment variables.

## Local Development

### Prerequisites
- Node.js (v18+)
- npm

### 1. Backend Setup
```bash
cd Backend
npm install
npm run dev
```

### 2. Frontend Setup
```bash
cd Frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Environment Variables

### Backend (`Backend/.env`)
```env
PORT=8080
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/sanchitx
JWT_SECRET=your_jwt_secret_key_here
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b
```

### Frontend (`Frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:8080
```

## Project Structure
```
sanchitX/
├── Backend/
│   ├── middleware/        # Authentication middleware
│   ├── models/            # Mongoose schemas (User, Thread)
│   ├── routes/            # Express route handlers (auth, chat)
│   ├── server.js          # Main Express server entrypoint
│   └── package.json
├── Frontend/
│   ├── src/
│   │   ├── assets/        # SanchitX branding & SVG icons
│   │   ├── App.jsx        # Root application component
│   │   ├── Auth.jsx       # Authentication modal & forms
│   │   ├── ChatWindow.jsx # Main chat view & model selector
│   │   ├── Sidebar.jsx    # Conversation history & thread management
│   │   └── config.js      # Dynamic API base URL configuration
│   └── package.json
└── README.md
```

## Deployment
SanchitX is configured for deployment on platforms like Render, Vercel, or Railway.
- **Backend Service**: Deploy the `Backend` directory as a Node.js Web Service. Set environment variables (`GROQ_API_KEY`, `JWT_SECRET`, `MONGODB_URI`).
- **Frontend Service**: Deploy the `Frontend` directory as a Static Site or Web Service. Set `VITE_API_BASE_URL` to your backend service URL.

## Future Improvements
- **Streaming Responses**: Real-time token streaming for AI replies.
- **File Uploads**: Document and image analysis support.
- **Theme Customization**: Additional accent themes and custom color palettes.

## Author
**Sanchit Kaushik**
- GitHub: [https://github.com/sanchitkaushik1307](https://github.com/sanchitkaushik1307)
