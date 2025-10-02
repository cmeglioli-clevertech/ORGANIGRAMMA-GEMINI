# 🚀 Clevertech Organigramma - WebApp Launcher

Script Python per avviare automaticamente l'organigramma Clevertech in modalità webapp (finestra senza interfaccia browser).

## ✨ **Caratteristiche**

- ✅ **Avvio automatico** - Doppio click per avviare proxy + frontend + browser
- ✅ **Modalità App** - Finestra Chrome pulita senza barra URL e pulsanti
- ✅ **Zero configurazione** - Funziona out-of-the-box con impostazioni default
- ✅ **Cleanup automatico** - Termina tutti i processi alla chiusura della finestra
- ✅ **Logging completo** - Log dettagliati per troubleshooting
- ✅ **Configurazione esterna** - Personalizza tramite `webapp_config.json`

---

## 📋 **Requisiti**

### **Software Necessario**
- ✅ **Python 3.8+** (preinstallato su Windows 10/11 o scaricabile da [python.org](https://www.python.org))
- ✅ **Node.js 18+** e **npm** (per eseguire i server)
- ✅ **Chrome o Edge** (per la finestra webapp)

### **Verifica Installazione**
```bash
# Verifica Python
python --version
# Output atteso: Python 3.8.x o superiore

# Verifica Node.js e npm
node --version
npm --version
```

---

## 🚀 **Uso Rapido**

### **Metodo 1: Doppio Click (Raccomandato)**
1. Naviga alla cartella del progetto
2. **Doppio click su `start_webapp.pyw`**
3. Attendi qualche secondo (i server si avviano in background)
4. Si apre automaticamente una finestra con l'organigramma
5. **Chiudi la finestra** quando hai finito → tutti i processi si terminano automaticamente

### **Metodo 2: Da Terminale**
```bash
# Nella cartella del progetto
python start_webapp.pyw

# Su Windows puoi anche fare:
pythonw start_webapp.pyw
```

---

## ⚙️ **Configurazione**

### **File di Configurazione (`webapp_config.json`)**

Puoi personalizzare il comportamento modificando `webapp_config.json`:

```json
{
  "servers": {
    "proxy": {
      "port": 3001,              // Porta proxy Smartsheet
      "command": "npm run proxy", // Comando di avvio
      "startup_timeout": 30       // Timeout in secondi
    },
    "frontend": {
      "port": 3000,              // Porta frontend Vite
      "command": "npm run dev",
      "startup_timeout": 60
    }
  },
  "browser": {
    "url": "http://localhost:3000",
    "window": {
      "width": 1400,             // Larghezza finestra (px)
      "height": 900,             // Altezza finestra (px)
      "position_x": 100,         // Posizione X (px)
      "position_y": 100          // Posizione Y (px)
    }
  },
  "logging": {
    "level": "INFO",             // DEBUG, INFO, WARNING, ERROR
    "max_bytes": 5242880,        // 5MB max per file log
    "backup_count": 3            // Numero backup rotazione
  }
}
```

### **Esempi di Personalizzazione**

#### **Finestra a Schermo Intero**
```json
"window": {
  "width": 1920,
  "height": 1080,
  "position_x": 0,
  "position_y": 0
}
```

#### **Porte Custom (se conflitti)**
```json
"servers": {
  "proxy": {
    "port": 3011,
    "command": "npm run proxy",
    "startup_timeout": 30
  },
  "frontend": {
    "port": 3010,
    "command": "npm run dev",
    "startup_timeout": 60
  }
}
```

**⚠️ Nota**: Se cambi le porte, ricordati di aggiornare anche `browser.url`!

#### **Logging Dettagliato**
```json
"logging": {
  "level": "DEBUG",
  "max_bytes": 10485760,
  "backup_count": 5
}
```

---

## 📝 **Logging**

### **File di Log**
Tutti gli eventi vengono registrati in `webapp_startup.log` nella cartella del progetto.

### **Rotazione Automatica**
- Log principale: `webapp_startup.log` (max 5MB)
- Backup automatici: `webapp_startup.log.1`, `webapp_startup.log.2`, `webapp_startup.log.3`
- Pulizia automatica dei log più vecchi

### **Visualizzare i Log**
```bash
# Visualizza log in tempo reale (Windows PowerShell)
Get-Content webapp_startup.log -Wait -Tail 20

# Visualizza log completo
type webapp_startup.log

# Su Linux/Mac
tail -f webapp_startup.log
```

### **Livelli di Log**
- `DEBUG`: Informazioni dettagliate (utile per debugging)
- `INFO`: Eventi normali (default, consigliato)
- `WARNING`: Avvisi non critici
- `ERROR`: Errori bloccanti
- `CRITICAL`: Errori fatali

---

## 🔧 **Troubleshooting**

### **Problema: "Chrome/Edge non trovato"**

**Causa**: Lo script non riesce a trovare Chrome o Edge installati.

**Soluzioni**:
1. Verifica che Chrome o Edge siano installati
2. I percorsi standard cercati sono:
   - `C:\Program Files\Google\Chrome\Application\chrome.exe`
   - `C:\Program Files (x86)\Google\Chrome\Application\chrome.exe`
   - `%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe`
   - Microsoft Edge in `C:\Program Files\Microsoft\Edge\Application\msedge.exe`
3. Se installati in percorsi custom, aprire manualmente `http://localhost:3000`

---

### **Problema: "Porta già in uso"**

**Causa**: Le porte 3000 o 3001 sono già utilizzate da altri processi.

**Soluzioni**:

#### **Opzione A: Terminare processi esistenti**
```bash
# Windows PowerShell - Trova processo su porta 3000
netstat -ano | findstr :3000

# Termina processo (sostituisci PID con il numero trovato)
taskkill /PID <PID> /F
```

#### **Opzione B: Usare porte diverse**
Modifica `webapp_config.json`:
```json
"servers": {
  "proxy": { "port": 3011, ... },
  "frontend": { "port": 3010, ... }
},
"browser": {
  "url": "http://localhost:3010",
  ...
}
```

---

### **Problema: "Server non risponde dopo timeout"**

**Causa**: I server impiegano più tempo del timeout configurato ad avviarsi.

**Soluzione**: Aumenta i timeout in `webapp_config.json`:
```json
"servers": {
  "proxy": {
    "startup_timeout": 60
  },
  "frontend": {
    "startup_timeout": 120
  }
}
```

---

### **Problema: "npm non trovato"**

**Causa**: Node.js/npm non installati o non nel PATH.

**Soluzione**:
1. Installa Node.js da [nodejs.org](https://nodejs.org)
2. Riavvia il terminale/PC dopo installazione
3. Verifica: `npm --version`

---

### **Problema: Script si avvia ma non succede nulla**

**Causa**: Lo script è in esecuzione ma nascosto (è un `.pyw`).

**Soluzione**:
1. Controlla `webapp_startup.log` per vedere cosa sta succedendo
2. Verifica che i processi `node.exe` siano avviati nel Task Manager
3. Prova ad aprire manualmente `http://localhost:3000` nel browser

---

### **Problema: Finestra si chiude ma processi restano attivi**

**Causa**: Cleanup fallito per qualche motivo.

**Soluzione manuale**:
```bash
# Windows - Termina tutti i processi node
taskkill /F /IM node.exe

# Oppure usa Task Manager e termina manualmente i processi node
```

---

## 🎯 **Come Funziona**

### **Flusso di Esecuzione**

```
1. [Validazione]
   ├─ Carica webapp_config.json
   ├─ Setup logging
   └─ Registra cleanup handlers

2. [Avvio Proxy Server]
   ├─ Esegue: npm run proxy
   ├─ Processo in background (nascosto)
   └─ Attende porta 3001 disponibile

3. [Avvio Frontend Server]
   ├─ Esegue: npm run dev
   ├─ Processo in background (nascosto)
   └─ Attende porta 3000 disponibile

4. [Health Checks]
   ├─ Polling porta 3001 (max 30s)
   ├─ Polling porta 3000 (max 60s)
   └─ Timeout → errore e cleanup

5. [Apertura Browser]
   ├─ Cerca Chrome/Edge
   ├─ Apre in modalità --app
   └─ Finestra senza UI browser

6. [Monitoraggio]
   ├─ Monitora processo browser
   └─ Quando si chiude → cleanup

7. [Cleanup]
   ├─ Termina processo proxy
   ├─ Termina processo frontend
   └─ Log finale e exit
```

### **Modalità App Chrome**

La finestra viene aperta con i flag:
- `--app=http://localhost:3000` - Modalità applicazione
- `--window-size=1400,900` - Dimensioni finestra
- `--window-position=100,100` - Posizione iniziale
- `--disable-background-timer-throttling` - Performance ottimali
- `--disable-backgrounding-occluded-windows` - Mantiene app attiva

---

## 🛡️ **Sicurezza e Cleanup**

### **Gestione Processi**
- Tutti i processi avviati vengono tracciati
- Cleanup automatico tramite `atexit` handler
- Signal handlers per SIGTERM/SIGINT
- Terminazione gentile con fallback a kill forzato

### **Nessun Processo Zombie**
- Timeout di 5s per terminazione gentile
- Kill forzato se processo non risponde
- Verifica stato processo prima del cleanup

---

## 📚 **FAQ**

### **Q: Posso usare un altro browser?**
A: Attualmente supporta Chrome e Edge (Chromium-based). Altri browser non supportano la modalità `--app`.

### **Q: Posso modificare lo script?**
A: Sì, è Python standard. Modifica `start_webapp.pyw` secondo le tue esigenze.

### **Q: Lo script funziona su Mac/Linux?**
A: Parzialmente. La logica è cross-platform ma i percorsi Chrome sono ottimizzati per Windows. Adatta le funzioni di ricerca browser per altri OS.

### **Q: Posso creare un'icona desktop?**
A: Sì! Crea un collegamento a `start_webapp.pyw` e personalizza l'icona.

### **Q: Come disabilito i log?**
A: In `webapp_config.json` imposta `"level": "ERROR"` per ridurre i log al minimo.

### **Q: I server restano attivi se lo script crasha?**
A: No, gli handler di cleanup terminano sempre i processi, anche in caso di eccezioni.

---

## 🎨 **Personalizzazioni Avanzate**

### **Cambiare Titolo Finestra**
Chrome in modalità `--app` usa il `<title>` della pagina HTML. Modifica `index.html`:
```html
<title>Clevertech Organigramma</title>
```

### **Icona Personalizzata per Collegamento**
1. Crea un collegamento a `start_webapp.pyw`
2. Tasto destro → Proprietà
3. Cambia icona → Seleziona `.ico` custom

### **Aggiungere Notifiche Windows**
Installa `win10toast`:
```bash
pip install win10toast
```

Modifica lo script per aggiungere notifiche toast.

---

## 📄 **Licenza**

Proprietà di Clevertech. Uso interno.

---

## 🤝 **Supporto**

Per problemi o domande:
1. Controlla `webapp_startup.log`
2. Consulta questa documentazione
3. Contatta l'IT Clevertech

---

**🎉 Enjoy your Clevertech Organigramma WebApp!**

