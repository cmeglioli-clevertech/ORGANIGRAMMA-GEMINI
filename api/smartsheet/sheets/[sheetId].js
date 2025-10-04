/**
 * Vercel Function per Smartsheet API Proxy
 * 
 * Questo endpoint serverless risolve i problemi CORS permettendo al frontend
 * di fare chiamate API attraverso Vercel Functions.
 * 
 * Endpoint: /api/smartsheet/sheets/[sheetId]
 */

export default async function handler(req, res) {
  // Solo GET method supportato
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  // CORS Headers per il frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { sheetId } = req.query;
  
  // Token da variabili ambiente Vercel
  const token = process.env.SMARTSHEET_TOKEN || process.env.VITE_SMARTSHEET_TOKEN;

  console.log('📡 Vercel Function - Smartsheet API call');
  console.log('  Sheet ID:', sheetId);
  console.log('  Token presente:', token ? 'SI' : 'NO');
  console.log('  Token length:', token ? token.length : 0);

  if (!token || token === 'your_token_here') {
    return res.status(401).json({
      error: 'Token Smartsheet non configurato nelle variabili ambiente Vercel',
      suggestion: 'Aggiungi SMARTSHEET_TOKEN nelle Environment Variables di Vercel'
    });
  }

  // Usa token pulito (senza spazi)
  const cleanToken = token.trim();

  try {
    const authHeader = `Bearer ${cleanToken}`;
    
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
      
      // Suggerimenti basati sull'errore
      let suggestion = 'Verifica token e permessi su Smartsheet';
      if (errorData.errorCode === 1002) {
        suggestion = 'Token non valido o scaduto. Verifica token su Smartsheet.';
      } else if (errorData.errorCode === 1006) {
        suggestion = 'Foglio non trovato o accesso negato. Verifica Sheet ID e permessi.';
      }
      
      return res.status(response.status).json({
        error: errorData.message || 'Errore API Smartsheet',
        details: errorData,
        suggestion
      });
    }

    const data = await response.json();
    console.log('✅ Dati ricevuti da Smartsheet:', data.rows?.length || 0, 'righe');
    
    // 🔍 DEBUG: Log prime 3 righe per verificare aggiornamenti (solo in development)
    if (process.env.NODE_ENV !== 'production' && data.rows && data.rows.length > 0) {
      console.log('📋 Sample dati (prime 3 righe):');
      data.rows.slice(0, 3).forEach((row, idx) => {
        const cells = row.cells.slice(0, 5).map(c => c.displayValue || c.value || '---');
        console.log(`  Riga ${idx + 1}:`, cells.join(' | '));
      });
    }
    
    // Return data with proper JSON response
    res.status(200).json(data);
    
  } catch (error) {
    console.error('❌ Errore Vercel Function:', error);
    res.status(500).json({
      error: 'Errore di connessione al server Smartsheet',
      details: error.message
    });
  }
}
