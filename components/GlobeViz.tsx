import React, { useEffect, useRef, useState, useMemo } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import * as THREE from 'three';
// @ts-ignore
import { GLTFLoader } from 'https://esm.sh/three@0.170.0/examples/jsm/loaders/GLTFLoader?external=three';
import { Location, Route } from '../types';

interface GlobeVizProps {
  locations: Location[];
  routes: Route[];
  activeLocationId?: string; // Focus on this location if provided
}

// --- CONFIGURATION ---
// 替換此處的 URL 為您的 .glb 或 .gltf 模型網址
// Replace this URL with your own .glb/.gltf model URL
const SHIP_MODEL_URL = ''; 
const SHIP_SCALE = 3; // 根據您的模型大小調整縮放 Adjust scale based on your model

// Helper to create the fallback 3D ship mesh (Procedural)
const createFallbackShipMesh = () => {
  const shipGroup = new THREE.Group();
  
  // Materials
  const woodDark = new THREE.MeshLambertMaterial({ color: 0x3E2723 });
  const woodLight = new THREE.MeshLambertMaterial({ color: 0x5D4037 });
  const sailRed = new THREE.MeshLambertMaterial({ color: 0x8B1E1E, side: THREE.DoubleSide });

  // Hull
  const hullGeo = new THREE.BoxGeometry(1.2, 0.6, 3);
  const hull = new THREE.Mesh(hullGeo, woodLight);
  hull.position.y = 0.3;
  shipGroup.add(hull);

  // Deck cabin (Stern)
  const cabinGeo = new THREE.BoxGeometry(1.0, 0.6, 0.8);
  const cabin = new THREE.Mesh(cabinGeo, woodDark);
  cabin.position.set(0, 0.8, -0.9);
  shipGroup.add(cabin);

  // Masts
  const mastGeo = new THREE.CylinderGeometry(0.08, 0.08, 4, 8);
  
  const mainMast = new THREE.Mesh(mastGeo, woodDark);
  mainMast.position.set(0, 2, 0);
  shipGroup.add(mainMast);

  const foreMast = new THREE.Mesh(mastGeo, woodDark);
  foreMast.scale.set(0.8, 0.8, 0.8);
  foreMast.position.set(0, 1.6, 1.0);
  shipGroup.add(foreMast);

  const aftMast = new THREE.Mesh(mastGeo, woodDark);
  aftMast.scale.set(0.7, 0.7, 0.7);
  aftMast.position.set(0, 1.4, -0.8);
  shipGroup.add(aftMast);

  // Sails (Rectangular, typical of junk ships)
  const sailGeo = new THREE.BoxGeometry(2, 2.5, 0.05);
  
  const mainSail = new THREE.Mesh(sailGeo, sailRed);
  mainSail.position.set(0, 2.2, 0.15);
  shipGroup.add(mainSail);

  const foreSail = new THREE.Mesh(sailGeo, sailRed);
  foreSail.scale.set(0.7, 0.7, 1);
  foreSail.position.set(0, 1.8, 1.15);
  shipGroup.add(foreSail);

  // Scale fitting for globe
  shipGroup.scale.set(3, 3, 3);
  
  return shipGroup;
};

const GlobeViz: React.FC<GlobeVizProps> = ({ locations, routes, activeLocationId }) => {
  const globeEl = useRef<GlobeMethods | undefined>(undefined);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [loadedModel, setLoadedModel] = useState<THREE.Group | null>(null);

  // Load 3D Model
  useEffect(() => {
    if (SHIP_MODEL_URL) {
      const loader = new GLTFLoader();
      loader.load(
        SHIP_MODEL_URL,
        (gltf: any) => {
          const scene = gltf.scene;
          // Normalize scale if needed, though we set it in objectThreeObject
          console.log("3D Model Loaded Successfully");
          setLoadedModel(scene);
        },
        undefined,
        (error: any) => {
          console.error("Error loading 3D model:", error);
        }
      );
    }
  }, []);

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

  // Initial camera position & Disable Auto Rotation
  useEffect(() => {
    if (globeEl.current) {
      if (!activeLocationId) {
        globeEl.current.pointOfView({ lat: 15, lng: 100, altitude: 2.5 }, 1000);
      }
      globeEl.current.controls().autoRotate = false;
      globeEl.current.controls().autoRotateSpeed = 0.5;
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

  // Ship object data: Only exists if there is an active location
  const shipData = useMemo(() => {
      if (!activeLocationId) return [];
      const loc = locations.find(l => l.id === activeLocationId);
      return loc ? [loc] : [];
  }, [activeLocationId, locations]);

  return (
    <div className="absolute inset-0 z-0 cursor-move">
      <Globe
        ref={globeEl}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgba(0,0,0,0)" // Transparent to let body gradient show
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg" // Brighter, bluer earth
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        
        // 3D Objects (The Ship)
        objectsData={shipData}
        objectLat="lat"
        objectLng="lng"
        objectAltitude={0.01} // Slightly above surface
        objectThreeObject={() => {
            if (loadedModel) {
                const clone = loadedModel.clone();
                clone.scale.set(SHIP_SCALE, SHIP_SCALE, SHIP_SCALE);
                // Optional: Adjust rotation if your model is facing the wrong way
                // clone.rotation.y = Math.PI; 
                return clone;
            }
            return createFallbackShipMesh();
        }}
        
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
        
        // Routes Animation
        arcsData={arcsData || []}
        arcColor="color"
        arcDashLength={0.5} // Length of the dashed line segments
        arcDashGap={0.2}    // Gap between dashed segments
        arcDashAnimateTime={1500} // Time to cycle the animation (ms)
        arcStroke={1.5}     // Thickness of the arc
        arcAltitude={0.2}   // Height of the arc
        
        // Atmosphere
        atmosphereColor="#3a7bd5"
        atmosphereAltitude={0.15}
      />
    </div>
  );
};

export default GlobeViz;