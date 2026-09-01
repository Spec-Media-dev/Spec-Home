import React from "react";
import Link from "next/link";
import { ArrowRight, Home, Building2, Layers } from "lucide-react";

export default function RootNotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-6 relative overflow-hidden selection:bg-[#d4af37] selection:text-black">
      {/* Background Gold Ambient Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#d4af37]/[0.06] rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      <div className="text-center max-w-2xl mx-auto relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#161616] border border-[#282828] mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
          <span className="text-xs font-mono tracking-widest text-[#d4af37] uppercase font-semibold">
            ERROR 404 • SPEC HOME DUBAI
          </span>
        </div>

        <h1 className="text-[120px] sm:text-[180px] md:text-[220px] font-extrabold tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white/20 via-white/5 to-transparent select-none">
          404
        </h1>

        <div className="relative -mt-16 sm:-mt-24 md:-mt-32 space-y-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white">
            Page <span className="font-bold text-[#d4af37]">Not Found</span>
          </h2>

          <p className="text-neutral-400 text-base sm:text-lg max-w-lg mx-auto leading-relaxed font-light">
            The page or property collection you requested doesn’t exist or has been relocated.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/en"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#d4af37] text-black font-semibold text-sm hover:bg-[#e5c158] transition-all shadow-[0_0_25px_rgba(212,175,55,0.25)] hover:scale-105"
            >
              <Home size={17} />
              <span>Return to Homepage</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/en/properties"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#161616] border border-[#2a2a2a] text-white font-medium text-sm hover:border-[#d4af37] hover:text-[#d4af37] transition-all"
            >
              <Building2 size={17} className="text-[#d4af37]" />
              <span>Browse Properties</span>
            </Link>

            <Link
              href="/en/projects"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#161616] border border-[#2a2a2a] text-white font-medium text-sm hover:border-[#d4af37] hover:text-[#d4af37] transition-all"
            >
              <Layers size={17} className="text-[#d4af37]" />
              <span>Master Projects</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
