import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { useColorScheme } from "nativewind";

interface ScreenGradientProps {
  children: ReactNode;
}

export function ScreenGradient({ children }: ScreenGradientProps) {
  const { colorScheme } = useColorScheme();
  return (
    <LinearGradient
      colors={
        colorScheme === "dark"
          ? ["#1f2937", "#111827", "#000000"]
          : ["#f3f4f6", "#e5e7eb", "#ffffff"]
      }
      style={{ flex: 1 }}
    >
      {children}
    </LinearGradient>
  );
}
