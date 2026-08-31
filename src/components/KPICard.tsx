import React from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
}

export function KPICard({ title, value, subtitle, trend, trendValue, icon }: KPICardProps) {
  return (
    <div className="glass-card p-6 flex flex-col justify-between">
      <div className="flex items-start justify-between pb-2">
        <h3 className="text-sm font-medium text-slate-400">{title}</h3>
        {icon && <div className="text-slate-500">{icon}</div>}
      </div>
      <div className="flex flex-col gap-1">
        <div className="text-3xl font-bold text-white tracking-tight">{value}</div>
        {(subtitle || trendValue) && (
          <div className="flex items-center gap-2 text-sm mt-1">
            {trendValue && (
              <span 
                className={`font-medium ${
                  trend === 'up' ? 'text-emerald-500' : 
                  trend === 'down' ? 'text-destructive' : 'text-slate-400'
                }`}
              >
                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''} {trendValue}
              </span>
            )}
            {subtitle && <span className="text-slate-500">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
