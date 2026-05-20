'use client';

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Global Top Progress Bar.
 * Minimalist 2px line showing exact page read progress.
 */
export function TopProgressBar() {
  const { scrollYProgress } = useScroll();

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 25,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[9999] origin-left pointer-events-none"
      style={{
        height: "2px",
        scaleX,
        background: "linear-gradient(to right, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--accent)))",
        boxShadow: "0 0 10px hsl(var(--primary) / 0.6)",
      }}
    />
  );
}
