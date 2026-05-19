import { motion } from "framer-motion";
import Icon from "../shared/Icon";
import { revealItem } from "../../utils/animations";

export default function ReelCard({ reel, onOpen }) {
  const thumbnail = reel.thumbnailUrl || reel.thumbnail_url || reel.thumbnail;
  const caption = reel.caption || reel.description;

  return (
    <motion.article
      className={`reel-card ${reel.featured ? "reel-card--featured" : ""}`}
      variants={revealItem}
      layout
      whileHover={{ y: -6, scale: 1.012 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      onClick={() => onOpen(reel)}
    >
      <div className="reel-card__glow" />
      <div className="reel-card__media">
        {thumbnail ? (
          <img src={thumbnail} alt={reel.title || "Maai organisation camp reel"} loading="lazy" />
        ) : (
          <div className="reel-card__placeholder" aria-hidden="true">
            <Icon name="play" />
          </div>
        )}
        <div className="reel-card__shade" />
        <motion.button
          className="reel-card__play"
          type="button"
          aria-label={`Play ${reel.title || "reel"}`}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Icon name="play" />
        </motion.button>
        <div className="reel-card__badges">
          {reel.platform && <span>{reel.platform}</span>}
          {reel.featured && <strong>Featured</strong>}
        </div>
      </div>
      <div className="reel-card__content">
        <h3>{reel.title}</h3>
        {caption && <p>{caption}</p>}
      </div>
    </motion.article>
  );
}
