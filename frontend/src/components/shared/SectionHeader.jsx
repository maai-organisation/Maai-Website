import { motion } from "framer-motion";
import { revealItem } from "../../utils/animations";

export default function SectionHeader({ eyebrow, title, description, align = "center" }) {
  return (
    <motion.div className={`section-header section-header--${align}`} variants={revealItem}>
      {eyebrow && <p className="section-eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      {description && <p className="section-description">{description}</p>}
    </motion.div>
  );
}
