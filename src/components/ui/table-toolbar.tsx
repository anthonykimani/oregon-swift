import { MagnifyingGlass, SortAscending, DotsThree } from "@phosphor-icons/react"
import { Input } from "@/components/ui/input"

interface TableToolbarProps {
  title: string
  searchPlaceholder?: string
  onSearch?: (value: string) => void
  onSort?: () => void
  onMore?: () => void
}

export function TableToolbar({
  title,
  searchPlaceholder = "Search by name, Speciality",
  onSearch,
  onSort,
  onMore,
}: TableToolbarProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-base font-manrope text-[#333333]">{title}</h3>
      <div className="flex items-center gap-2">
        <div className="relative w-[500px]">
          <MagnifyingGlass
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8094A7]"
          />
          <Input
            placeholder={searchPlaceholder}
            onChange={(e) => onSearch?.(e.target.value)}
            className="pl-9 h-[38px] bg-white border-[#E3E6ED] rounded-lg text-xs text-[#45617D] placeholder:text-[#45617D]"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-[#EDF2EA] rounded px-1.5 py-0.5">
            <span className="text-[10px] text-[#173420]">⌘</span>
            <span className="text-[10px] text-[#173420] font-medium">K</span>
            <span className="text-[10px] text-[#173420]">/</span>
          </div>
        </div>
        <button
          onClick={onSort}
          className="w-7 h-7 flex items-center justify-center bg-[#F0F0F0] rounded-lg hover:bg-gray-100 transition-colors"
        >
          <SortAscending size={16} color="#333333" />
        </button>
        <button
          onClick={onMore}
          className="w-7 h-7 flex items-center justify-center bg-[#F0F0F0] rounded-lg hover:bg-gray-100 transition-colors"
        >
          <DotsThree size={16} color="#333333" />
        </button>
      </div>
    </div>
  )
}
