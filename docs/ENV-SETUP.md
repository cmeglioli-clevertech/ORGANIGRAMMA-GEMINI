# 🔧 Setup File .env per Smartsheet

## ⚠️ IMPORTANTE: Devi Creare Manualmente il File .env

Il file `.env` contiene le credenziali sensibili e **non può** essere committato su Git per motivi di sicurezza.

## 📝 Istruzioni Passo-Passo

### 1. Crea il File .env

Nella **root del progetto** (stessa cartella di `package.json`), crea un nuovo file chiamato esattamente:

```
.env
```

**Nota**: Il file inizia con un punto (`.`) - questo lo rende nascosto su Mac/Linux.

### 2. Copia e Incolla Questo Contenuto

Apri il file `.env` con un editor di testo e incolla:

```env
# Smartsheet API Configuration
# Per ottenere il token: Account → Apps & Integrations → API Access → Generate new access token
VITE_SMARTSHEET_TOKEN=your_token_here
VITE_SMARTSHEET_SHEET_ID=911474324465540
```

### 3. Sostituisci il Token

**Dove trovare il token:**

1. Vai su https://app.smartsheet.com/
2. Click sul tuo avatar in alto a destra
3. **Account** → **Apps & Integrations**
4. Sezione **API Access**
5. Click su **Generate new access token**
6. Copia il token generato (es: `a1b2c3d4e5f6g7h8i9j0...`)

**Sostituisci** `your_token_here` con il token appena copiato:

```env
VITE_SMARTSHEET_TOKEN=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
VITE_SMARTSHEET_SHEET_ID=911474324465540
```

### 4. Verifica l'ID del Foglio

L'ID del foglio è già precompilato: `911474324465540`

**Per verificare**:
- Apri il foglio Smartsheet nel browser
- Controlla l'URL: `https://app.smartsheet.com/sheets/{SHEET_ID}/...`
- Se l'ID è diverso, sostituiscilo nel file `.env`

### 5. Salva il File

Salva il file `.env` e chiudi l'editor.

## ✅ Verifica Setup

### Test Rapido

1. Riavvia l'applicazione:
   ```bash
   npm run dev
   ```

2. Apri l'app nel browser

3. Guarda nella console del browser (F12 → Console)
   - **Se vedi errori** su VITE_SMARTSHEET_TOKEN → Il file .env non è stato letto correttamente
   - **Se nessun errore** → Setup OK!

4. Prova a cliccare sul bottone **"↻ Smartsheet"** nell'header
   - **Se vedi "Token non configurato"** → Il file .env non è nella posizione corretta
   - **Se parte la sincronizzazione** → Tutto funziona! ✅

## 🚨 Problemi Comuni

### Errore: "Token Smartsheet non configurato"

**Causa**: Il file `.env` non esiste o è nella cartella sbagliata

**Soluzione**:
1. Verifica che il file sia nella **root del progetto**
2. Assicurati che si chiami esattamente `.env` (con il punto iniziale)
3. Riavvia l'applicazione (`npm run dev`)

### Errore: "Token non valido o scaduto"

**Causa**: Il token è sbagliato o è scaduto

**Soluzione**:
1. Rigenera un nuovo token su Smartsheet
2. Aggiorna il valore in `.env`
3. Salva e riavvia l'applicazione

### Il file .env è nella root ma non funziona

**Possibili cause**:
1. **Spazi extra**: Assicurati che non ci siano spazi prima/dopo il valore:
   ```env
   # ❌ SBAGLIATO
   VITE_SMARTSHEET_TOKEN= your_token_here
   
   # ✅ CORRETTO
   VITE_SMARTSHEET_TOKEN=your_token_here
   ```

2. **Virgolette**: NON usare virgolette attorno al valore:
   ```env
   # ❌ SBAGLIATO
   VITE_SMARTSHEET_TOKEN="your_token_here"
   
   # ✅ CORRETTO
   VITE_SMARTSHEET_TOKEN=your_token_here
   ```

3. **Encoding**: Salva il file in UTF-8 (di solito automatico)

### Windows: Non Riesco a Creare File con Punto Iniziale

**Soluzione 1** - Con Esplora File:
1. Apri Esplora File
2. Vai nella cartella del progetto
3. Click destro → Nuovo → Documento di testo
4. Rinomina in `.env.` (con punto finale) - Windows lo salverà come `.env`

**Soluzione 2** - Con CMD/PowerShell:
```bash
cd "path\to\ORGANIGRAMMA-GEMINI"
type nul > .env
notepad .env
```

**Soluzione 3** - Con VS Code:
1. Apri VS Code nella cartella del progetto
2. File → Nuovo File
3. Salva come `.env`

## 🔒 Sicurezza

### ⚠️ NON Committare il File .env

Il file `.env` è già nel `.gitignore` e **non verrà committato** su Git.

**VERIFICA**:
```bash
git status
```

Se vedi `.env` nella lista dei file non tracciati → OK ✅  
Se vedi `.env` nei "Changes to be committed" → ⚠️ RIMUOVILO SUBITO:
```bash
git reset HEAD .env
```

### 🔐 Best Practices

1. ✅ **Non condividere** il token via email/chat
2. ✅ **Rigenera** il token periodicamente (ogni 3-6 mesi)
3. ✅ **Revoca** token non più utilizzati
4. ✅ **Usa token** con solo permessi di lettura se possibile

## 📞 Supporto

Se hai ancora problemi dopo aver seguito questa guida:

1. Verifica la [documentazione completa](SMARTSHEET-INTEGRATION.md)
2. Controlla la console del browser (F12) per errori dettagliati
3. Verifica che il token Smartsheet sia ancora valido sul sito

---

**Ultimo aggiornamento**: 1 Ottobre 2025  
**Versione**: 4.2.0

