import { motion } from "framer-motion";
import { useState } from "react";
import { getReels } from "../../services/api";
import { useApiResource } from "../../hooks/useApiResource";
import Icon from "../shared/Icon";
import { LoadingGrid } from "../shared/DataState";
import MotionSection from "../shared/MotionSection";
import ReelCard from "../ui/ReelCard";
import ReelModal from "../ui/ReelModal";
import { revealContainer, revealItem } from "../../utils/animations";

export default function ReelsSection() {
  const [activeReel, setActiveReel] = useState(null);
  const { data, error, loading, reload } = useApiResource(getReels);

  return (
    <MotionSection id="reels" className="reels-section">
      <motion.div className="reels-header" variants={revealItem}>
        <div className="reels-header__glow" />
        <p className="reels-header__badge">Camp Reels</p>
        <h2>
          Watch Us in <span>Action</span>
        </h2>
        <p>Glimpses of our on-ground impact.</p>
      </motion.div>

      {loading && <LoadingGrid label="Loading reels" />}
      {!loading && (error || data.length === 0) && (
        <motion.div
          className="reels-empty"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
        >
          <div className="reels-empty__glow" />
          <motion.div
            className="reels-empty__icon"
            animate={{ y: [0, -6, 0], scale: [1, 1.03, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Icon name="play" />
          </motion.div>
          <span>Coming Soon</span>
          <h3>Impact stories coming soon.</h3>
          {error && (
            <button type="button" onClick={reload}>
              Try again
            </button>
          )}
        </motion.div>
      )}
      {!loading && !error && data.length > 0 && (
        <motion.div
          className="reel-grid"
          variants={revealContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.18 }}
        >
          {data.map((reel) => (
            <ReelCard reel={reel} key={reel.id || reel.title} onOpen={setActiveReel} />
          ))}
        </motion.div>
      )}
      <ReelModal reel={activeReel} onClose={() => setActiveReel(null)} />
    </MotionSection>
  );
}
