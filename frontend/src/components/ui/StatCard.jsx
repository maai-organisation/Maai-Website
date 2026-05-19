import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useCountUp } from "../../hooks/useCountUp";
import { revealItem } from "../../utils/animations";

export default function StatCard({ label, suffix = "+", tone = "teal", value }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.55 });
  const count = useCountUp(value, inView);

  return (
    <motion.article
      className={`stat-card stat-card--${tone}`}
      ref={ref}
      variants={revealItem}
      layout
      whileHover={{ y: -4, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
    >
      <div className="stat-card__glow" />
      <strong>
        <motion.span>{count}</motion.span>
        {suffix}
      </strong>
      <p>{label}</p>
    </motion.article>
  );
}
