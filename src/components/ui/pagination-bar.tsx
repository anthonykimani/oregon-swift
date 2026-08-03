import { CaretLeft, CaretRight, FileArrowDown } from "@phosphor-icons/react"

interface PaginationBarProps {
  currentPage?: number
  totalPages?: number
  totalEntries?: number
  startEntry?: number
  endEntry?: number
  onPrev?: () => void
  onNext?: () => void
  onShowAll?: () => void
}

export function PaginationBar({
  currentPage = 1,
  totalPages = 1,
  totalEntries = 0,
  startEntry = 0,
  endEntry = 0,
  onPrev,
  onNext,
  onShowAll,
}: PaginationBarProps) {
  return (
    <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-y-4 gap-x-2 px-4 sm:px-5 py-4 border-t border-[#EDEDED] mt-auto">
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border border-[#E3E6ED] hover:bg-gray-50 transition-colors"
        >
          <CaretLeft size={14} className="text-[#173420]" />
        </button>
        <button className="w-8 h-8 flex items-center justify-center bg-[#DCE8D6] rounded-lg text-sm font-inter text-[#173420]">
          {currentPage}
        </button>
        <button
          onClick={onNext}
          className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border border-[#E3E6ED] hover:bg-gray-50 transition-colors"
        >
          <CaretRight size={14} className="text-[#173420]" />
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="text-sm font-inter text-[#8094A7]">
          Showing {startEntry} to {endEntry} of {totalEntries} entries
        </span>
        <button
          onClick={onShowAll}
          className="flex items-center gap-2 h-8 px-3 bg-white border border-[#2c2c2c] rounded-lg text-sm font-inter text-[#173420] hover:bg-gray-50 transition-colors"
        >
          <FileArrowDown size={16} color="#B1B1B4" />
          Show All
        </button>
      </div>
    </div>
  )
}
