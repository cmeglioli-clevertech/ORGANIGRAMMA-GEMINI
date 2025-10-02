# 🤖 AI Agent Collaboration Guide - Clevertech Organigramma v4.3.2

## 🎯 **Quick Context for AI Agents**

Questo progetto è un **organigramma interattivo production-ready** per Clevertech con 467 dipendenti. Sistema completo con:
- ✅ **Smartsheet Integration** - Sincronizzazione dati in tempo reale
- ✅ **13 Badge colorati** per qualifiche professionali
- ✅ **Interfaccia integrata massimizzata** (99% schermo)
- ✅ **Ricerca fuzzy** + **Filtri intelligenti**
- ✅ **Assegnazione smart** basata su algoritmo di punteggio

**Versione**: 4.3.2 (Ristrutturata Ottobre 2025)  
**Status**: ✅ **Production Ready + Documentazione Potenziata per AI Agents**

---

## 🎯 **PRINCIPI FONDAMENTALI - Leggi SEMPRE Prima di Agire**

### **📋 Priorità dell'AI Agent (in ordine)**

1. **🔍 LEGGI → CAPISCI → POI AGISCI**
   - Leggi README.md + questo file completamente PRIMA di toccare codice
   - Cerca file esistenti PRIMA di crearne di nuovi
   - Verifica lo stato attuale PRIMA di assumere cosa serve

2. **✅ NON RICREARE CIÒ CHE ESISTE GIÀ**
   - `.env` file → **MAI crearlo**, è già presente e configurato
   - `package.json` → **NON riscriverlo** se ha 171 pacchetti installati
   - Config files → **Controlla sempre** con `ls` o `Get-Content` prima

3. **🛡️ NON ROMPERE IL CODICE FUNZIONANTE**
   - ❌ **NON refactorare** senza richiesta esplicita
   - ❌ **NON "ottimizzare"** codice complesso (es: buildRoleTree, smart assignment)
   - ❌ **NON cambiare** dimensioni card (w-80 h-[33rem] è standard)
   - ❌ **NON modificare** logica testata per "best practices"

4. **⚡ AGGIORNA, NON FORZARE**
   - Se vedi errore dopo modifica → **Rigenera build** (`npm install`)
   - Se lint/test falliscono → **Controlla se è problema temporaneo** di cache
   - Se porta occupata → **Termina processo esistente**, non cambiare porta
   - Se TypeScript si lamenta → **Verifica types**, non disabilitare strict mode

5. **📍 DOVE AGIRE (Mappa Decisionale)**
   ```
   PROBLEMA → AZIONE
   
   ❌ "npm install installa solo 7 pacchetti"
      ✅ Usa comando PowerShell documentato in QUICK-START.md
   
   ❌ ".env non trovato"
      ✅ CONTROLLA PRIMA se esiste (non crearlo al volo)
      ✅ Se manca davvero → Chiedi all'utente il token
   
   ❌ "Errore TypeScript in build"
      ✅ Leggi TUTTO l'errore
      ✅ Controlla se è file nuovo che hai creato TU
      ✅ Se codice esistente → CHIEDI prima di modificare
   
   ❌ "Server non si avvia"
      ✅ Verifica dipendenze installate (171 pacchetti?)
      ✅ Verifica porte libere (3000, 3001)
      ✅ Leggi log per errore specifico
      ✅ NON modificare configurazioni server al volo
   
   ❌ "Vuoi migliorare il codice?"
      ✅ SOLO se richiesto esplicitamente
      ✅ Altrimenti → Sistema è production-ready, NON toccare
   ```

### **🚫 COSA NON FARE MAI**

| ❌ NON FARE | ✅ FARE INVECE |
|-------------|----------------|
| Creare `.env` senza controllare | `ls .env` prima, chiedi se manca |
| Refactorare codice funzionante | Lascialo com'è salvo richiesta |
| Modificare dimensioni card | Mantieni w-80 h-[33rem] sempre |
| Cambiare porte (3000/3001) | Libera porte occupate |
| Disabilitare linter per "fix rapido" | Risolvi la causa, non il sintomo |
| Installare nuove dipendenze per "best practice" | Usa quelle esistenti |
| Modificare smart assignment algorithm | È complesso e testato, NON toccare |
| Creare file di test/config non richiesti | Minimizza file creati |

### **✅ FLUSSO CORRETTO**

