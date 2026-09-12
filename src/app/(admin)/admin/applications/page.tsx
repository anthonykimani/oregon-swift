"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Check, X, MagnifyingGlass, ArrowDown } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface CourierApplication {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  username: string;
  phoneNumber: string;
  disabled: boolean;
  disableReason: string;
  created: string;
  profile: {
    vehicleType: string;
    zones: string[];
    certifications: string[];
    active: boolean;
  } | null;
}

export default function ApplicationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<CourierApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const fetchApplications = useCallback(async () => {
    if (!session?.accessToken) return;

    try {
      const res = await api<CourierApplication[]>("/admin/users", {
        token: session.accessToken,
      });

      if (res.status === 200 && res.data) {
        setApplications(res.data);
      } else {
        setError(res.errors?.[0] || `API returned status ${res.status}`);
      }
    } catch (e) {
      setError("Network error — is the API server running?");
    }
    setLoading(false);
  }, [session?.accessToken]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
      return;
    }
    if (status === "authenticated") {
      fetchApplications();
    }
  }, [status, fetchApplications, router]);

  async function handleApprove(id: string) {
    if (!session?.accessToken) return;
    setActionLoading(id);
    setMessage("");

    const res = await api(`/admin/users/${id}/approve`, {
      method: "PATCH",
      token: session.accessToken,
    });

    setActionLoading(null);

    if (res.status === 200) {
      setMessage("Courier approved successfully");
      setApplications((prev) => prev.filter((a) => a.id !== id));
    } else {
      setMessage(res.errors?.[0] || "Failed to approve");
    }
  }

  async function handleReject(id: string) {
    if (!session?.accessToken) return;
    setActionLoading(id);
    setMessage("");

    const res = await api(`/admin/users/${id}/reject`, {
      method: "PATCH",
      token: session.accessToken,
    });

    setActionLoading(null);

    if (res.status === 200) {
      setMessage("Courier rejected");
      setApplications((prev) => prev.filter((a) => a.id !== id));
    } else {
      setMessage(res.errors?.[0] || "Failed to reject");
    }
  }

  const pendingApps = applications.filter((a) => a.disabled);

  return (
    <div className="h-full flex flex-col bg-[#F5F4FD]">
      <div className="px-5 pt-10 pb-5">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-clash-display font-semibold text-[#173420]">
              Courier Applications
            </h1>
            <p className="text-sm text-[#8094A7] font-inter mt-1">
              {pendingApps.length} pending {pendingApps.length === 1 ? "application" : "applications"}
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 flex-1 min-h-0">
        <div className="bg-[#FEFEFE] border border-[#E3E6ED] rounded-xl p-4 flex flex-col min-w-0 h-full">
          {error && (
            <div className="bg-[#FCDEE0] text-[#C0392B] text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-[#D9F9E7] text-[#007837] text-sm rounded-lg px-4 py-3 mb-4">
              {message}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center flex-1 text-sm text-[#8094A7] font-inter">
              Loading applications...
            </div>
          ) : pendingApps.length === 0 ? (
            <div className="flex items-center justify-center flex-1 text-sm text-[#8094A7] font-inter">
              No pending applications
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              <table className="w-full text-xs font-manrope">
                <thead>
                  <tr className="bg-[#DCE8D6] rounded-lg">
                    <th className="text-left text-[#333333] font-medium py-3 px-2">
                      <div className="flex items-center gap-1">Name <ArrowDown size={10} color="#333333" /></div>
                    </th>
                    <th className="text-left text-[#333333] font-medium py-3 px-2">
                      <div className="flex items-center gap-1">Email <ArrowDown size={10} color="#333333" /></div>
                    </th>
                    <th className="text-left text-[#333333] font-medium py-3 px-2">Phone</th>
                    <th className="text-left text-[#333333] font-medium py-3 px-2">Vehicle</th>
                    <th className="text-left text-[#333333] font-medium py-3 px-2">Zones</th>
                    <th className="text-left text-[#333333] font-medium py-3 px-2">Certifications</th>
                    <th className="text-left text-[#333333] font-medium py-3 px-2">Applied</th>
                    <th className="text-center text-[#333333] font-medium py-3 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingApps.map((app) => (
                    <tr key={app.id} className="border-b border-[#E0E0E0] last:border-0">
                      <td className="py-3 px-2">
                        <div className="text-[#333333]">{app.firstname} {app.lastname}</div>
                        <div className="text-[#757575]">@{app.username}</div>
                      </td>
                      <td className="text-[#173420] py-3 px-2">{app.email}</td>
                      <td className="text-[#333333] py-3 px-2">{app.phoneNumber || "—"}</td>
                      <td className="text-[#333333] py-3 px-2">{app.profile?.vehicleType || "—"}</td>
                      <td className="text-[#333333] py-3 px-2 max-w-[120px] truncate">
                        {app.profile?.zones?.join(", ") || "—"}
                      </td>
                      <td className="text-[#333333] py-3 px-2 max-w-[140px] truncate">
                        {app.profile?.certifications?.join(", ") || "—"}
                      </td>
                      <td className="text-[#757575] py-3 px-2 whitespace-nowrap">
                        {new Date(app.created).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            onClick={() => handleApprove(app.id)}
                            disabled={actionLoading === app.id}
                            className="h-8 px-3 bg-[#173420] hover:bg-[#1F4228] rounded-lg text-white text-xs gap-1"
                          >
                            <Check size={14} weight="bold" />
                            {actionLoading === app.id ? "..." : "Approve"}
                          </Button>
                          <Button
                            onClick={() => handleReject(app.id)}
                            disabled={actionLoading === app.id}
                            variant="outline"
                            className="h-8 px-3 border-[#F04A4A] text-[#F04A4A] hover:bg-[#FCDEE0] rounded-lg text-xs gap-1"
                          >
                            <X size={14} weight="bold" />
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
