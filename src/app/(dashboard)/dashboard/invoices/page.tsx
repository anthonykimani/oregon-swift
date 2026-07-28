"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bank, Download } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { Invoice } from "@/types/delivery";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

const statusStyles: Record<string, string> = {
  paid: "bg-[#D9F9E7] text-[#007837]",
  draft: "bg-[#FEF7E0] text-[#B8860B]",
  overdue: "bg-[#FCDEE0] text-[#C0392B]",
  sent: "bg-[#E3EEFB] text-[#2563EB]",
};

export default function InvoicesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const token = session?.accessToken;
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, router]);

  const fetchInvoices = useCallback(async () => {
    if (!token) return;
    const res = await api<Invoice[]>("/invoices", { token });
    if (res.status === 200 && res.data) setInvoices(res.data);
    setLoading(false);
  }, [token]);

  useEffect(() => {
    if (token) fetchInvoices();
  }, [token, fetchInvoices]);

  async function handleDownloadPdf(invoiceId: string) {
    if (!token) return;
    setDownloadingId(invoiceId);
    try {
      const res = await fetch(`${API_URL}/invoices/${invoiceId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoiceId.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // silent
    }
    setDownloadingId(null);
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
        <h1 className="text-xl font-clash-display font-semibold text-[#173420]">
          Invoices
        </h1>
      </div>

      <div className="px-4 sm:px-6 pb-20">
        {invoices.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E3E6ED] p-8 text-center">
            <Bank size={40} className="mx-auto text-[#8094A7]" />
            <p className="text-sm text-[#8094A7] font-inter mt-4">No invoices yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="bg-white rounded-xl border border-[#E3E6ED] p-4 flex items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#173420]">{inv.number}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusStyles[inv.status] || "bg-[#E3E6ED] text-[#666]"}`}>
                      {inv.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#666D80] mt-1">
                    {new Date(inv.periodStart).toLocaleDateString()} – {new Date(inv.periodEnd).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-[#8094A7]">Issued: {new Date(inv.issuedAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-[#173420]">${(inv.totalCents / 100).toFixed(2)}</p>
                  <Button
                    variant="ghost"
                    onClick={() => handleDownloadPdf(inv.id)}
                    disabled={downloadingId === inv.id}
                    className="h-8 px-2 text-xs text-[#8094A7] gap-1"
                  >
                    <Download size={12} /> {downloadingId === inv.id ? "..." : "PDF"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
