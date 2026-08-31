"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';

export default function NewProjectPage() {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">New Project</h1>
            <p className="text-sm text-neutral-400">Create a new development project</p>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-neutral-200 transition-colors">
          <Save size={18} />
          Save Project
        </button>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-neutral-300">Project Title</label>
            <input type="text" className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-neutral-600 focus:outline-none" placeholder="e.g., The Sapphire" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">Location</label>
            <input type="text" className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-neutral-600 focus:outline-none" placeholder="e.g., Dubai Marina" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">Total Units</label>
            <input type="number" className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-neutral-600 focus:outline-none" placeholder="0" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-neutral-300">Description</label>
            <textarea rows={4} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-neutral-600 focus:outline-none" placeholder="Describe the project..." />
          </div>
        </div>
      </div>
    </div>
  );
}
