"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropertyCard from '@/components/PropertyCard';
import { Search, Filter } from 'lucide-react';
import { getProjects } from '@/lib/queries/projects';
import type { ProjectRow } from '@/lib/supabase/types';
import { useI18n } from '@/lib/i18n';

export default function ProjectsPage() {
  const { locale, t } = useI18n();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dbProjects, setDbProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);

  const defaultMockProjects = [
    {
      id: '1',
      title: locale === 'ar' ? 'أبراج ذا سافاير ريزيدنسز' : 'The Sapphire Residences',
      location: locale === 'ar' ? 'وسط مدينة دبي' : 'Downtown Dubai',
      price: locale === 'ar' ? 'ابتداءً من 9.5 مليون درهم' : 'AED 9.5M',
      plan: t.projectsPage.offPlan,
      type: 'Downtown Dubai',
      image: 'https://images.unsplash.com/photo-1546412414-e1885259563a?q=80&w=1200&auto=format&fit=crop',
      slug: 'the-sapphire-residences'
    },
    {
      id: '2',
      title: locale === 'ar' ? 'فلل نخلة جميرا سيغنتشر' : 'The Palm Signature Villas',
      location: locale === 'ar' ? 'نخلة جميرا' : 'Palm Jumeirah',
      price: locale === 'ar' ? 'ابتداءً من 32 مليون درهم' : 'AED 32M',
      plan: t.projectsPage.offPlan,
      type: 'Palm Jumeirah',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop',
      slug: 'palm-signature-villas'
    },
    {
      id: '3',
      title: locale === 'ar' ? 'أويسس بالم هايتس' : 'Oasis Palm Heights',
      location: locale === 'ar' ? 'دبي مارينا' : 'Dubai Marina',
      price: locale === 'ar' ? 'ابتداءً من 4.8 مليون درهم' : 'AED 4.8M',
      plan: t.projectsPage.offPlan,
      type: 'Dubai Marina',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop',
      slug: 'oasis-palm-heights'
    },
    {
      id: '4',
      title: locale === 'ar' ? 'ذا هيلز ريزيرف' : 'The Hills Reserve',
      location: locale === 'ar' ? 'دبي هيلز' : 'Dubai Hills',
      price: locale === 'ar' ? 'ابتداءً من 18.5 مليون درهم' : 'AED 18.5M',
      plan: t.projectsPage.offPlan,
      type: 'Dubai Hills',
      image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1200&auto=format&fit=crop',
      slug: 'the-hills-reserve'
    },
  ];

  const filterOptions = [
    { key: 'All', label: t.projectsPage.all },
    { key: 'Downtown', label: locale === 'ar' ? 'وسط المدينة' : 'Downtown' },
    { key: 'Palm', label: locale === 'ar' ? 'نخلة جميرا' : 'Palm Jumeirah' },
    { key: 'Marina', label: locale === 'ar' ? 'دبي مارينا' : 'Dubai Marina' },
    { key: 'Hills', label: locale === 'ar' ? 'دبي هيلز' : 'Dubai Hills' },
  ];

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getProjects();
        if (data && data.length > 0) {
          setDbProjects(data);
        }
      } catch (err) {
        console.error("Failed to load projects:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const displayItems = dbProjects.length > 0
    ? dbProjects.map(p => ({
        id: p.id,
        title: locale === 'ar' ? p.name_ar || p.name_en : p.name_en,
        location: locale === 'ar' ? p.location_ar || p.location_en || 'دبي، الإمارات' : p.location_en || 'Dubai, UAE',
        price: locale === 'ar' ? 'ابتداءً من 5 مليون درهم' : 'From AED 5M',
        plan: t.projectsPage.offPlan,
        type: p.location_en || 'Dubai',
        image: p.cover_image_path || 'https://images.unsplash.com/photo-1546412414-e1885259563a?q=80&w=1200&auto=format&fit=crop',
        href: `/${locale}/projects/${p.slug}`,
      }))
    : defaultMockProjects.map(p => ({
        ...p,
        href: `/${locale}/projects/${p.slug}`,
      }));

  const filteredProjects = displayItems.filter((p) => {
    const matchesFilter = activeFilter === 'All' || p.type.toLowerCase().includes(activeFilter.toLowerCase()) || p.location.toLowerCase().includes(activeFilter.toLowerCase());
    const matchesSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bg-background min-h-screen text-foreground pt-32 pb-24 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-light tracking-tighter mb-6 text-foreground">
            {t.projectsPage.title.split(" ")[0]} <span className="font-bold text-accent">{t.projectsPage.title.split(" ").slice(1).join(" ")}</span>
          </h1>
          <p className="text-xl text-foreground/60 max-w-2xl font-light">
            {t.projectsPage.subtitle}
          </p>
        </motion.div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-border pb-6">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map(filter => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeFilter === filter.key 
                    ? 'bg-foreground text-background shadow-md' 
                    : 'bg-card text-foreground/70 hover:bg-foreground/10 hover:text-foreground border border-border'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          
          <div className="relative w-full md:w-auto flex items-center gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-foreground/40" size={18} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.projectsPage.searchPlaceholder} 
                className="w-full bg-card border border-border rounded-full ps-12 pe-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent shadow-sm transition-colors"
              />
            </div>
            <button className="p-3 bg-card rounded-full border border-border text-foreground hover:bg-foreground/10 transition-colors shadow-sm">
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* Project Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <PropertyCard 
                  title={project.title}
                  location={project.location}
                  price={project.price}
                  plan={project.plan}
                  image={project.image}
                  href={project.href}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        
        {filteredProjects.length === 0 && (
          <div className="py-24 text-center text-foreground/50">
            {t.projectsPage.noProjects}
          </div>
        )}
      </div>
    </div>
  );
}
