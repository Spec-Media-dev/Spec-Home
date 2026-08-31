"use client";
import React from 'react';
import { MoreHorizontal, Search, ChevronLeft, ChevronRight, Edit, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  title: string;
  description?: string;
  columns: Column[];
  data: any[];
  onAddClick?: () => void;
  addActionLabel?: string;
  viewRoute?: (row: any) => string;
  editRoute?: (row: any) => string;
}

export default function DataTable({ 
  title, 
  description, 
  columns, 
  data, 
  onAddClick, 
  addActionLabel,
  viewRoute,
  editRoute
}: DataTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">{title}</h2>
          {description && <p className="text-sm text-foreground/70">{description}</p>}
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50" size={16} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600 transition-all"
            />
          </div>
          {onAddClick && addActionLabel && (
            <button 
              onClick={onAddClick}
              className="bg-foreground text-background font-medium text-sm px-4 py-2 rounded-lg hover:opacity-80 transition-colors whitespace-nowrap"
            >
              {addActionLabel}
            </button>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground/70">
            <thead className="bg-background/50 text-xs uppercase font-medium text-foreground/50 border-b border-border">
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className="px-6 py-4">{col.label}</th>
                ))}
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((row, i) => (
                <tr key={i} className="hover:bg-foreground/5 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4 whitespace-nowrap text-foreground/80">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-3 text-foreground/50">
                      {viewRoute && (
                        <Link href={viewRoute(row)} className="hover:text-foreground transition-colors" title="View">
                          <Eye size={16} />
                        </Link>
                      )}
                      {editRoute && (
                        <Link href={editRoute(row)} className="hover:text-foreground transition-colors" title="Edit">
                          <Edit size={16} />
                        </Link>
                      )}
                      <button className="hover:text-red-400 transition-colors" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {data.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-foreground/50">
                    No data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        {data.length > 0 && (
          <div className="border-t border-border px-6 py-4 flex items-center justify-between text-sm">
            <div className="text-foreground/50">
              Showing <span className="font-medium text-foreground">1</span> to <span className="font-medium text-foreground">{data.length}</span> of <span className="font-medium text-foreground">{data.length}</span> results
            </div>
            <div className="flex gap-1">
              <button className="p-1 rounded hover:bg-foreground/10 text-foreground/50 disabled:opacity-50"><ChevronLeft size={18} /></button>
              <button className="p-1 rounded hover:bg-foreground/10 text-foreground/50 disabled:opacity-50"><ChevronRight size={18} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

