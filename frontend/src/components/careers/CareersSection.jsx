import { motion } from "framer-motion";
import { getCareers } from "../../services/api";
import { useApiResource } from "../../hooks/useApiResource";
import Icon from "../shared/Icon";
import { LoadingGrid } from "../shared/DataState";
import MotionSection from "../shared/MotionSection";
import CareerCard from "../ui/CareerCard";
import { revealContainer, revealItem } from "../../utils/animations";

export default function CareersSection() {
  const { data, error, loading, reload } = useApiResource(getCareers);

  return (
    <MotionSection id="careers" className="careers-section">
      <motion.div className="careers-header" variants={revealItem}>
        <div className="careers-header__glow" />
        <p className="careers-header__badge">Join Our Team</p>
        <h2>
          Open <span>Careers</span>
        </h2>
        <p>Looking for a more structured role? We have positions open.</p>
      </motion.div>

      {loading && <LoadingGrid label="Loading careers" />}
      {!loading && (error || data.length === 0) && (
        <motion.div
          className="careers-empty"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
        >
          <div className="careers-empty__glow" />
          <motion.div
            className="careers-empty__icon"
            animate={{ y: [0, -6, 0], scale: [1, 1.03, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Icon name="briefcase" />
          </motion.div>
          <h3>No open positions right now.</h3>
          <p>Check back soon for future opportunities.</p>
          {error && (
            <button type="button" onClick={reload}>
              Try again
            </button>
          )}
        </motion.div>
      )}
      {!loading && !error && data.length > 0 && (
        <motion.div
          className="career-list"
          variants={revealContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.18 }}
        >
          {data.map((career) => (
            <CareerCard career={career} key={career.id || career.title} />
          ))}
        </motion.div>
      )}
    </MotionSection>
  );
}
