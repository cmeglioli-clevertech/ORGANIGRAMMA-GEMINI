/**
 * Server Proxy per Smartsheet API
 * 
 * Questo server proxy risolve il problema CORS permettendo al frontend
 * di fare chiamate API attraverso il backend locale.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Carica variabili d'ambiente
dotenv.config();

const app = express();
const PORT = 3001;

// Abilita CORS per il frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json());

/**
 * Endpoint proxy per Smartsheet API
 * GET /api/smartsheet/sheets/:sheetId
 */
app.get('/api/smartsheet/sheets/:sheetId', async (req, res) => {
  const { sheetId } = req.params;
  const token = process.env.VITE_SMARTSHEET_TOKEN;

  console.log('📡 Proxy request to Smartsheet API');
  console.log('  Sheet ID:', sheetId);
  console.log('  Token presente:', token ? 'SI' : 'NO');
  console.log('  Token length:', token ? token.length : 0);
  console.log('  Token (primi 20 car):', token ? token.substring(0, 20) : 'N/A');
  console.log('  Token (ultimi 10 car):', token ? token.substring(token.length - 10) : 'N/A');
  
  // Verifica spazi bianchi
  if (token && (token !== token.trim())) {
    console.log('⚠️  ATTENZIONE: Token contiene spazi bianchi!');
    console.log('  Token con trim:', token.trim().length);
  }

  if (!token || token === 'your_token_here') {
    return res.status(401).json({
      error: 'Token Smartsheet non configurato nel file .env'
    });
  }

  // Usa token pulito (senza spazi)
  const cleanToken = token.trim();

  try {
    const authHeader = `Bearer ${cleanToken}`;
    console.log('  Authorization header length:', authHeader.length);
    
    const response = await fetch(`https://api.smartsheet.com/2.0/sheets/${sheetId}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: response.statusText
      }));
      
      console.error('❌ Smartsheet API error:', response.status, errorData);
      console.error('  Error code:', errorData.errorCode);
      console.error('  Error message:', errorData.message);
      console.error('  Ref ID:', errorData.refId);
      
      // Suggerimenti basati sull'errore
      if (errorData.errorCode === 1002) {
        console.error('  💡 Suggerimento: Token non valido o scaduto. Verifica:');
        console.error('     1. Il token è stato copiato completamente');
        console.error('     2. Il token non è scaduto su Smartsheet');
        console.error('     3. Il token ha i permessi per accedere al foglio');
      } else if (errorData.errorCode === 1006) {
        console.error('  💡 Suggerimento: Foglio non trovato o accesso negato');
      }
      
      return res.status(response.status).json({
        error: errorData.message || 'Errore API Smartsheet',
        details: errorData,
        suggestion: 'Verifica token e permessi su Smartsheet'
      });
    }

    const data = await response.json();
    console.log('✅ Dati ricevuti da Smartsheet:', data.rows?.length || 0, 'righe');
    
    res.json(data);
    
  } catch (error) {
    console.error('❌ Errore proxy:', error);
    res.status(500).json({
      error: 'Errore di connessione al server Smartsheet',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Smartsheet Proxy Server attivo',
    port: PORT
  });
});

// Avvia il server
app.listen(PORT, () => {
  console.log('\n🚀 Smartsheet Proxy Server attivo!');
  console.log(`📡 Listening on http://localhost:${PORT}`);
  console.log(`🔧 Frontend deve chiamare: http://localhost:${PORT}/api/smartsheet/sheets/{sheetId}`);
  console.log('\n✅ Server pronto per le richieste\n');
});

