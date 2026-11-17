import React from 'react';
import { Location } from '../types';
import { MapPin, Box, Ship } from 'lucide-react';
import HistoricImage from './HistoricImage';

interface InfoPanelProps {
  location: Location | null;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ location }) => {
  if (!location) return null;

  return (
    <div className="bg-imperial-parchment border-2 border-imperial-ink/20 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.3)] max-w-sm w-full animate-fadeIn text-imperial-ink relative overflow-hidden">
      <div className="absolute inset-0 bg-imperial-gold/5 pointer-events-none"></div>

      <HistoricImage
        src={location.image}
        alt={location.imageAlt}
        className="relative w-full h-32 object-cover border-b border-imperial-ink/10"
      />

      <div className="relative p-4">
        <div className="flex items-center gap-2 mb-3 border-b border-imperial-ink/20 pb-2">
          <MapPin className="text-imperial-red" size={20} />
          <h3 className="text-xl font-serif font-bold text-imperial-ink">{location.nameCn}</h3>
        </div>

        <div className="relative mb-4">
          <span className="text-xs uppercase text-imperial-ink/60 font-bold block mb-1">船上會看見的東西</span>
          <div className="flex gap-2 flex-wrap">
            {location.tradeGoods.map(good => (
              <span key={good} className="px-2 py-1 bg-white/50 border border-imperial-ink/20 rounded text-xs text-imperial-ink font-serif flex items-center gap-1 shadow-sm">
                <Box size={12} className="text-imperial-gold" /> {good}
              </span>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Ship size={16} className="text-imperial-gold" />
            <h4 className="text-sm font-bold text-imperial-ink">史官考證</h4>
          </div>
          <p className="text-sm text-imperial-ink/80 leading-relaxed font-serif bg-white/30 p-2 rounded">
            {location.blurb || location.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;
