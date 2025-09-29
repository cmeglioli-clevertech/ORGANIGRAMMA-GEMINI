# -*- coding: utf-8 -*-
"""
Web Image Resizer - GUI
Riduce la risoluzione per uso web e rende le immagini grandi uguali.

Funzioni principali:
- Riduzione dimensione per lato lungo o per larghezza fissa (senza upscaling opzionale)
- Dimensione esatta (uniforme) con due modalità:
    * ADATTA (contain): mantiene proporzioni, riempie con colore di sfondo facoltativo
    * RIEMPI (cover): ritaglia per coprire esattamente larghezza x altezza
- Output in JPEG / PNG / WebP con qualità regolabile
- Rimozione metadata EXIF/ICC (opzionale)
- Correzione orientamento da EXIF
- Conversione a sRGB (se possibile)
- Suffix automatico al nome file (es. *_web)

Dipendenze: Pillow (PIL)  ->  pip install pillow
Esecuzione: python web_image_resizer_gui.py
"""

import os
import io
import sys
import math
import threading
from pathlib import Path
from typing import Tuple, Optional

from PIL import Image, ImageOps

# Conversione sRGB: ImageCms è opzionale ma consigliata
try:
    from PIL import ImageCms
    HAVE_CMS = True
except Exception:
    HAVE_CMS = False

import tkinter as tk
from tkinter import ttk, filedialog, messagebox, colorchooser

SUPPORTED_EXT = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tif", ".tiff"}

class ResizerApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Web Image Resizer")
        self.geometry("860x640")
        self.minsize(820, 600)

        # Vars
        self.var_in_dir   = tk.StringVar()
        self.var_out_dir  = tk.StringVar(value=str(Path.cwd() / "out_web"))
        self.var_suffix   = tk.StringVar(value="_web")
        self.var_recursive = tk.BooleanVar(value=False)

        # Mode: scale or exact size
        self.var_mode = tk.StringVar(value="scale")  # "scale" | "exact"

        # Scale options
        self.var_scale_type = tk.StringVar(value="lato lungo")  # "lato lungo" | "larghezza fissa"
        self.var_long_side  = tk.IntVar(value=1600)       # px
        self.var_target_w   = tk.IntVar(value=1280)       # px
        self.var_no_upscale = tk.BooleanVar(value=True)

        # Exact size options
        self.var_exact_w = tk.IntVar(value=1200)
        self.var_exact_h = tk.IntVar(value=1200)
        self.var_exact_mode = tk.StringVar(value="ADATTA (bordi)")  # "ADATTA (bordi)" | "RIEMPI (ritaglio)"
        self.var_bg = tk.StringVar(value="#FFFFFF")
        self.var_transparent_bg = tk.BooleanVar(value=False)

        # Output format & quality
        self.var_format = tk.StringVar(value="WEBP")     # "JPEG" | "PNG" | "WEBP"
        self.var_quality = tk.IntVar(value=82)           # 1..100
        self.var_progressive = tk.BooleanVar(value=True) # JPEG only
        self.var_optimize = tk.BooleanVar(value=True)

        # Metadata / profiles
        self.var_strip_meta = tk.BooleanVar(value=True)
        self.var_to_srgb    = tk.BooleanVar(value=True)

        # UI
        self._build_ui()
        self.worker = None
        self.stop_flag = threading.Event()

    # ---------------- UI BUILD ----------------
    def _build_ui(self):
        pad = {"padx": 8, "pady": 6}

        # Paths
        f_paths = ttk.LabelFrame(self, text="Cartelle")
        f_paths.pack(fill="x", padx=10, pady=10)
        ttk.Label(f_paths, text="Sorgente:").grid(row=0, column=0, sticky="e", **pad)
        ttk.Entry(f_paths, textvariable=self.var_in_dir).grid(row=0, column=1, sticky="we", **pad)
        ttk.Button(f_paths, text="Sfoglia…", command=self._choose_in).grid(row=0, column=2, **pad)

        ttk.Label(f_paths, text="Destinazione:").grid(row=1, column=0, sticky="e", **pad)
        ttk.Entry(f_paths, textvariable=self.var_out_dir).grid(row=1, column=1, sticky="we", **pad)
        ttk.Button(f_paths, text="Sfoglia…", command=self._choose_out).grid(row=1, column=2, **pad)

        ttk.Checkbutton(f_paths, text="Includi sottocartelle", variable=self.var_recursive).grid(row=2, column=1, sticky="w", **pad)
        ttk.Label(f_paths, text="Suffix filename:").grid(row=2, column=0, sticky="e", **pad)
        ttk.Entry(f_paths, textvariable=self.var_suffix, width=12).grid(row=2, column=2, sticky="w", **pad)

        f_paths.columnconfigure(1, weight=1)

        # Mode
        f_mode = ttk.LabelFrame(self, text="Modalità di ridimensionamento")
        f_mode.pack(fill="x", padx=10, pady=6)

        # Scale radio
        ttk.Radiobutton(f_mode, text="Riduci mantenendo proporzioni", value="scale", variable=self.var_mode, command=self._toggle_mode).grid(row=0, column=0, sticky="w", **pad)
        ttk.Radiobutton(f_mode, text="Dimensione esatta (tutte uguali)", value="exact", variable=self.var_mode, command=self._toggle_mode).grid(row=0, column=1, sticky="w", **pad)

        # Scale frame
        self.f_scale = ttk.Frame(f_mode)
        self.f_scale.grid(row=1, column=0, columnspan=3, sticky="we", **pad)

        ttk.Label(self.f_scale, text="Tipo:").grid(row=0, column=0, sticky="e", **pad)
        ttk.Combobox(self.f_scale, values=["lato lungo", "larghezza fissa"], textvariable=self.var_scale_type, state="readonly", width=16).grid(row=0, column=1, sticky="w", **pad)

        ttk.Label(self.f_scale, text="Max lato lungo (px):").grid(row=0, column=2, sticky="e", **pad)
        ttk.Spinbox(self.f_scale, from_=200, to=12000, textvariable=self.var_long_side, width=8).grid(row=0, column=3, sticky="w", **pad)

        ttk.Label(self.f_scale, text="Larghezza fissa (px):").grid(row=0, column=4, sticky="e", **pad)
        ttk.Spinbox(self.f_scale, from_=200, to=12000, textvariable=self.var_target_w, width=8).grid(row=0, column=5, sticky="w", **pad)

        ttk.Checkbutton(self.f_scale, text="Non fare upscaling", variable=self.var_no_upscale).grid(row=0, column=6, sticky="w", **pad)

        # Exact frame
        self.f_exact = ttk.Frame(f_mode)
        self.f_exact.grid(row=2, column=0, columnspan=3, sticky="we", **pad)

        ttk.Label(self.f_exact, text="Larghezza (px):").grid(row=0, column=0, sticky="e", **pad)
        ttk.Spinbox(self.f_exact, from_=100, to=12000, textvariable=self.var_exact_w, width=8).grid(row=0, column=1, sticky="w", **pad)

        ttk.Label(self.f_exact, text="Altezza (px):").grid(row=0, column=2, sticky="e", **pad)
        ttk.Spinbox(self.f_exact, from_=100, to=12000, textvariable=self.var_exact_h, width=8).grid(row=0, column=3, sticky="w", **pad)

        ttk.Label(self.f_exact, text="Metodo:").grid(row=0, column=4, sticky="e", **pad)
        ttk.Combobox(self.f_exact, values=["ADATTA (bordi)", "RIEMPI (ritaglio)"], textvariable=self.var_exact_mode, state="readonly", width=18).grid(row=0, column=5, sticky="w", **pad)

        self.btn_bg = ttk.Button(self.f_exact, text="Colore sfondo…", command=self._choose_bg)
        self.btn_bg.grid(row=0, column=6, sticky="w", **pad)
        ttk.Checkbutton(self.f_exact, text="Sfondo trasparente (se supportato)", variable=self.var_transparent_bg).grid(row=0, column=7, sticky="w", **pad)

        # Output format
        f_fmt = ttk.LabelFrame(self, text="Output")
        f_fmt.pack(fill="x", padx=10, pady=6)

        ttk.Label(f_fmt, text="Formato:").grid(row=0, column=0, sticky="e", **pad)
        ttk.Combobox(f_fmt, values=["WEBP", "JPEG", "PNG"], textvariable=self.var_format, state="readonly", width=8).grid(row=0, column=1, sticky="w", **pad)

        ttk.Label(f_fmt, text="Qualità (1-100):").grid(row=0, column=2, sticky="e", **pad)
        ttk.Spinbox(f_fmt, from_=1, to=100, textvariable=self.var_quality, width=6).grid(row=0, column=3, sticky="w", **pad)

        ttk.Checkbutton(f_fmt, text="Progressive (solo JPEG)", variable=self.var_progressive).grid(row=0, column=4, sticky="w", **pad)
        ttk.Checkbutton(f_fmt, text="Optimize", variable=self.var_optimize).grid(row=0, column=5, sticky="w", **pad)

        ttk.Checkbutton(f_fmt, text="Rimuovi metadata", variable=self.var_strip_meta).grid(row=1, column=1, sticky="w", **pad)
        ttk.Checkbutton(f_fmt, text="Converti a sRGB", variable=self.var_to_srgb).grid(row=1, column=2, sticky="w", **pad)

        # Actions
        f_actions = ttk.Frame(self)
        f_actions.pack(fill="x", padx=10, pady=6)
        self.btn_start = ttk.Button(f_actions, text="Avvia", command=self._on_start)
        self.btn_start.pack(side="left", padx=4)
        self.btn_stop = ttk.Button(f_actions, text="Annulla", command=self._on_stop, state="disabled")
        self.btn_stop.pack(side="left", padx=4)

        self.progress = ttk.Progressbar(f_actions, mode="indeterminate")
        self.progress.pack(side="right", fill="x", expand=True, padx=6)

        # Log
        f_log = ttk.LabelFrame(self, text="Log")
        f_log.pack(fill="both", expand=True, padx=10, pady=10)
        self.txt_log = tk.Text(f_log, height=14, wrap="word")
        self.txt_log.pack(fill="both", expand=True, padx=6, pady=6)
        self._toggle_mode()  # inizializza visibilità frame

    # ---------------- UI Events ----------------
    def _choose_in(self):
        d = filedialog.askdirectory()
        if d:
            self.var_in_dir.set(d)

    def _choose_out(self):
        d = filedialog.askdirectory(initialdir=self.var_out_dir.get() or str(Path.cwd()))
        if d:
            self.var_out_dir.set(d)

    def _choose_bg(self):
        color, _ = colorchooser.askcolor(color=self.var_bg.get())
        if color:
            # colorchooser returns RGB tuple; convert to hex
            r, g, b = [int(x) for x in color]
            self.var_bg.set(f"#{r:02X}{g:02X}{b:02X}")

    def _toggle_mode(self):
        mode = self.var_mode.get()
        if mode == "scale":
            self._set_frame_state(self.f_scale, "normal")
            self._set_frame_state(self.f_exact, "disabled")
        else:
            self._set_frame_state(self.f_scale, "disabled")
            self._set_frame_state(self.f_exact, "normal")

    def _set_frame_state(self, frame, state):
        for child in frame.winfo_children():
            try:
                child.configure(state=state)
            except tk.TclError:
                pass

    def _on_start(self):
        if self.worker and self.worker.is_alive():
            return
        in_dir = Path(self.var_in_dir.get().strip())
        out_dir = Path(self.var_out_dir.get().strip())

        if not in_dir.exists():
            messagebox.showwarning("Attenzione", "Seleziona una cartella sorgente valida.")
            return

        out_dir.mkdir(parents=True, exist_ok=True)
        self.stop_flag.clear()
        self.progress.start(80)
        self.btn_start["state"] = "disabled"
        self.btn_stop["state"] = "normal"
        self._log("Avvio elaborazione…")

        self.worker = threading.Thread(target=self._process_all, daemon=True)
        self.worker.start()

    def _on_stop(self):
        if self.worker and self.worker.is_alive():
            self.stop_flag.set()
            self._log("Richiesta di annullamento…")

    def _done(self):
        self.progress.stop()
        self.btn_start["state"] = "normal"
        self.btn_stop["state"] = "disabled"

    def _log(self, msg):
        self.txt_log.insert("end", msg.rstrip() + "\n")
        self.txt_log.see("end")

    # ---------------- Image utils ----------------
    def _collect_files(self, root: Path):
        if self.var_recursive.get():
            for p in root.rglob("*"):
                if p.is_file() and p.suffix.lower() in SUPPORTED_EXT:
                    yield p
        else:
            for p in root.iterdir():
                if p.is_file() and p.suffix.lower() in SUPPORTED_EXT:
                    yield p

    def _open_image(self, path: Path) -> Optional[Image.Image]:
        try:
            img = Image.open(path)
            img = ImageOps.exif_transpose(img)  # orientazione corretta
            return img
        except Exception as e:
            self._log(f"[SKIP] {path.name}: {e}")
            return None

    def _remove_metadata(self, img: Image.Image) -> Image.Image:
        data = list(img.getdata())
        clean = Image.new(img.mode, img.size)
        clean.putdata(data)
        return clean

    def _to_srgb(self, img: Image.Image) -> Image.Image:
        if not HAVE_CMS or not self.var_to_srgb.get():
            # fallback: se ha alpha e salveremo in JPEG, convertiremo con bg in seguito
            return img.convert("RGB") if img.mode not in ("RGB", "RGBA") else img
        try:
            icc = img.info.get("icc_profile")
            if icc:
                src = ImageCms.ImageCmsProfile(io.BytesIO(icc))
                dst = ImageCms.createProfile("sRGB")
                intent = ImageCms.INTENT_PERCEPTUAL
                img = ImageCms.profileToProfile(img, src, dst, renderingIntent=intent, outputMode="RGB")
            else:
                if img.mode not in ("RGB", "RGBA"):
                    img = img.convert("RGB")
        except Exception:
            img = img.convert("RGB")
        return img

    def _resize_scale(self, img: Image.Image) -> Image.Image:
        t = self.var_scale_type.get()
        no_up = self.var_no_upscale.get()
        if t == "lato lungo":
            max_side = int(self.var_long_side.get())
            w, h = img.size
            long_curr = max(w, h)
            if long_curr <= max_side and no_up:
                return img.copy()
            scale = max_side / float(long_curr)
            nw, nh = int(round(w * scale)), int(round(h * scale))
            return img.resize((nw, nh), Image.LANCZOS)
        else:  # larghezza fissa
            target_w = int(self.var_target_w.get())
            w, h = img.size
            if w <= target_w and no_up:
                return img.copy()
            scale = target_w / float(w)
            nw, nh = target_w, int(round(h * scale))
            return img.resize((nw, nh), Image.LANCZOS)

    def _resize_exact(self, img: Image.Image) -> Image.Image:
        W = int(self.var_exact_w.get())
        H = int(self.var_exact_h.get())
        method = self.var_exact_mode.get()  # "ADATTA (bordi)" or "RIEMPI (ritaglio)"
        if method.startswith("ADATTA"):
            # contain: ridimensiona per entrare, poi letterbox
            iw, ih = img.size
            scale = min(W / iw, H / ih)
            nw, nh = int(round(iw * scale)), int(round(ih * scale))
            resized = img.resize((nw, nh), Image.LANCZOS)
            # canvas
            use_alpha = self.var_transparent_bg.get() and (self.var_format.get() in ("PNG", "WEBP"))
            if use_alpha:
                canvas = Image.new("RGBA", (W, H), (0,0,0,0))
            else:
                bg_hex = self.var_bg.get().lstrip("#")
                r = int(bg_hex[0:2], 16)
                g = int(bg_hex[2:4], 16)
                b = int(bg_hex[4:6], 16)
                canvas = Image.new("RGB", (W, H), (r, g, b))
            x = (W - nw) // 2
            y = (H - nh) // 2
            canvas.paste(resized, (x, y), resized if resized.mode in ("RGBA", "LA") else None)
            return canvas
        else:
            # cover: ridimensiona per coprire, poi crop centrale
            iw, ih = img.size
            scale = max(W / iw, H / ih)
            nw, nh = int(round(iw * scale)), int(round(ih * scale))
            resized = img.resize((nw, nh), Image.LANCZOS)
            # crop centrale
            left = (nw - W) // 2
            top = (nh - H) // 2
            right = left + W
            bottom = top + H
            return resized.crop((left, top, right, bottom))

    def _save_image(self, img: Image.Image, out_path: Path):
        fmt = self.var_format.get().upper()
        q = int(self.var_quality.get())
        optimize = bool(self.var_optimize.get())
        progressive = bool(self.var_progressive.get()) if fmt == "JPEG" else False

        params = {}
        if fmt in ("JPEG", "WEBP"):
            params["quality"] = q
        if fmt == "JPEG":
            params["progressive"] = progressive
            params["subsampling"] = "4:2:0"  # default web-friendly
        if fmt == "WEBP":
            # method 5 ~ buon compromesso; riduce dimensione
            params["method"] = 5
        if fmt in ("JPEG", "PNG", "WEBP"):
            params["optimize"] = optimize

        # Trasparenza e alpha per JPEG: appiattire su bg
        if fmt == "JPEG":
            if img.mode in ("RGBA", "LA"):
                bg_hex = self.var_bg.get().lstrip("#")
                r = int(bg_hex[0:2], 16)
                g = int(bg_hex[2:4], 16)
                b = int(bg_hex[4:6], 16)
                base = Image.new("RGB", img.size, (r, g, b))
                base.paste(img, mask=img.split()[-1])
                img = base
            else:
                img = img.convert("RGB")

        # Rimozione metadata
        if self.var_strip_meta.get():
            img = self._remove_metadata(img)

        # Estensione coerente
        ext = ".jpg" if fmt == "JPEG" else (".png" if fmt == "PNG" else ".webp")
        out_path = out_path.with_suffix(ext)

        img.save(out_path, format=fmt, **params)
        return out_path

    # ---------------- Processing ----------------
    def _process_all(self):
        try:
            src = Path(self.var_in_dir.get().strip())
            dst = Path(self.var_out_dir.get().strip())
            suffix = self.var_suffix.get()

            files = list(self._collect_files(src))
            total = len(files)
            if total == 0:
                self._log("Nessuna immagine valida trovata.")
                self._done()
                return

            self._log(f"Trovati {total} file. Inizio…")

            processed = 0
            saved_bytes = 0

            for i, path in enumerate(files, 1):
                if self.stop_flag.is_set():
                    self._log("Operazione annullata.")
                    self._done()
                    return

                rel = path.relative_to(src) if self.var_recursive.get() else path.name
                self._log(f"[{i}/{total}] {rel}")

                img = self._open_image(path)
                if img is None:
                    continue

                # Colori
                if self.var_to_srgb.get():
                    img = self._to_srgb(img)

                # Ridimensionamento
                if self.var_mode.get() == "scale":
                    out_img = self._resize_scale(img)
                else:
                    out_img = self._resize_exact(img)

                # Path di output
                if self.var_recursive.get() and isinstance(rel, Path):
                    target_dir = dst / rel.parent
                else:
                    target_dir = dst
                target_dir.mkdir(parents=True, exist_ok=True)
                base = path.stem + (suffix or "")
                out_path = target_dir / base

                # Salva
                orig_size = path.stat().st_size if path.exists() else 0
                out_file = self._save_image(out_img, out_path)
                new_size = out_file.stat().st_size if out_file.exists() else 0
                if orig_size and new_size:
                    delta = orig_size - new_size
                    saved_bytes += max(0, delta)

                processed += 1
                self._log(f" → {out_file.name} ({new_size/1024:.0f} KB)")

            if saved_bytes > 0:
                kb = saved_bytes / 1024
                self._log(f"Completato. File processati: {processed}. Risparmio stimato: {kb:.0f} KB.")
            else:
                self._log(f"Completato. File processati: {processed}.")
        except Exception as e:
            self._log(f"Errore: {e}")
        finally:
            self._done()


if __name__ == "__main__":
    app = ResizerApp()
    app.mainloop()
