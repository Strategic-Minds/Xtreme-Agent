# Manus Assistant Clone — Full-Stack AI Assistant

A complete, production-ready implementation of an autonomous AI assistant with a React frontend, Node.js backend, and integrations with OpenAI, Supabase, Google Drive, and Vercel.

## 🎯 What's Included

- **Frontend:** React 18 + TypeScript + Vite + TailwindCSS with chat UI, task dashboard, file manager, and settings
- **Backend:** Node.js + Express with OpenAI integration, agent loop, Supabase auth, Google Drive sync, and file upload
- **Database:** Supabase (PostgreSQL) with Row Level Security (RLS) policies and real-time subscriptions
- **Auth:** Supabase Auth (email/password + OAuth2 providers)
- **File Storage:** Supabase Storage for user uploads and generated outputs
- **Hosting:** Vercel for frontend and serverless backend
- **CI/CD:** GitHub Actions for automated testing and deployment

## 📋 Prerequisites

- **Node.js 20+** and **pnpm 9+** (or npm/yarn)
- **Git** for version control
- **Supabase account** (free tier available at supabase.com)
- **Vercel account** (free tier available at vercel.com)
- **OpenAI API key** (from platform.openai.com)
- **Google Cloud project** with Drive API enabled (for Google Drive integration)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/YOUR_USERNAME/manus-assistant-clone.git
cd manus-assistant-clone
pnpm install
```

### 2. Set Up Environment Variables

Copy the example files and fill in your credentials:

```bash
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env.local
```

See `ENVIRONMENT_VARIABLES.md` for the complete list and where to get each value.

### 3. Set Up Supabase

1. Create a new Supabase project at supabase.com
2. Run the SQL schema from `docs/supabase-schema.sql` in the SQL Editor
3. Enable Row Level Security on all tables (see `docs/rls-policies.sql`)
4. Create storage buckets: `user-files` (private) and `public-assets` (public)
5. Add your Supabase URL and keys to `.env.local` files

### 4. Run Locally

```bash
# Terminal 1: Backend (runs on http://localhost:3001)
cd backend && pnpm dev

# Terminal 2: Frontend (runs on http://localhost:5173)
cd frontend && pnpm dev
```

Visit http://localhost:5173 and sign up for an account.

### 5. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Then redeploy
vercel --prod
```

## 📁 Project Structure

```
manus-assistant-clone/
├── frontend/                      # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   ├── pages/                # Route-level pages
│   │   ├── hooks/                # Custom React hooks
│   │   ├── lib/                  # API client, Supabase init
│   │   ├── stores/               # Zustand state management
│   │   ├── types/                # TypeScript definitions
│   │   └── App.tsx               # Root component
│   ├── public/                   # Static assets
│   ├── .env.example              # Environment variables template
│   ├── vite.config.ts            # Vite build config
│   ├── tailwind.config.ts        # TailwindCSS theme
│   └── package.json              # Frontend dependencies
│
├── backend/                       # Node.js + Express
│   ├── src/
│   │   ├── routes/               # API route handlers
│   │   ├── middleware/           # Auth, logging, error handling
│   │   ├── services/             # Business logic (AI, Drive, etc.)
│   │   ├── tools/                # Agent tool implementations
│   │   ├── utils/                # Helper functions
│   │   └── index.ts              # Server entry point
│   ├── .env.example              # Environment variables template
│   ├── package.json              # Backend dependencies
│   └── tsconfig.json             # TypeScript config
│
├── .github/
│   └── workflows/
│       ├── deploy.yml            # CI/CD for deployment
│       └── test.yml              # CI/CD for testing
│
├── docs/
│   ├── ARCHITECTURE.md           # System architecture overview
│   ├── API.md                    # API endpoint reference
│   ├── supabase-schema.sql       # Database schema
│   ├── rls-policies.sql          # Row Level Security policies
│   └── ENVIRONMENT_VARIABLES.md  # Env var reference
│
├── vercel.json                   # Vercel deployment config
├── .gitignore                    # Git ignore rules
├── package.json                  # Root workspace config
└── README.md                     # This file
```

## 🔧 Key Features

### Frontend
- **Chat Interface:** Real-time messaging with Markdown rendering and code highlighting
- **Task Dashboard:** Monitor autonomous AI tasks with status, phases, and results
- **File Manager:** Upload files for AI processing, download generated outputs
- **Settings Page:** Manage profile, API integrations, and Google Drive connection
- **Auth:** Supabase Auth with email/password and OAuth2 providers
- **State Management:** Zustand stores for auth, chat, tasks, and UI state
- **Responsive Design:** Mobile-friendly UI with TailwindCSS

