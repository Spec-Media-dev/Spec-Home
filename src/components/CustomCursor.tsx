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
      if (!target) return;
      const isInteractive =
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.tagName === "INPUT" ||
        target.tagName === "SELECT" ||
        target.tagName === "TEXTAREA" ||
        Boolean(target.closest("a, button, [role='button']"));

      isHovered = isInteractive;
    };

    const onMouseLeave = () => {
      isVisible = false;
      if (dotRef.current) dotRef.current.style.opacity = "0";
      if (ringRef.current) ringRef.current.style.opacity = "0";
    };

    // Dedicated high-frequency 60/120fps render loop with pure GPU translate3d
    const render = () => {
      // Smooth lerp without layout triggers
      ringX += (mouseX - ringX) * 0.2;
      ringY += (mouseY - ringY) * 0.2;

      if (dotRef.current) {
        const dotScale = isHovered ? 2.2 : 1;
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%) scale3d(${dotScale}, ${dotScale}, 1)`;
      }

      if (ringRef.current) {
        const ringScale = isHovered ? 1.5 : 1;
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) scale3d(${ringScale}, ${ringScale}, 1)`;
        ringRef.current.style.borderColor = isHovered ? "var(--color-accent, #B8860B)" : "rgba(184, 134, 11, 0.4)";
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
      {/* Outer trailing ring - pure GPU transform without CSS transition conflict */}
      <div
        ref={ringRef}
        style={{ opacity: 0, willChange: "transform, opacity" }}
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-accent/40 pointer-events-none"
      />
      {/* Inner precise dot - pure GPU transform without CSS transition conflict */}
      <div
        ref={dotRef}
        style={{ opacity: 0, willChange: "transform, opacity" }}
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-accent pointer-events-none shadow-[0_0_8px_rgba(212,175,55,0.8)]"
      />
    </div>
  );
}
