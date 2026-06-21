"use client";

import { useRef, useState } from "react";
import { Upload, FileJson, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "@/components/layout/for-pages/toast";
import { post, getApiError } from "@/lib/helper/apiService";
import { Button } from "@/components/ui/button-component/button";

interface ImportResult {
  categories: number;
  payment_methods: number;
  budgets: number;
  tags: number;
  transactions: number;
  errors: string[];
}

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalImport({ onClose, onSuccess }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (f: File) => {
    if (!f.name.endsWith(".json")) {
      setError("Hanya file .json yang diterima.");
      setFile(null);
      return;
    }
    setError(null);
    setResult(null);
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const json = JSON.parse(text);

      const res = await post<{ message: string; results: ImportResult }>(
        "/data/import",
        json,
      );

      setResult(res.results);
      toast.success(res.message);
      onSuccess();
    } catch (err) {
      const msg = getApiError(err);
      setError(msg);
      toast.error("Import gagal", msg);
    } finally {
      setLoading(false);
    }
  };

  const RESULT_LABELS: [keyof ImportResult, string][] = [
    ["categories", "Kategori"],
    ["payment_methods", "Metode Bayar"],
    ["budgets", "Budget"],
    ["tags", "Tag"],
    ["transactions", "Transaksi"],
  ];

  return (
    <div className="flex flex-col gap-4 font-mono">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className={[
          "border-[3px] border-dashed border-border p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors",
          file ? "bg-[var(--accent)]/20" : "bg-card hover:bg-[#f5f5f5]",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        {file ? (
          <>
            <FileJson size={28} strokeWidth={2} className="text-black" />
            <p className="text-[11px] font-black text-center">{file.name}</p>
            <p className="text-[9px] font-bold text-black/40">
              {(file.size / 1024).toFixed(1)} KB · Klik untuk ganti
            </p>
          </>
        ) : (
          <>
            <Upload size={28} strokeWidth={2} className="text-black/40" />
            <p className="text-[11px] font-black text-black/60 text-center">
              Drag & drop atau klik untuk pilih file
            </p>
            <p className="text-[9px] font-bold text-black/30">
              Hanya file .json dari backup Cashora
            </p>
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 border-[2px] border-red-500 bg-red-50 px-3 py-2">
          <AlertCircle
            size={13}
            strokeWidth={2.5}
            className="text-red-600 shrink-0"
          />
          <p className="text-[10px] font-black text-red-700">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="border-[2px] border-border">
          <div className="flex items-center gap-2 px-3 py-2 border-b-[2px] border-border bg-[var(--accent)]">
            <CheckCircle size={13} strokeWidth={2.5} />
            <p className="text-[10px] font-black uppercase tracking-wide">
              Hasil Import
            </p>
          </div>
          <div className="divide-y-[2px] divide-black">
            {RESULT_LABELS.map(([key, label]) => (
              <div key={key} className="flex justify-between px-3 py-2">
                <span className="text-[10px] font-bold text-black/60">
                  {label}
                </span>
                <span className="text-[10px] font-black">
                  {result[key]} data
                </span>
              </div>
            ))}
          </div>
          {result.errors.length > 0 && (
            <div className="px-3 py-2 border-t-[2px] border-border bg-red-50">
              <p className="text-[9px] font-black text-red-600 uppercase mb-1">
                Error
              </p>
              {result.errors.map((e, i) => (
                <p key={i} className="text-[9px] font-bold text-red-500">
                  {e}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <Button
          variant="outline"
          label="BATAL"
          className="flex-1"
          onClick={onClose}
          disabled={loading}
        />
        <Button
          label={loading ? "MENGIMPOR..." : "IMPORT"}
          className="flex-1"
          onClick={handleSubmit}
          disabled={!file || loading || !!result}
        />
      </div>
    </div>
  );
}
