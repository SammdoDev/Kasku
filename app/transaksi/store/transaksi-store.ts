import { create } from "zustand";

export type TransactionType = "income" | "expense";
export type FilterType = "all" | TransactionType;

export interface Category {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
  type: "income" | "expense";
}
export interface Tag {
  id: string;
  name: string;
  color: string | null;
}
export interface PaymentMethod {
  id: string;
  name: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  amount: number;
  description: string;
  note: string | null;
  category: Category | null;
  payment_method: PaymentMethod | null;
  tags: Tag[];
}

export interface TransactionMeta {
  total: number;
  page: number;
  per_page: number;
  last_page: number;
}

export interface TransactionSummary {
  total_income: number;
  total_expense: number;
  net: number;
}

export interface TransactionListResponse {
  data: Transaction[];
  meta: TransactionMeta;
  summary: TransactionSummary;
}

export interface TransactionFilter {
  month: string;
  type: FilterType;
  category_id: string;
  tag_id: string;
  search: string;
  page: number;
}

export interface TransactionForm {
  date: string;
  type: TransactionType;
  amount: string;
  description: string;
  note: string;
  category_id: string;
  payment_method_id: string;
  tag_ids: string[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function transactionToForm(t: Transaction): TransactionForm {
  return {
    date: t.date,
    type: t.type,
    amount: String(t.amount),
    description: t.description,
    note: t.note ?? "",
    category_id: t.category?.id ?? "",
    payment_method_id: t.payment_method?.id ?? "",
    tag_ids: t.tags.map((tg) => tg.id),
  };
}

export const FORM_DEFAULT: TransactionForm = {
  date: new Date().toISOString().slice(0, 10),
  type: "expense",
  amount: "",
  description: "",
  note: "",
  category_id: "",
  payment_method_id: "",
  tag_ids: [],
};

const FILTER_DEFAULT: TransactionFilter = {
  month: currentMonth(),
  type: "all",
  category_id: "",
  tag_id: "",
  search: "",
  page: 1,
};

// ─── Store ───────────────────────────────────────────────────────────────────

interface TransaksiState {
  // table data
  list: Transaction[];
  meta: TransactionMeta | null;
  summary: TransactionSummary | null;
  loading: boolean;
  error: boolean;

  // filter
  filter: TransactionFilter;

  // reference data (dropdowns)
  categories: Category[];
  tags: Tag[];
  paymentMethods: PaymentMethod[];

  // modal
  modalOpen: boolean;
  editingTransaction: Transaction | null;
  form: TransactionForm;
  saving: boolean;

  // actions — filter
  setFilter: (patch: Partial<TransactionFilter>) => void;
  resetFilter: () => void;

  // actions — data
  setList: (res: TransactionListResponse) => void;
  setLoading: (v: boolean) => void;
  setError: (v: boolean) => void;
  setReference: (data: {
    categories?: Category[];
    tags?: Tag[];
    paymentMethods?: PaymentMethod[];
  }) => void;
  removeTransaction: (id: string) => void;

  // actions — modal
  openCreate: () => void;
  openEdit: (t: Transaction) => void;
  closeModal: () => void;
  setForm: (patch: Partial<TransactionForm>) => void;
  toggleTag: (id: string) => void;
  setSaving: (v: boolean) => void;
}

export const useTransaksiStore = create<TransaksiState>((set) => ({
  list: [],
  meta: null,
  summary: null,
  loading: true,
  error: false,
  filter: FILTER_DEFAULT,

  categories: [],
  tags: [],
  paymentMethods: [],

  modalOpen: false,
  editingTransaction: null,
  form: FORM_DEFAULT,
  saving: false,

  setFilter: (patch) => set((s) => ({ filter: { ...s.filter, ...patch } })),
  resetFilter: () =>
    set((s) => ({
      filter: {
        ...FILTER_DEFAULT,
        month: s.filter.month,
      },
    })),
  setList: (res) =>
    set({ list: res.data, meta: res.meta, summary: res.summary, error: false }),
  setLoading: (v) => set({ loading: v }),
  setError: (v) => set({ error: v }),
  setReference: (data) => set((s) => ({ ...s, ...data })),
  removeTransaction: (id) =>
    set((s) => ({ list: s.list.filter((t) => t.id !== id) })),

  openCreate: () =>
    set({ modalOpen: true, editingTransaction: null, form: FORM_DEFAULT }),
  openEdit: (t) =>
    set({ modalOpen: true, editingTransaction: t, form: transactionToForm(t) }),
  closeModal: () => set({ modalOpen: false, editingTransaction: null }),

  setForm: (patch) => set((s) => ({ form: { ...s.form, ...patch } })),
  toggleTag: (id) =>
    set((s) => ({
      form: {
        ...s.form,
        tag_ids: s.form.tag_ids.includes(id)
          ? s.form.tag_ids.filter((x) => x !== id)
          : [...s.form.tag_ids, id],
      },
    })),
  setSaving: (v) => set({ saving: v }),
}));
