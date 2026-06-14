import { create } from "zustand";

export interface Tag {
  id: string;
  name: string;
  color: string | null;
  created_at: string;
  updated_at: string;
}

interface TagState {
  list: Tag[];
  loading: boolean;
  error: boolean;
  editTarget: Tag | null;
  modalOpen: boolean;

  setList: (list: Tag[]) => void;
  setLoading: (v: boolean) => void;
  setError: (v: boolean) => void;
  openCreate: () => void;
  openEdit: (item: Tag) => void;
  closeModal: () => void;
  remove: (id: string) => void;
}

export const useTagStore = create<TagState>((set) => ({
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
