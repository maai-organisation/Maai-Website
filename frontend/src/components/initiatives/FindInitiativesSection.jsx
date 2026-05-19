import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { getInitiativeCategories, getInitiatives } from "../../services/api";
import { useApiResource } from "../../hooks/useApiResource";
import Icon from "../shared/Icon";
import { LoadingGrid } from "../shared/DataState";
import MotionSection from "../shared/MotionSection";
import CategoryFilter from "../ui/CategoryFilter";
import ExplorerInitiativeCard from "../ui/ExplorerInitiativeCard";
import { revealContainer, revealItem } from "../../utils/animations";

const defaultCategories = ["All", "camp", "awareness", "research", "education", "advocacy", "community", "conference", "other"];

export default function FindInitiativesSection() {
  const [activeCategory, setActiveCategory] = useState("All");
  const { data: initiatives, error, loading, reload } = useApiResource(getInitiatives);
  const { data: categories } = useApiResource(getInitiativeCategories);

  const mergedCategories = useMemo(() => {
    const categoriesFromBackend = (categories || [])
      .map((category) => category.name || category.title || category.category || category)
      .filter(Boolean);
    const categoriesFromInitiatives = (initiatives || [])
      .map((initiative) => initiative.category)
      .filter(Boolean);

    return [
      ...new Set([
        ...defaultCategories,
        ...categoriesFromBackend,
        ...categoriesFromInitiatives,
      ]),
    ];
  }, [categories, initiatives]);

  const filteredInitiatives = useMemo(() => {
    if (activeCategory === "All") return initiatives;
    return initiatives.filter((item) => item.category === activeCategory);
  }, [activeCategory, initiatives]);

  return (
    <MotionSection id="find-camps" className="find-section">
      <motion.div className="find-header" variants={revealItem}>
        <div className="find-header__glow" />
        <p className="find-header__badge">Get Involved</p>
        <h2>
          Find Your Next <span>Initiative</span>
        </h2>
        <p>Browse upcoming camps, awareness sessions, and NGO drives.</p>
      </motion.div>

      <motion.div className="category-filter-row" variants={revealItem} role="tablist" aria-label="Initiative categories">
        {mergedCategories.map((category) => (
          <CategoryFilter
            active={activeCategory === category}
            category={category}
            key={category}
            onClick={() => setActiveCategory(category)}
          />
        ))}
      </motion.div>

      {loading && <LoadingGrid label="Loading initiatives" />}
      {!loading && (error || filteredInitiatives.length === 0) && (
        <motion.div
          className="find-empty"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
        >
          <div className="find-empty__glow" />
          <motion.div
            className="find-empty__icon"
            animate={{ y: [0, -6, 0], scale: [1, 1.03, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Icon name="heart" />
          </motion.div>
          <span>Coming Soon</span>
          <h3>New opportunities are on the way.</h3>
          {error && (
            <button type="button" onClick={reload}>
              Try again
            </button>
          )}
        </motion.div>
      )}
      {!loading && !error && filteredInitiatives.length > 0 && (
        <AnimatePresence mode="wait">
          <motion.div
            className="initiative-explorer-grid"
            key={activeCategory}
            variants={revealContainer}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.24 }}
          >
            {filteredInitiatives.map((initiative) => (
              <ExplorerInitiativeCard
                initiative={initiative}
                key={initiative.id || initiative.slug || initiative.title}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </MotionSection>
  );
}
