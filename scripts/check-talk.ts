import { GAME_EVENTS } from '../constants';
import { CHARACTERS } from '../data/characters';
import { CRISIS_TALK, TALK_SCENES } from '../data/voyageTalk';
import { auditTalk } from '../services/talk';

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

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`對談檢查通過：${TALK_SCENES.length} 場，${locationIds.length} 個航段。`);
