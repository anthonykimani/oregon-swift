"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Headphones, Envelope, Question } from "@phosphor-icons/react";

const faqs = [
  { q: "How do I book a delivery?", a: "Go to Dashboard and click 'Book a Delivery'. Fill in pickup and dropoff addresses, package details, and confirm." },
  { q: "How can I track my delivery?", a: "Go to 'My Deliveries' in the sidebar and click on any delivery to see its tracking timeline." },
  { q: "How do I contact my courier?", a: "Contact information is shown on the delivery detail page once a courier has been assigned." },
  { q: "When will I be charged?", a: "Invoices are generated after delivery completion. You can view them under 'Invoices'." },
  { q: "What if my package is damaged?", a: "Contact our support team immediately. We'll investigate and help resolve the issue." },
  { q: "How do I update my profile?", a: "Go to 'Account' in the sidebar to update your name and phone number." },
];

export default function HelpPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/sign-in");
  }, [status, router]);

  return (
    <div className="h-full flex flex-col bg-[#F5F4FD] overflow-y-auto">
      <div className="px-4 sm:px-6 pt-8 pb-4">
        <h1 className="text-xl font-clash-display font-semibold text-[#173420]">Help & Support</h1>
        <p className="text-sm text-[#666D80] font-inter mt-1">Find answers to common questions</p>
      </div>

      <div className="px-4 sm:px-6 pb-20 max-w-2xl space-y-4">
        <div className="bg-white border border-[#E3E6ED] rounded-xl p-5 space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[#173420]">
            <Question size={16} /> Frequently Asked Questions
          </h3>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-[#E3E6ED] last:border-0 pb-3 last:pb-0">
                <p className="text-sm font-medium text-[#173420] mb-1">{faq.q}</p>
                <p className="text-sm text-[#666D80]">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#E3E6ED] rounded-xl p-5 space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[#173420]">
            <Headphones size={16} /> Contact Support
          </h3>
          <p className="text-sm text-[#666D80]">Need help? Reach out to our support team.</p>
          <div className="flex items-center gap-3">
            <Envelope size={16} className="text-[#8094A7]" />
            <span className="text-sm text-[#173420] font-medium">support@oregonswift.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}
