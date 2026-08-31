"use client";

import { ReactLenis } from "@studio-freight/react-lenis";
import { useEffect, useState } from "react";

export default function SmoothScrolling({ children }: { children: React.ReactNode }) {
  // Use state to prevent hydration mismatch for reduced motion
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) => {
      setIsReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  if (isReducedMotion) {
    return <>{children}</>;
  }

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        duration: 1.2,
        smoothWheel: true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.5,
        infinite: false,
      }}
    >
      {children as any}
    </ReactLenis>
  );
}
