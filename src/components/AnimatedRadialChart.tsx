import React, { useEffect, useMemo } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

/**
 * Utility function for conditional class names.
 */
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

interface AnimatedRadialChartProps {
  value?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showLabels?: boolean;
  duration?: number;
}

/**
 * AnimatedRadialChart - A gauge-style chart with dynamic color thresholds.
 */
export function AnimatedRadialChart({ 
  value = 74, 
  size = 300,
  strokeWidth: customStrokeWidth,
  className,
  showLabels = true,
  duration = 2
}: AnimatedRadialChartProps) {
  const strokeWidth = customStrokeWidth ?? Math.max(12, size * 0.06);
  const radius = size * 0.35;
  const center = size / 2;
  const circumference = Math.PI * radius;

  const animatedValue = useMotionValue(0);
  const offset = useTransform(animatedValue, [0, 100], [circumference, 0]);
  const progressAngle = useTransform(animatedValue, [0, 100], [-Math.PI, 0]);
  const innerRadius = radius - strokeWidth / 2;

  // Determine colors based on the value
  const theme = useMemo(() => {
    if (value < 35) {
      return {
        label: "Danger",
        start: "#ef4444", // red-500
        mid: "#dc2626",   // red-600
        end: "#991b1b"    // red-800
      };
    } else if (value < 70) {
      return {
        label: "Good",
        start: "#facc15", // yellow-400
        mid: "#eab308",   // yellow-500
        end: "#a16207"    // yellow-700
      };
    } else {
      return {
        label: "Great",
        start: "#4ade80", // green-400
        mid: "#22c55e",   // green-500
        end: "#15803d"    // green-700
      };
    }
  }, [value]);

  useEffect(() => {
    const controls = animate(animatedValue, value, {
      duration,
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [value, animatedValue, duration]);

  const fontSize = Math.max(16, size * 0.1);
  const labelFontSize = Math.max(12, size * 0.04);

  return (
    <div className={cn("relative inline-block", className)} style={{ width: size, height: size * 0.7 }}>
      <svg width={size} height={size * 0.7} viewBox={`0 0 ${size} ${size * 0.7}`} className="overflow-visible">
        <defs>
          <linearGradient id={`baseGradient-${size}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
          </linearGradient>

          {/* Dynamic Progress Gradient */}
          <linearGradient id={`progressGradient-${size}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={theme.start} />
            <stop offset="50%" stopColor={theme.mid} />
            <stop offset="100%" stopColor={theme.end} />
          </linearGradient>

          <filter id={`dropshadow-${size}`} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Gray Track */}
        <path
          d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
          fill="none"
          stroke={`url(#baseGradient-${size})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="text-stone-200 dark:text-stone-800"
        />

        {/* Colored Progress */}
        <motion.path
          d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
          fill="none"
          stroke={`url(#progressGradient-${size})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: offset }}
          filter={`url(#dropshadow-${size})`}
        />

        {/* Needle Indicator */}
        <motion.line
          x1={useTransform(progressAngle, (angle) => center + Math.cos(angle) * innerRadius)}
          y1={useTransform(progressAngle, (angle) => center + Math.sin(angle) * innerRadius)}
          x2={useTransform(progressAngle, (angle) => center + Math.cos(angle) * innerRadius - Math.cos(angle) * 20)}
          y2={useTransform(progressAngle, (angle) => center + Math.sin(angle) * innerRadius - Math.sin(angle) * 20)}
          stroke={theme.start}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-8">
        <motion.div
          className="font-bold tracking-tight"
          style={{ fontSize: `${fontSize}px` }}
        >
          <span style={{ color: theme.start }}>
            <motion.span>{useTransform(animatedValue, (latest) => Math.round(latest))}</motion.span>%
          </span>
        </motion.div>
        <div 
          className="uppercase tracking-[0.2em] font-semibold opacity-50"
          style={{ fontSize: `${labelFontSize * 0.8}px`, color: theme.start }}
        >
          {theme.label}
        </div>
      </div>

      {showLabels && (
        <>
          <div
            className="absolute text-stone-400 dark:text-stone-600 font-medium"
            style={{
              fontSize: `${labelFontSize}px`,
              left: center - radius - 5,
              top: center + strokeWidth / 2 + 5,
            }}
          >
            0%
          </div>
          <div
            className="absolute text-stone-400 dark:text-stone-600 font-medium"
            style={{
              fontSize: `${labelFontSize}px`,
              left: center + radius - 20,
              top: center + strokeWidth / 2 + 5,
            }}
          >
            100%
          </div>
        </>
      )}
    </div>
  );
}
