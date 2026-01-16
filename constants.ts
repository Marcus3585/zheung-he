import { Location, Route, GameEvent, QuizQuestion } from './types.ts';

// 地點數據 (對應 3D 地圖座標)
export const LOCATIONS: Location[] = [
  { id: 'nanjing', name: 'Nanjing', nameCn: '南京 (劉家港)', lat: 31.5, lng: 121.1, description: '明朝航海起點，六國碼頭。', tradeGoods: ['絲綢', '瓷器'] },
  { id: 'champa', name: 'Champa', nameCn: '占城', lat: 13.9, lng: 109.3, description: '今越南南部，重要的首個補給站。', tradeGoods: ['稻米', '烏木'] },
  { id: 'palembang', name: 'Palembang', nameCn: '舊港', lat: -2.97, lng: 104.77, description: '剿滅海盜陳祖義之地。', tradeGoods: ['香料'] },
  { id: 'malacca', name: 'Malacca', nameCn: '滿剌加', lat: 2.2, lng: 102.25, description: '戰略海峽控制點，設有官廠。', tradeGoods: ['錫', '倉儲'] },
  { id: 'semudera', name: 'Semudera', nameCn: '蘇門答腊', lat: 5.18, lng: 97.14, description: '蘇門答臘北部，曾發生蘇干剌叛亂。', tradeGoods: ['胡椒', '硫磺'] },
  { id: 'ceylon', name: 'Ceylon', nameCn: '錫蘭', lat: 6.9, lng: 79.8, description: '佛牙寺所在地，曾發生衝突。', tradeGoods: ['寶石', '珍珠'] },
  { id: 'indianocean', name: 'Indian Ocean', nameCn: '印度洋', lat: 0, lng: 88, description: '廣袤的海洋，需牽星術導航。', tradeGoods: [] }, // 虛擬節點用於事件
  { id: 'calicut', name: 'Calicut', nameCn: '古里', lat: 11.25, lng: 75.78, description: '西洋大港，主要貿易中心。', tradeGoods: ['胡椒', '棉布'] },
  { id: 'hormuz', name: 'Hormuz', nameCn: '忽鲁谟斯', lat: 27.1, lng: 56.4, description: '波斯灣門戶，極其富庶。', tradeGoods: ['地毯', '馬匹'] },
  { id: 'bengal', name: 'Bengal', nameCn: '榜葛剌', lat: 23.0, lng: 90.0, description: '進貢麒麟之國。', tradeGoods: ['長頸鹿'] },
];

export const ROUTES: Route[] = [
  { start: 'nanjing', end: 'champa', voyages: [1] },
  { start: 'champa', end: 'palembang', voyages: [1] },
  { start: 'palembang', end: 'malacca', voyages: [1] },
  { start: 'malacca', end: 'semudera', voyages: [1] },
  { start: 'semudera', end: 'ceylon', voyages: [1] },
  { start: 'ceylon', end: 'calicut', voyages: [1] },
  { start: 'calicut', end: 'hormuz', voyages: [1] },
  { start: 'calicut', end: 'bengal', voyages: [1] }, // 簡化路徑用於視覺
];

