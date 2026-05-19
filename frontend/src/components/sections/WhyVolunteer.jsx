import { motion } from "framer-motion";
import MotionSection from "../shared/MotionSection";
import SectionHeader from "../shared/SectionHeader";
import FeatureCard from "../ui/FeatureCard";
import ImpactCard from "../ui/ImpactCard";
import { revealItem } from "../../utils/animations";

const storyImage =
  "https://i.postimg.cc/Zqj05K2C/volunteerpgpic2.jpg";

const features = [
  {
    title: "Medical Exposure",
    description: "Learn from real community healthcare settings with guided field participation.",
    icon: "stethoscope",
  },
  {
    title: "Community & Network",
    description: "Work with people who care about consistent, respectful public service.",
    icon: "network",
  },
  {
    title: "Certificates & Recognition",
    description: "Build a record of meaningful contribution through verified service.",
    icon: "award",
  },
  {
    title: "Real-World Impact",
    description: "Support camps, awareness drives, and outreach that communities can feel.",
    icon: "impact",
  },
];

export default function WhyVolunteer() {
  return (
    <MotionSection id="about" className="why-section">
      <div className="why-section__glow" />

      <div className="why-editorial">
        <motion.div className="why-story" variants={revealItem}>
          <SectionHeader
            eyebrow="Why volunteer with Maai organisation"
            title={
              <>
                Be the Change <span>Communities Need</span>
              </>
            }
            description="Maai organisation helps volunteers show up where support matters most, with organized service opportunities, meaningful field experience, and a community built around care."
            align="left"
          />

          <p>
            We connect people with purposeful on-ground initiatives: medical camps,
            awareness sessions, student outreach, and coordinated service programs
            that are designed to be reliable, respectful, and measurable.
          </p>

          <div className="feature-grid feature-grid--compact">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </motion.div>

        <motion.div className="why-impact-stack" variants={revealItem}>
          <motion.figure
            className="why-photo"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            whileHover={{ y: -10 }}
          >
            <motion.img
              src={storyImage}
              alt="Volunteers preparing community healthcare support"
              loading="lazy"
              initial={{ opacity: 0, scale: 1.04 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            />
          </motion.figure>

          <ImpactCard
            icon="heart"
            label="Volunteer moment"
            title="Show Up & Help"
            text="Join structured efforts where your time translates into real support."
            variant="dark"
          />

          <ImpactCard
            icon="people"
            label="Field note"
            title="Powered by people"
            text="Every camp becomes stronger when volunteers bring patience, care, and consistency."
            variant="warm"
          />
        </motion.div>
      </div>
    </MotionSection>
  );
}
