
import type { Node } from '../types';

export const orgChartData: Node = {
  id: 'ceo',
  name: 'Giuseppe Reggiani',
  role: 'CEO',
  department: 'Direzione Generale',
  location: 'Cadelbosco di Sopra (RE)',
  imageUrl: 'https://picsum.photos/seed/giuseppe-reggiani/128/128',
  isExpanded: true,
  children: [
    {
      id: 'hr',
      name: 'Francesca Tirelli',
      role: 'Responsabile Risorse Umane',
      department: 'Human Resource Mgmt',
      location: 'CTH_ITALY',
      imageUrl: 'https://picsum.photos/seed/francesca-tirelli/128/128',
    },
    {
      id: 'qm',
      name: 'Fausto Elementi',
      role: 'Responsabile Qualità',
      department: 'Quality Management',
      location: 'CTH_ITALY',
      imageUrl: 'https://picsum.photos/seed/fausto-elementi/128/128',
    },
    {
      id: 'sm',
      name: 'Umberto Reggiani',
      role: 'Head of Sales & Marketing',
      department: 'Sales & Marketing',
      location: 'CTH_ITALY',
      imageUrl: 'https://picsum.photos/seed/umberto-reggiani/128/128',
      isExpanded: true,
      children: [
        { id: 'bd', name: 'Paolo Soliani', role: 'Resp. Business Development', department: 'Sales & Marketing', location: 'CTH_ITALY', imageUrl: 'https://picsum.photos/seed/paolo-soliani/128/128' },
        { id: 'mkt', name: 'Luca Carollo', role: 'Resp. Marketing & Sales Support', department: 'Sales & Marketing', location: 'CTH_ITALY', imageUrl: 'https://picsum.photos/seed/luca-carollo/128/128' },
        { id: 'as', name: 'Mohamed Kouki', role: 'Resp. After Sales', department: 'Sales & Marketing', location: 'CTH_ITALY', imageUrl: 'https://picsum.photos/seed/mohamed-kouki/128/128' },
      ],
    },
    {
      id: 'afc',
      name: 'Enrico Reggiani',
      role: 'Head of Adm., Finance & Control',
      department: 'Adm., Finance and Control',
      location: 'CTH_ITALY',
      imageUrl: 'https://picsum.photos/seed/enrico-reggiani/128/128',
      isExpanded: true,
      children: [
        { id: 'ad', name: 'Elena Minarini', role: 'Resp. Administration Dept.', department: 'Adm., Finance and Control', location: 'CTH_ITALY', imageUrl: 'https://picsum.photos/seed/elena-minarini/128/128' },
        { id: 'mc', name: 'Riccardo Orlandi', role: 'Resp. Management Control', department: 'Adm., Finance and Control', location: 'CTH_ITALY', imageUrl: 'https://picsum.photos/seed/riccardo-orlandi/128/128' },
        { id: 'it', name: 'Giuliano Messori', role: 'Resp. Information Technology', department: 'Adm., Finance and Control', location: 'CTH_ITALY', imageUrl: 'https://picsum.photos/seed/giuliano-messori/128/128' },
      ],
    },
    {
      id: 'mctr',
      name: 'Simone Cervi',
      role: 'Head of Mechatronic Dept',
      department: 'Mechatronic',
      location: 'CTH_ITALY',
      imageUrl: 'https://picsum.photos/seed/simone-cervi/128/128',
      isExpanded: false,
      children: [
        { id: 'mtd', name: 'Fabio Leoni', role: 'Resp. Mechanical Technical Dept.', department: 'Mechatronic', location: 'CTH_ITALY', imageUrl: 'https://picsum.photos/seed/fabio-leoni/128/128' },
        { id: 'atd', name: 'David Tabacco', role: 'Resp. Automation Technical Dept.', department: 'Mechatronic', location: 'CTH_ITALY', imageUrl: 'https://picsum.photos/seed/david-tabacco/128/128' },
      ],
    },
    {
      id: 'sc',
      name: 'Lorenzo Vezzani',
      role: 'Head of Supply Chain',
      department: 'Supply Chain',
      location: 'CTH_ITALY',
      imageUrl: 'https://picsum.photos/seed/lorenzo-vezzani/128/128',
      isExpanded: false,
      children: [
        { id: 'isa', name: 'Chiara Schiavone', role: 'Resp. SC Inf. Syst. & Adm. Support', department: 'Supply Chain', location: 'CTH_ITALY', imageUrl: 'https://picsum.photos/seed/chiara-schiavone/128/128' }
      ]
    },
    {
      id: 'prod',
      name: 'Stefano Giorgini',
      role: 'Head of Production',
      department: 'Production',
      location: 'CTH_ITALY',
      imageUrl: 'https://picsum.photos/seed/stefano-giorgini/128/128',
      isExpanded: false,
      children: [
          { id: 'log', name: 'Alessandro Barchi', role: 'Resp. Logistic Management', department: 'Production', location: 'CTH_ITALY', imageUrl: 'https://picsum.photos/seed/alessandro-barchi/128/128' },
          { id: 'ind', name: 'Gabriele Menozzi', role: 'Resp. Industrialization', department: 'Production', location: 'CTH_ITALY', imageUrl: 'https://picsum.photos/seed/gabriele-menozzi/128/128' },
      ]
    },
    {
      id: 'ecom',
      name: 'Francesco Beltrami',
      role: 'Head of E-Commerce',
      department: 'E-Commerce',
      location: 'CTH_ITALY',
      imageUrl: 'https://picsum.photos/seed/francesco-beltrami/128/128',
      isExpanded: false,
      children: [
        { id: 'etd', name: 'Matteo Modenese', role: 'Resp. Technical Dept.', department: 'E-Commerce', location: 'CTH_ITALY', imageUrl: 'https://picsum.photos/seed/matteo-modenese/128/128' },
        { id: 'eprd', name: 'Edmond Leci', role: 'Resp. Production', department: 'E-Commerce', location: 'CTH_ITALY', imageUrl: 'https://picsum.photos/seed/edmond-leci/128/128' },
      ],
    },
  ],
};
