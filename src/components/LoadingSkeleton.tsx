import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-6 w-20 bg-slate-200 rounded-lg" />
        <div className="h-6 w-6 bg-slate-200 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="h-5 w-4/5 bg-slate-200 rounded-md" />
        <div className="h-4 w-full bg-slate-100 rounded-md" />
        <div className="h-4 w-2/3 bg-slate-100 rounded-md" />
      </div>
      <div className="flex gap-2">
        <div className="h-5 w-24 bg-slate-100 rounded-md" />
        <div className="h-5 w-20 bg-slate-100 rounded-md" />
      </div>
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="h-4 w-28 bg-slate-200 rounded-md" />
        <div className="h-4 w-12 bg-slate-100 rounded-md" />
      </div>
    </div>
  );
};

export const GridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
};
