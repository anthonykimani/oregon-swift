"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const res = await api("/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        firstname: form.firstname,
        lastname: form.lastname,
        email: form.email,
        username: form.username,
        password: form.password,
        phoneNumber: form.phoneNumber || undefined,
      }),
    });

    setLoading(false);

    if (res.status === 201 && res.data?.token) {
      const loginRes = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (loginRes?.ok) {
        router.push("/dashboard");
      }
    } else {
      setError(res.errors?.[0] || "Something went wrong");
    }
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-clash-display font-semibold text-[#173420] mb-2">
          Create an account
        </h1>
        <p className="text-[#8094A7] text-sm">
          Start shipping with Oregon Courier
        </p>
      </div>

      <button
        onClick={handleGoogleSignIn}
        disabled={googleLoading}
        className="w-full h-11 flex items-center justify-center gap-3 bg-white border border-[#E3E6ED] rounded-lg text-sm text-[#333333] font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.30-4.53 6.16-4.53z"/></svg>
        {googleLoading ? "Connecting..." : "Sign up with Google"}
      </button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#E3E6ED]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[#F5F4FD] px-2 text-[#8094A7]">or fill in your details</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-[#FCDEE0] text-[#F04A4A] text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-inter font-medium text-[#173420] mb-1.5">
              First name
            </label>
            <Input
              value={form.firstname}
              onChange={(e) => update("firstname", e.target.value)}
              placeholder="John"
              required
              className="h-11 bg-white border-[#E3E6ED] rounded-lg text-sm text-[#333333] placeholder:text-[#8094A7]"
            />
          </div>
          <div>
            <label className="block text-sm font-inter font-medium text-[#173420] mb-1.5">
              Last name
            </label>
            <Input
              value={form.lastname}
              onChange={(e) => update("lastname", e.target.value)}
              placeholder="Doe"
              required
              className="h-11 bg-white border-[#E3E6ED] rounded-lg text-sm text-[#333333] placeholder:text-[#8094A7]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-inter font-medium text-[#173420] mb-1.5">
            Email address
          </label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="you@company.com"
            required
            className="h-11 bg-white border-[#E3E6ED] rounded-lg text-sm text-[#333333] placeholder:text-[#8094A7]"
          />
        </div>

        <div>
          <label className="block text-sm font-inter font-medium text-[#173420] mb-1.5">
            Username
          </label>
          <Input
            value={form.username}
            onChange={(e) => update("username", e.target.value)}
            placeholder="johndoe"
            required
            minLength={3}
            className="h-11 bg-white border-[#E3E6ED] rounded-lg text-sm text-[#333333] placeholder:text-[#8094A7]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-inter font-medium text-[#173420] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="Min. 8 characters"
                required
                minLength={8}
                className="h-11 bg-white border-[#E3E6ED] rounded-lg text-sm text-[#333333] placeholder:text-[#8094A7] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8094A7] hover:text-[#173420] transition-colors"
              >
                {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-inter font-medium text-[#173420] mb-1.5">
              Confirm password
            </label>
            <Input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => update("confirmPassword", e.target.value)}
              placeholder="Repeat password"
              required
              minLength={8}
              className="h-11 bg-white border-[#E3E6ED] rounded-lg text-sm text-[#333333] placeholder:text-[#8094A7]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-inter font-medium text-[#173420] mb-1.5">
            Phone number <span className="text-[#8094A7] font-normal">(optional)</span>
          </label>
          <Input
            type="tel"
            value={form.phoneNumber}
            onChange={(e) => update("phoneNumber", e.target.value)}
            placeholder="+1 (555) 000-0000"
            className="h-11 bg-white border-[#E3E6ED] rounded-lg text-sm text-[#333333] placeholder:text-[#8094A7]"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-[#F3BC24] hover:bg-[#F5C94A] text-[#173420] font-semibold rounded-lg text-sm"
        >
          {loading ? "Creating account..." : "Create Account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[#8094A7]">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="text-[#173420] font-medium hover:underline"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
