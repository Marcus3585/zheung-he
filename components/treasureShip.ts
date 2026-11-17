import * as THREE from 'three';

/**
 * Procedural Ming treasure ship (寶船), Fuchuan-informed:
 * wide flat bottom, high stern castle, lower rising bow,
 * five masts, rectangular battened junk sails in cinnabar and ochre.
 * Built in local space with +Y up and the bow toward +Z, so it sits
 * on the globe (three-globe points object +Y away from the earth's centre).
 *
 * The camera first looks straight down, so sails lean a little. Their
 * colour still reads in plan, and the profile reads when the globe is turned.
 */

const LACQUER = 0x2a1812;
const PLANK = 0x4a3024;
const CASTLE = 0x1c120e;
const CINNABAR = 0x8b1e1e;
const OCHRE = 0xc4a35a;
const BAMBOO = 0xd2c09a;
const GOLD = 0xc5a059;
const EYE = 0xf4f0e6;
const PUPIL = 0x16100c;

interface Station {
  z: number;
  bottom: number;
  beam: number;
  keel: number;
  deck: number;
}

const STATIONS: Station[] = [
  { z: -5.2, bottom: 0.62, beam: 1.02, keel: 0.2, deck: 1.42 },
  { z: -4.15, bottom: 1.12, beam: 1.52, keel: 0.05, deck: 1.18 },
  { z: -2.3, bottom: 1.4, beam: 1.86, keel: 0.02, deck: 1.02 },
  { z: 0.15, bottom: 1.5, beam: 2.02, keel: 0.0, deck: 0.96 },
  { z: 2.05, bottom: 1.28, beam: 1.7, keel: 0.03, deck: 1.04 },
  { z: 3.45, bottom: 0.78, beam: 1.12, keel: 0.16, deck: 1.28 },
  { z: 4.75, bottom: 0.16, beam: 0.28, keel: 0.58, deck: 1.58 },
];

function mat(color: number, emissive = 0x000000): THREE.MeshLambertMaterial {
  return new THREE.MeshLambertMaterial({
    color,
    emissive,
    emissiveIntensity: emissive ? 0.35 : 0,
    side: THREE.DoubleSide,
  });
}

function addMesh(
  parent: THREE.Object3D,
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  x: number,
  y: number,
  z: number,
  rot?: [number, number, number],
): THREE.Mesh {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  if (rot) mesh.rotation.set(rot[0], rot[1], rot[2]);
  parent.add(mesh);
  return mesh;
}

function buildHull(material: THREE.Material): THREE.Mesh {
  const positions: number[] = [];
  const indices: number[] = [];

  const ringStarts: number[] = [];
  for (const station of STATIONS) {
    ringStarts.push(positions.length / 3);
    const bilgeX = station.bottom + (station.beam - station.bottom) * 0.6;
    const bilgeY = station.keel + (station.deck - station.keel) * 0.3;
    const beamY = station.keel + (station.deck - station.keel) * 0.62;
    const pts: [number, number][] = [
      [0, station.keel],
      [station.bottom, station.keel + 0.015],
      [bilgeX, bilgeY],
      [station.beam, beamY],
      [station.beam * 0.9, station.deck],
      [0, station.deck],
    ];
    for (const [x, y] of pts) positions.push(x, y, station.z);
    for (let i = pts.length - 2; i >= 1; i--) positions.push(-pts[i][0], pts[i][1], station.z);
  }

  const ringSize = 10;
  const quad = (a: number, b: number, c: number, d: number) => {
    indices.push(a, b, c, a, c, d);
  };

  for (let s = 0; s < ringStarts.length - 1; s++) {
    const a = ringStarts[s];
    const b = ringStarts[s + 1];
    for (let i = 0; i < ringSize; i++) {
      const n = (i + 1) % ringSize;
      quad(a + i, b + i, b + n, a + n);
    }
  }

  const cap = (ring: number, zBias: number) => {
    const centre = positions.length / 3;
    let cx = 0;
    let cy = 0;
    let cz = 0;
    for (let i = 0; i < ringSize; i++) {
      cx += positions[(ring + i) * 3];
      cy += positions[(ring + i) * 3 + 1];
      cz += positions[(ring + i) * 3 + 2];
    }
    positions.push(cx / ringSize, cy / ringSize, cz / ringSize + zBias);
    for (let i = 0; i < ringSize; i++) {
      const n = (i + 1) % ringSize;
      if (zBias < 0) indices.push(centre, ring + n, ring + i);
      else indices.push(centre, ring + i, ring + n);
    }
  };
  cap(ringStarts[0], -0.04);
  cap(ringStarts[ringStarts.length - 1], 0.05);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const normal = geometry.attributes.normal;
  const position = geometry.attributes.position;
  let sample = 0;
  let maxX = -Infinity;
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    if (x > maxX) {
      maxX = x;
      sample = i;
    }
  }
  if (normal.getX(sample) < 0) {
    const index = geometry.getIndex();
    if (index) {
      for (let i = 0; i < index.count; i += 3) {
        const tmp = index.getX(i);
        index.setX(i, index.getX(i + 2));
        index.setX(i + 2, tmp);
      }
    }
    geometry.computeVertexNormals();
  }

  return new THREE.Mesh(geometry, material);
}

