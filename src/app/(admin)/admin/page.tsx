"use client";

import {
  ArrowDown,
  CopySimple,
  Tag,
  ClockClockwise,
  CheckCircle,
  DotsThree,
} from "@phosphor-icons/react";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ActivityItem } from "@/components/ui/activity-item";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { TableToolbar } from "@/components/ui/table-toolbar";

const stats = [
  {
    label: "Active Deliveries",
    value: "14",
    change: "+8%",
    subtitle: "from last week",
  },
  {
    label: "Delivery Perfomance",
    value: "38",
    change: "+8%",
    subtitle: "from last week",
  },
  {
    label: "Revenue",
    value: "$32,000",
    change: "+8%",
    subtitle: "from last week",
  },
  {
    label: "Wellness Streak",
    value: "23 Days",
    link: "View Progress",
    subtitle: "from last week",
  },
];

const shipments = [
  {
    id: "#SH9283746",
    company: "TechGear Inc.",
    category: "Electronics",
    carrier: "FedEx",
    route: "Los Angeles, CA → Chicago, IL",
    date: "Mar 20, 2035",
    status: "in-transit" as const,
    statusLabel: "In Transit",
  },
  {
    id: "#SH9182635",
    company: "StyleHub Co.",
    category: "Apparel",
    carrier: "DHL",
    route: "New York, NY → Atlanta, GA",
    date: "Mar 19, 2035",
    status: "out-for-delivery" as const,
    statusLabel: "Out for Delivery",
  },
  {
    id: "#SH9037821",
    company: "FreshNest",
    category: "Home & Kitchen",
    carrier: "UPS",
    route: "Dallas, TX → Miami, FL",
    date: "Mar 18, 2035",
    status: "delivered" as const,
    statusLabel: "Delivered",
  },
  {
    id: "#SH9374652",
    company: "FitPlus Gear",
    category: "Sports & Outdoors",
    carrier: "USPS",
    route: "Seattle, WA → Denver, CO",
    date: "Mar 21, 2035",
    status: "processing" as const,
    statusLabel: "Processing",
  },
  {
    id: "#SH9457830",
    company: "AutoParts Pro",
    category: "Automotive",
    carrier: "Aramex",
    route: "Detroit, MI → San Diego, CA",
    date: "Mar 20, 2035",
    status: "in-transit" as const,
    statusLabel: "In Transit",
  },
];

const activities = [
  {
    time: "12:00 PM",
    bg: "#FCDEE0",
    icon: CopySimple,
    text: "User @TechGuru99 submitted a bulk shipment request",
  },
  {
    time: "11:30 AM",
    bg: "#F0F0F0",
    icon: Tag,
    text: "Customer Support @SupportKen added a priority tag to Order ID 77889JKL",
  },
  {
    time: "11:00 AM",
    bg: "#FCDEE0",
    icon: ClockClockwise,
    text: "User @SallyMae88 initiated a return process for Order ID 44556GHI",
  },
  {
    time: "10:15 AM",
    bg: "#F0F0F0",
    icon: CheckCircle,
    text: "Administrator @AdminLisa resolved a delivery issue for Order ID 12345XYZ",
  },
  {
    time: "09:45 AM",
    bg: "#FCDEE0",
    icon: CopySimple,
    text: "User @Mickey92 updated the shipping address for Order ID 67890ABC",
  },
];

export default function AdminDashboard() {
  return (
    <div className="h-full flex flex-col bg-[#F5F4FD]">
      <div className="px-5 pt-10 pb-5">
        <div className="grid grid-cols-4 gap-[10px]">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </div>

      <div className="px-5 flex-1 flex gap-[10px] min-h-0">
        <div className="flex-1 bg-[#FEFEFE] border border-[#E3E6ED] rounded-xl p-4 flex flex-col min-w-0">
          <TableToolbar title="Recent Shipments" />
          <div className="flex-1 overflow-auto">
            <table className="w-full text-[10px] font-manrope">
              <thead>
                <tr className="bg-[#DCE8D6] rounded-lg">
                  <th className="w-[12px] p-0 pl-2 py-3">
                    <div className="w-3 h-3 bg-[#F0F0F0] border border-[#E0E0E0] rounded-sm" />
                  </th>
                  <th className="text-left text-[#333333] font-medium py-3 px-2">
                    <div className="flex items-center gap-1">
                      Shipping ID
                      <ArrowDown size={10} color="#333333" />
                    </div>
                  </th>
                  <th className="text-left text-[#333333] font-medium py-3 px-2">
                    <div className="flex items-center gap-1">
                      Company
                      <ArrowDown size={10} color="#333333" />
                    </div>
                  </th>
                  <th className="text-left text-[#333333] font-medium py-3 px-2">
                    <div className="flex items-center gap-1">
                      Carriers
                      <ArrowDown size={10} color="#333333" />
                    </div>
                  </th>
                  <th className="text-left text-[#333333] font-medium py-3 px-2">
                    <div className="flex items-center gap-1">
                      Route
                      <ArrowDown size={10} color="#333333" />
                    </div>
                  </th>
                  <th className="text-left text-[#333333] font-medium py-3 px-2">
                    <div className="flex items-center gap-1">
                      Shipping Date
                      <ArrowDown size={10} color="#333333" />
                    </div>
                  </th>
                  <th className="text-left text-[#333333] font-medium py-3 px-2">
                    <div className="flex items-center gap-1">
                      Status
                      <ArrowDown size={10} color="#333333" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((row, i) => (
                  <tr
                    key={row.id}
                    className="border-b border-[#E0E0E0] last:border-0"
                  >
                    <td className="p-0 pl-2 py-3">
                      <div className="w-3 h-3 bg-[#F0F0F0] border border-[#E0E0E0] rounded-sm" />
                    </td>
                    <td className="text-[#173420] py-3 px-2">{row.id}</td>
                    <td className="py-3 px-2">
                      <div className="text-[#333333]">{row.company}</div>
                      <div className="text-[#757575]">{row.category}</div>
                    </td>
                    <td className="text-xs text-[#333333] py-3 px-2">
                      {row.carrier}
                    </td>
                    <td className="text-[#333333] py-3 px-2 whitespace-nowrap">
                      {row.route}
                    </td>
                    <td className="text-[#333333] py-3 px-2 whitespace-nowrap">
                      {row.date}
                    </td>
                    <td className="py-3 px-2">
                      <StatusBadge label={row.statusLabel} status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="w-[299px] bg-[#FEFEFE] border border-[#E3E6ED] rounded-xl p-4 flex flex-col flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-manrope text-[#333333]">
              Recent Activity
            </h3>
            <button className="w-7 h-7 flex items-center justify-center bg-[#F0F0F0] rounded-lg hover:bg-gray-100 transition-colors">
              <DotsThree size={16} color="#333333" />
            </button>
          </div>
          <div className="flex-1 overflow-auto space-y-0">
            {activities.map((activity, i) => (
              <ActivityItem
                key={i}
                icon={activity.icon}
                iconBg={activity.bg}
                text={activity.text}
                time={activity.time}
                isLast={i === activities.length - 1}
              />
            ))}
          </div>
        </div>
      </div>

      <PaginationBar
        totalEntries={0}
        startEntry={0}
        endEntry={0}
      />
    </div>
  );
}
