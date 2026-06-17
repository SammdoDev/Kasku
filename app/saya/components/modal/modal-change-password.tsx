"use client";

import { useState } from "react";
import { post, getApiError } from "@/lib/helper/apiService";
import { toast } from "@/components/layout/for-pages/toast";
import { Button } from "@/components/ui/button-component/button";
import InputText from "@/components/ui/input-component/input-text/input-text";

interface Props {
  onClose: () => void;
}

const ModalChangePassword = ({ onClose }: Props) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Validasi gagal", "Semua field wajib diisi.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Validasi gagal", "Password baru minimal 6 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Validasi gagal", "Konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);
    try {
      await post("/auth/change-password", {
        old_password: btoa(oldPassword),
        new_password: btoa(newPassword),
      });
      toast.success("Password berhasil diubah");
      onClose();
    } catch (err) {
      toast.error("Gagal ganti password", getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 font-mono">
      <InputText
        id="old_password"
        label="PASSWORD LAMA"
        required
        type="password"
        placeholder="Masukkan password lama"
        value={oldPassword}
        onChange={(e) => setOldPassword(e.target.value)}
        fieldClassName="flex flex-col gap-1"
      />
      <InputText
        id="new_password"
        label="PASSWORD BARU"
        required
        type="password"
        placeholder="Minimal 6 karakter"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        fieldClassName="flex flex-col gap-1"
      />
      <InputText
        id="confirm_password"
        label="KONFIRMASI PASSWORD BARU"
        required
        type="password"
        placeholder="Ulangi password baru"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
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
export default ModalChangePassword;
