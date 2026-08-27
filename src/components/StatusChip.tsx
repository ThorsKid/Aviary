import React from 'react';
import { StatusTone } from '../types';

interface StatusChipProps {
  label: string;
  tone?: StatusTone;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({
  label,
  tone = 'neutral',
  size = 'md',
  className = '',
}) => {
  const getColors = () => {
    switch (tone) {
      case 'good':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'warn':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'bad':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'neutral':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'dim':
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center font-mono font-medium rounded border tracking-wide uppercase ${getColors()} ${sizeClasses} ${className}`}
    >
      {label}
    </span>
  );
};
