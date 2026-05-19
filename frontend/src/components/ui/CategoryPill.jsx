import { motion } from "framer-motion";
import Icon from "../shared/Icon";

export default function CategoryPill({ active, icon, label, onClick }) {
  return (
    <motion.button
      className={`category-pill ${active ? "category-pill--active" : ""}`}
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
    >
      {active && (
        <motion.span
          className="category-pill__active-bg"
          layoutId="active-activity-tab"
          transition={{ type: "spring", stiffness: 360, damping: 34 }}
        />
      )}
      <span className="category-pill__icon">
        <Icon name={icon} />
      </span>
      <span className="category-pill__text">{label}</span>
      {active && (
        <motion.span
          className="category-pill__underline"
          layoutId="active-activity-underline"
          transition={{ type: "spring", stiffness: 420, damping: 36 }}
        />
      )}
    </motion.button>
  );
}
