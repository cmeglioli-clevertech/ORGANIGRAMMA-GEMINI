# UX v2.8 - Gerarchia Visiva e Ottimizzazione Spazio

**Data**: 2025-10-01  
**Versione**: v2.8  
**Status**: ✅ Implementato e verificato

---

## 🎯 Obiettivo

Ottimizzare l'utilizzo dello spazio nelle card e creare una gerarchia visiva chiara e intuitiva delle informazioni, sostituendo informazioni meno utili (età) con dati più rilevanti (dipartimento e ufficio).

---

## 📋 Modifiche Implementate

### 1. **Riduzione Dimensione Foto** (`OrgChartNode.tsx`)
**Prima**: 220×220px  
**Dopo**: 160×160px  
**Risparmio spazio**: -27% (60px in meno)

```typescript
// Da:
className="w-[220px] h-[220px]"

// A:
className="w-[160px] h-[160px]"
```

### 2. **Gerarchia Visiva Ottimizzata** (`OrgChartNode.tsx`)

Creata una **chiara gerarchia a 5 livelli**:

#### **LIVELLO 1: Nome** (Primario)
- Font: `24px` bold (da 28px)
- Colore: `slate-900`
- Posizione: Subito sotto la foto
- **Massima prominenza visiva**

#### **LIVELLO 2: Ruolo/Mansione** (Secondario)
- Font: `16px` semibold (da 18px)
- Colore: `slate-700`
- **Chiaro ma subordinato al nome**

#### **LIVELLO 3: Sede** (Terziario)
- Font: `14px` medium
- Colore: `slate-600`
- Icona: Bandierina 6×4px
- **Riconoscibile ma discreto**

#### **LIVELLO 4: Dipartimento e Ufficio** ⭐ **NUOVO**
- Font: `13px` medium
- Colore: `slate-600`
- Icone: `Building2` (dipartimento), `Briefcase` (ufficio)
- Layout: Stack verticale con spacing minimo (1.5)
- **Compatto ma leggibile**

```typescript
{/* Dipartimento e Ufficio - LIVELLO 4: Compatto con icone */}
<div className="space-y-1.5 pt-1">
  {node.metadata?.department && (
    <div className="flex items-center justify-center gap-2 text-slate-600">
      <Building2 className="w-4 h-4 flex-shrink-0" />
      <span className="text-[13px] font-medium line-clamp-1">
        {node.metadata.department}
      </span>
    </div>
  )}
  {node.metadata?.office && (
    <div className="flex items-center justify-center gap-2 text-slate-600">
      <Briefcase className="w-4 h-4 flex-shrink-0" />
      <span className="text-[13px] font-medium line-clamp-1">
        {node.metadata.office}
      </span>
    </div>
  )}
</div>
```

#### **LIVELLO 5: Team Size** (Stats)
- Font: `13px` medium
- Colore: `slate-500`
- Icona: `Users` 4×4px
- Formato: "Team: X"
- **Minima prominenza, informazione di servizio**

### 3. **Rimozione Età** ❌
- ✅ Rimossa dalle card (`OrgChartNode.tsx`)
- ✅ Rimossa dal modal (`EmployeeDetailModal.tsx`)

**Motivazione**: L'età è un'informazione personale meno rilevante per l'organigramma aziendale. Dipartimento e ufficio sono molto più utili per comprendere la struttura organizzativa.

#### Modal - Quick Stats (`EmployeeDetailModal.tsx`)
**Prima**: Card con 2 colonne (Età + Diretti)  
**Dopo**: Card singola centrata (Solo Diretti)

```typescript
// Prima: grid-cols-2 con età e diretti
// Dopo: Card singola
{node.type === 'person' && metadata?.stats?.directs !== undefined && (
  <div className="px-8 -mt-16 relative z-10">
    <div className="bg-white rounded-xl shadow-lg border border-slate-200">
      <div className="px-6 py-4 text-center">
        <div className="text-2xl font-bold text-emerald-600">
          {metadata.stats.directs}
        </div>
        <div className="text-xs text-slate-500 font-medium uppercase">
          Diretti nel Team
        </div>
      </div>
    </div>
  </div>
)}
```

### 4. **Ottimizzazione Altezza Card** (`OrgChartNode.tsx`)
- Con figli: `30rem` (da 32rem, -2rem/-64px)
- Senza figli: `28rem` (da 29rem, -1rem/-32px)

**Risparmio**: Più compatta grazie alla foto più piccola e layout ottimizzato.

---

## 📊 Confronto Prima/Dopo

### **Utilizzo Spazio Verticale (Card con figli)**
| Sezione | Prima | Dopo | Δ |
|---------|-------|------|---|
| Foto | 220px | 160px | -60px (-27%) |
| Nome | 28px | 24px | -4px |
| Ruolo | 18px | 16px | -2px |
| Sede | 16px | 14px | -2px |
| **Età** | **17px** | **—** | **-17px** ✅ |
| **Dipartimento** | **—** | **13px** | **+13px** ⭐ |
| **Ufficio** | **—** | **13px** | **+13px** ⭐ |
| Team | 16px | 13px | -3px |
| **Totale Card** | **512px** | **480px** | **-32px (-6%)** |

