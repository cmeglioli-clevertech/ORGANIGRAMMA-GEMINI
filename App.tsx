import React, { useCallback, useEffect, useState } from "react";
import OrgChartNode from "./components/OrgChartNode";
import type { Node, NodeMetadata, NodeType } from "./types";

interface Employee {
  id: string;
  name: string;
  photo: string;
  department: string;
  office: string;
  role: string;
  qualification: string;
  order: number;
  sede: string;
  age: number | null;
}

interface NodeWithParent {
  node: Node | null;
  parent: Node | null;
}

const ROOT_ID = "clevertech-root";
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
};

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

    const sede = (parts[2] || "").trim();
    const photo = (parts[3] || "").trim();
    const department = (parts[4] || "").trim().replace(/^\|/, "").trim();
    const office = (parts[5] || "").trim().replace(/^\|/, "").trim();
    const role = (parts[6] || "").trim().replace(/^\|/, "").trim();
    const qualification = (parts[7] || "").trim();
    const orderStr = (parts[8] || "99").trim();
    const ageStr = (parts[9] || "").trim();

    const orderVal = Number.parseInt(orderStr, 10);
    const ageVal = Number.parseInt(ageStr, 10);

    employees.push({
      id: `${name.replace(/\s/g, "-")}-${index}`,
      name,
      photo,
      department: department || FALLBACK_DEPARTMENT,
      office: office || FALLBACK_OFFICE,
      role: role || "—",
      qualification,
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
  const candidate = emp.photo?.trim();
  if (candidate && /^https?:\/\//i.test(candidate)) {
    return candidate;
  }
  if (candidate && candidate.endsWith(".png")) {
    return candidate;
  }
  return `https://picsum.photos/seed/${encodeURIComponent(emp.name)}/128/128`;
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
          if (a[0] === FALLBACK_DEPARTMENT) return 1;
          if (b[0] === FALLBACK_DEPARTMENT) return -1;
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
              const personNodes: Node[] = sortedMembers.map((emp) => ({
                id: emp.id,
                name: emp.name,
                role: emp.role,
                department: emp.department,
                location: locationValue,
                imageUrl: getEmployeeImage(emp),
                type: "person",
                metadata: {
                  badge: BADGE_BY_TYPE.person,
                  sede: sedeName,
                  department: departmentName,
                  office: officeName,
                  qualification: emp.qualification || null,
                  mansione: emp.role || null,
                  age: emp.age,
                  order: emp.order,
                },
                children: undefined,
              }));

              departmentPersons.push(...personNodes);
              const responsiblePerson = selectResponsible(personNodes);

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
                },
                isExpanded: false,
                children: personNodes,
              } as Node;
            });
          const departmentResponsible = selectResponsible(departmentPersons);

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
            },
            isExpanded: false,
            children: officeNodes,
          };

          return { node: departmentNode, persons: departmentPersons };
        });

      const departmentNodes = departmentEntries.map((entry) => entry.node);
      const sedePersons = departmentEntries.flatMap((entry) => entry.persons);
      const sedeResponsible = selectResponsible(sedePersons);

      const sedeNode: Node = {
        id: `sede-${slugify(sedeName)}`,
        name: sedeName,
        role: "Sede",
        department: sedeName,
        location: locationValue,
        imageUrl: `https://picsum.photos/seed/${encodeURIComponent(`sede-${sedeName}`)}/128/128`,
        type: "sede",
        responsible: sedeResponsible?.name,
        metadata: {
          badge: BADGE_BY_TYPE.sede,
          sede: sedeName,
          qualification: sedeResponsible?.metadata?.qualification ?? null,
          mansione: sedeResponsible?.metadata?.mansione ?? null,
          age: sedeResponsible?.metadata?.age ?? null,
          order: sedeResponsible?.metadata?.order ?? null,
        },
        isExpanded: false,
        children: departmentNodes,
      };

      return sedeNode;
    });
  const ceo = employees.find((emp) => emp.order === 1) ?? null;
  const ceoNode: Node | null = ceo
    ? {
        id: "ceo-overview",
        name: ceo.name,
        role: ceo.role || "Amministratore Delegato",
        department: ceo.department,
        location: ceo.sede || "Globale",
        imageUrl: getEmployeeImage(ceo),
        type: "ceo",
        responsible: ceo.name,
        metadata: {
          badge: BADGE_BY_TYPE.ceo,
          sede: ceo.sede,
          department: ceo.department,
          office: ceo.office,
          qualification: ceo.qualification || null,
          mansione: ceo.role || "Amministratore Delegato",
          age: ceo.age ?? null,
          order: ceo.order ?? null,
        },
        isExpanded: false,
      }
    : null;

  const rootChildren = ceoNode ? [ceoNode, ...sedeNodes] : sedeNodes;

  const rootNode: Node = {
    id: ROOT_ID,
    name: "CLEVERTECH GLOBAL",
    role: "Organigramma aziendale",
    department: "Azienda",
    location: "Globale",
    imageUrl: "https://picsum.photos/seed/clevertech-root/128/128",
    type: "root",
    responsible: ceoNode?.name,
    metadata: {
      badge: BADGE_BY_TYPE.root,
      qualification: ceoNode?.metadata?.qualification ?? null,
      mansione: ceoNode?.metadata?.mansione ?? "Organigramma aziendale",
      age: ceoNode?.metadata?.age ?? null,
      order: ceoNode?.metadata?.order ?? null,
    },
    isExpanded: true,
    children: rootChildren,
  };

  return rootNode;
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

const App: React.FC = () => {
  const [tree, setTree] = useState<Node | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
        setTree(orgTree);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load organizational data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  const handleToggleNode = useCallback((nodeId: string) => {
    setTree((prev) =>
      prev
        ? updateNodeById(prev, nodeId, (current) => ({
            ...current,
            isExpanded: current.isExpanded === undefined ? false : !current.isExpanded,
          }))
        : prev
    );
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex justify-center items-center">
        <div className="text-center">
          <p className="text-xl text-slate-600">Loading organizational data...</p>
          <p className="text-sm text-slate-500 mt-2">Please wait while we build the hierarchy.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex justify-center items-center">
        <div className="text-center p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <p className="text-xl font-semibold">Errore</p>
          <p className="text-md">{error}</p>
        </div>
      </div>
    );
  }

  if (!tree) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col items-center p-4 sm:p-8 overflow-x-auto">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">CLEVERTECH</h1>
        <p className="text-lg text-slate-600 mt-2">Organigramma per sedi, dipartimenti, uffici e persone</p>
      </header>
      <div className="flex justify-center">
        <OrgChartNode node={tree} onToggle={handleToggleNode} depth={0} />
      </div>
    </div>
  );
};

export default App;


