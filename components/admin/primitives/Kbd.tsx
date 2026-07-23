import styles from "./Kbd.module.css";

/** Gợi ý phím tắt, ví dụ <Kbd>⌘</Kbd><Kbd>K</Kbd> */
export default function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className={styles.kbd}>{children}</kbd>;
}
