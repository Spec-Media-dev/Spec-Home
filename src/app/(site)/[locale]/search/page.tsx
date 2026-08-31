"use client";
import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search as SearchIcon, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import PropertyCard from '@/components/PropertyCard';
import { searchProperties } from '@/lib/queries/properties';
import type { PropertyRow } from '@/lib/supabase/types';
import { useI18n } from '@/lib/i18n';

export default function SearchPage() {
  const { locale, t, isRTL } = useI18n();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PropertyRow[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const mockResults = [
    {
      id: '1',
      title: locale === 'ar' ? 'ذا سافاير' : 'The Sapphire',
      location: locale === 'ar' ? 'دبي مارينا' : 'Dubai Marina',
      price: locale === 'ar' ? '4.5 مليون درهم' : 'AED 4.5M',
      plan: '50/50',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80',
      slug: 'the-sapphire'
    },
    {
      id: '2',
      title: locale === 'ar' ? 'بالم أواسيس' : 'Palm Oasis',
      location: locale === 'ar' ? 'نخلة جميرا' : 'Palm Jumeirah',
      price: locale === 'ar' ? '12 مليون درهم' : 'AED 12M',
      plan: '60/40',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80',
      slug: 'palm-oasis'
    },
    {
      id: '3',
      title: locale === 'ar' ? 'داون تاون فيوز' : 'Downtown Views',
      location: locale === 'ar' ? 'وسط مدينة دبي' : 'Downtown Dubai',
      price: locale === 'ar' ? '3.2 مليون درهم' : 'AED 3.2M',
      plan: '70/30',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80',
      slug: 'downtown-views'
    },
  ];

  const popularTags = locale === 'ar'
    ? ['نخلة جميرا', 'دبي مارينا', 'وسط المدينة', 'فلل فاخرة']
    : ['Palm Jumeirah', 'Dubai Marina', 'Downtown', 'Villas'];

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setQuery(searchQuery);
    setLoading(true);
    setSearched(true);

    try {
      const data = await searchProperties(searchQuery);
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return locale === 'ar' ? `${(price / 1000000).toFixed(1)} مليون درهم` : `AED ${(price / 1000000).toFixed(1)}M`;
    }
    return locale === 'ar' ? `${price.toLocaleString()} درهم` : `AED ${price.toLocaleString()}`;
  };

  return (
    <div className="bg-background min-h-screen text-foreground pt-32 pb-24 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-light tracking-tighter mb-8 text-foreground"
          >
            {t.searchPage.title.split(" ")[0]} <span className="font-bold text-accent">{t.searchPage.title.split(" ").slice(1).join(" ")}</span>
          </motion.h1>
          
          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
            onSubmit={handleSubmit}
          >
            <SearchIcon className="absolute start-6 top-1/2 -translate-y-1/2 text-foreground/40" size={24} />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchPage.placeholder} 
              className="w-full bg-card border border-border rounded-full ps-16 pe-8 py-6 text-lg text-foreground focus:outline-none focus:border-accent shadow-2xl transition-all"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute end-3 top-1/2 -translate-y-1/2 p-3.5 bg-foreground text-background rounded-full hover:opacity-80 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : isRTL ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
            </button>
          </motion.form>
          
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <span className="text-sm text-foreground/50 mr-2 self-center">{t.searchPage.popular}</span>
            {popularTags.map(tag => (
              <button
                key={tag}
                onClick={() => handleSearch(tag)}
                className="px-4 py-1.5 rounded-full border border-border bg-card text-xs text-foreground/70 hover:text-foreground hover:border-accent transition-colors shadow-sm"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {searched && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-24"
          >
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
              </div>
            ) : results.length > 0 ? (
              <>
                <h2 className="text-xl font-medium mb-8 text-foreground">
                  {results.length} {t.searchPage.resultsCount} &quot;{query}&quot;
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {results.map((property) => (
                    <PropertyCard
                      key={property.id}
                      title={locale === 'ar' ? property.title_ar || property.title_en : property.title_en}
                      location={locale === 'ar' ? property.property_type_ar || property.property_type_en : property.property_type_en}
                      price={formatPrice(property.price)}
                      plan={property.status}
                      image={`https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80`}
                      href={`/${locale}/properties/${property.slug}`}
                    />
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-medium mb-8 text-foreground">{t.searchPage.noResultsFor} &quot;{query}&quot;</h2>
                <p className="text-foreground/60 mb-12">{t.searchPage.tryDifferent}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-80">
                  {mockResults.map((property) => (
                    <PropertyCard
                      key={property.id}
                      title={property.title}
                      location={property.location}
                      price={property.price}
                      plan={property.plan}
                      image={property.image}
                      href={`/${locale}/properties/${property.slug}`}
                    />
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
