import React, { useCallback, useEffect, useState } from "react";
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import NavigableOrgChart from "./components/NavigableOrgChart";
import SearchBar from "./components/SearchBar";
import FilterPanel from "./components/FilterPanel";
import ExportMenu from "./components/ExportMenu";
import EmployeeDetailModal from "./components/EmployeeDetailModal";
import { useOrgSearch } from "./hooks/useOrgSearch";
import { useFilters } from "./hooks/useFilters";
import { useModal } from "./contexts/ModalContext";
import { fetchSmartsheetData, csvArrayToString } from "./services/smartsheetService";
import { getOfficeCardImage, getDepartmentCardImage } from "./utils/officeBackgrounds";
import type { Node, NodeMetadata, NodeType } from "./types";

interface Employee {
  id: string;
  name: string;
  photo: string;
  flag: string;
  department: string;
  office: string;
  role: string;
  qualification: string;
  qualificationKey: string;
  qualificationOrder: number;
  qualificationDescription: string | null;
  qualificationColor: string;
  levelShort: string | null;
  levelCode: string | null;
  levelHypothetical: string | null;
  manager: string | null;
  order: number;
  sede: string;
  age: number | null;
  gender: string | null;
  company: string | null;
}

interface NodeWithParent {
  node: Node | null;
  parent: Node | null;
}

type ViewMode = "location" | "role";

const ROOT_ID = "refa-root";
const FALLBACK_SEDE = "Non specificata";
const FALLBACK_DEPARTMENT = "Non specificato";
const FALLBACK_OFFICE = "Non specificato";

const BADGE_BY_TYPE: Record<NodeType, string> = {
  root: "GLOBAL",
  ceo: "CEO",
  sede: "SEDE",
  department: "DIPARTIMENTO",
  office: "UFFICIO",
  person: "PERSONA",
  qualification: "QUALIFICA",
  "role-group": "RUOLO",
};

const ROLE_ROOT_ID = "clevertech-role-root";
const DEFAULT_BRANCH_DIRECTOR = "Giuseppe Reggiani";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "non-specificato";

const stripPipePrefix = (value: string) => value.replace(/^\|+/, "").trim();

const normalizeHierarchyValue = (value: string) => {
  if (!value) return "";
  const cleaned = value.replace(/\r/g, "");
  const segments = cleaned
    .split("|")
    .map((segment) => stripPipePrefix(segment))
    .filter(Boolean);
  if (segments.length === 0) {
    return stripPipePrefix(cleaned);
  }
  return segments[segments.length - 1];
};

const normalizeQualificationLabel = (value: string) => stripPipePrefix(value).replace(/\s+/g, " ").trim();

const normalizeGender = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const upper = trimmed.toUpperCase();
  if (upper === "M" || upper === "F") {
    return upper;
  }
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
};

const normalizeCompany = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const normalizeLevelCode = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed.toUpperCase() : null;
};

interface QualificationDefinitionSeed {
  label: string;
  shortLabel: string;
  order: number;
  newLevel: string | null;
  oldCode: string | null;
  description: string | null;
  colorClass: string;
  synonyms?: string[];
}

interface QualificationDefinition extends QualificationDefinitionSeed {
  key: string;
}

interface ResolvedQualification {
  key: string;
  label: string;
  shortLabel: string;
  order: number;
  colorClass: string;
  newLevel: string | null;
  oldCode: string | null;
  description: string | null;
  isFallback: boolean;
}

