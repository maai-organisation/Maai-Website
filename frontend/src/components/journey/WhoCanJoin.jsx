import { motion } from "framer-motion";
import Icon from "../shared/Icon";
import MotionSection from "../shared/MotionSection";
import { revealContainer, revealItem } from "../../utils/animations";

const joinCards = [
  {
    title: "Medical Students",
    description: "Gain hands-on clinical exposure while making a real difference at camps.",
    icon: "graduation",
  },
  {
    title: "Working Professionals",
    description: "Contribute your skills — medical, creative, tech, or logistics — on weekends.",
    icon: "briefcase",
  },
  {
    title: "College Students",
    description: "Build leadership skills, earn certificates, and expand your network meaningfully.",
    icon: "university",
  },
  {
    title: "Anyone Who Cares",
    description: "No medical background needed. If you want to help, we'll find a role for you.",
    icon: "heart",
  },
];

export default function WhoCanJoin() {
  return (
    <MotionSection id="who-can-join" className="join-section">
      <motion.div className="join-header" variants={revealItem}>
        <div className="join-header__glow" />
        <p className="join-header__badge">Open to All</p>
        <h2>
          Who Can <span>Join?</span>
        </h2>
        <p>No barriers. If you care, there's a place for you.</p>
      </motion.div>

      <motion.div
        className="join-grid"
        variants={revealContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {joinCards.map((card) => (
          <motion.article
            className="join-card"
            key={card.title}
            variants={revealItem}
            whileHover={{ y: -6, scale: 1.012 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
          >
            <div className="join-card__glow" />
            <motion.span
              className="join-card__icon"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <Icon name={card.icon} />
            </motion.span>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
          </motion.article>
        ))}
      </motion.div>
    </MotionSection>
  );
}
