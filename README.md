# DevFlex 👨‍💻

DevFlex is a full-stack, neubrutalistic, high-performance web application designed to automatically generate stunning developer portfolios in minutes. 

It scrapes stats directly from GitHub and LinkedIn, writes AI-powered career summaries, compiles download-ready PDF resumes, and supports manual inputs for developers who want to showcase custom projects and experiences without GitHub.

---

## Key Features

*   **Real-time Scrapers**: Direct GitHub GraphQL and LinkedIn integrations to fetch experience timeline, repositories, language complexity metrics, and contribution charts.
*   **AI Summary Engine**: Google Gen AI summaries to construct meta SEO descriptors, tags, and personalized first-person profiles.
*   **Manual Portfolio Creator**: Step-by-step neubrutalistic forms to create, store, and edit portfolios manually.
*   **React-PDF Resumes**: Dynamic translation matching brand templates that download instantly.
*   **Interactive Neubrutalist UI**: Drag-to-compare sliders, particle Canvas sparkles, animated timeline grids, and loaders.

---

## Getting Started

### 1. Setup Environment
Rename `.env.example` to `.env.local` and add your keys:
```env
GITHUB_TOKEN=your_tokens_comma_separated
GEMINI_API_KEY=your_gemini_api_key
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the homepage.

---

## Git Operations

To link this clean, reinitialized local repository to your remote GitHub page:
```bash
git remote add origin https://github.com/rishikeshrai/devflex.git
git branch -M main
git push -u origin main
```
