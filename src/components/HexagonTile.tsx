import React from 'react';
import { Hive, StatusTone } from '../types';

interface HexagonTileProps {
  hive: Hive;
  daysSinceInspection: number;
  onClick?: () => void;
  queenName?: string;
}

const getBorderColor = (tone: StatusTone) => {
  switch (tone) {
    case 'good':
      return '#10B981';
    case 'warn':
      return '#F59E0B';
    case 'bad':
      return '#EF4444';
    case 'neutral':
      return '#3B82F6';
    case 'dim':
    default:
      return '#94A3B8';
  }
};

const getTextColor = (tone: StatusTone) => {
  switch (tone) {
    case 'good':
      return '#059669';
    case 'warn':
      return '#D97706';
    case 'bad':
      return '#DC2626';
    case 'neutral':
      return '#2563EB';
    case 'dim':
    default:
      return '#64748B';
  }
};

export const HexagonTile: React.FC<HexagonTileProps> = ({
  hive,
  daysSinceInspection,
  onClick,
  queenName,
}) => {
  let tone: StatusTone = 'good';
  let badgeText = '';

  const statusNorm = hive.status?.toLowerCase() || '';

  if (statusNorm === 'sold') {
    tone = 'dim';
    badgeText = 'SOLD';
  } else if (statusNorm === 'queenless') {
    tone = 'bad';
    badgeText = 'NO QUEEN';
  } else if (statusNorm === 'undetermined') {
    tone = 'warn';
    badgeText = 'UNDET';
  } else if (daysSinceInspection >= 999999) {
    tone = 'neutral';
    badgeText = 'NEW';
  } else if (daysSinceInspection > 7) {
    tone = 'warn';
    badgeText = `${daysSinceInspection}D`;
  } else {
    tone = 'good';
    badgeText = `${daysSinceInspection}D`;
  }

  const color = getBorderColor(tone);
  const textColor = getTextColor(tone);

  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
      title={`${hive.number} · Status: ${hive.status} · Last inspection: ${
        daysSinceInspection >= 999999 ? 'Never' : `${daysSinceInspection} days ago`
      }${queenName ? ` · Queen: ${queenName}` : ''}`}
    >
      <div className="relative w-16 h-14 flex items-center justify-center filter drop-shadow-xs">
        <svg viewBox="0 0 64 56" className="w-full h-full transform transition-transform group-hover:scale-105">
          <polygon
            points="32,2 60,16 60,42 32,56 4,42 4,16"
            fill="#FFFFFF"
            stroke={color}
            strokeWidth="2.2"
            className="transition-colors duration-200"
          />
        </svg>
        <span
          className="absolute font-mono font-bold text-[10px] tracking-wider pointer-events-none"
          style={{ color: textColor }}
        >
          {badgeText}
        </span>
      </div>
      <span className="mt-1 text-xs font-semibold text-slate-800 group-hover:text-indigo-600 truncate max-w-[84px] text-center transition-colors">
        {hive.number}
      </span>
      {hive.location && (
        <span className="text-[10px] text-slate-500 truncate max-w-[80px] text-center">
          {hive.location.split('-')[0].trim()}
        </span>
      )}
    </button>
  );
};
