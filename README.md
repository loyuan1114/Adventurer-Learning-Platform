# ? ADV9 Adventurer Learning Platform / ??飛蝧像??
> A gamified learning platform: quiz adventures, card-based character development, guild battles, homework assignment, AI assistants, and social interaction.
>
> ?玨璆剛????芷??脩?摮貊?撟喳嚗?憿??芥?⊿?????啜?璆剔撣I ?拍??冗蝢支???
- **撖Ⅳ摰** / **Password security**: Argon2id ??嚗瘜蝙??argon2 ???蝝 scrypt嚗? Argon2id hashing (falls back to scrypt if argon2 is unavailable)
- **Docker 銝?菟蝵?* / **Docker one-click deploy**: ?舀 Linux / macOS / Windows / Works on any OS with Docker
- **鞈???祆?** / **All data stays local**: 撣唾??身摰I ??賢???`data/`?media/` / Accounts, settings, AI keys stored in `data/`, `media/`
- **?身蝞∠???* / **Default admin**: `adv9boss` / `admin123`嚗?甈∠?亥??孵?蝣?/ **change password on first login**嚗?
---

## ?? 敹恍?憪?/ Quick Start

### ? 獢摰???/ Desktop Installer

銝?撠??嚗??銵?
Download the installer for your platform and double-click:

| 瑼? / File | 撟喳 / Platform | 銝? / Download |
|------------|----------------|----------------|
| `adv9-installer-windows-x64.exe` | Windows 64 雿? | [Releases](../../releases/latest) |
| `adv9-installer-windows-x86.exe` | Windows 32 雿? | [Releases](../../releases/latest) |
| `adv9-installer-windows-arm64.exe` | Windows ARM | [Releases](../../releases/latest) |
| `adv9-installer-mac-arm64` | macOS Apple Silicon (M1+) | [Releases](../../releases/latest) |
| `adv9-installer-mac-x64` | macOS Intel | [Releases](../../releases/latest) |
| `adv9-installer-linux-x64` | Linux 64 雿? | [Releases](../../releases/latest) |

> 摰??冽??芸?嚗?鋆?Docker ??銝?撠? ??撱箇蔭摰孵 ?????汗??/ The installer will: install Docker ??download project ??build container ??open browser.

**?身?餃 / Default login**: `adv9boss` / `admin123`

---

### ? Docker Compose

```bash
git clone https://github.com/loyuan1114/Adventurer-Learning-Platform.git
cd Adventurer-Learning-Platform
docker compose up -d
```

---

### ? GitHub Codespaces嚗?鞎鳴?/ Free

1. Fork 甇文澈 ??**Code ??Codespaces ??Create codespace**
2. ?函?蝡舀??瑁?嚗?```bash
docker compose up -d --build
```
3. **Ports** ?Ｘ ??8080 ???喲 ??**Port Visibility ??Public**

---

## ????寡 / Features

### ?? ?詨?摮貊? / Core Learning

| 璅∠? / Module | ? / Description |
|--------------|-------------------|
| ? ??? / Quiz Adventure | AI ?粹???Ｘ?脯P ??拙?? / AI-generated questions, dungeon progression, XP & loot |
| ?? 雿平蝟餌絞 / Homework System | ?葦?澆????嫘I 撘梢??? / Teacher assignment, auto-grading, AI weak-point analysis |
| ?? ?銴? / Flashcards (SM-2) | ????蝞?嚗???嗡???/ Spaced repetition for long-term retention |
| ?? 蝑????箏? / Notes & Mindmaps | 鞊?蝑? + AI ??閬死敹??/ Rich notes with AI-generated mindmaps |
| ?? ?岫閬? / Exam Planning | ?閮??I 摮貊?閮?脣漲餈質馱 / Countdown, AI study plans, progress tracking |

### ?? RPG 蝟餌絞 / RPG Systems

| 璅∠? / Module | ? / Description |
|--------------|-------------------|
| ? ?∠??園? / Card Gacha | 閫?秘?押?瞍怠??蝔?漲?０ / Character, pet, anime card gacha with rarity tiers |
| ?? ????/ Forge & Equipment | ?釭?０?撥??????/ Crafting, enhancement, material gathering |
| ?儭???敺? / Territory | 頝典飛蝘雿嚗??萄? / Cross-subject conquest with reward multipliers |
| ? ?祆???/ Guild Wars | ???圈洛????嗚蝝奎鞈?/ Team battles, territory control, class competitions |
| ?儭??犖? / Rogue-like | 瘥摰嗥銝?∩????芾楝蝺?/ Unique adventure path per player |

### ?? AI ?游? / AI Integration

| 璅∠? / Module | ? / Description |
|--------------|-------------------|
| ?? 憭??? AI / Multi-Provider AI | Gemini?penAI?eepSeek?wen?imi?llama嚗璈?/ 6+ AI providers, local Ollama support |
| ?儭?AI 撠葦 / AI Tutor | ?寞?蝑??脣漲?犖??撠?/ Personalized tutoring based on notes & progress |
| ?? AI 摮豢?蝔賣 / AI Audit | ?葦敺 + AI 摮貊?銵?? / Teacher dashboard with AI-powered analysis |
| ??儭?AI ?剖恥 / AI Podcast | ?芸????唾?摮貊??? / Auto-generated audio study materials |
| ?妣 AI 摮貊?頝臬? / AI Learning Path | ?寞?銵函?豢??犖?玨蝔?/ Personalized curriculum from performance data |

### ? 蝷曆漱?恣??/ Social & Admin

| 璅∠? / Module | ? / Description |
|--------------|-------------------|
| ? ?予?冗鈭?/ Chat & Social | 憟賢??黎蝯隞嗚票??/ Friends, groups, mail, story posting |
| ? 蝔?瘝? / Code Sandbox | Python?++?ava ?瑁? / Python, C++, Java execution |
| ???抽??摰園?銵冽 / Parent Dashboard | ?單??脣漲?????恣??/ Real-time progress monitoring, consent management |
| ?? 蝞∠??∪???/ Admin Panel | ?冽蝞∠??頂蝯勗?隞賡??PI ?蝞∠? / User management, backup/restore, API keys |

---

## ?? 撟喳瘥? / Platform Comparison

| ? / Item | **ADV9** | PaGamO | ???撟喳 | Cool English |
|------------|---------|--------|-----------|-------------|
| **憿? / Type** | ???芣 / Open-source | ?平 SaaS | ????SaaS | ?踹? SaaS |
| **鞎餌 / Cost** | ?祥嚗?蜓璈?/ Free | ?祥嚗玨??/ Free + premium | 摰?祥 / Free | 摰?祥 / Free |
| **摮貊? / Subjects** | ?函? + 蝔? + 211 隤? / All + code + 211 langs | ???圈?銝凋?憭折???/ K-12 five domains | ???圈?銝剜????/ K-12 STEM | ?隤?/ English only |
| **???/ Gamification** | RPG ?賢 + ?祆? + ?? + ??/ Full RPG | ???颱? + PK / Territory + PK | 敺賜? + 暺 / Badges + points | 撠???/ Mini-games |
| **AI ? / AI** | 6+ 靘????舀?祆? / 6+ providers | ?箸?? / Basic analytics | ?批捆?刻 / Content rec. | AI ?潮 / Pronunciation |
| **蝔?瘝? / Code** | Python, C++, Java | ??| ?餉蝘飛隤脩? / CS courses | ??|
| **蝷曄黎 / Social** | 憟賢???隞嗚票??/ Full social | ?? PK??銵? / Team PK | ?? / Limited | ?? / Limited |
| **?函蔡 / Deploy** | Docker / Codespaces / VPS / ?祆? | ?脩垢??/ Cloud only | ?脩垢??/ Cloud only | ?脩垢??/ Cloud only |
| **鞈??批 / Data** | 摰?芣 / Full control | 撱?隞?恣 / Vendor | 撱?隞?恣 / Vendor | ?踹?隞?恣 / Gov |
| **?臬恥鋆?/ Custom** | 摰嚗?皞?/ Full (open) | ??/ No | ??/ No | ??/ No |

---

## ?? 蝺?瞍內 / Live Demo

**GitHub Pages**: [https://loyuan1114.github.io/Adventurer-Learning-Platform/](https://loyuan1114.github.io/Adventurer-Learning-Platform/)

| 閫 / Role | 撣唾? / Username | 撖Ⅳ / Password |
|------------|----------------|----------------|
| 蝞∠???/ Admin | `adv9boss` | `admin123` |

> ?? Pages ???摮閰脩汗?函? `localStorage`嚗??斤汗?刻???皜征?脣漲??> The Pages version stores all data in browser `localStorage`. Clearing browser data will erase progress.

---

## ??儭?蝞∠??∟身摰?/ Admin Settings

| 閮剖? / Setting | 雿蔭 / Location |
|--------------|----------------|
| ?身撣唾? / Default account | `adv9boss` / `admin123` |
| 撖Ⅳ?? / Password hashing | Argon2id嚗crypt ??嚗? Argon2id (scrypt fallback) |
| 靽格撖Ⅳ / Change password | ?餃 ??撣唾???/ Login ??Account page |
| AI ? / AI keys | 蝞∠?????API ?蝞∠? / Admin ??API Keys |
| AI 蝡舫? / AI endpoints | 蝞∠?????AI 蝡舫? / Admin ??AI Endpoints |
| ??單? / Background music | 閮剖? ????單? / Settings ??Music |
| ???閮剖? / Socratic settings | 蝞∠????????閮剖? / Admin ??Socratic |

---

## ?? ?祆? AI嚗llama嚗?鞎餌 API ?嚗? Local AI (Ollama, Free)

```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull huihui_ai/qwen2.5-vl-abliterated:7b
```

?嗅?嚗恣? ??**AI 蝡舫?** ???啣? ??靘???Ollama ??璅∪?嚗qwen2.5-vl-abliterated:7b` ???嚗http://127.0.0.1:11434`
Then: Admin ??**AI Endpoints** ??Add ??Provider: Ollama ??Model: `qwen2.5-vl-abliterated:7b` ??Key: `http://127.0.0.1:11434`

