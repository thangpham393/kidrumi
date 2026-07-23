"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./MascotCard.module.css";

// Thông điệp động — lời động viên, không bịa số liệu.
const MESSAGES = [
  { emoji: "🐙", text: "Chúc bạn một ngày làm việc thật vui!" },
  { emoji: "🎬", text: "Thư viện Shadowing luôn sẵn sàng." },
  { emoji: "✨", text: "Nhập thêm video để bé có nhiều bài học hơn." },
  { emoji: "📚", text: "Nội dung chỉn chu, bé học hăng say." },
];

export default function MascotCard({ collapsed }: { collapsed: boolean }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % MESSAGES.length), 6000);
    return () => clearInterval(id);
  }, []);

  const msg = MESSAGES[i];

  if (collapsed) {
    return (
      <div className={styles.mini} title={msg.text} aria-label={msg.text}>
        <span className={styles.miniEmoji} aria-hidden="true">
          {msg.emoji}
        </span>
      </div>
    );
  }

  return (
    <div className={styles.card} role="status" aria-live="polite">
      <div className={styles.glow} aria-hidden="true" />
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          className={styles.inner}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className={styles.emoji} aria-hidden="true">
            {msg.emoji}
          </span>
          <p className={styles.text}>{msg.text}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
