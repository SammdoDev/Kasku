"use client";

import { useState } from "react";
import { post, getApiError } from "@/lib/helper/apiService";
import { GradientMesh } from "@/components/ui/gradient-mesh";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/input-component/field-1";
import { Input } from "@/components/ui/input-component/input";
import { Button } from "@/components/ui/button-component/button";
import Link from "next/link";
import { toast } from "@/components/layout/toast";
import { SessionUser, setSession } from "@/lib/helper/session";
import InputText from "@/components/ui/input-component/input-text/input-text";

const SignUpPage = () => {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Password tidak cocok", "Pastikan kedua password sama.");
      return;
    }
    setLoading(true);
    try {
      const data = await post<{
        token: string;
        user: SessionUser;
        message: string;
      }>("/auth/sign-up", {
        username,
        password: window.btoa(password),
        full_name: fullName,
      });
      setSession({ token: data.token, user: data.user });
      toast.success("Registrasi berhasil!", data.message);
      window.location.href = "/";
    } catch (err) {
      toast.error("Registrasi gagal", getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left — Form */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        {/* Logo */}
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" aria-label="home" className="flex gap-2 items-center">
            <img
              src="/logo-wallet.png"
              alt="Logo"
              height={50}
              width={50}
              className="h-10 z-10 w-auto hidden dark:block object-contain rounded-full"
            />
            <FieldLabel>KasKu</FieldLabel>
          </Link>
        </div>

        {/* Form */}
        <div className="flex flex-1 w-full items-center justify-center">
          <div className="w-full max-w-sm">
            <form className="flex flex-col gap-6" onSubmit={handleSignUp}>
              <FieldGroup>
                {/* Heading */}
                <div className="flex flex-col items-center gap-1 text-center">
                  <h1 className="text-2xl font-bold">Create an account</h1>
                  <p className="text-muted-foreground text-sm text-balance">
                    Fill in your details to get started
                  </p>
                </div>

                <InputText
                  id="fullName"
                  label="Full Name"
                  type="text"
                  placeholder="e.g. John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />

                <InputText
                  id="username"
                  label="Username"
                  type="text"
                  placeholder="e.g. john_doe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />

                <InputText
                  id="password"
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <InputText
                  id="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Sign Up"}
                </Button>

                <FieldSeparator>Or continue with</FieldSeparator>

                <Button
                  className="w-full flex gap-2"
                  variant="outline"
                  type="button"
                  onClick={() => (window.location.href = "/auth/google")}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>Sign up with Google</span>
                </Button>

                <FieldDescription className="text-center">
                  Already have an account?{" "}
                  <a
                    href="/auth/login"
                    className="underline underline-offset-4"
                  >
                    Login
                  </a>
                </FieldDescription>
              </FieldGroup>
            </form>
          </div>
        </div>
      </div>

      <div className="bg-muted relative hidden lg:block">
        <GradientMesh
          colors={["#bcecf6", "#00aaff", "#ffd447"]}
          distortion={8}
          swirl={0.2}
          speed={1}
          rotation={90}
          waveAmp={0.2}
          waveFreq={20}
          waveSpeed={0.2}
          grain={0.06}
        />
      </div>
    </div>
  );
};

export default SignUpPage;
