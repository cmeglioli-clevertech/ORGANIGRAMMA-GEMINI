/**
 * Smartsheet API Service
 * 
 * Questo modulo gestisce l'integrazione con Smartsheet API per sincronizzare
 * i dati dell'organigramma direttamente dal foglio Smartsheet.
 * 
 * Documentazione API: https://smartsheet.redoc.ly/
 */

// URL del proxy locale (risolve il problema CORS)
const PROXY_API_BASE = 'http://localhost:3001/api/smartsheet';

interface SmartsheetCell {
  columnId: number;
  value?: any;
  displayValue?: string;
}

interface SmartsheetRow {
  id: number;
  rowNumber: number;
  cells: SmartsheetCell[];
}

interface SmartsheetColumn {
  id: number;
  title: string;
  index: number;
}

interface SmartsheetSheet {
  columns: SmartsheetColumn[];
  rows: SmartsheetRow[];
}

interface SmartsheetError {
  errorCode: number;
  message: string;
}

/**
 * Recupera i dati dal foglio Smartsheet con retry automatico
 */
export async function fetchSmartsheetData(): Promise<string[][]> {
  const token = import.meta.env.VITE_SMARTSHEET_TOKEN;
  const sheetId = import.meta.env.VITE_SMARTSHEET_SHEET_ID;

  // Debug: Log per verificare che le variabili siano caricate
  console.log('🔍 DEBUG Smartsheet Config:');
  console.log('  Token presente:', token ? `SI (lunghezza: ${token.length})` : 'NO');
  console.log('  Token inizia con:', token ? token.substring(0, 10) + '...' : 'N/A');
  console.log('  Sheet ID:', sheetId);

  if (!token || token === 'your_token_here') {
    throw new Error('Token Smartsheet non configurato. Aggiungi VITE_SMARTSHEET_TOKEN nel file .env');
  }

  if (!sheetId) {
    throw new Error('Sheet ID non configurato. Aggiungi VITE_SMARTSHEET_SHEET_ID nel file .env');
  }

  // Retry automatico con backoff esponenziale
  const MAX_RETRIES = 3;
  const BASE_DELAY = 1000; // 1 secondo

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`📡 Tentativo ${attempt}/${MAX_RETRIES} di connessione a Smartsheet...`);
      
      // Usa il proxy locale invece di chiamare direttamente Smartsheet API (risolve CORS)
      const response = await fetch(`${PROXY_API_BASE}/sheets/${sheetId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData: SmartsheetError = await response.json().catch(() => ({
          errorCode: response.status,
          message: response.statusText
        }));
        
        // Errori non recuperabili - non riprovare
        if (response.status === 401) {
          throw new Error('Token Smartsheet non valido o scaduto. Verifica le credenziali in .env');
        } else if (response.status === 404) {
          throw new Error(`Foglio Smartsheet non trovato (ID: ${sheetId}). Verifica l'ID in .env`);
        } else if (response.status >= 400 && response.status < 500) {
          // Errori client (4xx) - non riprovare
          throw new Error(`Errore Smartsheet API: ${errorData.message || response.statusText}`);
        } else {
          // Errori server (5xx) o di rete - riprova
          throw new Error(`Errore server Smartsheet (${response.status}): ${errorData.message || response.statusText}`);
        }
      }

      const sheet: SmartsheetSheet = await response.json();
      console.log(`✅ Connessione riuscita al tentativo ${attempt}`);
      
      // Converti il formato Smartsheet in formato CSV (array di array)
      return convertSmartsheetToCSV(sheet);
      
    } catch (error) {
      const isLastAttempt = attempt === MAX_RETRIES;
      const isRetryableError = error instanceof Error && 
        (error.message.includes('server') || 
         error.message.includes('network') || 
         error.message.includes('timeout') ||
         error.message.includes('fetch'));

      if (isLastAttempt || !isRetryableError) {
        // Ultimo tentativo o errore non recuperabile
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('Errore di connessione a Smartsheet. Verifica la tua connessione internet.');
      }

      // Calcola delay con backoff esponenziale
      const delay = BASE_DELAY * Math.pow(2, attempt - 1);
      console.warn(`⚠️ Tentativo ${attempt} fallito, riprovo tra ${delay}ms...`);
      console.warn(`   Errore: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
      
      // Attendi prima del prossimo tentativo
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // Non dovrebbe mai arrivare qui, ma per sicurezza
  throw new Error('Tutti i tentativi di connessione sono falliti');
}

/**
 * Converte i dati Smartsheet in formato CSV compatibile con parseCsvEmployees
 */
function convertSmartsheetToCSV(sheet: SmartsheetSheet): string[][] {
  // Log delle colonne presenti in Smartsheet
  console.log('📊 Colonne trovate in Smartsheet:');
  sheet.columns.forEach((col, index) => {
    console.log(`  ${index + 1}. "${col.title}" (ID: ${col.id})`);
  });
  console.log('');
  
  // Crea mappa: nome colonna → ID colonna Smartsheet
  const columnMap = new Map<string, number>();
  sheet.columns.forEach(col => {
    columnMap.set(col.title, col.id);
  });

  // Mapping: Nome CSV → Nome Smartsheet (per colonne con nomi diversi)
  const columnNameMapping: Record<string, string> = {
    'Principale': 'Nome (Nome, Cognome)',  // Nome colonna diverso in Smartsheet
    'Mansione': 'MANSIONE',                // Smartsheet usa tutto maiuscolo
  };

  // Ordine colonne atteso dal CSV (come in _Suddivisione Clevertech light.csv)
  const expectedColumns = [
    'Principale',
    'Ordinamento',
    'Foto',
    'BANDIERA',
    'SEDE',
    'DIPARTIMENTI',
    'UFFICIO (DESCRIZIONE)',
    'Mansione',
    'QUALIFICA',
    'LV. (Ipotetico)',
    'Età',
    'Sesso',
    'RESPONSABILE ASSEGNATO',
    'AZIENDA'
  ];

  // Costruisci header CSV
  const csvData: string[][] = [expectedColumns];

  // Ottieni l'ID della colonna LICENZIATO per filtrarla
  const licenziatoColumnId = columnMap.get('LICENZIATO');
  let licenziatiCount = 0;
  let attiviCount = 0;

  // Converti ogni riga Smartsheet (esclusi i licenziati)
  sheet.rows.forEach(row => {
    // Verifica se il dipendente è licenziato
    if (licenziatoColumnId) {
      const licenziatoCell = row.cells.find(c => c.columnId === licenziatoColumnId);
      const licenziatoValue = licenziatoCell?.value;
      
      // Salta questa riga se è licenziato (TRUE, "SI", "X", "1", etc.)
      if (licenziatoValue === true || 
          licenziatoValue === 'SI' || 
          licenziatoValue === 'si' ||
          licenziatoValue === 'S' ||
          licenziatoValue === 'X' || 
          licenziatoValue === 'x' ||
          licenziatoValue === '1' ||
          licenziatoValue === 1) {
        licenziatiCount++;
        return; // Salta questo dipendente
      }
    }
    
    attiviCount++;
    const csvRow: string[] = [];
    
    expectedColumns.forEach(columnName => {
      // Usa il mapping se esiste, altrimenti usa il nome originale
      const smartsheetColumnName = columnNameMapping[columnName] || columnName;
      const columnId = columnMap.get(smartsheetColumnName);
      
      if (columnId !== undefined) {
        // Trova la cella corrispondente
        const cell = row.cells.find(c => c.columnId === columnId);
        const value = cell?.displayValue ?? cell?.value ?? '';
        csvRow.push(String(value));
      } else {
        // Colonna non trovata in Smartsheet, usa valore vuoto
        console.warn(`⚠️ Colonna CSV "${columnName}" (Smartsheet: "${smartsheetColumnName}") non trovata`);
        csvRow.push('');
      }
    });
    
    csvData.push(csvRow);
  });

  console.log(`✅ Importati ${attiviCount} dipendenti attivi da Smartsheet`);
  if (licenziatiCount > 0) {
    console.log(`🚫 Esclusi ${licenziatiCount} dipendenti licenziati`);
  }
  console.log(`📊 Totale righe CSV: ${csvData.length - 1} (header escluso)`);
  
  return csvData;
}

/**
 * Converte array CSV in stringa CSV formattata
 */
export function csvArrayToString(csvData: string[][]): string {
  return csvData.map(row => {
    return row.map(cell => {
      // Escape caratteri speciali CSV
      if (cell.includes(';') || cell.includes('"') || cell.includes('\n')) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    }).join(';');
  }).join('\n');
}

/**
 * Test di connessione per verificare credenziali e permessi
 */
export async function testSmartsheetConnection(): Promise<{ success: boolean; message: string }> {
  try {
    await fetchSmartsheetData();
    return {
      success: true,
      message: 'Connessione a Smartsheet riuscita!'
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Errore sconosciuto'
    };
  }
}