const QUALIFICATION_DEFINITION_SEEDS: QualificationDefinitionSeed[] = [
  {
    label: "Dirigente",
    shortLabel: "Dirigente",
    order: 1,
    newLevel: "DIR",
    oldCode: "DIR",
    description: "Direzione aziendale; autonomia strategica e responsabilità sui risultati complessivi. (CCNL distinto).",
    colorClass: "bg-red-100 text-red-800 border-red-200",
    synonyms: ["dirigente"],
  },
  {
    label: "Direttivo (Quadro / Gestione del cambiamento)",
    shortLabel: "Quadro / Gestione del cambiamento",
    order: 2,
    newLevel: "A1",
    oldCode: "8",
    description: "Guida di funzioni/aree e impulso all’innovazione; ampia autonomia e responsabilità su processi e risultati.",
    colorClass: "bg-orange-100 text-orange-800 border-orange-200",
    synonyms: [
      "quadro / direttore",
      "quadro-direttore",
      "quadro direttore",
      "direttivo quadro / gestione del cambiamento",
      "direttivo quadro",
      "quadro",
    ],
  },
  {
    label: "Direttivo (Responsabile di team/processi)",
    shortLabel: "Responsabile di team/processi",
    order: 3,
    newLevel: "B3",
    oldCode: "7",
    description: "Coordinamento di team/processi e responsabilità di risultati con ampia autonomia operativa; non quadro.",
    colorClass: "bg-yellow-100 text-yellow-800 border-yellow-200",
    synonyms: [
      "responsabile di team/area",
      "responsabile di team / area",
      "responsabile di team",
    ],
  },
  {
    label: "Direttivo (Tecnico/organizzativo)",
    shortLabel: "Direttivo tecnico/organizzativo",
    order: 4,
    newLevel: "B2",
    oldCode: "6",
    description: "Autonomia tecnico-organizzativa su attività complesse; presidio di obiettivi e risorse, senza perimetro da quadro.",
    colorClass: "bg-blue-100 text-blue-800 border-blue-200",
    synonyms: [
      "impiegato direttivo",
      "direttivo tecnico",
      "direttivo organizzativo",
    ],
  },
  {
    label: "Tecnico Specializzato",
    shortLabel: "Tecnico specializzato",
    order: 5,
    newLevel: "B1",
    oldCode: "5S",
    description: "Elevato know-how; presidio di procedure critiche e supporto/guida operativa non gerarchica.",
    colorClass: "bg-green-100 text-green-800 border-green-200",
    synonyms: [
      "specialista (impiegatizio/tecnico)",
      "specialista impiegatizio",
      "specialista tecnico",
      "specialista",
    ],
  },
  {
    label: "Tecnico qualificato",
    shortLabel: "Tecnico qualificato",
    order: 6,
    newLevel: "C3",
    oldCode: "5",
    description: "Attività qualificate con autonomia ordinaria (es. set-up, diagnosi base, controlli di processo).",
    colorClass: "bg-purple-100 text-purple-800 border-purple-200",
    synonyms: ["impiegato qualificato"],
  },
  {
    label: "Tecnico esecutivo",
    shortLabel: "Tecnico esecutivo",
    order: 7,
    newLevel: "C2",
    oldCode: "4",
    description: "Esecuzione strutturata di procedure/standard con supervisione e responsabilità limitate.",
    colorClass: "bg-cyan-100 text-cyan-800 border-cyan-200",
    synonyms: ["impiegato esecutivo"],
  },
  {
    label: "Operativo specializzato",
    shortLabel: "Operativo specializzato",
    order: 8,
    newLevel: "C1",
    oldCode: "3S",
    description: "Conduzione/attrezzaggio di impianti o lavorazioni complesse; diagnosi e ottimizzazione su perimetro definito.",
    colorClass: "bg-amber-100 text-amber-800 border-amber-200",
    synonyms: ["operaio specializzato"],
  },
  {
    label: "Operativo qualificato",
    shortLabel: "Operativo qualificato",
    order: 9,
    newLevel: "D2",
    oldCode: "3",
    description: "Lavorazioni qualificate con strumenti/attrezzature comuni; autonomia limitata.",
    colorClass: "bg-rose-100 text-rose-800 border-rose-200",
    synonyms: ["operaio qualificato"],
  },
  {
    label: "Operativo base",
    shortLabel: "Operativo base",
    order: 10,
    newLevel: "D1",
    oldCode: "2",
    description: "Attività elementari o semi-qualificate con addestramento breve; ex 1ª categoria riclassificata in D1 dal 1/6/2021.",
    colorClass: "bg-gray-100 text-gray-800 border-gray-200",
    synonyms: ["operaio comune", "operaio generico"],
  },
  {
    label: "Apprendista impiegato",
    shortLabel: "Apprendista impiegato",
    order: 11,
    newLevel: "Appr.",
    oldCode: "Appr.",
    description: "Percorso formativo per ruoli tecnico-gestionali; retribuzione percentuale del livello di sbocco.",
    colorClass: "bg-lime-100 text-lime-800 border-lime-200",
    synonyms: ["apprendista impiegato"],
  },
  {
    label: "Apprendista operaio",
    shortLabel: "Apprendista operaio",
    order: 12,
    newLevel: "Appr.",
    oldCode: "Appr.",
    description: "Percorso formativo per ruoli operativi/tecnici di officina; progressione secondo schemi di apprendistato.",
    colorClass: "bg-stone-100 text-stone-800 border-stone-200",
    synonyms: ["apprendista operaio"],
  },
];

const createQualificationDefinitions = (seeds: QualificationDefinitionSeed[]) => {
  const lookup = new Map<string, QualificationDefinition>();
  const definitions = seeds.map((seed) => {
    const definition: QualificationDefinition = {
      ...seed,
      key: slugify(seed.label),
    };

    const register = (label: string | undefined) => {
      if (!label) return;
      const normalized = normalizeQualificationLabel(label);
      if (!normalized) return;
      lookup.set(slugify(normalized), definition);
    };

    register(seed.label);
    register(seed.shortLabel);
    seed.synonyms?.forEach(register);

    return definition;
  });

  return { definitions, lookup };
};

const { lookup: QUALIFICATION_LOOKUP } = createQualificationDefinitions(QUALIFICATION_DEFINITION_SEEDS);

const FALLBACK_QUALIFICATION: ResolvedQualification = {
  key: "livello-non-definito",
  label: "Livello non definito",
  shortLabel: "Livello non definito",
  order: 999,
  colorClass: "bg-slate-200 text-slate-600 border-slate-200",
  newLevel: null,
  oldCode: null,
  description: null,
  isFallback: true,
};

const resolveQualification = (value: string): ResolvedQualification => {
  const normalizedLabel = normalizeQualificationLabel(value);
  if (!normalizedLabel) {
    return { ...FALLBACK_QUALIFICATION };
  }

  const key = slugify(normalizedLabel);
  const definition = QUALIFICATION_LOOKUP.get(key);

  if (definition) {
    return {
      key: definition.key,
      label: definition.label,
      shortLabel: definition.shortLabel,
      order: definition.order,
      colorClass: definition.colorClass,
      newLevel: definition.newLevel,
      oldCode: definition.oldCode,
      description: definition.description,
      isFallback: false,
    };
  }

  return {
    key,
    label: normalizedLabel,
    shortLabel: normalizedLabel,
    order: 999,
    colorClass: FALLBACK_QUALIFICATION.colorClass,
    newLevel: null,
    oldCode: null,
    description: null,
    isFallback: true,
  };
};

const getQualificationOrder = (qualification: string) =>
  resolveQualification(qualification).order;

// Mappa immagini dipendenti (docs/IMMAGINI/*.png) caricata a build-time
const employeeImageModules = import.meta.glob("../docs/IMMAGINI/**/*.png", { eager: true, query: "?url", import: "default" }) as Record<string, string>;

const normalizeImageKey = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .trim();

