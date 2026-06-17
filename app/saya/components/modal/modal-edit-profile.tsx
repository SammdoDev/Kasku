"use client";

import { useState } from "react";
import { patch, getApiError } from "@/lib/helper/apiService";
import { toast } from "@/components/layout/for-pages/toast";
import { Button } from "@/components/ui/button-component/button";
import InputText from "@/components/ui/input-component/input-text/input-text";
import { Label } from "@/components/ui/input-component/label";

interface Props {
  currentName: string;
  onClose: () => void;
  onSuccess: (newName: string) => void;
}

const ModalEditProfile = ({ currentName, onClose, onSuccess }: Props) => {
  const [fullName, setFullName] = useState(currentName);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      toast.error("Validasi gagal", "Nama lengkap wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      await patch("/auth/profile", {
        full_name: fullName.trim(),
      });
      toast.success("Profil diperbarui");
      onSuccess(fullName.trim());
      onClose();
    } catch (err) {
      toast.error("Gagal memperbarui profil", getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 font-mono">
      <InputText
        id="full_name"
        label="NAMA LENGKAP"
        required
        type="text"
        placeholder="Contoh: Budi Santoso"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        fieldClassName="flex flex-col gap-1"
      />

      <div className="flex gap-2 pt-1">
        <Button
          variant="outline"
          label="BATAL"
          className="flex-1"
          onClick={onClose}
          disabled={loading}
        />
        <Button
          label={loading ? "MENYIMPAN..." : "SIMPAN"}
          className="flex-1"
          onClick={handleSubmit}
          disabled={loading}
        />
      </div>
    </div>
  );
};
export default ModalEditProfile;
