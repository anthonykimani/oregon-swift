"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api, setToken } from "@/lib/api";

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
      setToken(res.data.token);
      router.push("/dashboard");
    } else {
      setError(res.errors?.[0] || "Something went wrong");
    }
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
