import { create } from "zustand";

export interface Kategori {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  type: string;
}

export interface Anggaran {
  id: string;
  name: string;
  amount: number;
  period: string;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  category: Kategori | null;
  spent?: number;
  remaining?: number;
  percent_used?: number;
}

interface AnggaranState {
  list: Anggaran[];
  loading: boolean;
  error: boolean;
  editTarget: Anggaran | null;
  modalOpen: boolean;

  setList: (list: Anggaran[]) => void;
  setLoading: (v: boolean) => void;
  setError: (v: boolean) => void;
  openCreate: () => void;
  openEdit: (item: Anggaran) => void;
  closeModal: () => void;
  remove: (id: string) => void;
}

export const useAnggaranStore = create<AnggaranState>((set) => ({
  list: [],
  loading: true,
  error: false,
  editTarget: null,
  modalOpen: false,

  setList: (list) => set({ list, error: false }),
  setLoading: (v) => set({ loading: v }),
  setError: (v) => set({ error: v }),
  openCreate: () => set({ modalOpen: true, editTarget: null }),
  openEdit: (item) => set({ modalOpen: true, editTarget: item }),
  closeModal: () => set({ modalOpen: false, editTarget: null }),
  remove: (id) => set((s) => ({ list: s.list.filter((i) => i.id !== id) })),
}));
