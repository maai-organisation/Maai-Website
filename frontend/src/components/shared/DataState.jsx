import { motion } from "framer-motion";
import Icon from "./Icon";

export function LoadingGrid({ label = "Loading content", count = 3 }) {
  return (
    <div className="loading-grid" aria-label={label}>
      {Array.from({ length: count }).map((_, index) => (
        <div className="skeleton-card" key={index}>
          <span />
          <strong />
          <p />
          <p />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <motion.div
      className="empty-state"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
    >
      <motion.div
        className="empty-state__mark"
        animate={{ y: [0, -6, 0], rotate: [0, 4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <Icon name="sparkle" />
      </motion.div>
      <span className="empty-state__label">Coming Soon</span>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {onAction && (
        <button className="empty-state__action" type="button" onClick={onAction}>
          {actionLabel || "Refresh"}
        </button>
      )}
    </motion.div>
  );
}

export function ErrorState({ title = "Unable to load this section.", onRetry }) {
  return (
    <div className="empty-state empty-state--error" role="status">
      <div className="empty-state__mark">
        <Icon name="refresh" />
      </div>
      <h3>{title}</h3>
      <p>This content is temporarily unavailable. Please refresh in a moment.</p>
      {onRetry && (
        <button className="empty-state__action" type="button" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
