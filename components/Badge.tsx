import React from "react";
import { cn } from "@/lib/utils";

export default function Badge({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md border border-black bg-white px-2.5 py-1 text-xs font-semibold text-black transition-all duration-300 hover:bg-[#B9FF66] shadow-[1px_1px_0px_rgba(0,0,0,1)]",
        className
      )}
    >
      {label}
    </span>
  );
}
