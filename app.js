// Advanced Audio Steganography Web Client
// Supraja Technologies Internship Project

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  const tabLinks = document.querySelectorAll('.tab-link');

  // Tab Switching
  function switchTab(tabId) {
    tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    tabPanels.forEach(panel => {
      panel.classList.toggle('active', panel.id === tabId);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  tabLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab(link.dataset.tab);
    });
  });

  // Password View Toggle
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

  // Message Char Counter
  const encodeMsg = document.getElementById('encode-message');
  const charCount = document.getElementById('msg-char-count');
  if (encodeMsg && charCount) {
    encodeMsg.addEventListener('input', () => {
      charCount.textContent = encodeMsg.value.length;
    });
  }

  // Toast Notification
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
    }, 4000);
  }

  // Setup Drag & Drop File Handling
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
      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
      }
    });

    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('dragover');
    });

    zone.addEventListener('dragleave', () => {
      zone.classList.remove('dragover');
    });

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

  // Helper: Generate Synthetic 3-second 440Hz Sine Wave WAV Audio in Browser
  function createSyntheticWav(durationSeconds = 3, sampleRate = 44100) {
    const numChannels = 1;
    const bytesPerSample = 2; // 16-bit
    const totalSamples = durationSeconds * sampleRate;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = totalSamples * blockAlign;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, 'WAVE');

    // fmt sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true);  // AudioFormat (1 for PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true); // BitsPerSample

    // data sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Write sine wave samples
    const freq = 440; // A4 tone
    let offset = 44;
    for (let i = 0; i < totalSamples; i++) {
      const t = i / sampleRate;
      // Gentle fade envelope to prevent clicks
      const envelope = Math.sin((Math.PI * i) / totalSamples);
      const sample = Math.sin(2 * Math.PI * freq * t) * envelope * 0.5;
      const intSample = Math.max(-1, Math.min(1, sample)) * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }

    return new Blob([buffer], { type: 'audio/wav' });
  }

  function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  // Generate Demo Audio Button
  const btnGenDemo = document.getElementById('btn-generate-demo-audio');
  if (btnGenDemo) {
    btnGenDemo.addEventListener('click', () => {
      const blob = createSyntheticWav(3);
      const file = new File([blob], 'demo_cover_audio.wav', { type: 'audio/wav' });
      encodeUploader.setFile(file);
      showToast('Generated 3-second demo PCM audio file!', 'success');
    });
  }

  // --- SUBMIT ENCODE FORM ---
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
    btnEncodeSubmit.innerHTML = '<span>⏳</span> Encrypting & Embedding...';

    try {
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('message', message);
      formData.append('password', password);
      formData.append('sender', sender);
      formData.append('receiver', receiver);

      const response = await fetch('/api/embed', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        let errMsg = 'Failed to embed data into audio.';
        try {
          const errData = await response.json();
          if (errData.error) errMsg = errData.error;
        } catch (_) {}
        throw new Error(errMsg);
      }

      const stegoBlob = await response.blob();
      const stegoUrl = URL.createObjectURL(stegoBlob);

      // Display Player and Download link
      stegoAudioPlayer.src = stegoUrl;
      btnDownloadStego.href = stegoUrl;
      btnDownloadStego.download = `encoded_${file.name.replace(/\.[^/.]+$/, "")}.wav`;

      encodeResult.style.display = 'block';
      encodeResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      showToast('Message encrypted and embedded into audio!', 'success');

    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    } finally {
      btnEncodeSubmit.disabled = false;
      btnEncodeSubmit.innerHTML = '<span class="btn-icon">⚡</span> Embed & Download Encoded Audio';
    }
  });

  // --- SUBMIT DECODE FORM ---
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
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('password', password);
      formData.append('sender', sender);
      formData.append('receiver', receiver);

      const response = await fetch('/api/extract', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to extract secret message.');
      }

      // Populate results
      resSender.textContent = data.sender || sender;
      resReceiver.textContent = data.receiver || receiver;
      resMessage.textContent = data.message;

      if (data.handshake_verified) {
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
        decodeStatusTitle.textContent = 'Message Revealed';
      }

      decodeResult.style.display = 'block';
      decodeResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      showToast('Handshake verified and message decrypted!', 'success');

    } catch (err) {
      console.error(err);
      decodeResult.style.display = 'none';
      showToast(err.message, 'error');
    } finally {
      btnDecodeSubmit.disabled = false;
      btnDecodeSubmit.innerHTML = '<span class="btn-icon">🔍</span> Extract & Decrypt Secret';
    }
  });

  // Copy Message
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
