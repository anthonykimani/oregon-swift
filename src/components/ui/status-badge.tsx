import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-manrope font-semibold leading-none",
  {
    variants: {
      status: {
        "in-transit": "bg-[#E0E0E0] text-[#333333]",
        "out-for-delivery": "bg-[#FCDEE0] text-[#F04A4A]",
        delivered: "bg-[#D9F9E7] text-[#007837]",
        processing: "bg-[#E3EDFF] text-[#235BC2]",
        pending: "bg-[#FFF3D6] text-[#B8860B]",
        cancelled: "bg-[#F0F0F0] text-[#999999]",
      },
    },
    defaultVariants: {
      status: "in-transit",
    },
  }
)

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  label: string
}

export function StatusBadge({ label, status, className, ...props }: StatusBadgeProps) {
  return (
    <span
      className={cn(statusBadgeVariants({ status }), className)}
      {...props}
    >
      {label}
    </span>
  )
}