---

## ?? 雿平瑼??臬 / Homework Import

### 瑼??澆? / File Format

?刻雿輻 `.txt`嚗ord 隢摮瑼蝝?摮?
Recommend using `.txt` (in Word: File ??Save As ??Plain Text)

瘥??箏? **6 銵?*嚗?Each question requires exactly **6 lines**:
1. 憿 / Question
2. ?賊? a / Option a
3. ?賊? b / Option b
4. ?賊? c / Option c
5. ?賊? d / Option d
6. 蝑? / Answer嚗憛?a/b/c/d??-4 ????/ can be a/b/c/d, 1-2-3-4, or full option text嚗?
### 蝭? / Example

```
憿嚗??銝?鞈芣嚗?a. 4
b. 6
c. 7
d. 9
蝑?嚗

憿嚗偌??摮詨??箔?嚗?a. CO2
b. H2O
c. NaCl
d. O2
蝑?嚗
```

### ???撘?/ Quoted Format嚗?湛?

銋隞交???雿????韏瑚?嚗??毽?剁?
You can also wrap each field in quotes, or mix formats:

```
"憿嚗??銝?鞈芣嚗?
"a. 4"
"b. 6"
"c. 7"
"d. 9"
"蝑?嚗"
```

---

## ?? 鞈???隞?/ Data & Backup