```
1. Leggi README.md + AI-AGENT-GUIDE.md (questo file)
2. Verifica stato attuale (ls, cat package.json, npm list)
3. Identifica problema reale (non assumere)
4. Cerca soluzione documentata (QUICK-START, changelog)
5. Se soluzione nota → Applicala
6. Se problema nuovo → CHIEDI prima di modificare codice core
7. Testa la modifica
8. Documenta se è fix riutilizzabile
```

### **🎓 Esempi Pratici**

**❌ Agent Sbagliato:**
```
User: "Aggiorna le dipendenze"
Agent: *Riscrive package.json con versioni latest*
        *Rompe compatibilità React 19*
        *App non si avvia più*
```

**✅ Agent Corretto:**
```
User: "Aggiorna le dipendenze"
Agent: *Legge package.json attuale*
        *Esegue npm outdated*
        *Vede che tutto è aggiornato*
        "Le dipendenze sono già aggiornate (171 pacchetti, versioni corrette)"
```

**❌ Agent Sbagliato:**
```
User: "Fix TypeScript errors"
Agent: *Aggiunge @ts-ignore dappertutto*
        *Disabilita strict mode*
```

**✅ Agent Corretto:**
```
User: "Fix TypeScript errors"
Agent: *Legge errori specifici*
        *Controlla se sono in codice nuovo o esistente*
        *Se esistente: "Gli errori sono in codice production-ready,
         probabilmente è problema di cache. Rigenero?"*
```

### **💡 Mentalità Corretta**

> **"Questo progetto è PRODUCTION-READY. Non sei qui per migliorarlo, sei qui per mantenerlo o estenderlo su richiesta."**

- ✅ Sistema è **già ottimizzato** (React 19, Vite 6, 467 dipendenti testati)
- ✅ Codice è **già documentato** (architecture, types, comments)
- ✅ Patterns sono **già stabiliti** (src/ structure, card system, colors)
- ✅ Il tuo lavoro è **conservare** questo stato, non "migliorarlo" autonomamente

---

## 🚨 **QUICK FIX - Leggi Prima di Tutto!**

### **⚡ Problema: package.json corrotto / dipendenze mancanti**

**Sintomo**: `npm install` installa solo 7 pacchetti invece di 171. L'app non si avvia.

**Causa**: Il `package.json` a volte si corrompe rimanendo solo con 2 dipendenze (framer-motion e lucide-react).

**Soluzione Rapida (30 secondi)**:
```powershell
# 1. Ripristina package.json completo con PowerShell
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

# 2. Rimuovi node_modules e reinstalla
rm -r node_modules
npm install

# ✅ Risultato atteso: "added 168 packages, audited 171 packages"
```

**Verifica Successo**:
```powershell
Get-Content package.json | Select-Object -First 10
# Dovresti vedere "name": "interactive-organizational-chart", "version": "4.3.1"
```

**Note**:
- ⚠️ Vulnerabilità nota in `xlsx` (Prototype Pollution) - nessun fix disponibile, rischio basso
- ✅ Dopo il fix, l'app è pronta per essere avviata con `npm run dev` + `npm run proxy`

---

## 📁 **Project Structure (UPDATED October 2025)**

### **🗂️ NEW Clean Architecture**
```
ORGANIGRAMMA-GEMINI/
├── 📂 src/                          ← ⭐ TUTTI i file sorgente ora qui
│   ├── 📄 main.tsx                  ← Entry point (era index.tsx)
│   ├── 📄 App.tsx                   ← ⭐ CRITICAL: Main logic
│   ├── 📄 types.ts                  ← Data models
│   ├── 📂 components/               ← UI components
│   │   ├── OrgChartNode.tsx         ← ⭐ Card system
│   │   ├── NavigableOrgChart.tsx    ← Zoom/pan
│   │   ├── SearchBar.tsx
│   │   ├── FilterPanel.tsx
│   │   ├── ExportMenu.tsx
│   │   └── StatsBar.tsx
│   ├── 📂 hooks/
│   │   ├── useOrgSearch.ts          ← Fuzzy search
│   │   └── useFilters.ts            ← Multi-criteria filters
│   └── 📂 services/
│       └── smartsheetService.ts     ← ⭐ Smartsheet API
│
├── 📂 docs/                         ← Documentation
│   ├── 📄 AI-AGENT-GUIDE.md         ← ⭐ This file
│   ├── 📄 ARCHITECTURE.md           ← Technical details
│   ├── 📄 PROJECT-STATUS.md         ← Current status
│   ├── 📄 ENV-SETUP.md              ← Environment setup
│   ├── 📄 SMARTSHEET-INTEGRATION.md ← Smartsheet guide
│   ├── 📄 FINAL-HANDOVER.md         ← Project handover
│   └── 📂 IMMAGINI/                 ← 🖼️ 741 employee photos
│       └── *.png                    ← Used by app dynamically
│
├── 📂 scripts/                      ← Utility scripts
│   ├── update-csv-from-excel.mjs    ← Excel → CSV
│   ├── capture-screenshots.mjs      ← Screenshots
│   └── add-responsabili.cjs         ← Legacy utility
│
├── 📂 public/                       ← Static assets
│   └── building-background.jpg      ← UI background
│
├── 📄 server-proxy.js               ← ⭐ Smartsheet proxy server
├── 📄 start-servers.ps1             ← ⭐ Start script (proxy + frontend)
├── 📄 index.html                    ← HTML entry point
├── 📄 vite.config.ts                ← Vite configuration
├── 📄 tsconfig.json                 ← TypeScript config
├── 📄 package.json                  ← Dependencies
├── 📄 .env                          ← ⭐ Environment variables (git-ignored)
└── 📄 _Suddivisione Clevertech light.csv ← Fallback CSV data
```

