import { motion } from "framer-motion";

export function PrimaryButton({ children, disabled, onClick, type = "button" }) {
  return (
    <motion.button
      className="inline-flex h-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-pink-500 px-8 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-70"
      disabled={disabled}
      onClick={onClick}
      type={type}
      whileHover={disabled ? undefined : { y: -2, scale: 1.03 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
    >
      {children}
    </motion.button>
  );
}

export function GhostButton({ children, onClick, type = "button" }) {
  return (
    <motion.button
      className="h-12 shrink-0 rounded-2xl px-8 text-sm font-extrabold text-slate-600 transition hover:bg-slate-100"
      onClick={onClick}
      type={type}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.button>
  );
}
