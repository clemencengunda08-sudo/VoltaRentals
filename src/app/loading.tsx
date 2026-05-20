"use client"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { Zap } from "lucide-react"

export default function Loading() {
  const [show, setShow] = useState(true)

  useEffect(() => {
    // Ensuring splash is visible during hydration
    const timer = setTimeout(() => setShow(false), 0)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
          }}
          className="fixed inset-0 bg-background z-[9999] 
                      flex items-center justify-center backdrop-blur-md"
        >
          <div className="flex flex-col items-center gap-10">

            {/* Logo mark */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="relative"
            >
              <div
                className="h-24 w-24 rounded-[2rem] bg-primary 
                           flex items-center justify-center
                           shadow-[0_20px_50px_-10px_hsla(var(--primary)/0.5)]"
              >
                <Zap className="text-white h-10 w-10 fill-current" />
              </div>

              {/* Cinematic pulse rings */}
              <motion.div
                className="absolute inset-0 rounded-[2rem] 
                           border-2 border-primary/30"
                animate={{ 
                  scale: [1, 1.8],
                  opacity: [0.6, 0] 
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              />
            </motion.div>

            {/* Brand name */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center space-y-2"
            >
              <p className="text-3xl font-black uppercase tracking-tighter text-foreground">
                VOLTA
                <span className="text-primary italic">RENTALS</span>
              </p>
              <div className="flex items-center justify-center gap-3">
                 <div className="h-[1px] w-8 bg-border" />
                 <p className="text-[9px] font-black uppercase 
                              tracking-[0.5em] text-muted-foreground">
                  ELITE FLEET REGISTRY
                </p>
                <div className="h-[1px] w-8 bg-border" />
              </div>
            </motion.div>

            {/* Premium progress bar */}
            <div className="w-48 h-[2px] bg-muted rounded-full 
                            overflow-hidden relative">
              <motion.div
                className="h-full absolute left-0 top-0 rounded-full"
                style={{
                  background: "linear-gradient(to right, transparent, hsl(var(--primary)), transparent)",
                  width: "50%"
                }}
                animate={{ x: ["-100%", "300%"] }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>

            <motion.p 
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-[8px] font-black uppercase tracking-[0.6em] text-muted-foreground"
            >
              Synchronizing Asset Terminal
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
