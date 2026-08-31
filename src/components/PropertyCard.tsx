"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/theme/animations";
import Link from "next/link";

export interface PropertyCardProps {
  title: string;
  location: string;
  price: string;
  image: string;
  plan: string;
  href?: string;
}

function PropertyCardComponent({ title, location, price, image, plan, href = "#" }: PropertyCardProps) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="group relative w-full h-[450px] rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl bg-card border border-border gpu-layer"
      style={{ willChange: "transform" }}
    >
      <Link href={href} className="block w-full h-full absolute inset-0 z-20" />
      
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.08] gpu-layer"
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* Persistent Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent opacity-85 group-hover:opacity-95 transition-opacity duration-500 z-0" />

      {/* Content wrapper */}
      <div className="absolute inset-0 p-8 flex flex-col justify-end z-10 pointer-events-none">
        <div className="transform translate-y-10 group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight drop-shadow-sm">{title}</h3>
          <p className="text-white/80 text-sm mb-6 flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-accent inline-block shadow-sm" />
            {location}
          </p>
          
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-400 delay-75 flex items-center justify-between border-t border-white/20 pt-5">
            <div>
              <p className="text-[11px] text-white/60 uppercase tracking-widest font-semibold mb-1">Starting Price</p>
              <p className="text-lg md:text-xl font-bold text-accent">{price}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-white/60 uppercase tracking-widest font-semibold mb-1">Payment Plan</p>
              <p className="text-lg md:text-xl font-bold text-accent">{plan}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default memo(PropertyCardComponent);
