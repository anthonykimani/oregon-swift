"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Check, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ZoneMap from "@/components/ZoneMap";
import { api } from "@/lib/api";
import type { ServiceType, Zone } from "@/types/zone";

const steps = ["Location & Contact", "Package", "Review"];

interface FormData {
  pickupAddress: string;
  pickupLat: number | null;
  pickupLng: number | null;
  dropoffAddress: string;
  dropoffLat: number | null;
  dropoffLng: number | null;
  contactName: string;
  contactPhone: string;
  serviceTypeId: string;
  packageDesc: string;
  packagePieces: number;
  packageWeight: string;
  packageFragile: boolean;
}

const initialForm: FormData = {
  pickupAddress: "",
  pickupLat: null,
  pickupLng: null,
  dropoffAddress: "",
  dropoffLat: null,
  dropoffLng: null,
  contactName: "",
  contactPhone: "",
  serviceTypeId: "",
  packageDesc: "",
  packagePieces: 1,
  packageWeight: "",
  packageFragile: false,
};

export default function BookDeliveryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initialForm);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [serviceTypesLoading, setServiceTypesLoading] = useState(true);
  const [zones, setZones] = useState<Zone[]>([]);
  const [estimateLoading, setEstimateLoading] = useState(false);
  const [estimate, setEstimate] = useState<{ priceCents: number; pickupZoneName: string | null; dropoffZoneName: string | null } | null>(null);
  const estimateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [error, setError] = useState("");
  const [panTo, setPanTo] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);
  const [pickupSearching, setPickupSearching] = useState(false);
  const [pickupResults, setPickupResults] = useState<any[]>([]);
  const [dropoffSearching, setDropoffSearching] = useState(false);
  const [dropoffResults, setDropoffResults] = useState<any[]>([]);
  const pickupTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropoffTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const token = session?.accessToken;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.accessToken) return;
    api<ServiceType[]>("/service-types", { token: session.accessToken }).then((stRes) => {
      setServiceTypesLoading(false);
      if (stRes.status === 200 && stRes.data) setServiceTypes(stRes.data);
    }).catch(() => setServiceTypesLoading(false));
    api<Zone[]>("/zones", { token: session.accessToken }).then((zRes) => {
      if (zRes.status === 200 && zRes.data?.length) setZones(zRes.data);
    });
  }, [status, session?.accessToken]);

  // Fetch price estimate when location + service + package info change
  useEffect(() => {
    if (!token) return;
    if (form.pickupLat == null || form.pickupLng == null || form.dropoffLat == null || form.dropoffLng == null) {
      setEstimate(null);
      return;
    }
    if (estimateTimeoutRef.current) clearTimeout(estimateTimeoutRef.current);
    estimateTimeoutRef.current = setTimeout(async () => {
      setEstimateLoading(true);
      const res = await api("/deliveries/estimate", {
        method: "POST",
        token,
        body: JSON.stringify({
          pickupLat: form.pickupLat,
          pickupLng: form.pickupLng,
          dropoffLat: form.dropoffLat,
          dropoffLng: form.dropoffLng,
          serviceTypeId: form.serviceTypeId || undefined,
          packagePieces: form.packagePieces,
          packageWeight: form.packageWeight || null,
        }),
      });
      setEstimateLoading(false);
      if (res.status === 200 && res.data) {
        setEstimate(res.data);
      } else {
        setEstimate(null);
      }
    }, 500);
  }, [
    token,
    form.pickupLat, form.pickupLng,
    form.dropoffLat, form.dropoffLng,
    form.serviceTypeId,
    form.packagePieces,
    form.packageWeight,
  ]);

  function updateField(field: keyof FormData, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleAddressSearch(value: string, type: "pickup" | "dropoff") {
    const setResults = type === "pickup" ? setPickupResults : setDropoffResults;
    const setSearching = type === "pickup" ? setPickupSearching : setDropoffSearching;
    const timeoutRef = type === "pickup" ? pickupTimeoutRef : dropoffTimeoutRef;
    const setAddress = type === "pickup"
      ? (v: string) => updateField("pickupAddress", v)
      : (v: string) => updateField("dropoffAddress", v);

    setAddress(value);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (!value.trim()) {
      setResults([]);
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5&countrycodes=us`
        );
        const data = await res.json();
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  }

  function handleSelectAddressResult(result: any, type: "pickup" | "dropoff") {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const setAddress = type === "pickup"
      ? (v: string) => updateField("pickupAddress", v)
      : (v: string) => updateField("dropoffAddress", v);
    const setResults = type === "pickup" ? setPickupResults : setDropoffResults;

    setAddress(result.display_name);
    if (type === "pickup") {
      updateField("pickupLat", lat);
      updateField("pickupLng", lng);
    } else {
      updateField("dropoffLat", lat);
      updateField("dropoffLng", lng);
    }
    setPanTo({ lat, lng });
    setResults([]);
  }

  function canProceed(): boolean {
    if (step === 0) return !!form.pickupAddress && !!form.dropoffAddress && !!form.contactName && !!form.contactPhone;
    if (step === 1) return !!form.serviceTypeId && !!form.packageDesc;
    return true;
  }

  async function handleSubmit() {
    if (!token) return;
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setError("");

    const res = await api("/deliveries", {
      method: "POST",
      token,
      body: JSON.stringify({
        pickupAddress: form.pickupAddress,
        pickupLat: form.pickupLat,
        pickupLng: form.pickupLng,
        pickupContactName: form.contactName,
        pickupContactPhone: form.contactPhone,
        dropoffAddress: form.dropoffAddress,
        dropoffLat: form.dropoffLat,
        dropoffLng: form.dropoffLng,
        dropoffContactName: form.contactName,
        dropoffContactPhone: form.contactPhone,
        serviceTypeId: form.serviceTypeId,
        packageDesc: form.packageDesc,
        packagePieces: form.packagePieces,
        packageWeight: form.packageWeight || null,
        packageFragile: form.packageFragile,
      }),
    });

    setSubmitting(false);
    submittingRef.current = false;

    if (res.status === 201) {
      router.push("/dashboard/deliveries?created=true");
    } else {
      setError(res.errors?.[0] || "Failed to create delivery");
    }
  }

  const pickupMarker = form.pickupLat != null && form.pickupLng != null ? { lat: form.pickupLat, lng: form.pickupLng } : null;
  const dropoffMarker = form.dropoffLat != null && form.dropoffLng != null ? { lat: form.dropoffLat, lng: form.dropoffLng } : null;
  const selectedService = serviceTypes.find((st) => st.id === form.serviceTypeId);

  return (
    <div className="h-full flex flex-col bg-[#F5F4FD] overflow-y-auto">
      <div className="px-4 sm:px-6 pt-8 pb-4">
        <h1 className="text-xl font-clash-display font-semibold text-[#173420]">
          Book a Delivery
        </h1>
      </div>

      {/* Step Indicator */}
      <div className="px-4 sm:px-6 pb-6">
        <div className="flex items-center gap-1 sm:gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-1 sm:gap-2 flex-1">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                    i < step
                      ? "bg-[#173420] text-white"
                      : i === step
                      ? "bg-[#173420] text-white"
                      : "bg-[#E3E6ED] text-[#8094A7]"
                  }`}
                >
                  {i < step ? <Check size={14} weight="bold" /> : i + 1}
                </div>
                <span
                  className={`text-xs font-inter hidden sm:inline ${
                    i === step ? "text-[#173420] font-medium" : "text-[#8094A7]"
                  }`}
                >
                  {s}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-px ${
                    i < step ? "bg-[#173420]" : "bg-[#E3E6ED]"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 sm:px-6 pb-20 flex-1">
        {error && (
          <div className="bg-[#FCDEE0] text-[#C0392B] text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {/* Price Estimate Bar */}
        {estimate && (
          <div className="bg-white border border-[#E3E6ED] rounded-xl px-4 py-3 mb-4 flex items-center justify-between max-w-3xl">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#666D80]">Estimated cost:</span>
              <span className="text-[#173420] font-semibold">${(estimate.priceCents / 100).toFixed(2)}</span>
              {estimate.pickupZoneName && estimate.dropoffZoneName && (
                <span className="text-xs text-[#8094A7]">
                  ({estimate.pickupZoneName} → {estimate.dropoffZoneName}{selectedService ? ` · ${selectedService.name}` : ""})
                </span>
              )}
            </div>
            {estimateLoading && (
              <span className="text-xs text-[#8094A7]">Updating...</span>
            )}
          </div>
        )}

        {/* Step 0: Location & Contact */}
        {step === 0 && (
          <div className="space-y-4 max-w-3xl">
            <p className="text-sm text-[#666D80] font-inter">
              Enter pickup and dropoff locations, then your contact details.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-inter font-medium text-[#173420] mb-1">Pickup Address</label>
                <Input
                  value={form.pickupAddress}
                  onChange={(e) => handleAddressSearch(e.target.value, "pickup")}
                  placeholder="Search pickup location"
                  className="h-10 bg-white border-[#E3E6ED] text-sm"
                />
                {pickupSearching && (
                  <div className="absolute right-3 bottom-3 text-xs text-[#666D80]">Searching...</div>
                )}
                {pickupResults.length > 0 && (
                  <ul className="absolute top-full left-0 right-0 z-[1000] bg-white border border-[#E3E6ED] rounded-lg mt-1 shadow-lg max-h-48 overflow-y-auto">
                    {pickupResults.map((r: any, i: number) => (
                      <li
                        key={i}
                        onClick={() => handleSelectAddressResult(r, "pickup")}
                        className="px-3 py-2 text-sm cursor-pointer hover:bg-[#F0F2F5] border-b border-[#E3E6ED] last:border-b-0 truncate"
                      >
                        {r.display_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="relative">
                <label className="block text-sm font-inter font-medium text-[#173420] mb-1">Dropoff Address</label>
                <Input
                  value={form.dropoffAddress}
                  onChange={(e) => handleAddressSearch(e.target.value, "dropoff")}
                  placeholder="Search dropoff location"
                  className="h-10 bg-white border-[#E3E6ED] text-sm"
                />
                {dropoffSearching && (
                  <div className="absolute right-3 bottom-3 text-xs text-[#666D80]">Searching...</div>
                )}
                {dropoffResults.length > 0 && (
                  <ul className="absolute top-full left-0 right-0 z-[1000] bg-white border border-[#E3E6ED] rounded-lg mt-1 shadow-lg max-h-48 overflow-y-auto">
                    {dropoffResults.map((r: any, i: number) => (
                      <li
                        key={i}
                        onClick={() => handleSelectAddressResult(r, "dropoff")}
                        className="px-3 py-2 text-sm cursor-pointer hover:bg-[#F0F2F5] border-b border-[#E3E6ED] last:border-b-0 truncate"
                      >
                        {r.display_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <label className="block text-sm font-inter font-medium text-[#173420] mb-1">Contact Name</label>
                <Input value={form.contactName} onChange={(e) => updateField("contactName", e.target.value)} placeholder="Jane Doe" className="h-10 bg-white border-[#E3E6ED] text-sm" />
              </div>

              <div>
                <label className="block text-sm font-inter font-medium text-[#173420] mb-1">Contact Phone</label>
                <Input value={form.contactPhone} onChange={(e) => updateField("contactPhone", e.target.value)} placeholder="(503) 555-0123" className="h-10 bg-white border-[#E3E6ED] text-sm" />
              </div>
            </div>

            <div className="h-[250px] rounded-xl overflow-hidden border border-[#E3E6ED]">
              <ZoneMap
                zones={zones}
                selectedZoneId={null}
                onSelectZone={() => {}}
                panTo={panTo}
                pickupMarker={pickupMarker}
                dropoffMarker={dropoffMarker}
                className="w-full h-full"
              />
            </div>
          </div>
        )}

        {/* Step 1: Package */}
        {step === 1 && (
          <div className="space-y-4 max-w-3xl">
            <p className="text-sm text-[#666D80] font-inter">
              Tell us about your package and select a service type.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-inter font-medium text-[#173420] mb-1">Package Description</label>
                <textarea
                  value={form.packageDesc}
                  onChange={(e) => updateField("packageDesc", e.target.value)}
                  placeholder="What are you shipping?"
                  className="w-full h-24 px-3 py-2 border border-[#E3E6ED] rounded-lg text-sm bg-white resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-inter font-medium text-[#173420] mb-1">Number of Pieces</label>
                <Input value={form.packagePieces} onChange={(e) => updateField("packagePieces", parseInt(e.target.value) || 1)} type="number" min={1} className="h-10 bg-white border-[#E3E6ED] text-sm" />
              </div>
              <div>
                <label className="block text-sm font-inter font-medium text-[#173420] mb-1">Weight (lbs)</label>
                <Input value={form.packageWeight} onChange={(e) => updateField("packageWeight", e.target.value)} placeholder="e.g. 5" className="h-10 bg-white border-[#E3E6ED] text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.packageFragile}
                    onChange={(e) => updateField("packageFragile", e.target.checked)}
                    className="w-4 h-4 rounded border-[#E3E6ED]"
                  />
                  <span className="text-sm text-[#173420] font-inter">This package contains fragile items</span>
                </label>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-inter font-medium text-[#173420] mb-2">Service Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {serviceTypesLoading ? (
                    <p className="text-sm text-[#666D80] col-span-full">Loading service types...</p>
                  ) : serviceTypes.length === 0 ? (
                    <p className="text-sm text-[#666D80] col-span-full">No service types available.</p>
                  ) : serviceTypes.map((st) => (
                    <button
                      key={st.id}
                      onClick={() => updateField("serviceTypeId", st.id)}
                      className={`p-4 rounded-xl border text-left transition-colors ${
                        form.serviceTypeId === st.id
                          ? "border-[#173420] bg-[#EDF2EA]"
                          : "border-[#E3E6ED] bg-white hover:border-[#173420]"
                      }`}
                    >
                      <p className="font-medium text-sm text-[#173420]">{st.name}</p>
                      <p className="text-xs text-[#8094A7] mt-1">
                        {st.slaHours}h delivery
                      </p>
                      {st.requiresSignature && (
                        <p className="text-xs text-[#F3BC24] mt-1">Signature required</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Review */}
        {step === 2 && (
          <div className="space-y-4 max-w-3xl">
            <p className="text-sm text-[#666D80] font-inter">
              Review your delivery details before confirming.
            </p>
            <div className="bg-white rounded-xl border border-[#E3E6ED] p-4 sm:p-6 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-[#173420] mb-2">Pickup</h3>
                <p className="text-sm text-[#666D80]">{form.pickupAddress}</p>
              </div>
              <div className="h-px bg-[#E3E6ED]" />
              <div>
                <h3 className="text-sm font-semibold text-[#173420] mb-2">Dropoff</h3>
                <p className="text-sm text-[#666D80]">{form.dropoffAddress}</p>
              </div>
              <div className="h-px bg-[#E3E6ED]" />
              <div>
                <h3 className="text-sm font-semibold text-[#173420] mb-2">Contact</h3>
                <p className="text-sm text-[#666D80]">{form.contactName} | {form.contactPhone}</p>
              </div>
              <div className="h-px bg-[#E3E6ED]" />
              <div>
                <h3 className="text-sm font-semibold text-[#173420] mb-2">Package</h3>
                <p className="text-sm text-[#666D80]">{form.packageDesc}</p>
                <p className="text-xs text-[#8094A7]">{form.packagePieces} piece{form.packagePieces > 1 ? "s" : ""}{form.packageWeight ? ` · ${form.packageWeight} lbs` : ""}{form.packageFragile ? " · Fragile" : ""}</p>
              </div>
              <div className="h-px bg-[#E3E6ED]" />
              <div>
                <h3 className="text-sm font-semibold text-[#173420] mb-2">Service</h3>
                <p className="text-sm text-[#666D80]">{selectedService?.name} ({selectedService?.slaHours}h delivery)</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 lg:left-[272px] right-0 bg-white border-t border-[#E3E6ED] px-4 sm:px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            variant="outline"
            className="h-10 px-4 border-[#E3E6ED] text-[#173420] text-sm gap-2"
          >
            <CaretLeft size={16} />
            Back
          </Button>

          {step < 2 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="h-10 px-6 bg-[#173420] hover:bg-[#1F4228] text-white text-sm gap-2"
            >
              Next
              <CaretRight size={16} />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="h-10 px-6 bg-[#F3BC24] hover:bg-[#F5C94A] text-[#173420] font-semibold text-sm"
            >
              {submitting ? "Submitting..." : "Confirm Booking"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
