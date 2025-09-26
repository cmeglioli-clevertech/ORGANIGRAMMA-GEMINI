
import React, { useState, useEffect, useCallback } from 'react';
import OrgChartNode from './components/OrgChartNode';
import type { Node } from './types';

// A type for parsed employee data
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
}

type EmployeeNode = Employee & {
  isManager: boolean;
  node: Node;
};


const getOrgData = async (): Promise<Node> => {
  const response = await fetch('./_Suddivisione Clevertech light.csv');
  if (!response.ok) {
    throw new Error(`Failed to fetch data file: ${response.statusText}`);
  }
  const text = await response.text();
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').slice(1);

  const originalMansione = new Map<string, string>();
  const employees: Employee[] = lines
    .map((line, index) => {
      if (!line || !line.trim()) return null;
      
      const parts = line.split(';');
      const name = (parts[0] || '').trim();
      if (!name) return null;

      const id = `${name.replace(/\s/g, '-')}-${index}`;
      
      // Corrected mapping from CSV columns
      const sede = (parts[2] || '').trim();
      const photo = (parts[3] || '').trim();
      const department = (parts[4] || '').trim();
      const office = (parts[5] || '').trim();
      const originalRole = (parts[6] || '').trim(); // This is 'Mansione'
      const qualification = (parts[7] || '').trim();
      const orderStr = (parts[8] || '99').trim();
      
      originalMansione.set(id, originalRole);
      
      const orderVal = parseInt(orderStr, 10);

      return {
        id,
        name,
        photo,
        sede,
        department: department.replace(/^\|/, '').trim(),
        office: office.replace(/^\|/, '').trim(),
        role: originalRole.replace(/^\|/, '').trim(),
        qualification: qualification,
        order: !isNaN(orderVal) ? orderVal : 99,
      };
    })
    .filter((e): e is Employee => e !== null);

  const allNodes: EmployeeNode[] = employees.map(emp => ({
    ...emp,
    isManager: !!originalMansione.get(emp.id)?.startsWith('|'),
    node: {
        id: emp.id,
        name: emp.name,
        role: emp.role,
        department: emp.department,
        location: emp.sede || 'N/A', // Correctly use 'SEDE' for location
        imageUrl: `https://picsum.photos/seed/${encodeURIComponent(emp.name)}/128/128`,
        isExpanded: emp.order < 3,
        children: [],
    }
  }));

  const nodeMapFinal = new Map<string, EmployeeNode>(allNodes.map(n => [n.id, n]));
  const rootNodeFinal = allNodes.find(e => e.order === 1);
  if (!rootNodeFinal) throw new Error("CEO not found in the data file. Check the data source for an employee with order '1'.");

  for (const empNode of allNodes) {
    if (empNode.order === 1 || empNode.id === rootNodeFinal.id) continue;
    
    let manager: EmployeeNode | undefined = undefined;
    
    // 1. Find Office Manager
    let candidates = allNodes.filter(p => p.department === empNode.department && p.office === empNode.office && p.isManager && p.order < empNode.order);
    if(candidates.length > 0) {
        manager = candidates.sort((a,b) => a.order - b.order)[0];
    } else {
        // 2. Find Department Director
        candidates = allNodes.filter(p => p.department === empNode.department && (p.order === 2 || p.office === 'Direzione') && p.isManager && p.order < empNode.order);
         if(candidates.length > 0) {
            manager = candidates.sort((a,b) => a.order - b.order)[0];
        } else {
            // 3. Handle Direzione Generale hierarchy
            if(empNode.department === 'Direzione Generale') {
                candidates = allNodes.filter(p => p.department === empNode.department && p.isManager && p.order < empNode.order);
                if(candidates.length > 0) {
                   manager = candidates.sort((a,b) => a.order - b.order)[0];
                }
            }
        }
    }

    const parent = manager ? nodeMapFinal.get(manager.id) : rootNodeFinal;
    if (parent && parent.id !== empNode.id) {
      parent.node.children.push(empNode.node);
    }
  }

  return rootNodeFinal.node;
}


const App: React.FC = () => {
  const [data, setData] = useState<Node | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const orgData = await getOrgData();
        setData(orgData);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load organizational data.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleToggleNode = useCallback((nodeId: string) => {
    if (!data) return;

    const toggle = (node: Node): Node => {
      if (node.id === nodeId) {
        return { ...node, isExpanded: !node.isExpanded };
      }
      if (node.children) {
        return { ...node, children: node.children.map(toggle) };
      }
      return node;
    };
    setData(toggle(data));
  }, [data]);
  
  if (loading) {
      return (
        <div className="min-h-screen bg-slate-100 flex justify-center items-center">
            <div className="text-center">
                <p className="text-xl text-slate-600">Loading Organizational Chart...</p>
                <p className="text-sm text-slate-500 mt-2">Please wait while we build the hierarchy.</p>
            </div>
        </div>
      )
  }
  
  if (error) {
      return (
        <div className="min-h-screen bg-slate-100 flex justify-center items-center">
             <div className="text-center p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                <p className="text-xl font-semibold">Error</p>
                <p className="text-md">{error}</p>
            </div>
        </div>
      )
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col items-center p-4 sm:p-8 overflow-x-auto">
        <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">CLEVERTECH</h1>
            <p className="text-lg text-slate-600 mt-2">Organizational Chart</p>
        </header>
        <div className="flex justify-center">
             {data && <OrgChartNode node={data} onToggle={handleToggleNode} isRoot={true} />}
        </div>
    </div>
  );
};

export default App;
