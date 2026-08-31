"use client";

import { ReactLenis } from "@studio-freight/react-lenis";
import React, { useEffect, useState, memo } from "react";

function SmoothScrollingComponent({ children }: { children: React.ReactNode }) {
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
        lerp: 0.08,
        duration: 1.1,
        smoothWheel: true,
        wheelMultiplier: 0.95,
        touchMultiplier: 1.2,
        infinite: false,
      }}
    >
      {children as any}
    </ReactLenis>
  );
}

export default memo(SmoothScrollingComponent);
