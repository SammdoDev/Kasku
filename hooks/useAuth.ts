"use client";

import { useEffect, useState } from "react";
import {
  getSession,
  clearSession,
  SessionUser,
  isAuthenticated,
} from "@/lib/helper/session";
import { useRouter } from "next/navigation";

interface UseAuthOptions {
  /** Redirect ke login kalau tidak authenticated */
  requireAuth?: boolean;
  /** Redirect ke home kalau sudah authenticated */
  redirectIfAuth?: boolean;
}

export function useAuth(options: UseAuthOptions = {}) {
  const { requireAuth = false, redirectIfAuth = false } = options;
  const router = useRouter();

  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();

    if (session) {
      setUser(session.user);
      if (redirectIfAuth) {
        router.replace("/");
        return;
      }
    } else {
      setUser(null);
      if (requireAuth) {
        router.replace("/auth/login");
        return;
      }
    }

    setLoading(false);
  }, [requireAuth, redirectIfAuth, router]);

  const logout = () => {
    clearSession();
    router.replace("/auth/login");
  };

  return {
    user,
    loading,
    isAuthenticated: isAuthenticated(),
    logout,
  };
}
