"use client"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { useReducedMotion } from "@/hooks/useReducedMotion"

type Direction = "up" | "down" | "left" | "right" | "none" | "scale"

const variants = {
  up:    { hidden: { y: 40,  opacity: 0, filter: "blur(6px)" }, 
           visible: { y: 0,  opacity: 1, filter: "blur(0px)" } },
  down:  { hidden: { y: -40, opacity: 0, filter: "blur(6px)" }, 
           visible: { y: 0,  opacity: 1, filter: "blur(0px)" } },
  left:  { hidden: { x: 40,  opacity: 0, filter: "blur(6px)" }, 
           visible: { x: 0,  opacity: 1, filter: "blur(0px)" } },
  right: { hidden: { x: -40, opacity: 0, filter: "blur(6px)" }, 
           visible: { x: 0,  opacity: 1, filter: "blur(0px)" } },
  none:  { hidden: { opacity: 0, filter: "blur(6px)" },          
           visible: { opacity: 1, filter: "blur(0px)" } },
  scale: { hidden: { scale: 0.92, opacity: 0, filter: "blur(6px)" }, 
           visible: { scale: 1,   opacity: 1, filter: "blur(0px)" } },
}

export function AnimatedSection({
  children,
  className = "",
  delay = 0,
  direction = "up",
  margin = "-80px",
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: Direction
  margin?: string
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: margin as any })
  const v = variants[direction]
  const shouldReduce = useReducedMotion()

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={shouldReduce ? {
        hidden:  { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3 } }
      } : {
        hidden: v.hidden,
        visible: {
          ...v.visible,
          transition: {
            duration: 0.75,
            delay,
            ease: [0.25, 0.46, 0.45, 0.94],
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerContainer({
  children,
  className = "",
  staggerDelay = 0.1,
  delayChildren = 0.1,
}: {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
  delayChildren?: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" as any })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className = "",
  direction = "up",
}: {
  children: React.ReactNode
  className?: string
  direction?: Direction
}) {
  const v = variants[direction]
  const shouldReduce = useReducedMotion()

  return (
    <motion.div
      variants={shouldReduce ? {
        hidden:  { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3 } }
      } : {
        hidden: v.hidden,
        visible: {
          ...v.visible,
          transition: {
            duration: 0.7,
            ease: [0.25, 0.46, 0.45, 0.94],
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
