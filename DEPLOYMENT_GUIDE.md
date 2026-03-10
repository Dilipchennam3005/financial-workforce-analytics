# 🚀 GitHub & Deployment Guide
## Financial Workforce Analytics Suite

This is your complete, step-by-step guide to push this project to GitHub and get it live on the internet — written assuming you're starting from scratch.

---

## PART 1 — Set Up Your Project Folder

Your project should be organized like this before pushing:

```
financial-workforce-analytics/
├── data/
│   ├── generate_workforce_data.py
│   ├── ml_models.py
│   └── employees_scored.csv
├── dashboard/
│   └── workforce_dashboard.jsx
├── README.md
└── .gitignore
```

Create a `.gitignore` file with this content:
```
node_modules/
dist/
.env
__pycache__/
*.pyc
.DS_Store
```

---

## PART 2 — Push to GitHub

### Step 1: Create the GitHub repo
1. Go to [github.com](https://github.com) and sign in
2. Click the **+** button (top right) → **New repository**
3. Name it: `financial-workforce-analytics`
4. Set to **Public**
5. ⚠️ Do NOT check "Add a README" — you already have one
6. Click **Create repository**

### Step 2: Initialize Git locally
Open terminal in your project folder and run these commands one at a time:

```bash
git init
```
```bash
git add .
```
```bash
git commit -m "Initial commit: Financial Workforce Analytics Suite"
```
```bash
git branch -M main
```
```bash
git remote add origin https://github.com/YOUR_USERNAME/financial-workforce-analytics.git
```
```bash
git push -u origin main
```

> Replace `YOUR_USERNAME` with your actual GitHub username.

### Step 3: Verify
- Go to `github.com/YOUR_USERNAME/financial-workforce-analytics`
- You should see your README displayed beautifully with badges
- All your files should be visible in the repo

---

## PART 3 — Set Up the React App (to make it deployable)

The dashboard JSX file needs to be inside a React project to run. Here's how:

```bash
# Create a new Vite + React project
npm create vite@latest workforce-dashboard -- --template react

# Go into it
cd workforce-dashboard

# Install recharts (the charting library)
npm install recharts
```

Now:
1. Open `workforce-dashboard/src/App.jsx`
2. **Delete everything** in that file
3. **Paste in** the entire contents of `workforce_dashboard.jsx`
4. Also delete `src/App.css` and `src/index.css` (not needed)

Test it locally:
```bash
npm run dev
```
Open `http://localhost:5173` — your dashboard should be running! ✅

---

## PART 4 — Deploy to Netlify (Free, Recommended)

Netlify gives you a public URL like `https://meridian-workforce.netlify.app`

### Option A — Drag and Drop (Easiest, 2 minutes)

```bash
# Build the project (creates a dist/ folder)
npm run build
```

1. Go to [app.netlify.com](https://app.netlify.com)
2. Sign up / log in (free)
3. On the dashboard, find the box that says **"drag and drop your site folder here"**
4. Drag your `dist/` folder into it
5. Done — your site is live instantly with a random URL

To rename the URL:
- Site settings → Change site name → e.g. `meridian-workforce-analytics`
- New URL: `https://meridian-workforce-analytics.netlify.app`

### Option B — Netlify CLI (more control)

```bash
npm install -g netlify-cli
netlify login
npm run build
netlify deploy --prod --dir=dist
```

---

## PART 5 — Deploy to GitHub Pages (Alternative)

```bash
# In your workforce-dashboard folder:
npm install --save-dev gh-pages
```

Add these lines to `package.json`:

```json
"homepage": "https://YOUR_USERNAME.github.io/financial-workforce-analytics",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist",
  ...existing scripts...
}
```

Then deploy:
```bash
npm run deploy
```

Live at: `https://YOUR_USERNAME.github.io/financial-workforce-analytics`

---

## PART 6 — Deploy to Vercel (Also Free)

```bash
npm install -g vercel
vercel --prod
```

Vercel auto-detects Vite and handles everything. Takes about 90 seconds.

---

## PART 7 — Keep Your GitHub Repo Updated

Every time you make changes to the dashboard:

```bash
git add .
git commit -m "Update: describe what you changed"
git push
```

If you're on Netlify with continuous deployment turned on, pushing to GitHub will automatically redeploy your live site.

---

## PART 8 — Add to Your LinkedIn / Resume

Once deployed, your project link looks like:
- **Live Site:** `https://meridian-workforce-analytics.netlify.app`
- **GitHub Repo:** `https://github.com/YOUR_USERNAME/financial-workforce-analytics`

**On your resume:**

```
Financial Workforce Analytics Suite                          Dec 2024
React · Python · scikit-learn · Recharts
• Built end-to-end HR analytics platform for fictional financial firm (2,000-employee dataset)
• Trained Random Forest attrition model (AUC-ROC: 0.72) with 17 engineered features
• Implemented seasonal regression headcount forecasting (12-month horizon, 8 departments)
• Live dashboard with real-time employee feed, animated KPIs, and dept-level filtering
GitHub: github.com/YOUR_USERNAME/financial-workforce-analytics
```

---

## Common Issues & Fixes

| Problem | Fix |
|---------|-----|
| `recharts not found` | Run `npm install recharts` in project folder |
| White screen on deploy | Check browser console — usually a missing import |
| `git push` asks for password | Use a Personal Access Token instead of password — GitHub Settings → Developer Settings → PAT |
| Charts not rendering | Make sure `ResponsiveContainer` has a parent with explicit height |
| Netlify build fails | Check that `npm run build` works locally first |
