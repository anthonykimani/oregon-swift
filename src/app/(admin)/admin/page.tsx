"use client";

import {
  MagnifyingGlass,
  SortAscending,
  DotsThree,
  CaretLeft,
  CaretRight,
  ArrowDown,
  CopySimple,
  Tag,
  ClockClockwise,
  CheckCircle,
  FileArrowDown,
  Square,
} from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    status: "In Transit",
    statusClass: "bg-[#e0e0e0] text-[#333333]",
  },
  {
    id: "#SH9182635",
    company: "StyleHub Co.",
    category: "Apparel",
    carrier: "DHL",
    route: "New York, NY → Atlanta, GA",
    date: "Mar 19, 2035",
    status: "Out for Delivery",
    statusClass: "bg-[#fcdfe0] text-[#f04a4a]",
  },
  {
    id: "#SH9037821",
    company: "FreshNest",
    category: "Home & Kitchen",
    carrier: "UPS",
    route: "Dallas, TX → Miami, FL",
    date: "Mar 18, 2035",
    status: "Delivered",
    statusClass: "bg-[#d9f9e7] text-[#007837]",
  },
  {
    id: "#SH9374652",
    company: "FitPlus Gear",
    category: "Sports & Outdoors",
    carrier: "USPS",
    route: "Seattle, WA → Denver, CO",
    date: "Mar 21, 2035",
    status: "Processing",
    statusClass: "bg-[#e3edff] text-[#235bc2]",
  },
  {
    id: "#SH9457830",
    company: "AutoParts Pro",
    category: "Automotive",
    carrier: "Aramex",
    route: "Detroit, MI → San Diego, CA",
    date: "Mar 20, 2035",
    status: "In Transit",
    statusClass: "bg-[#e0e0e0] text-[#333333]",
  },
];

const activities = [
  {
    time: "12:00 PM",
    bg: "#fcdfe0",
    icon: CopySimple,
    text: "User @TechGuru99 submitted a bulk shipment request",
  },
  {
    time: "11:30 AM",
    bg: "#e0e0e0",
    icon: Tag,
    text: "Customer Support @SupportKen added a priority tag to Order ID 77889JKL",
  },
  {
    time: "11:00 AM",
    bg: "#fcdfe0",
    icon: ClockClockwise,
    text: "User @SallyMae88 initiated a return process for Order ID 44556GHI",
  },
  {
    time: "10:15 AM",
    bg: "#e0e0e0",
    icon: CheckCircle,
    text: "Administrator @AdminLisa resolved a delivery issue for Order ID 12345XYZ",
  },
  {
    time: "09:45 AM",
    bg: "#fcdfe0",
    icon: CopySimple,
    text: "User @Mickey92 updated the shipping address for Order ID 67890ABC",
  },
];

