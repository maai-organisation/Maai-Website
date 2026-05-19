import { motion } from "framer-motion";
import MotionSection from "../shared/MotionSection";
import JourneyStepCard from "../ui/JourneyStepCard";
import { revealContainer, revealItem } from "../../utils/animations";

const steps = [
  {
    number: "01",
    title: "Create Account",
    description: "Sign up on the Maai organisation platform with your basic details.",
  },
  {
    number: "02",
    title: "Browse Initiatives",
    description: "Explore upcoming medical camps and health drives.",
  },
  {
    number: "03",
    title: "Sign Up",
    description: "Register for your chosen camp — our team will brief you.",
  },
  {
    number: "04",
    title: "Impact",
    description: "Show up, contribute, and earn your verified certificate.",
  },
];

export default function JourneyTimeline() {
  return (
    <MotionSection id="journey" className="journey-section">
      <motion.div className="journey-header" variants={revealItem}>
        <div className="journey-header__glow" />
        <p className="journey-header__badge">THE PROCESS</p>
        <h2>
          Your <span>Journey</span> as a Volunteer
        </h2>
        <p>Four simple steps to get you on the ground making a tangible difference.</p>
      </motion.div>

      <motion.div
        className="timeline"
        variants={revealContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.22 }}
      >
        <motion.div
          className="timeline__line"
          initial={{ scaleX: 0, scaleY: 0 }}
          whileInView={{ scaleX: 1, scaleY: 1 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
        {steps.map((step) => (
          <JourneyStepCard key={step.title} {...step} />
        ))}
      </motion.div>
    </MotionSection>
  );
}
