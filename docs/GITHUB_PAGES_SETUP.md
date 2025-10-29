# 🚀 GitHub Pages Setup for Reference Audio

This guide shows you how to enable GitHub Pages so your reference audio files are publicly accessible for the Suno API.

---

## ✅ What's Already Done

1. ✅ Repository pushed to GitHub: `hassanvfx/jsmaker`
2. ✅ Reference audio files (24 corridos + 11 rap tracks) uploaded
3. ✅ Metadata files updated with GitHub Pages URLs
4. ✅ .gitignore configured to protect API keys

---

## 🔧 Enable GitHub Pages

### Step 1: Go to Repository Settings

1. Visit: https://github.com/hassanvfx/jsmaker
2. Click **Settings** (top right)
3. Scroll down to **Pages** (left sidebar)

### Step 2: Configure GitHub Pages

1. **Source**: Select `Deploy from a branch`
2. **Branch**: Select `main`
3. **Folder**: Select `/ (root)`
4. Click **Save**

### Step 3: Wait for Deployment

- GitHub will build and deploy your site (takes 1-2 minutes)
- You'll see: "Your site is live at https://hassanvfx.github.io/jsmaker/"

---

## 🎵 Reference Audio URLs

Once GitHub Pages is enabled, your audio files will be accessible at:

### Corridos Norteño/Banda (24 files)
```
https://hassanvfx.github.io/jsmaker/data/styles/corridos_norteno_banda/norteno_ariel_camacho.mp3
https://hassanvfx.github.io/jsmaker/data/styles/corridos_norteno_banda/banda_epico_franchesco.mp3
https://hassanvfx.github.io/jsmaker/data/styles/corridos_norteno_banda/tumbado_belico_el_pantera.mp3
... (21 more files)
```

### Rap Mexicano (11 files)
```
https://hassanvfx.github.io/jsmaker/data/styles/rap/rap_mexicano.mp3
https://hassanvfx.github.io/jsmaker/data/styles/rap/rap_del_nini_cover_lefty.mp3
https://hassanvfx.github.io/jsmaker/data/styles/rap/rap_romantico.mp3
... (8 more files)
```

---

## 🧪 Test Your Setup

### 1. Verify GitHub Pages is Live

```bash
curl -I https://hassanvfx.github.io/jsmaker/data/styles/corridos_norteno_banda/norteno_ariel_camacho.mp3
```

Should return `200 OK`

### 2. Test in SunoMaker

1. Open SunoMaker: http://192.168.1.85:4200
2. Create/open a project
3. The styles should now load automatically with GitHub URLs!
4. Generate in Remix mode - it will use the GitHub-hosted audio

---

## 📊 How It Works

### Before (Localhost)
```
❌ http://localhost:8888/reference.mp3
   - Only works on your computer
   - Requires Python HTTP server running
   - Can't share with others
```

### After (GitHub Pages)
```
✅ https://hassanvfx.github.io/jsmaker/data/styles/.../file.mp3
   - Works from anywhere
   - Always available
   - No local server needed
   - Can share URLs with others
```

### Metadata Flow
```
1. StyleSelector loads: data/styles/*/metadata.json
2. Reads referenceAudio URL
3. Passes to Suno API via uploadAndCover()
4. Suno downloads from GitHub Pages
5. Generates remix! 🎵
```

---

## 🔐 Security Notes

### What's Public
- ✅ Reference audio files (intended for public use)
- ✅ Source code
- ✅ Documentation
- ✅ Project metadata

### What's Protected (.gitignore)
- ✅ `.env` file (API keys)
- ✅ `node_modules/`
- ✅ `venv/`
- ✅ Generated project audio (`data/projects/**/*.mp3`)

---

## 🛠️ Troubleshooting

### Issue: 404 Not Found

**Cause**: GitHub Pages not enabled yet

**Solution**:
1. Go to repo Settings → Pages
2. Select branch: `main`
3. Save and wait 1-2 minutes

### Issue: CORS Error

**Cause**: GitHub Pages doesn't send proper CORS headers by default

**Solution**: GitHub Pages allows cross-origin requests for audio files, so this should work. If you encounter issues:
1. Use the Suno API's file upload endpoints instead
2. Or add a CORS proxy

### Issue: Audio File Not Loading

**Check**:
1. File exists in repo
2. GitHub Pages is enabled
3. URL is correct (case-sensitive!)
4. File was committed and pushed

---

## 📝 Adding More Reference Audio

### 1. Add MP3 to Styles Directory

```bash
# Copy your new audio file
cp ~/Music/new_corrido.mp3 data/styles/corridos_norteno_banda/

# Or create a new style directory
mkdir data/styles/banda_sinaloense
cp ~/Music/*.mp3 data/styles/banda_sinaloense/
```

### 2. Create/Update metadata.json

```bash
cat > data/styles/corridos_norteno_banda/metadata.json << 'EOF'
{
  "id": "corridos_norteno_banda",
  "name": "Corridos Norteño/Banda",
  "description": "Updated collection",
  "genre": "regional-mexican",
  "referenceAudio": "https://hassanvfx.github.io/jsmaker/data/styles/corridos_norteno_banda/new_corrido.mp3"
}
EOF
```

### 3. Commit and Push

```bash
git add data/styles/
git commit -m "Add new reference audio"
git push
```

### 4. Wait for GitHub Pages to Update

- Takes 1-2 minutes
- Check deployment status in repo → Actions tab

---

## 🎯 Current Setup

### Repository Info
- **Repo**: hassanvfx/jsmaker
- **Branch**: main
- **GitHub Pages URL**: https://hassanvfx.github.io/jsmaker/
- **Total Reference Audio**: 35 files (171MB)

### File Structure
```
data/styles/
├── corridos_norteno_banda/
│   ├── metadata.json (✅ GitHub URLs)
│   └── *.mp3 (24 files)
└── rap/
    ├── metadata.json (✅ GitHub URLs)
    └── *.mp3 (11 files)
```

---

## 🚀 Next Steps

1. **Enable GitHub Pages** (see Step-by-Step above)
2. **Test the URLs** in your browser
3. **Restart SunoMaker** (`npm run dev`)
4. **Generate a corrido** in Remix mode!

---

## 💡 Pro Tips

### 1. Use Specific Files
Instead of relying on metadata.json defaults, users can paste any GitHub Pages URL directly into the Custom Reference field:

```
https://hassanvfx.github.io/jsmaker/data/styles/corridos_norteno_banda/tumbado_belico_el_pantera.mp3
```

### 2. Share Your Styles
Send these URLs to collaborators so they can use the same reference audio!

### 3. Version Control
Every time you update reference audio and push, it's versioned in git history.

### 4. CDN Benefits
GitHub Pages is served via CDN, so audio loads fast from anywhere in the world!

---

**Ready to generate corridos with online reference audio!** 🎸🇲🇽