// 遊戲題庫
export const QUIZ_QUESTIONS: QuizQuestion[] = [
    { question: '鄭和下西洋始於哪位皇帝在位期間？', options: ['明太祖朱元璋', '明成祖朱棣', '明仁宗朱高熾', '明宣宗朱瞻基'], correct: 1, explanation: '始於明成祖朱棣永樂三年（1405年）。' },
    { question: '鄭和的艦隊最遠到達哪個地區？', options: ['日本', '印度', '非洲東岸', '歐洲'], correct: 2, explanation: '最遠到達非洲東岸，如木骨都束（今索馬利亞）。' },
    { question: '鄭和一共進行了多少次下西洋的航行？', options: ['五次', '六次', '七次', '八次'], correct: 2, explanation: '前後歷時近三十年，共七次。' },
    { question: '鄭和原名馬三保，他的宗教信仰是什麼？', options: ['佛教', '道教', '伊斯蘭教', '基督教'], correct: 2, explanation: '他是回族穆斯林，信仰伊斯蘭教。' },
    { question: '鄭和艦隊中最大的船隻被稱為什麼？', options: ['戰船', '寶船', '龍船', '福船'], correct: 1, explanation: '最大的船隻稱為「寶船」。' },
    { question: '鄭和下西洋的主要目的是什麼？', options: ['掠奪財富', '宣揚國威', '尋找新大陸', '傳播基督教'], correct: 1, explanation: '目的是「宣德化而柔遠人」，宣揚國威與發展朝貢貿易。' },
    { question: '鄭和在舊港（今印尼巨港）擊敗了哪個海盜？', options: ['張保仔', '陳祖義', '王直', '鄭芝龍'], correct: 1, explanation: '擊敗並生擒了海盜王陳祖義。' },
    { question: '鄭和艦隊使用什麼方法在海上確定方位？', options: ['GPS', '牽星術', '雷達', '無線電'], correct: 1, explanation: '使用「牽星術」觀測星象定位。' },
    { question: '馬歡著有哪本記錄航行見聞的書籍？', options: ['《島夷誌略》', '《瀛涯勝覽》', '《西洋番國志》', '《海國圖志》'], correct: 1, explanation: '馬歡著有《瀛涯勝覽》。' },
    { question: '「西洋」主要指的是哪個海域？', options: ['太平洋', '大西洋', '印度洋及東南亞', '北冰洋'], correct: 2, explanation: '指文萊以西的東南亞及印度洋海域。' },
    { question: '榜葛剌國進貢的「麒麟」實際上是什麼？', options: ['大象', '長頸鹿', '獅子', '犀牛'], correct: 1, explanation: '實際上是長頸鹿。' },
    { question: '鄭和在哪個地方設立了「官廠」？', options: ['占城', '滿剌加', '錫蘭', '古里'], correct: 1, explanation: '在滿剌加（馬六甲）設立了官廠作為補給基地。' },
    { question: '鄭和艦隊的規模大約有多少人？', options: ['一千人', '五千人', '二萬七千人', '十萬人'], correct: 2, explanation: '首次出航約有二萬七千八百餘人。' },
    { question: '鄭和下西洋後，明朝實行什麼政策導致衰退？', options: ['開放貿易', '海禁政策', '殖民擴張', '航海鼓勵'], correct: 1, explanation: '明朝後來實行海禁政策，停止了大規模遠航。' },
    { question: '鄭和被賜姓「鄭」是因為？', options: ['出生鄭州', '靖難之役立功', '祖先姓鄭', '信奉神明'], correct: 1, explanation: '因在靖難之役（鄭村壩戰役）立功，朱棣賜姓鄭。' }
];

