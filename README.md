<!-- Badges Row 1 — Core Tech -->
<p align="center">
  <img src="https://img.shields.io/badge/Steganography-LSB-8b5cf6?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Encryption-AES--256-3b82f6?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Python-3.x-06b6d4?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/GUI-Tkinter-10b981?style=for-the-badge"/>
</p>

<!-- Badges Row 2 — GitHub Stats -->
<p align="center">
  <img src="https://img.shields.io/github/stars/ananTripathi-future/audio-steganography?style=for-the-badge"/>
  <img src="https://img.shields.io/github/forks/ananTripathi-future/audio-steganography?style=for-the-badge"/>
  <img src="https://img.shields.io/github/issues/ananTripathi-future/audio-steganography?style=for-the-badge"/>
  <img src="https://img.shields.io/github/license/ananTripathi-future/audio-steganography?style=for-the-badge"/>
</p>

<!-- Badges Row 3 — Activity -->
<p align="center">
  <img src="https://img.shields.io/github/last-commit/ananTripathi-future/audio-steganography?style=for-the-badge"/>
  <img src="https://img.shields.io/github/repo-size/ananTripathi-future/audio-steganography?style=for-the-badge"/>
  <img src="https://img.shields.io/github/languages/top/ananTripathi-future/audio-steganography?style=for-the-badge"/>
</p>

---

# 🎧 Advanced Audio Steganography System

> *"Traditional encryption protects data but exposes its presence. This system makes your secrets invisible — and undetectable."*

A secure Python application that hides AES-encrypted messages inside audio files using LSB steganography — combining cryptographic strength with plausible deniability.

---

## 🔐 Overview

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Encryption | AES-256 (Fernet) | Message confidentiality |
| Steganography | LSB in WAV | Invisible data embedding |
| Key Exchange | SMTP Email | Secure password delivery |
| Authentication | SHA-256 Hashing | Identity verification |
| Interface | Tkinter GUI | User-friendly interaction |

---

## 🏗️ Architecture — The Dual Layer

┌─────────────────────────────────────────┐
│       AUDIO STEGANOGRAPHY SYSTEM         │
│                                          │
Secret Msg ──►│  Layer 1: AES Encryption (Fernet)       │
│    ├─ Password-based key derivation      │
│    └─ AES-256 ciphertext output          │
│                                          │
Cover Audio ──►│  Layer 2: LSB Steganography            │
│    ├─ Binary encode ciphertext           │
│    └─ Embed in WAV sample LSBs           │
│                                          │
Recipients ──►│  Layer 3: Secure Key Delivery           │
│    ├─ SMTP email with password           │
│    └─ SHA-256 identity verification      │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │  MP3 → WAV Auto-Conversion        │   │
│  │  Tkinter GUI (Encode / Decode)    │   │
│  │  Sender & Receiver Authentication │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘


---

## 🔥 Features

| Feature | Description |
|---------|-------------|
| 🎵 LSB Steganography | Hides messages inside `.wav` audio samples |
| 🔒 AES-256 Encryption | Fernet symmetric encryption before embedding |
| 📧 Email Key Sharing | Password delivered via SMTP automatically |
| 👤 Identity Verification | SHA-256 based sender/receiver authentication |
| 🖥️ Tkinter GUI | Clean graphical interface — no CLI needed |
| 🔄 MP3 Support | Auto-converts `.mp3` → `.wav` via pydub |

---

## 🧠 How It Works

### 🔽 Encoding Process
[Secret Message] + [Password] + [Emails]
│
▼
AES-256 Encrypt (Fernet)
│
▼
Convert to Binary
│
▼
Embed in Audio LSBs
│
▼
[Stego Audio File] ──► Send password via Email


### 🔼 Decoding Process
[Stego Audio File] + [Password]
│
▼
Extract Binary from LSBs
│
▼
AES-256 Decrypt
│
▼
SHA-256 Identity Verify
│
▼
[Original Secret Message]


---

## 📁 Project Structure
audio-steganography/
├── main.py                  # Entry point — launches GUI
├── encoder.py               # LSB embedding engine
├── decoder.py               # LSB extraction engine
├── encryption.py            # AES-256 (Fernet) encrypt/decrypt
├── email_sender.py          # SMTP key delivery
├── utils/                   # Helper functions
├── assets/                  # Icons, sample audio files
├── requirements.txt
└── README.md


---

## ⚙️ Installation

```bash
git clone https://github.com/ananTripathi-future/audio-steganography.git
cd audio-steganography
pip install -r requirements.txt
```

---

## ▶️ Usage

```bash
python main.py
```

**Steps:**
1. Choose **Encode** or **Decode** mode
2. Upload your audio file (`.wav` or `.mp3`)
3. Enter message, password, and recipient email
4. Click **Process**
5. Retrieve your stego audio or decoded message

---

## 🔒 Security Layers

| Mechanism | Implementation | Threat Mitigated |
|-----------|---------------|-----------------|
| AES-256 Encryption | Fernet symmetric cipher | Plaintext interception |
| LSB Steganography | Bit-level audio embedding | Detection of hidden data |
| SHA-256 Hashing | Identity fingerprinting | Sender/receiver spoofing |
| Email Key Exchange | SMTP delivery | Out-of-band key compromise |
| Identity Verification | Pre-shared identity hash | Unauthorized decoding |

---

## 📊 Applications

- 🔐 **Secure Communication** — Send covert messages through audio files
- 🪖 **Military / Intelligence** — Classified data with plausible deniability
- 📁 **Confidential Data Sharing** — Corporate or legal sensitive content
- 🧪 **Cybersecurity Research** — Steganography detection and analysis

---

## ⚠️ Limitations

- Optimized for `.wav` format (`.mp3` auto-converted, quality may vary)
- Very large messages noticeably increase output file size
- Correct password required — no recovery mechanism
- Stego audio should not be re-encoded or compressed post-embedding

---

## 🔮 Future Roadmap

- 🎥 **Video Steganography** — Extend LSB hiding to video frames
- ☁️ **Cloud Integration** — Store and share stego files via cloud APIs
- 🤖 **AI Detection Resistance** — Adversarial embedding against steganalysis
- 📱 **Mobile App** — Android/iOS interface for on-device use

---

## 👨‍💻 Contributor

**Anant Tripathi**
- GitHub: [@ananTripathi-future](https://github.com/ananTripathi-future)

---

## ⭐ Support

If this project helped you:

- ⭐ **Star** the repository
- 🍴 **Fork** it and build on top
- 🧠 **Contribute** via pull requests
- 🐛 **Report issues** in the Issues tab

---

## 📝 License

This project is provided for educational and research purposes.
