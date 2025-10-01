# 📡 Integrazione Smartsheet - Guida Setup

## 🎯 Panoramica

L'organigramma può sincronizzarsi automaticamente con un foglio Smartsheet, scaricando i dati aggiornati e ricostruendo la gerarchia in tempo reale.

## 🔧 Setup Iniziale

### 1. Ottieni il Token API Smartsheet

1. Accedi a [Smartsheet](https://app.smartsheet.com/)
2. Vai su **Account** → **Apps & Integrations** → **API Access**
3. Clicca su **Generate new access token**
4. Copia il token generato (inizia con un lungo codice alfanumerico)

### 2. Trova l'ID del Foglio

L'ID del foglio è nell'URL quando lo apri:
```
https://app.smartsheet.com/sheets/{SHEET_ID}/...
```

**Esempio**: 
- URL: `https://app.smartsheet.com/sheets/911474324465540/...`
- Sheet ID: `911474324465540`

### 3. Configura il File .env

1. Crea un file chiamato **`.env`** nella root del progetto
2. Aggiungi le seguenti righe:

```env
# Token API Smartsheet
VITE_SMARTSHEET_TOKEN=il_tuo_token_qui

# ID del foglio Smartsheet
VITE_SMARTSHEET_SHEET_ID=911474324465540
```

3. **Sostituisci** `il_tuo_token_qui` con il token ottenuto al punto 1
4. Verifica che l'ID del foglio sia corretto

### 4. Avvia il Proxy Server (OBBLIGATORIO)

**IMPORTANTE**: A causa delle limitazioni CORS dell'API Smartsheet, è necessario un server proxy locale.

Apri **DUE terminali** separati:

**Terminale 1 - Proxy Server:**
```bash
npm run proxy
```
Dovresti vedere:
```
🚀 Smartsheet Proxy Server attivo!
📡 Listening on http://localhost:3001
```

**Terminale 2 - Frontend:**
```bash
npm run dev
```
Dovresti vedere:
```
VITE v6.3.6  ready in XXX ms
➜  Local:   http://localhost:3000/
```

⚠️ **Entrambi i server devono rimanere attivi contemporaneamente**

## 📊 Struttura Colonne Smartsheet

Il foglio Smartsheet **deve** contenere le seguenti colonne (l'ordine non è importante):

### **Colonne Obbligatorie**

| Nome Colonna | Descrizione | Esempio |
|--------------|-------------|---------|
| `Principale` | Nome completo dipendente | `Mario Rossi` |
| `Ordinamento` | Numero ordinamento | `1` |
| `Foto` | Nome file foto | `image.png` |
| `BANDIERA` | Codice paese | `it.png` |
| `SEDE` | Sede di lavoro | `CTH_ITALY` |
| `DIPARTIMENTI` | Dipartimento | `Produzione` |
| `UFFICIO (DESCRIZIONE)` | Ufficio | `Montaggio` |
| `Mansione` | Ruolo/mansione | `Operatore` |
| `QUALIFICA` | Qualifica CCNL | `Tecnico specializzato` |
| `LV. (Ipotetico)` | Livello ipotetico | `5S` |
| `Età` | Età dipendente | `35` |
| `Sesso` | Genere | `M` / `F` |
| `RESPONSABILE ASSEGNATO` | Nome responsabile | `Luigi Bianchi` |
| `AZIENDA` | Azienda di appartenenza | `CLEVERTECH` |

### **Colonne Opzionali**

| Nome Colonna | Descrizione | Valori | Comportamento |
|--------------|-------------|--------|---------------|
| `LICENZIATO` | Indica dipendenti cessati | `TRUE`, `SI`, `X`, `1` | Se presente, i dipendenti con questo flag saranno **automaticamente esclusi** dall'organigramma |

**Nota**: I dipendenti con `LICENZIATO = TRUE` (o valori equivalenti) vengono filtrati durante la sincronizzazione e **non appaiono** nell'organigramma.

## 🚀 Utilizzo

### Sincronizzazione Manuale

1. Apri l'applicazione
2. Clicca sul bottone **"↻ Smartsheet"** nell'header
3. Attendi il completamento della sincronizzazione
4. Il CSV aggiornato verrà scaricato automaticamente

### Flusso Sincronizzazione

```
┌─────────────────┐
│   Smartsheet    │ ◄── 1. Utente aggiorna dati
└────────┬────────┘
         │
         │ 2. Click "↻ Smartsheet"
         ▼
┌─────────────────┐
│  Smartsheet API │ ◄── 3. Fetch dati
└────────┬────────┘
         │
         │ 4. Download & parsing
         ▼
┌─────────────────┐
│  CSV Locale     │ ◄── 5. Salva CSV aggiornato
└────────┬────────┘
         │
         │ 6. Ricostruzione alberi
         ▼
┌─────────────────┐
│  Organigramma   │ ◄── 7. UI aggiornata
└─────────────────┘
```

## 🔒 Sicurezza

### ⚠️ IMPORTANTE

- **NON committare** il file `.env` su Git
- Il token API è **sensibile** e dà accesso completo al tuo account Smartsheet
- Il file `.env` è già nel `.gitignore` per sicurezza

### Best Practices

1. ✅ Usa un token con **solo permessi di lettura** se possibile
2. ✅ Rigenera il token periodicamente
3. ✅ Non condividere il token via email/chat
4. ✅ Revoca token non più utilizzati

## 🐛 Troubleshooting

### Errore: "Token Smartsheet non configurato"

**Soluzione**: Verifica che il file `.env` esista e contenga `VITE_SMARTSHEET_TOKEN`

### Errore: "Token non valido o scaduto"

**Soluzione**: 
1. Rigenera un nuovo token su Smartsheet
2. Aggiorna il valore in `.env`
3. Riavvia l'applicazione

### Errore: "Foglio Smartsheet non trovato"

**Soluzione**:
1. Verifica che l'ID del foglio in `.env` sia corretto
2. Controlla di avere i permessi di lettura sul foglio
3. Assicurati che il foglio non sia stato eliminato

### Errore: "Colonna non trovata"

**Soluzione**:
- Controlla che il foglio Smartsheet contenga **tutte** le colonne richieste
- I nomi delle colonne devono corrispondere **esattamente** (case-sensitive)
- Verifica che non ci siano spazi extra nei nomi delle colonne

### Il CSV scaricato è vuoto

**Soluzione**:
1. Verifica che il foglio Smartsheet contenga dei dati (oltre all'header)
2. Controlla la console del browser per errori dettagliati (F12 → Console)

## 📝 Note Tecniche

### Compatibilità Browser

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Limiti API Smartsheet

- **Rate Limit**: 300 richieste/minuto
- **Dimensione Sheet**: Fino a 20.000 righe
- **Timeout**: 30 secondi per richiesta

### Formato Dati

- I dati vengono scaricati in formato JSON da Smartsheet
- Vengono convertiti in CSV compatibile con il parser esistente
- Il mapping delle colonne è **per nome**, non per posizione
- L'ordine delle colonne in Smartsheet **non è importante**

## 🔄 Aggiornamento Automatico (Futuro)

### Funzionalità Pianificate

- [ ] Sincronizzazione automatica ogni N minuti
- [ ] Webhook per aggiornamenti in tempo reale
- [ ] Cache locale con timestamp
- [ ] Confronto modifiche (diff)
- [ ] Notifica solo se ci sono cambiamenti

## 📞 Supporto

Per problemi o domande:
1. Controlla la sezione **Troubleshooting** sopra
2. Verifica i log della console del browser (F12)
3. Consulta la [documentazione API Smartsheet](https://smartsheet.redoc.ly/)

---

**Ultimo aggiornamento**: 1 Ottobre 2025  
**Versione**: 4.2.0 - Smartsheet Integration