---

## 🚀 **Quick Start for AI Agents**

### **📋 First Commands (3 minutes)**

```bash
# 1. Understand context
pwd                     # You're in ORGANIGRAMMA-GEMINI/
ls src/                 # All source code here
ls docs/                # All documentation here

# 2. Start application (TWO servers required)
./start-servers.ps1     # Starts BOTH proxy + frontend
# OR manually:
npm run proxy           # Terminal 1: Smartsheet proxy (port 3001)
npm run dev             # Terminal 2: Frontend Vite (port 3000)

# 3. Open browser
http://localhost:3000   # Main app
http://localhost:3001/health  # Proxy health check
```

### **🔍 Explore the App (2 minutes)**
1. **🏢 Sedi** → Geographic hierarchy view
2. **👥 Ruoli** → Role-based hierarchy view
3. **🔍 Search** → Type name/role (instant fuzzy search)
4. **🎛️ Filters** → Apply criteria (highlights without hiding)
5. **↻ Smartsheet** → Sync data from Smartsheet (requires token)
6. **📤 Export** → JSON/CSV/Print

---

## 📄 **ESSENTIAL FILES (MUST READ)**

### **1️⃣ src/App.tsx** ⭐ CRITICAL
```typescript
// Main application logic - 1570 lines
// KEY SECTIONS:
├── Lines 1-445:    Data types, CSV parsing, qualifications
├── Lines 447-570:  buildOrgTree() - Geographic hierarchy
├── Lines 572-1050: buildRoleTree() - Role-based hierarchy  
├── Lines 1052-1569: React component, state, UI

// CRITICAL FUNCTIONS:
buildOrgTree(employees)     // Creates sede→dept→office→person tree
buildRoleTree(employees)    // Creates role-based smart hierarchy
parseCsvEmployees(csv)      // Parses CSV/Smartsheet data
resolveQualification(name)  // Maps qualification → color/order
```

### **2️⃣ src/components/OrgChartNode.tsx** ⭐ CRITICAL
```typescript
// Professional card rendering - 447 lines
// KEY SECTIONS:
├── Lines 17-81:  Badge colors (13 qualifications)
├── Lines 83-447: Card rendering logic

// CARD SYSTEM:
- Uniform dimensions: w-80 h-[33rem] (320×528px)
- Centered badges: top-0 -translate-y-1/2
- Dynamic colors per qualification
- Type-specific information display
```

### **3️⃣ src/services/smartsheetService.ts** ⭐ NEW
```typescript
// Smartsheet API integration - 234 lines
// KEY FUNCTIONS:
fetchSmartsheetData()         // Fetches data via proxy
convertSmartsheetToCSV()      // Converts to app format
testSmartsheetConnection()    // Tests credentials

// FLOW: Smartsheet API → Proxy → Frontend → CSV format → App
```

### **4️⃣ server-proxy.js** ⭐ NEW
```typescript
// Node.js proxy server - 126 lines
// PURPOSE: Bypass CORS for Smartsheet API calls
// PORT: 3001
// ENDPOINT: GET /api/smartsheet/sheets/:sheetId

// Environment variables:
SMARTSHEET_TOKEN           // Backend token (preferred)
VITE_SMARTSHEET_TOKEN      // Frontend token (fallback)
VITE_SMARTSHEET_SHEET_ID   // Sheet ID
```

---

## 🔧 **Environment Setup**

### **⚠️ REQUIRED: .env File**

Create `.env` in project root:
```env
# Smartsheet API Configuration
VITE_SMARTSHEET_TOKEN=your_token_here_from_smartsheet
VITE_SMARTSHEET_SHEET_ID=911474324465540
```

