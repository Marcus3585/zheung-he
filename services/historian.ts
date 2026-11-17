/**
 * On-device historian. No network, no model API.
 * Keyword scoring over a small Traditional Chinese knowledge base.
 */

export interface HistorianTurn {
  role: string;
  text: string;
}

interface Boost {
  pattern: RegExp;
  weight: number;
}

interface Entry {
  id: string;
  keywords: string[];
  boosts?: Boost[];
  answer: string;
  more?: string;
}

const S2T: Record<string, string> = {
  郑: '鄭', 宝: '寶', 国: '國', 东: '東', 长: '長', 颈: '頸', 马: '馬',
  欢: '歡', 罗: '羅', 盘: '盤', 丝: '絲', 绸: '綢', 贸: '貿', 贡: '貢',
  妈: '媽', 牵: '牽', 术: '術', 盗: '盜', 陈: '陳', 义: '義', 旧: '舊',
  满: '滿', 锡: '錫', 兰: '蘭', 鲁: '魯', 谟: '謨', 苏: '蘇', 门: '門',
  腊: '臘', 乐: '樂', 几: '幾', 为: '為', 这: '這', 个: '個', 时: '時',
  经: '經', 过: '過', 从: '從', 发: '發', 现: '現', 书: '書', 记: '記',
  录: '錄', 费: '費', 银: '銀', 两: '兩', 钱: '錢', 广: '廣', 刘: '劉',
  万: '萬', 舰: '艦', 队: '隊', 航: '航', 海: '海', 洋: '洋', 历: '歷',
  史: '史', 宫: '宮', 厂: '廠', 仓: '倉', 库: '庫', 兽: '獸', 龙: '龍',
  凤: '鳳', 盐: '鹽', 药: '藥', 医: '醫', 针: '針', 罗盘: '羅盤',
};

function fold(input: string): string {
  let text = input.trim().toLowerCase();
  text = text.replace(/什麼|什么|甚麼|甚么/g, '甚麼');
  let out = '';
  for (const ch of text) out += S2T[ch] ?? ch;
  return out;
}

