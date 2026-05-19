import { motion } from "framer-motion";
import Icon from "../shared/Icon";
import { revealItem } from "../../utils/animations";

function formatDeadline(value) {
  if (!value) return "";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function CareerCard({ career }) {
  const deadline = formatDeadline(career.applicationDeadline || career.application_deadline);
  const imageUrl = career.imageUrl || career.image_url || career.image;
  const roleType = career.roleType || career.role_type || career.type;
  const applyUrl = career.applicationFormUrl || career.application_form_url || career.applyUrl || career.href;

  return (
    <motion.article
      className={`career-card ${career.featured ? "career-card--featured" : ""}`}
      variants={revealItem}
      layout
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
    >
      <div className="career-card__media">
        {imageUrl ? (
          <img src={imageUrl} alt={career.title || "Maai organisation career opening"} loading="lazy" />
        ) : (
          <div className="career-card__placeholder" aria-hidden="true">
            <Icon name="briefcase" />
          </div>
        )}
        <div className="career-card__shade" />
        <div className="career-card__badges">
          <span>{career.department || career.category || "Role"}</span>
          {career.featured && <strong>Featured</strong>}
        </div>
      </div>

      <div className="career-card__body">
        <h3>{career.title}</h3>
        {(career.shortDescription || career.description) && (
          <p>{career.shortDescription || career.description}</p>
        )}
        <div className="career-card__meta">
          {career.location && <span>{career.location}</span>}
          {roleType && <span>{roleType}</span>}
          {deadline && <span>Apply by {deadline}</span>}
        </div>
        <a href={applyUrl || "mailto:maai.organisation@gmail.com"}>
          Apply Now <Icon name="arrow" />
        </a>
      </div>
    </motion.article>
  );
}
