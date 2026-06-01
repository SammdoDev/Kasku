"use client";

import { useEffect, useState } from "react";
import { setSession, getSession } from "@/lib/helper/session";

type Status = "loading" | "success" | "error";

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<Status>("loading");
  const [msg, setMsg] = useState("Menyelesaikan login...");

  useEffect(() => {
    async function run() {
      const sessionId = new URLSearchParams(window.location.search).get(
        "session_id",
      );

      if (!sessionId) {
        setStatus("error");
        setMsg("Session tidak ditemukan.");
        setTimeout(() => (window.location.href = "/auth/login"), 2500);
        return;
      }

      try {
        setMsg("Menghubungi server...");

        const res = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId }),
        });

        const data = await res.json();

        if (!res.ok || !data.token) {
          setStatus("error");
          setMsg(data.message ?? "Login gagal.");
          setTimeout(() => (window.location.href = "/auth/login"), 2500);
          return;
        }

        setMsg("Menyimpan sesi...");

        // Decode JWT payload
        const [, b64] = data.token.split(".");
        const payload = JSON.parse(
          atob(b64.replace(/-/g, "+").replace(/_/g, "/")),
        );

        // Simpan session
        setSession({
          token: data.token,
          user: {
            id: payload.sub,
            username: payload.username,
            full_name: payload.full_name ?? payload.username,
          },
        });

        // Verifikasi storage benar-benar tersimpan sebelum redirect
        // Poll sampai session terbaca atau timeout 3 detik
        const saved = await waitForSession(3000);

        if (!saved) {
          setStatus("error");
          setMsg("Gagal menyimpan sesi, coba login ulang.");
          setTimeout(() => (window.location.href = "/auth/login"), 2500);
          return;
        }

        setStatus("success");
        setMsg("Login berhasil! Mengalihkan...");
        setTimeout(() => window.location.replace("/"), 600);
      } catch {
        setStatus("error");
        setMsg("Terjadi kesalahan jaringan.");
        setTimeout(() => (window.location.href = "/auth/login"), 2500);
      }
    }

    run();
  }, []);

  return (
    <div className="min-h-svh flex items-center justify-center bg-[#f5f0e8] px-4">
      <div className="w-full max-w-sm border-[3px] border-black bg-white shadow-[6px_6px_0px_#000] p-8 flex flex-col items-center gap-6">
        <div className="relative">
          {status === "loading" && (
            <div className="w-16 h-16 border-[4px] border-black border-t-[#ffd447] rounded-full animate-spin" />
          )}
          {status === "success" && (
            <div className="w-16 h-16 border-[4px] border-black bg-[#ffd447] shadow-[4px_4px_0px_#000] flex items-center justify-center">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="square"
                strokeLinejoin="miter"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}
          {status === "error" && (
            <div className="w-16 h-16 border-[4px] border-black bg-[#ff4d4d] shadow-[4px_4px_0px_#000] flex items-center justify-center">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3.5"
                strokeLinecap="square"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
          )}
        </div>

        <div className="text-center space-y-1">
          <p className="font-black text-[15px] uppercase tracking-wide text-black">
            {status === "loading" && "Memproses..."}
            {status === "success" && "Berhasil!"}
            {status === "error" && "Gagal"}
          </p>
          <p className="text-[13px] font-semibold text-black/55">{msg}</p>
        </div>

        {status === "loading" && (
          <div className="w-full h-2 border-[2px] border-black bg-white overflow-hidden">
            <div className="h-full bg-[#ffd447] animate-[progress_1.5s_ease-in-out_infinite]" />
          </div>
        )}

        {status !== "loading" && (
          <p className="text-[11px] font-bold text-black/35 uppercase tracking-widest">
            {status === "success"
              ? "Mengalihkan ke dashboard..."
              : "Mengalihkan ke login..."}
          </p>
        )}
      </div>

      <style>{`
        @keyframes progress {
          0%   { width: 0%; margin-left: 0; }
          50%  { width: 60%; margin-left: 20%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  );
}

/** Poll sessionStorage sampai token terbaca, atau timeout */
function waitForSession(timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    const interval = 50; // cek tiap 50ms
    let elapsed = 0;
    const timer = setInterval(() => {
      const session = getSession();
      if (session?.token) {
        clearInterval(timer);
        resolve(true);
        return;
      }
      elapsed += interval;
      if (elapsed >= timeoutMs) {
        clearInterval(timer);
        resolve(false);
      }
    }, interval);
  });
}
