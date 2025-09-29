# -*- coding: utf-8 -*-
"""
GUI per estrarre immagini contenute nelle celle di un foglio Smartsheet e salvarle come PNG,
rinominandole con il valore di una colonna scelta.

Dipendenze:
- Python 3.8+
- requests (pip install requests)
- Pillow (opzionale, per forzare conversione in PNG - pip install pillow)

Uso:
    python export_smartsheet_images_gui.py

Note:
- Serve un token API Smartsheet valido e l'ID del foglio.
- Dopo aver inserito token e ID foglio, clicca "Carica colonne" per popolare i menu a tendina.
- Seleziona la "Colonna con le immagini" (la colonna che contiene le immagini in cella) e
  la "Colonna per rinomina" (il cui valore verrà usato per il nome file).
- Scegli la cartella di destinazione e premi "Avvia esportazione".
"""

import os
import re
import io
import sys
import json
import time
import queue
import threading
from typing import List, Dict, Any, Optional
from pathlib import Path

import requests

try:
    from PIL import Image
    PIL_OK = True
except Exception:
    PIL_OK = False

import tkinter as tk
from tkinter import ttk, filedialog, messagebox

API_BASE = "https://api.smartsheet.com/2.0"

def sanitize_filename(s: str) -> str:
    s = (s or "").strip()
    s = re.sub(r'[\\/:*?"<>|]+', "_", s)
    s = re.sub(r"\s+", " ", s)
    return s[:150] or "senza_nome"

def headers(token: str, json_mode: bool=False) -> Dict[str, str]:
    h = {"Authorization": f"Bearer {token}"}
    if json_mode:
        h["Content-Type"] = "application/json"
    return h

def get_sheet_columns(token: str, sheet_id: int) -> List[Dict[str, Any]]:
    # Recupera solo metadati del foglio (incluse colonne). Una singola pagina è sufficiente.
    url = f"{API_BASE}/sheets/{sheet_id}?pageSize=1"
    r = requests.get(url, headers=headers(token))
    r.raise_for_status()
    data = r.json()
    return data.get("columns", [])

def iter_sheet_rows(token: str, sheet_id: int, page_size: int = 500):
    # Itera tutte le righe con paginazione per evitare timeouts su fogli grandi
    page = 1
    while True:
        url = f"{API_BASE}/sheets/{sheet_id}?pageSize={page_size}&page={page}"
        r = requests.get(url, headers=headers(token))
        r.raise_for_status()
        data = r.json()
        rows = data.get("rows", [])
        if not rows:
            break
        for row in rows:
            yield row
        # Heuristica: se arriviamo a meno del page_size, presumiamo fine
        if len(rows) < page_size:
            break
        page += 1

def post_image_urls(token: str, image_ids: List[str]) -> List[str]:
    # Richiede URL temporanei per imageId
    payload = [{"imageId": iid} for iid in image_ids]
    r = requests.post(f"{API_BASE}/imageurls", headers=headers(token, json_mode=True), json=payload)
    r.raise_for_status()
    data = r.json()
    return [item.get("url") for item in data.get("imageUrls", []) if item.get("url")]

def download_and_save_png(token: str, url: str, out_path: Path):
    resp = requests.get(url, headers=headers(token), stream=True)
    resp.raise_for_status()
    ctype = (resp.headers.get("Content-Type") or "").lower()
    raw = resp.content
    # Se già PNG o estensione png, salva raw
    if "image/png" in ctype or out_path.suffix.lower() == ".png":
        out_path.write_bytes(raw)
        return
    if PIL_OK:
        try:
            img = Image.open(io.BytesIO(raw))
            img.save(out_path, format="PNG")
            return
        except Exception:
            pass
    # fallback: salva raw anche se non è PNG (potrebbe non aprirsi come PNG)
    out_path.write_bytes(raw)

