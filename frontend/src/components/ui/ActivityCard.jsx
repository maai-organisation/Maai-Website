import { motion } from "framer-motion";
import Icon from "../shared/Icon";
import { revealItem } from "../../utils/animations";

export default function ActivityCard({ description, icon = "activity", title }) {
  return (
    <motion.article
      className="activity-card"
      variants={revealItem}
      layout
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
    >
      <span className="activity-card__icon">
        <Icon name={icon} />
      </span>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </motion.article>
  );
}
