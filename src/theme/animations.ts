import { Variants, Transition, TargetAndTransition } from "framer-motion";

export const springTransition: Transition = {
  type: "spring",
  stiffness: 100,
  damping: 20,
};

export const slowSpring: Transition = {
  type: "spring",
  stiffness: 50,
  damping: 25,
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: springTransition
  },
};

export const tabSwitchEnter: TargetAndTransition = {
  opacity: 1,
  y: 0,
  filter: "blur(0px)",
  transition: springTransition,
};

export const tabSwitchExit: TargetAndTransition = {
  opacity: 0,
  y: -10,
  filter: "blur(4px)",
  transition: { duration: 0.3 },
};
