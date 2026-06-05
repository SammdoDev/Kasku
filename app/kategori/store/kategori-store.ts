// src/app/(pages)/kategori/store/kategori-store.ts
import { create } from "zustand";

export interface Category {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  type: "income" | "expense";
  created_at: string;
  updated_at: string;
}

interface KategoriState {
  list: Category[];
  loading: boolean;
  error: boolean;
  filterType: "all" | "income" | "expense";
  editTarget: Category | null;

  setList: (list: Category[]) => void;
  setLoading: (v: boolean) => void;
  setError: (v: boolean) => void;
  setFilterType: (v: "all" | "income" | "expense") => void;
  openEdit: (c: Category) => void;
  closeEdit: () => void;
  addCategory: (c: Category) => void;
  updateCategory: (c: Category) => void;
  removeCategory: (id: string) => void;
}

export const useKategoriStore = create<KategoriState>((set) => ({
  list: [],
  loading: false,
  error: false,
  filterType: "all",
  editTarget: null,

  setList: (list) => set({ list }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilterType: (filterType) => set({ filterType }),
  openEdit: (editTarget) => set({ editTarget }),
  closeEdit: () => set({ editTarget: null }),
  addCategory: (c) => set((s) => ({ list: [c, ...s.list] })),
  updateCategory: (c) =>
    set((s) => ({ list: s.list.map((x) => (x.id === c.id ? c : x)) })),
  removeCategory: (id) =>
    set((s) => ({ list: s.list.filter((x) => x.id !== id) })),
}));