const ENTRIES: Entry[] = [
  {
    id: 'overview',
    keywords: ['鄭和', '三寶', '三宝太監', '下西洋', 'ma sanbao', 'zheng he', 'cheng ho'],
    boosts: [{ pattern: /是誰|何人|介紹|講鄭和/, weight: 4 }],
    answer: '鄭和本姓馬，小字三保，昆陽人，回族，信伊斯蘭教。燕王朱棣起兵時他在鄭村壩立了功，獲賜姓鄭。永樂三年起，他奉命率寶船隊下西洋，前後七次，把大明的絲綢、瓷器和詔書送到南海和印度洋沿岸。',
    more: '他不是去佔地。船隊帶的是賞賜、曆法和願意說話的人。沿途也有過仗，譬如舊港的陳祖義、錫蘭的亞烈苦奈兒，但主線仍是朝貢和通好。你想先聽哪一次航行？',
  },
  {
    id: 'voyages',
    keywords: ['七次', '七下', '幾次', '多少次', '幾下', 'years', 'voyage'],
    boosts: [{ pattern: /七|幾次|多少/, weight: 6 }],
    answer: '史書記鄭和七下西洋。永樂三年到宣德八年，前後近三十年。第一、三次規模最大；第四次最遠觸到忽魯謨斯一帶，麒麟也在這前後進京；第五、六次有船分去東非；第七次是宣德年間的最後一趟，鄭和自己沒有再回來。',
    more: '中間隔過洪熙年間的停航。仁宗在位短，遠航暫停，到宣德才再下令。所以「七次」不是年年開船，中間有停、有等。',
  },
  {
    id: 'voyage1',
    keywords: ['第一次', '永樂三年', '1405', '首航', '第一次下西洋'],
    answer: '永樂三年（1405）夏秋，舟師先在太倉劉家港集結，再沿岸南下福建長樂太平港候風。冬天東北季候風起了，才由五虎門放洋，經占城、舊港、滿剌加，再到錫蘭、古里。回航時在舊港生擒陳祖義。不是盛夏從劉家港直衝南海。',
  },
  {
    id: 'voyage2',
    keywords: ['第二次', '1407', '永樂五年'],
    answer: '第二次大約在永樂五年到七年。船隊再訪占城、爪哇、暹羅、滿剌加、錫蘭和古里，把各國使者送回去，也把新的詔書帶出來。有學者說這一次鄭和未必每段都親自在旗艦上，副使分艙而行很常見。課堂上仍把它算作七次裡的一次。',
  },
  {
    id: 'voyage3',
    keywords: ['第三次', '1409', '錫蘭山', '亞烈苦奈兒'],
    answer: '第三次約永樂七年至九年。滿剌加的官廠在這前後成為船隊的海外倉。錫蘭山國王亞烈苦奈兒誘鄭和入城，又去劫船。鄭和帶人突襲王城，把國王帶回南京。朱棣沒有滅他的國，後來放人回去，另立新王。',
  },
  {
    id: 'voyage4',
    keywords: ['第四次', '1413', '蘇幹剌', '蘇干剌', '麒麟進京'],
    answer: '第四次約永樂十一年至十三年，船隊到了忽魯謨斯。蘇門答剌內亂，鄭和幫當地國王捉住篡位的蘇幹剌。榜葛剌進獻的長頸鹿也在永樂十二年前後送到南京，朝中稱它為麒麟。',
  },
  {
    id: 'voyage5',
    keywords: ['第五次', '1417', '忽魯謨斯', '霍爾木茲', 'hormuz'],
    answer: '第五次約永樂十五年至十七年。忽魯謨斯是波斯灣口的大市集，寶石、地毯、馬匹都從這裡轉手。船隊在這裡把大明的瓷器和絲綢擺出來，也把各國貢使接上船，送他們去南京。',
  },
  {
    id: 'voyage6',
    keywords: ['第六次', '1421', '分蹤', '分艙'],
    answer: '第六次約永樂十九年至二十年。船隊在古里一帶分蹤：有的去忽魯謨斯，有的西渡，到木骨都束、卜剌哇、麻林地。帶回來的異獸裡，有斑馬，當時叫花福鹿，還有獅子。',
  },
  {
    id: 'voyage7',
    keywords: ['第七次', '最後一次', '宣德五年', '1431', '1433', '病逝', '去世', '死'],
    answer: '宣德五年（1431）船再出劉家港，這是第七次，也是最後一次。鄭和已經六十上下。一說他病逝於古里，一說死在歸途，靈柩或葬在南京牛首山。史書沒有寫死一個地點。船隊仍在宣德八年回國。之後大明不再派出這樣的艦隊。',
    more: '長樂《天妃靈應之記》碑立在這一次出發前後，把前六次的行程刻了下來。碑還在，比許多散失的航海檔更靠得住。',
  },
  {
    id: 'yongle',
    keywords: ['永樂', '朱棣', '明成祖', '成祖', '燕王'],
    answer: '下西洋是明成祖朱棣的決定。他以靖難登位，需要讓海外知道新皇帝是誰，也要尋找建文帝的下落——這後一個說法史家仍有爭論，不宜說成唯一原因。碑上寫的是「宣德化而柔遠人」：把聲教送出去，以禮相待遠方的人。',
  },
  {
    id: 'xuande',
    keywords: ['宣德', '朱瞻基', '宣宗', '明宣宗'],
    answer: '第七次是明宣宗朱瞻基下的令。永樂之後，仁宗曾停航。宣德年間海外朝貢稀了，皇帝想再把關係接上，於是讓鄭和再走一趟。這也是寶船隊的收梢。',
  },
  {
    id: 'hongxi',
    keywords: ['洪熙', '仁宗', '朱高熾', '停止下西洋'],
    answer: '明仁宗朱高熾在位只有一年左右。他聽夏原吉等人的話，覺得遠航太費，下旨暫停。所以七次之間不是一條不斷的線，中間有人喊停。到宣德才再打開。',
  },
  {
    id: 'nanjing',
    keywords: ['劉家港', '南京', '太倉', '六國碼頭', '出發', '啟航', 'liujiagang', 'nanjing'],
    answer: '南京是朝命所出，太倉劉家港才是集結的碼頭。永樂三年夏秋，船在這裡編隊、祭天妃，然後沿岸南下長樂太平港候風。冬天東北季候風盛行，才由五虎門放洋。不要把這一段說成盛夏直渡南海。',
  },
  {
    id: 'champa',
    keywords: ['占城', '越南', 'champa', '新州'],
    answer: '占城在今越南中南部，是出南海後的第一個大站。國王與大明通好，船在這裡補米、修桅，再南下。馬歡寫過那裡的衣服、曆法和信奉。它是補給港，不是戰場。',
  },
  {
    id: 'palembang',
    keywords: ['舊港', '陳祖義', '巨港', '海盜', 'palembang', '三佛齊'],
    answer: '舊港就是今天印尼的巨港，舊稱三佛齊一帶。華人海商陳祖義盤據在此，假意受招，實則想劫船。鄭和將計就計，永樂五年把他生擒，押回南京處死。馬六甲海峽這一段因此安靜了許多年。',
    more: '這不是無故開打。陳祖義先詐降。船上的選擇若只會躲，海盜還在；若只會衝，船會傷。史書誇的是他識破詐降。',
  },
  {
    id: 'malacca',
    keywords: ['滿剌加', '馬六甲', '官廠', 'malacca', '麻六甲'],
    answer: '滿剌加扼着海峽，季候風在這裡轉向。當地君主願意合作，船隊才設官廠：馬歡說外有木柵、更鼓，內有倉庫，存放錢糧和番貨。分艙的船在此會合，候五月西南風再結隊回去。這是中轉倉，不是殖民地。',
  },
  {
    id: 'semudera',
    keywords: ['蘇門答剌', '蘇門答臘', '蘇木都剌', '南浡利', 'semudera', 'pasai'],
    answer: '蘇門答剌在蘇門答臘島北端，出產胡椒、硫磺。第四次航行時當地內亂，鄭和按先王的約定支持舊王之子，捉住蘇幹剌。這裡也是船隊西去錫蘭之前的最後一個大港。',
  },
  {
    id: 'ceylon',
    keywords: ['錫蘭', '斯里蘭卡', '佛牙', 'ceylon', 'sri lanka', '亞烈'],
    answer: '錫蘭山就是今天的斯里蘭卡。第三次航行，國王亞烈苦奈兒設伏。鄭和沒有困在城裡，反而攻進王城，把國王帶回。島上有佛寺，船隊也曾經禮佛、立碑。仗打完，朝貢還是接回去。',
  },
  {
    id: 'ocean',
    keywords: ['印度洋', '無風', '赤道', '牽星', '怎麼航海', '導航', '定位'],
    boosts: [{ pattern: /印度洋|無風|迷路/, weight: 3 }],
    answer: '過了錫蘭就是印度洋。沒有海岸可看的時候，靠羅盤定方向，夜裡用牽星術量星星離海平面有多高。船會在無風帶裡發悶，淡水比金貴。這一段考的是耐心和星圖，不是勇氣本身。',
  },
  {
    id: 'qianxing',
    keywords: ['牽星術', '牽星板', '星象', '牽星', '北斗', '過洋牽星'],
    answer: '牽星術是看星的高度。航海的人伸直手臂，用一組大小不同的木板（牽星板）去比星星離水平線幾「指」。板越大，星越低，船就越偏南或偏北。再配上羅盤和熟路的更數，才敢橫渡印度洋。沒有衛星，也沒有海圖上的經緯網。',
    more: '《鄭和航海圖》裡有「過洋牽星」的圖。圖上的單位是指和角，不是今天的度。你在遊戲裡選「觀星找航道」，說的就是這門手藝。',
  },
  {
    id: 'tianfei',
    keywords: ['天妃', '媽祖', '天后', '靈應', '祭祀', '海神'],
    answer: '天妃就是沿海的媽祖。鄭和出海前、歸航後都祭祀她。福建長樂的《天妃靈應之記》碑，和他在劉家港的碑，是第七次前後留下的第一手文字。水手信她，不是因為她會算航線，是因為大洋上需要一個肯聽人說話的神。',
  },
  {
    id: 'ship',
    keywords: ['寶船', '福船', '桅', '硬帆', '帆', '多大', '四十四丈', 'junk', 'treasure ship'],
    boosts: [{ pattern: /寶船|福船|船有多|長多少/, weight: 5 }],
    answer: '寶船是船隊裡體勢最大的官船，近於福建福船：底較平、船身寬、尾樓高、船頭較低。帆是長方硬帆，橫向有竹骨，可以迅速收放，顏色偏赭、朱。艙裡有水密隔艙。不是三角帆，也不是後來的歐洲蓋倫。',
    more: '《明史》寫過「長四十四丈四尺」，那不是定案。靜海寺殘碑記的是二千料海船，不少學者把主力大船估在大約五十到七十五米。課堂上先記工藝：多桅、竹骨硬帆、水密隔艙、官船很大。遊戲裡那艘船就是按這些特徵做的。',
  },
  {
    id: 'tribute',
    keywords: ['朝貢', '貿易', '賞賜', '絲綢', '瓷器', '胡椒', '得不償失', '六百萬'],
    answer: '這不是今天的自由貿易。大明賞出去的絲綢、瓷器、銅錢，往往比收進來的胡椒、寶石更值錢。換到的是使節、國書，和「海外知道南京」這件事。所以有人說值得：海路通了，南洋多了華人的市集。也有人說不值得：國庫空了，帶回來的多是宮裡的玩好。',
    more: '後來常被引用的「費錢數百萬」並沒有一筆清楚的帳本。你可以站在任何一邊，只要說出你用的是哪一件史事：官廠、麒麟、海禁，還是賞賜太厚。',
  },
  {
    id: 'slogan',
    keywords: ['宣德化而柔遠人', '柔遠人', '宣德化', '目的', '為甚麼下西洋', '為甚麼'],
    boosts: [{ pattern: /目的|為甚麼|為何|原因/, weight: 4 }],
    answer: '這八個字出自長樂天妃碑。意思是：把文明和德意傳出去，對遠方的人溫和。它是官方的說法。私底下還有宣示新皇帝、招徠朝貢、也許還有尋訪建文帝。幾種原因可以並存，不必只揀一個當成標準答案。',
  },
  {
    id: 'mahuan',
    keywords: ['馬歡', '瀛涯勝覽', '費信', '星槎勝覽', '鞏珍', '西洋番國志'],
    answer: '馬歡是船隊的通事，會阿拉伯語，寫了《瀛涯勝覽》。書裡是他親眼見過的港口：占城的禮俗、古里的交易、忽魯謨斯的市集。另外費信有《星槎勝覽》，鞏珍有《西洋番國志》。想核對遊戲裡的港口，先翻馬歡。',
  },
  {
    id: 'calicut',
    keywords: ['古里', '卡利卡特', 'calicut', 'kozhikode', '西洋大港'],
    answer: '古里在今天印度喀拉拉的卡利卡特，當時是西洋貿易的大樞紐。胡椒、棉布從這裡散去四方。鄭和多次以古里為西航的主港，分艙的船從這裡各自開往忽魯謨斯、榜葛剌或東非。第七次，也有他病逝於此的說法。',
  },
  {
    id: 'hormuz',
    keywords: ['忽魯謨斯', '霍爾木茲', '波斯', 'hormuz'],
    answer: '忽魯謨斯在波斯灣口，乾熱，石頭城，水卻極忙。地毯、馬、寶石在這裡換手。第五次前後，寶船把大明的貨擺上碼頭，也把波斯的使者接到船上。它是這條航線西端最富的一站。',
  },
  {
    id: 'bengal',
    keywords: ['榜葛剌', '孟加拉', '麒麟', '長頸鹿', 'giraffe', 'bengal'],
    answer: '麒麟不是永樂三年首航的收穫。永樂十二年（1414）秋九月，第四次下西洋期間，榜葛剌使臣把一頭長頸鹿送進北京。牠原產東非，經印度洋海商轉來。索馬里語音近「麒麟」，沈度畫了《瑞應麒麟圖》。翌年（1415）麻林也獻過一頭。',
    more: '遊戲把這件事放在航程後段，當作跨了許多年的目標，不是 1405 年在占城或古里順手牽走的。你可以核對牠是不是瑞獸，也可以只收常規貢品。',
  },
  {
    id: 'mogadishu',
    keywords: ['木骨都束', '摩加迪沙', 'mogadishu', '麻林', '東非', '非洲', '花福鹿', '斑馬', '卜剌哇'],
    answer: '木骨都束在今天索馬里的摩加迪沙，珊瑚石砌的城，面向印度洋。第五、六次有分艙船來到這裡和麻林地。帶回去的花福鹿是斑馬，還有龍涎香。這是船隊走到的最遠海岸之一，不是傳說裡的歐洲。',
  },
  {
    id: 'haiban',
    keywords: ['海禁', '劉大夏', '成化', '停止', '為甚麼不再', '後來'],
    answer: '第七次之後，朝廷不再維持這麼大的船隊。北邊有蒙古的壓力，漕運和營建也費錢。成化年間還有劉大夏藏起（或說毀去）鄭和的檔案這段公案，細節有爭論，結果是航海的細圖失傳了。海禁一緊，民間的船還在走，官家的寶船沒有了。',
  },
  {
    id: 'wang',
    keywords: ['王景弘', '副使', '侯顯'],
    answer: '王景弘是鄭和最要緊的副手，多次一同出使，第七次也在船隊裡。船那麼多，不可能每艘都由鄭和親自掌舵，分艙、分使是常態。侯顯則多次往返榜葛剌等地。記得除了旗艦上的人，還有一整隊會辦事的人。',
  },
  {
    id: 'faith',
    keywords: ['伊斯蘭', '回回', '穆斯林', '宗教', '信仰', '佛教'],
    answer: '鄭和是回族穆斯林，父親曾往麥加。船隊裡也有佛教、道教的祭祀，天妃廟更是每次都拜。他本人的信仰沒有妨礙他在錫蘭禮佛、在占城入鄉隨俗。這支艦隊本來就是為了跟不同的人說話。',
  },
  {
    id: 'crew',
    keywords: ['二萬', '兩萬', '多少人', '幾萬', '人數', '27800'],
    answer: '第一次出海，隨船的軍士、水手、醫官、通事、伙夫，加起來大約二萬七千八百人。不是一艘船，是一支城在海上移動。所以淡水、米和疫病，比一場小仗更要命。',
  },
  {
    id: 'stele',
    keywords: ['天妃靈應之記', '長樂', '碑', '劉家港碑'],
    answer: '宣德六年，鄭和在福建長樂立《天妃靈應之記》碑，把前六次的年月和所到之國刻上去，並寫明第七次即將出發。劉家港也有內容相近的碑。要核對「去了哪裡」，碑比後來的小說可靠。',
  },
  {
    id: 'interpreter',
    keywords: ['通事', '翻譯', '語言'],
    answer: '通事就是譯員。船隊帶了懂阿拉伯語、波斯語和南海語言的人，馬歡是其中一位。沒有他們，賞賜送得出去，話卻說不回來。遊戲裡的「人脈」，有一部分就是這些肯替你開口的人。',
  },
  {
    id: 'xiyang',
    keywords: ['西洋', '文萊', '哪片海', '印度洋及'],
    answer: '明代說的西洋，大體是文萊以西：南海西部、滿剌加海峽，再出去的印度洋，直到阿拉伯和東非。不是大西洋，更不是後來歐洲人說的「新大陸」。方向以劉家港為家，向西走。',
  },
  {
    id: 'game',
    keywords: ['遊戲', '學識', '人脈', '銀兩', '信任', '士氣', '怎麼玩', '選擇'],
    answer: '這艘船上，信任是皇上還肯不肯等你，士氣是水手還肯不肯跟你。學識夠，才看得懂星圖和詐降；人脈夠，才有人替你說項。銀兩是賞賜和補給，不是用來亂花的。選項若寫着學識或人脈不夠，那條路當下就走不通。',
  },
];

