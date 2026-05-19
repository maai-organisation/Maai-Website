import { useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

export function useCountUp(value, active) {
  const numericValue = Number(value) || 0;
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { stiffness: 80, damping: 24 });
  const rounded = useTransform(springValue, (latest) =>
    Math.round(latest).toLocaleString("en-IN"),
  );

  useEffect(() => {
    if (active) {
      motionValue.set(numericValue);
    }
  }, [active, motionValue, numericValue]);

  return rounded;
}
