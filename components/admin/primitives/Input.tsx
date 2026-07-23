"use client";

import { forwardRef, useId } from "react";
import styles from "./Input.module.css";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  size?: "md" | "lg";
};

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, size = "md", id, className, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedBy = error
    ? `${inputId}-err`
    : hint
      ? `${inputId}-hint`
      : undefined;

  return (
    <div className={`${styles.field} ${className ?? ""}`}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={styles.input}
        data-size={size}
        data-invalid={error ? "true" : "false"}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy}
        {...rest}
      />
      {error ? (
        <p id={`${inputId}-err`} className={styles.error}>
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className={styles.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export default Input;
