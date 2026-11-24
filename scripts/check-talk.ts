import { GAME_EVENTS } from '../constants';
import { CHARACTERS, INITIAL_BONDS } from '../data/characters';
import { CRISIS_TALK, TALK_SCENES } from '../data/voyageTalk';
import { auditTalk, mergeEffects, resolveCrisis, sideEffects } from '../services/talk';
import { GameChoice, GameStats } from '../types';

const locationIds = GAME_EVENTS.map((event) => event.locationId);
const errors = auditTalk(TALK_SCENES, locationIds);

for (const id of locationIds) {
  if (!CRISIS_TALK[id]) errors.push(`缺少危急對談 ${id}`);
}

for (const scene of TALK_SCENES) {
  for (const node of scene.nodes) {
    if (!CHARACTERS[node.speakerId]) errors.push(`${scene.id}/${node.id} 未知人物 ${node.speakerId}`);
  }
}

for (const script of Object.values(CRISIS_TALK)) {
  if (!CHARACTERS[script.speakerId]) errors.push(`危急說話人未知 ${script.speakerId}`);
  if (!CHARACTERS[script.asideSpeakerId]) errors.push(`危急旁白未知 ${script.asideSpeakerId}`);
}

const banned = /[国这说对门风云马头个们时书银两钱广刘万舰舰队历宝仓兽龙盐药针关开问应该从样经还让东长发记写来过为与实现]/;
for (const scene of TALK_SCENES) {
  for (const node of scene.nodes) {
    const blob = [node.text, ...(node.variants ?? []).map((item) => item.text), ...(node.choices ?? []).map((item) => item.text)].join('\n');
    if (banned.test(blob)) errors.push(`${scene.id}/${node.id} 有簡體字`);
  }
}

function sampleStats(silver: number, flags: string[] = [], trust = 50): GameStats {
  return {
    trust,
    morale: 50,
    knowledge: 8,
    connections: 8,
    silver,
    hasQilin: false,
    timeRemaining: 1000,
    flags: [...flags],
    bonds: { ...INITIAL_BONDS },
  };
}

function playChoice(title: string, stats: GameStats) {
  let choice: GameChoice | undefined;
  for (const event of GAME_EVENTS) {
    choice = event.choices.find((item) => item.title === title);
    if (choice) break;
  }
  if (!choice) throw new Error(`找不到抉擇：${title}`);
  const merged = mergeEffects(
    {
      trust: choice.effects.trust,
      morale: choice.effects.morale,
      knowledge: choice.effects.knowledge,
      connections: choice.effects.connections,
      silver: choice.effects.silver,
      flags: choice.setsFlags,
      bonds: choice.bonds,
    },
    sideEffects(stats.flags, choice.setsFlags ?? []),
  );
  return resolveCrisis(stats, merged, choice.cost?.silver ?? 0, !!choice.isQilinEvent);
}

function silverBadges(labels: string[]): string[] {
  return labels.filter((label) => label.startsWith('銀兩'));
}

function uniquePeople(labels: string[]): boolean {
  const names = labels.filter((label) => !/^(信任|士氣|學識|人脈|銀兩|獲得)/.test(label)).map((label) => label.replace(/ [+-]\d+$/, ''));
  return new Set(names).size === names.length;
}

const gift = playChoice('先送禮。米和布比話快', sampleStats(130));
if (gift.stats.silver !== 110) errors.push(`占城送禮後銀兩應為 110，實際 ${gift.stats.silver}`);
if (silverBadges(gift.labels).join(',') !== '銀兩 -20') errors.push(`占城銀兩徽章：${silverBadges(gift.labels).join(',')}`);

const depot = playChoice('出錢把官廠立起來', sampleStats(130, ['depot_promise']));
if (depot.stats.silver !== 90) errors.push(`官廠後銀兩應為 90，實際 ${depot.stats.silver}`);
if (silverBadges(depot.labels).join(',') !== '銀兩 -40') errors.push(`官廠銀兩徽章：${silverBadges(depot.labels).join(',')}`);
if (!uniquePeople(depot.labels)) errors.push(`官廠人物徽章重複：${depot.labels.join(' | ')}`);

const ash = playChoice('放下乾糧和布，先救岸上的人', sampleStats(120, ['semu_water']));
if (ash.stats.silver !== 95) errors.push(`蘇門答剌救援後銀兩應為 95，實際 ${ash.stats.silver}`);
if (silverBadges(ash.labels).join(',') !== '銀兩 -25') errors.push(`蘇門答剌銀兩徽章：${silverBadges(ash.labels).join(',')}`);
if (!uniquePeople(ash.labels)) errors.push(`蘇門答剌人物徽章重複：${ash.labels.join(' | ')}`);

const doctor = playChoice('讓醫官上岸，試着把人穩住', sampleStats(110, ['promised_doctor']));
if (doctor.stats.silver !== 80) errors.push(`醫官後銀兩應為 80，實際 ${doctor.stats.silver}`);
if (silverBadges(doctor.labels).filter((label) => label === '銀兩 -30').length !== 1) {
  errors.push(`醫官銀兩徽章：${silverBadges(doctor.labels).join(',')}`);
}
if (!uniquePeople(doctor.labels)) errors.push(`醫官人物徽章重複：${doctor.labels.join(' | ')}`);

const capped = playChoice('宣讀冊封，先把名分說清楚', sampleStats(50, [], 100));
if (capped.labels.some((label) => label.startsWith('信任'))) errors.push(`滿額信任仍出現徽章：${capped.labels.join(' | ')}`);

const trade = playChoice('把契約寫下來，貨換貨', sampleStats(80));
if (trade.stats.silver !== 60) errors.push(`古里契約後銀兩應為 60（花 50 再入 30），實際 ${trade.stats.silver}`);
if (silverBadges(trade.labels).join(',') !== '銀兩 -50,銀兩 +30') {
  errors.push(`古里銀兩徽章應分開列出花費和進帳：${silverBadges(trade.labels).join(',')}`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`對談檢查通過：${TALK_SCENES.length} 場，${locationIds.length} 個航段。`);