function StatCard({
  label,
  value,
  change,
  subtitle,
  link,
}: {
  label: string;
  value: string;
  change?: string;
  subtitle?: string;
  link?: string;
}) {
  return (
    <div className="bg-white border border-[#e3e6ed] rounded-lg p-5 flex flex-col justify-between min-w-0">
      <div className="flex items-center justify-between mb-5">
        <span className="text-sm font-inter text-[#295279]">{label}</span>
        <DotsThree size={16} color="#052d50" />
      </div>
      <div>
        <div className="text-2xl font-inter text-[#052d50] mb-2">{value}</div>
        <div className="flex items-center gap-2">
          {change && (
            <span className="text-xs font-inter bg-[#effefa] text-[#0088ff] rounded-full px-2 py-0.5">
              {change}
            </span>
          )}
          {link ? (
            <span className="text-xs text-[#8094a7] hover:underline cursor-pointer">
              {link}
            </span>
          ) : (
            <span className="text-xs text-[#8094a7]">{subtitle}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-manrope ${className}`}
    >
      {label}
    </span>
  );
}

function ActivityIcon({
  bg,
  icon: Icon,
}: {
  bg: string;
  icon: any;
}) {
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: bg }}
    >
      <Icon size={18} />
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="h-full flex flex-col bg-[#f5f4fd]">
      {/* Hero / Stats Section */}
      <div className="px-5 pt-10 pb-5">
        <div className="grid grid-cols-4 gap-[10px]">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </div>

      {/* Tables & Activity Section */}
      <div className="px-5 flex-1 flex gap-[10px] min-h-0">
        {/* Recent Shipments Table */}
        <div className="flex-1 bg-[#fefefe] border border-[#e3e6ed] rounded-xl p-4 flex flex-col min-w-0">
          {/* Table Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-manrope text-[#333333]">
              Recent Shipments
            </h3>
            <div className="flex items-center gap-2">
              <div className="relative w-[500px]">
                <MagnifyingGlass
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8094a7]"
                />
                <Input
                  placeholder="Search by name, Speciality"
                  className="pl-9 h-[38px] bg-white border-[#e3e6ed] rounded-lg text-xs text-[#45617d] placeholder:text-[#45617d]"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-[#f4f7fd] rounded px-1.5 py-0.5">
                  <span className="text-[10px] text-[#052d50]">⌘</span>
                  <span className="text-[10px] text-[#052d50] font-medium">
                    K
                  </span>
                  <span className="text-[10px] text-[#052d50]">/</span>
                </div>
              </div>
              <button className="w-7 h-7 flex items-center justify-center bg-[#f0f0f0] rounded-lg hover:bg-gray-100 transition-colors">
                <SortAscending size={16} color="#333333" />
              </button>
              <button className="w-7 h-7 flex items-center justify-center bg-[#f0f0f0] rounded-lg hover:bg-gray-100 transition-colors">
                <DotsThree size={16} color="#333333" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-[10px] font-manrope">
              <thead>
                <tr className="bg-[#dfebfc] rounded-lg">
                  <th className="w-[12px] p-0 pl-2 py-3">
                    <div className="w-3 h-3 bg-[#f0f0f0] border border-[#e0e0e0] rounded-sm" />
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
                    className="border-b border-[#e0e0e0] last:border-0"
                  >
                    <td className="p-0 pl-2 py-3">
                      <div className="w-3 h-3 bg-[#f0f0f0] border border-[#e0e0e0] rounded-sm" />
                    </td>
                    <td className="text-[#0088ff] py-3 px-2">{row.id}</td>
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
                      <StatusBadge
                        label={row.status}
                        className={row.statusClass}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="w-[299px] bg-[#fefefe] border border-[#e3e6ed] rounded-xl p-4 flex flex-col flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-manrope text-[#333333]">
              Recent Activity
            </h3>
            <button className="w-7 h-7 flex items-center justify-center bg-[#f0f0f0] rounded-lg hover:bg-gray-100 transition-colors">
              <DotsThree size={16} color="#333333" />
            </button>
          </div>
          <div className="flex-1 overflow-auto space-y-0">
            {activities.map((activity, i) => {
              const ActivityIconComp = activity.icon;
              return (
                <div key={i} className="flex gap-3 relative pb-3">
                  {i < activities.length - 1 && (
                    <div className="absolute left-[18px] top-9 bottom-0 w-px bg-[#e0e0e0]" />
                  )}
                  <ActivityIcon bg={activity.bg} icon={ActivityIconComp} />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[10px] font-manrope leading-relaxed"
                      style={{ color: "#333333" }}
                    >
                      {activity.text}
                    </p>
                    <span className="text-[10px] text-[#757575] font-manrope mt-0.5 block">
                      {activity.time}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pagination Bar */}
      <div className="flex items-center justify-between px-5 py-4 border-t border-[#ededed] mt-auto">
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border border-[#e3e6ed] hover:bg-gray-50 transition-colors">
            <CaretLeft size={14} color="#052d50" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center bg-[#e5ecfa] rounded-lg text-sm font-inter text-[#052d50]">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border border-[#e3e6ed] hover:bg-gray-50 transition-colors">
            <CaretRight size={14} color="#052d50" />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-inter text-[#8094a7]">
            Showing 0 to 0 of 0 entries
          </span>
          <button className="flex items-center gap-2 h-8 px-3 bg-white border border-[#2c2c2c] rounded-lg text-sm font-inter text-[#0088ff] hover:bg-gray-50 transition-colors">
            <FileArrowDown size={16} color="#b1b1b4" />
            Show All
          </button>
        </div>
      </div>
    </div>
  );
}
