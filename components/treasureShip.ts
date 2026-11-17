import * as THREE from 'three';
import { createMingTreasureShip } from './mingTreasureShip';

/**
 * In-scene 寶船. The mesh is the Carbon procedural Group (Fuchuan-style junk),
 * lifted so the keel sits on the globe and scaled to a port marker.
 * +Y stays up, which is what three-globe expects.
 * If that builder throws, a small lacquered hull is used instead.
 */

const GLOBE_SHIP_LENGTH = 20;

function fallbackHull(): THREE.Group {
  const ship = new THREE.Group();
  ship.name = 'ming-treasure-ship-fallback';
  const wood = new THREE.MeshLambertMaterial({ color: 0x2a1812 });
  const sail = new THREE.MeshLambertMaterial({ color: 0x8b1e1e, side: THREE.DoubleSide });
  const hull = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 7), wood);
  hull.position.y = 0.28;
  const castle = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.7, 1.6), wood);
  castle.position.set(0, 0.75, -2.2);
  const cloth = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.2, 1.6), sail);
  cloth.position.set(0, 1.8, 0.4);
  ship.add(hull, castle, cloth);
  return ship;
}

export function createTreasureShip(): THREE.Group {
  try {
    const raw = createMingTreasureShip();
    const holder = new THREE.Group();
    holder.name = 'ming-treasure-ship';
    holder.add(raw);

    const before = new THREE.Box3().setFromObject(raw);
    const size = new THREE.Vector3();
    before.getSize(size);
    const length = Math.max(size.x, 0.001);
    raw.scale.setScalar(GLOBE_SHIP_LENGTH / length);

    const after = new THREE.Box3().setFromObject(raw);
    raw.position.y -= after.min.y;
    return holder;
  } catch (error) {
    console.error('寶船網格組裝失敗，改用簡化船身。', error);
    return fallbackHull();
  }
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
  root.scale.multiplyScalar(GLOBE_SHIP_LENGTH / longest);

  const fitted = new THREE.Box3().setFromObject(root);
  root.position.y -= fitted.min.y;
  return holder;
}
