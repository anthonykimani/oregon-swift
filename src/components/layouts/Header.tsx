"use client";

import { MagnifyingGlass, Plus } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title?: string;
}

export function Header({ title = "Welcome" }: HeaderProps) {
  return (
    <header className="flex items-center justify-between gap-3 px-4 sm:px-5 h-[79px] bg-white border-b border-[#E3E6ED]">
      <h1 className="text-xl sm:text-2xl text-[#161618] truncate" style={{ fontFamily: "Geist, var(--font-sans)" }}>
        {title}
      </h1>

      <div className="relative w-full max-w-[444px] hidden md:block">
        <MagnifyingGlass
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8094A7]"
        />
        <Input
          placeholder="Search"
          className="pl-9 h-8 bg-[#F9F9F9] border-[#E3E6ED] rounded-xl text-sm text-[#8094A7] placeholder:text-[#8094A7]"
        />
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Button className="h-10 px-2 sm:px-4 bg-[#F3BC24] hover:bg-[#F5C94A] rounded-xl text-white text-sm gap-2 border-0 whitespace-nowrap">
          <Plus size={18} weight="bold" />
          <span className="hidden sm:inline">Schedule Session</span>
          <span className="sm:hidden">Schedule</span>
        </Button>
        <Button
          variant="outline"
          className="hidden sm:inline-flex h-10 px-3 bg-[#FDFDFD] border-[#E3E6ED] rounded-lg text-xs text-[#173420] font-inter whitespace-nowrap"
        >
          New Patient
        </Button>
      </div>
    </header>
  );
}
