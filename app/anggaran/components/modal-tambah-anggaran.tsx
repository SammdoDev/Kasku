"use client";

import { useEffect, useState } from "react";
import { get, post, patch, getApiError } from "@/lib/helper/apiService";
import { toast } from "@/components/layout/for-pages/toast";
import { Button } from "@/components/ui/button-component/button";
import { DASHBOARD_FONT } from "@/lib/helper/layout-helper";
import { useAnggaranStore, type Anggaran } from "../store/anggaran-store";
import { Field, FieldLabel } from "@/components/ui/input-component/field-1";
import InputText from "@/components/ui/input-component/input-text/input-text";
import DateRangePicker from "@/components/ui/input-component/calendar-component/date-range-picker";
import CategoryGrid, {
  type CategoryItem,
} from "@/app/transaksi/components/category-grid";
import { useTranslate } from "@/lib/i18n/use-translate";

interface AnggaranForm {
  name: string;
  amount: string;
  period: string;
  start_date: string;
  end_date: string;
  category_id: string;
}

const FORM_DEFAULT: AnggaranForm = {
  name: "",
  amount: "",
  period: "monthly",
  start_date: new Date().toISOString().split("T")[0],
  end_date: "",
  category_id: "",
};

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
  editTarget?: Anggaran | null;
}

const ModalTambahAnggaran = ({ onClose, onSuccess, editTarget }: Props) => {
  const CONSTANT = useTranslate();
  const modalOpen = useAnggaranStore((s) => s.modalOpen);
  const [form, setForm] = useState<AnggaranForm>(FORM_DEFAULT);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loadingCats, setLoadingCats] = useState(false);

  const PERIOD_OPTIONS = [
    { label: CONSTANT.daily.toUpperCase(), value: "daily" },
    { label: CONSTANT.weekly.toUpperCase(), value: "weekly" },
    { label: CONSTANT.monthly.toUpperCase(), value: "monthly" },
    { label: CONSTANT.yearly.toUpperCase(), value: "yearly" },
  ];

  useEffect(() => {
    if (!modalOpen) return;
    if (editTarget) {
      setForm({
        name: editTarget.name,
        amount: String(editTarget.amount),
        period: editTarget.period,
        start_date: editTarget.start_date,
        end_date: editTarget.end_date ?? "",
        category_id: editTarget.category?.id ?? "",
      });
    } else {
      setForm(FORM_DEFAULT);
    }
  }, [modalOpen, editTarget]);

  useEffect(() => {
    if (!modalOpen) return;
    const fetchCats = async () => {
      setLoadingCats(true);
      try {
        const res = await get<{ categories: CategoryItem[] }>("/categories");
        setCategories(res.categories);
      } catch {
        // silent
      } finally {
        setLoadingCats(false);
      }
    };
    fetchCats();
  }, [modalOpen]);

  const set = (val: Partial<AnggaranForm>) =>
    setForm((prev) => ({ ...prev, ...val }));

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error(CONSTANT.budgetNameRequired);
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) {
      toast.error(CONSTANT.amountMustBePositive);
      return;
    }
    if (!form.start_date) {
      toast.error(CONSTANT.startDateRequired);
      return;
    }

    const payload = {
      name: form.name.trim(),
      amount: Number(form.amount),
      period: form.period,
      start_date: form.start_date,
      end_date: form.end_date || undefined,
      category_id: form.category_id || undefined,
    };

    setSaving(true);
    try {
      if (editTarget) {
        await patch(`/budgets/${editTarget.id}`, payload);
        toast.success(CONSTANT.budgetUpdated);
      } else {
        await post("/budgets", payload);
        toast.success(CONSTANT.budgetAdded);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(CONSTANT.failedSave, getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="flex flex-col gap-4 pt-4"
      style={{ fontFamily: DASHBOARD_FONT }}
    >
      <InputText
        id="anggaran-name"
        label={`${CONSTANT.budgetName.toUpperCase()} *`}
        placeholder="e.g. Makan Bulanan, Transport"
        value={form.name}
        onChange={(e) => set({ name: e.target.value })}
        maxLength={100}
      />

      <InputText
        id="anggaran-amount"
        label={`${CONSTANT.amount.toUpperCase()} *`}
        type="number"
        placeholder="500000"
        value={form.amount}
        onChange={(e) => set({ amount: e.target.value })}
        min={1}
      />

      <Field>
        <FieldLabel>{CONSTANT.period.toUpperCase()}</FieldLabel>
        <div className="flex border-2 border-border">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set({ period: opt.value })}
              className={[
                "flex-1 py-2 text-[10px] font-black tracking-wider transition-all duration-75 border-r-2 border-border last:border-r-0",
                form.period === opt.value
                  ? "bg-foreground text-background"
                  : "bg-card text-foreground/50 hover:bg-muted hover:text-foreground",
              ].join(" ")}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Field>

      <Field>
        <FieldLabel>
          {CONSTANT.category.toUpperCase()}{" "}
          <span className="text-foreground/30 font-medium normal-case tracking-normal text-[10px]">
            ({CONSTANT.optional})
          </span>
        </FieldLabel>
        <CategoryGrid
          categories={categories}
          selected={form.category_id || null}
          onSelect={(id) =>
            set({ category_id: form.category_id === id ? "" : id })
          }
          loading={loadingCats}
        />
      </Field>

      <Field>
        <FieldLabel>{CONSTANT.datePeriod.toUpperCase()} *</FieldLabel>
        <DateRangePicker
          value={{ start_date: form.start_date, end_date: form.end_date }}
          onChange={({ start_date, end_date }) => set({ start_date, end_date })}
        />
      </Field>

      <div className="flex gap-2 pt-2">
        <Button
          label={CONSTANT.cancel.toUpperCase()}
          variant="outline"
          onClick={onClose}
          className="flex-1"
        />
        <Button
          label={
            saving
              ? `${CONSTANT.saving}...`
              : editTarget
                ? CONSTANT.save.toUpperCase()
                : CONSTANT.add.toUpperCase()
          }
          onClick={handleSubmit}
          disabled={saving}
          className="flex-1"
        />
      </div>
    </div>
  );
};

export default ModalTambahAnggaran;
