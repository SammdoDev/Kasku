"use client";

import { useEffect, useState, useCallback } from "react";
import { get, getApiError } from "@/lib/helper/apiService";
import { toast } from "@/components/layout/for-pages/toast";
import { DASHBOARD_FONT } from "@/lib/helper/layout-helper";
import { KeyRound, Mail } from "lucide-react";
import { useTranslate } from "@/lib/i18n/use-translate";

interface ApiUser {
  email: string;
  google_id: string | null;
}

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`rounded bg-foreground/10 animate-pulse ${className}`} />
);

const LoginAccountCard = () => {
  const CONSTANT = useTranslate();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await get<{ user: ApiUser }>("/auth/profile");
      setUser(res.user);
    } catch (err) {
      toast.error(CONSTANT.failedLoadProfile, getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [CONSTANT]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const isGoogleUser = !!user?.google_id;

  return (
    <div
      className="bg-card border-[3px] border-border shadow-[6px_6px_0_hsl(var(--border))] p-5"
      style={{ fontFamily: DASHBOARD_FONT }}
    >
      <span
        style={{ background: "var(--accent-bg)" }}
        className="inline-block bg-[var(--accent)] text-[9px] font-black tracking-[0.22em] uppercase border-[2px] border-border px-2.5 py-1 mb-3"
      >
        {CONSTANT.loginAndAccount}
      </span>

      {loading ? (
        <Skeleton className="h-[54px] w-full" />
      ) : (
        <div className="flex items-center gap-3 border-[3px] border-border px-4 py-3">
          <div className="w-8 h-8 border-[2px] border-border flex items-center justify-center shrink-0">
            {isGoogleUser ? (
              <Mail
                size={14}
                strokeWidth={2.5}
                style={{ color: "var(--accent)" }}
              />
            ) : (
              <KeyRound
                size={14}
                strokeWidth={2.5}
                style={{ color: "var(--accent)" }}
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-black uppercase tracking-wide">
              {isGoogleUser
                ? CONSTANT.googleAccount
                : CONSTANT.usernamePassword}
            </p>
            <p className="text-[10px] font-bold mt-0.5 truncate">
              {isGoogleUser ? user?.email : CONSTANT.loginManualActive}
            </p>
          </div>
          <span className="text-[9px] font-black uppercase tracking-wider text-[var(--accent)] border-[2px] border-border px-2.5 py-1 whitespace-nowrap">
            {CONSTANT.active}
          </span>
        </div>
      )}

      {!loading && (
        <p className="text-[10px] font-bold  mt-3">
          {isGoogleUser
            ? CONSTANT.accountRegisteredGoogle
            : CONSTANT.accountUsesPassword}
        </p>
      )}
    </div>
  );
};

export default LoginAccountCard;