**How to get token**: See `docs/ENV-SETUP.md`

---

## 🎨 **Key Implementations**

### **1️⃣ 13-Color Qualification System**
```typescript
// src/components/OrgChartNode.tsx
const qualificationColors: Record<string, string> = {
  "dirigente": "bg-red-100 text-red-800",              // 🔴 CEO
  "direttivo (quadro / gestione del cambiamento)": "bg-orange-100",  // 🟠 Director
  "direttivo (responsabile di team/processi)": "bg-yellow-100",      // 🟡 Manager
  "direttivo (tecnico/organizzativo)": "bg-blue-100",   // 🔵 Supervisor
  "tecnico specializzato": "bg-green-100",              // 🟢 Specialist
  "tecnico qualificato": "bg-purple-100",               // 🟣 Qualified
  "tecnico esecutivo": "bg-cyan-100",                   // 🔵 Executive
  "operativo specializzato": "bg-amber-100",            // 🟠 Skilled
  "operativo qualificato": "bg-rose-100",               // 🌹 Qualified Op
  "operativo base": "bg-gray-100",                      // ⚫ Base
  "apprendista impiegato": "bg-lime-100",               // 🟢 Trainee
  "apprendista operaio": "bg-stone-100",                // 🟤 Worker Trainee
  // ... + synonyms mapping
};
```

### **2️⃣ Smart Employee Assignment Algorithm**
```typescript
// src/App.tsx - buildRoleTree()
// Scoring: SEDE(3) + UFFICIO(2) + ORDER(1) = Best Manager

function scoreEmployeeManagerMatch(emp: Employee, mgr: Employee): number {
  let score = 0;
  if (emp.sede === mgr.sede) score += 3;        // Same location priority
  if (emp.office === mgr.office) score += 2;    // Same office priority
  if (mgr.order < emp.order) score += 1;        // Hierarchical order
  return score;
}

// Result: Logical employee-manager relationships based on context
```

### **3️⃣ Photo Loading System**
```typescript
// src/App.tsx lines 357-378
const employeeImageModules = import.meta.glob(
  "../docs/IMMAGINI/**/*.png", 
  { eager: true, query: "?url", import: "default" }
);

// Priority:
// 1. docs/IMMAGINI/{normalized-name}.png  ← 741 local photos
// 2. CSV photo field (if HTTP URL)
// 3. Fallback avatar SVG
```

---

## 🎯 **Common Tasks**

### **✅ Add New Qualification Color**
```typescript
// 1. Edit src/components/OrgChartNode.tsx
const qualificationColors: Record<string, string> = {
  "new-qualification": "bg-indigo-100 text-indigo-800 border-indigo-200",
};

// 2. Add to src/App.tsx QUALIFICATION_DEFINITION_SEEDS
{
  label: "New Qualification",
  shortLabel: "New",
  order: 13,
  colorClass: "bg-indigo-100 text-indigo-800 border-indigo-200",
}
```

### **✅ Sync Data from Smartsheet**
```typescript
// In browser: Click "↻ Smartsheet" button in header
// OR programmatically:
const csvData = await fetchSmartsheetData();
const employees = parseCsvEmployees(csvArrayToString(csvData));
```

### **✅ Add New Search Field**
```typescript
// Edit src/hooks/useOrgSearch.ts
const fuseOptions = {
  keys: [
    { name: 'node.name', weight: 0.3 },
    { name: 'node.metadata.newField', weight: 0.1 },  // NEW
  ]
};
```

### **✅ Modify Card Information**
```typescript
// Edit src/components/OrgChartNode.tsx switch statement
case "person":
  if (node.metadata?.newField) {
    infoItems.push({ 
      label: "New Field", 
      value: node.metadata.newField 
    });
  }
  break;
```

---

## 🛠️ **Development Guidelines**

### **✅ DO THESE**
1. ✅ **Follow src/ structure** - All code in src/, docs in docs/
2. ✅ **Use TypeScript** - Strong typing everywhere
3. ✅ **Maintain uniform cards** - w-80 h-[33rem] always
4. ✅ **Update documentation** - Keep this guide updated
5. ✅ **Test with 467 employees** - Full dataset performance

### **❌ AVOID THESE**
1. ❌ **Don't break card uniformity** - Never change w-80 h-[33rem]
2. ❌ **Don't modify smart assignment** - Complex tested algorithm
3. ❌ **Don't add scroll bars to cards** - Removed intentionally
4. ❌ **Don't move files out of src/** - New structure is standard
5. ❌ **Don't commit .env** - Already in .gitignore

