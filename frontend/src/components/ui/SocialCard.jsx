import { motion } from "framer-motion";
import Icon from "../shared/Icon";
import { revealItem } from "../../utils/animations";

function iconName(social) {
  const value = String(social.icon || social.name || social.platform || "").toLowerCase();
  if (value.includes("instagram")) return "instagram";
  if (value.includes("linkedin")) return "linkedin";
  if (value.includes("youtube")) return "youtube";
  if (value.includes("whatsapp")) return "whatsapp";
  if (value.includes("twitter") || value === "x") return "twitter";
  if (value.includes("facebook")) return "facebook";
  if (value.includes("telegram")) return "telegram";
  if (value.includes("discord")) return "discord";
  if (value.includes("website")) return "globe";
  return "social";
}

function displayHandle(social) {
  const value = String(social.handle || social.cta || "").trim();

  if (!value) {
    return String(social.name || social.platform || "").toLowerCase().includes("linkedin")
      ? "Maai organisation"
      : "Connect with Maai organisation";
  }

  if (/^(maai|maai ngo|maai organisation)$/i.test(value)) return "Maai organisation";

  return value
    .replace(/\bMAAI NGO\b/g, "Maai organisation")
    .replace(/\bMAAI\b/g, "Maai organisation");
}

export default function SocialCard({ social }) {
  return (
    <motion.a
      className={`social-card social-card--${social.tone || iconName(social)}`}
      href={social.url || "#"}
      target="_blank"
      rel="noopener noreferrer"
      variants={revealItem}
      whileHover={{ y: -8, scale: 1.03 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
    >
      <div className="social-card__glow" />
      <motion.span
        className="social-card__icon"
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
      >
        <Icon name={iconName(social)} />
      </motion.span>
      <h3>{social.name || social.platform}</h3>
      <p>{displayHandle(social)}</p>
    </motion.a>
  );
}