```
data/    撣唾??身摰I ???璆准?憭抵???JSON 瑼?嚗?         Accounts, settings, AI keys, homework, chat logs (JSON)
media/   銝??蔣?璅?         Uploaded photos, videos, music
```

| ?? / Action | ?誘 / Command |
|--------------|---------------|
| ?? / Upgrade | `docker compose down && docker compose up -d --build` |
| ?遢 / Backup | `tar czf backup.tgz data media` |
| ?? / Restore | 閫???遢 ??`docker compose restart` |
| ?貉? / Uninstall | 雿輻摰??具頛?????`docker compose down && rm -rf adv9` |

---

## ??儭??貉????/ Uninstall

- **?迫嚗?????** / **Stop (keep data)**: `cd adv9 && docker compose down`
- **?芷???* / **Delete everything**: `docker compose down && rm -rf adv9`
- **??隞?* / **Backup first**: `tar czf backup.tgz data media` before deleting

---

## ?? ???? / License

**AGPL-3.0-or-later**嚗? `LICENSE`嚗?其耨?寞迨頠?銝虫誑蝬脰楝??敶Ｗ???嚗???雿輻??靘?憪Ⅳ??If you modify and run this software as a network service, you must provide the source code to users.

---

## ?? AI ?澆?剝 / AI Call Disclosure

| ? / Function | 靘???/ Provider | 鞈?瘚? / Data Flow |
|----------------|------------------|---------------------|
| ?? ?芸??粹? / Auto Quiz | ?刻身摰?靘???/ Your configured provider | 憿隢? ??靘?????憿? / Question request ??Provider ??Quiz returned |
| ?? 撘梢??? / Weak Analysis | ??嚗?閮哨??祆? Ollama嚗? Same (default: Ollama local) | ?航炊蝯梯? ??靘??????飛撱箄降 / Error stats ??Provider ??Teaching suggestions |
| ? AI 閰? / AI Comments | ?? / Same | 摮貊?憪???蝮???靘???/ Student name, grades ??Provider |
| ? 摮? / Fonts | Google Fonts | ?汗?刻??亙?擃?獢?/ Browser loads font files |
| ? 蝮桀? / Thumbnails | Bing | ??蝮桀?頛 / Search thumbnails loaded |

> ?芣? **Ollama ?祆?璅∪?** ?賢??其?????函?隡箸??其???> **Only Ollama local mode** keeps data entirely on your server.

---

## ? ?????輻? / Photo Policy

??????**CC0 ?祆???**???喟?銵函內?? CC0 ????雿輻 CC0 靘?嚗ixabay/Unsplash/Wikimedia Commons嚗??箏撱箄??胯?All photos are **CC0 Public Domain**. Uploading photos implies consent to CC0 licensing. Use CC0 sources (Pixabay/Unsplash/Wikimedia Commons) for built-in backgrounds.

---

## ??撣貉??? / FAQ

- **Port 8080 ?⊥?摮?嚗?* / **Port 8080 not accessible?**
  隢?脩?銵?8080 ??/ Allow port 8080 in your firewall/security group

- **憒??湔嚗?* / **How to update?**
  銝???啁?嚗圾憯葬閬?嚗???`data/` ??`media/`嚗??瑁? `docker compose up -d --build`
  Download latest, extract over old (keep `data/` and `media/`), run `docker compose up -d --build`

- **瘝? Docker嚗?* / **No Docker?**
  ?湔?瑁? `node server.js`嚗?閬?Node.js 18+嚗? `npm install` 摰? Argon2嚗?  Run `node server.js` directly (Node.js 18+ required, `npm install` first for Argon2)

---

<p align="center">
  <sub>Built with ?歹? for learners everywhere / ?箏銝?摮貊??遣 ?歹?</sub>
</p>