const EMPLOYEE_IMAGE_MAP: Map<string, string> = (() => {
  const map = new Map<string, string>();
  Object.entries(employeeImageModules).forEach(([path, url]) => {
    const file = path.split(/[/\\]/).pop() || "";
    const base = file.replace(/\.[^.]+$/g, "");
    const key = normalizeImageKey(base);
    if (key) {
      map.set(key, url as unknown as string);
    }
  });
  return map;
})();
const parseCsvEmployees = (csvText: string): Employee[] => {
  const lines = csvText.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").slice(1);
  const employees: Employee[] = [];

  lines.forEach((line, index) => {
    if (!line || !line.trim()) return;
    const parts = line.split(";");

    const getPart = (idx: number) => (parts[idx] ?? "").trim();

    const name = getPart(0);
    if (!name) return;

    const orderStr = getPart(1) || "99";
    const photo = stripPipePrefix(getPart(2));
    const flagRaw = stripPipePrefix(getPart(3));
    const flag = flagRaw.replace(/\.png$/i, '').toLowerCase(); // Rimuove .png e lowercase per flagcdn
    const sede = stripPipePrefix(getPart(4)) || FALLBACK_SEDE;
    const department = normalizeHierarchyValue(parts[5] ?? "");
    const office = normalizeHierarchyValue(parts[6] ?? "");
    const role = normalizeHierarchyValue(parts[7] ?? "");
    const qualificationRaw = parts[8] ?? "";
    const levelHypotheticalRaw = getPart(9);
    const ageStr = getPart(10);
    const genderRaw = parts[11] ?? "";
    const managerName = stripPipePrefix(parts[12] ?? "");
    const companyRaw = parts[13] ?? "";

    const resolvedQualification = resolveQualification(qualificationRaw);
    const orderVal = Number.parseInt(orderStr, 10);
    const ageVal = Number.parseInt(ageStr, 10);

    const levelCode = resolvedQualification.newLevel ?? normalizeLevelCode(levelHypotheticalRaw);

    employees.push({
      id: `${slugify(name)}-${index}`,
      name,
      photo,
      flag,
      department: department || FALLBACK_DEPARTMENT,
      office: office || FALLBACK_OFFICE,
      role: role || "-",
      qualification: resolvedQualification.label,
      qualificationKey: resolvedQualification.key,
      qualificationOrder: resolvedQualification.order,
      qualificationDescription: resolvedQualification.description,
      qualificationColor: resolvedQualification.colorClass,
      levelShort: resolvedQualification.shortLabel,
      levelCode,
      levelHypothetical: levelHypotheticalRaw ? levelHypotheticalRaw : null,
      manager: managerName ? managerName : null,
      order: Number.isNaN(orderVal) ? 99 : orderVal,
      sede,
      age: Number.isNaN(ageVal) ? null : ageVal,
      gender: normalizeGender(stripPipePrefix(genderRaw ?? "")),
      company: normalizeCompany(stripPipePrefix(companyRaw ?? "")),
    });
  });

  return employees;
};

const sortEmployees = (list: Employee[]) =>
  [...list].sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.name.localeCompare(b.name, "it", { sensitivity: "base" });
  });

const getEmployeeImage = (emp: Employee) => {
  // 1) Prova mappa immagini locale (docs/IMMAGINI)
  const key = normalizeImageKey(emp.name);
  const localUrl = EMPLOYEE_IMAGE_MAP.get(key);
  if (localUrl) {
    return localUrl;
  }

  // 2) Prova valore nel CSV (URL assoluto o percorso .png)
  const candidate = emp.photo?.trim();
  if (candidate && /^https?:\/\//i.test(candidate)) {
    return candidate;
  }
  if (candidate && candidate.toLowerCase().endsWith(".png")) {
    try {
      const url = new URL(candidate, import.meta.url).toString();
      return url;
    } catch {
      // ignora
    }
  }

  // 3) Fallback placeholder
  return `https://picsum.photos/seed/${encodeURIComponent(emp.name)}/128/128`;
};

const getFlagImage = (flagCode?: string | null) => {
  const normalized = flagCode?.toLowerCase().replace(/\.png$/i, '').trim();
  if (!normalized) {
    return `https://picsum.photos/seed/global-flag/128/128`;
  }
  return `https://flagcdn.com/w160/${normalized}.png`;
};

const selectResponsible = (persons: Node[]): Node | null => {
  const sorted = [...persons].sort((a, b) => {
    const orderA = a.metadata?.order ?? a.order ?? 99;
    const orderB = b.metadata?.order ?? b.order ?? 99;
    if (orderA !== orderB) return orderA - orderB;
    return a.name.localeCompare(b.name, "it", { sensitivity: "base" });
  });
  return sorted[0] ?? null;
};

const createPersonNode = (emp: Employee, context: {
  location: string;
  sede?: string | null;
  department?: string | null;
  office?: string | null;
  manager?: string | null;
}): Node => ({
  id: emp.id,
  name: emp.name,
  role: emp.role,
  department: emp.department,
  location: context.location,
  imageUrl: getEmployeeImage(emp),
  type: "person",
  metadata: {
    badge: BADGE_BY_TYPE.person,
    badgeColorClass: emp.qualificationColor,
    sede: context.sede ?? emp.sede ?? FALLBACK_SEDE,
    department: context.department ?? emp.department ?? FALLBACK_DEPARTMENT,
    office: context.office ?? emp.office ?? FALLBACK_OFFICE,
    qualification: emp.qualification || null,
    qualificationKey: emp.qualificationKey,
    qualificationDescription: emp.qualificationDescription,
    mansione: emp.role || null,
    age: emp.age,
    order: emp.order,
    flag: emp.flag || null,
    reportsTo: context.manager ?? emp.manager ?? null,
    company: emp.company ?? null,
    gender: emp.gender ?? null,
    level: emp.levelShort ?? emp.qualification ?? null,
    levelCode: emp.levelCode,
    levelHypothetical: emp.levelHypothetical,
  },
  children: undefined,
});

const createManualEmployee = (data: {
  id: string;
  name: string;
  photo?: string;
  flag?: string;
  department: string;
  office: string;
  role: string;
  qualification: string;
  manager: string | null;
  order: number;
  sede: string;
  age?: number | null;
  company?: string | null;
}): Employee => {
  const resolvedQualification = resolveQualification(data.qualification);

  return {
    id: data.id,
    name: data.name,
    photo: data.photo ?? "",
    flag: data.flag ?? "",
    department: data.department,
    office: data.office,
    role: data.role,
    qualification: resolvedQualification.label,
    qualificationKey: resolvedQualification.key,
    qualificationOrder: resolvedQualification.order,
    qualificationDescription: resolvedQualification.description,
    qualificationColor: resolvedQualification.colorClass,
    levelShort: resolvedQualification.shortLabel,
    levelCode: resolvedQualification.newLevel,
    levelHypothetical: null,
    manager: data.manager,
    order: data.order,
    sede: data.sede,
    age: data.age ?? null,
    gender: null,
    company: data.company ?? null,
  };
};

