import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import MotionSection from "../shared/MotionSection";
import SocialCard from "../ui/SocialCard";
import { revealContainer, revealItem } from "../../utils/animations";
import { getSocialLinks } from "../../services/api";

export default function SocialsSection() {
  const [socialLinks, setSocialLinks] = useState([]);

  useEffect(() => {
    getSocialLinks()
      .then((links) => setSocialLinks(links.filter((link) => link.status === "published")))
      .catch(() => setSocialLinks([]));
  }, []);

  return (
    <MotionSection id="socials" className="socials-section">
      <motion.div className="socials-header" variants={revealItem}>
        <div className="socials-header__glow" />
        <p className="socials-header__badge">Connect With Us</p>
        <h2>
          Our <span>Socials</span>
        </h2>
        <p>Stay connected with our initiatives, stories, updates, and community impact.</p>
      </motion.div>

      <motion.div
        className="social-grid"
        variants={revealContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.18 }}
      >
        {socialLinks.map((social) => (
          <SocialCard social={social} key={social.id || social.platform} />
        ))}
      </motion.div>
    </MotionSection>
  );
}