function addJunkSail(
  parent: THREE.Object3D,
  opts: { y: number; z: number; width: number; height: number; color: number; battens: number; lean: number },
): void {
  const cloth = mat(opts.color, opts.color);
  cloth.emissiveIntensity = 0.12;
  const bamboo = mat(BAMBOO, 0x6a5840);
  const group = new THREE.Group();
  const panelH = opts.height / opts.battens;

  for (let i = 0; i < opts.battens; i++) {
    const t = opts.battens === 1 ? 0 : i / (opts.battens - 1);
    const billow = Math.sin(t * Math.PI) * 0.12;
    const y = -opts.height / 2 + panelH * (i + 0.5);
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.08, panelH * 0.78, opts.width * (0.96 - t * 0.06)), cloth);
    panel.position.set(billow, y, 0);
    group.add(panel);

    const batten = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.045, opts.width * 1.06), bamboo);
    batten.position.set(billow, -opts.height / 2 + panelH * i, 0);
    group.add(batten);
  }

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.045, opts.width * 1.02), bamboo);
  head.position.set(0, opts.height / 2, 0);
  group.add(head);

  group.position.set(0, opts.y, opts.z);
  group.rotation.z = opts.lean;
  parent.add(group);
}

function addSternCastle(parent: THREE.Object3D, wood: THREE.Material, gold: THREE.Material): void {
  const tiers = [
    { w: 1.85, h: 0.48, d: 1.55, y: 1.62, z: -4.25 },
    { w: 1.55, h: 0.42, d: 1.25, y: 2.05, z: -4.4 },
    { w: 1.15, h: 0.36, d: 0.95, y: 2.42, z: -4.52 },
  ];
  tiers.forEach((tier, index) => {
    addMesh(parent, new THREE.BoxGeometry(tier.w, tier.h, tier.d), wood, 0, tier.y, tier.z);
    addMesh(parent, new THREE.BoxGeometry(tier.w + 0.08, 0.05, tier.d + 0.08), gold, 0, tier.y + tier.h / 2, tier.z);
    if (index < 2) {
      const windowMat = mat(0x0e1a24, 0x123044);
      for (const side of [-1, 1]) {
        addMesh(
          parent,
          new THREE.BoxGeometry(0.06, 0.14, 0.18),
          windowMat,
          side * (tier.w / 2 + 0.01),
          tier.y,
          tier.z,
        );
      }
    }
  });
}

function addBowDetail(parent: THREE.Object3D, gold: THREE.Material, wood: THREE.Material): void {
  addMesh(parent, new THREE.BoxGeometry(0.22, 0.18, 0.55), gold, 0, 1.62, 4.95, [0.4, 0, 0]);
  addMesh(parent, new THREE.BoxGeometry(0.12, 0.1, 0.28), wood, 0, 1.74, 5.22, [0.7, 0, 0]);
  addMesh(parent, new THREE.ConeGeometry(0.05, 0.22, 5), gold, 0, 1.88, 5.05, [0, 0, 0.4]);

  const white = mat(EYE);
  const pupil = mat(PUPIL);
  for (const side of [-1, 1]) {
    addMesh(parent, new THREE.CircleGeometry(0.11, 14), white, side * 0.42, 1.22, 3.95, [0, side * Math.PI / 2, 0]);
    addMesh(parent, new THREE.CircleGeometry(0.045, 10), pupil, side * 0.47, 1.22, 4.0, [0, side * Math.PI / 2, 0]);
  }
}