const applyMetadata = (node: Node, updates: Partial<NodeMetadata>): Node => ({
  ...node,
  metadata: {
    ...node.metadata,
    ...updates,
  },
});

const buildOrgTree = (employees: Employee[]): Node => {
  const sediMap = new Map<string, Map<string, Map<string, Employee[]>>>();

  employees.forEach((emp) => {
    const sedeKey = emp.sede || FALLBACK_SEDE;
    const departmentKey = emp.department || FALLBACK_DEPARTMENT;
    const officeKey = emp.office || FALLBACK_OFFICE;

    if (!sediMap.has(sedeKey)) {
      sediMap.set(sedeKey, new Map());
    }
    const departmentMap = sediMap.get(sedeKey)!;

    if (!departmentMap.has(departmentKey)) {
      departmentMap.set(departmentKey, new Map());
    }
    const officeMap = departmentMap.get(departmentKey)!;

    if (!officeMap.has(officeKey)) {
      officeMap.set(officeKey, []);
    }
    officeMap.get(officeKey)!.push(emp);
  });
  const sedeNodes: Node[] = Array.from(sediMap.entries())
    .sort((a, b) => {
      if (a[0] === FALLBACK_SEDE) return 1;
      if (b[0] === FALLBACK_SEDE) return -1;
      return a[0].localeCompare(b[0], "it", { sensitivity: "base" });
    })
    .map(([sedeName, departmentMap]) => {
      const locationValue = sedeName === FALLBACK_SEDE ? "N/A" : sedeName;

      const departmentEntries = Array.from(departmentMap.entries())
        .sort((a, b) => {
          const priority = (name: string) => {
            const normalized = name.toLowerCase();
            if (name === FALLBACK_DEPARTMENT) return 2;
            if (normalized.includes("direzione")) return 0;
            return 1;
          };

          const priorityDiff = priority(a[0]) - priority(b[0]);
          if (priorityDiff !== 0) return priorityDiff;
          return a[0].localeCompare(b[0], "it", { sensitivity: "base" });
        })
        .map(([departmentName, officeMap]) => {
          const departmentPersons: Node[] = [];

          const officeNodes = Array.from(officeMap.entries())
            .sort((a, b) => {
              if (a[0] === FALLBACK_OFFICE) return 1;
              if (b[0] === FALLBACK_OFFICE) return -1;
              return a[0].localeCompare(b[0], "it", { sensitivity: "base" });
            })
            .map(([officeName, members]) => {
              const sortedMembers = sortEmployees(members);
              const personNodes: Node[] = sortedMembers.map((emp) =>
                createPersonNode(emp, {
                  location: locationValue,
                  sede: sedeName,
                  department: departmentName,
                  office: officeName,
                  manager: emp.manager ?? null,
                })
              );

              departmentPersons.push(...personNodes);
              const responsiblePerson = selectResponsible(personNodes);
              const peopleCount = personNodes.length;
              const officePurpose = responsiblePerson?.metadata?.mansione ?? departmentName;

              // Gerarchia corretta: responsabile con subordinati
              let officeChildren: Node[] = [];
              if (responsiblePerson && personNodes.length > 1) {
                // Trova tutti i subordinati (escludi il responsabile)
                const subordinates = personNodes.filter(person => person.id !== responsiblePerson.id);
                
                // Il responsabile ha i subordinati come figli
                const managerWithSubordinates = {
                  ...responsiblePerson,
                  children: subordinates,
                  isExpanded: false
                };
                
                officeChildren = [managerWithSubordinates];
              } else {
                // Se c'è solo una persona nell'ufficio, è sia responsabile che unico membro
                officeChildren = personNodes;
              }

              return {
                id: `office-${slugify(sedeName)}-${slugify(departmentName)}-${slugify(officeName)}`,
                name: officeName,
                role: "Ufficio",
                department: departmentName,
                location: locationValue,
                imageUrl: getOfficeCardImage(officeName),
                type: "office",
                responsible: responsiblePerson?.name,
                metadata: {
                  badge: BADGE_BY_TYPE.office,
                  sede: sedeName,
                  department: departmentName,
                  office: officeName,
                  qualification: responsiblePerson?.metadata?.qualification ?? null,
                  mansione: responsiblePerson?.metadata?.mansione ?? null,
                  age: responsiblePerson?.metadata?.age ?? null,
                  order: responsiblePerson?.metadata?.order ?? null,
                  stats: {
                    people: peopleCount,
                  },
                  officePurpose,
                },
                isExpanded: false,
                children: officeChildren,
              } as Node;
            });
          const departmentResponsible = selectResponsible(departmentPersons);

          const departmentStats = {

            offices: officeNodes.length,

            people: departmentPersons.length,

          };



          const departmentNode: Node = {

            id: `department-${slugify(sedeName)}-${slugify(departmentName)}`,

            name: departmentName,

            role: "Dipartimento",

            department: departmentName,

            location: locationValue,

            imageUrl: getDepartmentCardImage(departmentName),

            type: "department",

            responsible: departmentResponsible?.name,

            metadata: {

              badge: BADGE_BY_TYPE.department,

              sede: sedeName,

              department: departmentName,

              qualification: departmentResponsible?.metadata?.qualification ?? null,

              mansione: departmentResponsible?.metadata?.mansione ?? null,

              age: departmentResponsible?.metadata?.age ?? null,

              order: departmentResponsible?.metadata?.order ?? null,

              stats: departmentStats,

            },

            isExpanded: false,

            children: officeNodes,

          };



          return { node: departmentNode, persons: departmentPersons };

        });



      const departmentNodes = departmentEntries.map((entry) => entry.node);

      const sedePersons = departmentEntries.flatMap((entry) => entry.persons);

      const sedeResponsible = selectResponsible(sedePersons);
      const sedeFlag = sedePersons.find((person) => person.metadata?.flag)?.metadata?.flag ?? 'it';

      const sedeStats = {
        departments: departmentNodes.length,
        offices: departmentNodes.reduce((sum, dept) => sum + (dept.children?.length ?? 0), 0),
        people: sedePersons.length,
      };

      const directorName = sedeResponsible?.name ?? DEFAULT_BRANCH_DIRECTOR;

      const sedeNode: Node = {
        id: `sede-${slugify(sedeName)}`,

        name: sedeName,

        role: "Sede",

        department: sedeName,

        location: locationValue,

        imageUrl: getFlagImage(sedeFlag),

        type: "sede",

        responsible: directorName,

        metadata: {

          badge: BADGE_BY_TYPE.sede,

          sede: sedeName,

          qualification: sedeResponsible?.metadata?.qualification ?? null,

          mansione: sedeResponsible?.metadata?.mansione ?? null,

          age: sedeResponsible?.metadata?.age ?? null,

          order: sedeResponsible?.metadata?.order ?? null,

          stats: sedeStats,
          flag: sedeFlag,
        },

        isExpanded: false,

        children: departmentNodes,

      };



      return sedeNode;

    });

  // Seleziona il CEO in modo robusto: preferisci qualifica 'dirigente', poi order=1
  const dirigentes = employees.filter(e => (e.qualification || '').toLowerCase() === 'dirigente');
  let ceo: Employee | null = null;
  if (dirigentes.length > 0) {
    // Se esiste Giuseppe Reggiani tra i dirigenti, preferiscilo
    ceo = dirigentes.find(e => e.name.toLowerCase().includes('giuseppe reggiani')) || dirigentes[0];
  } else {
    ceo = employees.find((emp) => emp.order === 1) || null;
  }

  const rootChildren = sedeNodes;
  const locationStats = {
    sites: sedeNodes.length,
    departments: sedeNodes.reduce((sum, sede) => sum + (sede.children?.length ?? 0), 0),
    offices: sedeNodes.reduce((sum, sede) =>
      sum + (sede.children?.reduce((deptSum, dept) => deptSum + (dept.children?.length ?? 0), 0) ?? 0),
      0
    ),
    people: employees.length,
  };

  const boardMembers: Employee[] = [
    createManualEmployee({
            id: "giuseppe-reggiani-refa",
            name: "Giuseppe Reggiani",
            photo: "",
            flag: "it",
            department: "REFA",
            office: "Board",
            role: "Presidente",
            qualification: "dirigente",
            manager: null,
            order: 1,
            sede: "CTH_ITALY",
      company: "REFA",
    }),
    createManualEmployee({
            id: "simone-cervi-refa",
            name: "Simone Cervi",
            photo: "",
            flag: "it",
            department: "REFA",
            office: "Board",
            role: "Consigliere",
            qualification: "dirigente",
            manager: "Giuseppe Reggiani",
            order: 1,
            sede: "CTH_ITALY",
      company: "REFA",
    }),
    createManualEmployee({
            id: "enrico-reggiani-refa",
            name: "Enrico Reggiani",
            photo: "",
            flag: "it",
            department: "REFA",
            office: "Board",
            role: "Consigliere",
            qualification: "dirigente",
            manager: "Giuseppe Reggiani",
            order: 1,
            sede: "CTH_ITALY",
      company: "REFA",
    }),
    createManualEmployee({
            id: "umberto-reggiani-refa",
            name: "Umberto Reggiani",
            photo: "",
            flag: "it",
            department: "REFA",
            office: "Board",
            role: "Consigliere",
            qualification: "dirigente",
            manager: "Giuseppe Reggiani",
            order: 1,
            sede: "CTH_ITALY",
      company: "REFA",
    }),
  ];

  const rootNode: Node = {
    id: ROOT_ID,
    name: "REFA",
    role: "Holding di controllo",
    department: "REFA Board",
    location: "Globale",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80",
    type: "root",
    responsible: ceo?.name ?? "Giuseppe Reggiani",
    metadata: {
      badge: BADGE_BY_TYPE.root,
      qualification: ceo?.qualification ?? null,
      mansione: ceo?.role ?? "Holding di controllo delle sedi",
      age: ceo?.age ?? null,
      order: ceo?.order ?? null,
      stats: locationStats,
    },
    isExpanded: true,
    children: [
      // Board REFA in cima, poi le sedi
      {
        id: `refa-board`,
        name: "REFA Board",
        role: "Consiglio di amministrazione",
        department: "REFA",
        location: "Globale",
        imageUrl: getDepartmentCardImage("REFA Board"),
        type: "department",
        responsible: "Giuseppe Reggiani",
        metadata: {
          badge: BADGE_BY_TYPE.department,
          sede: "Globale",
          department: "REFA",
          stats: { offices: 0, people: 4 },
        },
        isExpanded: false,
        children: boardMembers.map((member) =>
          createPersonNode(member, {
            location: "Globale",
            sede: "Globale",
            department: "REFA",
            office: "Board",
            manager: member.manager,
          })
        )
      },
      ...rootChildren
    ],
  };

  return rootNode;
};



