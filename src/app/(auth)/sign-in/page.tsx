"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api, setToken } from "@/lib/api";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await api("/auth/signin", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (res.status === 200 && res.data?.token) {
      setToken(res.data.token);

      const role = res.data.user?.role;
      if (role === "admin") {
        router.push("/admin");
      } else if (role === "courier") {
        router.push("/courier");
      } else {
        router.push("/dashboard");
      }
    } else {
      setError(res.errors?.[0] || "Invalid email or password");
    }
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-clash-display font-semibold text-[#173420] mb-2">
          Welcome back
        </h1>
        <p className="text-[#8094A7] text-sm">
          Sign in to your Oregon Courier account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-[#FCDEE0] text-[#F04A4A] text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-inter font-medium text-[#173420] mb-1.5">
            Email address
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
            className="h-11 bg-white border-[#E3E6ED] rounded-lg text-sm text-[#333333] placeholder:text-[#8094A7]"
          />
        </div>

        <div>
          <label className="block text-sm font-inter font-medium text-[#173420] mb-1.5">
            Password
          </label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
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

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-[#F3BC24] hover:bg-[#F5C94A] text-[#173420] font-semibold rounded-lg text-sm"
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[#8094A7]">
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="text-[#173420] font-medium hover:underline"
        >
          Create one
        </Link>
      </p>
    </>
  );
}
