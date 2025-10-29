# 🎵 SunoMaker

**Adaptive AI Remixing System for Preserving Linguistic Integrity and Musical Shape in Generative Corrido Production**

A ComfyUI-style local application for creating and validating AI-generated corridos with automatic pronunciation correction and quality validation.

📚 **[Browse 34 Reference Tracks](https://hassanvfx.github.io/jsmaker/)** - Explore our curated audio catalog organized by style (Norteño, Banda, Tumbado, Trap, Rap)

## 🎯 Overview

SunoMaker is a self-correcting remix tool that combines:
- **GPT-4** for lyric enhancement with Suno-specific formatting
- **Suno API** for high-quality music generation
- **Whisper ASR** for pronunciation validation
- **Automatic retry logic** with rollback to fix mispronunciations

Perfect for corrido production companies that need consistent pronunciation of Spanish/Mexican terms like "México", "Guerrero", "patrón", etc.

## 🏗️ Architecture

```
┌─────────────────────────┐
│   Browser UI            │
│   (localhost:8080)      │
│   - Project Manager     │
│   - Lyric Editor        │
│   - Style Selector      │
│   - Audio Player        │
└───────────┬─────────────┘
            │
            ↓
┌─────────────────────────┐
│   Tiny Python Server    │
│   (localhost:5000)      │
│   - Filesystem only     │
└───────────┬─────────────┘
            │
            ↓
┌─────────────────────────┐
│   Filesystem            │
│   data/                 │
│   ├── projects/         │
│   ├── styles/           │
│   └── templates/        │
└─────────────────────────┘
```

All API calls (Suno, OpenAI) happen directly from the browser - the Python server only handles file operations.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Suno API key (from [sunoapi.org](https://sunoapi.org/api-key))
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd sunomaker

# Install frontend dependencies
npm install

# Install Python dependencies (in virtual environment)
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Copy environment template and add your API keys
cp .env.example .env
# Edit .env and add your keys:
# VITE_SUNO_API_KEY=your_suno_key
# VITE_OPENAI_API_KEY=your_openai_key
```

### Run

```bash
# Start both servers (Vite + Python)
npm run dev
```

Open your browser to `http://localhost:8080`

## 📁 Project Structure

```
sunomaker/
├── src/                      # Frontend (Vite + React + TypeScript)
│   ├── services/             # API clients
│   │   ├── filesystem.ts     # File operations
│   │   ├── suno.ts          # Suno API client
│   │   ├── openai.ts        # GPT + Whisper
│   │   └── validator.ts     # ASR validation logic
│   ├── components/          # React components
│   └── types/               # TypeScript types
├── server.py                # Tiny filesystem server
├── data/                    # Your projects & styles
│   ├── projects/            # Generated projects
│   ├── styles/              # Reference audio (norteño, banda, etc.)
│   └── templates/           # GPT prompt template
└── JOURNAL.md              # Development log
```

## 🎼 Workflow

### 1. Create Project
- Name your corrido project
- Select style (norteño, banda, corrido tumbado)

### 2. Input Lyrics
- Paste raw lyrics
- Click "Enhance with GPT" to apply Suno formatting

### 3. Generate Music
- **Custom Mode**: Generate from enhanced lyrics
- **Remix Mode**: Upload reference song + apply lyrics

### 4. Auto-Validation
- System transcribes with Whisper
- Detects mispronunciations (e.g., "México" → "mexicou")
- Identifies error location

### 5. Auto-Retry (if needed)
- Rolls back to last good section (verse/chorus)
- Asks GPT for phonetic alternatives
- Extends music from rollback point
- Repeats until success or max attempts

### 6. Final Track
- Validated corrido saved to project folder
- Ready for commercial use!

## 🔧 Configuration

### Suno Model Versions
Set in `.env`:
```bash
VITE_SUNO_MODEL_VERSION=v5  # Options: v3_5, v4, v4_5, v4_5plus, v5
```

### GPT Model
```bash
VITE_GPT_MODEL=gpt-4-turbo
```

### Validation Thresholds
Edit `src/services/validator.ts`:
```typescript
confidence > 85  // Overall similarity threshold
```

## 📝 GPT Lyric Enhancement

The system uses a Grammy-winning-focused prompt that:
- Breaks lyrics into short lines for better TTS
- Adds musical annotations `[Intro]`, `[Verse 1]`, etc.
- Inserts phonetic hints for Spanish pronunciation
- Includes instrumental breaks and effects

Edit the prompt: `data/templates/gpt-prompt.txt`

## 🎨 Adding Custom Styles

```bash
# Create a new style folder
mkdir -p data/styles/my-style

# Add reference audio
cp /path/to/reference.mp3 data/styles/my-style/reference.mp3

# Create metadata
cat > data/styles/my-style/metadata.json << EOF
{
  "name": "My Custom Style",
  "description": "Description of the style",
  "genre": "corrido",
  "referenceAudio": "reference.mp3"
}
EOF
```

## 🐛 Troubleshooting

### TypeScript Errors
These are expected before running `npm install`. They'll disappear once dependencies are installed.

### Python Server Won't Start
```bash
# Make sure Flask is installed
pip install flask flask-cors

# Check port 5000 is available
lsof -i :5000
```

### API Key Issues
- Verify keys in `.env` file
- Check they start with correct prefixes:
  - Suno: usually a hex string
  - OpenAI: `sk-proj-...`

### Validation Always Fails
- Check OpenAI Whisper credits
- Try lowering similarity threshold in `validator.ts`
- Verify audio URL is accessible

## 📊 Development Journal

See [JOURNAL.md](JOURNAL.md) for:
- Current milestone progress
- Known issues
- Next steps
- Architecture decisions

## 🤝 Contributing

This is an internal tool for corrido production. For issues or features:
1. Check JOURNAL.md for known issues
2. Test thoroughly with different corrido styles
3. Document pronunciation patterns you discover

## 📄 License

Proprietary - Internal use only

## 🙏 Credits

Built with:
- [Suno API](https://sunoapi.org/) - AI music generation
- [OpenAI](https://openai.com/) - GPT-4 & Whisper
- [Vite](https://vitejs.dev/) - Frontend tooling
- [Flask](https://flask.palletsprojects.com/) - Minimal Python server

---

**🎵 ¡A crear corridos con calidad Grammy!** 🏆
