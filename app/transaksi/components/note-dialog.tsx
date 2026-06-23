"use client";

import ChildModalWrapper from "@/components/layout/for-pages/child-modal-wrapper";
import { Button } from "@/components/ui/button-component/button";
import InputText from "@/components/ui/input-component/input-text/input-text";
import { useEffect, useRef, useState } from "react";
import { useTranslate } from "@/lib/i18n/use-translate";

interface NoteDialogProps {
  open: boolean;
  value: string;
  onConfirm: (val: string) => void;
  onClose: () => void;
}

const NoteDialog = ({ open, value, onConfirm, onClose }: NoteDialogProps) => {
  const CONSTANT = useTranslate();
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
      title={CONSTANT.addNote ?? "Tambah Catatan"}
      width="sm"
    >
      <div>
        <InputText
          id="note"
          label={CONSTANT.note ?? "Catatan"}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Contoh: makan siang bareng tim..."
          maxLength={100}
          autoFocus
        />
        <p className="mt-1.5 text-right text-[9px] font-bold text-foreground/30">
          {draft.length}/100
        </p>
        <div className="mt-4 flex gap-2">
          <Button
            label={CONSTANT.cancel}
            variant="outline"
            onClick={onClose}
            className="flex-1"
          />
          <Button
            label={CONSTANT.save}
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
