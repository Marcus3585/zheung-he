import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import * as THREE from 'three';
import { Location, Route } from '../types';
import { createTreasureShip, fitLoadedShip } from './treasureShip';

interface GlobeVizProps {
  locations: Location[];
  routes: Route[];
  activeLocationId?: string;
}

/**
 * Leave empty to use the built-in procedural 寶船.
 * A later GLB can be dropped in public/models/ and referenced here, e.g.
 * '/models/treasure-ship.glb'. The loader is imported from the `three` package
 * only when this string is set.
 */
const SHIP_MODEL_URL = '';

const EARTH_DAY = '/textures/earth-blue-marble.jpg';
const EARTH_BUMP = '/textures/earth-topology.png';

const GlobeViz: React.FC<GlobeVizProps> = ({ locations, routes, activeLocationId }) => {
  const globeEl = useRef<GlobeMethods | undefined>(undefined);
  const readyRef = useRef(false);
  const labelEls = useRef<Map<string, HTMLDivElement>>(new Map());
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [loadedModel, setLoadedModel] = useState<THREE.Group | null>(null);

  useEffect(() => {
    if (!SHIP_MODEL_URL) return;
    let cancelled = false;

    (async () => {
      try {
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
        const loader = new GLTFLoader();
        loader.load(
          SHIP_MODEL_URL,
          (gltf) => {
            if (cancelled) return;
            try {
              setLoadedModel(fitLoadedShip(gltf.scene));
            } catch (error) {
              console.error('外部船模未能擺正，繼續用內建寶船。', error);
            }
          },
          undefined,
          (error) => {
            console.error('外部船模讀取失敗，繼續用內建寶船。', error);
          },
        );
      } catch (error) {
        console.error('GLTFLoader 未能載入，繼續用內建寶船。', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const focusCamera = useCallback(() => {
    const globe = globeEl.current;
    if (!globe || !readyRef.current) return;

    try {
      const controls = globe.controls?.();
      if (controls) controls.autoRotate = false;
    } catch (error) {
      console.warn('羅盤控制暫時碰不到。', error);
    }

    try {
      if (activeLocationId) {
        const loc = locations.find((item) => item.id === activeLocationId);
        if (!loc || !Number.isFinite(loc.lat) || !Number.isFinite(loc.lng)) return;
        globe.pointOfView({ lat: loc.lat, lng: loc.lng, altitude: 1.55 }, 1400);
      } else {
        globe.pointOfView({ lat: 12, lng: 105, altitude: 2.35 }, 900);
      }
    } catch (error) {
      console.warn('鏡頭沒有挪動。', error);
    }
  }, [activeLocationId, locations]);

  useEffect(() => {
    focusCamera();
  }, [focusCamera]);

  const arcsData = useMemo(() => {
    return routes.map((route) => {
      const startLoc = locations.find((item) => item.id === route.start);
      const endLoc = locations.find((item) => item.id === route.end);
      if (!startLoc || !endLoc) return null;
      return {
        startLat: startLoc.lat,
        startLng: startLoc.lng,
        endLat: endLoc.lat,
        endLng: endLoc.lng,
        color: ['#C5A059', '#8B1E1E'],
      };
    }).filter((arc) => arc !== null);
  }, [routes, locations]);

  const shipData = useMemo(() => {
    if (!activeLocationId) return [];
    const loc = locations.find((item) => item.id === activeLocationId);
    return loc ? [loc] : [];
  }, [activeLocationId, locations]);

  const labelData = useMemo(() => {
    // Chinese names only. Spreading the whole location also passed `name`
    // ("Nanjing", "Champa"), which the globe drew under the Chinese label
    // and then clipped to fragments such as "mpa".
    return locations.map((loc) => ({
      id: loc.id,
      lat: loc.lat,
      lng: loc.lng,
      nameCn: loc.nameCn,
      selected: loc.id === activeLocationId,
    }));
  }, [locations, activeLocationId]);

  const shipObject = useCallback(() => {
    try {
      if (loadedModel) {
        const clone = loadedModel.clone(true);
        return clone;
      }
      return createTreasureShip();
    } catch (error) {
      console.error(error);
      const fallback = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.4, 6),
        new THREE.MeshLambertMaterial({ color: 0x3e2723 }),
      );
      fallback.position.y = 0.3;
      return fallback;
    }
  }, [loadedModel]);

  const htmlElement = useCallback((d: object) => {
    const loc = d as { id?: string; nameCn?: string; selected?: boolean };
    // CSS2DRenderer pins this outer node with its own transform and clips
    // anything that sticks out of the viewport (overflow: hidden). A zero-size
    // anchor keeps that pin on the port; the inner label can grow rightward
    // when the port sits on the left limb, so 「木骨都束」 is not cut in half.
    const anchor = document.createElement('div');
    anchor.style.width = '0';
    anchor.style.height = '0';
    anchor.style.overflow = 'visible';
    anchor.style.pointerEvents = 'none';

    const wrap = document.createElement('div');
    wrap.style.position = 'absolute';
    wrap.style.left = '0';
    wrap.style.top = '0';
    wrap.style.display = 'flex';
    wrap.style.flexDirection = 'column';
    wrap.style.alignItems = 'center';
    wrap.style.transform = 'translate(-50%, -120%)';
    wrap.style.pointerEvents = 'none';
    wrap.style.overflow = 'visible';

    const name = document.createElement('div');
    name.textContent = loc.nameCn ?? '';
    name.style.fontFamily = '"Noto Serif TC", "Songti TC", serif';
    name.style.color = loc.selected ? '#FFD700' : '#F0E6D2';
    name.style.fontWeight = '700';
    name.style.fontSize = loc.selected ? '18px' : '14px';
    name.style.textShadow = '0 2px 4px #000';
    name.style.whiteSpace = 'nowrap';
    name.style.overflow = 'visible';
    name.style.maxWidth = 'none';
    name.style.lineHeight = '1.2';
    name.style.marginBottom = '4px';

    const dot = document.createElement('div');
    const dotSize = loc.selected ? '12px' : '8px';
    dot.style.width = dotSize;
    dot.style.height = dotSize;
    dot.style.borderRadius = '50%';
    dot.style.background = loc.selected ? '#FF4444' : '#C5A059';
    dot.style.border = '2px solid white';
    dot.style.boxShadow = loc.selected ? '0 0 10px #FF4444' : '0 0 6px #000';

    wrap.appendChild(name);
    wrap.appendChild(dot);
    anchor.appendChild(wrap);
    if (loc.id) labelEls.current.set(loc.id, wrap);
    return anchor;
  }, []);

  useEffect(() => {
    let frame = 0;
    const placeLabels = () => {
      const globe = globeEl.current;
      if (globe && readyRef.current) {
        const width = window.innerWidth;
        for (const loc of locations) {
          const wrap = labelEls.current.get(loc.id);
          if (!wrap) continue;
          let x = width / 2;
          try {
            const point = globe.getScreenCoords(loc.lat, loc.lng, 0.02);
            if (point && Number.isFinite(point.x)) x = point.x;
          } catch {
            // The globe is still spinning up. Leave the label centered.
          }
          if (x < 170) {
            wrap.style.transform = 'translate(0, -120%)';
            wrap.style.alignItems = 'flex-start';
          } else if (x > width - 220) {
            wrap.style.transform = 'translate(-100%, -120%)';
            wrap.style.alignItems = 'flex-end';
          } else {
            wrap.style.transform = 'translate(-50%, -120%)';
            wrap.style.alignItems = 'center';
          }
        }
      }
      frame = requestAnimationFrame(placeLabels);
    };
    frame = requestAnimationFrame(placeLabels);
    return () => cancelAnimationFrame(frame);
  }, [locations]);

  return (
    <div className="absolute inset-0 z-0 cursor-move">
      <Globe
        ref={globeEl}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl={EARTH_DAY}
        bumpImageUrl={EARTH_BUMP}
        rendererConfig={{ antialias: true, alpha: true, failIfMajorPerformanceCaveat: false }}
        onGlobeReady={() => {
          readyRef.current = true;
          focusCamera();
        }}
        objectsData={shipData}
        objectLat="lat"
        objectLng="lng"
        objectAltitude={0.02}
        objectFacesSurface={true}
        objectThreeObject={shipObject}
        labelsData={[]}
        pointsData={[]}
        htmlElementsData={labelData}
        htmlLat="lat"
        htmlLng="lng"
        htmlAltitude={0.02}
        htmlElement={htmlElement}
        arcsData={arcsData}
        arcColor="color"
        arcDashLength={0.5}
        arcDashGap={0.2}
        arcDashAnimateTime={1500}
        arcStroke={1.2}
        arcAltitude={0.18}
        atmosphereColor="#3a7bd5"
        atmosphereAltitude={0.15}
      />
    </div>
  );
};

export default GlobeViz;
