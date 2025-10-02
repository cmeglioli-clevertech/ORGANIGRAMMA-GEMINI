/**
 * Mappatura Uffici e Dipartimenti -> Immagini di Background
 * 
 * Ogni ufficio/dipartimento ha un'immagine tematica correlata
 * Le immagini provengono da Unsplash (licenza libera)
 */

// Mappatura Dipartimenti
export const DEPARTMENT_BACKGROUNDS: Record<string, string> = {
  // Direzione
  'Direzione Generale': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
  'Direzione Filiale': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
  'Direzione': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
  
  // Supply Chain
  'Supply Chain': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
  
  // Risorse Umane
  'Risorse Umane & Servizi Generali': 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80',
  
  // Qualità
  'Qualità & Procedure': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80',
  
  // Produzione
  'Produzione': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80',
  
  // Meccatronica (Tecnico)
  'Meccatronica': 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80',
  
  // HSE & Facility
  'HSE & Facility': 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80',
  
  // E-Commerce
  'E-Commerce': 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=800&q=80',
  
  // Commerciale e Marketing
  'Commerciale e Marketing': 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80',
  
  // Amministrazione
  'Amministrazione Finanza e Controllo': 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80',
  
  // After Sales & Service
  'After Sales & Service': 'https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?w=800&q=80',
  
  // Board
  'REFA Board': 'https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?w=800&q=80',
};

// Mappatura Uffici
export const OFFICE_BACKGROUNDS: Record<string, string> = {
  // Direzione e Management
  'Direzione': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
  'Segreteria': 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&q=80',
  
  // Supply Chain e Logistica
  'Supply Chain': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80',
  'Acquisti': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80',
  'Magazzino': 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=1200&q=80',
  'Controllo Qualità Terzisti': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=80',
  
  // Produzione
  'Produzione Meccanica': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&q=80',
  'Produzione Elettrica': 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1200&q=80',
  'Attrezzeria': 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1200&q=80',
  'Collaudo Software': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
  
  // Qualità e Procedure
  'Qualità': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80',
  
  // Risorse Umane e Servizi
  'Risorse Umane': 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&q=80',
  'Reception': 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&q=80',
  
  // HSE e Facility
  'Facility': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80',
  'Prevenzione e Protezione / Gestione Ambientale': 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200&q=80',
  
  // Tecnici Meccanici
  'Tecnico Meccanico': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&q=80',
  'Tecnico Meccanico Leantech': 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1200&q=80',
  
  // Tecnici Elettrici
  'Tecnico Elettrico': 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=1200&q=80',
  
  // Software e IT
  'Tecnico Software': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80',
  'Informatico': 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&q=80',
  
  // Documentazione e Standardizzazione
  'Tecnico Documentale': 'https://images.unsplash.com/photo-1568667256549-094345857637?w=1200&q=80',
  'Tecnico Standardizzazione': 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1200&q=80',
  'Tecnico Safety': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&q=80',
  
  // Commerciale e Marketing
  'Commerciale': 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200&q=80',
  'Marketing': 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=1200&q=80',
  'Tecnico Commerciale': 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&q=80',
  'Project Management Meccanico': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80',
  'Project Management Automazione': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&q=80',
  'Addetto Spedizioni': 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=1200&q=80',
  
  // Amministrazione e Finanza
  'Amministrazione': 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&q=80',
  'Business Intelligence': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
  'Controllo di gestione': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80',
  
  // After Sales e Service
  'After Sales': 'https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?w=1200&q=80',
  'Service': 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=1200&q=80',
};

/**
 * Restituisce l'URL dell'immagine di background per un ufficio specifico
 * Se l'ufficio non ha un'immagine specifica, restituisce un'immagine di default
 */
export function getOfficeBackground(office?: string): string {
  if (!office) {
    return 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80'; // Default: ufficio moderno
  }
  
  // Cerca prima una corrispondenza esatta
  if (OFFICE_BACKGROUNDS[office]) {
    return OFFICE_BACKGROUNDS[office];
  }
  
  // Cerca una corrispondenza parziale (case insensitive)
  const officeKey = Object.keys(OFFICE_BACKGROUNDS).find(key => 
    office.toLowerCase().includes(key.toLowerCase()) || 
    key.toLowerCase().includes(office.toLowerCase())
  );
  
  if (officeKey) {
    return OFFICE_BACKGROUNDS[officeKey];
  }
  
  // Default fallback
  return 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80';
}

/**
 * Restituisce l'URL dell'immagine per una card di ufficio (formato 128x128)
 * Utilizzata nelle card circolari dell'organigramma
 */
export function getOfficeCardImage(office?: string): string {
  const bgUrl = getOfficeBackground(office);
  // Converte l'URL di Unsplash per avere dimensioni ottimizzate per le card
  return bgUrl.replace(/w=\d+/, 'w=400').replace(/q=\d+/, 'q=80');
}

/**
 * Restituisce l'URL dell'immagine di background per un dipartimento specifico
 */
export function getDepartmentBackground(department?: string): string {
  if (!department) {
    return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80'; // Default: building
  }
  
  // Cerca prima una corrispondenza esatta
  if (DEPARTMENT_BACKGROUNDS[department]) {
    return DEPARTMENT_BACKGROUNDS[department];
  }
  
  // Cerca una corrispondenza parziale (case insensitive)
  const deptKey = Object.keys(DEPARTMENT_BACKGROUNDS).find(key => 
    department.toLowerCase().includes(key.toLowerCase()) || 
    key.toLowerCase().includes(department.toLowerCase())
  );
  
  if (deptKey) {
    return DEPARTMENT_BACKGROUNDS[deptKey];
  }
  
  // Default fallback
  return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80';
}

/**
 * Restituisce l'URL dell'immagine per una card di dipartimento (formato 128x128)
 * Utilizzata nelle card circolari dell'organigramma
 */
export function getDepartmentCardImage(department?: string): string {
  const bgUrl = getDepartmentBackground(department);
  // Converte l'URL di Unsplash per avere dimensioni ottimizzate per le card
  return bgUrl.replace(/w=\d+/, 'w=400').replace(/q=\d+/, 'q=80');
}

