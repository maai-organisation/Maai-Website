import { motion } from "framer-motion";
import Icon from "../shared/Icon";
import MotionSection from "../shared/MotionSection";
import SectionHeader from "../shared/SectionHeader";
import { revealItem } from "../../utils/animations";

const storyImage =
  "https://i.postimg.cc/Zqj05K2C/volunteerpgpic2.jpg";

const features = [
  { title: "Medical Exposure", icon: "medical" },
  { title: "Community & Network", icon: "network" },
  { title: "Certificates & Recognition", icon: "award" },
  { title: "Real-World Impact", icon: "impact" },
];

export default function WhyVolunteer() {
  return (
    <MotionSection id="about" className="why-section">
      <div className="why-layout">
        <motion.figure className="why-photo" variants={revealItem}>
          <img src={storyImage} alt="Volunteers preparing community healthcare support" loading="lazy" />
        </motion.figure>

        <motion.div className="why-copy" variants={revealItem}>
          <SectionHeader
            eyebrow="Why volunteer"
            title="Be the Change Communities Need"
            description="Maai organisation helps volunteers show up where support matters most, with organized service opportunities, meaningful field experience, and a community built around care."
            align="left"
          />
          <p>
            We connect people with purposeful on-ground initiatives: medical camps,
            awareness sessions, student outreach, and coordinated service programs
            that are designed to be reliable, respectful, and measurable.
          </p>
        </motion.div>
      </div>

      <motion.div className="feature-spotlight" variants={revealItem} whileHover={{ y: -4 }}>
        <Icon name="heart" />
        <div>
          <h3>Show Up & Help</h3>
          <p>Join structured efforts where your time translates into real support.</p>
        </div>
      </motion.div>

      <div className="feature-grid">
        {features.map((feature) => (
          <motion.article className="feature-card" key={feature.title} variants={revealItem} whileHover={{ y: -6 }}>
            <Icon name={feature.icon} />
            <h3>{feature.title}</h3>
          </motion.article>
        ))}
      </div>
    </MotionSection>
  );
}
