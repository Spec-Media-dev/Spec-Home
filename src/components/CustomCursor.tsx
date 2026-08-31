"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only enable on fine pointer (mouse) devices to avoid touch mobile stutter
    if (typeof window === "undefined" || !window.matchMedia("(pointer: fine)").matches) {
      return;
    }

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let isHovered = false;
    let isVisible = false;
    let rafId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) {
        isVisible = true;
        if (dotRef.current) dotRef.current.style.opacity = "1";
        if (ringRef.current) ringRef.current.style.opacity = "1";
      }
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "A" ||
          target.tagName === "BUTTON" ||
          target.tagName === "INPUT" ||
          target.tagName === "SELECT" ||
          target.tagName === "TEXTAREA" ||
          target.closest("a") ||
          target.closest("button") ||
          target.getAttribute("role") === "button")
      ) {
        isHovered = true;
      } else {
        isHovered = false;
      }
    };

    const onMouseLeave = () => {
      isVisible = false;
      if (dotRef.current) dotRef.current.style.opacity = "0";
      if (ringRef.current) ringRef.current.style.opacity = "0";
    };

    const render = () => {
      // Smooth lerp for outer trailing ring
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      if (dotRef.current) {
        const dotScale = isHovered ? 2.5 : 1;
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%) scale(${dotScale})`;
      }

      if (ringRef.current) {
        const ringScale = isHovered ? 1.6 : 1;
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) scale(${ringScale})`;
        ringRef.current.style.borderColor = isHovered ? "var(--color-accent, #D4AF37)" : "rgba(212, 175, 55, 0.4)";
      }

      rafId = requestAnimationFrame(render);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseover", onMouseOver, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave, { passive: true });
    rafId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseleave", onMouseLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden select-none hidden md:block">
      {/* Outer trailing ring */}
      <div
        ref={ringRef}
        style={{ opacity: 0, willChange: "transform, opacity", transition: "border-color 0.2s ease" }}
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-accent/40 pointer-events-none"
      />
      {/* Inner precise dot */}
      <div
        ref={dotRef}
        style={{ opacity: 0, willChange: "transform, opacity", transition: "transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)" }}
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-accent pointer-events-none shadow-[0_0_8px_rgba(212,175,55,0.8)]"
      />
    </div>
  );
}