class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Smartsheet - Esporta immagini dalle celle")
        self.geometry("760x560")
        self.minsize(740, 540)

        self.var_token = tk.StringVar()
        self.var_sheet_id = tk.StringVar()
        self.var_out_dir = tk.StringVar(value=str(Path.cwd() / "img_export"))
        self.var_prefix = tk.StringVar(value="")
        self.columns_map = {}  # title -> id
        self.var_img_col = tk.StringVar()
        self.var_name_col = tk.StringVar()

        self.queue = queue.Queue()

        self._build_ui()
        self._poll_log_queue()

    def _build_ui(self):
        pad = {"padx": 8, "pady": 6}

        frm_top = ttk.LabelFrame(self, text="Connessione")
        frm_top.pack(fill="x", padx=10, pady=10)

        ttk.Label(frm_top, text="API Token:").grid(row=0, column=0, sticky="e", **pad)
        ent_token = ttk.Entry(frm_top, textvariable=self.var_token, show="•", width=50)
        ent_token.grid(row=0, column=1, sticky="we", **pad)

        ttk.Label(frm_top, text="Sheet ID:").grid(row=0, column=2, sticky="e", **pad)
        ent_sheet = ttk.Entry(frm_top, textvariable=self.var_sheet_id, width=22)
        ent_sheet.grid(row=0, column=3, sticky="w", **pad)

        btn_cols = ttk.Button(frm_top, text="Carica colonne", command=self.on_load_columns)
        btn_cols.grid(row=0, column=4, sticky="w", **pad)

        frm_top.columnconfigure(1, weight=1)

        frm_opts = ttk.LabelFrame(self, text="Opzioni")
        frm_opts.pack(fill="x", padx=10, pady=6)

        ttk.Label(frm_opts, text="Colonna con le immagini:").grid(row=0, column=0, sticky="e", **pad)
        self.cmb_img_col = ttk.Combobox(frm_opts, textvariable=self.var_img_col, state="readonly", width=36)
        self.cmb_img_col.grid(row=0, column=1, sticky="w", **pad)

        ttk.Label(frm_opts, text="Colonna per rinomina:").grid(row=0, column=2, sticky="e", **pad)
        self.cmb_name_col = ttk.Combobox(frm_opts, textvariable=self.var_name_col, state="readonly", width=30)
        self.cmb_name_col.grid(row=0, column=3, sticky="w", **pad)

        ttk.Label(frm_opts, text="Prefisso filename (opzionale):").grid(row=1, column=0, sticky="e", **pad)
        ttk.Entry(frm_opts, textvariable=self.var_prefix, width=36).grid(row=1, column=1, sticky="w", **pad)

        ttk.Label(frm_opts, text="Cartella di destinazione:").grid(row=1, column=2, sticky="e", **pad)
        ent_out = ttk.Entry(frm_opts, textvariable=self.var_out_dir, width=30)
        ent_out.grid(row=1, column=3, sticky="we", **pad)
        btn_browse = ttk.Button(frm_opts, text="Sfoglia…", command=self.on_browse)
        btn_browse.grid(row=1, column=4, sticky="w", **pad)

        frm_opts.columnconfigure(3, weight=1)

        frm_actions = ttk.Frame(self)
        frm_actions.pack(fill="x", padx=10, pady=(0,6))
        self.btn_start = ttk.Button(frm_actions, text="Avvia esportazione", command=self.on_start, state="disabled")
        self.btn_start.pack(side="left", padx=4)
        self.btn_cancel = ttk.Button(frm_actions, text="Annulla", command=self.on_cancel, state="disabled")
        self.btn_cancel.pack(side="left", padx=4)

        self.progress = ttk.Progressbar(frm_actions, mode="indeterminate")
        self.progress.pack(side="right", fill="x", expand=True, padx=4)

        frm_log = ttk.LabelFrame(self, text="Log")
        frm_log.pack(fill="both", expand=True, padx=10, pady=10)
        self.txt_log = tk.Text(frm_log, height=16, wrap="word")
        self.txt_log.pack(fill="both", expand=True, padx=6, pady=6)
        self.txt_log.insert("end", "Pronto.\n")

        self.worker = None
        self.stop_flag = threading.Event()

    def log(self, msg: str):
        self.queue.put(msg)

    def _poll_log_queue(self):
        try:
            while True:
                msg = self.queue.get_nowait()
                self.txt_log.insert("end", msg.rstrip() + "\n")
                self.txt_log.see("end")
        except queue.Empty:
            pass
        finally:
            self.after(120, self._poll_log_queue)

    def on_browse(self):
        folder = filedialog.askdirectory(initialdir=self.var_out_dir.get() or str(Path.cwd()))
        if folder:
            self.var_out_dir.set(folder)

    def on_load_columns(self):
        token = self.var_token.get().strip()
        sheet_id = self.var_sheet_id.get().strip()
        if not token or not sheet_id:
            messagebox.showwarning("Attenzione", "Inserisci API Token e Sheet ID.")
            return
        try:
            sheet_id = int(sheet_id)
        except ValueError:
            messagebox.showerror("Errore", "Sheet ID deve essere un numero intero.")
            return
        self.log("Caricamento colonne in corso…")
        try:
            cols = get_sheet_columns(token, sheet_id)
            if not cols:
                raise RuntimeError("Nessuna colonna trovata (controlla permessi e ID foglio).")
            # Popola combobox con titoli
            self.columns_map = {c["title"]: c["id"] for c in cols}
            titles = list(self.columns_map.keys())
            titles.sort(key=str.lower)
            self.cmb_img_col["values"] = titles
            self.cmb_name_col["values"] = titles
            if titles:
                self.var_img_col.set(titles[0])
                if len(titles) > 1:
                    self.var_name_col.set(titles[1])
            self.btn_start["state"] = "normal"
            self.log(f"Colonne caricate: {len(titles)}")
        except requests.HTTPError as e:
            self.log(f"Errore HTTP: {e} - {getattr(e.response, 'text', '')}")
            messagebox.showerror("Errore HTTP", f"{e}\n\n{getattr(e.response, 'text', '')}")
        except Exception as e:
            self.log(f"Errore: {e}")
            messagebox.showerror("Errore", str(e))

    def on_start(self):
        if self.worker and self.worker.is_alive():
            return
        token = self.var_token.get().strip()
        sheet_id = self.var_sheet_id.get().strip()
        out_dir = self.var_out_dir.get().strip()
        img_col_title = self.var_img_col.get().strip()
        name_col_title = self.var_name_col.get().strip()

        if not token or not sheet_id or not out_dir or not img_col_title or not name_col_title:
            messagebox.showwarning("Attenzione", "Compila tutti i campi richiesti.")
            return
        try:
            sheet_id = int(sheet_id)
        except ValueError:
            messagebox.showerror("Errore", "Sheet ID deve essere un numero intero.")
            return

        Path(out_dir).mkdir(parents=True, exist_ok=True)

        self.stop_flag.clear()
        self.progress.start(80)
        self.btn_start["state"] = "disabled"
        self.btn_cancel["state"] = "normal"

        args = (token, sheet_id, out_dir, img_col_title, name_col_title, self.var_prefix.get().strip())
        self.worker = threading.Thread(target=self._run_export, args=args, daemon=True)
        self.worker.start()

    def on_cancel(self):
        if self.worker and self.worker.is_alive():
            self.stop_flag.set()
            self.log("Richiesta di annullamento…")

    def _run_export(self, token: str, sheet_id: int, out_dir: str, img_col_title: str, name_col_title: str, prefix: str):
        try:
            # Ricava mappa colonne (se non presente o cambiata)
            if not self.columns_map:
                cols = get_sheet_columns(token, sheet_id)
                self.columns_map = {c["title"]: c["id"] for c in cols}

            if img_col_title not in self.columns_map or name_col_title not in self.columns_map:
                raise RuntimeError("Le colonne selezionate non sono valide. Ricaricare le colonne.")

            img_col_id = self.columns_map[img_col_title]
            name_col_id = self.columns_map[name_col_title]

            self.log("Lettura righe del foglio…")
            cells_with_images = []  # (row, cell)
            for row in iter_sheet_rows(token, sheet_id):
                if self.stop_flag.is_set():
                    self.log("Operazione annullata.")
                    self._done()
                    return
                for cell in row.get("cells", []):
                    # Filtra solo le celle della colonna selezionata
                    if cell.get("columnId") != img_col_id:
                        continue
                    img = cell.get("image")
                    if isinstance(img, dict) and img.get("id"):
                        cells_with_images.append((row, cell))

            total = len(cells_with_images)
            if total == 0:
                self.log("Nessuna immagine trovata nella colonna selezionata.")
                self._done()
                return

            self.log(f"Trovate {total} immagini. Richiesta URL di download…")
            image_ids = [cell["image"]["id"] for (_, cell) in cells_with_images]
            urls = []
            BATCH = 80
            for i in range(0, len(image_ids), BATCH):
                if self.stop_flag.is_set():
                    self.log("Operazione annullata.")
                    self._done()
                    return
                chunk = image_ids[i:i+BATCH]
                urls.extend(post_image_urls(token, chunk))
                self.log(f"  URL ottenuti: {len(urls)}/{total}")

            out_dir_p = Path(out_dir)
            seen = set()
            done = 0
            for (row, cell), url in zip(cells_with_images, urls):
                if self.stop_flag.is_set():
                    self.log("Operazione annullata.")
                    self._done()
                    return
                # Valore per filename dalla colonna selezionata
                rename_value = None
                for c in row.get("cells", []):
                    if c.get("columnId") == name_col_id:
                        rename_value = c.get("displayValue") or c.get("value")
                        break
                if not rename_value:
                    rename_value = f"row_{row.get('id')}"

                base = sanitize_filename(str(rename_value))
                fname = f"{prefix}{base}.png"
                j = 2
                while fname in seen or (out_dir_p / fname).exists():
                    fname = f"{prefix}{base} ({j}).png"
                    j += 1
                seen.add(fname)

                try:
                    download_and_save_png(token, url, out_dir_p / fname)
                    done += 1
                    self.log(f"Salvato: {fname}")
                except Exception as e:
                    self.log(f"Errore su '{fname}': {e}")

            self.log(f"Completato. Salvati {done} file in: {out_dir_p.resolve()}")
        except requests.HTTPError as e:
            self.log(f"Errore HTTP: {e} - {getattr(e.response, 'text', '')}")
            messagebox.showerror("Errore HTTP", f"{e}\n\n{getattr(e.response, 'text', '')}")
        except Exception as e:
            self.log(f"Errore: {e}")
            messagebox.showerror("Errore", str(e))
        finally:
            self._done()

    def _done(self):
        self.progress.stop()
        self.btn_start["state"] = "normal"
        self.btn_cancel["state"] = "disabled"


def main():
    app = App()
    app.mainloop()

if __name__ == "__main__":
    main()
