"use client"

import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useTransform,
  useMotionValueEvent,
} from "framer-motion"
import { useState } from "react"
import { ArrowUp, ArrowDown } from "lucide-react"

/**
 * Executive Scroll Assistant Node.
 * Floating circular progress with directional logic and "Back to Top" trigger.
 */
export function ScrollAssistant() {
  const { scrollYProgress, scrollY } = useScroll()
  const [visible,     setVisible]     = useState(false)
  const [percent,     setPercent]     = useState(0)
  const [isBottom,    setIsBottom]    = useState(false)
  const [scrollingUp, setScrollingUp] = useState(true)
  const [lastY,       setLastY]       = useState(0)

  // Smooth spring progress
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 20,
    restDelta: 0.001,
  })

  useMotionValueEvent(scrollY, "change", (latest) => {
    // Visibility — show after 300px
    setVisible(latest > 300)

    // Direction
    setScrollingUp(latest < lastY)
    setLastY(latest)

    // Percent calculation based on actual scrollable height
    const total = typeof document !== 'undefined' 
      ? document.documentElement.scrollHeight - window.innerHeight 
      : 1
    const pct = total > 0 ? Math.round((latest / total) * 100) : 0
    setPercent(pct)

    // Near bottom trigger (92% for safety)
    setIsBottom(pct >= 92)
  })

  // SVG ring config
  const SIZE         = 52
  const STROKE_WIDTH = 3
  const RADIUS       = (SIZE - STROKE_WIDTH * 2) / 2
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS

  // Map progress to strokeDashoffset
  const strokeDashoffset = useTransform(
    smoothProgress,
    [0, 1],
    [CIRCUMFERENCE, 0]
  )

  // Click handler
  function handleClick() {
    if (isBottom) {
      // At bottom → go to top
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      // Elsewhere → scroll down one viewport
      window.scrollBy({ 
        top: window.innerHeight * 0.8, 
        behavior: "smooth" 
      })
    }
  }

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0  }}
          exit={{   opacity: 0, scale: 0.5, x: 20 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
          }}
          className="fixed bottom-24 right-5 z-50 flex flex-col items-center gap-2"
        >

          {/* Percent label above button */}
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-2 py-0.5 rounded-full bg-card border border-border shadow-sm"
          >
            <span className="text-[8px] font-black text-primary tracking-widest">
              {percent}%
            </span>
          </motion.div>

          {/* Main circular button */}
          <motion.button
            whileHover={{ scale: 1.12 }}
            whileTap={{  scale: 0.92  }}
            onClick={handleClick}
            aria-label={isBottom ? "Back to top" : "Scroll down"}
            className="relative flex items-center justify-center cursor-pointer focus:outline-none"
            style={{ width: SIZE, height: SIZE }}
          >

            {/* SVG Progress Ring */}
            <svg
              width={SIZE}
              height={SIZE}
              className="absolute inset-0 -rotate-90"
              style={{ overflow: "visible" }}
            >
              {/* Glow filter */}
              <defs>
                <filter id="glow-assistant">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Track ring */}
              <circle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth={STROKE_WIDTH}
                strokeLinecap="round"
              />

              {/* Progress ring */}
              <motion.circle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth={STROKE_WIDTH}
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                style={{ strokeDashoffset }}
                filter="url(#glow-assistant)"
              />
            </svg>

            {/* Inner button face */}
            <motion.div
              animate={{
                backgroundColor: isBottom
                  ? "hsl(var(--primary))"
                  : "hsl(var(--card))",
              }}
              transition={{ duration: 0.3 }}
              className="relative z-10 flex items-center justify-center rounded-full border border-border shadow-lg shadow-black/20"
              style={{ 
                width:  SIZE - STROKE_WIDTH * 4, 
                height: SIZE - STROKE_WIDTH * 4 
              }}
            >
              <AnimatePresence mode="wait">
                {isBottom ? (
                  <motion.div
                    key="up"
                    initial={{ opacity: 0, y: 6  }}
                    animate={{ opacity: 1, y: 0  }}
                    exit={{   opacity: 0, y: -6  }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowUp size={14} className="text-white" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="percent"
                    initial={{ opacity: 0, y: 6  }}
                    animate={{ opacity: 1, y: 0  }}
                    exit={{   opacity: 0, y: -6  }}
                    transition={{ duration: 0.2 }}
                    className="text-center"
                  >
                    <motion.span
                      animate={{ 
                        color: percent > 60 
                          ? "hsl(var(--primary))" 
                          : "hsl(var(--muted-foreground))" 
                      }}
                      className="text-[9px] font-black leading-none block"
                    >
                      {scrollingUp ? (
                        <ArrowUp size={12} />
                      ) : (
                        <ArrowDown size={12} />
                      )}
                    </motion.span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

          </motion.button>

          {/* Section indicator line */}
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            className="w-[1px] h-8 rounded-full origin-top"
            style={{
              background: "linear-gradient(to bottom, hsl(var(--primary) / 0.4), transparent)"
            }}
          />

        </motion.div>
      )}
    </AnimatePresence>
  )
}
