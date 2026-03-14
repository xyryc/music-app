import React from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case "primary":
        return "bg-blue-500 border-blue-500";
      case "secondary":
        return "bg-purple-500 border-purple-500";
      case "outline":
        return "bg-transparent border-blue-500 border";
      case "ghost":
        return "bg-transparent border-transparent";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "py-2 px-4 rounded-md";
      case "md":
        return "py-3 px-6 rounded-lg";
      case "lg":
        return "py-4 px-8 rounded-xl";
    }
  };

  const getTextClasses = () => {
    switch (variant) {
      case "outline":
      case "ghost":
        return "text-blue-500";
      default:
        return "text-white";
    }
  };

  return (
    <TouchableOpacity
      className={`flex-row items-center justify-center active:opacity-80 ${getVariantClasses()} ${getSizeClasses()} ${fullWidth ? "w-full" : ""} ${disabled ? "opacity-50" : ""}`}
      style={style}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "outline" || variant === "ghost" ? "#0A7EA4" : "#FFF"
          }
        />
      ) : (
        <Text className={`text-center font-semibold ${getTextClasses()}`}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}
