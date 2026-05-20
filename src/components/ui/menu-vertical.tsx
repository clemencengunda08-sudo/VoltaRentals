"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type MenuItem = {
  label: string;
  href: string;
};

interface MenuVerticalProps {
  menuItems: MenuItem[];
  color?: string;
  skew?: number;
  onItemClick?: () => void;
}

export const MenuVertical = ({
  menuItems = [],
  color = "hsl(var(--primary))",
  skew = -10,
  onItemClick,
}: MenuVerticalProps) => {
  return (
    <div className="flex w-full flex-col gap-6">
      {menuItems.map((item, index) => (
        <motion.div
          key={`${item.href}-${index}`}
          className="group/nav flex items-center gap-4 cursor-pointer"
          initial="initial"
          whileHover="hover"
        >
          <motion.div
            variants={{
              initial: { x: -20, opacity: 0 },
              hover: { x: 0, opacity: 1 },
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="shrink-0"
          >
            <ArrowRight strokeWidth={4} className="h-8 w-8 text-primary" />
          </motion.div>

          <Link
            href={item.href}
            onClick={onItemClick}
            className="no-underline block flex-1"
          >
            <motion.span
              variants={{
                initial: { x: -20, color: "hsl(var(--foreground))" },
                hover: { x: 0, color: color, skewX: skew },
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="font-black text-4xl sm:text-5xl uppercase tracking-tighter block leading-none"
            >
              {item.label}
            </motion.span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};
