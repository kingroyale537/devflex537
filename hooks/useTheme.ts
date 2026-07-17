"use client";

import { useTheme as useProviderTheme } from "@/components/providers/ThemeProvider";

export function useTheme() {
  return useProviderTheme();
}
