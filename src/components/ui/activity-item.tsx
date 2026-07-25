import * as React from "react"
import { cn } from "@/lib/utils"

interface ActivityItemProps {
  icon: React.ElementType
  iconBg: string
  text: string
  time: string
  isLast?: boolean
}

export function ActivityItem({
  icon: Icon,
  iconBg,
  text,
  time,
  isLast,
}: ActivityItemProps) {
  return (
    <div className="flex gap-3 relative pb-3">
      {!isLast && (
        <div className="absolute left-[18px] top-9 bottom-0 w-px bg-[#E0E0E0]" />
      )}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: iconBg }}
      >
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-manrope leading-relaxed text-[#333333]">
          {text}
        </p>
        <span className="text-[10px] text-[#757575] font-manrope mt-0.5 block">
          {time}
        </span>
      </div>
    </div>
  )
}
