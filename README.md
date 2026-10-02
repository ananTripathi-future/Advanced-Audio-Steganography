<!-- Badges Row 1 — Core Tech -->
<p align="center">
  <img src="https://img.shields.io/badge/Steganography-LSB-8b5cf6?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Encryption-AES--256-3b82f6?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Python-3.x-06b6d4?style=for-the-badge"/>
  <a href="https://advanced-audio-steganography.vercel.app" target="_blank">
    <img src="https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white"/>
  </a>
  <img src="https://img.shields.io/badge/GUI-Tkinter%20%26%20Web-10b981?style=for-the-badge"/>
</p>

<!-- Badges Row 2 — Organization -->
<p align="center">
  <img src="https://img.shields.io/badge/Organization-Supraja%20Technologies-orange?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge"/>
</p>

<p align="center">
  <a href="https://advanced-audio-steganography.vercel.app" target="_blank">
    <img src="https://img.shields.io/badge/🌐%20Launch%20Live%20App-advanced--audio--steganography.vercel.app-3A8DFF?style=for-the-badge"/>
  </a>
</p>

---

# 🎧 Advanced Audio Steganography System
### *Developed at Supraja Technologies by Anant Tripathi*

> 🚀 **Live Production Deployment:** [https://advanced-audio-steganography.vercel.app](https://advanced-audio-steganography.vercel.app)

A military-grade security platform that inaudibly conceals AES-encrypted messages inside audio files using LSB steganography — fortified with a zero-trust two-way identity handshake protocol. Available both as a **cross-platform desktop application** and as a **cloud-native web application deployed on Vercel**.

---

## 🚀 Dual Deployment Modes

| Platform | Interface | Runtime | Access |
| :--- | :--- | :--- | :--- |
| **🌐 Web Cloud App** | Modern Glassmorphic Dark UI | Vercel Serverless (Python 3.x) + Web Audio | [🔗 Launch Web App](https://advanced-audio-steganography.vercel.app) |
| **🖥️ Desktop App** | Dark-themed Tkinter GUI | Python Native + FFmpeg + Wave | Offline local processing on Windows/Linux/macOS |

---

## 🔐 System Architecture & Dual-Layer Defense

```text
┌──────────────────────────────────────────────────────────────┐
│             ADVANCED AUDIO STEGANOGRAPHY SYSTEM              │
│                                                              │
│  [Secret Message] + [Sender Identity] + [Receiver Identity]  │
│                               │                              │
│                               ▼                              │
│  Layer 1: AES-256 (Fernet) Encryption                        │
│    ├─ Password hashed with SHA-256 for key derivation        │
│    └─ Bundles handshake payload: Sender||Receiver||Message   │
│                               │                              │
│                               ▼                              │
│  Layer 2: LSB (Least Significant Bit) Steganography          │
│    ├─ Binary bitstream conversion                            │
│    └─ Inaudibly injected into WAV sample byte LSBs (<0.39%)  │
│                               │                              │
│                               ▼                              │
│  Layer 3: Cryptographic Verification on Extraction           │
│    ├─ Extract binary bits & reverse LSB mapping              │
│    ├─ AES Decryption with matching key                       │
│    └─ Zero-Trust Handshake Verification (Refuses on mismatch)│
└──────────────────────────────────────────────────────────────┘
```

---

## 🔥 Key Features

* 🎵 **LSB Audio Steganography:** Bit-level embedding inside `.wav` frames without acoustic degradation.
* 🔒 **Military-Grade Cryptography:** Fernet (AES-128 in CBC mode with HMAC-SHA256 authenticated encryption).
* 🛡️ **Two-Way Identity Handshake:** Embeds sender and receiver identities into the cryptographic payload. Unmatched identities automatically trigger a 403 authorization lockout.
* ⚡ **Web & Vercel Native:** Includes a high-performance Python serverless backend (`api/index.py`) and a responsive web frontend (`public/index.html`).
* 🎧 **Built-in Waveform Player:** Listen to and compare cover vs. steganography audio directly in the browser or app.
* 🧪 **Synthetic Audio Generator:** Generates 3-second 440Hz PCM WAV test tones directly in the browser with zero dependencies for rapid testing.
* 📧 **Automated Out-of-Band Key Exchange:** Desktop version automates password dispatch to recipient via Gmail SMTP.

---

## 📁 Repository Structure

```text
Advanced-Audio-Steganography/
├── api/
│   └── index.py            # Vercel Serverless Python Backend (Flask API)
├── public/
│   ├── index.html          # Sleek Glassmorphic Web UI
│   ├── style.css           # Modern Cyberpunk Dark Theme Styles
│   ├── app.js              # Web Audio Engine, Drag-and-Drop, API Client
│   └── lock_key.png        # Application Logo
├── main.py                 # Desktop GUI Application (Tkinter)
├── audio_steganography.py  # Standalone Desktop Script
├── Internship_Report_Audio_Steganography.md # Academic Internship Report
├── vercel.json             # Vercel Cloud Serverless & Routing Configuration
├── requirements.txt        # Python Dependencies
├── .gitignore              # Git Ignore Rules
└── README.md               # Documentation
```

---

## ☁️ Production Deployment (Vercel)

The cloud application is deployed and live in production:
👉 **[https://advanced-audio-steganography.vercel.app](https://advanced-audio-steganography.vercel.app)**

### Continuous Deployment via Git
Any commit pushed to the `main` branch of this repository automatically triggers a zero-downtime production deployment on Vercel.

### Deploying Your Own Instance
1. Go to [vercel.com/new](https://vercel.com/new).
2. Import the `Advanced-Audio-Steganography` repository.
3. Leave build settings as default (Vercel automatically detects `vercel.json` and `api/index.py`).
4. Click **Deploy**. Your system is live in seconds!

### Option 2: Deploy via Vercel CLI
```bash
# Install Vercel CLI globally
npm i -g vercel

# Deploy to preview
vercel

# Deploy directly to production
vercel --prod
```

---

## 🖥️ Running Locally

### 1. Web Version (Local Development)
```bash
# Clone repository
git clone https://github.com/ananTripathi-future/Advanced-Audio-Steganography.git
cd Advanced-Audio-Steganography

# Install dependencies
pip install -r requirements.txt

# Start backend server
python api/index.py
```
Open `http://127.0.0.1:5000` or open `public/index.html` in your browser.

### 2. Desktop Version (Tkinter GUI)
```bash
python main.py
```

---

## 🌐 API Reference

### `POST /api/embed`
Embeds an encrypted secret into a cover audio file.
* **Content-Type:** `multipart/form-data`
* **Parameters:**
  * `audio`: Cover `.wav` audio file
  * `message`: Secret text message
  * `password`: Encryption password
  * `sender`: Sender Gmail address
  * `receiver`: Receiver Gmail address
* **Response:** Returns the stego `.wav` audio file for direct download.

### `POST /api/extract`
Extracts and decrypts the hidden secret from an encoded audio file.
* **Content-Type:** `multipart/form-data`
* **Parameters:**
  * `audio`: Encoded `.wav` audio file
  * `password`: Decryption password
  * `sender`: Verified Sender Gmail
  * `receiver`: Verified Receiver Gmail
* **Response:**
  ```json
  {
    "success": true,
    "message": "Your secret message",
    "sender": "sender@gmail.com",
    "receiver": "receiver@gmail.com",
    "handshake_verified": true,
    "status": "Two-way handshake verified! Secure access granted."
  }
  ```

### `GET /api/health`
Returns system status, cryptographic specifications, and API version.

---

## 👨‍💻 Developer & Organization

* **Developer:** **Anant Tripathi**
* **Employee ID:** `ST#IS#8964`
* **Email:** [omanant.tripathi@gmail.com](mailto:omanant.tripathi@gmail.com)
* **GitHub:** [@ananTripathi-future](https://github.com/ananTripathi-future)
* **Organization:** **Supraja Technologies**
* **Domain:** Cyber Security Internship

---

## 📝 License
This project is open-source and intended for cybersecurity research and educational purposes.
