"use client";

import { forwardRef } from "react";
import { Loader2, type LucideIcon } from "lucide-react";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary" | "ghost" | "subtle" | "danger";
type Size = "sm" | "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  leadingIcon?: LucideIcon;
  trailingIcon?: LucideIcon;
  isLoading?: boolean;
  fullWidth?: boolean;
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    leadingIcon: Leading,
    trailingIcon: Trailing,
    isLoading = false,
    fullWidth = false,
    disabled,
    className,
    children,
    ...rest
  },
  ref,
) {
  const iconSize = size === "sm" ? 16 : size === "lg" ? 20 : 18;
  return (
    <button
      ref={ref}
      className={`${styles.btn} ${fullWidth ? styles.block : ""} ${className ?? ""}`}
      data-variant={variant}
      data-size={size}
      data-loading={isLoading ? "true" : "false"}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...rest}
    >
      {isLoading && <Loader2 size={iconSize} className={styles.spinner} aria-hidden="true" />}
      {!isLoading && Leading && <Leading size={iconSize} strokeWidth={2} aria-hidden="true" />}
      <span className={styles.label}>{children}</span>
      {!isLoading && Trailing && <Trailing size={iconSize} strokeWidth={2} aria-hidden="true" />}
    </button>
  );
});

export default Button;
