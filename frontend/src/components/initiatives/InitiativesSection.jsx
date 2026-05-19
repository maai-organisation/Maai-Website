import { motion } from "framer-motion";
import { getInitiatives } from "../../services/api";
import { useApiResource } from "../../hooks/useApiResource";
import Icon from "../shared/Icon";
import { EmptyState, LoadingGrid } from "../shared/DataState";
import MotionSection from "../shared/MotionSection";
import { revealContainer, revealItem } from "../../utils/animations";

function formatDate(value) {
  if (!value) return "";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function InitiativeCard({ initiative }) {
  const image = initiative.imageUrl || initiative.image_url || initiative.image;
  const description =
    initiative.shortDescription || initiative.short_description || initiative.description || initiative.subtitle || initiative.summary;

  return (
    <motion.article
      className={`initiative-card ${initiative.featured ? "initiative-card--featured" : ""}`}
      variants={revealItem}
      layout
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
    >
      <div className="initiative-card__media">
        {image ? (
          <img src={image} alt={initiative.title || "Maai organisation initiative"} loading="lazy" />
        ) : (
          <div className="initiative-card__placeholder" aria-hidden="true">
            <Icon name="heart" />
          </div>
        )}
        <div className="initiative-card__shade" />
        <div className="initiative-card__badges">
          <span>{initiative.category || "Initiative"}</span>
          {initiative.featured && <strong>Featured</strong>}
        </div>
      </div>

      <div className="initiative-card__body">
        <div className="initiative-card__meta">
          {initiative.category && <span>{initiative.category}</span>}
          {initiative.createdAt && <small>{formatDate(initiative.createdAt)}</small>}
        </div>
        <h3>{initiative.title}</h3>
        {(initiative.shortDescription || initiative.short_description || initiative.subtitle) && (
          <p className="initiative-card__subtitle">{initiative.shortDescription || initiative.short_description || initiative.subtitle}</p>
        )}
        {description && <p>{description}</p>}
        <a href={initiative.slug ? `/initiative/${initiative.slug}` : "#journey"}>
          Explore project <Icon name="arrow" />
        </a>
      </div>
    </motion.article>
  );
}

export default function InitiativesSection() {
  const { data, error, loading, reload } = useApiResource(getInitiatives);

  return (
    <MotionSection id="initiatives" className="initiatives-section">
      <motion.div className="initiatives-header" variants={revealItem}>
        <div className="initiatives-header__glow" />
        <p className="initiatives-header__badge">Our Projects</p>
        <h2>
          Flagship <span>Initiatives</span>
        </h2>
        <p>Explore what's happening on the ground — and where you can help.</p>
      </motion.div>

      {loading && <LoadingGrid label="Loading initiatives" />}
      {!loading && (error || data.length === 0) && (
        <EmptyState
          title={error ? "Initiatives are temporarily unavailable." : "No initiatives available yet."}
          description="Published projects from the admin dashboard will appear here automatically."
          actionLabel={error ? "Try again" : undefined}
          onAction={error ? reload : undefined}
        />
      )}
      {!loading && !error && data.length > 0 && (
        <motion.div
          className="initiative-grid"
          variants={revealContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.18 }}
        >
          {data.map((initiative) => (
            <InitiativeCard initiative={initiative} key={initiative.id || initiative.slug || initiative.title} />
          ))}
        </motion.div>
      )}
    </MotionSection>
  );
}
