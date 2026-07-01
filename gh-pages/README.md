# Manikandan Raju — Portfolio

Cinematic personal portfolio site for a Cloud Architect & System Engineer.
Live on GitHub Pages.

## 🚀 Deploy to GitHub Pages

### Step 1 — Create a GitHub repository
1. Go to [github.com/new](https://github.com/new)
2. Name it `portfolio` (or `your-username.github.io` for a root domain)
3. Set to **Public**
4. Click **Create repository** — do NOT initialise with README

### Step 2 — Upload these files
Option A — via GitHub web UI (easiest):
1. Open your new repo
2. Click **Add file → Upload files**
3. Drag in ALL files from this folder (keep the `assets/` folder structure)
4. Commit to `main`

Option B — via Git CLI:
```bash
git init
git add .
git commit -m "Initial portfolio deploy"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/portfolio.git
git push -u origin main
```

### Step 3 — Enable GitHub Pages
1. Go to repo **Settings → Pages**
2. Under **Source**, select **Deploy from a branch**
3. Branch: `main` / Folder: `/ (root)`
4. Click **Save**

Your site will be live at:
`https://YOUR_USERNAME.github.io/portfolio/`

(Takes ~60 seconds to deploy on first push)

## 📁 File structure
```
/
├── index.html          ← Main page
├── assets/
│   ├── hero-video.mp4  ← Your talking-head video
│   ├── style.css       ← All styles
│   └── main.js         ← All JavaScript (Three.js, GSAP, interactions)
├── .nojekyll           ← Tells GitHub Pages to skip Jekyll processing
└── README.md
```

## ✏️ Customisation
- **Name / role / bio** — edit `index.html` directly (search for `MANIKANDAN`)
- **Contact links** — search `manikandanr7598` in `index.html`
- **LinkedIn URL** — search `manikandanraju-8a0b04219` in `index.html`
- **Replace video** — swap `assets/hero-video.mp4` with your new file (keep same filename)
- **Colours** — edit the CSS variables at the top of `assets/style.css`
