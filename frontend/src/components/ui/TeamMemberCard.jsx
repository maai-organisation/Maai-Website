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

export default function TeamMemberCard({ member }) {
  const name = member.fullName || member.full_name || member.name;
  const image = member.imageUrl || member.image_url || member.image;
  const linkedin = member.linkedinUrl || member.linkedin_url || member.linkedin;
  const instagram = member.instagramUrl || member.instagram_url || member.instagram;
  const hasSocials = linkedin || instagram || member.email;

  return (
    <motion.article
      className={`team-card ${member.featured ? "team-card--featured" : ""}`}
      variants={revealItem}
      layout
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
    >
      <div className="team-card__ring" />
      <div className="team-card__image-wrap">
        {image ? (
          <img src={image} alt={name || "Maai organisation team member"} loading="lazy" />
        ) : (
          <div className="team-card__initials" aria-hidden="true">
            {initials(name)}
          </div>
        )}
      </div>

      <div className="team-card__content">
        {member.featured && <span className="team-card__featured">Featured</span>}
        <h3>{name}</h3>
        {member.designation && <p className="team-card__designation">{member.designation}</p>}
        {member.department && <p className="team-card__department">{member.department}</p>}
        {member.bio && <p className="team-card__bio">{member.bio}</p>}
        {hasSocials && (
          <div className="team-card__socials">
            {linkedin && (
              <a href={linkedin} target="_blank" rel="noreferrer" aria-label={`${name} on LinkedIn`}>
                <Icon name="linkedin" />
              </a>
            )}
            {instagram && (
              <a href={instagram} target="_blank" rel="noreferrer" aria-label={`${name} on Instagram`}>
                <Icon name="instagram" />
              </a>
            )}
            {member.email && (
              <a href={`mailto:${member.email}`} aria-label={`Email ${name}`}>
                <Icon name="mail" />
              </a>
            )}
          </div>
        )}
      </div>
    </motion.article>
  );
}
