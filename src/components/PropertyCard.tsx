"use client";

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

export default function PropertyCard({ title, location, price, image, plan, href = "#" }: PropertyCardProps) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -10 }}
      className="group relative w-full h-[450px] rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 bg-card border border-border"
    >
      <Link href={href} className="block w-full h-full absolute inset-0 z-20" />
      
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-[1.12]"
        />
      </div>

      {/* Persistent Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500 z-0" />

      {/* Content wrapper */}
      <div className="absolute inset-0 p-8 flex flex-col justify-end z-10 pointer-events-none">
        <div className="transform translate-y-12 group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]">
          <h3 className="text-3xl font-bold text-white mb-2">{title}</h3>
          <p className="text-white/70 text-sm mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent inline-block" />
            {location}
          </p>
          
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 flex items-center justify-between border-t border-white/20 pt-6">
            <div>
              <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Starting Price</p>
              <p className="text-xl font-semibold text-accent">{price}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Payment Plan</p>
              <p className="text-xl font-semibold text-accent">{plan}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

