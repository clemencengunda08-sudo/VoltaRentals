'use client';

import { m } from 'framer-motion';
import { ReactNode } from 'react';

interface TextTypingProps {
  text: string;
  className?: string;
  delay?: number;
}

/**
 * Executive Typing Effect component.
 * Reveals text character by character for a high-tech premium feel.
 */
export default function TextTyping({ text, className, delay = 0 }: TextTypingProps) {
  const letters = Array.from(text);

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: delay },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
    },
  };

  return (
    <m.div
      style={{ overflow: "hidden", display: "flex", flexWrap: "wrap" }}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={className}
    >
      {letters.map((letter, index) => (
        <m.span
          variants={child}
          style={{ display: "inline-block", whiteSpace: letter === " " ? "pre" : "normal" }}
          key={index}
        >
          {letter}
        </m.span>
      ))}
    </m.div>
  );
}
