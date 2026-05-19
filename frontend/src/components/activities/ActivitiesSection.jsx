import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { activitySections } from "../../data/activitiesData";
import Icon from "../shared/Icon";
import MotionSection from "../shared/MotionSection";
import ActivityCard from "../ui/ActivityCard";
import ActivityTabs from "../ui/ActivityTabs";
import { revealContainer, revealItem } from "../../utils/animations";

const contentTransition = {
  duration: 0.35,
  ease: [0.22, 1, 0.36, 1],
};

export default function ActivitiesSection() {
  const [activeId, setActiveId] = useState(activitySections[0].id);
  const activeSection = useMemo(
    () => activitySections.find((section) => section.id === activeId) || activitySections[0],
    [activeId],
  );

  return (
    <MotionSection id="activities" className="activities-section">
      <motion.div className="activities-section__header" variants={revealItem}>
        <p className="activities-section__label">What We Do</p>
        <h2>
          Our <span>Activities</span>
        </h2>
        <p>
          From health camps to awareness sessions, Maai organisation creates organized ways for
          volunteers to serve with clarity, compassion, and measurable community impact.
        </p>
      </motion.div>

      <ActivityTabs activeId={activeId} items={activitySections} onChange={setActiveId} />

      <motion.div className="activity-showcase" layout variants={revealItem}>
        <motion.div className="activity-showcase__glow" layoutId="activity-showcase-glow" />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            className="activity-panel"
            key={activeSection.id}
            initial={{ opacity: 0, y: 18, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
            transition={contentTransition}
          >
            <div className="activity-showcase__intro">
              <motion.span
                className="activity-showcase__icon"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...contentTransition, delay: 0.04 }}
              >
                <Icon name={activeSection.icon} />
              </motion.span>
              <div>
                <motion.h3 layout>{activeSection.title}</motion.h3>
                <motion.p layout>{activeSection.subtitle}</motion.p>
              </div>
            </div>

            <motion.div
              className="activity-card-grid"
              variants={{
                ...revealContainer,
                visible: {
                  opacity: 1,
                  transition: {
                    duration: 0.35,
                    staggerChildren: 0.08,
                    delayChildren: 0.06,
                  },
                },
              }}
              initial="hidden"
              animate="visible"
            >
              {activeSection.cards.map((activity) => (
                <ActivityCard
                  description={activity.description}
                  icon={activity.icon}
                  key={activity.title}
                  title={activity.title}
                />
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </MotionSection>
  );
}
