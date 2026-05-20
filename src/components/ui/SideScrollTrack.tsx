'use client';

import { 
  motion, 
  useScroll, 
  useSpring, 
  useTransform, 
  AnimatePresence 
} from "framer-motion";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/useReducedMotion";

/**
 * Vertical Side Scroll Track.
 * Decorative overlay showing exact scroll position on the far right.
 * Desktop only protocol.
 */
export function SideScrollTrack() {
  const isMobile = useIsMobile();
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(false);

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 25,
  });

  // Protocol: Hooks must be called at the top level, never conditionally.
  // We move the transform logic here to ensure consistent hook call order.
  const indicatorTop = useTransform(smoothProgress, [0, 1], ["0%", "calc(100% - 8px)"]);

  useEffect(() => {
    const unsub = scrollYProgress.on("change", v => {
      setVisible(v > 0.02 && v < 0.99);
    });
    return unsub;
  }, [scrollYProgress]);

  // Early return for mobile rendering only after all hooks are initialized.
  if (isMobile) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 8 }}
          className="fixed right-0 top-0 bottom-0 z-40 flex items-center pointer-events-none"
          style={{ width: "3px" }}
        >
          {/* Track background */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to bottom, transparent 0%, hsl(var(--border) / 0.3) 10%, hsl(var(--border) / 0.3) 90%, transparent 100%)"
            }}
          />

          {/* Progress fill */}
          <motion.div
            className="absolute top-0 left-0 right-0 rounded-full"
            style={{
              scaleY: smoothProgress,
              transformOrigin: "top",
              background: "linear-gradient(to bottom, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--accent)))",
              height: "100%",
              filter: "drop-shadow(0 0 4px hsl(var(--primary) / 0.5))",
            }}
          />

          {/* Thumb indicator dot */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
            style={{
              top: indicatorTop,
              background: "hsl(var(--primary))",
              boxShadow: "0 0 8px hsl(var(--primary) / 0.8)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
