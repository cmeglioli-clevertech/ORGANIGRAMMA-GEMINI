import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import type { Node } from '../types';

/**
 * Context per gestire modal globalmente
 * Modal renderizzato a livello App (fuori Transform) per garantire visibilità
 */

interface ModalContextType {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  resetZoomRef: React.MutableRefObject<(() => void) | null>;
  // Nuovo: gestione modal content
  modalNode: Node | null;
  openModal: (node: Node) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalNode, setModalNode] = useState<Node | null>(null);
  const resetZoomRef = useRef<(() => void) | null>(null);

  const openModal = (node: Node) => {
    setModalNode(node);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setModalNode(null);
    setIsModalOpen(false);
    document.body.style.overflow = '';
  };

  return (
    <ModalContext.Provider value={{ 
      isModalOpen, 
      setIsModalOpen, 
      resetZoomRef,
      modalNode,
      openModal,
      closeModal 
    }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within ModalProvider');
  }
  return context;
};