// 遊戲事件腳本
export const GAME_EVENTS: GameEvent[] = [
  {
      stage: 1, locationId: 'nanjing', icon: '🌊', title: '啟航・南海風雲',
      description: '艦隊駛離劉家港，進入南海。前方烏雲密佈，風暴將至。',
      choices: [
          { title: '【穩健】避開風暴', effects: { trust: -10, morale: 5 }, successText: '行程延誤，皇帝對進度感到不滿。', autoSuccess: true },
          { title: '【學識】觀星找航道', requirement: { stat: 'knowledge', value: 4 }, requirementText: '需學識≥4', effects: { trust: 10, morale: 5 }, failEffects: { trust: -15, morale: -20 }, successText: '利用牽星術成功穿越！', failText: '判斷失誤，船隻受損，信任大減。', needsChallenge: true },
          { title: '【激勵】強行通過', requirement: { stat: 'connections', value: 3 }, requirementText: '需人脈≥3', effects: { trust: 15, morale: -10 }, failEffects: { trust: -5, morale: -30 }, successText: '船員爆發勇氣穿越風暴！', failText: '損失慘重，士氣低落。', needsChallenge: true }
      ]
  },
  {
      stage: 2, locationId: 'champa', icon: '🌴', title: '占城・初次邦交',
      description: '抵達首站占城，國王態度謹慎，不知大明來意。',
      choices: [
          { title: '【威懾】展示實力', effects: { trust: 5, morale: 5 }, failEffects: { trust: -10, morale: -5 }, successText: '旌旗蔽日，國王震懾。', failText: '過於張揚，引發戒心，有損國體。', needsChallenge: true },
          { title: '【和平】贈送禮物', requirementText: '耗銀20', cost: { silver: 20 }, effects: { trust: 0, morale: 5, connections: 1 }, successText: '建立友好關係，獲取補給。', autoSuccess: true },
          { title: '【文化】展示文明', requirement: { stat: 'knowledge', value: 3 }, requirementText: '需學識≥3', effects: { trust: 5, morale: 5, knowledge: 1 }, successText: '軟實力外交贏得人心。', autoSuccess: true }
      ]
  },
  {
      stage: 3, locationId: 'palembang', icon: '🏴‍☠️', title: '舊港・海盜陳祖義',
      description: '海盜王陳祖義盤據於此，假意歸降，實則暗藏殺機。',
      choices: [
          { title: '【武力】全力進攻', requirementText: '耗銀30', cost: { silver: 30 }, effects: { trust: 15, morale: -15 }, failEffects: { trust: -20, morale: -30 }, successText: '生擒陳祖義，威震南洋！', failText: '損失慘重，皇帝震怒。', needsChallenge: true },
          { title: '【外交】談判招安', requirement: { stat: 'connections', value: 5 }, requirementText: '需人脈≥5', effects: { trust: 5, morale: 5, connections: 1 }, failEffects: { trust: -15, morale: -10 }, successText: '分化了海盜勢力。', failText: '談判破裂，使者被扣。', needsChallenge: true },
          { title: '【智取】識破詐降', requirement: { stat: 'knowledge', value: 5 }, requirementText: '需學識≥5', effects: { trust: 20, morale: 5 }, failEffects: { trust: -10, morale: -15 }, successText: '將計就計，一舉殲滅！', failText: '計劃有漏，未能全殲。', needsChallenge: true },
          { title: '【防禦】嚴加戒備', effects: { trust: -5, morale: -5 }, successText: '雖然保全了艦隊，但未能剿滅海盜，留有後患。', autoSuccess: true }
      ]
  },
  { stage: 4, locationId: 'malacca', icon: '🏝️', title: '滿剌加・建立官廠', description: '抵達戰略要地滿剌加，暹羅在側虎視眈眈。', choices: [{ title: '冊封國王', effects: { trust: 10, morale: 5 }, successText: '兩國正式建交。', autoSuccess: true }, { title: '建立官廠', requirementText: '耗銀40', cost: { silver: 40 }, effects: { trust: 10, morale: 10, connections: 1 }, successText: '建立穩固補給基地。', autoSuccess: true }, { title: '調解紛爭', requirement: { stat: 'connections', value: 4 }, requirementText: '需人脈≥4', effects: { trust: 15, morale: 10, connections: 1 }, failEffects: { trust: -5, morale: -5 }, successText: '展現大國調停能力。', needsChallenge: true }] },
  { stage: 5, locationId: 'semudera', icon: '🌋', title: '蘇門答臘・火山', description: '火山噴發，遮天蔽日，漁民驚慌逃難。', choices: [{ title: '緊急撤離', effects: { trust: -5, morale: 5 }, successText: '安全第一，全員撤離，但錯失考察機會。', autoSuccess: true }, { title: '救助災民', requirementText: '耗銀25', cost: { silver: 25 }, effects: { trust: 5, morale: 10 }, successText: '仁義之師，贏得民心。', autoSuccess: true }, { title: '科學觀察', requirement: { stat: 'knowledge', value: 4 }, requirementText: '需學識≥4', effects: { trust: 5, knowledge: 2 }, successText: '留下珍貴紀錄。', autoSuccess: true }] },
  { stage: 6, locationId: 'ceylon', icon: '💎', title: '錫蘭・佛牙寺', description: '國王亞烈苦奈兒設伏，意圖劫持艦隊。', choices: [{ title: '突襲王宮', requirement: { stat: 'knowledge', value: 5 }, requirementText: '需學識≥5', effects: { trust: 25, morale: -5 }, failEffects: { trust: -20, morale: -20 }, successText: '識破詭計，生擒國王！', needsChallenge: true }, { title: '婉拒入宮', effects: { trust: 0, morale: 5 }, successText: '謹慎行事，避開陷阱。', autoSuccess: true }, { title: '參拜佛牙', requirement: { stat: 'connections', value: 5 }, requirementText: '需人脈≥5|耗銀30', cost: {silver:30}, effects: { trust: 10, connections:1 }, successText: '爭取了當地民心。', needsChallenge: true }] },
  { stage: 7, locationId: 'indianocean', icon: '🌅', title: '印度洋・無風帶', description: '海面平靜如鏡，帆船無法動彈，淡水告急。', choices: [{ title: '嚴格配給', effects: { trust: 0, morale: -20 }, successText: '艱難度過危機，船員怨聲載道。', autoSuccess: true }, { title: '祭祀祈風', requirementText: '耗銀25', cost: { silver: 25 }, effects: { trust: 0, morale: 15 }, successText: '海神庇佑，風起帆揚！', autoSuccess: true }, { title: '科學應對', requirement: { stat: 'knowledge', value: 5 }, requirementText: '需學識≥5', effects: { trust: 10, knowledge: 1 }, successText: '利用洋流推進，展現智慧。', needsChallenge: true }] },
  { 
      stage: 8, locationId: 'calicut', icon: '🕌', title: '古里・香料貿易', description: '抵達西洋貿易中心，各國商賈雲集。', 
      choices: [
          { title: '簽訂協定', requirementText: '耗銀50', cost: { silver: 50 }, effects: { trust: 15, silver: 30 }, successText: '貿易獲利豐厚。', autoSuccess: true }, 
          { title: '安撫商人', requirement: { stat: 'connections', value: 5 }, requirementText: '需人脈≥5', effects: { trust: 5, connections: 1 }, failEffects: { trust: -5, morale: -10 }, successText: '化解了商業敵意。', needsChallenge: true },
          { title: '文化考察', requirement: { stat: 'knowledge', value: 4 }, requirementText: '需學識≥4', effects: { trust: 5, knowledge: 2 }, successText: '豐富了對西洋的認知。', autoSuccess: true },
          { title: '【僅作補給】', effects: { trust: -5 }, successText: '完成了基本補給，空手而歸。', autoSuccess: true }
      ] 
  },
  { stage: 9, locationId: 'hormuz', icon: '🏺', title: '忽魯謨斯・疫病', description: '港口爆發疫病，人心惶惶。', choices: [{ title: '隔離防疫', effects: { trust: -5, morale: -10 }, successText: '全艦無人感染，但錯失外交機會。', autoSuccess: true }, { title: '醫術救援', requirement: { stat: 'knowledge', value: 6 }, requirementText: '需學識≥6|耗銀30', cost: { silver: 30 }, effects: { trust: 20, morale: 10 }, failEffects: { trust: -15, morale: -20 }, successText: '妙手回春，大明醫術揚名海外。', needsChallenge: true }, { title: '快速補給', requirementText: '耗銀20', cost: { silver: 20 }, effects: { trust: 0, morale: 5 }, successText: '盡快離開了疫區。', autoSuccess: true }] },
  { 
      stage: 10, locationId: 'bengal', icon: '🦒', title: '榜葛剌・麒麟', description: '國王進貢神獸。長頸、斑紋...這真的是麒麟嗎？', 
      choices: [
          { title: '學識鑑定', requirement: { stat: 'knowledge', value: 5 }, requirementText: '需學識≥5', effects: { trust: 20, morale: 15, qilin: true }, failEffects: { trust: -20, morale: -5 }, successText: '確認為祥瑞麒麟！', failText: '無法確認，錯失良機，皇帝大失所望。', needsChallenge: true, isQilinEvent: true }, 
          { title: '接受進貢', requirement: { stat: 'connections', value: 5 }, requirementText: '需人脈≥5', effects: { trust: 10, morale: 10 }, successText: '帶回珍禽異獸，皇帝還算滿意。', autoSuccess: true },
          { title: '【謹慎行事】只接受貢品', effects: { trust: -5, morale: 5 }, successText: '穩妥起見，不帶回未知動物，錯失祥瑞。', autoSuccess: true }
      ] 
  }
];