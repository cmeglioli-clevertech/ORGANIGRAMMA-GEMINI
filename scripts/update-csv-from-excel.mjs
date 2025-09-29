import XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NEW_FILES_DIR = 'docs/New_files';
const CSV_OUTPUT_PATH = '_Suddivisione Clevertech light.csv';

function readExcelFile(filePath) {
  try {
    console.log(`Lettura file Excel: ${filePath}`);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  } catch (error) {
    console.error(`Errore nella lettura del file ${filePath}:`, error);
    return [];
  }
}

function convertExcelToCSV() {
  const excelPath = path.join(path.dirname(__dirname), NEW_FILES_DIR, '_Suddivisione Clevertech light.xlsx');
  const data = readExcelFile(excelPath);
  
  if (data.length === 0) {
    console.error('Nessun dato da convertire');
    return false;
  }

  console.log(`Conversione di ${data.length} righe da Excel a CSV`);
  
  // Converti in formato CSV 
  const csvLines = data.map(row => {
    return row.map(cell => {
      // Gestisci celle vuote
      if (cell === null || cell === undefined) {
        return '';
      }
      
      // Converti in stringa e gestisci caratteri speciali
      let cellStr = cell.toString();
      
      // Se contiene caratteri speciali, racchiudi tra virgolette
      if (cellStr.includes(';') || cellStr.includes('"') || cellStr.includes('\n')) {
        // Escaped quotes
        cellStr = cellStr.replace(/"/g, '""');
        cellStr = `"${cellStr}"`;
      }
      
      return cellStr;
    }).join(';');
  });

  // Scrivi il file CSV
  const csvContent = csvLines.join('\n');
  const outputPath = path.join(path.dirname(__dirname), CSV_OUTPUT_PATH);
  
  try {
    fs.writeFileSync(outputPath, csvContent, 'utf8');
    console.log(`✅ File CSV aggiornato: ${outputPath}`);
    console.log(`✅ Scritte ${csvLines.length} righe`);
    
    // Mostra alcune statistiche
    const headerRow = data[0] || [];
    console.log('\nColonne disponibili:');
    headerRow.forEach((col, index) => {
      console.log(`  ${index}: ${col}`);
    });
    
    return true;
  } catch (error) {
    console.error('Errore nella scrittura del file CSV:', error);
    return false;
  }
}

function validateConversion() {
  const csvPath = path.join(path.dirname(__dirname), CSV_OUTPUT_PATH);
  
  try {
    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split('\n');
    
    console.log('\n=== VALIDAZIONE CONVERSIONE ===');
    console.log(`Righe nel CSV: ${lines.length}`);
    console.log('Prime 3 righe:');
    
    lines.slice(0, 3).forEach((line, index) => {
      console.log(`Riga ${index}: ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`);
    });
    
    return true;
  } catch (error) {
    console.error('Errore nella validazione:', error);
    return false;
  }
}

console.log('=== AGGIORNAMENTO CSV DA EXCEL ===\n');

if (convertExcelToCSV()) {
  validateConversion();
  console.log('\n✅ Conversione completata con successo!');
  console.log('📋 Il file CSV è stato aggiornato con i dati più recenti dall\'Excel');
  console.log('🔄 Riavvia l\'applicazione per vedere le modifiche');
} else {
  console.log('\n❌ Conversione fallita');
}
