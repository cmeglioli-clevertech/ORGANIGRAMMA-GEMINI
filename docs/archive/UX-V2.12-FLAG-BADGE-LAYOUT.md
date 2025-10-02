# UX v2.12 - Badge Bandierina e Layout Ottimizzato

**Data**: 2025-10-01  
**Versione**: v2.12  
**Status**: ✅ Implementato e verificato

---

## 🎯 Obiettivo

Ottimizzare lo spazio nelle card spostando la bandierina della sede come badge in alto a sinistra, eliminando la riga di testo dedicata. Questo libera spazio verticale per:
1. **Ingrandire** le informazioni di dipartimento e ufficio
2. **Riportare** il conteggio team sotto le altre info
3. **Migliorare** la gerarchia visiva complessiva

---

## 📋 Modifiche Implementate

### **1. Badge Bandierina in Alto a Sinistra** 🏴

**Prima**: Bandierina + testo sede occupavano uno slot (24px) nel centro della card  
**Dopo**: Bandierina come badge circolare in alto a sinistra (posizione assoluta)

```typescript
{/* Badge Bandierina Sede - In alto a sinistra */}
{node.type === "person" && node.metadata?.flag && (
  <div className="absolute top-3 left-3 w-12 h-12 rounded-full 
                  bg-white shadow-lg border-2 border-slate-200
                  flex items-center justify-center overflow-hidden z-20">
    <img 
      src={`https://flagcdn.com/w40/${node.metadata.flag}.png`}
      alt={node.metadata.sede}
      className="w-full h-full object-cover"
      title={node.metadata.sede}
    />
  </div>
)}
```

**Caratteristiche**:
- ✅ **Dimensione**: 48×48px (w-12 h-12)
- ✅ **Posizione**: top-3 left-3 (12px dal bordo)
- ✅ **Stile**: Cerchio bianco con ombra e bordo
- ✅ **Z-index**: 20 (sopra la foto)
- ✅ **Tooltip**: Mostra il nome della sede al hover (`title`)

**Risparmio spazio verticale**: -24px (slot sede rimosso)

---

### **2. Layout Informazioni Semplificato**

#### **Struttura Prima** (6 slot)
```
Nome (64px)
Ruolo (52px)
Sede (24px) ← RIMOSSO
Dipartimento (22px)
Ufficio (22px)
Team (22px)
──────────────
TOTALE: ~206px
```

#### **Struttura Dopo** (5 slot)
```
Nome (64px)
Ruolo (52px) + mb-3
Dipartimento (26px) ← INGRANDITO
Ufficio (26px) ← INGRANDITO
Team (26px) ← INGRANDITO
──────────────
TOTALE: ~194px + migliore spacing
```

---

### **3. Informazioni Ingrandite** 📈

#### **Dipartimento (Slot 3)**
**Prima**: 14px font, 4×4px icon, 22px altezza  
**Dopo**: 16px font, 5×5px icon, 26px altezza

```typescript
{/* Slot 3: Dipartimento - Ingrandito */}
<div className="min-h-[26px] flex items-center justify-center">
  {node.metadata?.department ? (
    <div className="flex items-center justify-center gap-2 text-slate-600">
      <Building2 className="w-5 h-5 flex-shrink-0" />
      <span className="text-[16px] font-semibold line-clamp-1">
        {node.metadata.department}
      </span>
    </div>
  ) : (
    <div className="h-[26px]" />
  )}
</div>
```

**Incrementi**:
- Font: 14px → **16px** (+14%)
- Icona: 4px → **5px** (+25%)
- Altezza: 22px → **26px** (+18%)
- Peso: `medium` → **`semibold`**

#### **Ufficio (Slot 4)**
**Prima**: 14px font, 4×4px icon, 22px altezza  
**Dopo**: 16px font, 5×5px icon, 26px altezza

```typescript
{/* Slot 4: Ufficio - Ingrandito */}
<div className="min-h-[26px] flex items-center justify-center">
  {node.metadata?.office ? (
    <div className="flex items-center justify-center gap-2 text-slate-600">
      <Briefcase className="w-5 h-5 flex-shrink-0" />
      <span className="text-[16px] font-semibold line-clamp-1">
        {node.metadata.office}
      </span>
    </div>
  ) : (
    <div className="h-[26px]" />
  )}
</div>
```

**Incrementi**: Identici a Dipartimento

#### **Team (Slot 5)**
**Prima**: 14px font, 4×4px icon, 22px altezza, `slate-500` (chiaro)  
**Dopo**: 16px font, 5×5px icon, 26px altezza, `slate-600` (più scuro)

```typescript
{/* Slot 5: Team size - Ingrandito */}
<div className="min-h-[26px] flex items-center justify-center">
  {node.metadata?.stats?.directs !== undefined ? (
    <div className="flex items-center justify-center gap-2 text-[16px] text-slate-600 font-semibold">
      <UsersIcon className="w-5 h-5" />
      <span>Team: {node.metadata.stats.directs}</span>
    </div>
  ) : (
    <div className="h-[26px]" />
  )}
