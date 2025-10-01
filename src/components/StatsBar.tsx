import React, { useMemo } from 'react';
import type { Node } from '../types';

interface StatsBarProps {
  tree: Node | null;
}

const StatsBar: React.FC<StatsBarProps> = ({ tree }) => {
  const stats = useMemo(() => {
    if (!tree) return null;

    const counts = {
      totalPeople: 0,
      totalDepartments: 0,
      totalOffices: 0,
      totalSedi: 0,
      avgAge: 0
    };

    const ages: number[] = [];

    const countNodes = (node: Node) => {
      switch (node.type) {
        case 'person':
          counts.totalPeople++;
          if (node.metadata?.age) {
            ages.push(node.metadata.age);
          }
          break;
        case 'department':
          counts.totalDepartments++;
          break;
        case 'office':
          counts.totalOffices++;
          break;
        case 'sede':
          counts.totalSedi++;
          break;
      }

      if (node.children) {
        node.children.forEach(child => countNodes(child));
      }
    };

    countNodes(tree);

    // Calcola età media
    if (ages.length > 0) {
      counts.avgAge = Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length);
    }

    return counts;
  }, [tree]);

  if (!stats) return null;

  const statItems = [
    { label: 'Sedi', value: stats.totalSedi, icon: '🏢', color: 'blue' },
    { label: 'Dipartimenti', value: stats.totalDepartments, icon: '🏛️', color: 'emerald' },
    { label: 'Uffici', value: stats.totalOffices, icon: '🏪', color: 'indigo' },
    { label: 'Persone', value: stats.totalPeople, icon: '👥', color: 'purple' },
    { label: 'Età Media', value: stats.avgAge, icon: '📊', color: 'amber', suffix: ' anni' }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto mb-8">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {statItems.map((stat, index) => (
            <div 
              key={stat.label} 
              className={`flex flex-col items-center p-4 rounded-xl bg-gradient-to-br ${
                stat.color === 'blue' ? 'from-blue-50 to-blue-100' :
                stat.color === 'emerald' ? 'from-emerald-50 to-emerald-100' :
                stat.color === 'indigo' ? 'from-indigo-50 to-indigo-100' :
                stat.color === 'purple' ? 'from-purple-50 to-purple-100' :
                'from-amber-50 to-amber-100'
              } border ${
                stat.color === 'blue' ? 'border-blue-200' :
                stat.color === 'emerald' ? 'border-emerald-200' :
                stat.color === 'indigo' ? 'border-indigo-200' :
                stat.color === 'purple' ? 'border-purple-200' :
                'border-amber-200'
              } transition-transform hover:scale-105`}
            >
              <span className="text-2xl mb-2">{stat.icon}</span>
              <span className={`text-2xl font-bold ${
                stat.color === 'blue' ? 'text-blue-700' :
                stat.color === 'emerald' ? 'text-emerald-700' :
                stat.color === 'indigo' ? 'text-indigo-700' :
                stat.color === 'purple' ? 'text-purple-700' :
                'text-amber-700'
              }`}>
                {stat.value}{stat.suffix || ''}
              </span>
              <span className="text-sm text-slate-600 mt-1">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsBar;
