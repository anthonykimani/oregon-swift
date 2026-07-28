"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserCircle, Envelope, Phone, Calendar } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface UserProfile {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  username: string;
  role: string;
  phoneNumber: string;
  created: string;
}

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const token = session?.accessToken;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
      return;
    }
    if (!token) return;
    api<UserProfile>("/auth/me", { token }).then((res) => {
      if (res.status === 200 && res.data) {
        setProfile(res.data);
        setFirstname(res.data.firstname);
        setLastname(res.data.lastname);
        setPhoneNumber(res.data.phoneNumber || "");
      }
    }).finally(() => setLoading(false));
  }, [token, status, router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setMessage("");

    const res = await api("/auth/me", {
      method: "PATCH",
      token,
      body: JSON.stringify({ firstname, lastname, phoneNumber }),
    });

    setSaving(false);
    if (res.status === 200) {
      setMessage("Profile updated");
    } else {
      setMessage(res.errors?.[0] || "Failed to update");
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#F5F4FD]">
        <p className="text-sm text-[#8094A7] font-inter">Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#F5F4FD] overflow-y-auto">
      <div className="px-4 sm:px-6 pt-8 pb-4">
        <h1 className="text-xl font-clash-display font-semibold text-[#173420]">Account</h1>
        <p className="text-sm text-[#666D80] font-inter mt-1">Manage your profile and settings</p>
      </div>

      <div className="px-4 sm:px-6 pb-20 max-w-2xl space-y-4">
        {message && (
          <div className={`text-sm rounded-lg px-4 py-3 ${
            message.includes("updated") ? "bg-[#D9F9E7] text-[#007837]" : "bg-[#FCDEE0] text-[#C0392B]"
          }`}>
            {message}
          </div>
        )}

        <div className="bg-white border border-[#E3E6ED] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-full bg-[#173420] flex items-center justify-center text-white text-lg font-semibold">
              {profile?.firstname?.[0] || "U"}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#173420]">{profile?.firstname} {profile?.lastname}</p>
              <p className="text-xs text-[#8094A7]">@{profile?.username}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-inter font-medium text-[#173420] mb-1.5">First name</label>
                <Input
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                  className="h-10 bg-white border-[#E3E6ED] rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-inter font-medium text-[#173420] mb-1.5">Last name</label>
                <Input
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  className="h-10 bg-white border-[#E3E6ED] rounded-lg text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-inter font-medium text-[#173420] mb-1.5">Phone number</label>
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="h-10 bg-white border-[#E3E6ED] rounded-lg text-sm"
              />
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="h-10 px-6 bg-[#173420] hover:bg-[#1F4228] rounded-lg text-white text-sm"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </div>

        <div className="bg-white border border-[#E3E6ED] rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-[#173420]">Account Details</h3>
          <div className="flex items-center gap-3">
            <Envelope size={16} className="text-[#8094A7]" />
            <div>
              <p className="text-xs text-[#8094A7]">Email</p>
              <p className="text-sm text-[#333333]">{profile?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar size={16} className="text-[#8094A7]" />
            <div>
              <p className="text-xs text-[#8094A7]">Member since</p>
              <p className="text-sm text-[#333333]">{profile?.created ? new Date(profile.created).toLocaleDateString() : "—"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
