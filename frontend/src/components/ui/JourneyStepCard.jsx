import { motion } from "framer-motion";
import { revealItem } from "../../utils/animations";

export default function JourneyStepCard({ description, number, title }) {
  return (
    <motion.article
      className="journey-step-card"
      variants={revealItem}
      whileHover={{ y: -6, scale: 1.012 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
    >
      <div className="journey-step-card__glow" />
      <motion.div
        className="journey-step-card__number"
        animate={{ scale: [1, 1.035, 1] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
      >
        {number}
      </motion.div>
      <p className="journey-step-card__eyebrow">STEP {number}</p>
      <h3>{title}</h3>
      <p>{description}</p>
    </motion.article>
  );
}
