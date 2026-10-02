import io
import wave
import hashlib
import base64
import traceback
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from cryptography.fernet import Fernet, InvalidToken

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

DELIMITER = b"====EOF===="

def generate_key_from_password(password: str) -> bytes:
    hashed_password = hashlib.sha256(password.encode()).digest()
    return base64.urlsafe_b64encode(hashed_password)

@app.route("/", methods=["GET"])
@app.route("/api", methods=["GET"])
@app.route("/api/health", methods=["GET"])
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "online",
        "service": "Advanced Audio Steganography System API",
        "developer": "Anant Tripathi",
        "organization": "Supraja Technologies",
        "algorithm": "LSB (Least Significant Bit) + AES-128 Fernet",
        "version": "1.0.0"
    })

@app.route("/api/info", methods=["GET"])
@app.route("/info", methods=["GET"])
def project_info():
    return jsonify({
        "project": {
            "name": "Audio Steganography using LSB",
            "description": "Hiding Message with Encryption in Audio using LSB Algorithm",
            "developer": "Anant Tripathi",
            "employee_id": "ST#IS#8964",
            "email": "omanant.tripathi@gmail.com",
            "company": "Supraja Technologies",
            "domain": "Cyber Security Internship",
            "status": "Completed"
        },
        "security_layers": [
            {
                "layer": 1,
                "name": "AES-256 / Fernet Cryptography",
                "purpose": "Encrypts plaintext payload using SHA-256 derived key"
            },
            {
                "layer": 2,
                "name": "Identity Handshake Protocol",
                "purpose": "Binds sender & receiver emails inside payload to prevent unauthorized decryption"
            },
            {
                "layer": 3,
                "name": "LSB Audio Steganography",
                "purpose": "Inaudibly conceals ciphertext bits in audio sample frames"
            }
        ]
    })

@app.route("/api/embed", methods=["POST", "OPTIONS"])
@app.route("/embed", methods=["POST", "OPTIONS"])
def embed():
    if request.method == "OPTIONS":
        return "", 200

    try:
        if "audio" not in request.files:
            return jsonify({"success": False, "error": "No audio file provided in request."}), 400

        audio_file = request.files["audio"]
        message = request.form.get("message", "").strip()
        password = request.form.get("password", "")
        sender = request.form.get("sender", "").strip()
        receiver = request.form.get("receiver", "").strip()

        if not message:
            return jsonify({"success": False, "error": "Secret message cannot be empty."}), 400
        if not password:
            return jsonify({"success": False, "error": "Password is required."}), 400
        if not sender or not receiver:
            return jsonify({"success": False, "error": "Both Sender and Receiver Gmail addresses are required."}), 400

        # Read audio file into memory
        audio_bytes = audio_file.read()
        if not audio_bytes:
            return jsonify({"success": False, "error": "Uploaded audio file is empty."}), 400

        # Parse WAV frames
        try:
            with wave.open(io.BytesIO(audio_bytes), "rb") as song:
                params = song.getparams()
                frames = bytearray(list(song.readframes(song.getnframes())))
        except Exception as e:
            return jsonify({
                "success": False,
                "error": f"Audio parsing error: {str(e)}. Please ensure standard uncompressed PCM WAV is provided."
            }), 400

        # 1. Encrypt message with Fernet using SHA-256 derived key
        key = generate_key_from_password(password)
        cipher = Fernet(key)
        payload = f"{sender}||{receiver}||{message}"
        encrypted_msg = cipher.encrypt(payload.encode("utf-8"))

        # 2. Append EOF delimiter and convert to binary bit string
        data_to_hide = encrypted_msg + DELIMITER
        binary_data = "".join(format(b, "08b") for b in data_to_hide)

        # 3. Check capacity
        if len(binary_data) > len(frames):
            return jsonify({
                "success": False,
                "error": f"Audio file is too short! Capacity is {len(frames) // 8} bytes, but secret payload requires {len(binary_data) // 8} bytes. Please select a longer audio file."
            }), 400

        # 4. Inject bits into LSB of audio frames
        for i in range(len(binary_data)):
            frames[i] = (frames[i] & 254) | int(binary_data[i])

        # 5. Write to output buffer
        output_buffer = io.BytesIO()
        with wave.open(output_buffer, "wb") as fd:
            fd.setparams(params)
            fd.writeframes(bytes(frames))
        output_buffer.seek(0)

        filename = audio_file.filename or "audio.wav"
        base_name = filename.rsplit(".", 1)[0]
        out_name = f"encoded_{base_name}.wav"

        return send_file(
            output_buffer,
            mimetype="audio/wav",
            as_attachment=True,
            download_name=out_name
        )

    except Exception as e:
        traceback.print_exc()
        return jsonify({"success": False, "error": f"Encoding failure: {str(e)}"}), 500

