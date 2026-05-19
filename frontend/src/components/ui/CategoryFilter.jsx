import { motion } from "framer-motion";

export default function CategoryFilter({ active, category, onClick }) {
  return (
    <motion.button
      className={`category-filter ${active ? "category-filter--active" : ""}`}
      type="button"
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 320, damping: 25 }}
    >
      {active && (
        <motion.span
          className="category-filter__active"
          layoutId="initiative-filter-active"
          transition={{ type: "spring", stiffness: 360, damping: 34 }}
        />
      )}
      <span>{category}</span>
    </motion.button>
  );
}
