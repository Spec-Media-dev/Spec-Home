"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/theme/animations";
import { Building2, Search, Briefcase, Handshake } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function Services() {
  const { t } = useI18n();

  const services = [
    {
      icon: <Search className="w-8 h-8 text-accent" />,
      title: t.services.propertySourcingTitle,
      description: t.services.propertySourcingDesc,
    },
    {
      icon: <Briefcase className="w-8 h-8 text-accent" />,
      title: t.services.investmentAdvisoryTitle,
      description: t.services.investmentAdvisoryDesc,
    },
    {
      icon: <Building2 className="w-8 h-8 text-accent" />,
      title: t.services.portfolioManagementTitle,
      description: t.services.portfolioManagementDesc,
    },
    {
      icon: <Handshake className="w-8 h-8 text-accent" />,
      title: t.services.privateSalesTitle,
      description: t.services.privateSalesDesc,
    }
  ];

  return (
    <section className="py-32 bg-background border-t border-border">
      <div className="container mx-auto px-6 max-w-7xl">
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center mb-20"
        >
          <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-bold tracking-tighter text-foreground mb-6">
            {t.services.title.split(".")[0]} <span className="text-accent">.</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-foreground/60 max-w-2xl mx-auto text-lg">
            {t.services.subtitle}
          </motion.p>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {services.map((service, index) => (
            <motion.div 
              key={index}
              variants={fadeUp}
              className="p-8 rounded-3xl bg-card border border-border hover:shadow-xl transition-shadow group"
            >
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">{service.title}</h3>
              <p className="text-foreground/60 text-sm leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