### Backend
- **Agent Loop:** Plan → Act → Observe → Iterate workflow for autonomous tasks
- **Tool System:** Extensible tool framework (web search, code execution, file ops, browser control, image generation)
- **OpenAI Integration:** Streaming chat completions with GPT-4o
- **API Routes:** 22 endpoints for chat, tasks, files, auth, and Drive integration
- **Auth Middleware:** JWT verification via Supabase
- **Rate Limiting:** Prevent abuse and control costs
- **Error Handling:** Structured error responses with proper HTTP codes
- **Logging:** Request/response logging for debugging

### Database
- **Supabase PostgreSQL:** Fully managed database with real-time subscriptions
- **Row Level Security:** Fine-grained access control per user
- **Tables:** users, sessions, messages, tasks, files, tool_logs
- **Indexes:** Optimized for common queries

### Integrations
- **OpenAI:** GPT-4o for chat and reasoning
- **Google Drive:** OAuth2 and file sync
- **Supabase Auth:** Email/password, Google, GitHub OAuth
- **Supabase Storage:** File upload and download

## 📚 Documentation

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** — System design and data flow
- **[API.md](docs/API.md)** — Complete API endpoint reference
- **[ENVIRONMENT_VARIABLES.md](docs/ENVIRONMENT_VARIABLES.md)** — All env vars and where to get them
- **[supabase-schema.sql](docs/supabase-schema.sql)** — Database schema to run in Supabase
- **[rls-policies.sql](docs/rls-policies.sql)** — Row Level Security policies

## 🚢 Deployment

### Vercel (Frontend + Serverless Backend)

1. Push to GitHub
2. Create Vercel project and connect GitHub repo
3. Set root directory to `frontend/`
4. Add all environment variables from `.env.local`
5. Deploy

For backend API routes, either:
- Deploy backend as separate Vercel project with root directory `backend/`
- Or use Next.js API routes (convert Express routes to `/pages/api/`)

### Supabase (Database + Auth + Storage)

1. Create project at supabase.com
2. Run schema SQL in SQL Editor
3. Enable RLS on all tables
4. Create storage buckets
5. Add URL and keys to Vercel environment variables

### GitHub Actions (CI/CD)

Workflows in `.github/workflows/` automatically:
- Lint and test on every PR
- Deploy to Vercel on push to `main` branch
- Run database migrations

## 🛠️ Development

### Local Development

```bash
# Install dependencies
pnpm install

# Run both frontend and backend
pnpm dev

# Run only frontend
cd frontend && pnpm dev

# Run only backend
cd backend && pnpm dev

# Type check
pnpm type-check

# Lint
pnpm lint

# Format code
pnpm format
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test -- --watch
```

### Building for Production

```bash
# Build both frontend and backend
pnpm build

# Build only frontend
cd frontend && pnpm build

# Build only backend
cd backend && pnpm build
```

## 🔐 Security

- **Never commit `.env` files** — use `.env.example` as template
- **Keep API keys secret** — use Vercel environment variables for production
- **Enable RLS on Supabase** — all tables have row-level security policies
- **CORS configured** — only allow your domain
- **Rate limiting enabled** — prevent API abuse
- **JWT validation** — all protected routes verify tokens

## 📖 API Overview

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/auth/signup` | None | Register new user |
| POST | `/api/auth/login` | None | Login and get JWT |
| POST | `/api/chat` | JWT | Send message to AI |
| POST | `/api/task` | JWT | Create autonomous task |
| GET | `/api/task/:id` | JWT | Get task status |
| POST | `/api/files/upload` | JWT | Upload file |
| GET | `/api/files` | JWT | List files |
| POST | `/api/drive/sync` | JWT | Sync with Google Drive |
| GET | `/api/health` | None | Health check |

See [API.md](docs/API.md) for complete endpoint documentation.

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -m "Add feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

## 📝 License

MIT License — see LICENSE file for details.

## 🆘 Troubleshooting

### "Cannot find module" errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Supabase connection fails
- Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly
- Verify Supabase project is running
- Check network connectivity

### OpenAI API errors
- Verify `OPENAI_API_KEY` is valid and has available credits
- Check rate limits (60 requests/min for free tier)
- Ensure model name is correct (default: `gpt-4o`)

### Vercel deployment fails
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Ensure `package.json` build scripts are correct

## 📞 Support

For issues, questions, or feature requests, open an issue on GitHub or check the documentation.

---

**Happy coding! 🚀**
