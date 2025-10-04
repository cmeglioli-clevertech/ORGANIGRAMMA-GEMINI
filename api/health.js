/**
 * Vercel Function per Health Check
 * 
 * Endpoint di verifica che il sistema API di Vercel funzioni correttamente
 * 
 * Endpoint: /api/health
 */

export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Solo GET supportato
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  // Check variabili ambiente
  const hasSmartsheetToken = !!(process.env.SMARTSHEET_TOKEN || process.env.VITE_SMARTSHEET_TOKEN);
  const hasSheetId = !!process.env.VITE_SMARTSHEET_SHEET_ID;

  const status = {
    status: 'ok',
    message: 'Vercel API Functions attive',
    environment: process.env.NODE_ENV || 'unknown',
    timestamp: new Date().toISOString(),
    config: {
      smartsheetToken: hasSmartsheetToken ? 'configurato' : 'mancante',
      sheetId: hasSheetId ? 'configurato' : 'mancante'
    },
    endpoints: {
      health: '/api/health',
      smartsheet: '/api/smartsheet/sheets/[sheetId]'
    }
  };

  console.log('🏥 Health check richiesto:', status);
  
  res.status(200).json(status);
}
