import { motion } from "framer-motion";
import Icon from "../shared/Icon";
import { revealItem } from "../../utils/animations";

export default function FeatureCard({ icon, title, description }) {
  return (
    <motion.article
      className="feature-card"
      variants={revealItem}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      <span className="feature-card__icon">
        <Icon name={icon} />
      </span>
      <div>
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </div>
    </motion.article>
  );
}