const OFF_TOPIC = '這件我船上的檔沒有記。我只管鄭和的七次航行、寶船、朝貢，和沿途那些港口。你想先問哪一次，還是哪一座城？';

let lastEntryId: string | null = null;

interface CorpusEntry extends Entry {
  blob: string;
}

const CORPUS: CorpusEntry[] = ENTRIES.map((entry) => ({
  ...entry,
  blob: fold([entry.keywords.join(' '), entry.answer, entry.more ?? ''].join('\n')),
}));

/** Short words that show up in almost every note and should not decide a match. */
const STOP_GRAMS = new Set([
  '不是', '這個', '可以', '我們', '他們', '一個', '因為', '所以', '然後', '沒有', '就是',
  '這裡', '那裡', '甚麼', '一下', '以及', '或者', '如果', '已經', '還是', '不要', '這是',
  '船隊', '大明', '南京', '朝廷', '海上', '後來', '當時', '今天', '知道',
]);

function entryCount(gram: string): number {
  let count = 0;
  for (const entry of CORPUS) {
    if (entry.blob.includes(gram)) count += 1;
  }
  return count;
}

/**
 * Score a question by phrases that already appear in that entry's answer.
 * 「冬天由五虎門放洋」 reuses wording from the 劉家港 note, so it must hit
 * that note even though those words were not listed as separate keywords.
 */
