# 🚀 Deployment su Vercel - Guida Completa

## ✅ **Setup Rapido (5 minuti)**

### **1. Deploy del Progetto**
```bash
# Opzione A: Da GitHub (Raccomandato)
1. Vai su https://vercel.com
2. Clicca "Import Project" 
3. Connetti il repository GitHub
4. Deploy automatico

# Opzione B: Da CLI locale
npm i -g vercel
vercel --prod
```

### **2. Configurazione Variabili Ambiente**
Su Vercel Dashboard → Project Settings → Environment Variables:

```
SMARTSHEET_TOKEN = your_smartsheet_api_token_here
VITE_SMARTSHEET_SHEET_ID = 911474324465540
```

⚠️ **Importante**: 
- `SMARTSHEET_TOKEN` senza prefisso `VITE_` (server-side)
- `VITE_SMARTSHEET_SHEET_ID` con prefisso (client-side)

### **3. Test del Deploy**
Verifica questi endpoint:

```
✅ App principale: https://your-app.vercel.app
✅ Health check: https://your-app.vercel.app/api/health  
✅ Smartsheet API: https://your-app.vercel.app/api/smartsheet/sheets/[sheetId]
```

---

## 🔧 **Differenze Vercel vs Locale**

| Aspetto | Locale | Vercel |
|---------|--------|--------|
| **Proxy** | Express server (3001) | Vercel Functions |
| **CORS** | Configurato in Express | Headers nelle Functions |
| **Variabili** | File `.env` | Vercel Dashboard |
| **Logs** | Console locale | Vercel Functions tab |

---

## 🚨 **Troubleshooting**

### **❌ "401 Unauthorized"**
```
Problema: Token Smartsheet non configurato
Soluzione: Aggiungi SMARTSHEET_TOKEN su Vercel Dashboard
```

### **❌ "404 Sheet not found"**  
```
Problema: Sheet ID mancante/errato
Soluzione: Verifica VITE_SMARTSHEET_SHEET_ID su Vercel
```

### **❌ "Function timeout"**
```
Problema: Smartsheet API lenta
Soluzione: Configurato timeout 30s in vercel.json (già incluso)
```

### **❌ "CORS Error"**
```
Problema: Headers CORS mancanti
Soluzione: Già configurati nelle Vercel Functions
```

---

## 📊 **Monitoraggio**

### **Vercel Dashboard:**
- **Functions**: Vedi logs, performance, errori
- **Analytics**: Traffic, response times  
- **Deployments**: Storico deploy e rollback

### **Debug Endpoints:**
- `/api/health` → Verifica configurazione
- `/api/smartsheet/sheets/[sheetId]` → Test API Smartsheet

---

## 🔄 **Workflow Deploy**

```bash
# 1. Commit modifiche
git add .
git commit -m "feat: update smartsheet integration"
git push origin main

# 2. Auto-deploy Vercel (se configurato)
# Vercel rileva push → build automatico → deploy

# 3. Test immediato
curl https://your-app.vercel.app/api/health
```

---

## 💡 **Ottimizzazioni Vercel**

### **Performance:**
- ✅ **Edge Functions**: API routes geograficamente distribuite
- ✅ **Caching**: Automatico per assets statici
- ✅ **Compression**: Gzip automatico

### **Security:**
- ✅ **Environment Variables**: Crittografate
- ✅ **HTTPS**: Automatico con certificati SSL
- ✅ **CORS**: Headers configurati

---

**🎯 Con questa configurazione, l'app funziona identicamente in locale e su Vercel!**

*Prossimo step: Test completo delle funzionalità zoom e Smartsheet in produzione* 🚀
