import React from "react";
import { View, ViewProps } from "react-native";

interface CardProps extends ViewProps {
  variant?: "default" | "elevated" | "outlined";
  children?: React.ReactNode;
}

export function Card({
  variant = "elevated",
  style,
  children,
  ...props
}: CardProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case "elevated":
        return "bg-white rounded-lg shadow-md";
      case "outlined":
        return "bg-white rounded-lg border border-gray-200";
      default:
        return "bg-white rounded-lg";
    }
  };

  return (
    <View className={getVariantClasses()} style={style} {...props}>
      {children}
    </View>
  );
}
