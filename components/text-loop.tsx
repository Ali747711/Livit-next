"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, Transition } from "motion/react";
import { cn } from "@/lib/utils";

interface TextLoopProps {
  staticText?: string;
  staticTextAfter?: string;
  rotatingTexts?: string[];
  className?: string;
  interval?: number;
  transition?: Transition;
  staticTextClassName?: string;
  staticTextAfterClassName?: string;
  rotatingTextClassName?: string;
  backgroundClassName?: string;
  cursorClassName?: string;
}

export default function TextLoop({
  staticText = "Find Your",
  staticTextAfter = "Home",
  rotatingTexts = ["Dream ", "Comfortable ", "Best "],
  className,
  interval = 3000,
  transition = { duration: 0.8, ease: "easeInOut" },
  staticTextClassName,
  staticTextAfterClassName,
  rotatingTextClassName,
  backgroundClassName,
  cursorClassName,
}: TextLoopProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % rotatingTexts.length);
    }, interval);
    return () => clearInterval(timer);
  }, [rotatingTexts.length, interval]);

  return (
    <div
      className={cn(
        "flex flex-row items-center justify-start w-fit text-4xl md:text-7xl font-medium tracking-tight",
        className,
      )}
    >
      <span className={cn("mr-3 whitespace-nowrap", staticTextClassName)}>
        {staticText}
      </span>
      <div className="relative flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={rotatingTexts[index]}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={transition}
            className="overflow-hidden whitespace-nowrap relative"
          >
            {/* Background gradient box */}
            <div
              className={cn(
                "absolute inset-0",
                "bg-gradient-to-r from-transparent via-blue-200/30 to-blue-200",
                "dark:from-transparent dark:via-blue-950/30 dark:to-blue-950/60",
                backgroundClassName,
              )}
            />

            <span
              className={cn(
                "relative bg-clip-text text-transparent",
                "bg-gradient-to-r from-blue-400 to-blue-800",
                "dark:bg-gradient-to-r from-blue-400 to-blue-600 pr-1",
                rotatingTextClassName,
              )}
            >
              {rotatingTexts[index]}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Cursor Line */}
        <motion.div
          className={cn(
            "w-[3px] md:w-[4px] bg-blue-500 h-[1.10em] sm:h-[1em]",
            cursorClassName,
          )}
          animate={{ opacity: [1, 0.5] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      </div>
      <span className={cn("mr-3 whitespace-nowrap", staticTextAfterClassName)}>
        {" "}
        {staticTextAfter}
      </span>
    </div>
  );
}
