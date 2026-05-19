import { motion } from "framer-motion";
import { useApiResource } from "../../hooks/useApiResource";
import { EmptyState, ErrorState, LoadingGrid } from "./DataState";
import MotionSection from "./MotionSection";
import SectionHeader from "./SectionHeader";
import { revealItem } from "../../utils/animations";

export default function PeopleGrid({ id, eyebrow, title, description, fetcher, emptyTitle }) {
  const { data, error, loading, reload } = useApiResource(fetcher);

  return (
    <MotionSection id={id} className="people-section">
      <SectionHeader eyebrow={eyebrow} title={title} description={description} />

      {loading && <LoadingGrid label={`Loading ${title}`} />}
      {!loading && error && <ErrorState title={`Unable to load ${eyebrow.toLowerCase()}.`} onRetry={reload} />}
      {!loading && !error && data.length === 0 && <EmptyState title={emptyTitle} />}
      {!loading && !error && data.length > 0 && (
        <div className="people-grid">
          {data.map((person) => (
            <motion.article className="person-card" key={person.id || person.name} variants={revealItem} whileHover={{ y: -6 }}>
              {person.image && <img src={person.image} alt={person.name || ""} />}
              <div>
                <h3>{person.name}</h3>
                <p>{person.role || person.title || person.designation}</p>
                {(person.bio || person.description) && <small>{person.bio || person.description}</small>}
                {(person.email || person.linkedin) && (
                  <div className="person-card__links">
                    {person.email && <a href={`mailto:${person.email}`}>Email</a>}
                    {person.linkedin && <a href={person.linkedin}>LinkedIn</a>}
                  </div>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </MotionSection>
  );
}