</div>
```

**Incrementi**:
- Font: 14px → **16px** (+14%)
- Icona: 4px → **5px** (+25%)
- Altezza: 22px → **26px** (+18%)
- Peso: `medium` → **`semibold`**
- Colore: `slate-500` → **`slate-600`** (più visibile)

---

### **4. Spacing Ottimizzato**

**Ruolo → Dipartimento**: Aumentato `mb-2` → `mb-3` (12px invece di 8px)  
**Tra Dipartimento/Ufficio/Team**: `space-y-2.5` (10px)

Questo crea una **separazione più chiara** tra le sezioni principali (nome/ruolo) e le informazioni organizzative (dipartimento/ufficio/team).

---

## 📊 Confronto Prima/Dopo

### **Dimensioni Font**

| Elemento | Prima | Dopo | Δ |
|----------|-------|------|---|
| Nome | 26px | 26px | = |
| Ruolo | 17px | 17px | = |
| ~~Sede~~ | ~~15px~~ | **Badge** | **Visual** |
| **Dipartimento** | 14px | **16px** | **+14%** |
| **Ufficio** | 14px | **16px** | **+14%** |
| **Team** | 14px | **16px** | **+14%** |

### **Dimensioni Icone**

| Elemento | Prima | Dopo | Δ |
|----------|-------|------|---|
| ~~Sede~~ | ~~4px~~ | **Badge 48px** | **+1100%** |
| **Dipartimento** | 4px | **5px** | **+25%** |
| **Ufficio** | 4px | **5px** | **+25%** |
| **Team** | 4px | **5px** | **+25%** |

### **Altezze Slot**

| Slot | Prima | Dopo | Δ |
|------|-------|------|---|
| Nome | 64px | 64px | = |
| Ruolo | 52px | 52px | = |
| ~~Sede~~ | ~~24px~~ | **—** | **-24px** |
| **Dipartimento** | 22px | **26px** | **+4px** |
| **Ufficio** | 22px | **26px** | **+4px** |
| **Team** | 22px | **26px** | **+4px** |
| **TOTALE** | **~206px** | **~194px** | **-12px** |

**Risultato**: Più spazio risparmiato + informazioni più leggibili

---

## 🎨 Posizionamento Badge

### **Layout Angoli Card**

```
┌─────────────────────────┐
│ 🏴 [Flag]    [Badge]  ⓘ │ ← top-3
│  (left-3)   (center) (right-3)
│                         │
│         FOTO            │
│                         │
│     INFORMAZIONI        │
│                         │
└─────────────────────────┘
```

**Zona Flag**: 
- Posizione: `absolute top-3 left-3`
- Non interferisce con badge qualifica (center)
- Non interferisce con pulsante info (right-3)
- Sempre visibile (z-20)

---

## ✅ Vantaggi

### **Spazio Ottimizzato**
✅ **-24px slot sede**: Spazio verticale liberato  
✅ **Badge compatto**: Informazione visibile ma non invasiva  
✅ **Layout più pulito**: Meno linee di testo  

### **Leggibilità Migliorata**
✅ **+14% font size**: Dipartimento, ufficio e team più leggibili  
✅ **+25% icone**: Icone più visibili e bilanciate  
✅ **+18% altezza slot**: Più respiro verticale  
✅ **Font semibold**: Informazioni più in evidenza  

### **Gerarchia Visiva**
✅ **Bandierina discreta**: Info disponibile senza disturbare  
✅ **Info organizzative prominenti**: Dipartimento e ufficio ben visibili  
✅ **Team allineato**: Posizione logica sotto le info di struttura  
✅ **Colore più scuro**: Team più visibile (slate-600 vs slate-500)  

### **User Experience**
✅ **Tooltip sede**: Nome completo al hover della bandierina  
✅ **Scansione rapida**: Layout più intuitivo  
✅ **Meno clutter**: Informazioni meglio organizzate  

---

## 🎯 Gerarchia Visiva Finale

### **Livelli Tipografici**

```
LIVELLO 1: Nome
└─ 26px bold, slate-900
   ↓
LIVELLO 2: Ruolo
└─ 17px semibold, slate-700
   ↓
LIVELLO 3: Dipartimento, Ufficio, Team
└─ 16px semibold, slate-600 + icone 5px
   ↓
