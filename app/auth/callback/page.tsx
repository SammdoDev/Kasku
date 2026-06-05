"use client";

import { useEffect, useState, useRef } from "react";
import { setSession, getSession } from "@/lib/helper/session";

type Status = "loading" | "success" | "error";

const STEPS = [
  "Memeriksa session",
  "Menghubungi server",
  "Menyimpan sesi",
  "Mengalihkan...",
];

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<Status>("loading");
  const [msg, setMsg] = useState("Menyelesaikan login...");
  const [step, setStep] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function run() {
      const sessionId = new URLSearchParams(window.location.search).get(
        "session_id",
      );

      setStep(0);

      if (!sessionId) {
        setStatus("error");
        setMsg("Session tidak ditemukan.");
        startCountdown("/auth/login");
        return;
      }

      try {
        setStep(1);
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
          startCountdown("/auth/login");
          return;
        }

        setStep(2);
        setMsg("Menyimpan sesi...");

        const [, b64] = data.token.split(".");
        const payload = JSON.parse(
          atob(b64.replace(/-/g, "+").replace(/_/g, "/")),
        );

        setSession({
          token: data.token,
          user: {
            id: payload.sub,
            username: payload.username,
            full_name: payload.full_name ?? payload.username,
          },
        });

        const saved = await waitForSession(3000);

        if (!saved) {
          setStatus("error");
          setMsg("Gagal menyimpan sesi, coba login ulang.");
          startCountdown("/auth/login");
          return;
        }

        setStep(3);
        setStatus("success");
        setMsg("Login berhasil! Mengalihkan...");
        setTimeout(() => window.location.replace("/"), 600);
      } catch {
        setStatus("error");
        setMsg("Terjadi kesalahan jaringan.");
        startCountdown("/auth/login");
      }
    }

    run();
  }, []);

  function startCountdown(redirectTo: string) {
    setCountdown(3);
    let secs = 3;
    countdownRef.current = setInterval(() => {
      secs--;
      setCountdown(secs);
      if (secs <= 0) {
        clearInterval(countdownRef.current!);
        window.location.href = redirectTo;
      }
    }, 1000);
  }

  function handleRetry() {
    if (countdownRef.current) clearInterval(countdownRef.current);
    window.location.reload();
  }

  function handleGoLogin() {
    if (countdownRef.current) clearInterval(countdownRef.current);
    window.location.href = "/auth/login";
  }

  return (
    <div className="min-h-svh flex items-center justify-center bg-[#f5f0e8] px-4">
      <div className="w-full max-w-sm border-[3px] border-black bg-white shadow-[6px_6px_0px_#000] p-8 flex flex-col items-center gap-6">
        {/* Icon */}
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

        {/* Label */}
        <div className="text-center space-y-1">
          <p className="font-black text-[15px] uppercase tracking-wide text-black">
            {status === "loading" && "Memproses..."}
            {status === "success" && "Berhasil!"}
            {status === "error" && "Gagal"}
          </p>
          <p className="text-[13px] font-semibold text-black/55">{msg}</p>
        </div>

        {/* Step tracker — loading only */}
        {status === "loading" && (
          <div className="w-full flex flex-col gap-2">
            {STEPS.map((label, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div
                  className={[
                    "w-2.5 h-2.5 border-[2px] border-black flex-shrink-0 transition-colors duration-200",
                    i < step
                      ? "bg-[#ffd447]"
                      : i === step
                        ? "bg-[#ffd447] animate-pulse"
                        : "bg-white",
                  ].join(" ")}
                />
                <span
                  className={[
                    "text-[11px] font-bold uppercase tracking-wide transition-colors duration-200",
                    i <= step ? "text-black" : "text-black/30",
                  ].join(" ")}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Progress bar — loading only */}
        {status === "loading" && (
          <div className="w-full h-2 border-[2px] border-black bg-white overflow-hidden">
            <div className="h-full bg-[#ffd447] animate-[progress_1.5s_ease-in-out_infinite]" />
          </div>
        )}

        {/* Success hint */}
        {status === "success" && (
          <p className="text-[11px] font-bold text-black/35 uppercase tracking-widest">
            Mengalihkan ke dashboard...
          </p>
        )}

        {/* Error actions */}
        {status === "error" && (
          <div className="w-full flex flex-col gap-3">
            <p className="text-[11px] font-bold text-black/35 uppercase tracking-widest text-center">
              Kembali ke login dalam{" "}
              <span className="text-[#ff4d4d]">{countdown}</span> detik
            </p>
            <button
              onClick={handleRetry}
              className="w-full py-2.5 border-[3px] border-black bg-[#ffd447] font-black text-[12px] uppercase tracking-wide shadow-[4px_4px_0px_#000] hover:-translate-x-px hover:-translate-y-px hover:shadow-[5px_5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_#000] transition-all duration-100"
            >
              Coba lagi
            </button>
            <button
              onClick={handleGoLogin}
              className="w-full py-2.5 border-[3px] border-black bg-white font-bold text-[12px] uppercase tracking-wide shadow-[4px_4px_0px_#000] hover:-translate-x-px hover:-translate-y-px hover:shadow-[5px_5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_#000] transition-all duration-100"
            >
              Kembali ke login
            </button>
          </div>
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

function waitForSession(timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    const interval = 50;
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
