import React, { useEffect, useRef, useState, useMemo } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import { Location, Route } from '../types';

interface GlobeVizProps {
  locations: Location[];
  routes: Route[];
  activeLocationId?: string; // Focus on this location if provided
}

const GlobeViz: React.FC<GlobeVizProps> = ({ locations, routes, activeLocationId }) => {
  const globeEl = useRef<GlobeMethods | undefined>(undefined);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update camera when activeLocationId changes
  useEffect(() => {
    if (activeLocationId && globeEl.current) {
        const loc = locations.find(l => l.id === activeLocationId);
        if (loc) {
            globeEl.current.pointOfView({ lat: loc.lat, lng: loc.lng, altitude: 2.0 }, 2000);
        }
    }
  }, [activeLocationId, locations]);

  // Initial camera position
  useEffect(() => {
    if (globeEl.current && !activeLocationId) {
      globeEl.current.pointOfView({ lat: 15, lng: 100, altitude: 2.5 }, 1000);
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.5;
    } else if (globeEl.current && activeLocationId) {
       globeEl.current.controls().autoRotate = false;
    }
  }, []);

  // Construct arc data
  const arcsData = useMemo(() => {
    return routes.map(route => {
      const startLoc = locations.find(l => l.id === route.start);
      const endLoc = locations.find(l => l.id === route.end);
      if (!startLoc || !endLoc) return null;

      return {
        startLat: startLoc.lat,
        startLng: startLoc.lng,
        endLat: endLoc.lat,
        endLng: endLoc.lng,
        color: ['#C5A059', '#8B1E1E'], // Gold to Red
      };
    }).filter(Boolean);
  }, [routes, locations]);

  return (
    <div className="absolute inset-0 z-0 cursor-move">
      <Globe
        ref={globeEl}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgba(0,0,0,0)" // Transparent to let body gradient show
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg" // Brighter, bluer earth
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        
        // Use HTML Elements for Labels to support Chinese characters properly
        htmlElementsData={locations}
        htmlElement={(d: any) => {
          const el = document.createElement('div');
          const isSelected = d.id === activeLocationId;
          el.innerHTML = `
            <div style="
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              transform: translate(-50%, -50%);
              cursor: pointer;
            ">
              <div style="
                font-family: 'Noto Serif TC', serif; 
                color: ${isSelected ? '#FFD700' : '#F0E6D2'}; 
                font-weight: bold; 
                font-size: ${isSelected ? '18px' : '14px'};
                text-shadow: 2px 2px 4px #000;
                white-space: nowrap;
                margin-bottom: 4px;
              ">${d.nameCn}</div>
              <div style="
                width: ${isSelected ? '12px' : '8px'}; 
                height: ${isSelected ? '12px' : '8px'}; 
                background: ${isSelected ? '#FF4444' : '#C5A059'}; 
                border-radius: 50%; 
                border: 2px solid white;
                box-shadow: 0 0 10px ${isSelected ? '#FF4444' : 'black'};
              "></div>
            </div>
          `;
          return el;
        }}
        
        // Routes
        arcsData={arcsData || []}
        arcColor="color"
        arcDashLength={0.4}
        arcDashGap={0.2}
        arcDashAnimateTime={2000}
        arcStroke={0.8}
        
        // Atmosphere
        atmosphereColor="#3a7bd5"
        atmosphereAltitude={0.15}
      />
    </div>
  );
};

export default GlobeViz;