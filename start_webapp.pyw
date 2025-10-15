#!/usr/bin/env python3
"""
Clevertech Organigramma - WebApp Launcher
==========================================

Avvia automaticamente il proxy server Smartsheet e il frontend Vite,
poi apre l'applicazione in una finestra Chrome in modalità app (senza UI browser).

Gestisce il ciclo di vita completo:
- Avvio server in background
- Health checks per verificare disponibilità
- Apertura browser in modalità webapp
- Cleanup automatico dei processi all'uscita

Author: Clevertech IT
Version: 1.0.0
License: Proprietary
"""

import subprocess
import time
import socket
import sys
import os
import json
import logging
import atexit
import signal
from pathlib import Path
from typing import Optional, Tuple, List
from logging.handlers import RotatingFileHandler
import psutil


# =============================================================================
# CONFIGURAZIONE
# =============================================================================

class Config:
    """Gestione configurazione applicazione."""
    
    # Percorsi
    PROJECT_ROOT = Path(__file__).parent
    CONFIG_FILE = PROJECT_ROOT / "webapp_config.json"
    LOG_FILE = PROJECT_ROOT / "webapp_startup.log"
    
    # Default values
    DEFAULTS = {
        "servers": {
            "proxy": {
                "port": 3001,
                "command": "npm run proxy",
                "startup_timeout": 30
            },
            "frontend": {
                "port": 3000,
                "command": "npm run dev",
                "startup_timeout": 60
            }
        },
        "browser": {
            "url": "http://localhost:3000",
            "window": {
                "width": 1400,
                "height": 900,
                "position_x": 100,
                "position_y": 100
            }
        },
        "logging": {
            "level": "INFO",
            "max_bytes": 5242880,
            "backup_count": 3
        }
    }
    
    def __init__(self):
        """Carica configurazione da file o usa defaults."""
        self.config = self._load_config()
    
    def _load_config(self) -> dict:
        """Carica configurazione da JSON con fallback a defaults."""
        if self.CONFIG_FILE.exists():
            try:
                with open(self.CONFIG_FILE, 'r', encoding='utf-8') as f:
                    custom_config = json.load(f)
                    # Merge con defaults (custom override defaults)
                    return self._merge_configs(self.DEFAULTS.copy(), custom_config)
            except Exception as e:
                print(f"⚠️  Errore caricamento config, uso defaults: {e}")
                return self.DEFAULTS.copy()
        return self.DEFAULTS.copy()
    
    def _merge_configs(self, base: dict, override: dict) -> dict:
        """Merge ricorsivo di configurazioni."""
        for key, value in override.items():
            if key in base and isinstance(base[key], dict) and isinstance(value, dict):
                base[key] = self._merge_configs(base[key], value)
            else:
                base[key] = value
        return base
    
    def get(self, *keys, default=None):
        """Accesso sicuro a valori nested (es: get('servers', 'proxy', 'port'))."""
        value = self.config
        for key in keys:
            if isinstance(value, dict) and key in value:
                value = value[key]
            else:
                return default
        return value


# =============================================================================
# LOGGING SETUP
# =============================================================================

