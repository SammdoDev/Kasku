"use client";

import ChildModalWrapper from "@/components/layout/for-pages/child-modal-wrapper";
import { Button } from "@/components/ui/button-component/button";
import InputText from "@/components/ui/input-component/input-text/input-text";
import { useEffect, useRef, useState } from "react";

interface NoteDialogProps {
  open: boolean;
  value: string;
  onConfirm: (val: string) => void;
  onClose: () => void;
}

const NoteDialog = ({ open, value, onConfirm, onClose }: NoteDialogProps) => {
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(value);
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        onConfirm(draft);
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, draft, onConfirm, onClose]);

  return (
    <ChildModalWrapper
      open={open}
      onClose={onClose}
      title="Tambah Catatan"
      width="sm"
    >
      <div>
        <div>
          <InputText
            id="note"
            label="Catatan"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Contoh: makan siang bareng tim..."
            maxLength={100}
            autoFocus
          />
          <p className="mt-1.5 text-right text-[9px] font-bold text-foreground/30">
            {draft.length}/100
          </p>
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            label="Batal"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          />
          <Button
            label="Simpan"
            onClick={() => {
              onConfirm(draft);
              onClose();
            }}
            className="flex-1"
          />
        </div>
      </div>
    </ChildModalWrapper>
  );
};

export default NoteDialog;
