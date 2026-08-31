"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropertyCard from '@/components/PropertyCard';
import { Search, Filter } from 'lucide-react';
import { getProperties } from '@/lib/queries/properties';
import type { PropertyRow } from '@/lib/supabase/types';
import { useI18n } from '@/lib/i18n';

export default function PropertiesPage() {
  const { locale, t } = useI18n();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dbProperties, setDbProperties] = useState<PropertyRow[]>([]);
  const [loading, setLoading] = useState(true);

  const defaultMockProperties = [
    {
      id: '1',
      title: locale === 'ar' ? 'ذا سافاير' : 'The Sapphire',
      location: locale === 'ar' ? 'دبي مارينا' : 'Dubai Marina',
      price: locale === 'ar' ? '4.5 مليون درهم' : 'AED 4.5M',
      plan: '50/50',
      type: 'Apartment',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80',
      slug: 'the-sapphire'
    },
    {
      id: '2',
      title: locale === 'ar' ? 'بالم أواسيس' : 'Palm Oasis',
      location: locale === 'ar' ? 'نخلة جميرا' : 'Palm Jumeirah',
      price: locale === 'ar' ? '12 مليون درهم' : 'AED 12M',
      plan: '60/40',
      type: 'Villa',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80',
      slug: 'palm-oasis'
    },
    {
      id: '3',
      title: locale === 'ar' ? 'داون تاون فيوز' : 'Downtown Views',
      location: locale === 'ar' ? 'وسط مدينة دبي' : 'Downtown Dubai',
      price: locale === 'ar' ? '3.2 مليون درهم' : 'AED 3.2M',
      plan: '70/30',
      type: 'Apartment',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80',
      slug: 'downtown-views'
    },
    {
      id: '4',
      title: locale === 'ar' ? 'هيلز إستيت' : 'Hills Estate',
      location: locale === 'ar' ? 'دبي هيلز' : 'Dubai Hills',
      price: locale === 'ar' ? '8.5 مليون درهم' : 'AED 8.5M',
      plan: '40/60',
      type: 'Townhouse',
      image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80',
      slug: 'hills-estate'
    },
    {
      id: '5',
      title: locale === 'ar' ? 'خور دبي هاربور' : 'Creek Harbor',
      location: locale === 'ar' ? 'خور دبي' : 'Dubai Creek',
      price: locale === 'ar' ? '2.8 مليون درهم' : 'AED 2.8M',
      plan: '80/20',
      type: 'Apartment',
      image: 'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&q=80',
      slug: 'creek-harbor'
    },
    {
      id: '6',
      title: locale === 'ar' ? 'مارينا كراون' : 'Marina Crown',
      location: locale === 'ar' ? 'دبي مارينا' : 'Dubai Marina',
      price: locale === 'ar' ? '5.1 مليون درهم' : 'AED 5.1M',
      plan: '50/50',
      type: 'Penthouse',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80',
      slug: 'marina-crown'
    },
  ];

  const filterOptions = [
    { key: 'All', label: t.propertiesPage.all },
    { key: 'Apartment', label: t.propertiesPage.apartment },
    { key: 'Villa', label: t.propertiesPage.villa },
    { key: 'Townhouse', label: t.propertiesPage.townhouse },
    { key: 'Penthouse', label: t.propertiesPage.penthouse },
  ];

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getProperties();
        if (data && data.length > 0) {
          setDbProperties(data);
        }
      } catch (err) {
        console.error("Failed to load properties:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return locale === 'ar' ? `${(price / 1000000).toFixed(1)} مليون درهم` : `AED ${(price / 1000000).toFixed(1)}M`;
    }
    return locale === 'ar' ? `${price.toLocaleString()} درهم` : `AED ${price.toLocaleString()}`;
  };

  const getStatusLabel = (status: string) => {
    if (status === 'available') return t.propertiesPage.available;
    if (status === 'reserved') return t.propertiesPage.reserved;
    if (status === 'sold') return t.propertiesPage.sold;
    return status;
  };

  const displayItems = dbProperties.length > 0
    ? dbProperties.map(p => ({
        id: p.id,
        title: locale === 'ar' ? p.title_ar || p.title_en : p.title_en,
        location: locale === 'ar' ? p.property_type_ar || p.property_type_en : p.property_type_en,
        price: formatPrice(p.price),
        plan: getStatusLabel(p.status),
        type: p.property_type_en,
        image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80',
        href: `/${locale}/properties/${p.slug}`,
      }))
    : defaultMockProperties.map(p => ({
        ...p,
        href: `/${locale}/properties/${p.slug}`,
      }));

  const filteredProperties = displayItems.filter((p) => {
    const matchesFilter = activeFilter === 'All' || p.type.toLowerCase().includes(activeFilter.toLowerCase());
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
            {t.propertiesPage.title.split(" ")[0]} <span className="font-bold text-accent">{t.propertiesPage.title.split(" ").slice(1).join(" ")}</span>
          </h1>
          <p className="text-xl text-foreground/60 max-w-2xl font-light">
            {t.propertiesPage.subtitle}
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
                placeholder={t.propertiesPage.searchPlaceholder} 
                className="w-full bg-card border border-border rounded-full ps-12 pe-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent shadow-sm transition-colors"
              />
            </div>
            <button className="p-3 bg-card rounded-full border border-border text-foreground hover:bg-foreground/10 transition-colors shadow-sm">
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* Property Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredProperties.map((property) => (
              <motion.div
                key={property.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <PropertyCard 
                  title={property.title}
                  location={property.location}
                  price={property.price}
                  plan={property.plan}
                  image={property.image}
                  href={property.href}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        
        {filteredProperties.length === 0 && (
          <div className="py-24 text-center text-foreground/50">
            {t.propertiesPage.noResults}
          </div>
        )}
      </div>
    </div>
  );
}
