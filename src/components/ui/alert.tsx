"use client";

import React from "react";
import { cn } from "@/src/lib/utils";
import { motion, Variants } from "framer-motion";

interface AlertProps {
  type?: "success" | "error" | "warning" | "info";
  message?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

const typeStyles = {
  success: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-300 dark:border-green-800",
  error: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border-red-300 dark:border-red-800",
  warning: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800",
  info: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-blue-300 dark:border-blue-800",
};

const fadeInBlur: Variants = {
  initial: { opacity: 0, filter: "blur(10px)", y: 10, rotate: 0 },
  animate: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    rotate: 0,
    transition: { duration: 0.2, ease: "easeInOut" },
  },
};

const Alert: React.FC<AlertProps> = ({
  type = "info",
  message = "This is an alert message.",
  onClick,
}) => {
  return (
    <motion.div
      className={cn(
        "border px-4 py-3 flex gap-x-2 items-center rounded-2xl text-sm shadow-sm",
        typeStyles[type]
      )}
      role="alert"
      variants={fadeInBlur}
      initial="initial"
      animate="animate"
      whileHover={{
        scale: 1.01,
        rotate: 1,
        transition: {
          duration: 0.2,
          ease: "easeInOut",
        },
      }}
      whileTap={{
        scale: 0.99,
        transition: {
          duration: 0.2,
          ease: "easeInOut",
        },
      }}
      onClick={onClick}
    >
      <span className="font-bold capitalize">{type}:</span>
      <span>{message}</span>
    </motion.div>
  );
};

export default Alert;
