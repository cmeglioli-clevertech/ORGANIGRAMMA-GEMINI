# ⚡ Quick Start - Clevertech Organigramma

> **🤖 SEI UN AI AGENT?** Leggi [docs/AI-AGENT-GUIDE.md](docs/AI-AGENT-GUIDE.md) sezione "PRINCIPI FONDAMENTALI" PRIMA di toccare codice. Eviterai di danneggiare il sistema production-ready.

---

## 🚨 **PROBLEMA COMUNE - Leggi Prima!**

### **Se `npm install` installa solo 7 pacchetti:**

Il `package.json` a volte si corrompe. **Soluzione in 30 secondi**:

```powershell
# 1. Copia-incolla TUTTO questo comando in PowerShell:
@'
{
  "name": "interactive-organizational-chart",
  "private": true,
  "version": "4.3.2",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "screenshot": "node scripts/capture-screenshots.mjs",
    "proxy": "node server-proxy.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "express": "^5.1.0",
    "fuse.js": "^7.1.0",
    "lucide-react": "^0.544.0",
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-hot-toast": "^2.6.0",
    "react-zoom-pan-pinch": "^3.7.0",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "@playwright/test": "^1.55.1",
    "@types/node": "^22.14.0",
    "@vitejs/plugin-react": "^5.0.0",
    "playwright": "^1.55.1",
    "ts-node": "^10.9.2",
    "typescript": "~5.8.2",
    "vite": "^6.2.0"
  }
}
'@ | Set-Content -Path package.json

# 2. Poi esegui:
rm -r node_modules
npm install
```

**✅ Verifica**: Dovresti vedere "added 168 packages, audited 171 packages"

---

## ✅ **Dopo il Fix - Avvio Standard**

### **Opzione 1: WebApp Launcher (Raccomandato)**
```powershell
# Doppio click su:
start_webapp.pyw

# Oppure da terminale:
python start_webapp.pyw
```
→ Avvia automaticamente proxy + frontend + browser

### **Opzione 2: Avvio Manuale (2 terminali)**

**Terminale 1 - Proxy Smartsheet:**
```powershell
npm run proxy
```

**Terminale 2 - Frontend:**
```powershell
npm run dev
```

Poi apri: `http://localhost:3000`

---

## 📚 **Documentazione Completa**

- **README.md** - Guida completa utente
- **docs/AI-AGENT-GUIDE.md** - Guida per AI agents
- **docs/SMARTSHEET-INTEGRATION.md** - Setup integrazione Smartsheet

---

## 🆘 **Troubleshooting Rapido**

### **Porta 3000 occupata:**
```powershell
# Trova processo
netstat -ano | findstr :3000

# Termina processo (sostituisci PID)
taskkill /PID <PID> /F
```

### **Chrome non si apre con start_webapp.pyw:**
- Apri manualmente `http://localhost:3000` nel browser
- I server restano attivi in background

### **Smartsheet sync non funziona:**
- Verifica che `.env` contenga `VITE_SMARTSHEET_TOKEN`
- Controlla che proxy sia attivo su porta 3001

---

**🎉 App pronta! Buon lavoro!**

*📅 Ultimo aggiornamento: 2 Ottobre 2025*

