import { AnimatePresence, motion } from "framer-motion";
import Icon from "../shared/Icon";

export default function ReelModal({ reel, onClose }) {
  const videoUrl = reel?.videoUrl || reel?.video_url;
  const thumbnail = reel?.thumbnailUrl || reel?.thumbnail_url || reel?.thumbnail;

  return (
    <AnimatePresence>
      {reel && (
        <motion.div
          className="reel-modal"
          role="dialog"
          aria-modal="true"
          aria-label={reel.title || "Reel video"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.button
            className="reel-modal__backdrop"
            type="button"
            aria-label="Close reel"
            onClick={onClose}
          />
          <motion.div
            className="reel-modal__panel"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <button className="reel-modal__close" type="button" onClick={onClose} aria-label="Close reel">
              <Icon name="close" />
            </button>
            <div className="reel-modal__video">
              {videoUrl ? (
                <iframe
                  title={reel.title || "Reel video"}
                  src={videoUrl}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              ) : thumbnail ? (
                <img src={thumbnail} alt={reel.title || "Reel thumbnail"} />
              ) : (
                <div className="reel-modal__missing">
                  <Icon name="play" />
                </div>
              )}
            </div>
            <div className="reel-modal__copy">
              <h3>{reel.title}</h3>
              {reel.description && <p>{reel.description}</p>}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
