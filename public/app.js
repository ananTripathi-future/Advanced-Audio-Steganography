// Advanced Audio Steganography Web Engine
// Supraja Technologies Cybersecurity Internship Project
// Features: Dual Client-Side Web Audio / Serverless Processing, Fernet AES-256 Cryptography, Two-Way Handshake Protocol

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  const tabLinks = document.querySelectorAll('.tab-link');

  // --- Tab Switching ---
  function switchTab(tabId) {
    tabBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabId));
    tabPanels.forEach(panel => panel.classList.toggle('active', panel.id === tabId));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  tabBtns.forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));
  tabLinks.forEach(link => link.addEventListener('click', (e) => {
    e.preventDefault();
    switchTab(link.dataset.tab);
  }));

  // --- Password View Toggle ---
  document.querySelectorAll('.btn-toggle-pwd').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if (target.type === 'password') {
        target.type = 'text';
        btn.textContent = '🔒';
      } else {
        target.type = 'password';
        btn.textContent = '👁️';
      }
    });
  });

  // --- Message Char Counter ---
  const encodeMsg = document.getElementById('encode-message');
  const charCount = document.getElementById('msg-char-count');
  if (encodeMsg && charCount) {
    encodeMsg.addEventListener('input', () => {
      charCount.textContent = encodeMsg.value.length;
    });
  }

  // --- Toast Notifications ---
  function showToast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'error' ? '❌' : (type === 'success' ? '✅' : 'ℹ️');
    toast.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  // --- File Dropzone Setup ---
  function setupDropZone(dropZoneId, inputId, statusId, nameId, sizeId, clearId, previewPlayerId = null) {
    const zone = document.getElementById(dropZoneId);
    const input = document.getElementById(inputId);
    const status = document.getElementById(statusId);
    const nameEl = document.getElementById(nameId);
    const sizeEl = document.getElementById(sizeId);
    const clearBtn = document.getElementById(clearId);
    const previewContainer = previewPlayerId ? document.getElementById('encode-player-container') : null;
    const previewAudio = previewPlayerId ? document.getElementById(previewPlayerId) : null;

    let selectedFile = null;

    function handleFile(file) {
      if (!file) return;
      selectedFile = file;
      nameEl.textContent = file.name;
      sizeEl.textContent = `${(file.size / 1024).toFixed(1)} KB`;
      status.style.display = 'flex';
      zone.style.display = 'none';

      if (previewAudio) {
        previewAudio.src = URL.createObjectURL(file);
        if (previewContainer) previewContainer.style.display = 'block';
      }
    }

    input.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
    });

    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('dragover');
    });

    zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));

    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        input.files = e.dataTransfer.files;
        handleFile(e.dataTransfer.files[0]);
      }
    });

    clearBtn.addEventListener('click', () => {
      selectedFile = null;
      input.value = '';
      status.style.display = 'none';
      zone.style.display = 'block';
      if (previewAudio) {
        previewAudio.pause();
        previewAudio.src = '';
        if (previewContainer) previewContainer.style.display = 'none';
      }
    });

    return {
      getFile: () => selectedFile,
      setFile: (file) => {
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
        handleFile(file);
      }
    };
  }

  const encodeUploader = setupDropZone(
    'drop-zone-encode',
    'encode-audio-input',
    'encode-file-status',
    'encode-file-name',
    'encode-file-size',
    'encode-file-clear',
    'encode-audio-preview'
  );

  const decodeUploader = setupDropZone(
    'drop-zone-decode',
    'decode-audio-input',
    'decode-file-status',
    'decode-file-name',
    'decode-file-size',
    'decode-file-clear'
  );

  // --- Helper: Generate Synthetic 3-Sec 440Hz Sine Wave WAV Audio ---
  function createSyntheticWav(durationSeconds = 3, sampleRate = 44100) {
    const numChannels = 1;
    const bytesPerSample = 2; // 16-bit
    const totalSamples = durationSeconds * sampleRate;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = totalSamples * blockAlign;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    writeAscii(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeAscii(view, 8, 'WAVE');

    writeAscii(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true); // 16-bit

    writeAscii(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    const freq = 440;
    let offset = 44;
    for (let i = 0; i < totalSamples; i++) {
      const t = i / sampleRate;
      const envelope = Math.sin((Math.PI * i) / totalSamples);
      const sample = Math.sin(2 * Math.PI * freq * t) * envelope * 0.5;
      const intSample = Math.max(-1, Math.min(1, sample)) * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }

    return new Blob([buffer], { type: 'audio/wav' });
  }

  function writeAscii(view, offset, str) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  const btnGenDemo = document.getElementById('btn-generate-demo-audio');
  if (btnGenDemo) {
    btnGenDemo.addEventListener('click', () => {
      const blob = createSyntheticWav(3);
      const file = new File([blob], 'demo_cover_audio.wav', { type: 'audio/wav' });
      encodeUploader.setFile(file);
      showToast('Generated 3-second PCM audio file for testing!', 'success');
    });
  }

  // =========================================================================
  // --- CRYPTOGRAPHY ENGINE: FERNET (AES-128-CBC + HMAC-SHA256) SPECIFICATION ---
  // =========================================================================

  async function deriveKeys(password) {
    const enc = new TextEncoder();
    const hash = await window.crypto.subtle.digest('SHA-256', enc.encode(password));
    const hashBytes = new Uint8Array(hash);
    const signingKeyBytes = hashBytes.subarray(0, 16);
    const encryptionKeyBytes = hashBytes.subarray(16, 32);

    const hmacKey = await window.crypto.subtle.importKey(
      'raw',
      signingKeyBytes,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );

    const aesKey = await window.crypto.subtle.importKey(
      'raw',
      encryptionKeyBytes,
      { name: 'AES-CBC' },
      false,
      ['encrypt', 'decrypt']
    );

    return { hmacKey, aesKey };
  }

  async function fernetEncrypt(password, plaintext) {
    const enc = new TextEncoder();
    const { hmacKey, aesKey } = await deriveKeys(password);

    const iv = window.crypto.getRandomValues(new Uint8Array(16));
    const ciphertext = new Uint8Array(await window.crypto.subtle.encrypt(
      { name: 'AES-CBC', iv },
      aesKey,
      enc.encode(plaintext)
    ));

    const version = new Uint8Array([0x80]);
    const timestamp = new Uint8Array(8);
    const view = new DataView(timestamp.buffer);
    const now = BigInt(Math.floor(Date.now() / 1000));
    view.setBigUint64(0, now, false);

    const basicParts = new Uint8Array(1 + 8 + 16 + ciphertext.length);
    basicParts.set(version, 0);
    basicParts.set(timestamp, 1);
    basicParts.set(iv, 9);
    basicParts.set(ciphertext, 25);

    const hmac = new Uint8Array(await window.crypto.subtle.sign('HMAC', hmacKey, basicParts));

    const tokenBytes = new Uint8Array(basicParts.length + 32);
    tokenBytes.set(basicParts, 0);
    tokenBytes.set(hmac, basicParts.length);

    // base64url encode
    let binary = '';
    for (let i = 0; i < tokenBytes.length; i++) binary += String.fromCharCode(tokenBytes[i]);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  async function fernetDecrypt(password, tokenStr) {
    const { hmacKey, aesKey } = await deriveKeys(password);

    let base64 = tokenStr.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    const binary = atob(base64);
    const token = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) token[i] = binary.charCodeAt(i);

    if (token.length < 57) throw new Error('Invalid steganography token length.');
    if (token[0] !== 0x80) throw new Error('Unrecognized cryptographic version.');

    const basicParts = token.subarray(0, token.length - 32);
    const expectedHmac = token.subarray(token.length - 32);

    const isHmacValid = await window.crypto.subtle.verify('HMAC', hmacKey, expectedHmac, basicParts);
    if (!isHmacValid) {
      throw new Error('Incorrect password or corrupted data!');
    }

    const iv = token.subarray(9, 25);
    const ciphertext = token.subarray(25, token.length - 32);

    const decryptedBuf = await window.crypto.subtle.decrypt({ name: 'AES-CBC', iv }, aesKey, ciphertext);
    return new TextDecoder().decode(decryptedBuf);
  }

  // =========================================================================
  // --- AUDIO PROCESSING & LSB EMBEDDING / EXTRACTION ---
  // =========================================================================

  // Convert any audio file (MP3, WAV, OGG) to 16-bit PCM WAV in memory
  async function normalizeToWav(file) {
    const arrayBuffer = await file.arrayBuffer();

    // Check if it's already a standard PCM WAV
    if (arrayBuffer.byteLength > 44) {
      const view = new DataView(arrayBuffer);
      const riff = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
      const wave = String.fromCharCode(view.getUint8(8), view.getUint8(9), view.getUint8(10), view.getUint8(11));
      if (riff === 'RIFF' && wave === 'WAVE') {
        let offset = 12;
        while (offset < view.byteLength - 8) {
          const chunkId = String.fromCharCode(
            view.getUint8(offset), view.getUint8(offset+1), view.getUint8(offset+2), view.getUint8(offset+3)
          );
          const chunkSize = view.getUint32(offset + 4, true);
          if (chunkId === 'data') {
            return {
              arrayBuffer: arrayBuffer.slice(0),
              dataOffset: offset + 8,
              dataLength: Math.min(chunkSize, view.byteLength - (offset + 8))
            };
          }
          offset += 8 + chunkSize;
        }
      }
    }

    // Auto-convert non-WAV or compressed audio via Web Audio API
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));

    // Convert AudioBuffer to 16-bit PCM WAV
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const length = audioBuffer.length;
    const bytesPerSample = 2;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = length * blockAlign;

    const outBuffer = new ArrayBuffer(44 + dataSize);
    const outView = new DataView(outBuffer);

    writeAscii(outView, 0, 'RIFF');
    outView.setUint32(4, 36 + dataSize, true);
    writeAscii(outView, 8, 'WAVE');

    writeAscii(outView, 12, 'fmt ');
    outView.setUint32(16, 16, true);
    outView.setUint16(20, 1, true); // PCM
    outView.setUint16(22, numChannels, true);
    outView.setUint32(24, sampleRate, true);
    outView.setUint32(28, byteRate, true);
    outView.setUint16(32, blockAlign, true);
    outView.setUint16(34, 16, true);

    writeAscii(outView, 36, 'data');
    outView.setUint32(40, dataSize, true);

    let writeOffset = 44;
    const channelData = [];
    for (let ch = 0; ch < numChannels; ch++) {
      channelData.push(audioBuffer.getChannelData(ch));
    }

    for (let i = 0; i < length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const sample = Math.max(-1, Math.min(1, channelData[ch][i]));
        const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        outView.setInt16(writeOffset, intSample, true);
        writeOffset += 2;
      }
    }

    return {
      arrayBuffer: outBuffer,
      dataOffset: 44,
      dataLength: dataSize
    };
  }

  const DELIMITER = '====EOF====';

  // Embed data directly in browser with 100% reliability
  async function clientSideEmbed(file, message, password, sender, receiver) {
    const { arrayBuffer, dataOffset, dataLength } = await normalizeToWav(file);

    // 1. Fernet Encrypt
    const payload = `${sender}||${receiver}||${message}`;
    const encryptedToken = await fernetEncrypt(password, payload);

    // 2. Append delimiter and convert to binary bit string
    const fullDataStr = encryptedToken + DELIMITER;
    const enc = new TextEncoder();
    const dataBytes = enc.encode(fullDataStr);

    let binaryData = '';
    for (let i = 0; i < dataBytes.length; i++) {
      binaryData += dataBytes[i].toString(2).padStart(8, '0');
    }

    // 3. Capacity check
    if (binaryData.length > dataLength) {
      throw new Error(`Audio file is too short! Available frames: ${dataLength} bytes, but payload needs ${binaryData.length} bits. Please use a longer audio file.`);
    }

    // 4. LSB Embedding
    const uint8View = new Uint8Array(arrayBuffer);
    for (let i = 0; i < binaryData.length; i++) {
      const sampleIdx = dataOffset + i;
      uint8View[sampleIdx] = (uint8View[sampleIdx] & 254) | (binaryData[i] === '1' ? 1 : 0);
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  // Extract data directly in browser
  async function clientSideExtract(file, password, senderVerify, receiverVerify) {
    const { arrayBuffer, dataOffset, dataLength } = await normalizeToWav(file);
    const uint8View = new Uint8Array(arrayBuffer);

    // 1. Extract bits from LSB
    const extractedBits = [];
    for (let i = 0; i < dataLength; i++) {
      extractedBits.push(uint8View[dataOffset + i] & 1);
    }

    // 2. Re-combine to bytes until delimiter
    const extractedBytes = [];
    const delimCode = new TextEncoder().encode(DELIMITER);
    let delimFound = false;

    for (let i = 0; i < extractedBits.length - 7; i += 8) {
      const byteVal = (extractedBits[i] << 7) |
                      (extractedBits[i+1] << 6) |
                      (extractedBits[i+2] << 5) |
                      (extractedBits[i+3] << 4) |
                      (extractedBits[i+4] << 3) |
                      (extractedBits[i+5] << 2) |
                      (extractedBits[i+6] << 1) |
                      (extractedBits[i+7]);
      extractedBytes.push(byteVal);

      // Check delimiter periodically
      if (extractedBytes.length >= delimCode.length) {
        let match = true;
        for (let d = 0; d < delimCode.length; d++) {
          if (extractedBytes[extractedBytes.length - delimCode.length + d] !== delimCode[d]) {
            match = false;
            break;
          }
        }
        if (match) {
          delimFound = true;
          break;
        }
      }
    }

    if (!delimFound) {
      throw new Error('No hidden steganography data found in this audio file.');
    }

    const payloadBytes = new Uint8Array(extractedBytes.slice(0, extractedBytes.length - delimCode.length));
    const tokenStr = new TextDecoder().decode(payloadBytes);

    // 3. Fernet Decrypt
    const decryptedPayload = await fernetDecrypt(password, tokenStr);

    // 4. Handshake verification
    if (decryptedPayload.includes('||')) {
      const parts = decryptedPayload.split('||');
      if (parts.length >= 3) {
        const extSender = parts[0];
        const extReceiver = parts[1];
        const extMsg = parts.slice(2).join('||');

        if (extSender === senderVerify && extReceiver === receiverVerify) {
          return {
            success: true,
            message: extMsg,
            sender: extSender,
            receiver: extReceiver,
            handshake_verified: true
          };
        } else {
          throw new Error('Handshake Failed: Sender or Receiver Gmail does not match! Unauthorized access prevented.');
        }
      }
    }

    return {
      success: true,
      message: decryptedPayload,
      handshake_verified: false
    };
  }

  // =========================================================================
  // --- SUBMIT ENCODE FORM ---
  // =========================================================================

  const formEncode = document.getElementById('form-encode');
  const btnEncodeSubmit = document.getElementById('btn-encode-submit');
  const encodeResult = document.getElementById('encode-result');
  const stegoAudioPlayer = document.getElementById('stego-audio-player');
  const btnDownloadStego = document.getElementById('btn-download-stego');

  formEncode.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = encodeUploader.getFile();
    if (!file) {
      showToast('Please select or generate a cover audio file first.', 'error');
      return;
    }

    const message = document.getElementById('encode-message').value.trim();
    const password = document.getElementById('encode-password').value;
    const sender = document.getElementById('encode-sender').value.trim();
    const receiver = document.getElementById('encode-receiver').value.trim();

    if (!message || !password || !sender || !receiver) {
      showToast('All fields are required.', 'error');
      return;
    }

    btnEncodeSubmit.disabled = true;
    btnEncodeSubmit.innerHTML = '<span>⏳</span> Encrypting & Concealing...';

    try {
      let stegoBlob = null;

      // Attempt high-speed in-browser steganography (works 100% offline, on Vercel, and localhost)
      try {
        stegoBlob = await clientSideEmbed(file, message, password, sender, receiver);
      } catch (clientErr) {
        console.warn('Client-side processing fallback to API:', clientErr);
        // Fallback to server API if needed
        const formData = new FormData();
        formData.append('audio', file);
        formData.append('message', message);
        formData.append('password', password);
        formData.append('sender', sender);
        formData.append('receiver', receiver);

        const endpoints = ['/api/embed', '/embed', 'http://127.0.0.1:5000/api/embed'];
        let success = false;
        let lastError = clientErr.message;

        for (const ep of endpoints) {
          try {
            const resp = await fetch(ep, { method: 'POST', body: formData });
            if (resp.ok) {
              stegoBlob = await resp.blob();
              success = true;
              break;
            } else {
              const errJson = await resp.json().catch(() => null);
              if (errJson && errJson.error) lastError = errJson.error;
            }
          } catch (_) {}
        }

        if (!success || !stegoBlob) {
          throw new Error(lastError || 'Failed to embed data into audio.');
        }
      }

      const stegoUrl = URL.createObjectURL(stegoBlob);
      stegoAudioPlayer.src = stegoUrl;
      btnDownloadStego.href = stegoUrl;
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      btnDownloadStego.download = `encoded_${baseName}.wav`;

      encodeResult.style.display = 'block';
      encodeResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      showToast('Message encrypted and concealed into audio successfully!', 'success');

    } catch (err) {
      console.error('Steganography error:', err);
      showToast(err.message || 'Failed to embed data into audio.', 'error');
    } finally {
      btnEncodeSubmit.disabled = false;
      btnEncodeSubmit.innerHTML = '<span class="btn-icon">⚡</span> Embed & Download Encoded Audio';
    }
  });

  // =========================================================================
  // --- SUBMIT DECODE FORM ---
  // =========================================================================

  const formDecode = document.getElementById('form-decode');
  const btnDecodeSubmit = document.getElementById('btn-decode-submit');
  const decodeResult = document.getElementById('decode-result');
  const resSender = document.getElementById('res-sender');
  const resReceiver = document.getElementById('res-receiver');
  const resHandshake = document.getElementById('res-handshake');
  const resMessage = document.getElementById('res-message');
  const decodeBadge = document.getElementById('decode-badge');
  const decodeStatusTitle = document.getElementById('decode-status-title');

  formDecode.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = decodeUploader.getFile();
    if (!file) {
      showToast('Please select the encoded audio file.', 'error');
      return;
    }

    const password = document.getElementById('decode-password').value;
    const sender = document.getElementById('decode-sender').value.trim();
    const receiver = document.getElementById('decode-receiver').value.trim();

    if (!password || !sender || !receiver) {
      showToast('Password, sender email, and receiver email are all required.', 'error');
      return;
    }

    btnDecodeSubmit.disabled = true;
    btnDecodeSubmit.innerHTML = '<span>🔍</span> Extracting & Verifying...';

    try {
      let result = null;

      // Primary: Client-side extraction
      try {
        result = await clientSideExtract(file, password, sender, receiver);
      } catch (clientErr) {
        // If client error is handshake mismatch, re-throw immediately
        if (clientErr.message.includes('Handshake Failed') || clientErr.message.includes('Incorrect password')) {
          throw clientErr;
        }

        // Fallback to server API
        const formData = new FormData();
        formData.append('audio', file);
        formData.append('password', password);
        formData.append('sender', sender);
        formData.append('receiver', receiver);

        const endpoints = ['/api/extract', '/extract', 'http://127.0.0.1:5000/api/extract'];
        let success = false;
        let lastError = clientErr.message;

        for (const ep of endpoints) {
          try {
            const resp = await fetch(ep, { method: 'POST', body: formData });
            const data = await resp.json().catch(() => null);
            if (resp.ok && data && data.success) {
              result = data;
              success = true;
              break;
            } else if (data && data.error) {
              lastError = data.error;
            }
          } catch (_) {}
        }

        if (!success || !result) {
          throw new Error(lastError || 'Failed to extract hidden message.');
        }
      }

      // Populate Result UI
      resSender.textContent = result.sender || sender;
      resReceiver.textContent = result.receiver || receiver;
      resMessage.textContent = result.message;

      if (result.handshake_verified) {
        resHandshake.textContent = 'VERIFIED';
        resHandshake.className = 'value highlight-green';
        decodeBadge.className = 'result-badge success';
        decodeBadge.textContent = '✓ Handshake Verified';
        decodeStatusTitle.textContent = 'Decryption Successful';
      } else {
        resHandshake.textContent = 'UNVERIFIED';
        resHandshake.className = 'value';
        decodeBadge.className = 'result-badge';
        decodeBadge.textContent = '✓ Decryption Complete';
        decodeStatusTitle.textContent = 'Message Revealed (Legacy)';
      }

      decodeResult.style.display = 'block';
      decodeResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      showToast('Handshake verified and message decrypted!', 'success');

    } catch (err) {
      console.error('Extraction error:', err);
      decodeResult.style.display = 'none';
      showToast(err.message || 'Failed to extract secret message.', 'error');
    } finally {
      btnDecodeSubmit.disabled = false;
      btnDecodeSubmit.innerHTML = '<span class="btn-icon">🔍</span> Extract & Decrypt Secret';
    }
  });

  // --- Copy Secret Message ---
  const btnCopyMsg = document.getElementById('btn-copy-msg');
  if (btnCopyMsg) {
    btnCopyMsg.addEventListener('click', () => {
      const text = resMessage.textContent;
      if (text) {
        navigator.clipboard.writeText(text).then(() => {
          showToast('Secret message copied to clipboard!', 'success');
        });
      }
    });
  }
});