function addRudder(parent: THREE.Object3D, wood: THREE.Material): void {
  addMesh(parent, new THREE.BoxGeometry(0.08, 1.15, 0.42), wood, 0, 0.55, -5.45);
  addMesh(parent, new THREE.CylinderGeometry(0.04, 0.04, 1.5, 6), wood, 0, 1.15, -5.35);
}

export function createTreasureShip(): THREE.Group {
  const ship = new THREE.Group();
  ship.name = 'ming-treasure-ship';

  const hullMat = mat(LACQUER, 0x140c08);
  const plank = mat(PLANK, 0x1a100c);
  const castle = mat(CASTLE, 0x100a08);
  const gold = mat(GOLD, 0x5c4014);
  const mastMat = mat(0x3a2418, 0x1a100c);

  try {
    const hull = buildHull(hullMat);
    ship.add(hull);
    // A flattened copy of the hull reads as a ship when the camera looks straight down.
    const plan = new THREE.Mesh(hull.geometry.clone(), mat(0xd7b56a, 0x8a5a20));
    plan.scale.set(1.15, 0.035, 1.12);
    plan.position.y = 1.32;
    ship.add(plan);
    addSternCastle(ship, castle, gold);
    addRudder(ship, castle);
    addBowDetail(ship, gold, plank);

    addMesh(ship, new THREE.BoxGeometry(0.06, 0.12, 6.4), gold, 1.72, 1.08, -0.3);
    addMesh(ship, new THREE.BoxGeometry(0.06, 0.12, 6.4), gold, -1.72, 1.08, -0.3);

    const masts = [
      { z: -3.45, h: 2.5, sailW: 1.35, sailH: 1.7, color: OCHRE, battens: 6, lean: 0.72 },
      { z: -1.45, h: 3.7, sailW: 2.05, sailH: 2.65, color: CINNABAR, battens: 8, lean: 0.78 },
      { z: 0.6, h: 4.5, sailW: 2.35, sailH: 3.25, color: OCHRE, battens: 9, lean: 0.84 },
      { z: 2.4, h: 3.35, sailW: 1.9, sailH: 2.4, color: CINNABAR, battens: 7, lean: 0.76 },
      { z: 3.75, h: 2.25, sailW: 1.2, sailH: 1.5, color: OCHRE, battens: 5, lean: 0.7 },
    ];

    masts.forEach((mast) => {
      addMesh(ship, new THREE.CylinderGeometry(0.04, 0.065, mast.h, 6), mastMat, 0, mast.h / 2 + 0.9, mast.z);
      addJunkSail(ship, {
        y: 1.05 + mast.sailH * 0.55,
        z: mast.z,
        width: mast.sailW,
        height: mast.sailH,
        color: mast.color,
        battens: mast.battens,
        lean: mast.lean,
      });
    });
  } catch (error) {
    console.error('寶船網格組裝失敗，改用簡化船身。', error);
    ship.clear();
    addMesh(ship, new THREE.BoxGeometry(2.2, 0.45, 6.5), hullMat, 0, 0.4, 0);
    addMesh(ship, new THREE.BoxGeometry(1.6, 0.7, 1.4), castle, 0, 0.9, -2.2);
  }

  ship.scale.setScalar(2.7);
  return ship;
}

/** Fit an optional GLB so its keel sits near y = 0 and its length matches the procedural ship. */
export function fitLoadedShip(root: THREE.Object3D): THREE.Group {
  const holder = new THREE.Group();
  holder.name = 'loaded-treasure-ship';
  holder.add(root);

  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  box.getSize(size);
  const longest = Math.max(size.x, size.y, size.z, 0.001);
  root.scale.multiplyScalar(16 / longest);

  const fitted = new THREE.Box3().setFromObject(root);
  root.position.y -= fitted.min.y;
  return holder;
}
