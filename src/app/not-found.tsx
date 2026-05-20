"use client"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Car } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center space-y-8 max-w-md">

        {/* 404 number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <p className="text-[150px] md:text-[180px] font-black leading-none tracking-tighter text-primary/10 select-none">
            404
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="space-y-4 -mt-12"
        >
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white">
            Asset Not Located
          </h1>
          <p className="text-muted-foreground text-sm font-medium italic">
            "The route you are requesting does not exist in the Volta registry. Return to base for deployment."
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/">
            <Button className="h-12 px-8 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:scale-105 transition-all">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Base
            </Button>
          </Link>
          <Link href="/fleet">
            <Button variant="outline" className="h-12 px-8 border-border text-foreground font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-muted">
              <Car className="mr-2 h-4 w-4" />
              Browse Registry
            </Button>
          </Link>
        </motion.div>

      </div>
    </div>
  )
}
