# SkillMatch AI 🚀

> Revolutionizing hiring by replacing résumés with real-world challenges and AI-powered evaluation

![SkillMatch AI Banner](./docs/images/banner.png)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black)](https://nextjs.org/)
[![Angular](https://img.shields.io/badge/Angular-17+-red)](https://angular.io/)

## 📋 Table of Contents

-  [Overview](#overview)
-  [Key Features](#key-features)
-  [Tech Stack](#tech-stack)
-  [Architecture](#architecture)
-  [Getting Started](#getting-started)
-  [Project Structure](#project-structure)
-  [Development](#development)
-  [API Documentation](#api-documentation)
-  [Deployment](#deployment)
-  [Team](#team)
-  [License](#license)

---

## 🎯 Overview

**SkillMatch AI** is an innovative talent assessment and hiring platform that transforms how companies evaluate candidates. Instead of traditional résumé screening, companies post real-world challenges across any digital field (development, design, data science, marketing). Candidates submit solutions along with video explanations, and our AI evaluates both the technical quality and the candidate's understanding.

### The Problem We Solve

-  **For Companies:** Wasting time on unqualified applicants and making hiring decisions based on credentials rather than capability
-  **For Candidates:** Struggling to prove skills without experience, and facing bias in traditional hiring processes

### Our Solution

1. Companies post real-world tasks instead of job descriptions
2. Candidates solve challenges and record video explanations of their approach
3. AI analyzes both the solution quality AND video explanation to verify understanding
4. Top performers move to interviews, while all participants gain portfolio-worthy work

---

## ✨ Key Features

### 🤖 AI-Powered Dual Evaluation

-  **Solution Analysis:** Evaluates technical accuracy, efficiency, creativity, and code quality
-  **Video Analysis:** Assesses candidate's comprehension, problem-solving methodology, and communication skills
-  **Authenticity Verification:** Detects copied solutions by analyzing explanation depth

### 🎯 Smart Quests System

-  Companies post challenges across all digital domains
-  Real-world tasks instead of generic coding tests
-  Customizable difficulty levels and evaluation criteria
-  Automatic leaderboard generation

### 💼 Smart Portfolio

-  Auto-generates after each challenge completion
-  Showcases verified skills with AI assessments
-  Shareable as interactive CV or PDF
-  Serves as talent discovery tool for employers

### 🎓 AI Career Coach

-  Identifies skill gaps from performance
-  Recommends personalized learning paths
-  Tracks progress over time
-  Provides actionable improvement suggestions

### 📊 Company Dashboard

-  Post and manage challenges
-  Review submissions with AI insights
-  Compare candidates side-by-side
-  Track hiring pipeline from challenge to offer

### 👤 Candidate Dashboard

-  Browse and attempt challenges
-  Submit solutions with video explanations
-  View AI feedback and recommendations
-  Build and manage portfolio

---

## 🛠️ Tech Stack

### Frontend

**Public Site (Next.js)**

-  **Framework:** Next.js 14+ (App Router)
-  **Language:** TypeScript
-  **Styling:** Tailwind CSS
-  **UI Components:** Shadcn/ui
-  **State Management:** Zustand
-  **Form Handling:** React Hook Form
-  **Validation:** Zod

**Dashboards (Angular)**

-  **Framework:** Angular 17+
-  **Language:** TypeScript
-  **Styling:** Tailwind CSS
-  **State Management:** NgRx
-  **UI Components:** Angular Material
-  **Forms:** Reactive Forms

### Backend

-  **Runtime:** Node.js (v18+)
-  **Framework:** Express.js
-  **Language:** TypeScript
-  **Database:** MongoDB
-  **ODM:** Mongoose
-  **Authentication:** JWT (JSON Web Tokens)
-  **File Upload:** Multer
-  **Validation:** Joi

### AI & Processing

-  **AI Models:** OpenAI GPT-4 / Anthropic Claude
-  **Video Processing:** FFmpeg
-  **Video Transcription:** OpenAI Whisper API
-  **File Storage:** Cloudinary

### DevOps & Infrastructure

-  **Version Control:** Git & GitHub
-  **Frontend Hosting:** Vercel (Next.js), Netlify (Angular)
-  **Backend Hosting:** Render / Railway
-  **Database:** MongoDB Atlas (Free Tier)
-  **CI/CD:** GitHub Actions
-  **Monitoring:** Better Stack (optional)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                       │
├──────────────────────────────┬──────────────────────────────┤
│         Next.js              │          Angular              │
│    (Public Site)             │       (Dashboards)            │
│  - Landing Page              │  - Company Dashboard          │
│  - Challenge Listings        │  - Candidate Dashboard        │
│  - Public Portfolios         │  - Admin Dashboard            │
│  - Marketing Pages           │  - AI Career Coach            │
└──────────────┬───────────────┴────────────┬─────────────────┘
               │                            │
               │         REST API           │
               │    (JSON over HTTPS)       │
               │                            │
┌──────────────┴────────────────────────────┴─────────────────┐
│                      BACKEND LAYER                           │
│                   Node.js + Express.js                       │
├──────────────────────────────────────────────────────────────┤
│  Authentication  │  Challenge API  │  Submission API         │
│  User Management │  AI Service     │  Portfolio Generator    │
└──────┬──────────┴────────┬─────────┴─────────┬──────────────┘
       │                   │                   │
       │                   │                   │
┌──────┴─────┐   ┌─────────┴────────┐   ┌─────┴──────────┐
│  MongoDB   │   │   AI Services    │   │   Cloudinary   │
│   Atlas    │   │  (OpenAI/Claude) │   │ (File Storage) │
└────────────┘   └──────────────────┘   └────────────────┘
```

### Data Flow: Challenge Submission

```
1. Candidate submits solution + records video
                    ↓
2. Backend uploads video to Cloudinary
                    ↓
3. AI Service processes:
   - Analyzes solution code/files
   - Transcribes video explanation
   - Evaluates comprehension
                    ↓
4. Generates comprehensive feedback
                    ↓
5. Updates candidate portfolio automatically
                    ↓
6. Notifies company of new submission
```

---

## 🚀 Getting Started

### Prerequisites

```bash
# Required
- Node.js v18 or higher
- npm or yarn
- MongoDB (local or Atlas account)
- Git

# Optional
- Docker (for containerization)
```

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-org/skillmatch-ai.git
cd skillmatch-ai
```

2. **Install dependencies**

```bash
# Install backend dependencies
cd backend
npm install

# Install Next.js dependencies
cd ../frontend-nextjs
npm install

# Install Angular dependencies
cd ../frontend-angular
npm install
```

3. **Environment Setup**

Create `.env` files in each directory:

**Backend (`backend/.env`):**

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/skillmatch-ai
# Or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/skillmatch

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d

# AI Services
OPENAI_API_KEY=sk-your-openai-key
# Or
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# File Storage
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend URLs (CORS)
FRONTEND_URL=http://localhost:3000
DASHBOARD_URL=http://localhost:4200
```

**Next.js (`frontend-nextjs/.env.local`):**

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Angular (`frontend-angular/src/environments/environment.ts`):**

```typescript
export const environment = {
   production: false,
   apiUrl: "http://localhost:5000/api",
   websiteUrl: "http://localhost:3000",
};
```

4. **Database Setup**

```bash
# If using local MongoDB, start the server
mongod

# The application will automatically create collections on first run
```

5. **Run the application**

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start Next.js
cd frontend-nextjs
npm run dev

# Terminal 3: Start Angular
cd frontend-angular
npm start
```

6. **Access the application**

-  Next.js (Public Site): http://localhost:3000
-  Angular (Dashboards): http://localhost:4200
-  Backend API: http://localhost:5000
-  API Docs: http://localhost:5000/api-docs

---

## 📁 Project Structure

```
skillmatch-ai/
├── backend/                      # Node.js + Express API
│   ├── src/
│   │   ├── config/              # Configuration files
│   │   ├── controllers/         # Route controllers
│   │   ├── models/              # MongoDB models
│   │   ├── routes/              # API routes
│   │   ├── middleware/          # Custom middleware
│   │   ├── services/            # Business logic
│   │   │   ├── ai.service.js   # AI evaluation logic
│   │   │   ├── video.service.js # Video processing
│   │   │   └── portfolio.service.js
│   │   ├── utils/               # Helper functions
│   │   └── server.js            # Entry point
│   ├── tests/                   # API tests
│   ├── .env.example
│   └── package.json
│
├── frontend-nextjs/             # Next.js public site
│   ├── src/
│   │   ├── app/                 # App router pages
│   │   │   ├── (auth)/         # Auth pages
│   │   │   ├── challenges/     # Challenge pages
│   │   │   ├── portfolio/      # Portfolio pages
│   │   │   └── layout.tsx
│   │   ├── components/          # React components
│   │   │   ├── ui/             # shadcn components
│   │   │   ├── layout/         # Layout components
│   │   │   └── features/       # Feature components
│   │   ├── lib/                # Utilities
│   │   │   ├── api.ts          # API client
│   │   │   └── utils.ts
│   │   ├── hooks/              # Custom hooks
│   │   ├── types/              # TypeScript types
│   │   └── styles/             # Global styles
│   ├── public/                 # Static assets
│   └── package.json
│
├── frontend-angular/            # Angular dashboards
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/           # Core services, guards
│   │   │   ├── shared/         # Shared components, pipes
│   │   │   ├── features/       # Feature modules
│   │   │   │   ├── company/   # Company dashboard
│   │   │   │   ├── candidate/ # Candidate dashboard
│   │   │   │   └── admin/     # Admin dashboard
│   │   │   ├── models/        # TypeScript interfaces
│   │   │   └── app.routes.ts
│   │   ├── assets/            # Static assets
│   │   ├── environments/      # Environment configs
│   │   └── styles.scss        # Global styles
│   └── package.json
│
├── docs/                        # Documentation
│   ├── api/                    # API documentation
│   ├── architecture/           # Architecture diagrams
│   └── guides/                 # Development guides
│
├── .github/
│   └── workflows/              # CI/CD pipelines
│
├── README.md
└── LICENSE
```

---

## 💻 Development

### Available Scripts

**Backend:**

```bash
npm run dev          # Start development server with nodemon
npm start            # Start production server
npm test             # Run tests
npm run lint         # Lint code
npm run build        # Build TypeScript
```

**Next.js:**

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Lint code
npm run type-check   # TypeScript type checking
```

**Angular:**

```bash
npm start            # Start development server
npm run build        # Build for production
npm test             # Run unit tests
npm run e2e          # Run e2e tests
npm run lint         # Lint code
```

### Code Style & Conventions

**Git Commit Messages:**

```
feat(scope): add new feature
fix(scope): fix bug
docs(scope): update documentation
style(scope): format code
refactor(scope): refactor code
test(scope): add tests
chore(scope): update dependencies
```

**Branch Naming:**

```
feature/user-authentication
fix/login-validation-bug
hotfix/production-crash
docs/api-documentation
```

**Pull Request Process:**

1. Create feature branch from `develop`
2. Make changes and commit
3. Push and create PR to `develop`
4. Get at least 1 approval
5. Merge to `develop`
6. Deploy to staging for testing
7. Merge to `main` for production

### Database Models

**User Schema:**

```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  role: Enum ['candidate', 'company', 'admin'],
  profile: {
    name: String,
    avatar: String,
    bio: String,
    skills: [String],
    location: String,
    socialLinks: Object
  },
  createdAt: Date,
  updatedAt: Date
}
```

**Challenge Schema:**

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  companyId: ObjectId (ref: User),
  difficulty: Enum ['easy', 'medium', 'hard'],
  techStack: [String],
  requirements: [String],
  deadline: Date,
  prize: Number,
  maxSubmissions: Number,
  evaluationCriteria: Object,
  status: Enum ['draft', 'active', 'closed'],
  createdAt: Date,
  updatedAt: Date
}
```

**Submission Schema:**

```javascript
{
  _id: ObjectId,
  challengeId: ObjectId (ref: Challenge),
  candidateId: ObjectId (ref: User),
  files: [String], // Cloudinary URLs
  videoUrl: String,
  videoTranscript: String,
  explanation: String,
  aiEvaluation: {
    technicalScore: Number (0-100),
    comprehensionScore: Number (0-100),
    communicationScore: Number (0-100),
    overallScore: Number (0-100),
    strengths: [String],
    weaknesses: [String],
    feedback: String,
    evaluatedAt: Date
  },
  status: Enum ['pending', 'evaluating', 'evaluated', 'interview', 'rejected', 'hired'],
  submittedAt: Date,
  updatedAt: Date
}
```

---

## 📚 API Documentation

### Authentication

**POST /api/auth/register**

```javascript
// Request
{
  "email": "user@example.com",
  "password": "securePassword123",
  "role": "candidate", // or "company"
  "name": "John Doe"
}

// Response
{
  "success": true,
  "data": {
    "user": { /* user object */ },
    "token": "jwt-token"
  }
}
```

**POST /api/auth/login**

```javascript
// Request
{
  "email": "user@example.com",
  "password": "securePassword123"
}

// Response
{
  "success": true,
  "data": {
    "user": { /* user object */ },
    "token": "jwt-token"
  }
}
```

### Challenges

**GET /api/challenges**

-  Query params: `difficulty`, `techStack`, `status`, `page`, `limit`
-  Returns: Paginated list of challenges

**POST /api/challenges** (Company only)

-  Creates new challenge
-  Requires authentication

**GET /api/challenges/:id**

-  Returns challenge details
-  Public endpoint

**PUT /api/challenges/:id** (Company only)

-  Updates challenge
-  Requires authentication and ownership

### Submissions

**POST /api/submissions**

-  Submit solution to a challenge
-  Requires authentication (candidate)
-  Multipart form data: files + video + explanation

**GET /api/submissions/:id**

-  Get submission details
-  Requires authentication

**GET /api/challenges/:challengeId/submissions** (Company only)

-  Get all submissions for a challenge
-  Requires authentication and ownership

### Portfolio

**GET /api/portfolio/:userId**

-  Get public portfolio
-  Public endpoint

**PUT /api/portfolio** (Candidate only)

-  Update portfolio
-  Requires authentication

For complete API documentation, visit: http://localhost:5000/api-docs

---

## 🚀 Deployment

### Production Deployment

**Backend (Render/Railway):**

1. Create account on Render or Railway
2. Connect GitHub repository
3. Set environment variables
4. Deploy from `main` branch

**MongoDB Atlas:**

1. Create MongoDB Atlas account
2. Create cluster (free tier available)
3. Whitelist IP addresses
4. Get connection string
5. Add to environment variables

**Next.js (Vercel):**

1. Connect GitHub repository to Vercel
2. Set environment variables
3. Deploy automatically on push to `main`

**Angular (Netlify):**

1. Build Angular app: `npm run build`
2. Upload `dist/` folder to Netlify
3. Or connect GitHub for automatic deployments

### Environment Variables (Production)

Ensure all environment variables are set in your hosting platform:

-  Database connection string
-  JWT secret (use strong random string)
-  API keys (OpenAI, Cloudinary)
-  Frontend URLs for CORS

### CI/CD Pipeline

GitHub Actions workflow is configured for:

-  Automated testing on PR
-  Linting and type checking
-  Automatic deployment on merge to `main`

---

## 👥 Team

**Team 3 - ITI Graduation Project**

-  **Team Leader / Backend Lead:** [Your Name]
-  **Next.js Lead:** [Developer 2 Name]
-  **Angular Lead:** [Developer 3 Name]
-  **Full Stack / QA:** [Developer 4 Name]

### Roles & Responsibilities

-  **Team Leader:** Project management, sprint planning, backend architecture, AI integration
-  **Next.js Lead:** Public website, SEO, marketing pages, frontend-backend integration
-  **Angular Lead:** Dashboard development, state management, complex UI components
-  **Full Stack / QA:** API development, video processing, testing, bug fixes

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Review Guidelines

-  Keep PRs small and focused
-  Write clear commit messages
-  Add tests for new features
-  Update documentation as needed
-  Respond to review comments promptly

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

-  **Inspiration:** CodeQuests.com for challenge-based hiring model
-  **Design:** Cohere.com for visual aesthetic
-  **AI Technology:** OpenAI and Anthropic for AI capabilities
-  **ITI:** Information Technology Institute for education and support
-  **Open Source Community:** All the amazing libraries and tools we use

---

## 📞 Support & Contact

-  **Documentation:** [docs.skillmatch-ai.com](https://docs.skillmatch-ai.com)
-  **Issues:** [GitHub Issues](https://github.com/your-org/skillmatch-ai/issues)
-  **Email:** support@skillmatch-ai.com
-  **Discord:** [Join our community](https://discord.gg/skillmatch)

---

## 🗺️ Roadmap

### Phase 1 (Current - MVP) ✅

-  [x] User authentication
-  [x] Challenge creation and management
-  [x] Submission system with video
-  [x] AI evaluation
-  [x] Smart portfolio
-  [x] Basic dashboards

### Phase 2 (Next 3 Months)

-  [ ] Talent marketplace
-  [ ] Advanced gamification
-  [ ] Email notifications
-  [ ] Real-time messaging
-  [ ] Mobile apps (React Native)

### Phase 3 (6-12 Months)

-  [ ] ATS integrations
-  [ ] Advanced analytics
-  [ ] Team challenges
-  [ ] Interview scheduling
-  [ ] Payment processing

### Phase 4 (Future)

-  [ ] AI-powered matching
-  [ ] Skill assessments library
-  [ ] White-label solution
-  [ ] API for third-party integrations
-  [ ] Enterprise features

---

## 📊 Project Status

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-75%25-yellow)
![Version](https://img.shields.io/badge/version-1.0.0-blue)

**Current Sprint:** Week 4 - Final Polish & Testing  
**Next Release:** v1.0.0 (Graduation Presentation)  
**Contributors:** 4  
**Total Commits:** [Auto-updated]

---

Made with ❤️ by Team 3 | ITI Graduation Project 2025
