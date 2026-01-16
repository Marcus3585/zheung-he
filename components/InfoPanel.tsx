import React, { useEffect, useState } from 'react';
import { Location } from '../types.ts';
import { Ship, MapPin, Box, Loader2 } from 'lucide-react';
import { getLocationDetails } from '../services/gemini.ts';

interface InfoPanelProps {
  location: Location | null;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ location }) => {
  const [aiContent, setAiContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location) {
      setLoading(true);
      setAiContent('');
      getLocationDetails(location).then(text => {
        setAiContent(text);
        setLoading(false);
      });
    }
  }, [location]);

  if (!location) return null;

  return (
    <div className="bg-imperial-parchment border-2 border-imperial-ink/20 rounded-lg p-4 shadow-[0_4px_20px_rgba(0,0,0,0.3)] max-w-sm w-full animate-fadeIn text-imperial-ink relative overflow-hidden">
      {/* Texture overlay effect */}
      <div className="absolute inset-0 bg-imperial-gold/5 pointer-events-none"></div>

      <div className="relative flex items-center gap-2 mb-3 border-b border-imperial-ink/20 pb-2">
        <MapPin className="text-imperial-red" size={20} />
        <h3 className="text-xl font-serif font-bold text-imperial-ink">{location.nameCn}</h3>
      </div>

      <div className="relative mb-4">
        <span className="text-xs uppercase text-imperial-ink/60 font-bold block mb-1">特產</span>
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
        
        {loading ? (
          <div className="flex items-center gap-2 text-imperial-ink/50 text-sm h-20">
             <Loader2 size={14} className="animate-spin" /> 查詢檔案中...
          </div>
        ) : (
          <p className="text-sm text-imperial-ink/80 leading-relaxed font-serif bg-white/30 p-2 rounded">
            {aiContent}
          </p>
        )}
      </div>
    </div>
  );
};

export default InfoPanel;