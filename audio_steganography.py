import tkinter as tk
from tkinter import messagebox
from tkinter import filedialog
import os
import subprocess
from importlib.metadata import version, PackageNotFoundError
import webbrowser
import threading
import wave

# Add ffmpeg to PATH before importing pydub (installed via winget)
_ffmpeg_dir = os.path.join(
    os.path.expanduser("~"),
    "AppData", "Local", "Microsoft", "WinGet", "Packages",
    "Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe",
    "ffmpeg-8.1-full_build", "bin"
)
if os.path.isdir(_ffmpeg_dir):
    os.environ["PATH"] = _ffmpeg_dir + os.pathsep + os.environ.get("PATH", "")

from pydub import AudioSegment
import base64
from PIL import Image, ImageTk
from tkinter import Tk, PhotoImage
import io
import tempfile
import sys
from cryptography.fernet import Fernet, InvalidToken
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from email.mime.audio import MIMEAudio
import re
import hashlib

def generate_key_from_password(password: str) -> bytes:
    hashed_password = hashlib.sha256(password.encode()).digest()
    return base64.urlsafe_b64encode(hashed_password)

def convert_mp3_to_wav(mp3_path: str) -> str:
    """Convert an MP3 file to a temporary WAV file. Returns the WAV file path."""
    wav_path = os.path.join(tempfile.gettempdir(), "steg_temp_audio.wav")
    audio = AudioSegment.from_mp3(mp3_path)
    audio.export(wav_path, format="wav")
    return wav_path

class SteganoApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Advanced Audio Steganography System")
        self.root.geometry("600x550")
        self.root.configure(bg="#1E1E1E")
        self.root.resizable(False, False)

        # Style configurations
        self.bg_color = "#1E1E1E"
        self.fg_color = "#E0E0E0"
        self.btn_color = "#3A8DFF"
        self.btn_hover = "#1C6BE6"
        self.entry_bg = "#333333"
        self.font_main = ("Helvetica", 12)
        self.font_title = ("Helvetica", 20, "bold")

        self.audio_file_path = None
        
        self.create_main_menu()

    def clear_frame(self):
        for widget in self.root.winfo_children():
            widget.destroy()

    def create_main_menu(self):
        self.clear_frame()
        
        # Load and display lock & key image
        try:
            img_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "lock_key.png")
            pil_img = Image.open(img_path).resize((180, 180), Image.LANCZOS)
            self.main_img = ImageTk.PhotoImage(pil_img)
            tk.Label(self.root, image=self.main_img, bg=self.bg_color).pack(pady=(20, 5))
        except Exception:
            pass
        
        title_lbl = tk.Label(self.root, text="Audio Steganography", bg=self.bg_color, fg=self.fg_color, font=self.font_title)
        title_lbl.pack(pady=(5, 20))

        btn_frame = tk.Frame(self.root, bg=self.bg_color)
        btn_frame.pack(pady=10)

        self.create_button(btn_frame, "Hide Text", self.show_hide_screen).pack(pady=10)
        self.create_button(btn_frame, "Extract Image", self.show_extract_screen).pack(pady=10)
        self.create_button(btn_frame, "Project Info", self.show_project_info).pack(pady=10)
        self.create_button(btn_frame, "Exit", self.root.quit).pack(pady=10)

    def create_button(self, parent, text, command):
        btn = tk.Button(parent, text=text, bg=self.btn_color, fg="white", font=self.font_main,
                        width=25, relief=tk.FLAT, activebackground=self.btn_hover, activeforeground="white", cursor="hand2", command=command)
        return btn

    def show_hide_screen(self):
        self.clear_frame()
        self.audio_file_path = None
        
        tk.Button(self.root, text="< Back", bg=self.bg_color, fg=self.fg_color, font=("Helvetica", 10),
                  relief=tk.FLAT, activebackground=self.bg_color, activeforeground=self.btn_color,
                  command=self.create_main_menu, cursor="hand2").pack(anchor="nw", padx=10, pady=10)
        
        tk.Label(self.root, text="Hide Data in Audio", bg=self.bg_color, fg=self.fg_color, font=self.font_title).pack(pady=10)

        frame = tk.Frame(self.root, bg=self.bg_color)
        frame.pack(pady=10)

        tk.Label(frame, text="1. Select Cover Audio (.wav):", bg=self.bg_color, fg=self.fg_color, font=self.font_main).grid(row=0, column=0, sticky="w", pady=5)
        self.lbl_audio = tk.Label(frame, text="No file selected", bg=self.bg_color, fg="#888888", font=("Helvetica", 10), width=25, anchor="w")
        self.lbl_audio.grid(row=0, column=1, padx=10, pady=5)
        tk.Button(frame, text="Browse", bg="#555555", fg="white", font=("Helvetica", 10), relief=tk.FLAT, command=self.browse_audio).grid(row=0, column=2, pady=5)

        tk.Label(frame, text="2. Secret Message:", bg=self.bg_color, fg=self.fg_color, font=self.font_main).grid(row=1, column=0, sticky="nw", pady=10)
        self.txt_msg = tk.Text(frame, height=4, width=30, bg=self.entry_bg, fg=self.fg_color, font=self.font_main, insertbackground="white")
        self.txt_msg.grid(row=1, column=1, columnspan=2, padx=10, pady=10)

        tk.Label(frame, text="3. Secure Password:", bg=self.bg_color, fg=self.fg_color, font=self.font_main).grid(row=2, column=0, sticky="w", pady=5)
        # Entry in hidden mode using show parameter
        self.ent_pwd = tk.Entry(frame, show="*", bg=self.entry_bg, fg=self.fg_color, font=self.font_main, width=30, insertbackground="white")
        self.ent_pwd.grid(row=2, column=1, columnspan=2, padx=10, pady=5)
        
        tk.Label(frame, text="4. Sender Gmail:", bg=self.bg_color, fg=self.fg_color, font=self.font_main).grid(row=3, column=0, sticky="w", pady=5)
        self.ent_sender = tk.Entry(frame, bg=self.entry_bg, fg=self.fg_color, font=self.font_main, width=30, insertbackground="white")
        self.ent_sender.grid(row=3, column=1, columnspan=2, padx=10, pady=5)

        tk.Label(frame, text="5. Receiver Gmail:", bg=self.bg_color, fg=self.fg_color, font=self.font_main).grid(row=4, column=0, sticky="w", pady=5)
        self.ent_receiver = tk.Entry(frame, bg=self.entry_bg, fg=self.fg_color, font=self.font_main, width=30, insertbackground="white")
        self.ent_receiver.grid(row=4, column=1, columnspan=2, padx=10, pady=5)

        tk.Label(frame, text="6. Sender App Password:", bg=self.bg_color, fg=self.fg_color, font=self.font_main).grid(row=5, column=0, sticky="w", pady=5)
        self.ent_app_pwd = tk.Entry(frame, show="*", bg=self.entry_bg, fg=self.fg_color, font=self.font_main, width=30, insertbackground="white")
        self.ent_app_pwd.grid(row=5, column=1, columnspan=2, padx=10, pady=5)

        self.create_button(self.root, "Embed & Save File", self.embed_data).pack(pady=20)

    def show_extract_screen(self):
        self.clear_frame()
        self.audio_file_path = None
        
        tk.Button(self.root, text="< Back", bg=self.bg_color, fg=self.fg_color, font=("Helvetica", 10),
                  relief=tk.FLAT, activebackground=self.bg_color, activeforeground=self.btn_color,
                  command=self.create_main_menu, cursor="hand2").pack(anchor="nw", padx=10, pady=10)
        
        tk.Label(self.root, text="Extract Hidden Data", bg=self.bg_color, fg=self.fg_color, font=self.font_title).pack(pady=10)

        frame = tk.Frame(self.root, bg=self.bg_color)
        frame.pack(pady=10)

        tk.Label(frame, text="1. Select Encoded Audio (.wav):", bg=self.bg_color, fg=self.fg_color, font=self.font_main).grid(row=0, column=0, sticky="w", pady=10)
        self.lbl_audio = tk.Label(frame, text="No file selected", bg=self.bg_color, fg="#888888", font=("Helvetica", 10), width=25, anchor="w")
        self.lbl_audio.grid(row=0, column=1, padx=10, pady=10)
        tk.Button(frame, text="Browse", bg="#555555", fg="white", font=("Helvetica", 10), relief=tk.FLAT, command=self.browse_audio).grid(row=0, column=2, pady=10)

        tk.Label(frame, text="2. Secret Password:", bg=self.bg_color, fg=self.fg_color, font=self.font_main).grid(row=1, column=0, sticky="w", pady=10)
        self.ent_pwd = tk.Entry(frame, show="*", bg=self.entry_bg, fg=self.fg_color, font=self.font_main, width=30, insertbackground="white")
        self.ent_pwd.grid(row=1, column=1, columnspan=2, padx=10, pady=10)

        tk.Label(frame, text="3. Verify Sender Gmail:", bg=self.bg_color, fg=self.fg_color, font=self.font_main).grid(row=2, column=0, sticky="w", pady=10)
        self.ent_sender_verify = tk.Entry(frame, bg=self.entry_bg, fg=self.fg_color, font=self.font_main, width=30, insertbackground="white")
        self.ent_sender_verify.grid(row=2, column=1, columnspan=2, padx=10, pady=10)

        tk.Label(frame, text="4. Verify Receiver Gmail:", bg=self.bg_color, fg=self.fg_color, font=self.font_main).grid(row=3, column=0, sticky="w", pady=10)
        self.ent_receiver_verify = tk.Entry(frame, bg=self.entry_bg, fg=self.fg_color, font=self.font_main, width=30, insertbackground="white")
        self.ent_receiver_verify.grid(row=3, column=1, columnspan=2, padx=10, pady=10)

        self.create_button(self.root, "Extract & Decrypt", self.extract_data).pack(pady=10)
        
        tk.Label(self.root, text="Extracted Final Message:", bg=self.bg_color, fg=self.fg_color, font=self.font_main).pack(anchor="w", padx=50)
        self.txt_output = tk.Text(self.root, height=3, width=50, bg=self.entry_bg, fg=self.fg_color, font=self.font_main, state=tk.DISABLED, insertbackground="white")
        self.txt_output.pack(pady=5)

    def browse_audio(self):
        path = filedialog.askopenfilename(filetypes=[("Audio Files", "*.wav *.mp3"), ("WAV Files", "*.wav"), ("MP3 Files", "*.mp3")])
        if path:
            self.audio_file_path = path
            self.lbl_audio.config(text=os.path.basename(path))

    def embed_data(self):
        if not self.audio_file_path:
            messagebox.showerror("Error", "Please select an audio file.")
            return
            
        msg = self.txt_msg.get("1.0", tk.END).strip()
        pwd = self.ent_pwd.get()
        sender = self.ent_sender.get().strip()
        receiver = self.ent_receiver.get().strip()
        app_pwd = self.ent_app_pwd.get().strip()
        if not msg or not pwd or not sender or not receiver or not app_pwd:
            messagebox.showerror("Error", "Message, password, sender/receiver details, and App Password are all required.")
            return
            
        out_folder = filedialog.askdirectory(title="Select Folder to Save Encoded Audio")
        if not out_folder:
            return
        original_name = os.path.splitext(os.path.basename(self.audio_file_path))[0]
        out_path = os.path.join(out_folder, f"encoded_{original_name}.wav")
            

        def run_embed():
            try:
                # 0. Convert MP3 to WAV if needed
                audio_path = self.audio_file_path
                if audio_path.lower().endswith('.mp3'):
                    self.root.after(0, lambda: self.root.title("Converting MP3 to WAV..."))
                    audio_path = convert_mp3_to_wav(audio_path)
                    self.root.after(0, lambda: self.root.title("Advanced Audio Steganography System"))
                
                # 1. Encrypt message using Fernet and derived hash key
                key = generate_key_from_password(pwd)
                f = Fernet(key)
                
                # Handshake payload
                payload = f"{sender}||{receiver}||{msg}"
                encrypted_msg = f.encrypt(payload.encode())
                
                # 2. Append EOF delimiter and convert to binary
                delimiter = b"====EOF===="
                data_to_hide = encrypted_msg + delimiter
                
                binary_data = ''.join(format(byte, '08b') for byte in data_to_hide)
                
                # 3. Handle Cover File (readframes)
                with wave.open(audio_path, 'rb') as song:
                    params = song.getparams()
                    frames = bytearray(list(song.readframes(song.getnframes())))
                    
                if len(binary_data) > len(frames):
                    self.root.after(0, lambda: messagebox.showerror("Size Error", "Audio file is too small!"))
                    return
                    
                # 4. Inject bit inside Audio frames (LSB Steganography)
                for i in range(len(binary_data)):
                    frames[i] = (frames[i] & 254) | int(binary_data[i])
                    
                # 5. Output file
                with wave.open(out_path, 'wb') as fd:
                    fd.setparams(params)
                    fd.writeframes(bytes(frames))
                    
                self.root.after(0, lambda: messagebox.showinfo("Success", f"Message securely encoded into {os.path.basename(out_path)}"))
                if sys.platform == "win32":
                    subprocess.Popen(['explorer', '/select,', os.path.normpath(out_path)])
                    
                # Send the password to receiver automatically
                if receiver and re.match(r"[^@]+@[^@]+\.[^@]+", receiver):
                    self.background_send_email(to_email=receiver, decryption_pwd=pwd, sender_email=sender, app_password=app_pwd)

            except Exception as e:
                self.root.after(0, lambda: messagebox.showerror("Error", str(e)))
                
        # Non-blocking Thread
        threading.Thread(target=run_embed, daemon=True).start()

    def background_send_email(self, to_email, decryption_pwd, sender_email, app_password):
        def _send():
            try:
                print(f"[Email] Attempting to connect to Gmail SMTP for '{sender_email}'...")
                msg = MIMEMultipart()
                msg['From'] = sender_email
                msg['To'] = to_email
                msg['Subject'] = "Audio Steganography - Secure Handshake & Decryption Key"

                body = f"""Hello,

You have received an encoded audio file via the Audio Steganography System.

To decrypt the hidden message and securely verify the handshake, use this exact password:
{decryption_pwd}

Verification Identity Details:
Sender Gmail: {sender_email}
Receiver Gmail: {to_email}

Steps to Extract:
1. Open the Audio Steganography app
2. Click "Extract Image" (or Extract Audio depending on menu)
3. Select the attached encoded .wav file
4. Enter the password above
5. Enter {sender_email} into the 'Verify Sender Gmail' field
6. Enter {to_email} into the 'Verify Receiver Gmail' field
7. Click "Extract & Decrypt"

- Sent securely via Audio Steganography System
"""
                msg.attach(MIMEText(body, 'plain'))

                # Connect to Gmail SMTP
                server = smtplib.SMTP('smtp.gmail.com', 587)
                server.set_debuglevel(1)  # Enables print output of SMTP flow
                server.starttls()
                server.login(sender_email, app_password)
                server.send_message(msg)
                server.quit()
                print(f"[Email] Successfully sent email from {sender_email} to {to_email}")

                self.root.after(0, lambda: messagebox.showinfo("Email Sent", f"Password securely sent to {to_email}!"))
            except smtplib.SMTPAuthenticationError as auth_err:
                print(f"[Email Error] Authentication Failed: {auth_err}")
                self.root.after(0, lambda: messagebox.showerror("Email Error",
                    "Gmail authentication failed.\n\n"
                    "Google no longer allows normal passwords. You MUST use a 16-letter 'App Password'!\n"
                    "1. Go to your Google Account (Security)\n"
                    "2. Enable 2-Step Verification\n"
                    "3. Create an 'App Password'\n"
                    "4. Paste that 16-letter code into the 'Sender App Password' field."))
            except Exception as e:
                print(f"[Email Error] Uncaught failure: {e}")
                self.root.after(0, lambda err=str(e): messagebox.showerror("Email Error", f"Failed to send email:\n{err}"))

        threading.Thread(target=_send, daemon=True).start()

    def extract_data(self):
        if not self.audio_file_path:
            messagebox.showerror("Error", "Please select an audio file.")
            return
            
        pwd = self.ent_pwd.get()
        sender_verify = self.ent_sender_verify.get().strip()
        receiver_verify = self.ent_receiver_verify.get().strip()
        if not pwd or not sender_verify or not receiver_verify:
            messagebox.showerror("Error", "Password, sender, and receiver details are required to decrypt.")
            return
            
        self.update_output("Extracting... Please wait...")

        def run_extract():
            try:
                # Convert MP3 to WAV if needed
                audio_path = self.audio_file_path
                if audio_path.lower().endswith('.mp3'):
                    self.root.after(0, lambda: self.update_output("Converting MP3 to WAV..."))
                    audio_path = convert_mp3_to_wav(audio_path)
                    self.root.after(0, lambda: self.update_output("Extracting hidden data..."))
                
                with wave.open(audio_path, 'rb') as song:
                    frames = bytearray(list(song.readframes(song.getnframes())))
                    
                # 1. Reverse LSB Steganography to extract bits
                extracted_bits = [byte & 1 for byte in frames]
                
                # 2. Re-combine back to bytes
                extracted_bytes = bytearray()
                for i in range(0, len(extracted_bits) - 7, 8):
                    byte_val = (extracted_bits[i] << 7) | (extracted_bits[i+1] << 6) | \
                               (extracted_bits[i+2] << 5) | (extracted_bits[i+3] << 4) | \
                               (extracted_bits[i+4] << 3) | (extracted_bits[i+5] << 2) | \
                               (extracted_bits[i+6] << 1) | (extracted_bits[i+7])
                    extracted_bytes.append(byte_val)
                    
                    if i % 2048 == 0 and len(extracted_bytes) >= 11:
                        if b"====EOF====" in extracted_bytes:
                            break
                            
                delimiter = b"====EOF===="
                delim_idx = extracted_bytes.find(delimiter)
                
                if delim_idx == -1:
                    self.root.after(0, lambda: self.update_output(""))
                    self.root.after(0, lambda: messagebox.showerror("Error", "No hidden data or wrong file format."))
                    return
                    
                encrypted_data = bytes(extracted_bytes[:delim_idx])
                
                # 3. Decrypt bytes with Fernet
                key = generate_key_from_password(pwd)
                f = Fernet(key)
                
                try:
                    decrypted_payload = f.decrypt(encrypted_data).decode()
                    if "||" in decrypted_payload:
                        parts = decrypted_payload.split("||", 2)
                        if len(parts) == 3:
                            ext_sender, ext_receiver, ext_msg = parts
                            if ext_sender == sender_verify and ext_receiver == receiver_verify:
                                self.root.after(0, lambda: self.update_output(ext_msg))
                                self.root.after(0, lambda: messagebox.showinfo("Handshake Complete", "\nTwo-way handshake verified!\nSecure access granted."))
                            else:
                                self.root.after(0, lambda: self.update_output(""))
                                self.root.after(0, lambda: messagebox.showerror("Handshake Failed", "Sender or Receiver Gmail does not match!\nUnauthorized access prevented."))
                        else:
                            raise ValueError("Invalid payload structure")
                    else:
                        # Legacy support or unformatted
                        self.root.after(0, lambda: self.update_output(decrypted_payload))
                        self.root.after(0, lambda: messagebox.showinfo("Extraction Complete", "\nDecryption key matched!\nMessage revealed (No Handshake)."))
                except InvalidToken:
                    self.root.after(0, lambda: self.update_output(""))
                    self.root.after(0, lambda: messagebox.showerror("Error", "Incorrect password or corrupted data!"))
                except Exception as ex:
                    self.root.after(0, lambda: self.update_output(""))
                    self.root.after(0, lambda: messagebox.showerror("Error", "Failed to parse secure payload!"))
                    
            except Exception as e:
                self.root.after(0, lambda: self.update_output(""))
                self.root.after(0, lambda: messagebox.showerror("Process Error", str(e)))

        threading.Thread(target=run_extract, daemon=True).start()
        
    def update_output(self, text):
        self.txt_output.config(state=tk.NORMAL)
        self.txt_output.delete("1.0", tk.END)
        self.txt_output.insert(tk.END, text)
        self.txt_output.config(state=tk.DISABLED)

    def show_project_info(self):
        self.clear_frame()

        # Create a canvas with scrollbar for the info screen
        canvas = tk.Canvas(self.root, bg=self.bg_color, highlightthickness=0)
        scrollbar = tk.Scrollbar(self.root, orient="vertical", command=canvas.yview)
        scroll_frame = tk.Frame(canvas, bg=self.bg_color)

        scroll_frame.bind("<Configure>", lambda e: canvas.configure(scrollregion=canvas.bbox("all")))
        canvas.create_window((0, 0), window=scroll_frame, anchor="nw", width=580)
        canvas.configure(yscrollcommand=scrollbar.set)

        # Mouse wheel scrolling
        def _on_mousewheel(event):
            canvas.yview_scroll(int(-1 * (event.delta / 120)), "units")
        canvas.bind_all("<MouseWheel>", _on_mousewheel)

        # Back button
        tk.Button(scroll_frame, text="< Back", bg=self.bg_color, fg=self.fg_color, font=("Helvetica", 10),
                  relief=tk.FLAT, activebackground=self.bg_color, activeforeground=self.btn_color,
                  command=lambda: [canvas.unbind_all("<MouseWheel>"), self.create_main_menu()],
                  cursor="hand2").pack(anchor="nw", padx=10, pady=5)

        # Lock & key image
        try:
            img_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "lock_key.png")
            pil_img = Image.open(img_path).resize((200, 200), Image.LANCZOS)
            self.info_img = ImageTk.PhotoImage(pil_img)
            tk.Label(scroll_frame, image=self.info_img, bg=self.bg_color).pack(pady=(5, 10))
        except Exception:
            pass

        # Title
        tk.Label(scroll_frame, text="Project Information", bg=self.bg_color, fg=self.fg_color,
                 font=("Helvetica", 18, "bold")).pack(pady=(0, 5))

        # Description
        desc = ("This project was developed by Anant Tripathi as part of a "
                "Cyber Security Internship. This project is designed to Secure "
                "the Organizations in Real World from Cyber Frauds performed by Hackers.")
        tk.Label(scroll_frame, text=desc, bg=self.bg_color, fg="#BBBBBB",
                 font=("Helvetica", 10), wraplength=520, justify="center").pack(padx=20, pady=(0, 15))

        # --- Helper to create a styled table ---
        def create_table(parent, title, headers, rows, col_widths):
            # Section title
            tk.Label(parent, text=title, bg=self.bg_color, fg="#3A8DFF",
                     font=("Helvetica", 13, "bold"), anchor="w").pack(fill="x", padx=20, pady=(10, 5))

            # Separator line
            sep = tk.Frame(parent, bg="#3A8DFF", height=2)
            sep.pack(fill="x", padx=20, pady=(0, 5))

            table = tk.Frame(parent, bg="#2A2A2A")
            table.pack(fill="x", padx=20, pady=(0, 10))

            # Header row
            for j, h in enumerate(headers):
                cell = tk.Label(table, text=h, bg="#3A8DFF", fg="white",
                                font=("Helvetica", 10, "bold"), width=col_widths[j],
                                anchor="w", padx=8, pady=6)
                cell.grid(row=0, column=j, sticky="nsew", padx=1, pady=1)

            # Data rows
            for i, row in enumerate(rows):
                bg = "#2D2D2D" if i % 2 == 0 else "#333333"
                for j, val in enumerate(row):
                    cell = tk.Label(table, text=val, bg=bg, fg="#E0E0E0",
                                    font=("Helvetica", 10), width=col_widths[j],
                                    anchor="w", padx=8, pady=5)
                    cell.grid(row=i + 1, column=j, sticky="nsew", padx=1, pady=1)

        # --- Project Details Table ---
        create_table(scroll_frame, "\U0001f4cb Project Details",
                     ["Project Details", "Value"],
                     [
                         ["Project Name", "Audio Steganography using LSB"],
                         ["Project Description", "Hiding Message with Encryption\nin Audio using LSB Algorithm"],
                         ["Project Start Date", "22/03/2026"],
                         ["Project End Date", "01/04/2026"],
                         ["Project Status", "Completed"],
                     ],
                     [25, 35])

        # --- Developer Details Table ---
        create_table(scroll_frame, "\U0001f468\u200d\U0001f4bb Developer Details",
                     ["Name", "Employee ID", "Email"],
                     [
                         ["Anant Tripathi", "ST#IS#8964", "omanant.tripathi@gmail.com"],
                     ],
                     [18, 15, 28])

        # --- Company Details Table ---
        create_table(scroll_frame, "\U0001f3e2 Company Details",
                     ["Company", "Value"],
                     [
                         ["Name", "Supraja Technologies"],
                         ["Email", "contact@suprajatechnologies.com"],
                     ],
                     [25, 35])

        # Pack canvas and scrollbar
        scrollbar.pack(side="right", fill="y")
        canvas.pack(side="left", fill="both", expand=True)

if __name__ == "__main__":
    if not os.path.exists(tempfile.gettempdir()):
        os.makedirs(tempfile.gettempdir())
    root = tk.Tk()
    app = SteganoApp(root)
    root.mainloop()
