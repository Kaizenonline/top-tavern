# The Top Tavern — Deployment Guide

A solo D&D campaign powered by Claude AI. Deploy to Vercel in ~5 minutes.

---

## Deploy to Vercel (recommended)

### Step 1 — Create a GitHub repository
1. Go to https://github.com and create a new repository (call it `top-tavern` or anything you like)
2. Upload all the files from this folder to the repository
   - Drag and drop the files into the GitHub web interface, OR
   - Use `git init`, `git add .`, `git commit -m "init"`, `git remote add origin <your-repo-url>`, `git push`

### Step 2 — Connect to Vercel
1. Go to https://vercel.com and sign up (free — use your GitHub account)
2. Click **"Add New Project"**
3. Select your GitHub repository
4. Vercel will auto-detect it as a Vite project
5. Click **"Deploy"** — but don't click yet! First do Step 3.

### Step 3 — Add your API key
Before clicking Deploy, scroll down to **"Environment Variables"** and add:
- **Name:** `ANTHROPIC_API_KEY`
- **Value:** your key from https://console.anthropic.com

Then click **Deploy**.

### Step 4 — Share the URL
Once deployed (~2 minutes), Vercel gives you a URL like:
`https://top-tavern-abc123.vercel.app`

Send that to your friend. No install needed. Works in any browser.

---

## Run locally (optional)

```bash
# Install Node.js from https://nodejs.org first

npm install
cp .env.example .env.local
# Edit .env.local and add your real API key

npm run dev
# Opens at http://localhost:5173
```

---

## Getting an API key

1. Go to https://console.anthropic.com
2. Sign up / log in
3. Click **"API Keys"** in the sidebar
4. Click **"Create Key"**
5. Copy the key (starts with `sk-ant-...`)

**Cost:** The game uses claude-sonnet-4 which costs roughly $0.003 per turn (about 3 cents per 10 turns). A full playthrough might cost $0.10–$0.30 total.

---

## Notes
- Save games are stored in the player's browser (localStorage-like storage)
- The API key is stored securely on Vercel's servers — your friend never sees it
- You can revoke the key from the Anthropic console at any time
- To update the game: push changes to GitHub → Vercel auto-redeploys
