"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeSlash,
  CaretLeft,
  Check,
} from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

const vehicleTypes = [
  "Car",
  "Van",
  "Truck",
  "Motorcycle",
  "Bicycle",
  "Cargo Bike",
  "Scooter",
];

const zoneOptions = [
  "Portland Metro",
  "Downtown Portland",
  "East Portland",
  "North Portland",
  "Beaverton",
  "Hillsboro",
  "Gresham",
  "Tigard",
  "Lake Oswego",
  "Vancouver WA",
];

const certificationOptions = [
  "Valid Driver's License",
  "Commercial Driver's License (CDL)",
  "Food Handler's Permit",
  "Hazmat Certification",
  "First Aid / CPR",
];

export default function CourierSignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    vehicleType: "",
    zones: [] as string[],
    certifications: [] as string[],
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleArray(field: "zones" | "certifications", value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  }

  function canProceedToStep2() {
    return (
      form.firstname &&
      form.lastname &&
      form.email &&
      form.username &&
      form.password &&
      form.password.length >= 8 &&
      form.password === form.confirmPassword
    );
  }

  function canProceedToStep3() {
    return form.vehicleType && form.phoneNumber;
  }

  async function handleSubmit() {
    setError("");
    setLoading(true);

    const res = await api("/auth/signup/courier", {
      method: "POST",
      body: JSON.stringify({
        firstname: form.firstname,
        lastname: form.lastname,
        email: form.email,
        username: form.username,
        password: form.password,
        phoneNumber: form.phoneNumber,
        vehicleType: form.vehicleType,
        zones: form.zones,
        certifications: form.certifications,
      }),
    });

    setLoading(false);

    if (res.status === 201) {
      router.push("/sign-in?courier_pending=true");
    } else {
      setError(res.errors?.[0] || "Something went wrong");
    }
  }

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="w-8 h-8 flex items-center justify-center bg-[#F0F0F0] rounded-lg hover:bg-gray-100 transition-colors"
            >
              <CaretLeft size={14} color="#333333" />
            </button>
          )}
          <h1 className="text-2xl font-clash-display font-semibold text-[#173420]">
            Become a Courier
          </h1>
        </div>
        <p className="text-[#8094A7] text-sm">
          {step === 1 && "Tell us about yourself"}
          {step === 2 && "Your courier details"}
          {step === 3 && "Review your application"}
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold font-inter ${
                s < step
                  ? "bg-[#173420] text-white"
                  : s === step
                  ? "bg-[#F3BC24] text-[#173420]"
                  : "bg-[#F0F0F0] text-[#8094A7]"
              }`}
            >
              {s < step ? <Check size={14} weight="bold" /> : s}
            </div>
            {s < 3 && (
              <div
                className={`h-0.5 flex-1 ${
                  s < step ? "bg-[#173420]" : "bg-[#E3E6ED]"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-[#FCDEE0] text-[#F04A4A] text-sm rounded-lg px-4 py-3 mb-5">
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5">
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
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                  placeholder="Repeat password"
                  required
                  minLength={8}
                  className="h-11 bg-white border-[#E3E6ED] rounded-lg text-sm text-[#333333] placeholder:text-[#8094A7] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8094A7] hover:text-[#173420] transition-colors"
                >
                  {showConfirm ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <Button
            onClick={() => setStep(2)}
            disabled={!canProceedToStep2()}
            className="w-full h-11 bg-[#F3BC24] hover:bg-[#F5C94A] text-[#173420] font-semibold rounded-lg text-sm disabled:opacity-50"
          >
            Continue
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-inter font-medium text-[#173420] mb-1.5">
              Phone number
            </label>
            <Input
              type="tel"
              value={form.phoneNumber}
              onChange={(e) => update("phoneNumber", e.target.value)}
              placeholder="+1 (555) 000-0000"
              required
              className="h-11 bg-white border-[#E3E6ED] rounded-lg text-sm text-[#333333] placeholder:text-[#8094A7]"
            />
          </div>

          <div>
            <label className="block text-sm font-inter font-medium text-[#173420] mb-1.5">
              Vehicle type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {vehicleTypes.map((vt) => (
                <button
                  key={vt}
                  type="button"
                  onClick={() => update("vehicleType", vt)}
                  className={`h-11 rounded-lg border text-sm font-inter font-medium transition-colors ${
                    form.vehicleType === vt
                      ? "bg-[#173420] text-white border-[#173420]"
                      : "bg-white text-[#333333] border-[#E3E6ED] hover:border-[#173420]"
                  }`}
                >
                  {vt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-inter font-medium text-[#173420] mb-1.5">
              Service zones <span className="text-[#8094A7] font-normal">(select all that apply)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {zoneOptions.map((zone) => (
                <button
                  key={zone}
                  type="button"
                  onClick={() => toggleArray("zones", zone)}
                  className={`h-9 px-4 rounded-full border text-xs font-inter font-medium transition-colors ${
                    form.zones.includes(zone)
                      ? "bg-[#173420] text-white border-[#173420]"
                      : "bg-white text-[#666D80] border-[#E3E6ED] hover:border-[#173420]"
                  }`}
                >
                  {zone}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-inter font-medium text-[#173420] mb-1.5">
              Certifications <span className="text-[#8094A7] font-normal">(select all that apply)</span>
            </label>
            <div className="space-y-2">
              {certificationOptions.map((cert) => (
                <button
                  key={cert}
                  type="button"
                  onClick={() => toggleArray("certifications", cert)}
                  className={`w-full flex items-center gap-3 px-4 h-11 rounded-lg border transition-colors text-left ${
                    form.certifications.includes(cert)
                      ? "bg-[#173420]/5 border-[#173420]"
                      : "bg-white border-[#E3E6ED] hover:border-[#173420]"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${
                      form.certifications.includes(cert)
                        ? "bg-[#173420] border-[#173420]"
                        : "bg-[#F0F0F0] border-[#E0E0E0]"
                    }`}
                  >
                    {form.certifications.includes(cert) && (
                      <Check size={10} weight="bold" color="white" />
                    )}
                  </div>
                  <span className="text-sm font-inter text-[#333333]">{cert}</span>
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={() => setStep(3)}
            disabled={!canProceedToStep3()}
            className="w-full h-11 bg-[#F3BC24] hover:bg-[#F5C94A] text-[#173420] font-semibold rounded-lg text-sm disabled:opacity-50"
          >
            Review Application
          </Button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <div className="bg-white border border-[#E3E6ED] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-manrope font-semibold text-[#333333]">
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-[#8094A7] text-xs block">Name</span>
                <span className="text-[#333333] font-inter">{form.firstname} {form.lastname}</span>
              </div>
              <div>
                <span className="text-[#8094A7] text-xs block">Email</span>
                <span className="text-[#333333] font-inter">{form.email}</span>
              </div>
              <div>
                <span className="text-[#8094A7] text-xs block">Username</span>
                <span className="text-[#333333] font-inter">{form.username}</span>
              </div>
              <div>
                <span className="text-[#8094A7] text-xs block">Phone</span>
                <span className="text-[#333333] font-inter">{form.phoneNumber}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E3E6ED] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-manrope font-semibold text-[#333333]">
              Courier Details
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-[#8094A7] text-xs block">Vehicle</span>
                <span className="text-[#333333] font-inter">{form.vehicleType}</span>
              </div>
              <div>
                <span className="text-[#8094A7] text-xs block">Zones</span>
                <span className="text-[#333333] font-inter">
                  {form.zones.length > 0 ? form.zones.join(", ") : "None selected"}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-[#8094A7] text-xs block">Certifications</span>
                <span className="text-[#333333] font-inter">
                  {form.certifications.length > 0
                    ? form.certifications.join(", ")
                    : "None selected"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#FEF7E0] border border-[#F3BC24]/30 rounded-xl p-4 text-sm text-[#173420] font-inter">
            After submitting, your application will be reviewed by an administrator.
            You&apos;ll be notified once your account is approved.
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full h-11 bg-[#F3BC24] hover:bg-[#F5C94A] text-[#173420] font-semibold rounded-lg text-sm"
          >
            {loading ? "Submitting..." : "Submit Application"}
          </Button>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-[#8094A7]">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-[#173420] font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