const buildRoleTree = (employees: Employee[]): Node => {
  // Funzione di ordinamento per nodi
  const sortNodes = (nodes: Node[]): Node[] =>
    [...nodes].sort((a, b) => {
      // Primo criterio: ordinamento per qualifica (livello gerarchico)
      const qualificationA = a.metadata?.qualification || '';
      const qualificationB = b.metadata?.qualification || '';
      const qualOrderA = getQualificationOrder(qualificationA);
      const qualOrderB = getQualificationOrder(qualificationB);
      
      if (qualOrderA !== qualOrderB) {
        return qualOrderA - qualOrderB;
      }
      
      // Secondo criterio: ordinamento numerico del dipendente
      const orderA = a.metadata?.order ?? 99;
      const orderB = b.metadata?.order ?? 99;
      if (orderA !== orderB) return orderA - orderB;
      
      // Terzo criterio: ordinamento alfabetico
      return a.name.localeCompare(b.name, "it", { sensitivity: "base" });
    });

  // ==========================================
  // NUOVA LOGICA: Usa manager diretti dal CSV
  // ==========================================
  
  // 1. Crea una mappa di tutti i nodi persona
  const nodesByName = new Map<string, Node>();
  employees.forEach(emp => {
        const node = createPersonNode(emp, {
          location: emp.sede || FALLBACK_SEDE,
          sede: emp.sede || FALLBACK_SEDE,
          department: emp.department || FALLBACK_DEPARTMENT,
          office: emp.office || FALLBACK_OFFICE,
      manager: emp.manager || null,
        });
        node.children = [];
    nodesByName.set(emp.name, node);
  });

  // 2. Costruisci gerarchia basata sui manager diretti
  const rootCandidates: Node[] = [];
  
  employees.forEach(emp => {
    const employeeNode = nodesByName.get(emp.name);
    if (!employeeNode) return;

    const managerName = emp.manager?.trim();
    
    if (!managerName || managerName === '') {
      // Nessun manager = è un root (CEO o dirigente)
      rootCandidates.push(employeeNode);
    } else {
      // Ha un manager: trova il nodo del manager e aggiungiti come figlio
      const managerNode = nodesByName.get(managerName);
      if (managerNode) {
        managerNode.children!.push(employeeNode);
      } else {
        // Manager non trovato (potrebbe essere esterno o errore dati)
        // Aggiungi come root candidate
        rootCandidates.push(employeeNode);
      }
    }
  });

  // 3. Correggi gerarchie anomale: se dipendente e manager hanno stesso livello, sposta al livello superiore
  employees.forEach(emp => {
    const employeeNode = nodesByName.get(emp.name);
    if (!employeeNode || !emp.manager) return;

    const managerNode = nodesByName.get(emp.manager);
    if (!managerNode) return;

    const employeeLevel = getQualificationOrder(emp.qualification);
    const managerQual = managerNode.metadata?.qualification || '';
    const managerLevel = getQualificationOrder(managerQual);

    // Se dipendente e manager hanno lo stesso livello gerarchico (es: entrambi livello 3)
    if (employeeLevel === managerLevel) {
      // Trova il manager del manager
      const managerManagerName = employees.find(e => e.name === emp.manager)?.manager;
      
      if (managerManagerName) {
        const managerManagerNode = nodesByName.get(managerManagerName);
        
        if (managerManagerNode) {
          // Rimuovi il dipendente dal manager corrente
          if (managerNode.children) {
            managerNode.children = managerNode.children.filter(
              child => child.id !== employeeNode.id
            );
            if (managerNode.children.length === 0) {
              managerNode.children = undefined;
            }
          }

          // Aggiungi il dipendente al manager del manager
          if (!managerManagerNode.children) {
            managerManagerNode.children = [];
          }
          if (!managerManagerNode.children.some(child => child.id === employeeNode.id)) {
            managerManagerNode.children.push(employeeNode);
          }
        }
      }
    }
  });

  // 4. DISABILITATO: Rispettiamo esattamente i manager dal CSV
  // La logica di riorganizzazione automatica è stata disabilitata per rispettare
  // le assegnazioni manager-dipendente esattamente come specificate nel file CSV.
  // Ogni dipendente resta sotto il suo manager diretto come indicato nella colonna "RESPONSABILE ASSEGNATO".
  
  // Codice precedente commentato per riferimento:
  // nodesByName.forEach(managerNode => {
  //   if (!managerNode.children || managerNode.children.length <= 1) return;
  //   ...
  //   // Logica che riorganizzava automaticamente gli operai sotto i supervisori
  // });

  // 5. Trova il vero CEO (dirigente con order=1 o Giuseppe Reggiani)
  const ceo = employees.find((emp) => 
    emp.qualification.toLowerCase() === 'dirigente' || 
    emp.order === 1 ||
    emp.name.toLowerCase().includes('giuseppe reggiani')
  ) ?? null;

  // 6. Calcola statistiche ricorsivamente per tutti i nodi
    const calculateStats = (node: Node): number => {
      if (!node.children || node.children.length === 0) {
        node.children = undefined;
        return 0;
      }

    // Ordina i figli
      node.children = sortNodes(node.children);
      let totalReports = 0;
      
    // Calcola ricorsivamente per ogni figlio
      node.children.forEach(child => {
        totalReports += 1 + calculateStats(child);
      });

    // Aggiungi statistiche al nodo
      node.metadata = {
        ...node.metadata,
        stats: {
          ...(node.metadata?.stats ?? {}),
          directs: node.children.length,
          totalReports,
        },
      };

      return totalReports;
  };

  // Calcola statistiche per tutti i nodi
  nodesByName.forEach(node => calculateStats(node));

  // 7. Trova e restituisci il nodo root (CEO)
  let ceoNode: Node | null = null;
  if (ceo) {
    ceoNode = nodesByName.get(ceo.name) ?? null;
  }

  // Se non c'è CEO, trova il primo root candidate
  if (!ceoNode && rootCandidates.length > 0) {
    ceoNode = rootCandidates[0];
  }

  if (ceoNode) {
    ceoNode.isExpanded = true;
    return ceoNode;
  }

  // Fallback: crea un pseudo-root con tutti i root candidates
  const totalPeople = employees.length;
  const pseudoRoot: Node = {
    id: ROLE_ROOT_ID,
    name: "Dirigenza",
    role: "Struttura gerarchica",
    department: "Ruoli",
    location: "Globale",
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80",
    type: "root",
    responsible: null,
    metadata: {
      badge: BADGE_BY_TYPE.root,
      stats: {
        leaders: rootCandidates.length,
        people: totalPeople,
      },
    },
    isExpanded: true,
    children: sortNodes(rootCandidates),
  };

  return pseudoRoot;
};

