<h1 align="center">ADV9 Adventurer Learning Platform</h1>

<p align="center">
  <strong>Open-source gamified learning platform with AI, code sandbox, and RPG progression</strong><br>
  <sub>Open-source self-hosted | Docker one-click deploy | 7 platform installers</sub>
</p>

<p align="center">
  <a href="#installation">Installation</a> •
  <a href="#features">Features</a> •
  <a href="#demo">Live Demo</a> •
  <a href="#documentation">Docs</a> •
  <a href="#license">License</a>
</p>

---

## Quick Start

### Desktop Installer

Download and double-click:

| File | Platform |
|------|----------|
| `adv9-installer-windows-x64.exe` | Windows 64-bit |
| `adv9-installer-windows-x86.exe` | Windows 32-bit |
| `adv9-installer-windows-arm64.exe` | Windows ARM |
| `adv9-installer-mac-arm64` | macOS Apple Silicon |
| `adv9-installer-mac-x64` | macOS Intel |
| `adv9-installer-linux-x64` | Linux 64-bit |

> Download from [Releases](../../releases/latest).

Installer does everything: installs Docker → downloads project → builds container → opens browser.

Default login: `adv9boss` / `admin123`

### Option B: Docker Compose

```bash
git clone https://github.com/loyuan1114/Adventurer-Learning-Platform.git
cd Adventurer-Learning-Platform
docker compose up -d
```

### Option C: GitHub Codespaces

1. Fork this repo → **Code → Codespaces → Create codespace**
2. Run in terminal:
```bash
docker compose up -d --build
```
3. **Ports** panel → 8080 → **Port Visibility → Public**

---

## Features

### Core Learning
| Module | Description |
|--------|-------------|
| **Quiz Adventure** | AI-generated questions, dungeon progression, XP & loot rewards |
| **Homework System** | Teacher assignment, auto-grading, AI weak-point analysis |
| **Flashcards (SM-2)** | Spaced repetition algorithm for long-term retention |
| **Notes & Mindmaps** | Rich note-taking with AI-generated visual mindmaps |
| **Exam Planning** | Countdown, AI-generated study plans, progress tracking |

### RPG Systems
| Module | Description |
|--------|-------------|
| **Card Gacha** | Character, pet, and anime card collection with rarity tiers |
| **Forge & Equipment** | Crafting with quality tiers, enhancement, material gathering |
| **Territory** | Cross-subject conquest battles with reward multipliers |
| **Guild Wars** | Team battles, territory control, class competitions |
| **Rogue-like** | Unique adventure paths per player |

### AI Integration
| Module | Description |
|--------|-------------|
| **Multi-Provider AI** | Gemini, OpenAI, DeepSeek, Qwen, Kimi, Ollama (local) |
| **AI Tutor** | Personalized tutoring based on notes and progress |
| **AI Audit** | Teacher dashboard with AI-powered student behavior analysis |
| **AI Podcast** | Auto-generated audio study materials |
| **AI Learning Path** | Personalized curriculum based on performance data |

### Social & Admin
| Module | Description |
|--------|-------------|
| **Chat & Social** | Friends, groups, mail, story posting |
| **Code Sandbox** | Python, C++, Java execution in isolated containers |
| **Parent Dashboard** | Real-time progress monitoring, consent management |
| **Admin Panel** | User management, system backup/restore, API key management |

---

## Platform Comparison

| | **ADV9** | PaGamO | 均一教育平台 | Cool English |
|---|---------|--------|-----------|-------------|
| **Type** | Open-source self-hosted | Commercial SaaS | Non-profit SaaS | Government SaaS |
| **Cost** | Free (self-host) | Free + premium | Free | Free |
| **Subjects** | All + code + 211 languages | K-12 five domains | K-12 math/science/lang | English only |
| **Gamification** | RPG gacha + guild + territory + forge | Territory + PK | Badges + points | Mini-games |
| **AI** | 6+ providers, local Ollama | Basic analytics | Content recommendation | AI pronunciation |
| **Code Sandbox** | Python, C++, Java | ✗ | CS courses | ✗ |
| **Social** | Friends, guilds, mail, posts | Team PK, leaderboards | Limited | Limited |
| **Deployment** | Docker / Codespaces / VPS | Cloud only | Cloud only | Cloud only |
| **Data Control** | Full ownership | Vendor managed | Vendor managed | Government managed |
| **Customizable** | Full (AGPL-3.0) | No | No | No |

---

## Live Demo

**GitHub Pages**: [https://loyuan1114.github.io/Adventurer-Learning-Platform/](https://loyuan1114.github.io/Adventurer-Learning-Platform/)

| Role | Username | Password |
|------|----------|----------|
| Admin | `adv9boss` | `admin123` |

> Pages version runs entirely in browser `localStorage`. Multi-user requires VPS backend.

---

## Admin Settings

| Setting | Location |
|---------|----------|
| Default account | `adv9boss` / `admin123` |
| Password hashing | Argon2id (scrypt fallback) |
| AI providers | Admin → API Keys / AI Endpoints |
| Music upload | Settings → Background Music |
| Socratic prompts | Admin → Socratic Settings |

### Local AI (Ollama — Free, No API Keys)

```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull huihui_ai/qwen2.5-vl-abliterated:7b
```

Then: Admin → AI Endpoints → Add → Provider: Ollama → Model: `qwen2.5-vl-abliterated:7b` → Key: `http://127.0.0.1:11434`

---

## Data & Backup

```
data/    Accounts, settings, AI keys, homework, chat logs (JSON)
media/   Uploaded photos, videos, music
```

| Action | Command |
|--------|---------|
| Upgrade | `docker compose down && docker compose up -d --build` |
| Backup | `tar czf backup.tgz data media` |
| Restore | Extract backup → `docker compose restart` |
| Uninstall | Use installer's "Uninstall" button, or `docker compose down && rm -rf adv9` |

---

## Architecture

```
adv9/
├── server.js          # Node.js HTTP server (auth, KV store, WebSocket PK, sandbox)
├── public/
│   ├── index.html     # Main entry (CSS + loader + SW unregister)
│   ├── js/
│   │   ├── app/       # 19 app modules (p00-p15, q00-q01, api-layer)
│   │   └── views/     # 84 lazy-loaded view modules
│   ├── sw.js          # Service Worker (network-first)
│   └── manifest.json  # PWA manifest
├── data/              # Persistent storage (JSON files)
├── installer/         # Rust desktop installer source
│   └── src/           # main.rs, docker.rs, deploy.rs, platform.rs
├── Dockerfile         # Node 20 Alpine
└── docker-compose.yml
```

---

## Development

```bash
git clone https://github.com/loyuan1114/Adventurer-Learning-Platform.git
cd Adventurer-Learning-Platform
npm install
node server.js
```

Requires **Node.js 18+**. Browser opens at `http://127.0.0.1:8080`.

### Building the Installer

```bash
cd installer
cargo build --release
# Binary: target/release/adv9-installer
```

---

## License

**AGPL-3.0-or-later** — If you modify and run this software as a network service, you must provide the source code to users.

---

<p align="center">
  <sub>Built with ❤️ for learners everywhere</sub>
</p>
