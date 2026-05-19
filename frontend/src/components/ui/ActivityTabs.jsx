import { motion } from "framer-motion";
import CategoryPill from "./CategoryPill";

export default function ActivityTabs({ activeId, items, onChange }) {
  return (
    <motion.div
      className="activity-tabs"
      layout
      role="tablist"
      aria-label="Activity categories"
      transition={{ layout: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } }}
    >
      {items.map((item) => (
        <CategoryPill
          active={activeId === item.id}
          icon={item.icon}
          key={item.id}
          label={item.tab}
          onClick={() => onChange(item.id)}
        />
      ))}
    </motion.div>
  );
}
