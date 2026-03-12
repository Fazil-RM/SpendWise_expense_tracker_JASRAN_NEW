"use client";
import React from "react";
import { motion, useInView, Variant } from "framer-motion";

interface TimelineContentProps {
  children: React.ReactNode;
  animationNum: number;
  timelineRef: React.RefObject<HTMLDivElement | null>;
  customVariants: {
    visible: (i: number) => any;
    hidden: any;
  };
  as?: any;
  className?: string;
  href?: string;
  target?: string;
  rel?: string;
}

export const TimelineContent = ({
  children,
  animationNum,
  timelineRef,
  customVariants,
  as: Component = "div",
  className,
  ...props
}: TimelineContentProps) => {
  const isInView = useInView(timelineRef, { once: true, margin: "-100px" });

  return (
    <motion.div
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={customVariants}
      custom={animationNum}
      className={className}
    >
      <Component {...props}>{children}</Component>
    </motion.div>
  );
};
