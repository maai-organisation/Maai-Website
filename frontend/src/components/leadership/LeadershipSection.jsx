import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { getTeam } from "../../services/api";
import { useApiResource } from "../../hooks/useApiResource";
import { EmptyState, LoadingGrid } from "../shared/DataState";
import MotionSection from "../shared/MotionSection";
import TeamMemberCard from "../ui/TeamMemberCard";
import { revealContainer, revealItem } from "../../utils/animations";

export default function LeadershipSection() {
  const { data, error, loading, reload } = useApiResource(getTeam);
  const groups = data.reduce((acc, member) => {
    const department = member.department || "Team";
    if (!acc[department]) acc[department] = [];
    acc[department].push(member);
    return acc;
  }, {});

  return (
    <MotionSection id="team" className="team-section">
      <motion.div className="team-header" variants={revealItem}>
        <div className="team-header__glow" />
        <p className="team-header__badge">Our Leadership</p>
        <h2>
          Meet the <span>Team</span>
        </h2>
        <p>The dedicated minds driving Maai organisation's mission forward.</p>
      </motion.div>

      {loading && <LoadingGrid label="Loading team members" />}
      {!loading && (error || data.length === 0) && (
        <EmptyState
          title={error ? "Team profiles are temporarily unavailable." : "Team profiles coming soon"}
          description="Leadership profiles from the admin dashboard will appear here as they are published."
          actionLabel={error ? "Try again" : undefined}
          onAction={error ? reload : undefined}
        />
      )}
      {!loading && !error && data.length > 0 && (
        <>
          {Object.entries(groups).map(([department, members]) => (
            <div className="team-department" key={department}>
              <h3>{department}</h3>
              <motion.div
                className="team-grid"
                variants={revealContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.18 }}
              >
                {members.map((member) => (
                  <TeamMemberCard member={member} key={member.id || member.name} />
                ))}
              </motion.div>
            </div>
          ))}

          <motion.div className="team-section__action" variants={revealItem}>
            <Link to="/team" className="team-section__cta">
              Meet Our Full Team
            </Link>
          </motion.div>
        </>
      )}
    </MotionSection>
  );
}
