import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import MotionSection from "../shared/MotionSection";
import StatCard from "../ui/StatCard";
import { getStats } from "../../services/api";
import { revealContainer, revealItem } from "../../utils/animations";

const fallbackImpactStats = [
  { value: 22, label: "CAMPS CONDUCTED", tone: "teal" },
  { value: 800, label: "BENEFICIARIES REACHED", tone: "coral" },
  { value: 500, label: "VOLUNTEERS ENGAGED", tone: "amber" },
  { value: 17, label: "AWARENESS SESSIONS", tone: "teal" },
];

export default function StatsSection() {
  const [impactStats, setImpactStats] = useState(fallbackImpactStats);

  useEffect(() => {
    let ignore = false;

    getStats()
      .then((stats) => {
        if (!ignore && stats.length > 0) setImpactStats(stats);
      })
      .catch(() => {
        if (!ignore) setImpactStats(fallbackImpactStats);
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <MotionSection id="impact" className="stats-section">
      <motion.div className="stats-header" variants={revealItem}>
        <div className="stats-header__glow" />
        <p className="stats-header__badge">Our Impact</p>
        <h2>
          Numbers That <span>Matter</span>
        </h2>
      </motion.div>

      <motion.div
        className="stats-shell"
        variants={revealContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.28 }}
      >
        <div className="stats-shell__glow" />
        <div className="stats-grid">
          {impactStats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </motion.div>
    </MotionSection>
  );
}
