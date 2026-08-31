import { Variants, Transition } from "framer-motion";

export const springTransition: Transition = {
  type: "spring",
  stiffness: 140,
  damping: 22,
  mass: 0.8,
};

export const slowSpring: Transition = {
  type: "spring",
  stiffness: 70,
  damping: 25,
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

// Pure composite GPU properties (translateY and opacity only)
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: springTransition
  },
};

export const tabSwitchEnter = {
  opacity: 1,
  y: 0,
  transition: springTransition,
};

export const tabSwitchExit = {
  opacity: 0,
  y: -8,
  transition: { duration: 0.2 },
};
