import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Abstract Background Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-foreground/[0.02] rounded-full blur-3xl -z-10" />
      
      <div className="text-center max-w-2xl">
        <h1 className="text-[150px] md:text-[200px] font-bold tracking-tighter leading-none mb-4 opacity-10">
          404
        </h1>
        
        <div className="relative -mt-20 md:-mt-32">
          <h2 className="text-3xl md:text-5xl font-light mb-6">
            Page Not <span className="font-bold">Found</span>
          </h2>
          <p className="text-foreground/60 text-lg mb-12 max-w-md mx-auto leading-relaxed">
            The page you are looking for doesn't exist or has been moved. Let's get you back home.
          </p>
          
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-4 rounded-full font-medium hover:opacity-80 transition-opacity"
          >
            <ArrowLeft size={20} />
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
