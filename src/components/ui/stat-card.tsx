import * as React from "react"
import { DotsThree } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: string
  change?: string
  subtitle?: string
  link?: string
  onLinkClick?: () => void
}

export function StatCard({
  label,
  value,
  change,
  subtitle,
  link,
  onLinkClick,
  className,
  ...props
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-white border border-border rounded-lg p-5 flex flex-col justify-between min-w-0",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between mb-5">
        <span className="text-sm font-inter text-[#2D5A3A]">{label}</span>
        <DotsThree size={16} className="text-[#173420]" />
      </div>
      <div>
        <div className="text-2xl font-inter font-semibold text-[#173420] mb-2">
          {value}
        </div>
        <div className="flex items-center gap-2">
          {change && (
            <span className="text-xs font-manrope font-semibold bg-[#FEF7E0] text-[#8A5A00] rounded-full px-2 py-0.5 leading-none">
              {change}
            </span>
          )}
          {link ? (
            <span
              className="text-xs text-[#8094A7] hover:underline cursor-pointer"
              onClick={onLinkClick}
            >
              {link}
            </span>
          ) : (
            subtitle && (
              <span className="text-xs text-[#8094A7]">{subtitle}</span>
            )
          )}
        </div>
      </div>
    </div>
  )
}
