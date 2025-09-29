import React, { useCallback, useEffect, useState } from "react";
import { Toaster } from 'react-hot-toast';
import NavigableOrgChart from "./components/NavigableOrgChart";
import SearchBar from "./components/SearchBar";
import FilterPanel from "./components/FilterPanel";
import ExportMenu from "./components/ExportMenu";
import { useOrgSearch } from "./hooks/useOrgSearch";
import { useFilters } from "./hooks/useFilters";
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
  manager: string | null;
  order: number;
  sede: string;
  age: number | null;
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

const QUALIFICATION_ORDER: Record<string, number> = {
  "dirigente": 1,
  "quadro / direttore": 2,
  "responsabile di team/area": 3,
  "impiegato direttivo": 4,
  "specialista (impiegatizio/tecnico)": 5,
  "impiegato qualificato": 6,
  "impiegato esecutivo": 7,
  "apprendista impiegato": 8,
  "operaio specializzato": 9,
  "operaio qualificato": 10,
  "operaio comune": 11,
  "operaio generico": 12,
  "apprendista operaio": 13,
};

const getQualificationOrder = (qualification: string) =>
  QUALIFICATION_ORDER[qualification.toLowerCase()] ?? 999;

// Mappa immagini dipendenti (docs/IMMAGINI/*.png) caricata a build-time
const employeeImageModules = import.meta.glob("./docs/IMMAGINI/**/*.png", { eager: true, as: "url" }) as Record<string, string>;

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

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "non-specificato";
const parseCsvEmployees = (csvText: string): Employee[] => {
  const lines = csvText.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").slice(1);
  const employees: Employee[] = [];

  lines.forEach((line, index) => {
    if (!line || !line.trim()) return;
    const parts = line.split(";");
    const name = (parts[0] || "").trim();
    if (!name) return;

    const flag = (parts[1] || "").trim();
    const sede = (parts[2] || "").trim();
    const photo = (parts[3] || "").trim();
    const department = (parts[4] || "").trim().replace(/^\|/, "").trim();
    const office = (parts[5] || "").trim().replace(/^\|/, "").trim();
    const role = (parts[6] || "").trim().replace(/^\|/, "").trim();
    const qualification = (parts[7] || "").trim();
    const hasManagerColumn = parts.length >= 12;
    const managerName = hasManagerColumn ? (parts[8] || "").trim() : "";
    const orderStr = (parts[hasManagerColumn ? 9 : 8] || "99").trim();
    const ageStr = (parts[hasManagerColumn ? 10 : 9] || "").trim();

    const orderVal = Number.parseInt(orderStr, 10);
    const ageVal = Number.parseInt(ageStr, 10);

    employees.push({
      id: `${name.replace(/\s/g, "-")}-${index}`,
      name,
      photo,
      flag,
      department: department || FALLBACK_DEPARTMENT,
      office: office || FALLBACK_OFFICE,
      role: role || "-",
      qualification,
      manager: managerName ? managerName : null,
      order: Number.isNaN(orderVal) ? 99 : orderVal,
      sede: sede || FALLBACK_SEDE,
      age: Number.isNaN(ageVal) ? null : ageVal,
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
    sede: context.sede ?? emp.sede ?? FALLBACK_SEDE,
    department: context.department ?? emp.department ?? FALLBACK_DEPARTMENT,
    office: context.office ?? emp.office ?? FALLBACK_OFFICE,
    qualification: emp.qualification || null,
    mansione: emp.role || null,
    age: emp.age,
    order: emp.order,
    flag: emp.flag || null,
    reportsTo: context.manager ?? null,
  },
  children: undefined,
});

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
                imageUrl: `https://picsum.photos/seed/${encodeURIComponent(`office-${sedeName}-${departmentName}-${officeName}`)}/128/128`,
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

            imageUrl: `https://picsum.photos/seed/${encodeURIComponent(`department-${sedeName}-${departmentName}`)}/128/128`,

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

  const rootNode: Node = {
    id: ROOT_ID,
    name: "REFA",
    role: "Holding di controllo",
    department: "REFA Board",
    location: "Globale",
    imageUrl: "https://picsum.photos/seed/refa-root/128/128",
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
        imageUrl: "https://picsum.photos/seed/refa-board/128/128",
        type: "department",
        responsible: "Giuseppe Reggiani",
        metadata: {
          badge: BADGE_BY_TYPE.department,
          sede: "Globale",
          department: "REFA",
          stats: { offices: 0, people: 4 },
        },
        isExpanded: false,
        children: [
          createPersonNode({
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
            age: null,
          }, { location: "Globale", sede: "Globale", department: "REFA", office: "Board", manager: null }),
          createPersonNode({
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
            age: null,
          }, { location: "Globale", sede: "Globale", department: "REFA", office: "Board", manager: "Giuseppe Reggiani" }),
          createPersonNode({
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
            age: null,
          }, { location: "Globale", sede: "Globale", department: "REFA", office: "Board", manager: "Giuseppe Reggiani" }),
          createPersonNode({
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
            age: null,
          }, { location: "Globale", sede: "Globale", department: "REFA", office: "Board", manager: "Giuseppe Reggiani" }),
        ]
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

  // 4. Crea sotto-gerarchie intelligenti per uffici
  // Logica: Responsabile → [Impiegato direttivo, Specialista, Impiegato qualificato, Impiegato esecutivo] sulla stessa riga
  //         Operai (livelli 8+) vanno sotto il più alto disponibile tra 4-7, o direttamente sotto responsabile
  nodesByName.forEach(managerNode => {
    if (!managerNode.children || managerNode.children.length <= 1) return;

    const managerQual = managerNode.metadata?.qualification || '';
    const managerLevel = getQualificationOrder(managerQual);

    // Se il manager è un Responsabile di team/area (livello 3) o simile
    if (managerLevel <= 3) {
      // Raggruppa i figli per ufficio
      const childrenByOffice = new Map<string, Node[]>();
      managerNode.children.forEach(child => {
        const office = child.metadata?.office || 'Non specificato';
        if (!childrenByOffice.has(office)) {
          childrenByOffice.set(office, []);
        }
        childrenByOffice.get(office)!.push(child);
      });

      // Per ogni ufficio, organizza la gerarchia
      childrenByOffice.forEach((officeChildren, office) => {
        if (officeChildren.length <= 1) return;

        // Separa i livelli 4-7 (impiegati) dai livelli 8+ (operai)
        const supervisors: Node[] = []; // Livelli 4-7: Impiegato direttivo, Specialista, Qualificato, Esecutivo
        const workers: Node[] = [];     // Livelli 8+: Operai

        officeChildren.forEach(child => {
          const childQual = child.metadata?.qualification || '';
          const childLevel = getQualificationOrder(childQual);
          
          if (childLevel >= 4 && childLevel <= 7) {
            supervisors.push(child);
          } else if (childLevel >= 8) {
            workers.push(child);
          }
        });

        // Se ci sono operai e supervisori
        if (workers.length > 0 && supervisors.length > 0) {
          // Rimuovi tutti i figli di questo ufficio dal manager
          managerNode.children = managerNode.children!.filter(
            child => !officeChildren.includes(child)
          );

          // Ordina i supervisori per livello
          const sortedSupervisors = supervisors.sort((a, b) => {
            const levelA = getQualificationOrder(a.metadata?.qualification || '');
            const levelB = getQualificationOrder(b.metadata?.qualification || '');
            return levelA - levelB;
          });

          // Aggiungi tutti i supervisori (4-7) come figli diretti del manager (stessa riga)
          managerNode.children!.push(...sortedSupervisors);

          // Trova il supervisore più alto (livello più basso numericamente)
          const topSupervisor = sortedSupervisors[0];

          // Aggiungi gli operai sotto il supervisore più alto
          if (!topSupervisor.children) {
            topSupervisor.children = [];
          }
          topSupervisor.children.push(...workers);
        }
      });
    }
  });

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
    imageUrl: "https://picsum.photos/seed/dirigenza-root/128/128",
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

const collapseTree = (node: Node): Node => ({
  ...node,
  isExpanded: false,
  children: node.children?.map((child) => collapseTree(child)),
});

const App: React.FC = () => {
  const [locationTree, setLocationTree] = useState<Node | null>(null);
  const [roleTree, setRoleTree] = useState<Node | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("role");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
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
      } catch (e) {
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

  const handleCollapseAll = useCallback(() => {
    if (viewMode === "location") {
      setLocationTree((prev) => (prev ? collapseTree(prev) : prev));
    } else {
      setRoleTree((prev) => (prev ? collapseTree(prev) : prev));
    }
  }, [viewMode]);

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

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-800 p-1">



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


        {/* Pannello filtri */}
        <FilterPanel
          tree={tree}
          onFilterChange={setActiveFilters}
          isOpen={isFilterPanelOpen}
          onToggle={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
        />

        {/* Organigramma massimizzato con tutto integrato */}
        <div className="w-full h-screen p-2">
          <div className="relative w-full h-full border-2 border-slate-300 rounded-2xl bg-white shadow-xl overflow-hidden">
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
    </>
  );
};

export default App;


