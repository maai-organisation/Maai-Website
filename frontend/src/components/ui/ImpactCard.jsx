import { motion } from "framer-motion";
import Icon from "../shared/Icon";
import { revealItem } from "../../utils/animations";

export default function ImpactCard({ icon = "heart", label, title, text, variant = "light" }) {
  return (
    <motion.article
      className={`impact-card impact-card--${variant}`}
      variants={revealItem}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 240, damping: 24 }}
    >
      <Icon name={icon} />
      {label && <span>{label}</span>}
      <h3>{title}</h3>
      {text && <p>{text}</p>}
    </motion.article>
  );
}