### **Gerarchia Visiva**
| Info | Prima | Dopo | Miglioramento |
|------|-------|------|---------------|
| Nome | 28px bold | 24px bold | ⚖️ Proporzionato |
| Ruolo | 18px semibold | 16px semibold | ⚖️ Bilanciato |
| Dipartimento | ❌ Assente | ✅ 13px con icona | ⭐ **Nuovo** |
| Ufficio | ❌ Assente | ✅ 13px con icona | ⭐ **Nuovo** |
| Sede | 16px | 14px con flag | ✅ Più leggibile |
| Età | 17px emoji | ❌ Rimosso | ✅ Info più utili |
| Team | 16px | 13px | ✅ Compatto |

---

## 🎨 Principi di Design Applicati

### 1. **Gerarchia Tipografica Progressiva**
```
24px (Nome) → 16px (Ruolo) → 14px (Sede) → 13px (Dip/Uff/Team)
```
Ogni livello è **visibilmente diverso** ma **proporzionato**.

### 2. **Iconografia Contestuale**
- 🏢 `Building2` per Dipartimento
- 💼 `Briefcase` per Ufficio
- 👥 `Users` per Team
- 🏴 Flag per Sede

Icone **4×4px** per info secondarie, **consistenti** in tutta la card.

### 3. **Spacing Proporzionale**
- Foto-Nome: `pb-3` (12px)
- Nome-Ruolo: `space-y-2` (8px)
- Ruolo-Sede: `pt-2` (8px)
- Sede-Dip/Uff: `pt-1` (4px)
- Dip-Uff: `space-y-1.5` (6px)
- Uff-Team: `pt-1` (4px)

**Spacing decrescente** = gerarchia visiva chiara.

### 4. **Colori Semantici**
- `slate-900` (scuro) = Nome (più importante)
- `slate-700` (medio) = Ruolo
- `slate-600` (chiaro) = Info secondarie (sede, dip, uff)
- `slate-500` (molto chiaro) = Stats (meno importante)

**Scala cromatica progressiva** = gerarchia intuitiva.

---

## ✅ Testing

### **Casi di Test**
1. ✅ Card persona con tutte le info (nome, ruolo, sede, dipartimento, ufficio, team)
2. ✅ Card persona con info parziali (es. solo nome + ruolo)
3. ✅ Card organizzativa (dipartimento/ufficio) con stats
4. ✅ Modal senza età nella quick stats card
5. ✅ Nessun errore linting

### **Verifica Visiva**
- ✅ Gerarchia chiara e leggibile
- ✅ Spazio ben utilizzato
- ✅ Dipartimento e ufficio ben visibili
- ✅ Foto più piccola ma ancora riconoscibile
- ✅ Layout bilanciato e professionale

---

## 📁 File Modificati

### `src/components/OrgChartNode.tsx`
- ✅ Foto ridotta a 160×160px
- ✅ Font ridimensionati per gerarchia ottimale
- ✅ Età rimossa
- ✅ Dipartimento e ufficio aggiunti (livello 4)
- ✅ Team size reso più compatto (livello 5)
- ✅ Altezza card ottimizzata (30rem/28rem)

### `src/components/EmployeeDetailModal.tsx`
- ✅ Quick stats card: rimossa età
- ✅ Solo "Diretti nel Team" nella card sovrapposta
- ✅ Layout semplificato (da grid-cols-2 a card singola)

---

## 🎯 Risultato Finale

### **Informazioni Visualizzate (Card Persona)**
1. **Badge Qualifica** (top, floating)
2. **Foto** 160×160px
3. **Nome** (24px bold) ← Primario
4. **Ruolo** (16px semibold)
5. **Sede** (14px + flag)
6. **Dipartimento** (13px + icona Building2) ⭐ **NUOVO**
7. **Ufficio** (13px + icona Briefcase) ⭐ **NUOVO**
8. **Team** (13px + icona Users)
9. **Footer** (espandi/comprimi)

### **Vantaggi**
✅ **Spazio meglio utilizzato**: -32px di altezza  
✅ **Gerarchia visiva chiara**: 5 livelli tipografici distinti  
✅ **Info più utili**: Dipartimento e ufficio invece di età  
✅ **Layout bilanciato**: Foto proporzionata, testo ben distribuito  
✅ **Leggibilità ottimale**: Font size progressivi 24→16→14→13px  
✅ **Design professionale**: Consistente con standard aziendali  

---

## 🚀 Prossimi Passi Suggeriti

1. ✅ Testare su dataset reale con vari livelli di completezza dati
2. ⏳ Raccogliere feedback utenti sulla nuova gerarchia
3. ⏳ Valutare se aggiungere tooltip su dipartimento/ufficio per nomi lunghi
4. ⏳ Considerare vista "super compatta" per organigrammi molto grandi

---

**Status**: ✅ **Implementato e funzionante**  
**Linter**: ✅ **Nessun errore**  
**Pronto per**: **Testing utente e feedback**

