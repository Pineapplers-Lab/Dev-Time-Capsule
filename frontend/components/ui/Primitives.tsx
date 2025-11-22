import React from 'react';

export const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${className}`}>
    {children}
  </div>
);

export const Badge = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'default' | 'outline' | 'blue' | 'red' | 'yellow' }) => {
  const styles: any = {
    default: "bg-slate-100 text-slate-700",
    outline: "border border-slate-200 text-slate-600",
    blue: "bg-blue-50 text-blue-600 border border-blue-100",
    red: "bg-red-50 text-red-600 border border-red-100",
    yellow: "bg-amber-50 text-amber-600 border border-amber-100"
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
};