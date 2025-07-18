import { create } from 'zustand';

export const useSheetStore = create<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen) => {
    set({ isOpen });
  },
}));