const updateNodeById = (node: Node, targetId: string, updater: (current: Node) => Node): Node => {
  if (node.id === targetId) {
    return updater(node);
  }
  if (!node.children) {
    return node;
  }
  return {
    ...node,
    children: node.children.map((child) => updateNodeById(child, targetId, updater)),
  };
};

/**
 * Comprime l'albero fino a un livello specificato
 * @param node - Nodo da comprimere
 * @param currentLevel - Livello corrente (0 = root/CEO)
 * @param maxLevel - Livello massimo da mantenere espanso (default: 0, quindi espandi solo CEO)
 */
const collapseTree = (node: Node, currentLevel: number = 0, maxLevel: number = 0): Node => ({
  ...node,
  // Mantieni espanso solo il CEO (livello 0), comprimi tutto dal livello 1 in poi (direttori compressi)
  isExpanded: currentLevel <= maxLevel,
  children: node.children?.map((child) => collapseTree(child, currentLevel + 1, maxLevel)),
});

const App: React.FC = () => {
  const { modalNode, closeModal } = useModal();
  const [locationTree, setLocationTree] = useState<Node | null>(null);
  const [roleTree, setRoleTree] = useState<Node | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("role");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isSmartsheetSyncing, setIsSmartsheetSyncing] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    sede: null,
    dipartimento: null,
    ufficio: null,
    ruolo: null
  });
  
  const tree = viewMode === "location" ? locationTree : roleTree;
  
  // Hook per la ricerca
  const {
    searchQuery,
    setSearchQuery,
    highlightedNodes,
    resultCount,
    visibleNodes
  } = useOrgSearch(tree);

  // Hook per i filtri
  const {
    filteredNodes,
    shouldExpandForFilter,
    hasActiveFilters
  } = useFilters(tree, activeFilters);

  // Combina i nodi evidenziati da ricerca e filtri
  const combinedHighlightedNodes = new Set([...highlightedNodes, ...filteredNodes]);

  // Limita la visibilità per ricerca e filtri
  const searchVisibilitySet = visibleNodes && searchQuery.trim().length > 0 && resultCount > 0 ? visibleNodes : null;
  const isSearchNarrowed = Boolean(searchVisibilitySet);
  
  // Non limitare la visibilità per i filtri, solo evidenziare
  const isFilterNarrowed = false; // I filtri non nascondono nodi, solo evidenziano
  
  // Solo la ricerca limita la visibilità
  const combinedVisibilitySet = searchVisibilitySet;
  const isVisibilityNarrowed = isSearchNarrowed;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 🎯 PRIORITÀ 1: Prova a caricare da Smartsheet
        console.log('🔄 Tentativo caricamento dati da Smartsheet...');
        try {
          const csvData = await fetchSmartsheetData();
          const csvString = csvArrayToString(csvData);
          const employees = parseCsvEmployees(csvString);
          const orgTree = buildOrgTree(employees);
          const roleTree = buildRoleTree(employees);
          setLocationTree(orgTree);
          setRoleTree(roleTree);
          console.log(`✅ Dati caricati da Smartsheet: ${employees.length} dipendenti`);
          toast.success(`✅ Dati caricati da Smartsheet (${employees.length} dipendenti)`, {
            duration: 3000,
            icon: '📡'
          });
          return; // Successo! Esci dalla funzione
        } catch (smartsheetError) {
          // Smartsheet fallito, usa CSV locale come fallback (silenzioso)
          console.warn('⚠️ Smartsheet non disponibile, carico CSV locale...', smartsheetError);
        }

        // 📄 FALLBACK: Carica CSV locale se Smartsheet non disponibile
        const csvUrl = new URL("./_Suddivisione Clevertech light.csv", import.meta.url);
        const response = await fetch(csvUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch data file: ${response.statusText}`);
        }
        const text = await response.text();
        const employees = parseCsvEmployees(text);
        const orgTree = buildOrgTree(employees);
        const roleTree = buildRoleTree(employees);
        setLocationTree(orgTree);
        setRoleTree(roleTree);
        console.log(`📄 Dati caricati da CSV locale: ${employees.length} dipendenti`);
        // Toast solo se fallback (non duplicato)
        toast('📄 Dati caricati da CSV locale', {
          duration: 3000,
          icon: '💾'
        });
      } catch (e) {
        console.error('❌ Errore caricamento dati:', e);
        setError(e instanceof Error ? e.message : "Failed to load organizational data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleToggleNode = useCallback((nodeId: string) => {
    // Forza il toggle indipendentemente dallo stato corrente
    if (viewMode === "location") {
      setLocationTree((prev) =>
        prev
          ? updateNodeById(prev, nodeId, (current) => ({
              ...current,
              isExpanded: !Boolean(current.isExpanded),
            }))
          : prev
      );
    } else {
      setRoleTree((prev) =>
        prev
          ? updateNodeById(prev, nodeId, (current) => ({
              ...current,
              isExpanded: !Boolean(current.isExpanded),
            }))
          : prev
      );
    }
  }, [viewMode]);

  /**
   * Gestisce la compressione dell'albero mostrando solo CEO e i suoi diretti riporti
   * Dopo la compressione, centra la vista con uno zoom appropriato per visualizzare tutte le schede
   */
  const handleCollapseAll = useCallback((centerView: (scale?: number, animationTime?: number) => void) => {
    if (viewMode === "location") {
      setLocationTree((prev) => (prev ? collapseTree(prev) : prev));
    } else {
      setRoleTree((prev) => (prev ? collapseTree(prev) : prev));
    }
    
    // Centra la vista con zoom 0.65 per visualizzare CEO + tutti i direttori
    setTimeout(() => {
      centerView(0.65, 400);
    }, 150);
  }, [viewMode]);

  /**
   * Gestisce l'aggiornamento dei dati da Smartsheet
   * Scarica i dati, aggiorna il CSV locale e ricostruisce gli alberi
   */
  const handleSmartsheetUpdate = useCallback(async () => {
    setIsSmartsheetSyncing(true);
    const toastId = toast.loading('📡 Connessione a Smartsheet...');

    try {
      // 1. Scarica i dati da Smartsheet
      toast.loading('📥 Download dati in corso...', { id: toastId });
      const csvData = await fetchSmartsheetData();
      
      // 2. Converti in stringa CSV
      const csvString = csvArrayToString(csvData);
      
      // 3. Parsa i nuovi dati
      toast.loading('🔄 Elaborazione dati...', { id: toastId });
      const employees = parseCsvEmployees(csvString);
      
      // 4. Ricostruisci gli alberi
      const orgTree = buildOrgTree(employees);
      const roleTree = buildRoleTree(employees);
      
      // 5. Aggiorna lo stato
      setLocationTree(orgTree);
      setRoleTree(roleTree);
      
      // ✅ Successo - dati aggiornati direttamente da Smartsheet
      toast.success(`✅ Aggiornamento completato! ${employees.length} dipendenti sincronizzati.`, { 
        id: toastId,
        duration: 5000 
      });
      
    } catch (error) {
      console.error('Errore sincronizzazione Smartsheet:', error);
      
      // Messaggio specifico per errore di connessione al proxy
      let errorMessage = '❌ Errore durante la sincronizzazione con Smartsheet';
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        errorMessage = '❌ Proxy server non disponibile. Avvia il proxy con: npm run proxy';
      } else if (error instanceof Error) {
        errorMessage = `❌ ${error.message}`;
      }
      
      toast.error(errorMessage, { id: toastId, duration: 8000 });
    } finally {
      setIsSmartsheetSyncing(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex justify-center items-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <p className="text-xl text-slate-600">Caricamento dati organizzativi...</p>
          <p className="text-sm text-slate-500 mt-2">Costruzione della gerarchia in corso.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex justify-center items-center">
        <div className="text-center p-6 bg-red-100 border-2 border-red-400 text-red-700 rounded-xl shadow-lg max-w-md">
          <svg className="w-12 h-12 mx-auto mb-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xl font-semibold mb-2">Errore di Caricamento</p>
          <p className="text-md">{error}</p>
        </div>
      </div>
    );
  }

  if (!tree) {
    return null;
  }

  return (
    <>
      {/* Sistema di notifiche */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '8px',
          },
          success: {
            style: {
              background: 'rgb(34 197 94)',
            },
          },
          error: {
            style: {
              background: 'rgb(239 68 68)',
            },
          },
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 text-slate-800 p-1">



        {/* Pannello ricerca */}
        {isSearchPanelOpen && (
          <div className="fixed top-20 right-4 z-20 w-96">
            <div className="bg-white rounded-xl border border-slate-200 shadow-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-slate-900">🔍 Ricerca Globale</h3>
                <button
                  onClick={() => setIsSearchPanelOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  ✕
                </button>
              </div>
              <SearchBar 
                onSearch={setSearchQuery}
                resultCount={resultCount}
                placeholder="Cerca persone, ruoli, dipartimenti..."
                containerClassName="w-full"
              />
              {searchQuery && resultCount > 0 && (
                <p className="mt-2 text-sm text-emerald-600">
                  ✅ {resultCount} risultati trovati
                </p>
              )}
              {searchQuery && resultCount === 0 && (
                <p className="mt-2 text-sm text-amber-600">
                  ⚠️ Nessun risultato per "{searchQuery}"
                </p>
              )}
            </div>
          </div>
        )}


        {/* Pannello filtri - Solo quando aperto */}
        {isFilterPanelOpen && (
          <FilterPanel
            tree={tree}
            onFilterChange={setActiveFilters}
            isOpen={isFilterPanelOpen}
            onToggle={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
          />
        )}

        {/* Organigramma fullscreen senza box */}
        <div className="w-full h-screen">
          <div className="relative w-full h-full 
                          bg-gradient-to-br from-white via-blue-50/20 to-purple-50/20 
                          overflow-hidden">
            {/* Header e controlli integrati dentro l'organigramma */}
            <div className="absolute top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-slate-200 z-10">
              <div className="flex items-center justify-between px-6 py-4">
                {/* Lato sinistro: Titolo */}
                <div>
                  <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600 tracking-tight">
                    CLEVERTECH
                  </h1>
                  <p className="text-sm text-slate-600">Organigramma Aziendale Interattivo</p>
                </div>

                {/* Lato destro: Fila di controlli proporzionati */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewMode("location")}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors min-w-[85px] ${
                      viewMode === "location"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                    aria-pressed={viewMode === "location"}
                    title="Vista per sedi geografiche"
                  >
                    🏢 Sedi
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("role")}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors min-w-[85px] ${
                      viewMode === "role"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                    aria-pressed={viewMode === "role"}
                    title="Vista per gerarchia ruoli"
                  >
                    👥 Ruoli
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSearchPanelOpen(!isSearchPanelOpen)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors min-w-[85px] ${
                      isSearchPanelOpen
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                    title="Apri ricerca globale"
                  >
                    🔍 Cerca
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors min-w-[85px] ${
                      isFilterPanelOpen
                        ? "bg-purple-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                    title="Apri pannello filtri"
                  >
                    🎛️ Filtri
                  </button>
                  <ExportMenu tree={tree} />
                  <button
                    type="button"
                    onClick={handleSmartsheetUpdate}
                    disabled={isSmartsheetSyncing}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors min-w-[85px] ${
                      isSmartsheetSyncing
                        ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                        : "bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-300"
                    }`}
                    title="Sincronizza dati da Smartsheet"
                  >
                    {isSmartsheetSyncing ? (
                      <>
                        <span className="inline-block animate-spin mr-2">⟳</span>
                        Sync...
                      </>
                    ) : (
                      <>↻ Smartsheet</>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Organigramma a schermo pieno */}
            <div className="pt-20 h-full w-full">
              <NavigableOrgChart 
                tree={tree} 
                onToggle={handleToggleNode}
                highlightedNodes={combinedHighlightedNodes}
                visibleNodes={combinedVisibilitySet}
                isSearchNarrowed={isVisibilityNarrowed}
                onCollapseAll={handleCollapseAll}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Modal Globale - Renderizzato fuori dal Transform per garantire visibilità */}
      {modalNode && (
        <EmployeeDetailModal 
          node={modalNode}
          onClose={closeModal}
        />
      )}
    </>
  );
};

export default App;