function overlapScore(blob: string, text: string): number {
  let score = 0;
  const counted: string[] = [];
  const runs = text.match(/[\u4e00-\u9fff]+/g) ?? [];
  for (const n of [6, 5, 4, 3, 2]) {
    for (const run of runs) {
      for (let i = 0; i + n <= run.length; i++) {
        const gram = run.slice(i, i + n);
        if (STOP_GRAMS.has(gram)) continue;
        if (counted.some((hit) => hit.includes(gram))) continue;
        if (!blob.includes(gram)) continue;
        const docs = entryCount(gram);
        if (docs === 0) continue;
        score += (n * n) / docs;
        counted.push(gram);
      }
    }
  }
  return score;
}

function scoreEntry(entry: CorpusEntry, text: string): number {
  let score = overlapScore(entry.blob, text);
  for (const keyword of entry.keywords) {
    const needle = fold(keyword);
    if (needle.length >= 2 && text.includes(needle)) {
      score += Math.min(needle.length, 8) + 1;
    }
  }
  for (const boost of entry.boosts ?? []) {
    if (boost.pattern.test(text)) score += boost.weight;
  }
  return score;
}

export function answerHistorian(message: string, _history: HistorianTurn[] = []): string {
  const text = fold(message);
  if (!text) return '你想問港口、寶船，還是某一次航行？我在。';

  if (/^(你好|您好|嗨|哈囉|早安|午安|晚上好)/.test(text)) {
    return '你好。艙燈還亮着。航路、港口，或是這艘船為甚麼造成這樣，直接問就行。';
  }

  if (/詳細|講多|然後呢|還有呢|繼續說|唔該再|再講/.test(text) && lastEntryId) {
    const previous = CORPUS.find((entry) => entry.id === lastEntryId);
    if (previous?.more) return previous.more;
    return '剛才那段，船上能記的大概就是這樣。換一個港口，或換一次航行，我再往下說。';
  }

  let best: CorpusEntry | null = null;
  let bestScore = 0;
  for (const entry of CORPUS) {
    const score = scoreEntry(entry, text);
    if (score > bestScore) {
      best = entry;
      bestScore = score;
    }
  }

  if (!best || bestScore < 3) return OFF_TOPIC;
  lastEntryId = best.id;
  return best.answer;
}

