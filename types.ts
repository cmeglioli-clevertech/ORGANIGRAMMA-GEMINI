export type NodeType = "root" | "ceo" | "sede" | "department" | "office" | "person" | "qualification" | "role-group";

export interface NodeMetadata {
  badge?: string;
  sede?: string;
  department?: string;
  office?: string;
  qualification?: string | null;
  mansione?: string | null;
  age?: number | null;
  order?: number | null;
  stats?: Record<string, number>;
  officePurpose?: string;
}

export interface Node {
  id: string;
  name: string;
  role: string;
  department: string;
  location: string;
  imageUrl: string;
  type: NodeType;
  responsible?: string;
  metadata?: NodeMetadata;
  isExpanded?: boolean;
  order?: number;
  children?: Node[];
}
