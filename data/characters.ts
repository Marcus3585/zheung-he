export interface CharacterDef {
  id: string;
  name: string;
  title: string;
  emoji: string;
}

export const CHARACTERS: Record<string, CharacterDef> = {
  wang: { id: 'wang', name: '王景弘', title: '副使', emoji: '🧭' },
  ma: { id: 'ma', name: '馬歡', title: '通事', emoji: '✒️' },
  zhou: { id: 'zhou', name: '周聞', title: '太倉衛火長', emoji: '⚓' },
  champa: { id: 'champa', name: '占巴的賴', title: '占城國王', emoji: '👑' },
  shi: { id: 'shi', name: '施進卿', title: '舊港頭目', emoji: '🪵' },
  chen: { id: 'chen', name: '陳祖義', title: '舊港海商', emoji: '🍶' },
  malacca: { id: 'malacca', name: '拜里迷蘇剌', title: '滿剌加國王', emoji: '🏝️' },
  semu: { id: 'semu', name: '宰奴里阿必丁', title: '蘇門答剌國王', emoji: '🌶️' },
  monk: { id: 'monk', name: '海岸寺長老', title: '錫蘭山僧人', emoji: '🪷' },
  envoy: { id: 'envoy', name: '王城使者', title: '錫蘭山使', emoji: '💎' },
  fei: { id: 'fei', name: '費信', title: '船上記室', emoji: '⭐' },
  calicut: { id: 'calicut', name: '古里大頭目', title: '掌管港市', emoji: '⚖️' },
  hormuz: { id: 'hormuz', name: '忽魯謨斯國王', title: '波斯灣口', emoji: '🏺' },
  mogadishu: { id: 'mogadishu', name: '木骨都束蘇丹', title: '東非這一岸的主人', emoji: '🌙' },
  bengal: { id: 'bengal', name: '榜葛剌使臣', title: '奉國王之命送禮', emoji: '🦒' },
};

/** Feelings at the moment the quiz ends and the voyage talk begins. */
export const INITIAL_BONDS: Record<string, number> = {
  wang: 42,
  ma: 12,
  zhou: 0,
  champa: 0,
  shi: 0,
  chen: 0,
  malacca: 0,
  semu: 0,
  monk: 0,
  envoy: 0,
  fei: 0,
  calicut: 0,
  hormuz: 0,
  mogadishu: 0,
  bengal: 0,
};

export function bondName(id: string): string {
  return CHARACTERS[id]?.name ?? id;
}
