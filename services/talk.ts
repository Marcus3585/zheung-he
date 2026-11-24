import { BondShift, GameStats, StatType } from '../types';
import { bondName } from '../data/characters';

export interface TalkEffects {
  trust?: number;
  morale?: number;
  knowledge?: number;
  connections?: number;
  silver?: number;
  flags?: string[];
  clearFlags?: string[];
  bonds?: BondShift[];
}

export interface TalkVariant {
  text: string;
  allFlags?: string[];
  anyFlags?: string[];
  noneFlags?: string[];
  minBond?: { id: string; value: number };
  maxBond?: { id: string; value: number };
}

export interface TalkChoice {
  text: string;
  /** Omit to end the scene after this reply. */
  next?: string;
  effects?: TalkEffects;
  allFlags?: string[];
  anyFlags?: string[];
  noneFlags?: string[];
  minBond?: { id: string; value: number };
  maxBond?: { id: string; value: number };
  requireStat?: { stat: StatType; value: number };
  minSilver?: number;
  lockedHint?: string;
}

export interface TalkNode {
  id: string;
  speakerId: string;
  text: string;
  variants?: TalkVariant[];
  choices?: TalkChoice[];
  /** Button label when the node has no choices. Ends the scene unless `next` is set. */
  continueLabel?: string;
  next?: string;
}

export interface TalkScene {
  id: string;
  locationId: string;
  kind: 'arrival' | 'local' | 'aftermath' | 'epilogue';
  kicker: string;
  entry: string;
  nodes: TalkNode[];
}

export interface CrisisScript {
  speakerId: string;
  lead: string;
  leadVariants?: TalkVariant[];
  asideSpeakerId: string;
  aside: string;
  asideVariants?: TalkVariant[];
}

export interface ResolvedChoice {
  choice: TalkChoice;
  locked: boolean;
  hint?: string;
}

const STAT_LABEL: Record<string, string> = {
  trust: '信任',
  morale: '士氣',
  knowledge: '學識',
  connections: '人脈',
  silver: '銀兩',
};

export function hasFlag(stats: GameStats, flag: string): boolean {
  return stats.flags.includes(flag);
}

export function bondOf(stats: GameStats, id: string): number {
  return stats.bonds[id] ?? 0;
}

export function attitudeLabel(bond: number): string {
  if (bond >= 75) return '把你當自己人';
  if (bond >= 55) return '肯跟你說實話';
  if (bond >= 35) return '照規矩辦事';
  if (bond >= 15) return '話少了些';
  if (bond > 0) return '初次見面';
  return '初次見面';
}

function gateMatches(
  gate: {
    allFlags?: string[];
    anyFlags?: string[];
    noneFlags?: string[];
    minBond?: { id: string; value: number };
    maxBond?: { id: string; value: number };
  },
  stats: GameStats,
): boolean {
  if (gate.allFlags && !gate.allFlags.every((flag) => stats.flags.includes(flag))) return false;
  if (gate.anyFlags && !gate.anyFlags.some((flag) => stats.flags.includes(flag))) return false;
  if (gate.noneFlags && gate.noneFlags.some((flag) => stats.flags.includes(flag))) return false;
  if (gate.minBond && bondOf(stats, gate.minBond.id) < gate.minBond.value) return false;
  if (gate.maxBond && bondOf(stats, gate.maxBond.id) > gate.maxBond.value) return false;
  return true;
}

export function resolveText(text: string, variants: TalkVariant[] | undefined, stats: GameStats): string {
  if (!variants) return text;
  for (const variant of variants) {
    if (gateMatches(variant, stats)) return variant.text;
  }
  return text;
}

export function resolveChoices(node: TalkNode, stats: GameStats): ResolvedChoice[] {
  const visible: ResolvedChoice[] = [];
  for (const choice of node.choices ?? []) {
    if (!gateMatches(choice, stats)) continue;
    let locked = false;
    let hint: string | undefined;
    if (choice.requireStat && stats[choice.requireStat.stat] < choice.requireStat.value) {
      locked = true;
      hint = choice.lockedHint ?? `${STAT_LABEL[choice.requireStat.stat]}要夠 ${choice.requireStat.value}`;
    }
    if (choice.minSilver != null && stats.silver < choice.minSilver) {
      locked = true;
      hint = choice.lockedHint ?? `銀兩要夠 ${choice.minSilver}`;
    }
    visible.push({ choice, locked, hint });
  }
  return visible;
}

