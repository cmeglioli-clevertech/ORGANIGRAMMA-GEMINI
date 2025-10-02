import { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import type { Node } from '../types';

interface SearchResult {
  item: Node;
  score: number;
  matches?: any[];
  path: string[];
}

// Funzione ricorsiva per appiattire l'albero dei nodi
const flattenTree = (node: Node, path: string[] = []): Array<{ node: Node; path: string[] }> => {
  const currentPath = [...path, node.name];
  const results = [{ node, path: currentPath }];
  
  if (node.children) {
    node.children.forEach(child => {
      results.push(...flattenTree(child, currentPath));
    });
  }
  
  return results;
};

const findPathById = (node: Node, targetId: string, path: string[] = []): string[] | null => {
  const currentPath = [...path, node.id];

  if (node.id === targetId) {
    return currentPath;
  }

  if (!node.children) {
    return null;
  }

  for (const child of node.children) {
    const result = findPathById(child, targetId, currentPath);
    if (result) {
      return result;
    }
  }

  return null;
};

// Hook personalizzato per la ricerca nell'organigramma
export const useOrgSearch = (tree: Node | null) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());
  const [visibleNodes, setVisibleNodes] = useState<Set<string> | null>(null);

  // Appiattisci l'albero e crea l'indice Fuse
  const searchIndex = useMemo(() => {
    if (!tree) return null;

    const flatNodes = flattenTree(tree);
    
    // Configurazione Fuse.js per ricerca fuzzy
    const fuseOptions = {
      keys: [
        { name: 'node.name', weight: 0.3 },
        { name: 'node.role', weight: 0.2 },
        { name: 'node.department', weight: 0.15 },
        { name: 'node.location', weight: 0.1 },
        { name: 'node.responsible', weight: 0.1 },
        { name: 'node.metadata.sede', weight: 0.05 },
        { name: 'node.metadata.office', weight: 0.05 },
        { name: 'node.metadata.mansione', weight: 0.05 }
      ],
      threshold: 0.3, // Sensibilità della ricerca (0 = esatto, 1 = tutto)
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      shouldSort: true
    };

    return new Fuse(flatNodes, fuseOptions);
  }, [tree]);

  // Effettua la ricerca quando cambia la query
  useEffect(() => {
    if (!searchIndex || !searchQuery.trim() || !tree) {
      setSearchResults([]);
      setHighlightedNodes(new Set());
      setVisibleNodes(null);
      return;
    }

    // Esegui la ricerca
    const results = searchIndex.search(searchQuery).slice(0, 20); // Limita a 20 risultati
    
    // Estrai i nodi e i loro path
    const formattedResults: SearchResult[] = results.map(result => ({
      item: result.item.node,
      score: result.score || 0,
      matches: result.matches,
      path: result.item.path
    }));

    setSearchResults(formattedResults);
    
    const nodesToHighlight = new Set<string>();
    const nodesToReveal = new Set<string>();

    formattedResults.forEach(result => {
      nodesToHighlight.add(result.item.id);
      const pathIds = findPathById(tree, result.item.id);
      if (pathIds) {
        pathIds.forEach(id => nodesToReveal.add(id));
      }
    });

    setHighlightedNodes(nodesToHighlight);
    setVisibleNodes(nodesToReveal.size > 0 ? nodesToReveal : null);

  }, [searchQuery, searchIndex, tree]);

  // Funzione per ottenere tutti gli antenati di un nodo
  const getAncestorIds = (nodeId: string): string[] => {
    const result = searchResults.find(r => r.item.id === nodeId);
    if (!result) return [];

    const ancestors: string[] = [];
    const findAncestors = (node: Node, targetId: string, currentPath: string[] = []): boolean => {
      if (node.id === targetId) {
        ancestors.push(...currentPath);
        return true;
      }
      if (node.children) {
        for (const child of node.children) {
          if (findAncestors(child, targetId, [...currentPath, node.id])) {
            return true;
          }
        }
      }
      return false;
    };

    if (tree) {
      findAncestors(tree, nodeId);
    }
    return ancestors;
  };

  // Funzione per verificare se un nodo dovrebbe essere espanso
  const shouldExpandNode = (nodeId: string): boolean => {
    // Espandi se il nodo o uno dei suoi discendenti è nei risultati
    const checkDescendants = (node: Node): boolean => {
      if (highlightedNodes.has(node.id)) return true;
      if (node.children) {
        return node.children.some(child => checkDescendants(child));
      }
      return false;
    };

    // Trova il nodo nell'albero e verifica
    const findAndCheck = (node: Node): boolean => {
      if (node.id === nodeId) {
        return checkDescendants(node);
      }
      if (node.children) {
        for (const child of node.children) {
          const result = findAndCheck(child);
          if (result) return result;
        }
      }
      return false;
    };

    return tree ? findAndCheck(tree) : false;
  };

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    highlightedNodes,
    getAncestorIds,
    shouldExpandNode,
    resultCount: searchResults.length,
    visibleNodes,
    nodesToExpand: visibleNodes // Alias esplicito per indicare quali nodi espandere
  };
};
