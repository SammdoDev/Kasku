import { create } from "zustand";

export interface PaymentMethod {
  id: string;
  name: string;
  type: string | null;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

interface DompetState {
  list: PaymentMethod[];
  loading: boolean;
  error: boolean;
  editTarget: PaymentMethod | null;
  modalOpen: boolean;
  modalKey: number;

  setList: (list: PaymentMethod[]) => void;
  setLoading: (v: boolean) => void;
  setError: (v: boolean) => void;
  openCreate: () => void;
  openEdit: (item: PaymentMethod) => void;
  closeModal: () => void;
  remove: (id: string) => void;
}

export const useDompetStore = create<DompetState>((set) => ({
  list: [],
  loading: true,
  error: false,
  editTarget: null,
  modalOpen: false,
  modalKey: 0,
  openCreate: () =>
    set((s) => ({
      modalOpen: true,
      editTarget: null,
      modalKey: s.modalKey + 1,
    })),
  openEdit: (item) =>
    set((s) => ({
      modalOpen: true,
      editTarget: item,
      modalKey: s.modalKey + 1,
    })),

  setList: (list) => set({ list, error: false }),
  setLoading: (v) => set({ loading: v }),
  setError: (v) => set({ error: v }),
  closeModal: () => set({ modalOpen: false, editTarget: null }),
  remove: (id) => set((s) => ({ list: s.list.filter((i) => i.id !== id) })),
}));
