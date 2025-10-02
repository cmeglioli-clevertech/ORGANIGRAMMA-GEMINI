# UX v2.17 - Office & Department Background Images

## Data: 2 Ottobre 2025

## Obiettivo
1. Sostituire lo sfondo blu uniforme delle schede informative (modal dei dipendenti) con immagini di background dinamiche correlate all'ufficio di appartenenza
2. Sostituire le immagini random (picsum.photos) delle card di uffici e dipartimenti con immagini tematiche correlate

## Modifiche Implementate

### 1. Nuovo File: `src/utils/officeBackgrounds.ts`
Creato un file di utility che contiene:
- **OFFICE_BACKGROUNDS**: Mappatura uffici → immagini tematiche da Unsplash (35+ uffici)
- **DEPARTMENT_BACKGROUNDS**: Mappatura dipartimenti → immagini tematiche (13 dipartimenti)
- **getOfficeBackground()**: Restituisce l'URL dell'immagine background per modal (1200px)
- **getOfficeCardImage()**: Restituisce l'URL dell'immagine per card circolare (400px)
- **getDepartmentBackground()**: Restituisce l'URL dell'immagine background per dipartimento
- **getDepartmentCardImage()**: Restituisce l'URL dell'immagine per card circolare di dipartimento

### 2. Modificato: `src/components/EmployeeDetailModal.tsx`
- Importato `getOfficeBackground` dalla utility
- Rimosso il gradiente blu fisso (`bg-gradient-to-br from-blue-500 to-blue-600`)
- Aggiunto background dinamico con:
  - Immagine specifica dell'ufficio
  - Overlay scuro semi-trasparente (rgba(0, 0, 0, 0.5-0.6)) per garantire leggibilità del testo
  - `background-size: cover` e `background-position: center` per ottimale presentazione

### 3. Modificato: `src/App.tsx`
- Importato `getOfficeCardImage` e `getDepartmentCardImage`
- Sostituito `picsum.photos` per uffici con `getOfficeCardImage(officeName)` (riga ~678)
- Sostituito `picsum.photos` per dipartimenti con `getDepartmentCardImage(departmentName)` (riga ~723)
- Aggiornato REFA Board con immagine tematica (riga ~931)
- Aggiornato root node con immagine corporate building (riga ~911)
- Aggiornato role tree root con immagine leadership (riga ~1144)

## Mappatura Uffici → Immagini

Le immagini sono state selezionate tematicamente per ogni ufficio:

### Direzione e Management
- **Direzione**: Ufficio moderno con vista
- **Segreteria**: Scrivania organizzata

### Supply Chain e Logistica
- **Supply Chain**: Magazzino logistico
- **Acquisti**: Documenti e analisi
- **Magazzino**: Scaffalature industriali

### Produzione
- **Produzione Meccanica**: Macchinari industriali
- **Produzione Elettrica**: Impianti elettrici
- **Attrezzeria**: Utensili e attrezzature

### Tecnici
- **Tecnico Software**: Setup sviluppatore
- **Tecnico Meccanico**: CAD e progettazione
- **Tecnico Elettrico**: Schemi elettronici

### Commerciale e Marketing
- **Commerciale**: Stretta di mano business
- **Marketing**: Brainstorming creativo
- **Project Management**: Planning e organizzazione

### Amministrazione
- **Amministrazione**: Documenti finanziari
- **Business Intelligence**: Dashboard e analytics
- **Informatico**: Server room e tecnologia

### After Sales & Service
- **Service**: Assistenza tecnica
- **After Sales**: Supporto clienti

## Benefici UX

1. **Personalizzazione Visiva**: Ogni ufficio/dipartimento ha un'identità visiva unica
2. **Riconoscibilità**: Gli utenti possono identificare rapidamente il tipo di ufficio/dipartimento dall'immagine
3. **Esperienza Moderna**: Estetica più professionale e accattivante
4. **Coerenza Totale**: 
   - Persone dello stesso ufficio hanno lo stesso background nel modal
   - Card degli uffici usano la stessa immagine tematica
   - Card dei dipartimenti hanno immagini rappresentative
5. **Eliminazione Random**: Non più immagini casuali da picsum.photos, ogni elemento ha un'immagine significativa

## Note Tecniche

### Performance
- Le immagini sono ottimizzate (parametri Unsplash: `w=1200&q=80`)
- Lazy loading gestito naturalmente dal browser

### Accessibilità
- Overlay scuro garantisce contrasto WCAG AA per il testo bianco
- Fallback di default per uffici non mappati

### Manutenzione
- Facile aggiunta di nuovi uffici nel file `officeBackgrounds.ts`
- Logica di matching parziale per varianti nomi uffici

## Testing
✅ Verificare che tutte le immagini si carichino correttamente nei modal
✅ Verificare che le card di uffici mostrino le immagini tematiche
✅ Verificare che le card di dipartimenti mostrino le immagini tematiche
✅ Testare leggibilità del testo su diverse immagini
✅ Verificare responsive su diversi dispositivi
✅ Controllare fallback per uffici/dipartimenti nuovi/non mappati
✅ Verificare coerenza tra card e modal dello stesso ufficio

## Future Improvements
- Possibilità di personalizzare immagini per singole persone
- Cache locale delle immagini per performance migliorate
- Animazione di transizione al caricamento dell'immagine