---

## 📊 **Data Flow**

```
┌─────────────┐
│ Smartsheet  │ ← Primary source (467 employees)
└──────┬──────┘
       │ API call (via proxy)
       ↓
┌──────────────┐
│ Proxy Server │ Port 3001 (CORS bypass)
│server-proxy.js│
└──────┬───────┘
       │ JSON response
       ↓
┌──────────────┐
│smartsheetService.ts│ Convert to CSV format
└──────┬───────┘
       │ CSV array
       ↓
┌──────────────┐
│ parseCsvEmployees() │ Parse → Employee[]
└──────┬───────┘
       │ Employee array
       ├─→ buildOrgTree()     → Sede hierarchy
       └─→ buildRoleTree()    → Role hierarchy
              ↓
       ┌──────────────┐
       │ Node Tree    │
       └──────┬───────┘
              │
              ↓
       ┌──────────────┐
       │OrgChartNode  │ Render cards with badges
       └──────────────┘
```

---

## 🧪 **Testing Checklist**

### **After Any Code Change**
```bash
# 1. Start servers
npm run proxy & npm run dev

# 2. Visual test
✅ All cards same size?
✅ Badges centered on borders?
✅ 13 different colors visible?
✅ Photos loading correctly?

# 3. Functional test
✅ Search works (<100ms)?
✅ Filters highlight correctly?
✅ Zoom/pan smooth?
✅ Smartsheet sync works?
✅ Export functions work?

# 4. Performance test
✅ Initial load <2s?
✅ No console errors?
✅ Memory usage reasonable?
```

---

## 📚 **Documentation Index**

| File | Purpose | When to Read |
|------|---------|-------------|
| **AI-AGENT-GUIDE.md** | ⭐ This file - Quick start | First thing |
| **ARCHITECTURE.md** | Technical details | Understanding structure |
| **PROJECT-STATUS.md** | Current status | Check what's done |
| **ENV-SETUP.md** | Environment setup | Setting up .env |
| **SMARTSHEET-INTEGRATION.md** | Smartsheet guide | API integration |
| **FINAL-HANDOVER.md** | Project handover | Complete overview |
| **README.md** | User guide | Using the app |

---

## 🎯 **Success Indicators**

### **✅ Everything Works When:**
- All 467 employees render with colored badges
- All cards are exactly 320×528px
- Search responds in <100ms
- Filters work without hiding structure
- Smartsheet sync updates data correctly
- Interface uses 99% of screen
- No overlaps between badges and tree lines
- Both proxy + frontend servers running
- Photos load from docs/IMMAGINI/

---

## 🔄 **Recent Changes (October 2025)**

### **✅ Completed Refactoring**
1. ✅ **Moved all source to src/** - Clean architecture
2. ✅ **Fixed Vite glob deprecation** - Updated to query: "?url"
3. ✅ **Cleaned up project** - Removed old screenshots, backups
4. ✅ **Fixed start-servers.ps1** - Proper UTF-8 encoding
5. ✅ **Separated env variables** - Backend uses SMARTSHEET_TOKEN
6. ✅ **Updated all imports** - Reflect new src/ structure

### **🗑️ Removed (No Longer Needed)**
- ❌ `/screenshots/` - Old screenshots
- ❌ `/docs/New_files/` - Temporary files
- ❌ `/image/` - Temp image folder
- ❌ `/docs/improvement/` - Old planning docs
- ❌ `metadata.json` - Unused file
- ❌ `*-CLEVTECM012.tsx/md/csv` - Old backups

---

## 💡 **Pro Tips for AI Agents**

### **🎯 When Asked "Understand the Context"**
1. Read this file first (AI-AGENT-GUIDE.md)
2. Check src/App.tsx for main logic
3. Check src/components/OrgChartNode.tsx for UI
4. Run app to see it live

### **🎯 When Adding Features**
1. Follow existing patterns in src/
2. Update TypeScript types in src/types.ts
3. Test with full 467-employee dataset
4. Update this guide if significant

### **🎯 When Debugging**
1. Check browser console (F12)
2. Check proxy server logs (Terminal 1)
3. Check Vite dev logs (Terminal 2)
4. Verify .env has correct token

---

**🤖 This system is production-ready with Smartsheet integration. Architecture is clean, documented, and maintainable.**

*📅 Last Updated: October 2025 - v4.3.2*  
*📝 Keep this guide updated when making significant changes.*
*🎯 Quick fixes documented - setup time reduced from 15+ min to <2 min*
