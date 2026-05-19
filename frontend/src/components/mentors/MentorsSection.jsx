import { getMentors } from "../../services/api";
import { useApiResource } from "../../hooks/useApiResource";
import { EmptyState, LoadingGrid } from "../shared/DataState";
import MotionSection from "../shared/MotionSection";
import MentorCard from "../ui/MentorCard";
import { motion } from "framer-motion";
import { revealContainer, revealItem } from "../../utils/animations";

export default function MentorsSection() {
  const { data, error, loading, reload } = useApiResource(getMentors);

  return (
    <MotionSection id="mentors" className="mentors-section">
      <motion.div className="mentors-header" variants={revealItem}>
        <div className="mentors-header__glow" />
        <p className="mentors-header__badge">Guiding Lights</p>
        <h2>
          Our <span>Mentors</span>
        </h2>
        <p>Experienced professionals guiding our mission and strategy.</p>
      </motion.div>

      {loading && <LoadingGrid label="Loading mentors" />}
      {!loading && (error || data.length === 0) && (
        <EmptyState
          title={error ? "Mentor profiles are temporarily unavailable." : "Mentor profiles coming soon"}
          description="Advisory profiles from the admin dashboard will appear here as they are published."
          actionLabel={error ? "Try again" : undefined}
          onAction={error ? reload : undefined}
        />
      )}
      {!loading && !error && data.length > 0 && (
        <motion.div
          className="mentor-grid"
          variants={revealContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.18 }}
        >
          {data.map((mentor) => (
            <MentorCard mentor={mentor} key={mentor.id || mentor.name} />
          ))}
        </motion.div>
      )}
    </MotionSection>
  );
}