BADGE: Bandierina
└─ 48px badge circolare (posizione assoluta)
```

**Progressione font**: 26 → 17 → 16 px  
**Peso consistente**: bold → semibold → semibold  
**Colori progressivi**: slate-900 → 700 → 600

---

## 🔍 Casi d'Uso

### **1. Dipendente Italiano (CTH_ITALY)**
```
┌─────────────────────────┐
│ 🇮🇹        [RESP]      ⓘ │
│                         │
│         [FOTO]          │
│                         │
│   Umberto Reggiani      │
│  Direttore Commerciale  │
│                         │
│  🏢 Commerciale e Mkt   │
│  💼 Direzione           │
│  👥 Team: 13            │
│                         │
│   [Espandi Team]        │
└─────────────────────────┘
```

### **2. Dipendente UK (CTH_UK)**
```
┌─────────────────────────┐
│ 🇬🇧        [RESP]      ⓘ │
│                         │
│         [FOTO]          │
│                         │
│    Matthew Carey        │
│ Resp. Commerciale UK    │
│                         │
│  🏢 Commerciale e Mkt   │
│  💼 Commerciale         │
│  👥 Team: 1             │
│                         │
│   [Espandi Team]        │
└─────────────────────────┘
```

### **3. Dipendente Germania (CTH_GERMANY)**
```
┌─────────────────────────┐
│ 🇩🇪        [RESP]      ⓘ │
│                         │
│         [FOTO]          │
│                         │
│   Jens Gesterkamp       │
│ Resp. Commerciale DE    │
│                         │
│  🏢 Commerciale e Mkt   │
│  💼 Commerciale         │
│  👥 Team: 2             │
│                         │
│   [Espandi Team]        │
└─────────────────────────┘
```

**Vantaggi**:
- ✅ Bandierina immediatamente riconoscibile
- ✅ Informazioni organizzative chiare e grandi
- ✅ Layout consistente tra tutte le card

---

## 📁 File Modificati

### `src/components/OrgChartNode.tsx`

#### **Badge Bandierina Aggiunto**
```typescript
// Linee 167-179
{/* Badge Bandierina Sede - In alto a sinistra */}
{node.type === "person" && node.metadata?.flag && (
  <div className="absolute top-3 left-3 w-12 h-12 rounded-full ...">
    ...
  </div>
)}
```

#### **Slot Sede Rimosso**
```typescript
// Slot 3 (Sede) completamente rimosso
// Risparmiati 24px di altezza + testo
```

#### **Slot 3-5 Ingranditi**
```typescript
// Linee 246-285
// Dipartimento: 16px font, 5px icon, 26px altezza
// Ufficio: 16px font, 5px icon, 26px altezza
// Team: 16px font, 5px icon, 26px altezza
```

#### **Spacing Migliorato**
```typescript
// Linea 233: mb-2 → mb-3 (dopo ruolo)
// Linea 245: space-y-2 → space-y-2.5 (tra info)
```

---

## 🚀 Impatto

### **Visibilità**
- ⭐ **+14% font size**: Dipartimento, ufficio, team
- ⭐ **+25% icone**: Tutte le icone info
- ⭐ **+1100% bandierina**: Da piccola icona a badge prominente

### **Spazio**
- 📏 **-24px verticale**: Slot sede rimosso
- 📏 **-12px totale**: Layout più compatto ma più leggibile

### **Usabilità**
- 🎯 **Bandierina sempre visibile**: Nessuna necessità di scorrere
- 🎯 **Info organizzative prominenti**: Facili da leggere
- 🎯 **Layout logico**: Gerarchia chiara

---

## 💡 Design Rationale

### **Perché Badge in Alto a Sinistra?**

1. **Non interferisce**: Badge qualifica (centro), info button (destra)
2. **Sempre visibile**: Posizione assoluta, non affetto da scroll
3. **Riconoscibile**: Bandiere sono immediatamente identificabili
4. **Consistente**: Tutti i badge/elementi circolari in zone definite

### **Perché Ingrandire Dipartimento/Ufficio/Team?**

1. **Informazioni chiave**: Più importanti della sede esatta (visibile in tooltip)
2. **Gerarchia organizzativa**: Fondamentale per comprendere la struttura
3. **Lettura rapida**: Font più grandi = scansione più veloce
4. **Bilanciamento visivo**: Proporzioni migliori tra foto e testo

### **Perché Team Sotto?**

1. **Logica strutturale**: Team è conseguenza di dipartimento/ufficio
2. **Flusso informativo**: Dall'organizzazione generale al dettaglio team
3. **Allineamento**: Tutte le info alla stessa dimensione (16px)

---

**Status**: ✅ **Implementato e funzionante**  
**Linter**: ✅ **Nessun errore**  
**Pronto per**: **Deploy immediato**  
**Impatto**: 🌟 **ALTO - Miglioramento significativo di leggibilità e layout**

