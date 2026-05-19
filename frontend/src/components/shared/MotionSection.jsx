import { motion } from "framer-motion";
import { revealContainer } from "../../utils/animations";

export default function MotionSection({ id, className = "", children }) {
  return (
    <motion.section
      id={id}
      className={`page-section ${className}`}
      variants={revealContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.18 }}
    >
      {children}
    </motion.section>
  );
}
