# 🤖 AI Agent Collaboration Guide - Clevertech Organigramma v4.1.0

## 🎯 **Quick Context for AI Agents**

Questo progetto è un **organigramma interattivo production-ready** per Clevertech con 467 dipendenti. Sistema completo con:
- ✅ **Smartsheet Integration** - Sincronizzazione dati in tempo reale
- ✅ **13 Badge colorati** per qualifiche professionali
- ✅ **Interfaccia integrata massimizzata** (99% schermo)
- ✅ **Ricerca fuzzy** + **Filtri intelligenti**
- ✅ **Assegnazione smart** basata su algoritmo di punteggio

**Versione**: 4.1.0 (Ristrutturata Ottobre 2025)  
**Status**: ✅ **Production Ready + Smartsheet Integration**

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

*📅 Last Updated: October 2025 - v4.1.0*  
*📝 Keep this guide updated when making significant changes.*
