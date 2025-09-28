const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '..', '_Suddivisione Clevertech light.csv');
const raw = fs.readFileSync(csvPath, 'utf8');
const lines = raw.split(/\r?\n/).filter(line => line.trim().length > 0);
if (lines.length === 0) {
  throw new Error('CSV seems empty');
}

const header = lines[0].split(';');
const hasManagerColumn = header.includes('Responsabile');
let newHeader;
if (!hasManagerColumn) {
  newHeader = [
    'Principale',
    'BANDIERA',
    'SEDE',
    'Foto',
    'DIPARTIMENTI',
    'UFFICIO (DESCRIZIONE)',
    'Mansione',
    'QUALIFICA',
    'Responsabile',
    'Ordinamento',
    'Età',
    'Sesso',
  ];
} else {
  newHeader = header;
}

const FALLBACK_SEDE = 'Non specificata';
const FALLBACK_DEPARTMENT = 'Non specificato';
const FALLBACK_OFFICE = 'Non specificato';

const employees = lines.slice(1).map((line, idx) => {
  const parts = line.split(';');
  const hasManager = hasManagerColumn || parts.length >= 12;
  const name = (parts[0] || '').trim();
  const flag = (parts[1] || '').trim();
  const sede = (parts[2] || '').trim() || FALLBACK_SEDE;
  const photo = (parts[3] || '').trim();
  const department = (parts[4] || '').trim().replace(/^\|/, '').trim() || FALLBACK_DEPARTMENT;
  const office = (parts[5] || '').trim().replace(/^\|/, '').trim() || FALLBACK_OFFICE;
  const role = (parts[6] || '').trim();
  const qualification = (parts[7] || '').trim();
  const managerName = hasManager ? (parts[8] || '').trim() : '';
  const orderStr = hasManager ? (parts[9] || '99').trim() : (parts[8] || '99').trim();
  const ageStr = hasManager ? (parts[10] || '').trim() : (parts[9] || '').trim();
  const gender = hasManager ? (parts[11] || '').trim() : (parts[10] || '').trim();
  const orderVal = Number.parseInt(orderStr, 10);
  const ageVal = Number.parseInt(ageStr, 10);

  return {
    index: idx,
    name,
    flag,
    sede,
    photo,
    department,
    office,
    role,
    qualification,
    order: Number.isNaN(orderVal) ? 99 : orderVal,
    age: Number.isNaN(ageVal) ? '' : String(ageVal),
    gender,
    manager: managerName,
  };
});

const sedeMap = new Map();
for (const emp of employees) {
  if (!sedeMap.has(emp.sede)) {
    sedeMap.set(emp.sede, new Map());
  }
  const deptMap = sedeMap.get(emp.sede);
  if (!deptMap.has(emp.department)) {
    deptMap.set(emp.department, new Map());
  }
  const officeMap = deptMap.get(emp.department);
  if (!officeMap.has(emp.office)) {
    officeMap.set(emp.office, []);
  }
  officeMap.get(emp.office).push(emp);
}

const sortEmployees = (list) => [...list].sort((a, b) => {
  if (a.order !== b.order) return a.order - b.order;
  return a.name.localeCompare(b.name, 'it', { sensitivity: 'base' });
});

const selectResponsible = (list) => {
  const sorted = sortEmployees(list);
  return sorted[0] || null;
};

const managerMap = new Map();
const nameToEmployee = new Map(employees.map(emp => [emp.name, emp]));

const ceo = employees.find(emp => emp.order === 1) || null;
const companyManager = ceo ? ceo.name : '';

for (const [sedeName, deptMap] of sedeMap.entries()) {
  const sedePersons = [];
  const departmentResponsibles = new Map();
  const officeResponsibles = new Map();

  for (const [deptName, officeMap] of deptMap.entries()) {
    const deptPersons = [];
    for (const [officeName, members] of officeMap.entries()) {
      const sortedMembers = sortEmployees(members);
      const responsible = selectResponsible(sortedMembers);
      officeResponsibles.set(`${sedeName}|${deptName}|${officeName}`, responsible);
      deptPersons.push(...sortedMembers);
      for (const emp of sortedMembers) {
        if (responsible && emp.name !== responsible.name) {
          managerMap.set(emp.name, responsible.name);
        }
      }
    }
    const deptResponsible = selectResponsible(deptPersons);
    if (deptResponsible) {
      departmentResponsibles.set(`${sedeName}|${deptName}`, deptResponsible);
    }
    for (const emp of deptPersons) {
      const currentManager = managerMap.get(emp.name);
      if (!currentManager || currentManager === emp.name) {
        if (deptResponsible && deptResponsible.name !== emp.name) {
          managerMap.set(emp.name, deptResponsible.name);
        }
      }
    }
    sedePersons.push(...deptPersons);
  }

  const sedeResponsible = selectResponsible(sedePersons);
  for (const emp of sedePersons) {
    const currentManager = managerMap.get(emp.name);
    if (!currentManager || currentManager === emp.name) {
      if (sedeResponsible && sedeResponsible.name !== emp.name) {
        managerMap.set(emp.name, sedeResponsible.name);
      }
    }
  }

  for (const [deptKey, deptResponsible] of departmentResponsibles.entries()) {
    if (deptResponsible) {
      const currentManager = managerMap.get(deptResponsible.name);
      if (!currentManager || currentManager === deptResponsible.name) {
        if (sedeResponsible && sedeResponsible.name !== deptResponsible.name) {
          managerMap.set(deptResponsible.name, sedeResponsible.name);
        }
      }
    }
  }

  for (const emp of sedePersons) {
    const currentManager = managerMap.get(emp.name);
    if (!currentManager || currentManager === emp.name) {
      if (companyManager && companyManager !== emp.name) {
        managerMap.set(emp.name, companyManager);
      } else {
        managerMap.set(emp.name, '');
      }
    }
  }
}

const outputLines = [newHeader.join(';')];
for (const emp of employees) {
  const manager = managerMap.get(emp.name) ?? emp.manager ?? '';
  const parts = [
    emp.name,
    emp.flag,
    emp.sede,
    emp.photo,
    emp.department,
    emp.office,
    emp.role,
    emp.qualification,
    manager,
    String(emp.order),
    emp.age,
    emp.gender,
  ];
  outputLines.push(parts.join(';'));
}

fs.writeFileSync(csvPath, outputLines.join('\r\n'), 'utf8');
console.log('CSV aggiornato con colonna Responsabile.');
