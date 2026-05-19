import { motion } from "framer-motion";
import { getTestimonials } from "../../services/api";
import { useApiResource } from "../../hooks/useApiResource";
import { LoadingGrid } from "../shared/DataState";
import MotionSection from "../shared/MotionSection";
import Icon from "../shared/Icon";
import TestimonialCard from "../ui/TestimonialCard";
import { revealContainer, revealItem } from "../../utils/animations";

export default function TestimonialsSection() {
  const { data, error, loading, reload } = useApiResource(getTestimonials);

  return (
    <MotionSection id="testimonials" className="testimonials-section">
      <motion.div className="testimonials-header" variants={revealItem}>
        <div className="testimonials-header__glow" />
        <p className="testimonials-header__badge">Testimonials</p>
        <h2>
          What Volunteers <span>Say</span>
        </h2>
      </motion.div>

      {loading && <LoadingGrid label="Loading testimonials" count={3} />}
      {!loading && (error || data.length === 0) && (
        <motion.div
          className="testimonials-empty"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
        >
          <div className="testimonials-empty__glow" />
          <motion.div
            className="testimonials-empty__icon"
            animate={{ y: [0, -6, 0], rotate: [0, 3, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Icon name="quote" />
          </motion.div>
          <span>Coming Soon</span>
          <h3>Volunteer stories coming soon.</h3>
          {error && (
            <button type="button" onClick={reload}>
              Try again
            </button>
          )}
        </motion.div>
      )}
      {!loading && !error && data.length > 0 && (
        <motion.div
          className="testimonial-grid"
          variants={revealContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.18 }}
        >
          {data.map((testimonial) => (
            <TestimonialCard testimonial={testimonial} key={testimonial.id || testimonial.name || testimonial.quote} />
          ))}
        </motion.div>
      )}
    </MotionSection>
  );
}
