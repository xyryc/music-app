import { toast, alert, setup } from "@baronha/ting";
import { useColorScheme } from "nativewind";

export function configureAlert() {
  const colorScheme = "light"; // Will be overridden in actual usage

  setup({
    toast: {
      backgroundColor: "#1F2937",
      titleColor: "#FFFFFF",
      messageColor: "#D1D5DB",
    },
  });
}

export function showSuccess(title: string, message?: string) {
  toast({
    title,
    message,
    preset: "done",
  });
}

export function showError(title: string, message?: string) {
  toast({
    title,
    message,
    preset: "error",
  });
}

export function showInfo(title: string, message?: string) {
  toast({
    title,
    message,
  });
}

export function showWarn(title: string, message?: string) {
  toast({
    title,
    message,
    preset: "error",
  });
}