def setup_logging(config: Config) -> logging.Logger:
    """Configura logging con rotazione file."""
    logger = logging.getLogger("WebAppLauncher")
    
    log_level = config.get('logging', 'level', default='INFO')
    logger.setLevel(getattr(logging, log_level))
    
    # Handler file con rotazione
    max_bytes = config.get('logging', 'max_bytes', default=5242880)
    backup_count = config.get('logging', 'backup_count', default=3)
    
    file_handler = RotatingFileHandler(
        Config.LOG_FILE,
        maxBytes=max_bytes,
        backupCount=backup_count,
        encoding='utf-8'
    )
    file_handler.setLevel(logging.DEBUG)
    
    # Handler console (per debugging, ma .pyw nasconde console)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    
    # Formatter
    formatter = logging.Formatter(
        '%(asctime)s [%(levelname)s] %(name)s: %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    file_handler.setFormatter(formatter)
    console_handler.setFormatter(formatter)
    
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger


# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def is_port_open(port: int, host: str = 'localhost', timeout: float = 1.0) -> bool:
    """Verifica se una porta è aperta e accetta connessioni."""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(timeout)
    try:
        result = sock.connect_ex((host, port))
        return result == 0
    except socket.error:
        return False
    finally:
        sock.close()


def wait_for_port(port: int, timeout: int, logger: logging.Logger, 
                  check_interval: float = 0.5) -> bool:
    """
    Attende che una porta diventi disponibile con polling.
    
    Args:
        port: Porta da controllare
        timeout: Timeout massimo in secondi
        logger: Logger per messaggi
        check_interval: Intervallo tra controlli in secondi
    
    Returns:
        True se porta disponibile, False se timeout
    """
    start_time = time.time()
    while time.time() - start_time < timeout:
        if is_port_open(port):
            logger.info(f"✅ Porta {port} disponibile dopo {time.time() - start_time:.1f}s")
            return True
        time.sleep(check_interval)
    
    logger.error(f"❌ Timeout: porta {port} non disponibile dopo {timeout}s")
    return False


def find_chrome_path() -> Optional[Path]:
    """Trova il percorso di Chrome su Windows con fallback multipli."""
    possible_paths = [
        # Chrome standard locations (Windows)
        Path(os.environ.get('PROGRAMFILES', 'C:\\Program Files')) / 'Google' / 'Chrome' / 'Application' / 'chrome.exe',
        Path(os.environ.get('PROGRAMFILES(X86)', 'C:\\Program Files (x86)')) / 'Google' / 'Chrome' / 'Application' / 'chrome.exe',
        Path(os.environ.get('LOCALAPPDATA', '')) / 'Google' / 'Chrome' / 'Application' / 'chrome.exe',
        
        # Edge (Chromium-based fallback)
        Path(os.environ.get('PROGRAMFILES', 'C:\\Program Files')) / 'Microsoft' / 'Edge' / 'Application' / 'msedge.exe',
        Path(os.environ.get('PROGRAMFILES(X86)', 'C:\\Program Files (x86)')) / 'Microsoft' / 'Edge' / 'Application' / 'msedge.exe',
    ]
    
    for path in possible_paths:
        if path.exists():
            return path
    
    return None


# =============================================================================
# PROCESS MANAGEMENT
# =============================================================================

class ProcessManager:
    """Gestisce i processi server con cleanup automatico."""
    
    def __init__(self, logger: logging.Logger):
        self.logger = logger
        self.processes: List[subprocess.Popen] = []
        self._setup_cleanup_handlers()
    
    def _setup_cleanup_handlers(self):
        """Registra handler per cleanup automatico."""
        atexit.register(self.cleanup)
        
        # Signal handlers (Windows supporta SIGTERM, SIGINT)
        signal.signal(signal.SIGTERM, self._signal_handler)
        signal.signal(signal.SIGINT, self._signal_handler)
    
    def _signal_handler(self, signum, frame):
        """Handler per segnali di terminazione."""
        self.logger.info(f"🛑 Ricevuto segnale {signum}, cleanup in corso...")
        self.cleanup()
        sys.exit(0)
    
    def start_process(self, command: str, cwd: Path, name: str) -> Optional[subprocess.Popen]:
        """
        Avvia un processo in background.
        
        Args:
            command: Comando da eseguire
            cwd: Directory di lavoro
            name: Nome descrittivo del processo
        
        Returns:
            Processo avviato o None se errore
        """
        try:
            self.logger.info(f"🚀 Avvio {name}: {command}")
            
            # Output su file log invece di PIPE per evitare blocchi
            log_dir = cwd / "logs"
            log_dir.mkdir(exist_ok=True)
            
            stdout_file = open(log_dir / f"{name.replace(' ', '_').lower()}_output.log", 'w')
            stderr_file = open(log_dir / f"{name.replace(' ', '_').lower()}_error.log", 'w')
            
            # CREATE_NO_WINDOW per nascondere finestre console su Windows
            creation_flags = 0
            if sys.platform == 'win32':
                creation_flags = subprocess.CREATE_NO_WINDOW
            
            process = subprocess.Popen(
                command,
                shell=True,
                cwd=cwd,
                stdout=stdout_file,
                stderr=stderr_file,
                creationflags=creation_flags
            )
            
            self.processes.append(process)
            self.logger.info(f"✅ {name} avviato (PID: {process.pid})")
            self.logger.info(f"📝 Log output: {log_dir / f'{name.replace(' ', '_').lower()}_output.log'}")
            return process
            
        except Exception as e:
            self.logger.error(f"❌ Errore avvio {name}: {e}")
            return None
    
    def cleanup(self):
        """Termina tutti i processi gestiti."""
        if not self.processes:
            return
        
        self.logger.info(f"🧹 Cleanup: terminazione di {len(self.processes)} processi...")
        
        for process in self.processes:
            try:
                if process.poll() is None:  # Processo ancora in esecuzione
                    self.logger.debug(f"Terminazione processo PID {process.pid}")
                    process.terminate()
                    
                    # Attendi terminazione gentile
                    try:
                        process.wait(timeout=5)
                    except subprocess.TimeoutExpired:
                        self.logger.warning(f"Processo {process.pid} non risponde, kill forzato")
                        process.kill()
                        process.wait()
            except Exception as e:
                self.logger.error(f"Errore terminazione processo {process.pid}: {e}")
        
        self.processes.clear()
        self.logger.info("✅ Cleanup completato")


# =============================================================================
# WEBAPP LAUNCHER
# =============================================================================

class WebAppLauncher:
    """Orchestratore principale per avvio webapp."""
    
    def __init__(self):
        self.config = Config()
        self.logger = setup_logging(self.config)
        self.process_manager = ProcessManager(self.logger)
        
        self.logger.info("=" * 70)
        self.logger.info("🚀 Clevertech Organigramma - WebApp Launcher v1.0.0")
        self.logger.info("=" * 70)
    
    def start_servers(self) -> bool:
        """
        Avvia proxy e frontend server.
        
        Returns:
            True se entrambi avviati con successo
        """
        self.logger.info("[1/5] 🔍 Validazione configurazione...")
        
        # Avvia proxy server
        self.logger.info("[2/5] 🚀 Avvio proxy server Smartsheet...")
        proxy_cmd = self.config.get('servers', 'proxy', 'command')
        proxy_port = self.config.get('servers', 'proxy', 'port')
        proxy_timeout = self.config.get('servers', 'proxy', 'startup_timeout')
        
        proxy_process = self.process_manager.start_process(
            proxy_cmd,
            Config.PROJECT_ROOT,
            "Proxy Server"
        )
        
        if not proxy_process:
            self.logger.error("❌ Impossibile avviare proxy server")
            return False
        
        # Attendi disponibilità proxy
        if not wait_for_port(proxy_port, proxy_timeout, self.logger):
            self.logger.error(f"❌ Proxy server non risponde su porta {proxy_port}")
            return False
        
        # Avvia frontend server
        self.logger.info("[3/5] 🚀 Avvio frontend Vite...")
        frontend_cmd = self.config.get('servers', 'frontend', 'command')
        frontend_port = self.config.get('servers', 'frontend', 'port')
        frontend_timeout = self.config.get('servers', 'frontend', 'startup_timeout')
        
        frontend_process = self.process_manager.start_process(
            frontend_cmd,
            Config.PROJECT_ROOT,
            "Frontend Server"
        )
        
        if not frontend_process:
            self.logger.error("❌ Impossibile avviare frontend server")
            return False
        
        # Attendi disponibilità frontend (può usare porta diversa se 3000 occupata)
        self.logger.info("[4/5] ⏳ Attesa disponibilità server...")
        actual_frontend_port = frontend_port
        
        # Prova porta 3000, poi 3001-3010 se occupata
        for port in range(frontend_port, frontend_port + 10):
            if wait_for_port(port, 5, self.logger):  # Timeout ridotto per test rapido
                actual_frontend_port = port
                if port != frontend_port:
                    self.logger.info(f"ℹ️ Frontend su porta {port} (3000 occupata)")
                break
        else:
            self.logger.error(f"❌ Frontend server non risponde su porte {frontend_port}-{frontend_port + 9}")
            return False
        
        # Salva la porta effettiva per uso successivo
        self.actual_frontend_port = actual_frontend_port
        
        self.logger.info("✅ Server pronti!")
        return True
    
    def _check_servers_alive(self) -> bool:
        """Verifica che entrambi i server rispondano."""
        proxy_port = self.config.get('servers', 'proxy', 'port')
        frontend_port = getattr(self, 'actual_frontend_port', self.config.get('servers', 'frontend', 'port'))
        
        return is_port_open(proxy_port) and is_port_open(frontend_port)
    
    def _monitor_chrome_windows(self, url: str) -> None:
        """
        Monitora se ci sono finestre Chrome aperte con l'URL dell'app.
        Termina quando tutti i processi Chrome con l'URL sono chiusi.
        """
        self.logger.info("👀 Monitoraggio applicazione...")
        
        # Attendi un attimo per permettere a Chrome di avviarsi completamente
        time.sleep(3)
        
        while True:
            time.sleep(2)
            
            # Verifica che i server siano ancora attivi
            if not self._check_servers_alive():
                self.logger.error("❌ Un server si è arrestato, chiusura applicazione")
                break
            
            # Cerca processi Chrome con l'URL dell'app nella command line
            chrome_processes = []
            try:
                for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
                    try:
                        if proc.info['name'] and 'chrome' in proc.info['name'].lower():
                            cmdline = proc.info['cmdline'] or []
                            cmdline_str = ' '.join(str(arg) for arg in cmdline)
                            if url in cmdline_str:
                                chrome_processes.append(proc.info['pid'])
                    except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                        pass
            except Exception as e:
                self.logger.warning(f"⚠️ Errore durante monitoraggio processi: {e}")
                continue
            
            # Se non ci sono più processi Chrome con l'URL, l'app è chiusa
            if not chrome_processes:
                self.logger.info("🛑 Browser chiuso dall'utente")
                break
    
    def launch_browser(self) -> Optional[subprocess.Popen]:
        """
        Apre Chrome in modalità app.
        
        Returns:
            Processo Chrome o None se errore
        """
        self.logger.info("[5/5] 🌐 Apertura webapp in modalità app...")
        
        chrome_path = find_chrome_path()
        if not chrome_path:
            self.logger.error("❌ Chrome/Edge non trovato. Aprire manualmente http://localhost:3000")
            return None
        
        self.logger.info(f"✅ Browser trovato: {chrome_path.name}")
        
        # Costruisci comando Chrome con porta dinamica
        # Usa la porta effettiva del frontend invece di quella configurata
        actual_frontend_port = getattr(self, 'actual_frontend_port', self.config.get('servers', 'frontend', 'port'))
        url = f"http://localhost:{actual_frontend_port}"
        width = self.config.get('browser', 'window', 'width')
        height = self.config.get('browser', 'window', 'height')
        pos_x = self.config.get('browser', 'window', 'position_x')
        pos_y = self.config.get('browser', 'window', 'position_y')
        
        chrome_args = [
            str(chrome_path),
            f'--app={url}',
            f'--window-size={width},{height}',
            f'--window-position={pos_x},{pos_y}',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
        ]
        
        try:
            browser_process = subprocess.Popen(chrome_args)
            self.logger.info(f"✅ Webapp aperta! (PID: {browser_process.pid})")
            self.logger.info("=" * 70)
            self.logger.info("🎉 Applicazione pronta! Chiudi la finestra per terminare.")
            self.logger.info("=" * 70)
            return browser_process
            
        except Exception as e:
            self.logger.error(f"❌ Errore apertura browser: {e}")
            return None
    
    def run(self):
        """Esegue il ciclo completo di avvio."""
        try:
            # Avvia server
            if not self.start_servers():
                self.logger.error("❌ Avvio server fallito, uscita")
                return 1
            
            # Pausa per stabilizzazione
            time.sleep(2)
            
            # Apri browser
            browser_process = self.launch_browser()
            
            if browser_process:
                # Monitora tutti i processi Chrome con l'URL dell'app
                actual_frontend_port = getattr(self, 'actual_frontend_port', self.config.get('servers', 'frontend', 'port'))
                url = f"http://localhost:{actual_frontend_port}"
                self._monitor_chrome_windows(url)
            else:
                # Se browser non si apre, mantieni server attivi
                self.logger.info("⚠️ Browser non avviato, ma server attivi")
                self.logger.info("📍 Apri manualmente: http://localhost:3000")
                self.logger.info("🛑 Premi Ctrl+C per terminare")
                
                # Attendi indefinitamente
                try:
                    while True:
                        time.sleep(1)
                except KeyboardInterrupt:
                    self.logger.info("🛑 Interruzione da tastiera")
            
            return 0
            
        except Exception as e:
            self.logger.error(f"❌ Errore fatale: {e}", exc_info=True)
            return 1
        finally:
            # Chiedi conferma prima di terminare server
            self.logger.info("=" * 70)
            self.logger.info("🛑 Applicazione chiusa")
            
            try:
                import tkinter as tk
                from tkinter import messagebox
                
                root = tk.Tk()
                root.withdraw()
                root.attributes('-topmost', True)
                
                response = messagebox.askyesno(
                    "Clevertech Organigramma",
                    "Terminare anche i server (proxy + frontend)?\n\n" +
                    "• SI: Termina tutto (consigliato)\n" +
                    "• NO: Mantieni server attivi per riavvio rapido",
                    icon='question'
                )
                root.destroy()
                
                if response:
                    self.logger.info("🧹 Cleanup finale...")
                    self.process_manager.cleanup()
                else:
                    self.logger.info("ℹ️ Server mantenuti attivi")
                    self.logger.info("📍 Porta proxy: 3001, frontend: 3000")
                    # Non fare cleanup, lascia i processi attivi
                    self.process_manager.processes.clear()
                    
            except ImportError:
                # Fallback se tkinter non disponibile
                self.logger.info("🧹 Cleanup automatico (tkinter non disponibile)...")
                self.process_manager.cleanup()


# =============================================================================
# ENTRY POINT
# =============================================================================

if __name__ == "__main__":
    launcher = WebAppLauncher()
    exit_code = launcher.run()
    sys.exit(exit_code)

