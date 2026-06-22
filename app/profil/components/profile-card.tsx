"use client";

import { useEffect, useState, useCallback } from "react";
import { Edit, Lock, LogOut } from "lucide-react";
import { get, getApiError } from "@/lib/helper/apiService";
import { toast } from "@/components/layout/for-pages/toast";
import { DASHBOARD_FONT } from "@/lib/helper/layout-helper";
import ChildModalWrapper from "@/components/layout/for-pages/child-modal-wrapper";
import ModalEditProfile from "./modal/modal-edit-profile";
import ModalChangePassword from "./modal/modal-change-password";
import { clearSession } from "@/lib/helper/session";
import { useTranslate } from "@/lib/i18n/use-translate";

interface ApiUser {
  id: string;
  username: string;
  full_name: string;
  email: string;
  currency: string;
  avatar_url: string | null;
  created_at: string;
}

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`rounded bg-foreground/10 animate-pulse ${className}`} />
);

const getInitials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const formatMemberSince = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

type ModalType = "edit-profile" | "change-password" | null;

const ProfileCard = () => {
  const CONSTANT = useTranslate();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

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

  function handleLogout() {
    clearSession();
    window.location.href = "/auth/login";
  }

  const displayName = user?.full_name || user?.username || "";

  return (
    <>
      <div
        className="bg-card border-[3px] border-border shadow-[6px_6px_0_hsl(var(--border))] p-5"
        style={{ fontFamily: DASHBOARD_FONT }}
      >
        <span
          style={{ background: "var(--accent-bg)" }}
          className="inline-block bg-[var(--accent)] text-[9px] font-black tracking-[0.22em] uppercase border-[2px] border-border px-2.5 py-1 mb-3"
        >
          {CONSTANT.userProfile}
        </span>

        <div className="flex gap-4 items-start">
          <div
            className="w-[60px] h-[60px] md:w-[68px] md:h-[68px] border-[3px] border-border shadow-[4px_4px_0_hsl(var(--border))] flex items-center justify-center shrink-0"
            style={{ background: "var(--accent-bg)" }}
          >
            {loading ? (
              <Skeleton className="w-8 h-6" />
            ) : (
              <span className="font-black text-lg md:text-xl">
                {getInitials(displayName)}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            {loading ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-7 w-40" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : (
              <>
                <p className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-tight break-words">
                  {displayName}
                </p>
                <div className="text-[11px] font-bold mt-1.5 leading-relaxed">
                  <p>@{user?.username}</p>
                  <p className="break-all">{user?.email}</p>
                  <p>
                    {CONSTANT.joined}{" "}
                    {user ? formatMemberSince(user.created_at) : ""}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-2 flex-wrap mt-4">
          <button
            type="button"
            onClick={() => setActiveModal("edit-profile")}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 md:px-3.5 py-2 text-[10px] font-black uppercase tracking-wider border-[3px] border-border bg-card disabled:opacity-40 transition-transform duration-100 hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[4px_4px_0_hsl(var(--border))] active:translate-x-0 active:translate-y-0 active:shadow-none"
          >
            <Edit size={13} strokeWidth={2.5} />
            {CONSTANT.editProfile}
          </button>
          <button
            type="button"
            onClick={() => setActiveModal("change-password")}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 md:px-3.5 py-2 text-[10px] font-black uppercase tracking-wider border-[3px] border-border bg-foreground text-background disabled:opacity-40 transition-transform duration-100 hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[4px_4px_0_hsl(var(--border))] active:translate-x-0 active:translate-y-0 active:shadow-none"
          >
            <Lock size={13} strokeWidth={2.5} />
            {CONSTANT.changePassword}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            disabled={logoutLoading}
            className="inline-flex items-center gap-2 px-3 md:px-3.5 py-2 text-[10px] font-black uppercase tracking-wider border-[3px] border-red-600 bg-card text-red-600 disabled:opacity-40 transition-transform duration-100 hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[4px_4px_0_#dc2626] active:translate-x-0 active:translate-y-0 active:shadow-none"
          >
            <LogOut size={13} strokeWidth={2.5} />
            {logoutLoading ? CONSTANT.loggingOut : CONSTANT.logout}
          </button>
        </div>
      </div>

      <ChildModalWrapper
        open={activeModal === "edit-profile"}
        onClose={() => setActiveModal(null)}
        title={CONSTANT.editProfile.toUpperCase()}
        subtitle={CONSTANT.editProfileSubtitle.toUpperCase()}
        width="md"
      >
        <ModalEditProfile
          currentName={user?.full_name ?? ""}
          onClose={() => setActiveModal(null)}
          onSuccess={(newName) =>
            setUser((prev) => (prev ? { ...prev, full_name: newName } : prev))
          }
        />
      </ChildModalWrapper>

      <ChildModalWrapper
        open={activeModal === "change-password"}
        onClose={() => setActiveModal(null)}
        title={CONSTANT.changePassword.toUpperCase()}
        subtitle={CONSTANT.changePasswordSubtitle.toUpperCase()}
        width="md"
      >
        <ModalChangePassword onClose={() => setActiveModal(null)} />
      </ChildModalWrapper>
    </>
  );
};

export default ProfileCard;
