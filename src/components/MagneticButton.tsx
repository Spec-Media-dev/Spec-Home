"use client";

import React, { useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

const SPRING_CONFIG = { damping: 18, stiffness: 200, mass: 0.1 };

export default function MagneticButton({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  
  // MotionValues run completely off the React render loop on the compositor thread
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, SPRING_CONFIG);
  const springY = useSpring(y, SPRING_CONFIG);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    x.set(middleX * 0.25);
    y.set(middleY * 0.25);
  }, [x, y]);

  const handlePointerLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.button
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ x: springX, y: springY, willChange: "transform" }}
      className={cn(
        "relative flex items-center justify-center rounded-full px-6 py-3 font-medium transition-colors gpu-layer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}
