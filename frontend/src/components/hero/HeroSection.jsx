import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { revealItem } from "../../utils/animations";

const heroImage =
  "https://i.postimg.cc/KvgKDb3x/Volunteerportalbg.jpg";

const MotionLink = motion.create(Link);

export default function HeroSection() {
  return (
    <section className="hero-section" id="top" aria-labelledby="hero-title">
      <div className="hero-section__overlay" />

      <motion.div
        className="hero-section__inner"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
        }}
      >
        <motion.div className="hero-section__content" variants={revealItem}>
          <p className="section-eyebrow">Community healthcare movement</p>
          <h1 id="hero-title">
            Volunteer for <span>Real Impact.</span>
          </h1>
          <p className="hero-section__subtitle">
            Turn your time into a legacy. Join the Maai organisation movement today.
          </p>
          <div className="hero-section__actions">
            <MotionLink
              className="button button--primary"
              to="/auth?mode=signup"
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Join the Maai organisation movement
            </MotionLink>
            <motion.a
              className="button button--secondary"
              href="#find-camps"
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              View Camps
            </motion.a>
          </div>
        </motion.div>

        <motion.div className="hero-section__visual" variants={revealItem}>
          <motion.img
            className="hero-section__image"
            src={heroImage}
            alt="Healthcare volunteer supporting a patient in the community"
            loading="eager"
            initial={{ scale: 1.04, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.div
            className="hero-section__float hero-section__float--top"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <strong>Real Impact</strong>
            <span>Community healthcare movement</span>
          </motion.div>
          <motion.div
            className="hero-section__float hero-section__float--bottom"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          >
            <strong>View Camps</strong>
            <span>Join the Maai organisation movement</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
