import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";

interface ScreenGradientProps {
  children: ReactNode;
}

export function ScreenGradient({ children }: ScreenGradientProps) {
  return (
    <LinearGradient
      colors={["#1f2937", "#111827", "#000000"]}
      style={{ flex: 1 }}
    >
      {children}
    </LinearGradient>
  );
}
