import { motion } from "framer-motion";
import Icon from "../shared/Icon";
import { revealItem } from "../../utils/animations";

function formatDate(value) {
  if (!value) return "";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function ExplorerInitiativeCard({ initiative }) {
  const date = formatDate(initiative.startDate || initiative.start_date || initiative.date || initiative.createdAt);
  const volunteersNeeded = initiative.volunteersNeeded || initiative.volunteers_needed;
  const registrationOpen = initiative.registrationOpen ?? initiative.registration_open;
  const image = initiative.imageUrl || initiative.image_url || initiative.image;
  const description = initiative.shortDescription || initiative.short_description || initiative.description;

  return (
    <motion.article
      className={`explorer-card ${initiative.featured ? "explorer-card--featured" : ""}`}
      variants={revealItem}
      layout
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
    >
      <div className="explorer-card__media">
        {image ? (
          <img src={image} alt={initiative.title || "Maai organisation initiative"} loading="lazy" />
        ) : (
          <div className="explorer-card__placeholder" aria-hidden="true">
            <Icon name="heart" />
          </div>
        )}
        <div className="explorer-card__shade" />
        <div className="explorer-card__badges">
          <span>{initiative.category || "Initiative"}</span>
          {initiative.featured && <strong>Featured</strong>}
        </div>
      </div>

      <div className="explorer-card__body">
        <div className="explorer-card__status">
          <span className={registrationOpen ? "is-open" : ""}>
            {registrationOpen ? "Registration Open" : initiative.status || "Upcoming"}
          </span>
        </div>
        <h3>{initiative.title}</h3>
        {description && <p>{description}</p>}
        <div className="explorer-card__details">
          {date && <span>{date}</span>}
          {initiative.location && <span>{initiative.location}</span>}
          {volunteersNeeded && <span>{volunteersNeeded} volunteers needed</span>}
        </div>
        <a href={initiative.slug ? `/initiative/${initiative.slug}` : "#journey"}>
          Get involved <Icon name="arrow" />
        </a>
      </div>
    </motion.article>
  );
}
