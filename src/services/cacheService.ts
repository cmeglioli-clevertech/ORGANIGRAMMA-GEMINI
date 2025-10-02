/**
 * Cache Service - Gestione Cache Intelligente
 * 
 * Questo servizio gestisce la cache locale dei dati Smartsheet con:
 * - Timestamp per validità cache
 * - Retry automatico con backoff esponenziale
 * - Validazione dati pre-importazione
 * - Diff intelligente tra versioni
 * - Salvataggio CSV automatico
 */

import { fetchSmartsheetData, csvArrayToString } from './smartsheetService';

// Configurazione cache
const CACHE_KEY = 'smartsheet_cache';
const CACHE_VERSION = '1.0';
const CACHE_EXPIRY_HOURS = 1; // Cache valida per 1 ora
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_BASE = 1000; // 1 secondo base

interface CacheData {
  version: string;
  timestamp: number;
  csvData: string[][];
  metadata: {
    totalRows: number;
    activeEmployees: number;
    lastSync: string;
    source: 'smartsheet' | 'cache';
  };
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
  };
}

interface DiffResult {
  hasChanges: boolean;
  added: number;
  removed: number;
  modified: number;
  changes: Array<{
    type: 'added' | 'removed' | 'modified';
    row: number;
    field?: string;
    oldValue?: string;
    newValue?: string;
  }>;
}

/**
 * Salva dati in cache locale
 */
export function saveToCache(csvData: string[][], source: 'smartsheet' | 'cache' = 'smartsheet'): void {
  const cacheData: CacheData = {
    version: CACHE_VERSION,
    timestamp: Date.now(),
    csvData,
    metadata: {
      totalRows: csvData.length - 1, // -1 per header
      activeEmployees: csvData.length - 1, // Assumiamo tutti attivi per ora
      lastSync: new Date().toISOString(),
      source
    }
  };

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    console.log('💾 Cache salvata:', {
      rows: cacheData.metadata.totalRows,
      timestamp: new Date(cacheData.timestamp).toLocaleString()
    });
  } catch (error) {
    console.warn('⚠️ Errore salvataggio cache:', error);
  }
}

/**
 * Carica dati dalla cache se validi
 */
export function loadFromCache(): string[][] | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) {
      console.log('📭 Nessuna cache trovata');
      return null;
    }

    const cacheData: CacheData = JSON.parse(cached);
    
    // Verifica versione cache
    if (cacheData.version !== CACHE_VERSION) {
      console.log('🔄 Versione cache obsoleta, invalidando...');
      clearCache();
      return null;
    }

    // Verifica scadenza
    const now = Date.now();
    const cacheAge = now - cacheData.timestamp;
    const maxAge = CACHE_EXPIRY_HOURS * 60 * 60 * 1000; // Converti in millisecondi

    if (cacheAge > maxAge) {
      console.log('⏰ Cache scaduta, invalidando...');
      clearCache();
      return null;
    }

    console.log('✅ Cache valida caricata:', {
      rows: cacheData.metadata.totalRows,
      age: Math.round(cacheAge / 1000 / 60) + ' minuti fa',
      source: cacheData.metadata.source
    });

    return cacheData.csvData;
  } catch (error) {
    console.warn('⚠️ Errore caricamento cache:', error);
    clearCache();
    return null;
  }
}

/**
 * Pulisce la cache
 */
export function clearCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
    console.log('🗑️ Cache pulita');
  } catch (error) {
    console.warn('⚠️ Errore pulizia cache:', error);
  }
}

/**
 * Ottiene metadati cache
 */
export function getCacheMetadata(): CacheData['metadata'] | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const cacheData: CacheData = JSON.parse(cached);
    return cacheData.metadata;
  } catch (error) {
    return null;
  }
}

