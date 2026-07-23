"use client";

import { useId } from "react";
import styles from "./Switch.module.css";

export type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  id?: string;
};

export default function Switch({ checked, onChange, label, disabled, id }: SwitchProps) {
  const autoId = useId();
  const switchId = id ?? autoId;
  return (
    <label className={styles.wrap} htmlFor={switchId} data-disabled={disabled ? "true" : "false"}>
      <button
        type="button"
        role="switch"
        id={switchId}
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        className={styles.track}
        data-on={checked ? "true" : "false"}
        onClick={() => onChange(!checked)}
      >
        <span className={styles.thumb} aria-hidden="true" />
      </button>
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
}
