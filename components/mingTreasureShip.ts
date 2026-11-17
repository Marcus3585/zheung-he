import * as THREE from 'three';

/**
 * Procedural Ming treasure ship ported from the school Gemini 4 Carbon
 * (Enterprise) Canvas viewer. Coordinates: +X bow, -X stern, +Y up, +Z starboard.
 * OrbitControls stay in the standalone viewer only; this module returns a Group.
 */

function createLacqueredWoodTexture(baseHex = '#2a1c15', lineHex = '#160d09') {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 512;
  const ctx = c.getContext('2d');
      if (!ctx) throw new Error('無法繪製船體紋理');
  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 512, 512);

  // 船殼縱向木板接縫與自然木紋色差
  const planks = 18;
  const h = 512 / planks;
  for (let i = 0; i < planks; i++) {
    const shade = (i % 3 === 0 ? 6 : i % 2 === 0 ? -5 : 2);
    ctx.fillStyle = shade > 0 ? 'rgba(255,220,180,0.03)' : 'rgba(0,0,0,0.06)';
    ctx.fillRect(0, i * h, 512, h - 1);
    ctx.fillStyle = lineHex;
    ctx.fillRect(0, Math.floor(i * h), 512, 2);
  }
  // 細微木紋肌理
  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 1;
  for (let k = 0; k < 140; k++) {
    const y = Math.random() * 512;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(170, y + (Math.random() - 0.5) * 6, 340, y + (Math.random() - 0.5) * 6, 512, y);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createDeckPlankTexture() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 512;
  const ctx = c.getContext('2d');
      if (!ctx) throw new Error('無法繪製船體紋理');
  ctx.fillStyle = '#6c5038';
  ctx.fillRect(0, 0, 512, 512);
  const strips = 24;
  const sh = 512 / strips;
  for (let i = 0; i < strips; i++) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,235,205,0.04)' : 'rgba(0,0,0,0.05)';
    ctx.fillRect(0, i * sh, 512, sh);
    ctx.fillStyle = '#3d2b1d';
    ctx.fillRect(0, Math.floor(i * sh), 512, 1.5);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createWeatheredSailTexture() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 512;
  const ctx = c.getContext('2d');
      if (!ctx) throw new Error('無法繪製船體紋理');

  // 赭石與暗硃砂舊帆布底色（帶海風日曬微漸層，避免塑膠鮮紅）
  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#964227');
  grad.addColorStop(0.55, '#a85132');
  grad.addColorStop(1, '#7f351e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // 直幅麻布拼接縫線
  const panels = 10;
  for (let i = 1; i < panels; i++) {
    const x = (i * 512) / panels;
    ctx.strokeStyle = 'rgba(45, 16, 8, 0.28)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  // 鹽霧與風化斑駁感
  for (let i = 0; i < 900; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 2 + Math.random() * 10;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(235,195,155,0.025)' : 'rgba(35,12,6,0.03)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createBowEyeTexture() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 128;
  const ctx = c.getContext('2d');
      if (!ctx) throw new Error('無法繪製船體紋理');
  ctx.clearRect(0, 0, 256, 128);

  // 低調傳統船眼（白底黑睛、暗朱描邊，俯視海道）
  ctx.save();
  ctx.translate(128, 68);
  // 朱紅眼眶外緣
  ctx.beginPath();
  ctx.moveTo(-78, 4);
  ctx.quadraticCurveTo(0, -44, 78, 4);
  ctx.quadraticCurveTo(0, 42, -78, 4);
  ctx.closePath();
  ctx.fillStyle = '#e8dfd1';
  ctx.fill();
  ctx.lineWidth = 7;
  ctx.strokeStyle = '#8d2d20';
  ctx.stroke();

  // 墨黑眼珠（略偏前下方以示「看清航道」）
  ctx.beginPath();
  ctx.arc(10, 4, 21, 0, Math.PI * 2);
  ctx.fillStyle = '#161412';
  ctx.fill();

  // 金赭細內圈
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#b98f48';
  ctx.stroke();
  ctx.restore();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// =========================================================================
// 2. 明初寶船／福船主體建模函式（可直接抽離至遊戲專案）
//    座標定義：+X = 船首 (Bow)，-X = 船尾 (Stern)，+Y = 上，+Z = 右舷 (Starboard)
// =========================================================================
export function createMingTreasureShip(): THREE.Group {
  const shipRoot = new THREE.Group();
  shipRoot.name = 'MingTreasureShip';

  const hullGroup = new THREE.Group();
  hullGroup.name = 'HullGroup';
  const bulkheadGroup = new THREE.Group();
  bulkheadGroup.name = 'WatertightBulkheadsGroup';
  const sternCastleGroup = new THREE.Group();
  sternCastleGroup.name = 'SternCastleGroup';
  const deckFittingsGroup = new THREE.Group();
  deckFittingsGroup.name = 'DeckFittingsGroup';
  const riggingGroup = new THREE.Group();
  riggingGroup.name = 'RiggingAndSailsGroup';

  shipRoot.add(hullGroup, bulkheadGroup, sternCastleGroup, deckFittingsGroup, riggingGroup);

  // 共用材質
  const hullWoodTex = createLacqueredWoodTexture('#2b1d15', '#140c08');
  const deckTex = createDeckPlankTexture();
  const sailTex = createWeatheredSailTexture();
  const bowEyeTex = createBowEyeTexture();

  const hullMat = new THREE.MeshStandardMaterial({
    map: hullWoodTex,
    roughness: 0.52,
    metalness: 0.06,
    side: THREE.DoubleSide
  });
  const darkTimberMat = new THREE.MeshStandardMaterial({
    color: 0x221610,
    roughness: 0.62,
    metalness: 0.05
  });
  const deckMat = new THREE.MeshStandardMaterial({
    map: deckTex,
    roughness: 0.78,
    metalness: 0.02,
    side: THREE.DoubleSide
  });
  const vermilionMat = new THREE.MeshStandardMaterial({
    color: 0x8e2c1f,
    roughness: 0.55,
    metalness: 0.08
  });
  const giltMat = new THREE.MeshStandardMaterial({
    color: 0xb99145,
    roughness: 0.38,
    metalness: 0.55
  });
  const bulkheadMat = new THREE.MeshStandardMaterial({
    color: 0x573d28,
    roughness: 0.8,
    side: THREE.DoubleSide
  });
  const bambooMat = new THREE.MeshStandardMaterial({
    color: 0x8d7248,
    roughness: 0.75
  });
  const sailMat = new THREE.MeshStandardMaterial({
    map: sailTex,
    roughness: 0.88,
    metalness: 0.0,
    side: THREE.DoubleSide
  });
  const ironMat = new THREE.MeshStandardMaterial({
    color: 0x26282a,
    roughness: 0.6,
    metalness: 0.65
  });

  // -----------------------------------------------------------------------
  // A. 船殼曲線參數（寬體、近扁平微尖底福船折衷斷面、首昂方平、高聳方艉）
  // -----------------------------------------------------------------------
  const L = 26.0; // 總長（-13 至 +13）
  function hullProfile(t) {
    // t: 0 = 船尾 (-L/2), 1 = 船首 (+L/2)
    const x = (t - 0.5) * L;

    // 半船寬：中段寬闊穩重，船尾保持方正寬度，船首收束為平首擋浪板（非尖削西式船首）
    let topHalfW;
    if (t < 0.48) {
      const u = t / 0.48;
      topHalfW = 2.35 + (3.45 - 2.35) * Math.sin(u * Math.PI * 0.5);
    } else {
      const u = (t - 0.48) / 0.52;
      topHalfW = 3.45 - (3.45 - 1.18) * Math.pow(u, 1.55);
    }

    // 船底半寬（維持福船與沙船折衷的寬穩底型）
    const flatHalfW = topHalfW * (0.46 - 0.16 * Math.abs(t - 0.48));

    // 龍骨底線 keelY：中段平穩，首部昂起，尾部於舵位上方抬升形成高方艉懸伸
    let keelY = -1.35;
    if (t < 0.16) {
      const u = (0.16 - t) / 0.16;
      keelY = -1.35 + 2.85 * Math.pow(u, 1.75);
    } else if (t > 0.76) {
      const u = (t - 0.76) / 0.24;
      keelY = -1.35 + 3.05 * Math.pow(u, 1.65);
    }

    // 舷弧線 sheerY（首昂艉高）
    let sheerY = 2.02;
    if (t < 0.45) {
      const u = (0.45 - t) / 0.45;
      sheerY = 2.02 + 2.48 * Math.pow(u, 1.55);
    } else {
      const u = (t - 0.45) / 0.55;
      sheerY = 2.02 + 1.32 * Math.pow(u, 1.7);
    }

    // 主甲板高度 deckY
    const deckY = sheerY - 0.42;
    return { x, topHalfW, flatHalfW, keelY, sheerY, deckY };
  }

  // 給定截面參數與橫向比例 s (-1 左舷頂 -> 0 龍骨底 -> +1 右舷頂) 計算頂點
  function sectionPoint(prof, s) {
    const a = Math.abs(s); // 0..1
    const sign = s < 0 ? -1 : 1;
    let y, z;
    const bilgeTurn = 0.34;
    if (a <= bilgeTurn) {
      // 船底微 V 轉扁腹段（淺底尖、寬舭部）
      const u = a / bilgeTurn;
      z = sign * prof.flatHalfW * u;
      y = prof.keelY + 0.26 * Math.pow(u, 1.2);
    } else {
      // 舭部圓弧向上外張至舷頂（底尖上闊）
      const u = (a - bilgeTurn) / (1 - bilgeTurn);
      const flare = Math.sin(u * Math.PI * 0.5);
      z = sign * (prof.flatHalfW + (prof.topHalfW - prof.flatHalfW) * Math.pow(flare, 0.82));
      y = (prof.keelY + 0.26) + (prof.sheerY - (prof.keelY + 0.26)) * Math.pow(u, 0.92);
    }
    return new THREE.Vector3(prof.x, y, z);
  }

  // 建立船殼網格
  const Nx = 44;
  const Ns = 28;
  const positions = [];
  const uvs = [];
  const indices = [];

  for (let i = 0; i <= Nx; i++) {
    const t = i / Nx;
    const prof = hullProfile(t);
    for (let j = 0; j <= Ns; j++) {
      const s = -1 + (2 * j) / Ns;
      const pt = sectionPoint(prof, s);
      positions.push(pt.x, pt.y, pt.z);
      uvs.push(t * 2.5, (j / Ns) * 2.0);
    }
  }
  for (let i = 0; i < Nx; i++) {
    for (let j = 0; j < Ns; j++) {
      const v00 = i * (Ns + 1) + j;
      const v10 = (i + 1) * (Ns + 1) + j;
      const v01 = v00 + 1;
      const v11 = v10 + 1;
      indices.push(v00, v10, v11, v00, v11, v01);
    }
  }
  const hullGeo = new THREE.BufferGeometry();
  hullGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  hullGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  hullGeo.setIndex(indices);
  hullGeo.computeVertexNormals();

  const outerHullMesh = new THREE.Mesh(hullGeo, hullMat);
  outerHullMesh.castShadow = true;
  outerHullMesh.receiveShadow = true;
  hullGroup.add(outerHullMesh);

  // 封閉平首擋浪板（t = 1）與高聳方艉封板（t = 0）
  function buildTransomCap(tVal, flipNormal) {
    const prof = hullProfile(tVal);
    const capPos = [];
    const capIdx = [];
    const centerPt = new THREE.Vector3(prof.x, (prof.keelY + prof.sheerY) * 0.52, 0);
    capPos.push(centerPt.x, centerPt.y, centerPt.z);
    for (let j = 0; j <= Ns; j++) {
      const s = -1 + (2 * j) / Ns;
      const p = sectionPoint(prof, s);
      capPos.push(p.x, p.y, p.z);
    }
    for (let j = 1; j <= Ns; j++) {
      if (flipNormal) {
        capIdx.push(0, j + 1, j);
      } else {
        capIdx.push(0, j, j + 1);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(capPos, 3));
    g.setIndex(capIdx);
    g.computeVertexNormals();
    return g;
  }
  const sternCap = new THREE.Mesh(buildTransomCap(0, true), hullMat);
  const bowCap = new THREE.Mesh(buildTransomCap(1, false), hullMat);
  hullGroup.add(sternCap, bowCap);

  // 主甲板曲面
  const deckPos = [];
  const deckUvs = [];
  const deckIdx = [];
  for (let i = 0; i <= Nx; i++) {
    const t = i / Nx;
    const prof = hullProfile(t);
    const w = prof.topHalfW * 0.94;
    deckPos.push(prof.x, prof.deckY, -w, prof.x, prof.deckY, w);
    deckUvs.push(t * 4, 0, t * 4, 1);
  }
  for (let i = 0; i < Nx; i++) {
    const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
    deckIdx.push(a, b, d, a, d, c);
  }
  const deckGeo = new THREE.BufferGeometry();
  deckGeo.setAttribute('position', new THREE.Float32BufferAttribute(deckPos, 3));
  deckGeo.setAttribute('uv', new THREE.Float32BufferAttribute(deckUvs, 2));
  deckGeo.setIndex(deckIdx);
  deckGeo.computeVertexNormals();
  const deckMesh = new THREE.Mesh(deckGeo, deckMat);
  deckMesh.receiveShadow = true;
  hullGroup.add(deckMesh);

  // 中軸龍骨脊木 (Modest axial keel)
  const keelBeam = new THREE.Mesh(new THREE.BoxGeometry(16.8, 0.32, 0.36), darkTimberMat);
  keelBeam.position.set(0.5, -1.46, 0);
  hullGroup.add(keelBeam);

  // 兩舷防撞護舷艕木 (Wales) 與暗朱色舷緣飾線
 [-1, 1].forEach((side) => {
    const walePts = [];
    const railPts = [];
    for (let i = 0; i <= 32; i++) {
      const t = i / 32;
      const prof = hullProfile(t);
      const pWale = sectionPoint(prof, side * 0.78);
      pWale.z += side * 0.04;
      walePts.push(pWale);
      const pRail = sectionPoint(prof, side * 1.0);
      railPts.push(pRail);
    }
    const waleGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(walePts), 40, 0.09, 6, false);
    hullGroup.add(new THREE.Mesh(waleGeo, darkTimberMat));

    const railGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(railPts), 40, 0.075, 6, false);
    hullGroup.add(new THREE.Mesh(railGeo, vermilionMat));
  });

  // 船眼 (Bow Eyes) — 貼合船首左右舷頰部
  const eyePlaneGeo = new THREE.PlaneGeometry(1.35, 0.68);
  const eyePlaneMat = new THREE.MeshStandardMaterial({
    map: bowEyeTex,
    transparent: true,
    roughness: 0.55,
    depthWrite: false
  });
  const bowEyeProf = hullProfile(0.90);
 [-1, 1].forEach((side) => {
    const p = sectionPoint(bowEyeProf, side * 0.78);
    const eye = new THREE.Mesh(eyePlaneGeo, eyePlaneMat);
    eye.position.set(p.x, p.y + 0.08, p.z + side * 0.06);
    eye.rotation.y = side > 0 ? Math.PI * 0.37 : -Math.PI * 0.37;
    eye.rotation.z = side > 0 ? 0.12 : -0.12;
    if (side < 0) eye.scale.x = -1; // 左右船眼皆朝前方凝視
    hullGroup.add(eye);
  });

  // 船首平擋板低調龍紋牌飾（克制浮雕感，非誇張主題樂園龍頭）
  const bowTopProf = hullProfile(0.99);
  const dragonPlaque = new THREE.Group();
  dragonPlaque.position.set(bowTopProf.x + 0.06, bowTopProf.sheerY - 0.55, 0);
  dragonPlaque.rotation.z = -0.32;
  const plaqueFrame = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.85, 1.45), vermilionMat);
  const plaqueInner = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.62, 1.15), darkTimberMat);
  const dragonReliefRing = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.045, 8, 20), giltMat);
  dragonReliefRing.rotation.y = Math.PI / 2;
  dragonReliefRing.position.x = 0.08;
  const dragonCrest = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.16, 0.58), giltMat);
  dragonCrest.position.set(0.08, 0.0, 0);
  dragonPlaque.add(plaqueFrame, plaqueInner, dragonReliefRing, dragonCrest);
  hullGroup.add(dragonPlaque);

  // 船尾方艉朱漆格柵飾板與中軸升降平衡舵 (Axial Stern Rudder)
  const sternProf = hullProfile(0.01);
  const sternPanel = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.35, 3.6), vermilionMat);
  sternPanel.position.set(sternProf.x - 0.05, sternProf.sheerY - 1.1, 0);
  const sternTrim = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 3.8), giltMat);
  sternTrim.position.set(sternProf.x - 0.06, sternProf.sheerY - 0.42, 0);
  hullGroup.add(sternPanel, sternTrim);

  const rudderGroup = new THREE.Group();
  rudderGroup.position.set(-12.35, 1.2, 0);
  rudderGroup.rotation.z = 0.16; // 順應尾柱斜度
  const rudderPost = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 4.6, 10), darkTimberMat);
  rudderPost.position.y = -0.9;
  // 梯形多孔平衡木舵葉
  const rudderBlade = new THREE.Mesh(new THREE.BoxGeometry(1.45, 2.35, 0.12), darkTimberMat);
  rudderBlade.position.set(-0.55, -2.05, 0);
  rudderGroup.add(rudderPost, rudderBlade);
  hullGroup.add(rudderGroup);

  // -----------------------------------------------------------------------
  // B. 九道水密隔艙橫隔壁 (Watertight Bulkheads) + 甲板艙樑肋位
  // -----------------------------------------------------------------------
  for (let b = 1; b <= 9; b++) {
    const t = 0.12 + b * 0.082;
    const prof = hullProfile(t);
    const bPos = [];
    const bIdx = [];
    bPos.push(prof.x, (prof.keelY + prof.deckY) * 0.5, 0);
    const segs = 18;
    for (let j = 0; j <= segs; j++) {
      const s = -0.94 + (1.88 * j) / segs;
      const p = sectionPoint(prof, s);
      bPos.push(prof.x, Math.min(p.y, prof.deckY - 0.02), p.z * 0.96);
    }
    for (let j = 1; j <= segs; j++) {
      bIdx.push(0, j, j + 1);
    }
    const bGeo = new THREE.BufferGeometry();
    bGeo.setAttribute('position', new THREE.Float32BufferAttribute(bPos, 3));
    bGeo.setIndex(bIdx);
    bGeo.computeVertexNormals();
    bulkheadGroup.add(new THREE.Mesh(bGeo, bulkheadMat));

    // 甲板表面微凸隔艙橫樑（暗示水密分艙位置）
    const deckRib = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.08, prof.topHalfW * 1.82),
      darkTimberMat
    );
    deckRib.position.set(prof.x, prof.deckY + 0.03, 0);
    hullGroup.add(deckRib);
  }

  // -----------------------------------------------------------------------
  // C. 高聳船樓／尾樓與中艙竹蓬 (Stern Castle & Deck Cabins)
  // -----------------------------------------------------------------------
  // 下層官廳 (Lower Stern Cabin, x: -12.6 .. -6.6)
  const lowerCabin = new THREE.Group();
  lowerCabin.position.set(-9.6, 3.65, 0);
  const cabinBody = new THREE.Mesh(new THREE.BoxGeometry(5.6, 1.55, 4.35), darkTimberMat);
  cabinBody.castShadow = true;
  // 兩側直欞明瓦窗格飾帶
  const latticeStrip = new THREE.Mesh(new THREE.BoxGeometry(4.9, 0.62, 4.42), vermilionMat);
  latticeStrip.position.y = 0.18;
  // 尾樓上層甲板平台
  const poopPlatform = new THREE.Mesh(new THREE.BoxGeometry(6.1, 0.18, 4.75), deckMat);
  poopPlatform.position.y = 0.85;
  lowerCabin.add(cabinBody, latticeStrip, poopPlatform);

  // 上層舵樓／望樓 (Upper Command Pavilion)
  const upperPavilion = new THREE.Group();
  upperPavilion.position.set(-10.2, 5.15, 0);
  const pavWalls = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.25, 3.3), darkTimberMat);
  pavWalls.castShadow = true;
  const pavWindowBand = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.48, 3.36), vermilionMat);
  pavWindowBand.position.y = 0.12;

  // 克制的明式弧面歇山船篷頂（深灰褐木瓦，不做誇張宮殿飛簷）
  const roofBase = new THREE.Mesh(new THREE.BoxGeometry(4.15, 0.16, 3.95), darkTimberMat);
  roofBase.position.y = 0.68;
  const roofUpper = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 2.35, 0.65, 4), darkTimberMat);
  roofUpper.rotation.y = Math.PI / 4;
  roofUpper.scale.set(1.22, 1, 1.12);
  roofUpper.position.y = 1.05;
  const roofRidge = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.16, 0.22), giltMat);
  roofRidge.position.y = 1.38;

  upperPavilion.add(pavWalls, pavWindowBand, roofBase, roofUpper, roofRidge);

  // 尾樓朱漆欄楯與船尾雙風燈 (Lanterns)
  const railFrame = new THREE.Group();
  railFrame.position.set(-9.6, 4.78, 0);
  [-2.25, 2.25].forEach((zPos) => {
    const topBar = new THREE.Mesh(new THREE.BoxGeometry(5.9, 0.08, 0.08), vermilionMat);
    topBar.position.set(0, 0.22, zPos);
    railFrame.add(topBar);
    for (let k = -2.7; k <= 2.7; k += 0.9) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.52, 0.08), darkTimberMat);
      post.position.set(k, 0, zPos);
      railFrame.add(post);
    }
  });

  const lanternMat = new THREE.MeshStandardMaterial({
    color: 0xf4c97a,
    emissive: 0xd9822b,
    emissiveIntensity: 0.65,
    roughness: 0.4
  });
  [-1.85, 1.85].forEach((zPos) => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.85, 6), darkTimberMat);
    pole.position.set(-12.75, 4.95, zPos);
    pole.rotation.z = 0.35;
    const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.34, 6), lanternMat);
    lantern.position.set(-12.92, 5.12, zPos);
    sternCastleGroup.add(pole, lantern);
  });

  // 中段低矮拱形竹蓬貨艙蓋 (Midship Bamboo-Matted Cargo Hatches)
  [-2.8, 2.2].forEach((xPos) => {
    const hatchBase = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.35, 2.85), darkTimberMat);
    hatchBase.position.set(xPos, 1.78, 0);
    const bambooCover = new THREE.Mesh(
      new THREE.CylinderGeometry(1.48, 1.48, 2.82, 12, 1, false, 0, Math.PI),
      bambooMat
    );
    bambooCover.rotation.z = Math.PI / 2;
    bambooCover.scale.set(0.32, 1, 1);
    bambooCover.position.set(xPos, 1.95, 0);
    sternCastleGroup.add(hatchBase, bambooCover);
  });

  sternCastleGroup.add(lowerCabin, upperPavilion, railFrame);

  // -----------------------------------------------------------------------
  // D. 甲板舾裝配件：絞盤、四爪鐵錨、小舢舨與淡水桶 (Deck Fittings)
  // -----------------------------------------------------------------------
  // 船首橫軸木絞盤 (Foredeck Windlass)
  const windlass = new THREE.Group();
  windlass.position.set(10.2, 2.82, 0);
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.9, 10), darkTimberMat);
  barrel.rotation.x = Math.PI / 2;
  const bittL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.65, 0.22), darkTimberMat);
  bittL.position.set(0, -0.1, -0.95);
  const bittR = bittL.clone();
  bittR.position.z = 0.95;
  windlass.add(barrel, bittL, bittR);
  deckFittingsGroup.add(windlass);

  // 左右船首貓架與傳統四爪鐵錨 (Four-fluked Chinese Anchors)
 [-1, 1].forEach((side) => {
    const cathead = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.95), darkTimberMat);
    cathead.position.set(11.3, 2.95, side * 1.65);
    deckFittingsGroup.add(cathead);

    const anchor = new THREE.Group();
    anchor.position.set(11.3, 2.25, side * 2.02);
    const shank = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.05, 8), ironMat);
    anchor.add(shank);
    for (let f = 0; f < 4; f++) {
      const arm = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.038, 6, 10, Math.PI * 0.65), ironMat);
      arm.position.y = -0.42;
      arm.rotation.y = (f * Math.PI) / 2;
      arm.rotation.z = Math.PI * 0.68;
      anchor.add(arm);
    }
    deckFittingsGroup.add(anchor);
  });

  // 中甲板繫固交通小舢舨 (Ship's Sampan) 與儲水木桶
  const sampan = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.36, 0.88), darkTimberMat);
  sampan.position.set(-0.3, 1.82, 1.95);
  deckFittingsGroup.add(sampan);

  for (let c = 0; c < 3; c++) {
    const cask = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.20, 0.46, 10), bambooMat);
    cask.position.set(6.4 + c * 0.48, 2.15, -1.55);
    deckFittingsGroup.add(cask);
  }

  // -----------------------------------------------------------------------
  // E. 五桅錯落佈局與赭石竹骨硬帆 (5 Staggered Masts & Battened Junk Sails)
  // -----------------------------------------------------------------------
  function createBattenedSail(width, height, battenCount) {
    const sailUnit = new THREE.Group();

    // 微弧受風帆面
    const sGeo = new THREE.PlaneGeometry(width, height, 10, battenCount * 2);
    const pos = sGeo.attributes.position;
    for (let k = 0; k < pos.count; k++) {
      const u = (pos.getX(k) + width * 0.5) / width; // 0..1 前緣至後緣
      const v = (pos.getY(k) + height * 0.5) / height; // 0..1 下至上
      // 上窄下寬略呈中式扇形斜頂硬帆輪廓
      const topSkew = v * (u - 0.35) * 0.38;
      const taperX = pos.getX(k) * (1.0 - 0.14 * v);
      // 風袋微弧度 (+Z 受風鼓起)
      const camber = Math.sin(u * Math.PI) * (0.28 + 0.12 * Math.sin(v * Math.PI));
      pos.setXYZ(k, taperX, pos.getY(k) + topSkew, camber);
    }
    sGeo.computeVertexNormals();
    const sailMesh = new THREE.Mesh(sGeo, sailMat);
    sailMesh.castShadow = true;
    sailUnit.add(sailMesh);

    // 橫向竹帆骨 (Horizontal Bamboo Battens) 與上下桁木
    for (let b = 0; b <= battenCount; b++) {
      const v = b / battenCount;
      const yBase = (v - 0.5) * height;
      const bPts = [];
      for (let step = 0; step <= 8; step++) {
        const u = step / 8;
        const rawX = (u - 0.5) * width * 1.04;
        const x = rawX * (1.0 - 0.14 * v);
        const y = yBase + v * (u - 0.35) * 0.38;
        const z = Math.sin(Math.min(Math.max(u, 0), 1) * Math.PI) * (0.28 + 0.12 * Math.sin(v * Math.PI)) + 0.03;
        bPts.push(new THREE.Vector3(x, y, z));
      }
      const radius = (b === 0 || b === battenCount) ? 0.055 : 0.032;
      const bGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(bPts), 12, radius, 6, false);
      sailUnit.add(new THREE.Mesh(bGeo, b === 0 || b === battenCount ? darkTimberMat : bambooMat));
    }

    // 帆後緣多股繚繩（雞爪索收束示意）
    const ropeMat = new THREE.LineBasicMaterial({ color: 0x4b3b2b, transparent: true, opacity: 0.65 });
    const gatherPt = new THREE.Vector3(-width * 0.62, -height * 0.62, 0.35);
    for (let b = 1; b < battenCount; b += 2) {
      const v = b / battenCount;
      const leechX = -width * 0.5 * (1.0 - 0.14 * v);
      const leechY = (v - 0.5) * height + v * (-0.35) * 0.38;
      const rGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(leechX, leechY, 0.08),
        gatherPt
      ]);
      sailUnit.add(new THREE.Line(rGeo, ropeMat));
    }

    return sailUnit;
  }

  // 明代大型海舶五桅配置（前後傾角與左右微錯落，完全區別於西洋橫帆船）
  const mastSpecs = [
    { name: 'Foremast',   x:  9.5, baseY: 2.3, z: -0.32, h:  9.6, rakeZ: -0.11, sW: 3.3, sH: 5.8, bat: 6, yaw: 0.34 },
    { name: 'SecondMast', x:  4.6, baseY: 1.8, z:  0.30, h: 13.0, rakeZ: -0.05, sW: 4.5, sH: 8.2, bat: 8, yaw: 0.30 },
    { name: 'MainMast',   x: -0.5, baseY: 1.7, z:  0.00, h: 15.6, rakeZ:  0.00, sW: 5.4, sH: 9.8, bat: 9, yaw: 0.28 },
    { name: 'FourthMast', x: -5.4, baseY: 2.1, z: -0.32, h: 11.8, rakeZ:  0.05, sW: 4.1, sH: 7.4, bat: 7, yaw: 0.32 },
    { name: 'SternMast',  x: -10.6, baseY: 4.4, z: 0.24, h:  8.2, rakeZ:  0.10, sW: 2.9, sH: 4.9, bat: 5, yaw: 0.36 }
  ];

  mastSpecs.forEach((m) => {
    const mastAssembly = new THREE.Group();
    mastAssembly.name = m.name;
    mastAssembly.position.set(m.x, m.baseY, m.z);
    mastAssembly.rotation.z = m.rakeZ; // 正 X 為首，負旋轉代表向船首微傾

    // 桅杆本體與將軍柱（桅夾座）
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.20, m.h, 12),
      darkTimberMat
    );
    pole.position.y = m.h * 0.5;
    pole.castShadow = true;

    const tabernacle = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.95, 0.62), darkTimberMat);
    tabernacle.position.y = 0.45;

    // 桅頂小斗與朱紅風信旗
    const mastCap = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.14, 0.36), vermilionMat);
    mastCap.position.y = m.h + 0.05;
    const pennant = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.22), vermilionMat);
    pennant.material.side = THREE.DoubleSide;
    pennant.position.set(-0.48, m.h + 0.18, 0.08);

    // 懸掛硬帆（偏移桅杆約三分之一處，呈中式平衡縱帆配置）
    const sail = createBattenedSail(m.sW, m.sH, m.bat);
    sail.position.set(-m.sW * 0.16, m.h * 0.53, 0.16);
    sail.rotation.y = m.yaw;

    mastAssembly.add(pole, tabernacle, mastCap, pennant, sail);
    riggingGroup.add(mastAssembly);
  });

  // 供外部切換透視水密隔艙的控制介面
  shipRoot.userData = {
    outerHullMesh,
    deckMesh,
    hullMat,
    deckMat,
    setBulkheadCutaway(enabled) {
      hullMat.transparent = enabled;
      hullMat.opacity = enabled ? 0.22 : 1.0;
      deckMat.transparent = enabled;
      deckMat.opacity = enabled ? 0.30 : 1.0;
    },
    // 雙語標註錨點（模型局部座標）
    labelAnchors: [
      { zh: '船首', en: 'Bow', pos: new THREE.Vector3(13.1, 3.55, 0) },
      { zh: '船眼', en: 'Bow Eye', pos: new THREE.Vector3(10.6, 2.35, 1.85) },
      { zh: '頭桅', en: 'Foremast', pos: new THREE.Vector3(10.3, 11.8, -0.32) },
      { zh: '中桅', en: 'Main Mast', pos: new THREE.Vector3(-0.5, 17.5, 0) },
      { zh: '竹骨硬帆', en: 'Battened Sail', pos: new THREE.Vector3(3.8, 8.8, 1.5) },
      { zh: '水密隔艙', en: 'Watertight Bulkheads', pos: new THREE.Vector3(1.8, 1.4, 3.1) },
      { zh: '船樓（尾樓）', en: 'Stern Castle', pos: new THREE.Vector3(-10.2, 6.8, 0) },
      { zh: '升降平衡舵', en: 'Stern Rudder', pos: new THREE.Vector3(-13.1, 0.2, 0) }
    ]
  };

  return shipRoot;
}
