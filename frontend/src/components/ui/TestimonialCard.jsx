import { motion } from "framer-motion";
import Icon from "../shared/Icon";
import { revealItem } from "../../utils/animations";

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function TestimonialCard({ testimonial }) {
  const rating = Math.max(0, Math.min(5, Number(testimonial.rating || 0)));
  const name = testimonial.fullName || testimonial.full_name || testimonial.name;
  const designation = testimonial.designation || testimonial.role;
  const quote = testimonial.testimonial || testimonial.quote;
  const image = testimonial.imageUrl || testimonial.image_url || testimonial.image;

  return (
    <motion.figure
      className={`testimonial-card ${testimonial.featured ? "testimonial-card--featured" : ""}`}
      variants={revealItem}
      layout
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
    >
      <div className="testimonial-card__glow" />
      <motion.div
        className="testimonial-card__quote"
        animate={{ y: [0, -4, 0], rotate: [0, 2, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Icon name="quote" />
      </motion.div>

      {rating > 0 && (
        <div className="testimonial-card__rating" aria-label={`${rating} out of 5 stars`}>
          {Array.from({ length: rating }).map((_, index) => (
            <Icon name="star" key={index} />
          ))}
        </div>
      )}

      <blockquote>{quote}</blockquote>

      <figcaption>
        <div className="testimonial-card__avatar">
          {image ? (
            <img src={image} alt={name || "Volunteer"} loading="lazy" />
          ) : (
            <span>{initials(name)}</span>
          )}
        </div>
        <div>
          <strong>{name}</strong>
          {designation && <span>{designation}</span>}
          {testimonial.organization && <span>{testimonial.organization}</span>}
        </div>
      </figcaption>
    </motion.figure>
  );
}