function clampStat(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function mergeNumber(base: number | undefined, extra: number | undefined): number | undefined {
  if (base == null && extra == null) return undefined;
  return (base ?? 0) + (extra ?? 0);
}

export function mergeBonds(shifts: BondShift[] | undefined): BondShift[] | undefined {
  if (!shifts?.length) return undefined;
  const totals = new Map<string, number>();
  for (const shift of shifts) {
    totals.set(shift.id, (totals.get(shift.id) ?? 0) + shift.delta);
  }
  const merged = [...totals.entries()]
    .filter(([, delta]) => delta !== 0)
    .map(([id, delta]) => ({ id, delta }));
  return merged.length ? merged : undefined;
}

export function mergeEffects(base: TalkEffects | undefined, extra: TalkEffects | undefined): TalkEffects {
  if (!extra) {
    return { ...(base ?? {}), bonds: mergeBonds(base?.bonds) };
  }
  if (!base) {
    return { ...extra, bonds: mergeBonds(extra.bonds) };
  }
  return {
    trust: mergeNumber(base.trust, extra.trust),
    morale: mergeNumber(base.morale, extra.morale),
    knowledge: mergeNumber(base.knowledge, extra.knowledge),
    connections: mergeNumber(base.connections, extra.connections),
    silver: mergeNumber(base.silver, extra.silver),
    flags: [...(base.flags ?? []), ...(extra.flags ?? [])],
    clearFlags: [...(base.clearFlags ?? []), ...(extra.clearFlags ?? [])],
    bonds: mergeBonds([...(base.bonds ?? []), ...(extra.bonds ?? [])]),
  };
}

/** Badges for what actually changed, after caps. A clamped +0 is omitted. */
export function changeLabels(before: GameStats, after: GameStats, qilin = false): string[] {
  const labels: string[] = [];
  const trust = after.trust - before.trust;
  const morale = after.morale - before.morale;
  const knowledge = after.knowledge - before.knowledge;
  const connections = after.connections - before.connections;
  const silver = after.silver - before.silver;
  if (trust) labels.push(`信任 ${trust > 0 ? '+' : ''}${trust}`);
  if (morale) labels.push(`士氣 ${morale > 0 ? '+' : ''}${morale}`);
  if (knowledge) labels.push(`學識 ${knowledge > 0 ? '+' : ''}${knowledge}`);
  if (connections) labels.push(`人脈 ${connections > 0 ? '+' : ''}${connections}`);
  if (silver) labels.push(`銀兩 ${silver > 0 ? '+' : ''}${silver}`);
  const ids = new Set([...Object.keys(before.bonds), ...Object.keys(after.bonds)]);
  for (const id of ids) {
    const delta = (after.bonds[id] ?? 0) - (before.bonds[id] ?? 0);
    if (delta) labels.push(`${bondName(id)} ${delta > 0 ? '+' : ''}${delta}`);
  }
  if (qilin && !before.hasQilin && after.hasQilin) labels.push('獲得麒麟！');
  return labels;
}

/**
 * Apply one crisis choice once. The advertised silver cost is taken even when
 * the knowledge check fails, then other effects are added. Each stat and each
 * person appears in the badge list at most once.
 */
export function resolveCrisis(
  prev: GameStats,
  effects: TalkEffects,
  paidSilver: number,
  qilin = false,
): { stats: GameStats; labels: string[] } {
  const paid: GameStats = {
    ...prev,
    flags: [...prev.flags],
    bonds: { ...prev.bonds },
    silver: Math.max(0, prev.silver - Math.max(0, paidSilver)),
  };
  const { stats } = applyTalkToStats(paid, effects);
  if (qilin) stats.hasQilin = true;
  const labels: string[] = [];
  if (paidSilver) labels.push(`銀兩 -${paidSilver}`);
  for (const label of changeLabels(paid, stats, qilin)) {
    labels.push(label);
  }
  return { stats, labels };
}

/**
 * Consequences that fire when a later crisis recalls an earlier promise.
 * `added` is the flags gained by the choice that just resolved.
 */
export function sideEffects(prevFlags: string[], added: string[]): TalkEffects {
  const had = (flag: string) => prevFlags.includes(flag);
  const add = (flag: string) => added.includes(flag);
  const out: TalkEffects = { flags: [], bonds: [] };

  if ((add('hormuz_shut') || add('hormuz_flee')) && had('promised_doctor')) {
    out.trust = (out.trust ?? 0) - 8;
    out.flags!.push('broke_doctor_promise');
    out.bonds!.push({ id: 'wang', delta: -8 }, { id: 'hormuz', delta: -10 });
  }
  if (add('hormuz_heal') && had('promised_doctor')) {
    out.trust = (out.trust ?? 0) + 5;
    out.flags!.push('kept_doctor_promise');
    out.bonds!.push({ id: 'wang', delta: 5 }, { id: 'hormuz', delta: 6 });
  }
  if (add('malacca_depot') && (had('champa_hard_talk') || had('champa_might')) && !had('malacca_reassured')) {
    out.trust = (out.trust ?? 0) - 5;
    out.flags!.push('depot_uneasy');
    out.bonds!.push({ id: 'malacca', delta: -4 }, { id: 'wang', delta: -2 });
  }
  if (add('malacca_depot') && (had('malacca_reassured') || had('champa_spoke_for') || had('depot_promise'))) {
    out.trust = (out.trust ?? 0) + 4;
    out.flags!.push('depot_warm');
    out.bonds!.push({ id: 'malacca', delta: 5 }, { id: 'wang', delta: 3 });
  }
  if (add('qilin_named') && (had('ma_stayed_calicut') || had('ma_compares') || had('honest_creature'))) {
    out.knowledge = (out.knowledge ?? 0) + 1;
    out.flags!.push('qilin_well_read');
    out.bonds!.push({ id: 'ma', delta: 4 }, { id: 'wang', delta: 2 });
  }
  if (add('pirate_ignored') && had('trust_shi')) {
    out.connections = (out.connections ?? 0) - 1;
    out.flags!.push('shi_disappointed');
    out.bonds!.push({ id: 'shi', delta: -8 }, { id: 'wang', delta: -3 });
  }
  if ((add('pirate_trap') || add('pirate_talked')) && had('trust_shi')) {
    out.connections = (out.connections ?? 0) + 1;
    out.flags!.push('shi_vindicated');
    out.bonds!.push({ id: 'shi', delta: 6 }, { id: 'wang', delta: 2 });
  }
  if (add('ocean_ration') && had('shared_water')) {
    out.morale = (out.morale ?? 0) + 6;
    out.flags!.push('ration_respected');
    out.bonds!.push({ id: 'wang', delta: 3 }, { id: 'fei', delta: 2 });
  }
  if (add('moga_trade') && had('moga_respect_talk')) {
    out.connections = (out.connections ?? 0) + 1;
    out.flags!.push('moga_warm');
    out.bonds!.push({ id: 'mogadishu', delta: 4 }, { id: 'wang', delta: 2 });
  }
  if ((add('moga_trade') || add('moga_survey') || add('moga_rush')) && had('bluff_fleet') && !had('withdrew_bluff')) {
    out.trust = (out.trust ?? 0) - 4;
    out.flags!.push('bluff_cost');
    out.bonds!.push({ id: 'mogadishu', delta: -5 }, { id: 'wang', delta: -2 });
  }
  if (add('ash_aid') && had('semu_water')) {
    out.morale = (out.morale ?? 0) + 4;
    out.flags!.push('ash_remembered');
    out.bonds!.push({ id: 'semu', delta: 4 }, { id: 'wang', delta: 2 });
  }
  if (add('ceylon_strike') && had('wang_keeps_ship')) {
    out.morale = (out.morale ?? 0) + 4;
    out.flags!.push('ship_held');
    out.bonds!.push({ id: 'wang', delta: 4 });
  }

  if (!out.flags!.length) delete out.flags;
  if (!out.bonds!.length) delete out.bonds;
  return out;
}

export function applyTalkToStats(prev: GameStats, effects?: TalkEffects): { stats: GameStats; labels: string[] } {
  const next: GameStats = {
    ...prev,
    flags: [...prev.flags],
    bonds: { ...prev.bonds },
  };
  if (effects?.trust) next.trust = clampStat(next.trust + effects.trust, 0, 100);
  if (effects?.morale) next.morale = clampStat(next.morale + effects.morale, 0, 100);
  if (effects?.knowledge) next.knowledge = Math.max(0, next.knowledge + effects.knowledge);
  if (effects?.connections) next.connections = Math.max(0, next.connections + effects.connections);
  if (effects?.silver) next.silver = Math.max(0, next.silver + effects.silver);
  for (const flag of effects?.flags ?? []) {
    if (!next.flags.includes(flag)) next.flags.push(flag);
  }
  for (const flag of effects?.clearFlags ?? []) {
    next.flags = next.flags.filter((item) => item !== flag);
  }
  for (const shift of mergeBonds(effects?.bonds) ?? []) {
    next.bonds[shift.id] = clampStat((next.bonds[shift.id] ?? 0) + shift.delta, 0, 100);
  }
  return { stats: next, labels: changeLabels(prev, next) };
}

export function findScene(scenes: TalkScene[], locationId: string, kind: TalkScene['kind']): TalkScene {
  const scene = scenes.find((item) => item.locationId === locationId && item.kind === kind);
  if (!scene) {
    throw new Error(`缺少對談：${locationId} / ${kind}`);
  }
  return scene;
}

export function auditTalk(scenes: TalkScene[], locationIds: string[]): string[] {
  const errors: string[] = [];
  const kinds: Array<TalkScene['kind']> = ['arrival', 'local', 'aftermath'];
  for (const locationId of locationIds) {
    for (const kind of kinds) {
      if (!scenes.some((scene) => scene.locationId === locationId && scene.kind === kind)) {
        errors.push(`缺少場面 ${locationId} ${kind}`);
      }
    }
  }

  for (const scene of scenes) {
    const byId = new Map(scene.nodes.map((node) => [node.id, node]));
    if (!byId.has(scene.entry)) errors.push(`${scene.id} 的入口 ${scene.entry} 不存在`);
    const seenIds = new Set<string>();
    for (const node of scene.nodes) {
      if (seenIds.has(node.id)) errors.push(`${scene.id} 節點重複 ${node.id}`);
      seenIds.add(node.id);
      if (!node.speakerId) errors.push(`${scene.id}/${node.id} 沒有說話的人`);
      if (!node.text.trim()) errors.push(`${scene.id}/${node.id} 沒有對白`);
      const choices = node.choices ?? [];
      const unconditional = choices.filter((choice) =>
        !choice.allFlags && !choice.anyFlags && !choice.noneFlags && !choice.minBond && !choice.maxBond,
      );
      if (choices.length > 0 && unconditional.length === 0) {
        errors.push(`${scene.id}/${node.id} 所有選項都可能被藏起`);
      }
      for (const choice of choices) {
        if (choice.next && !byId.has(choice.next)) {
          errors.push(`${scene.id}/${node.id} 指向不存在的 ${choice.next}`);
        }
      }
      if (node.next && !byId.has(node.next)) {
        errors.push(`${scene.id}/${node.id} 的下一句不存在`);
      }
    }

    const walk = (id: string, stack: string[]) => {
      if (stack.includes(id)) {
        errors.push(`${scene.id} 出現迴圈：${[...stack, id].join(' → ')}`);
        return;
      }
      const node = byId.get(id);
      if (!node) return;
      const nexts = new Set<string>();
      if (node.next) nexts.add(node.next);
      for (const choice of node.choices ?? []) {
        if (choice.next) nexts.add(choice.next);
      }
      for (const next of nexts) walk(next, [...stack, id]);
    };
    walk(scene.entry, []);
  }

  return errors;
}