export function gradeLocally(summary: string, reflection: string): {
  score1: number;
  score2: number;
  feedback1: string;
  feedback2: string;
  totalComment: string;
} {
  const q1 = summary.trim();
  const q2 = reflection.trim();
  const folded1 = fold(q1);
  const folded2 = fold(q2);

  const eventWords = ['風暴', '牽星', '占城', '陳祖義', '舊港', '滿剌加', '官廠', '蘇門', '錫蘭', '古里', '忽魯謨斯', '麒麟', '長頸鹿', '木骨都束', '非洲', '信任', '士氣', '銀', '決策', '海盜', '榜葛剌'];
  const hits1 = eventWords.filter((word) => folded1.includes(fold(word))).length;

  let score1 = 4;
  if (q1.length >= 40) score1 = 6;
  if (q1.length >= 80) score1 = 7;
  score1 = Math.min(10, score1 + Math.min(3, hits1));
  if (q1.length < 20) score1 = Math.min(score1, 4);
  if (hits1 === 0 && q1.length < 40) score1 = Math.min(score1, 5);

  const worth = /值得|應該去|有價值|正面|值得的/.test(folded2) && !/不值得/.test(folded2);
  const notWorth = /不值得|勞民|傷財|太貴|負面|不化算|不划算/.test(folded2);
  const both = /兩者|一邊|同時|又值得|也有道理|看情況|中立/.test(folded2) || (worth && /不值得/.test(q2));
  const proWords = ['朝貢', '絲綢', '瓷器', '外交', '交流', '南洋', '和平', '宣德', '技術', '水稻', '海路'];
  const conWords = ['六百萬', '財政', '奢侈', '海禁', '勞民', '負擔', '國庫', '虛耗', '花費'];
  const hits2 = [...proWords, ...conWords].filter((word) => folded2.includes(fold(word))).length;

  let score2 = 4;
  if (worth || notWorth || both) score2 = 6;
  if ((worth || notWorth || both) && hits2 >= 1) score2 = 8;
  if ((worth || notWorth || both) && hits2 >= 2 && q2.length >= 40) score2 = 9;
  if (q2.length < 20) score2 = Math.min(score2, 5);
  score2 = Math.min(10, score2);

  const feedback1 = hits1 > 0
    ? `你寫到了船上真正發生過的事（我數到 ${hits1} 處能對上航路的地名或抉擇）。若再補一句「這個決定讓信任或士氣怎樣變」，就更完整。`
    : '故事的骨架還有點薄。試着寫下一個港口的名字，以及你在那裡做的一個選擇。不用長，具體就好。';

  let feedback2 = '你可以選一邊：值得，或不值得。然後用一件史事撐住它，例如官廠、麒麟、賞賜太厚，或後來的海禁。';
  if (both) feedback2 = '你看見兩邊都有道理，這很好。若能各舉一件史事，一邊一句，論證就站住了。';
  else if (worth) feedback2 = '你站在「值得」這一邊。海路、朝貢和南洋的往來都可以當理由。記得說清楚：值得的是通好，不是佔領。';
  else if (notWorth) feedback2 = '你站在「不值得」這一邊。賞賜太厚、回航後難以維持，都是當時就有人說過的話。用你自己的句子再說一件具體的花費或後果。';
  if (hits2 === 0 && (worth || notWorth || both)) {
    feedback2 += ' 立場有了，還差一條能摸得着的證據。';
  }

  const total = score1 + score2;
  const totalComment = total >= 16
    ? '本機史官按課堂要點看過了。你寫得具體，港口和立場都在。出海的人能把經過說清楚，就已經很不容易。'
    : total >= 12
      ? '本機史官按課堂要點看過了。方向是對的。下次把一個地名和一個理由寫得再硬一點，分數會自己上來。'
      : '本機史官按課堂要點看過了。先別急。挑一個你記得最清楚的港口，用三句話說完：那裡發生了甚麼、你怎樣選、你站在哪一邊。';

  return { score1, score2, feedback1, feedback2, totalComment };
}
