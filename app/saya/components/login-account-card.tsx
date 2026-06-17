"use client";

import { useEffect, useState, useCallback } from "react";
import { get, getApiError } from "@/lib/helper/apiService";
import { toast } from "@/components/layout/for-pages/toast";
import { DASHBOARD_FONT } from "@/lib/helper/layout-helper";
import { KeyRound, Mail } from "lucide-react";

interface ApiUser {
  email: string;
  google_id: string | null;
}

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`rounded bg-black/10 animate-pulse ${className}`} />
);

const LoginAccountCard = () => {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await get<{ user: ApiUser }>("/auth/profile");
      setUser(res.user);
    } catch (err) {
      toast.error("Gagal memuat profil", getApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const isGoogleUser = !!user?.google_id;

  return (
    <div
      className="bg-white border-[3px] border-black shadow-[6px_6px_0_#000] p-5"
      style={{ fontFamily: DASHBOARD_FONT }}
    >
      <span className="inline-block bg-[#CBFF4D] text-black text-[9px] font-black tracking-[0.22em] uppercase border-[2px] border-black px-2.5 py-1 mb-3">
        Login &amp; Akun
      </span>

      {loading ? (
        <Skeleton className="h-[54px] w-full" />
      ) : (
        <div className="flex items-center gap-3 border-[3px] border-black px-4 py-3 bg-[#F5F3EE]">
          <div
            className="w-8 h-8 border-[2px] border-black flex items-center justify-center shrink-0"
            style={{ background: "#CBFF4D" }}
          >
            {isGoogleUser ? (
              <Mail size={14} strokeWidth={2.5} />
            ) : (
              <KeyRound size={14} strokeWidth={2.5} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-black uppercase tracking-wide">
              {isGoogleUser ? "Google" : "Username & Password"}
            </p>
            <p className="text-[10px] font-bold text-black/45 mt-0.5 truncate">
              {isGoogleUser ? user?.email : "Login manual aktif"}
            </p>
          </div>
          <span className="text-[9px] font-black uppercase tracking-wider bg-black text-[#CBFF4D] border-[2px] border-black px-2.5 py-1 whitespace-nowrap">
            Aktif
          </span>
        </div>
      )}

      {!loading && (
        <p className="text-[10px] font-bold text-black/35 mt-3">
          {isGoogleUser
            ? "Akun ini terdaftar melalui Google. Ganti password tidak tersedia."
            : "Akun ini menggunakan username dan password untuk login."}
        </p>
      )}
    </div>
  );
};

export default LoginAccountCard;