@app.route("/api/extract", methods=["POST", "OPTIONS"])
@app.route("/extract", methods=["POST", "OPTIONS"])
def extract():
    if request.method == "OPTIONS":
        return "", 200

    try:
        if "audio" not in request.files:
            return jsonify({"success": False, "error": "Missing encoded audio file."}), 400

        audio_file = request.files["audio"]
        password = request.form.get("password", "")
        sender_verify = request.form.get("sender", "").strip()
        receiver_verify = request.form.get("receiver", "").strip()

        if not password:
            return jsonify({"success": False, "error": "Password is required."}), 400
        if not sender_verify or not receiver_verify:
            return jsonify({"success": False, "error": "Verification Sender and Receiver emails are required."}), 400

        audio_bytes = audio_file.read()
        try:
            with wave.open(io.BytesIO(audio_bytes), "rb") as song:
                frames = bytearray(list(song.readframes(song.getnframes())))
        except Exception as e:
            return jsonify({"success": False, "error": f"Invalid WAV file: {str(e)}"}), 400

        # 1. Reverse LSB to extract bits
        extracted_bits = [byte & 1 for byte in frames]

        # 2. Re-combine back to bytes looking for delimiter
        extracted_bytes = bytearray()
        found_delimiter = False
        delim_idx = -1

        for i in range(0, len(extracted_bits) - 7, 8):
            byte_val = (extracted_bits[i] << 7) | (extracted_bits[i+1] << 6) | \
                       (extracted_bits[i+2] << 5) | (extracted_bits[i+3] << 4) | \
                       (extracted_bits[i+4] << 3) | (extracted_bits[i+5] << 2) | \
                       (extracted_bits[i+6] << 1) | (extracted_bits[i+7])
            extracted_bytes.append(byte_val)

            if i % 2048 == 0 and len(extracted_bytes) >= len(DELIMITER):
                delim_pos = extracted_bytes.find(DELIMITER)
                if delim_pos != -1:
                    delim_idx = delim_pos
                    found_delimiter = True
                    break

        if not found_delimiter:
            delim_idx = extracted_bytes.find(DELIMITER)
            if delim_idx != -1:
                found_delimiter = True

        if not found_delimiter:
            return jsonify({
                "success": False,
                "error": "No hidden steganography data found in this audio file."
            }), 400

        encrypted_data = bytes(extracted_bytes[:delim_idx])

        # 3. Decrypt bytes with Fernet
        key = generate_key_from_password(password)
        cipher = Fernet(key)

        try:
            decrypted_payload = cipher.decrypt(encrypted_data).decode("utf-8")
        except InvalidToken:
            return jsonify({
                "success": False,
                "error": "Decryption failed: Incorrect password or corrupted data."
            }), 401

        # 4. Identity Handshake Verification
        if "||" in decrypted_payload:
            parts = decrypted_payload.split("||", 2)
            if len(parts) == 3:
                ext_sender, ext_receiver, ext_msg = parts
                if ext_sender == sender_verify and ext_receiver == receiver_verify:
                    return jsonify({
                        "success": True,
                        "message": ext_msg,
                        "sender": ext_sender,
                        "receiver": ext_receiver,
                        "handshake_verified": True,
                        "status": "Two-way handshake verified! Secure access granted."
                    })
                else:
                    return jsonify({
                        "success": False,
                        "error": "Handshake Failed: Sender or Receiver Gmail does not match! Unauthorized access prevented.",
                        "handshake_verified": False
                    }), 403
            else:
                return jsonify({"success": False, "error": "Invalid payload format."}), 400
        else:
            return jsonify({
                "success": True,
                "message": decrypted_payload,
                "handshake_verified": False,
                "status": "Decryption key matched! Message revealed (Legacy format)."
            })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"success": False, "error": f"Extraction failure: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