/**
 * Retry automatico con backoff esponenziale
 */
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxAttempts: number = MAX_RETRY_ATTEMPTS,
  baseDelay: number = RETRY_DELAY_BASE
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        console.error(`❌ Tentativo ${attempt}/${maxAttempts} fallito:`, error);
        throw lastError;
      }

      const delay = baseDelay * Math.pow(2, attempt - 1); // Backoff esponenziale
      console.warn(`⚠️ Tentativo ${attempt}/${maxAttempts} fallito, riprovo tra ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Valida i dati CSV prima dell'importazione
 */
export function validateCsvData(csvData: string[][]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!csvData || csvData.length === 0) {
    return {
      isValid: false,
      errors: ['Dati CSV vuoti o non validi'],
      warnings: [],
      stats: { totalRows: 0, validRows: 0, invalidRows: 0 }
    };
  }

  const header = csvData[0];
  const dataRows = csvData.slice(1);
  
  // Verifica header obbligatorio
  const requiredColumns = [
    'Principale', 'SEDE', 'DIPARTIMENTI', 'UFFICIO (DESCRIZIONE)', 
    'QUALIFICA', 'RESPONSABILE ASSEGNATO'
  ];
  
  const missingColumns = requiredColumns.filter(col => !header.includes(col));
  if (missingColumns.length > 0) {
    errors.push(`Colonne obbligatorie mancanti: ${missingColumns.join(', ')}`);
  }

  let validRows = 0;
  let invalidRows = 0;

  // Valida ogni riga
  dataRows.forEach((row, index) => {
    const rowNum = index + 2; // +2 per header e 0-based index
    
    // Verifica che la riga abbia il numero corretto di colonne
    if (row.length !== header.length) {
      errors.push(`Riga ${rowNum}: numero colonne errato (${row.length} invece di ${header.length})`);
      invalidRows++;
      return;
    }

    // Verifica campi obbligatori
    const nameIndex = header.indexOf('Principale');
    const sedeIndex = header.indexOf('SEDE');
    const qualificaIndex = header.indexOf('QUALIFICA');

    if (nameIndex >= 0 && (!row[nameIndex] || row[nameIndex].trim() === '')) {
      warnings.push(`Riga ${rowNum}: nome dipendente mancante`);
    }
    
    if (sedeIndex >= 0 && (!row[sedeIndex] || row[sedeIndex].trim() === '')) {
      warnings.push(`Riga ${rowNum}: sede mancante`);
    }
    
    if (qualificaIndex >= 0 && (!row[qualificaIndex] || row[qualificaIndex].trim() === '')) {
      warnings.push(`Riga ${rowNum}: qualifica mancante`);
    }

    validRows++;
  });

  const result: ValidationResult = {
    isValid: errors.length === 0,
    errors,
    warnings,
    stats: {
      totalRows: dataRows.length,
      validRows,
      invalidRows
    }
  };

  console.log('🔍 Validazione dati:', result);
  return result;
}

/**
 * Calcola diff tra due dataset CSV
 */
export function calculateDiff(oldData: string[][], newData: string[][]): DiffResult {
  if (!oldData || !newData || oldData.length === 0 || newData.length === 0) {
    return {
      hasChanges: false,
      added: 0,
      removed: 0,
      modified: 0,
      changes: []
    };
  }

  const changes: DiffResult['changes'] = [];
  
  // Crea mappe per confronto rapido
  const oldMap = new Map<string, string[]>();
  const newMap = new Map<string, string[]>();
  
  // Assumiamo che la prima colonna sia l'identificatore (nome)
  const nameIndex = 0;
  
  oldData.slice(1).forEach(row => {
    if (row[nameIndex]) {
      oldMap.set(row[nameIndex], row);
    }
  });
  
  newData.slice(1).forEach(row => {
    if (row[nameIndex]) {
      newMap.set(row[nameIndex], row);
    }
  });

  // Trova aggiunte
  for (const [name, newRow] of newMap) {
    if (!oldMap.has(name)) {
      changes.push({
        type: 'added',
        row: newData.indexOf(newRow)
      });
    }
  }

  // Trova rimozioni
  for (const [name, oldRow] of oldMap) {
    if (!newMap.has(name)) {
      changes.push({
        type: 'removed',
        row: oldData.indexOf(oldRow)
      });
    }
  }

  // Trova modifiche
  for (const [name, newRow] of newMap) {
    const oldRow = oldMap.get(name);
    if (oldRow) {
      for (let i = 0; i < Math.min(oldRow.length, newRow.length); i++) {
        if (oldRow[i] !== newRow[i]) {
          changes.push({
            type: 'modified',
            row: newData.indexOf(newRow),
            field: newData[0]?.[i] || `Colonna ${i}`,
            oldValue: oldRow[i],
            newValue: newRow[i]
          });
        }
      }
    }
  }

  const result: DiffResult = {
    hasChanges: changes.length > 0,
    added: changes.filter(c => c.type === 'added').length,
    removed: changes.filter(c => c.type === 'removed').length,
    modified: changes.filter(c => c.type === 'modified').length,
    changes
  };

  console.log('📊 Diff calcolato:', result);
  return result;
}

/**
 * Scarica CSV come file
 */
export function downloadCsv(csvData: string[][], filename: string = 'organigramma_data.csv'): void {
  try {
    const csvString = csvArrayToString(csvData);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('💾 CSV scaricato:', filename);
    }
  } catch (error) {
    console.error('❌ Errore download CSV:', error);
    throw new Error('Errore durante il download del CSV');
  }
}

/**
 * Funzione principale: sincronizza con cache intelligente
 */
export async function syncWithCache(forceRefresh: boolean = false): Promise<{
  csvData: string[][];
  fromCache: boolean;
  validation: ValidationResult;
  diff?: DiffResult;
  metadata: CacheData['metadata'];
}> {
  console.log('🔄 Inizio sincronizzazione intelligente...');

  // 1. Prova a caricare dalla cache se non forzato
  if (!forceRefresh) {
    const cachedData = loadFromCache();
    if (cachedData) {
      const validation = validateCsvData(cachedData);
      const metadata = getCacheMetadata();
      
      return {
        csvData: cachedData,
        fromCache: true,
        validation,
        metadata: metadata || {
          totalRows: cachedData.length - 1,
          activeEmployees: cachedData.length - 1,
          lastSync: new Date().toISOString(),
          source: 'cache'
        }
      };
    }
  }

  // 2. Scarica da Smartsheet con retry
  console.log('📡 Scaricamento da Smartsheet...');
  const csvData = await retryWithBackoff(() => fetchSmartsheetData());
  
  // 3. Valida dati
  const validation = validateCsvData(csvData);
  if (!validation.isValid) {
    throw new Error(`Dati non validi: ${validation.errors.join(', ')}`);
  }

  // 4. Calcola diff se abbiamo cache precedente
  let diff: DiffResult | undefined;
  const oldData = loadFromCache();
  if (oldData) {
    diff = calculateDiff(oldData, csvData);
  }

  // 5. Salva in cache
  saveToCache(csvData, 'smartsheet');

  // 6. Salva CSV automaticamente
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCsv(csvData, `organigramma_${timestamp}.csv`);

  const metadata = getCacheMetadata()!;

  console.log('✅ Sincronizzazione completata:', {
    rows: metadata.totalRows,
    fromCache: false,
    hasChanges: diff?.hasChanges || false
  });

  return {
    csvData,
    fromCache: false,
    validation,
    diff,
    metadata
  };
}
