import { motion } from "framer-motion";
import Icon from "../shared/Icon";
import { revealItem } from "../../utils/animations";

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function MentorCard({ mentor }) {
  const name = mentor.fullName || mentor.full_name || mentor.name;
  const image = mentor.imageUrl || mentor.image_url || mentor.image;
  const linkedin = mentor.linkedinUrl || mentor.linkedin_url || mentor.linkedin;
  const instagram = mentor.instagramUrl || mentor.instagram_url || mentor.instagram;
  const specialization = mentor.specialization || mentor.category;

  return (
    <motion.article
      className={`mentor-card ${mentor.featured ? "mentor-card--featured" : ""}`}
      variants={revealItem}
      layout
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
    >
      <div className="mentor-card__glow" />
      <div className="mentor-card__media">
        {image ? (
          <img src={image} alt={name || "Maai organisation mentor"} loading="lazy" />
        ) : (
          <div className="mentor-card__initials" aria-hidden="true">
            {initials(name)}
          </div>
        )}
        {mentor.featured && <span>Featured</span>}
      </div>

      <div className="mentor-card__body">
        {specialization && <p className="mentor-card__category">{specialization}</p>}
        <h3>{name}</h3>
        {mentor.designation && <p className="mentor-card__designation">{mentor.designation}</p>}
        {mentor.organization && <p className="mentor-card__organization">{mentor.organization}</p>}
        {mentor.bio && <p className="mentor-card__bio">{mentor.bio}</p>}
        {linkedin && (
          <a href={linkedin} target="_blank" rel="noreferrer">
            LinkedIn <Icon name="arrow" />
          </a>
        )}
        {instagram && (
          <a href={instagram} target="_blank" rel="noreferrer">
            Instagram <Icon name="arrow" />
          </a>
        )}
      </div>
    </motion.article>
  );
}
