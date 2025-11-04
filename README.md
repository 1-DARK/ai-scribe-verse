# 🤖 AI Scribe Verse (AutoInsight)

> **A world where AI helps you write, create, and craft intelligent conversations**

AI Scribe Verse is a next-generation AI-powered chat platform that enables seamless interactions with dual AI models. Experience intelligent conversations with sentiment analysis, real-time chat history, and a beautiful, modern interface.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)

---

## 🚀 Project Overview

AI Scribe Verse (AutoInsight) is an intuitive, full-stack application designed to empower users with AI-driven conversations. The platform features dual AI models with different sentiment analysis approaches, providing users with flexible, context-aware interactions.

### ✨ What Makes It Special?

- **Dual AI Models**: Choose between "Non-Num" (standard sentiment analysis) and "Num" (custom phrase-enhanced sentiment analysis)
- **Real-time Chat**: Instant message synchronization with persistent chat history
- **Sentiment Analysis**: Understand the emotional tone of conversations with ML-powered insights
- **Modern UI/UX**: Built with shadcn/ui components for a polished, professional experience
- **Secure Authentication**: User authentication and session management via Supabase

---

## 🧩 Key Features

### 💬 AI-Powered Conversations
- **Dual Model Support**: Switch between two distinct AI sentiment analysis models
  - **Non-Num Model**: Standard TextBlob-based sentiment analysis
  - **Num Model**: Enhanced with custom phrase recognition for nuanced understanding
- **Real-time Response**: Fast, responsive AI interactions
- **Sentiment Scoring**: Get detailed sentiment scores (Positive, Negative, Neutral)

### 📝 Chat Management
- **Persistent Chat History**: All conversations saved to Supabase
- **Multiple Conversations**: Create and manage multiple chat sessions
- **Organized Sidebar**: Easy navigation between different chats
- **Message Timestamps**: Track conversation flow over time

### 🎨 User Experience
- **Beautiful Landing Page**: Engaging introduction to platform features
- **Dark Mode Theme**: Modern, eye-friendly interface
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Toast Notifications**: Real-time feedback for user actions
- **Loading States**: Smooth transitions and loading indicators

### 🔒 Authentication & Security
- **Supabase Auth**: Secure user authentication system
- **Protected Routes**: Authenticated access to chat features
- **Session Management**: Persistent login sessions
- **User-specific Data**: Each user's chats are private and isolated

---

## 🏗️ Tech Stack

### Frontend
- **React 18.3** - Modern UI library with hooks
- **TypeScript 5.8** - Type-safe development
- **Vite 7.1** - Lightning-fast build tool
- **React Router v6** - Client-side routing
- **TanStack Query** - Powerful data fetching and caching
- **Zustand** - Lightweight state management

### UI & Styling
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible component library
- **Radix UI** - Unstyled, accessible UI primitives
- **Lucide React** - Elegant icon set
- **next-themes** - Dark mode support

### Backend & Database
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Real-time subscriptions
  - User authentication
  - Row-level security

### AI/ML Backend
- **FastAPI** - Modern Python web framework
- **TextBlob** - Natural language processing
- **Python 3.x** - ML model implementation
- **CORS Middleware** - Cross-origin request handling

### Development Tools
- **ESLint** - Code linting
- **PostCSS & Autoprefixer** - CSS processing
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **date-fns** - Date manipulation

---

## 📦 Installation

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **bun** package manager
- **Python 3.x** (for ML backend)
- **Supabase Account** (for backend services)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/AI_Scribe_Verse.git
cd AI_Scribe_Verse
```

### 2. Install Frontend Dependencies
```bash
# Using npm
npm install

# Or using bun (faster)
bun install
```

### 3. Install Python Dependencies
```bash
pip install fastapi uvicorn textblob python-multipart
```

### 4. Environment Setup
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
VITE_SUPABASE_URL=https://your-project.supabase.co
```

### 5. Supabase Setup
1. Create a new Supabase project
2. Run the migrations in `supabase/migrations/`
3. Set up your database tables for chats and messages
4. Copy your project credentials to `.env`

---

## 🚀 Running the Application

### Start the Frontend (Development)
```bash
# Using npm
npm run dev

# Using bun
bun run dev
```
The app will be available at `http://localhost:5173`

### Start the ML Backend
```bash
uvicorn ml_model:app --reload --port 8000
```
The API will be available at `http://localhost:8000`

### Build for Production
```bash
npm run build
# or
bun run build
```

### Preview Production Build
```bash
npm run preview
# or
bun run preview
```

---

## 📁 Project Structure

```
AI_Scribe_Verse/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui components
│   │   └── chat/           # Chat-specific components
│   ├── pages/              # Route pages
│   │   ├── Landing.tsx     # Landing page
│   │   ├── Auth.tsx        # Authentication page
│   │   ├── Chat.tsx        # Main chat interface
│   │   └── NotFound.tsx    # 404 page
│   ├── hooks/              # Custom React hooks
│   ├── store/              # Zustand state management
│   ├── integrations/       # Third-party integrations (Supabase)
│   ├── lib/                # Utility functions
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Application entry point
├── supabase/
│   ├── migrations/         # Database migrations
│   └── config.toml         # Supabase configuration
├── public/                 # Static assets
├── ml_model.py             # FastAPI ML backend
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── vite.config.ts          # Vite configuration
└── README.md               # This file
```

---

## 🤖 AI Models

### Non-Num Model (`/predict`)
Standard sentiment analysis using TextBlob:
- **Positive**: Sentiment score > 0.1
- **Negative**: Sentiment score < -0.1
- **Neutral**: Sentiment score between -0.1 and 0.1

### Num Model (`/predictes`)
Enhanced sentiment analysis with custom phrase recognition:
- Recognizes specific phrases: "love you", "hate you", "amazing", "terrible", etc.
- Provides more nuanced sentiment scores
- Falls back to TextBlob for unrecognized phrases

**Example Usage:**
```typescript
const response = await fetch('http://localhost:8000/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: 'I love this!' })
});
// Returns: { sentiment: "Positive", score: 0.5 }
```

---

## 🎯 Usage

1. **Sign Up / Sign In**: Create an account or log in via the Auth page
2. **Create a Chat**: Start a new conversation from the chat interface
3. **Select AI Model**: Choose between Non-Num or Num model
4. **Send Messages**: Type your message and get AI-powered sentiment analysis
5. **View History**: Access all your previous conversations from the sidebar
6. **Switch Chats**: Navigate between multiple conversations easily

---

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## 🔧 Configuration

### Tailwind CSS
Customize theme in `tailwind.config.ts`

### TypeScript
Compiler options in `tsconfig.json`, `tsconfig.app.json`, and `tsconfig.node.json`

### Vite
Build and dev server settings in `vite.config.ts`

### ESLint
Linting rules in `eslint.config.js`

---

## 🚦 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID | Yes |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable API key | Yes |
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Harshvardhan Chauhan**

---

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Supabase](https://supabase.com/) for the backend infrastructure
- [FastAPI](https://fastapi.tiangolo.com/) for the ML API framework
- [TextBlob](https://textblob.readthedocs.io/) for sentiment analysis
- [Vite](https://vitejs.dev/) for the blazing-fast build tool

---

## 📞 Support

If you have any questions or run into issues, please open an issue on GitHub.

---

**Made with ❤️ and AI**

