
export interface Node {
  id: string;
  name: string;
  role: string;
  department: string;
  location: string;
  imageUrl: string;
  isExpanded?: boolean;
  children?: Node[];
}
