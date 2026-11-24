import { TalkScene } from '../services/talk';

export const EARLY_SCENES: TalkScene[] = [
  {
    id: 'arrival-nanjing',
    locationId: 'nanjing',
    kind: 'arrival',
    kicker: '開船之前',
    entry: 'nj-a1',
    nodes: [
      {
        id: 'nj-a1',
        speakerId: 'wang',
        text: '鄭公，人齊了。太倉碼頭上全是繩索和小聲的咒罵，這是好事，表示船還沒散。我是王景弘。船這麼多，不可能每艘都由你親自掌舵。難聽的話，我來講。',
        choices: [
          { text: '景弘，你自己怎麼看這趟出海？', next: 'nj-a2' },
          {
            text: '先別談心情。米和淡水夠不夠？',
            next: 'nj-a3',
            effects: { bonds: [{ id: 'wang', delta: 2 }] },
          },
          {
            text: '皇上要快。能走就走。',
            next: 'nj-a4',
            effects: { flags: ['tone_hurry'], morale: -2, bonds: [{ id: 'wang', delta: -2 }] },
          },
        ],
      },
      {
        id: 'nj-a2',
        speakerId: 'wang',
        text: '我要的不多。人要回來，船要回來，奏章裡不要出現我沒有見過的海。國威是皇上的字。水手的名字是我的事。你若肯在開口之前先看我一眼，這趟就比較不容易散。',
        choices: [
          {
            text: '有你在，我比較放心。難處我們一起看。',
            next: 'nj-a5',
            effects: { flags: ['wang_relied'], morale: 3, bonds: [{ id: 'wang', delta: 6 }] },
          },
          {
            text: '奏章我自己寫。你把船看好就行。',
            next: 'nj-a6',
            effects: { flags: ['wang_kept_out'], bonds: [{ id: 'wang', delta: -2 }] },
          },
        ],
      },
      {
        id: 'nj-a3',
        speakerId: 'wang',
        text: '不夠從容。二萬多人的嘴，比一場小仗更讓我睡不着。水桶今天是滿的，不代表過了南海還滿。你要是把日子看得比水重，先告訴我，我好去跟火長吵架。',
        choices: [
          {
            text: '那更不能在盛夏硬闖南海。',
            next: 'nj-a5',
            effects: { flags: ['listened_supply'], knowledge: 1, bonds: [{ id: 'wang', delta: 4 }] },
          },
          { text: '省着點，日子照舊。', next: 'nj-a6', effects: { flags: ['keep_schedule'] } },
        ],
      },
      {
        id: 'nj-a4',
        speakerId: 'wang',
        text: '快是怎麼死人的，我見得多。你要快，我不會當着水手跟你吵。我只會把多出來的水桶先藏好，免得有人拿去灌酒。',
        choices: [
          {
            text: '你說得對。這句「快」，我收回。',
            next: 'nj-a5',
            effects: { flags: ['tone_listen'], clearFlags: ['tone_hurry'], morale: 4, bonds: [{ id: 'wang', delta: 5 }] },
          },
          { text: '我聽到了。決定等一下再做。', next: 'nj-a6' },
        ],
      },
      {
        id: 'nj-a5',
        speakerId: 'wang',
        text: '好。這一句我記住。岸上還有個太倉的火長，周聞，他比我們都熟長江口。你去聽他的，比聽鼓聲有用。',
        continueLabel: '我去找周聞。',
      },
      {
        id: 'nj-a6',
        speakerId: 'wang',
        text: '行。周聞在第三艘船的尾樓。他的臉不好看，話倒是準。你去不去，我都已經叫他等你。',
        continueLabel: '去尾樓。',
      },
    ],
  },
  {
    id: 'local-nanjing',
    locationId: 'nanjing',
    kind: 'local',
    kicker: '火長的話',
    entry: 'nj-l1',
    nodes: [
      {
        id: 'nj-l1',
        speakerId: 'zhou',
        text: '正使。我周聞，太倉衛的人，這條江我摸過很多遍。眼前這團雲不要緊。要緊的是你別在這個季節橫渡南海。沿着海岸南下福建長樂太平港，等冬天的東北季候風起來，再由五虎門放洋。盛夏從這裡直衝，是拿人去填海。',
        choices: [
          {
            text: '就照你的辦法。先去長樂候風。',
            next: 'nj-l2',
            effects: {
              flags: ['listened_zhou'],
              knowledge: 1,
              morale: 3,
              bonds: [{ id: 'zhou', delta: 8 }, { id: 'wang', delta: 3 }],
            },
          },
          {
            text: '季候風我知道。五虎門的水，你再講細一點。',
            next: 'nj-l3',
            effects: {
              flags: ['listened_zhou'],
              knowledge: 2,
              bonds: [{ id: 'zhou', delta: 5 }, { id: 'ma', delta: 1 }],
            },
          },
          {
            text: '南京在數日子。我要快。',
            next: 'nj-l4',
            effects: {
              flags: ['rushed_zhou'],
              morale: -4,
              bonds: [{ id: 'zhou', delta: -6 }, { id: 'wang', delta: -3 }],
            },
          },
        ],
      },
      {
        id: 'nj-l2',
        speakerId: 'zhou',
        text: '這就對了。慢幾日，人還在。你到了長樂，先祭天妃，再看風，不要看那些催你的信。信不會沉，人會。',
        continueLabel: '按這個走。',
      },
      {
        id: 'nj-l3',
        speakerId: 'zhou',
        text: '五虎門在閩江口。冬天東北風順，船出得去。夏天那股風跟你作對，帆再大也是跟海賭氣。牽星是出了門以後的事。門都沒出對，星幫不上你。',
        choices: [
          {
            text: '我記下了。候風，再出五虎門。',
            effects: { knowledge: 1, bonds: [{ id: 'zhou', delta: 3 }] },
          },
        ],
      },
      {
        id: 'nj-l4',
        speakerId: 'zhou',
        text: '你是正使，舵最後在你手上。我不會當着全船罵你。可你若闖出了事，別說火長沒講過。長樂還在南邊等。你現在回頭聽，還來得及。',
        choices: [
          {
            text: '……你講得硬。我改，先去候風。',
            effects: {
              flags: ['listened_zhou'],
              clearFlags: ['rushed_zhou'],
              morale: 4,
              bonds: [{ id: 'zhou', delta: 6 }, { id: 'wang', delta: 3 }],
            },
          },
          { text: '我知道你講過了。', effects: { bonds: [{ id: 'zhou', delta: -2 }] } },
        ],
      },
    ],
  },
  {
    id: 'aftermath-nanjing',
    locationId: 'nanjing',
    kind: 'aftermath',
    kicker: '雲過去之後',
    entry: 'nj-z',
    nodes: [
      {
        id: 'nj-z',
        speakerId: 'wang',
        text: '第一段算過去了。長樂的風還在前頭，占城也在前頭。你今天的樣子，岸上的人還不知道。我知道。',
        variants: [
          {
            allFlags: ['listened_zhou', 'storm_caution'],
            text: '繞開那團雲，有人會說你膽小。我說你把人帶在船上。周聞的路你聽了，這一段我寫信回南京，不會替你遮，也不必遮。',
          },
          {
            allFlags: ['rushed_zhou', 'storm_force'],
            text: '你催過周聞，又擂了鼓。船是過去了。有三個水手到現在不看你。我晚上去伙房坐坐，不提你的名字。',
          },
          {
            allFlags: ['storm_caution'],
            text: '繞開是對的。日子慢了，人鬆了。南京那邊愛數日子的人，我去應付。你不必先認錯。',
          },
          {
            allFlags: ['storm_skill'],
            text: '星你看準了。我在下面把人按在崗位上，沒讓他們衝去收帆。我們兩個這樣配，還可以再來一次。',
          },
          {
            allFlags: ['storm_miss'],
            text: '星看岔了。你別先罵自己。先問下一更怎麼補。船板進了水，人還在，就還有下一更。',
          },
          {
            allFlags: ['storm_break'],
            text: '這一闖，傷的比雲多。下次你要擂鼓，先問我人齊不齊。不齊，我不會把鼓槌遞給你。',
          },
          {
            allFlags: ['storm_force'],
            text: '鼓是響了，船也過了。胳膊是酸的。你贏了雲，可別把這一套用到占城的國王身上。',
          },
        ],
        continueLabel: '往南走。占城見。',
      },
    ],
  },
  {
    id: 'arrival-champa',
    locationId: 'champa',
    kind: 'arrival',
    kicker: '見國王之前',
    entry: 'ch-a1',
    nodes: [
      {
        id: 'ch-a1',
        speakerId: 'wang',
        text: '占城到了。出了南海，這是第一個肯接待我們的王國。國王站在樹蔭裡，還沒笑，也沒有放箭。他想先看我們是來討，還是來送。',
        variants: [
          {
            anyFlags: ['storm_force', 'storm_break', 'rushed_zhou'],
            text: '占城到了。國王在樹蔭裡看我們的臉。你在雲裡催過、闖過，這裡把鼓收起來。第一個肯開門的港口，經不起你再表演一次威。',
          },
          {
            allFlags: ['listened_zhou'],
            text: '占城到了。周聞的路走得穩，人才有精神站在甲板上。國王還沒決定要不要笑。我們候風來的，不像來收租的，這句話得讓他看見。',
          },
        ],
        choices: [
          {
            text: '你先去見他，我把禮物整理好。',
            next: 'ch-a2',
            effects: { flags: ['wang_leads_greeting'], bonds: [{ id: 'wang', delta: 3 }] },
          },
          {
            text: '一起去。話由我說，你看着我的分寸。',
            next: 'ch-a3',
            effects: { bonds: [{ id: 'wang', delta: 2 }] },
          },
          {
            text: '讓通事先把禮數問清楚。',
            next: 'ch-a4',
            effects: { flags: ['ma_protocol'], knowledge: 1, bonds: [{ id: 'ma', delta: 4 }, { id: 'wang', delta: 1 }] },
          },
        ],
      },
      {
        id: 'ch-a2',
        speakerId: 'wang',
        text: '我去。我會說我們要淡水，不要他的城。你若中途把甲士排開，我就假裝沒看見，可國王看得見。',
        continueLabel: '我不會拆你的台。',
      },
      {
        id: 'ch-a3',
        speakerId: 'wang',
        text: '那我站在你側後面。你說重了，我咳一聲。你要是不理那一聲，也由你。占巴的賴這個人，面子很薄，記性很長。',
        continueLabel: '我聽得見你咳嗽。',
      },
      {
        id: 'ch-a4',
        speakerId: 'wang',
        text: '馬歡在。他的名字在後來幾次的名冊上更清楚，眼下船上需要一個肯問的人。禮數問清楚再上岸，比多帶一箱布有用。',
        continueLabel: '請他一起上岸。',
      },
    ],
  },
  {
    id: 'local-champa',
    locationId: 'champa',
    kind: 'local',
    kicker: '樹蔭下的國王',
    entry: 'ch-l1',
    nodes: [
      {
        id: 'ch-l1',
        speakerId: 'champa',
        text: '（通事把話譯過來。國王看的是你的眼睛，不是禮單。）這麼多船。我的城沒有這麼多屋頂。你們從很遠的地方來，要淡水，還是要我的門？',
        choices: [
          {
            text: '先把布和瓷器放下。我們要淡水，不要城。',
            next: 'ch-gift',
            minSilver: 15,
            lockedHint: '禮物要 15 銀',
            effects: {
              flags: ['champa_gift_talk'],
              silver: -15,
              connections: 1,
              bonds: [{ id: 'champa', delta: 10 }, { id: 'wang', delta: 2 }],
            },
          },
          {
            text: '先讓你看見旗和甲士，再談別的。',
            next: 'ch-hard',
            effects: {
              flags: ['champa_hard_talk'],
              trust: 3,
              bonds: [{ id: 'champa', delta: -6 }, { id: 'wang', delta: -3 }],
            },
          },
          {
            text: '請問貴國的曆法和衣冠。我們的通事會記。',
            next: 'ch-letters',
            effects: {
              flags: ['champa_letters_talk'],
              knowledge: 1,
              bonds: [{ id: 'champa', delta: 5 }, { id: 'ma', delta: 5 }],
            },
          },
          {
            text: '我們是候風來的，不是追着仗來的。',
            next: 'ch-calm',
            allFlags: ['listened_zhou'],
            effects: {
              flags: ['champa_calm'],
              morale: 2,
              bonds: [{ id: 'champa', delta: 7 }, { id: 'wang', delta: 2 }],
            },
          },
        ],
      },
      {
        id: 'ch-gift',
        speakerId: 'champa',
        text: '布比話快。淡水你們拿。我的人會記着：大明的船先伸手，不是先伸刀。後面的港口若問我，我可以這樣說。也可以不說。',
        choices: [
          {
            text: '請你願意的時候，替我們向南邊的港口說一句。',
            effects: {
              flags: ['champa_spoke_for'],
              connections: 1,
              bonds: [{ id: 'champa', delta: 4 }, { id: 'wang', delta: 2 }],
            },
          },
          { text: '禮物夠了。我們不添話，也不添條件。', effects: { bonds: [{ id: 'champa', delta: 2 }] } },
        ],
      },
      {
        id: 'ch-hard',
        speakerId: 'champa',
        text: '旗我看見了。人很多，刀很亮。朋友我還沒看見。淡水可以給，門不會開得很大。你若在下一個港口也這樣，人家會先寫信來問我。',
        choices: [
          {
            text: '剛才太滿了。我們要的是補給，不是你的城。',
            effects: {
              flags: ['champa_softened'],
              trust: -2,
              bonds: [{ id: 'champa', delta: 5 }, { id: 'wang', delta: 3 }],
            },
          },
          { text: '你看見就好。我們會守禮，可也不會把船藏起來。', effects: { bonds: [{ id: 'champa', delta: -2 }] } },
        ],
      },
      {
        id: 'ch-letters',
        speakerId: 'champa',
        text: '你不問金子，先問我們怎樣過一年。這很少見。讓那個拿筆的人問。問完，把我們寫成我們的樣子，不要寫成你們奏章裡現成的句子。',
        continueLabel: '馬歡，你慢慢問。',
      },
      {
        id: 'ch-calm',
        speakerId: 'champa',
        text: '候風。這兩個字我懂。海不聽皇帝的，也不聽我的。你們肯等風，我就肯等你們把話說完。坐吧。樹蔭夠大。',
        continueLabel: '那就慢慢說。',
      },
    ],
  },
  {
    id: 'aftermath-champa',
    locationId: 'champa',
    kind: 'aftermath',
    kicker: '離岸之後',
    entry: 'ch-z',
    nodes: [
      {
        id: 'ch-z',
        speakerId: 'wang',
        text: '占城的水上船了。這座港以後幾乎每次南下都要停。你今天留下的臉，會比旗先到舊港。',
        variants: [
          {
            allFlags: ['champa_spoke_for', 'champa_gift'],
            text: '你讓占巴的賴願意替我們說話，禮物也真的下了船。這句承諾比多一船布還貴。到了滿剌加，別裝成沒講過。',
          },
          {
            allFlags: ['champa_hard_talk', 'champa_might'],
            text: '岸上的旗和船上的旗，你排了兩次。國王的肩膀是緊的。下一個港口的人若先收到他的信，你要有話答，不要再加一面旗。',
          },
          {
            anyFlags: ['champa_softened'],
            text: '你把話說回去了，還來得及。占城的人吃軟，也吃記得。我看他後半段有在聽。',
          },
          {
            anyFlags: ['champa_gift', 'champa_gift_talk'],
            text: '布上岸，水上船。這種平，皇上聽得懂，水手也聽得懂。我喜歡這種平。',
          },
          {
            anyFlags: ['champa_letters', 'champa_letters_talk'],
            text: '馬歡的筆今天是濕的。你沒有先談刀。占城的譯員開始問回來了，這比沉默好得多。',
          },
          {
            allFlags: ['champa_bluster'],
            text: '陣勢排得太滿，門先窄了。禮物還在艙裡。下一站你若還想靠臉，得先把這張臉放軟。',
          },
        ],
        continueLabel: '舊港的河口，聽說不太乾淨。',
      },
    ],
  },
  {
    id: 'arrival-palembang',
    locationId: 'palembang',
    kind: 'arrival',
    kicker: '酒擺出來之前',
    entry: 'pa-a1',
    nodes: [
      {
        id: 'pa-a1',
        speakerId: 'wang',
        text: '舊港到了。河口有人擺酒，笑得很滿，說願意歸附。岸邊的小船卻比昨天多。老舵工說這笑不對勁。我信老舵工，不信笑。',
        variants: [
          {
            anyFlags: ['champa_hard_talk', 'champa_might'],
            text: '舊港到了。你在占城把旗排得很滿，陳祖義最喜歡這種客人，他會覺得你急着立功。酒可以看，別喝乾。',
          },
          {
            anyFlags: ['champa_gift_talk', 'champa_spoke_for', 'champa_gift'],
            text: '舊港到了。占城那一船布送得漂亮，這裡的笑臉比布危險。陳祖義嘴上歸附，手在做別的事。先聽本地的人怎麼說。',
          },
        ],
        choices: [
          {
            text: '你信誰，就直說。',
            next: 'pa-a2',
            effects: { flags: ['ask_wang_palembang'], bonds: [{ id: 'wang', delta: 3 }] },
          },
          {
            text: '我先去看陳祖義本人。',
            next: 'pa-a3',
            effects: { flags: ['see_chen_first'], bonds: [{ id: 'wang', delta: -1 }] },
          },
          {
            text: '守衛加一倍，然後才許人上岸。',
            next: 'pa-a2',
            minSilver: 5,
            lockedHint: '加哨要 5 銀',
            effects: { flags: ['doubled_watch'], silver: -5, morale: 3, bonds: [{ id: 'wang', delta: 3 }] },
          },
        ],
      },
      {
        id: 'pa-a2',
        speakerId: 'wang',
        text: '河口有個華商頭目，施進卿。他不是善人，可他恨陳祖義，也想讓這條河還有船敢來。你先聽他的，再決定陪不陪那個笑。',
        continueLabel: '帶我去見施進卿。',
      },
      {
        id: 'pa-a3',
        speakerId: 'wang',
        text: '可以。那我請施進卿在你回來之前把話留下。你若先被酒灌軟，那些話還在我這裡。去吧。笑臉在木屋裡等你。',
        continueLabel: '先聽施進卿，再進那間木屋。',
      },
    ],
  },
  {
    id: 'local-palembang',
    locationId: 'palembang',
    kind: 'local',
    kicker: '河上的頭目',
    entry: 'pa-l1',
    nodes: [
      {
        id: 'pa-l1',
        speakerId: 'shi',
        text: '正使不要急着進那間木屋。陳祖義的笑是貨，他賣過很多次。我施進卿，也不是甚麼好人。可我還想讓這條河有商船敢停。他的堂兄弟今晚全在小船上。你若當真收下投降，天明就沒有船了。',
        choices: [
          {
            text: '我信你。你要我怎樣？',
            next: 'pa-l2',
            effects: { flags: ['trust_shi'], connections: 1, bonds: [{ id: 'shi', delta: 8 }, { id: 'wang', delta: 2 }] },
          },
          { text: '你和他有仇。我為甚麼要站在你這邊？', next: 'pa-l3' },
          {
            text: '兩邊的話我都聽。今晚我不喝他的酒。',
            next: 'pa-l4',
            effects: { flags: ['sober_night'], bonds: [{ id: 'shi', delta: 4 }, { id: 'wang', delta: 3 }] },
          },
        ],
      },
      {
        id: 'pa-l2',
        speakerId: 'shi',
        text: '不要先打。讓他以為你信了。小船裡有三艘是他的堂親，帆上有一塊補丁像隻鳥。你要拆他，就拆那三艘的人。其餘的，很多只是怕他。',
        choices: [
          {
            text: '補丁像鳥。我記住了。',
            effects: { flags: ['knows_cousins'], knowledge: 1, bonds: [{ id: 'shi', delta: 3 }] },
          },
        ],
      },
      {
        id: 'pa-l3',
        speakerId: 'shi',
        text: '因為我的貨要活，你的人也要活。仇是真的。河也是真的。你不站我，至少不要站他。他歸附過別的旗，旗一走，刀就出來。',
        choices: [
          {
            text: '好。你的話我算進去。',
            effects: { flags: ['trust_shi'], bonds: [{ id: 'shi', delta: 5 }, { id: 'wang', delta: 1 }] },
          },
          {
            text: '我自己判斷。你的仇，我不會替你報。',
            effects: { flags: ['dismiss_shi'], bonds: [{ id: 'shi', delta: -5 }] },
          },
        ],
      },
      {
        id: 'pa-l4',
        speakerId: 'shi',
        text: '不喝酒，你就還是你。他最會在第二杯以後問你艙裡有多少銀。你清醒着，他的計謀就只好自己走出來。我要的就是這個。',
        continueLabel: '那就讓他自己走出來。',
      },
    ],
  },
  {
    id: 'aftermath-palembang',
    locationId: 'palembang',
    kind: 'aftermath',
    kicker: '河口安靜下來',
    entry: 'pa-z',
    nodes: [
      {
        id: 'pa-z',
        speakerId: 'wang',
        text: '舊港這一段，南京會要一份說得清的奏章。我按你真正做的寫，不按你希望人家看見的寫。',
        variants: [
          {
            allFlags: ['shi_vindicated', 'pirate_trap'],
            text: '施進卿的話你聽了，夜裡那一網也收得乾淨。他不是因此變成忠臣，河卻安靜了。滿剌加的人會聽說：大明的船，笑臉騙不動。',
          },
          {
            allFlags: ['shi_disappointed'],
            text: '施進卿今天不會再送消息來。你信過他，又把陳祖義留在河上。他覺得自己被拿去當耳目，然後被丟掉。這筆帳會跟着我們。',
          },
          {
            allFlags: ['pirate_trap'],
            text: '他按自己的計謀來，你按他的計謀等。這種贏法不響，可人少死幾個。我喜歡。',
          },
          {
            allFlags: ['pirate_fought'],
            text: '陳祖義上了囚船。海峽清了，甲板上有空位。你若問我值不值，我要先去點名，才答得了。',
          },
          {
            allFlags: ['pirate_talked'],
            text: '沒有一網打盡，河卻沒有再鬧。會做事的人，有時就是把一夥人拆開，不是把他們燒光。',
          },
          {
            allFlags: ['pirate_ignored'],
            text: '船還在，陳祖義也還在。下一支商船不會感謝你。到了滿剌加，國王若問這件事，你別說「不關我們的事」。',
          },
          {
            anyFlags: ['pirate_brawl', 'pirate_talk_fail', 'pirate_trap_fail'],
            text: '這一仗沒有按你紙上的樣子發生。人還在就好。奏章裡我會寫「未竟」，不會寫成大勝。',
          },
        ],
        continueLabel: '海峽窄起來了。去滿剌加。',
      },
    ],
  },
  {
    id: 'arrival-malacca',
    locationId: 'malacca',
    kind: 'arrival',
    kicker: '柵欄不是城牆',
    entry: 'ma-a1',
    nodes: [
      {
        id: 'ma-a1',
        speakerId: 'wang',
        text: '滿剌加。拜里迷蘇剌需要一個朋友，擋一擋北面暹羅的影子。我們需要一個能把米放下的地方。兩件事可以同時是真的。官廠是倉，是跟他商量過的木柵，不是我們佔下來的地。你別讓水手把柵欄說成城牆。',
        variants: [
          {
            allFlags: ['pirate_ignored'],
            text: '滿剌加到了。陳祖義還在河口。拜里迷蘇剌的人會問：大明的船見了海盜，是繞開的嗎？你想好答案。另外說清楚：我們要蓋的是倉，不是一座新城。',
          },
          {
            allFlags: ['pirate_trap'],
            text: '滿剌加到了。舊港那一網很乾淨，這裡不要用網。拜里迷蘇剌不是陳祖義。他要朋友。我們要倉庫，好讓分艙的船候西南季候風，再一起回去。',
          },
          {
            allFlags: ['champa_spoke_for'],
            text: '滿剌加到了。占城的信若送到了，國王會先鬆半口氣。倉的事仍要當面說清楚：木柵裡是糧和賞賜，外面仍是他的國。',
          },
        ],
        choices: [
          {
            text: '官廠只是倉。這句話由我親口說。',
            next: 'ma-a2',
            effects: { flags: ['depot_promise'], knowledge: 1, bonds: [{ id: 'wang', delta: 4 }] },
          },
          { text: '先看他要甚麼，再答應。', next: 'ma-a3', effects: { bonds: [{ id: 'wang', delta: 1 }] } },
          {
            text: '我分得清。占城、舊港、這裡，不是同一種人。',
            next: 'ma-a2',
            anyFlags: ['pirate_trap', 'champa_gift_talk', 'champa_calm'],
            effects: { flags: ['knows_difference'], bonds: [{ id: 'wang', delta: 3 }] },
          },
        ],
      },
      {
        id: 'ma-a2',
        speakerId: 'wang',
        text: '你肯把這句話說在前頭，我就不怕水手把樁敲得太深。候風的倉，用完就走。這才是我們來的樣子。',
        continueLabel: '去見國王。',
      },
      {
        id: 'ma-a3',
        speakerId: 'wang',
        text: '可以慢。不要慢到讓他覺得你在量他的岸有多長。他的國還新，心是緊的。',
        continueLabel: '我量的是米倉，不是國土。',
      },
    ],
  },
  {
    id: 'local-malacca',
    locationId: 'malacca',
    kind: 'local',
    kicker: '國王要一個朋友',
    entry: 'ml-l1',
    nodes: [
      {
        id: 'ml-l1',
        speakerId: 'malacca',
        text: '正使。暹羅在北面張望。你們的船很大。我要一個朋友，不是一個新的主人。倉可以談。我的岸，不簽給任何人。',
        variants: [
          {
            anyFlags: ['champa_hard_talk', 'champa_might'],
            text: '正使。占城來的人說，你們的旗有時比禮物先上岸。我的岸小。我不會把它簽給任何人。你們若要倉，先告訴我：柵欄敲下去以後，還算誰的地？',
          },
          {
            allFlags: ['champa_spoke_for'],
            text: '正使。占巴的賴寫了信。他說你們候風，也肯先把布送上岸。我願意聽。可倉是倉，國還是我的。這一句，我要聽你親口說。',
          },
          {
            allFlags: ['pirate_ignored'],
            text: '正使。舊港的海盜還在笑，有船這樣告訴我。你要我把米放進你們的柵欄，我得先知道：有人來搶的時候，你們是留下，還是拔錨？',
          },
        ],
        choices: [
          {
            text: '木柵和倉廒可以有。地仍是你的。我們候西南風就一起走。',
            next: 'ml-l2',
            effects: {
              flags: ['malacca_reassured'],
              trust: 2,
              bonds: [{ id: 'malacca', delta: 10 }, { id: 'wang', delta: 3 }],
            },
          },
          {
            text: '朝廷的冊封會給你一個名分，用來對着暹羅。',
            next: 'ml-l3',
            effects: { flags: ['offered_edict'], bonds: [{ id: 'malacca', delta: 4 }] },
          },
          {
            text: '占城願意跟你通好。我可以當那個傳話的人。',
            next: 'ml-l2',
            allFlags: ['champa_spoke_for'],
            effects: {
              flags: ['malacca_champa_word'],
              connections: 1,
              bonds: [{ id: 'malacca', delta: 8 }, { id: 'champa', delta: 2 }],
            },
          },
          {
            text: '你先看清楚船的數目，再決定答不答應。',
            next: 'ml-l4',
            effects: { flags: ['malacca_pressure'], bonds: [{ id: 'malacca', delta: -6 }, { id: 'wang', delta: -3 }] },
          },
        ],
      },
      {
        id: 'ml-l2',
        speakerId: 'malacca',
        text: '這句話我要。倉歸你們屯米，岸歸我。分艙的船可以在這裡會合。風向一改，你們走，柵欄可以留，主人不改。這樣，我們可以做朋友。',
        continueLabel: '就按這個寫。',
      },
      {
        id: 'ml-l3',
        speakerId: 'malacca',
        text: '名分有用。暹羅聽得見南京的字。可名分不是地契。你冊封我，是認我是國王，不是認這塊地換了主人。這一句若也在詔書的精神裡，我就接。',
        choices: [
          {
            text: '是認你，不是換主人。',
            effects: { flags: ['malacca_reassured'], bonds: [{ id: 'malacca', delta: 6 }, { id: 'wang', delta: 2 }] },
          },
          { text: '詔書怎麼寫，南京會定。', effects: { bonds: [{ id: 'malacca', delta: -3 }] } },
        ],
      },
      {
        id: 'ml-l4',
        speakerId: 'malacca',
        text: '船我數過了。所以我才把話講在前頭。你若是來量地的，酒就不必喝了。你若是來屯米的，把剛才那句收回去，我們還可以談。',
        choices: [
          {
            text: '我收回。倉是倉，岸是你的。',
            effects: {
              flags: ['malacca_reassured'],
              clearFlags: ['malacca_pressure'],
              bonds: [{ id: 'malacca', delta: 7 }, { id: 'wang', delta: 3 }],
            },
          },
          { text: '話已經說了。', effects: { bonds: [{ id: 'malacca', delta: -2 }] } },
        ],
      },
    ],
  },
  {
    id: 'aftermath-malacca',
    locationId: 'malacca',
    kind: 'aftermath',
    kicker: '倉立起來之後',
    entry: 'ml-z',
    nodes: [
      {
        id: 'ml-z',
        speakerId: 'wang',
        text: '海峽這一站，決定了後面的船有沒有地方會合。你今天說的每一句「我們的」，水手都會學。',
        variants: [
          {
            allFlags: ['depot_warm', 'malacca_depot'],
            text: '官廠立起來了。你事先把「這不是佔領」說清楚，國王的手是鬆的。我已經吩咐：柵欄裡不准掛我們的地名。這裡是人家的岸。',
          },
          {
            allFlags: ['depot_uneasy'],
            text: '倉是蓋了。拜里迷蘇剌笑的時候嘴動，眼睛沒有。占城那一面旗他還沒忘掉。你得在後面的港口收着點，不然朋友會一個一個變少。',
          },
          {
            allFlags: ['malacca_peace'],
            text: '你替他們跟暹羅說了半步。大明在這裡像個調人。調人不能順手把桌子搬走。倉若要蓋，仍舊是他的地。',
          },
          {
            allFlags: ['malacca_edict'],
            text: '詔書一展開，名分有了。名分很好，米還是要有地方放。國王肯聽，是因為你沒有把冊封說成收地。',
          },
          {
            allFlags: ['malacca_depot'],
            text: '木柵和倉廒立好了。我沿着柵走了一圈，告訴伙長：這是倉庫，不是營盤。你若聽見有人說「我們的滿剌加」，你親自去改他的口。',
          },
        ],
        continueLabel: '胡椒的味道，已經在風裡了。',
      },
    ],
  },
  {
    id: 'arrival-semudera',
    locationId: 'semudera',
    kind: 'arrival',
    kicker: '兩筆不同的帳',
    entry: 'se-a1',
    nodes: [
      {
        id: 'se-a1',
        speakerId: 'wang',
        text: '蘇門答剌。胡椒和硫磺從這裡上船。山頭有點灰，我不知道哪一本史書會把這一筆寫成我們的。另外宮裡不太平。你也許會聽見一個名字，蘇幹剌，那是後來搶位的事。跟眼前的灰不是同一筆帳。別混在一起寫。',
        choices: [
          {
            text: '灰歸灰，搶位歸搶位。你提醒得對。',
            next: 'se-a2',
            effects: { flags: ['separated_stories'], knowledge: 1, bonds: [{ id: 'wang', delta: 4 }] },
          },
          { text: '蘇幹剌是誰？你用三句話說完。', next: 'se-a3' },
          {
            text: '我只關心船會不會被灰埋了。',
            next: 'se-a2',
            effects: { morale: 2, bonds: [{ id: 'wang', delta: 1 }] },
          },
        ],
      },
      {
        id: 'se-a2',
        speakerId: 'wang',
        text: '國王宰奴里阿必丁在港上。他要胡椒能賣，也要孩子不要在灰裡跑。你對他說話，就像對一個正在擔心的人，不要對着一本還沒寫的戰報。',
        continueLabel: '我去見他。',
      },
      {
        id: 'se-a3',
        speakerId: 'wang',
        text: '後來這座港內亂，有人奪位，名字叫蘇幹剌。鄭和按先王的舊約站在一邊，把他捉住。那是第四次航行前後的事，不是今天早上這股煙。你現在知道了，就不要拿去嚇國王。',
        choices: [
          {
            text: '知道了。今天只處理眼前的灰和人。',
            effects: { flags: ['separated_stories'], knowledge: 1, bonds: [{ id: 'wang', delta: 3 }, { id: 'ma', delta: 2 }] },
          },
        ],
      },
    ],
  },
  {
    id: 'local-semudera',
    locationId: 'semudera',
    kind: 'local',
    kicker: '胡椒與山',
    entry: 'se-l1',
    nodes: [
      {
        id: 'se-l1',
        speakerId: 'semu',
        text: '正使遠來。胡椒在倉裡，人卻在看山。我父親那一輩就見過山吐灰，不是今天才發明的故事。今天的人仍然怕。宮裡另外有人在悄悄說話，那是我的家事。你若是來買胡椒的，就談胡椒。你若是來救人的，就先救人。',
        choices: [
          {
            text: '先讓婦人和孩子靠近你們岸上的淡水。船邊也可以。',
            next: 'se-l2',
            minSilver: 10,
            lockedHint: '淡水和布要 10 銀',
            effects: {
              flags: ['semu_water'],
              silver: -10,
              morale: 4,
              bonds: [{ id: 'semu', delta: 8 }, { id: 'wang', delta: 2 }],
            },
          },
          {
            text: '山的事讓書手記。你只講你看見的，不講傳說。',
            next: 'se-l3',
            effects: { flags: ['semu_record_local'], knowledge: 1, bonds: [{ id: 'semu', delta: 3 }, { id: 'ma', delta: 4 }] },
          },
          { text: '宮裡的閒話，我也想聽一點。', next: 'se-l4' },
        ],
      },
      {
        id: 'se-l2',
        speakerId: 'semu',
        text: '水比胡椒誠實。孩子先喝。你的水手若因此少了一勺，我看見了。蘇門答剌會記得這支船沒有只顧自己的艙。',
        choices: [
          {
            text: '搶位的傳聞我不會寫進今天的灰裡。',
            allFlags: ['separated_stories'],
            effects: { flags: ['semu_respect'], trust: 2, bonds: [{ id: 'semu', delta: 5 }] },
          },
          { text: '人安全，就好。', effects: { bonds: [{ id: 'semu', delta: 2 }] } },
        ],
      },
      {
        id: 'se-l3',
        speakerId: 'semu',
        text: '我看見的是：風從山那邊來，灰落在胡椒葉上，太陽有一個時辰發紅。我沒有看見神。你的人若只寫這個，我准。',
        continueLabel: '就寫這個。',
      },
      {
        id: 'se-l4',
        speakerId: 'semu',
        text: '有一個旁支的人，不服我父親留下的約。名字你不必從我嘴裡挖。海盜的事你們在舊港辦過，我國的位子不是海盜。你幫我守約，是以後的事。今天，山比較急。',
        choices: [
          {
            text: '以後的約，以後再說。今天我不插手你的宮。',
            effects: { flags: ['heard_succession'], knowledge: 1, bonds: [{ id: 'semu', delta: 4 }, { id: 'wang', delta: 2 }] },
          },
          {
            text: '約若是舊的，大明可以站在約那邊。',
            effects: { flags: ['offered_succession_help'], bonds: [{ id: 'semu', delta: 2 }, { id: 'wang', delta: -2 }] },
          },
        ],
      },
    ],
  },
  {
    id: 'aftermath-semudera',
    locationId: 'semudera',
    kind: 'aftermath',
    kicker: '灰小了',
    entry: 'se-z',
    nodes: [
      {
        id: 'se-z',
        speakerId: 'wang',
        text: '山還在，船也還在。過了這裡就是大洋，岸會變少。你在這座港留下的，是胡椒，還是一句人話，自己心裡有數就好。',
        variants: [
          {
            allFlags: ['ash_remembered'],
            text: '水你先給了，人你又去救。國王會記得第一件，水手會記得你沒有只顧自己。兩件都算數。蘇幹剌的名字，我們沒有拿來當今天的理由。這樣寫是對的。',
          },
          {
            allFlags: ['ash_aid'],
            text: '灰還在下的時候，你沒有只顧拔錨。岸上的人記住了。這種記住，比多一艙胡椒更會跟着船走。',
          },
          {
            allFlags: ['ash_notes'],
            text: '風向、灰的厚度、哪一天太陽不見，都在簿子上。這是給後來的船看的。費信和馬歡會爭着抄。讓他們抄，別讓他們添神蹟。',
          },
          {
            allFlags: ['ash_retreat'],
            text: '船退到外海，人是安全的。國王若盼過你留下，這盼會涼一點。不是錯。只是你得知道涼在哪裡。',
          },
          {
            allFlags: ['offered_succession_help'],
            text: '你差點把人家的宮鬥接過來。我擋了一擋。搶位的事史書另有一筆，不是這股灰。以後真要按舊約辦事，再當着大家說。',
          },
        ],
        continueLabel: '下一站是錫蘭。城門會開得很客氣。',
      },
    ],
  },
  {
    id: 'arrival-ceylon',
    locationId: 'ceylon',
    kind: 'arrival',
    kicker: '禮數厚得發亮',
    entry: 'ce-a1',
    nodes: [
      {
        id: 'ce-a1',
        speakerId: 'wang',
        text: '錫蘭山。國王亞烈苦奈兒請你入城赴宴，禮數周到得過分。岸上有人低聲說城裡在磨刀，海邊有人盯着貨。我寧願你先去寺裡。寺裡的人不掌刀。牙舍的傳說各說各的，你聽眼前這個和尚講他看見的就好。',
        variants: [
          {
            allFlags: ['heard_succession'],
            text: '錫蘭山。你在蘇門答剌肯聽閒話，這裡的閒話更貴：城門開得太客氣的時候，不要把全部的人都帶進去。亞烈苦奈兒的宴，我聞着不對。先去海岸的寺。',
          },
        ],
        choices: [
          {
            text: '先去寺裡。宴可以等。',
            next: 'ce-a2',
            effects: { flags: ['visit_temple_first'], bonds: [{ id: 'wang', delta: 3 }] },
          },
          {
            text: '人家請宴，不去是失禮。',
            next: 'ce-a3',
            effects: { flags: ['eager_feast'], morale: -2, bonds: [{ id: 'wang', delta: -3 }] },
          },
          {
            text: '你留在船上掌指揮。城裡的事我自己判斷。',
            next: 'ce-a2',
            effects: { flags: ['wang_keeps_ship'], bonds: [{ id: 'wang', delta: 5 }] },
          },
        ],
      },
      {
        id: 'ce-a2',
        speakerId: 'wang',
        text: '我喜歡這個次序。和尚若肯說，他就會說得彎。你別逼他指認國王。他指了，明天寺就不在了。',
        continueLabel: '我懂。聽弦外的話。',
      },
      {
        id: 'ce-a3',
        speakerId: 'wang',
        text: '禮我懂。這份禮太亮。你若一定進宮，至少讓一半人留在船上，貨不要離眼。寺還在去王城的路上，你經過的時候，低頭看一眼和尚的臉。',
        continueLabel: '經過寺門時，我會停。',
      },
    ],
  },
  {
    id: 'local-ceylon',
    locationId: 'ceylon',
    kind: 'local',
    kicker: '海邊的寺',
    entry: 'ce-l1',
    nodes: [
      {
        id: 'ce-l1',
        speakerId: 'monk',
        text: '正使。我是這座海岸寺的長老，不是王城的人。牙舍在哪裡，岸上的故事各說各的，我不以這個騙你。我只說我看見的：王城的廚房今天磨了很多刀，比一頓宴席用得上的多。',
        variants: [
          {
            allFlags: ['eager_feast'],
            text: '正使，你的腳已經朝着王宮。我仍舊把你攔這一攔。我不是王城的人。廚房磨的刀，比盤子多。宴可以吃，人不要都進去。',
          },
          {
            allFlags: ['visit_temple_first'],
            text: '你先來寺，不先去宮。這次序很少見，我因此肯多說一句。我不是來告國王的。我是來告訴你：海邊的貨，今晚不要只留幾個病號看着。',
          },
        ],
        choices: [
          {
            text: '長老，城裡是不是不對？請你講明白一點。',
            next: 'ce-l2',
            effects: { flags: ['ceylon_warned'], knowledge: 1, bonds: [{ id: 'monk', delta: 6 }] },
          },
          {
            text: '我帶香和布來，不為打聽。請收下。',
            next: 'ce-l3',
            minSilver: 10,
            lockedHint: '香和布要 10 銀',
            effects: { flags: ['ceylon_offering'], silver: -10, bonds: [{ id: 'monk', delta: 8 }] },
          },
          {
            text: '小路請告訴火長就好，不必把名字告訴我。',
            next: 'ce-l3',
            effects: {
              flags: ['ceylon_path'],
              knowledge: 1,
              bonds: [{ id: 'monk', delta: 5 }, { id: 'zhou', delta: 2 }],
            },
          },
        ],
      },
      {
        id: 'ce-l2',
        speakerId: 'monk',
        text: '明白到這個地步就夠了：宴是真的，刀也是真的。你若稱病，刀會失望。你若全進去，船會空。中間那條路，你自己走。我不會替你選。',
        choices: [
          {
            text: '一半人留船上。這句我聽進去了。',
            effects: { flags: ['heed_monk'], morale: 3, bonds: [{ id: 'monk', delta: 3 }, { id: 'wang', delta: 3 }] },
          },
          { text: '謝長老。路我自己看。', effects: { bonds: [{ id: 'monk', delta: 1 }] } },
        ],
      },
      {
        id: 'ce-l3',
        speakerId: 'monk',
        text: '香會點，布會披。你的問題我用沒有聲音的方式答過了。出了寺門往左，是市集；往右上坡，是王城。上坡的路今晚太乾淨，乾淨得像有人掃過，方便跑。',
        continueLabel: '乾淨的路，我記住了。',
      },
    ],
  },
  {
    id: 'aftermath-ceylon',
    locationId: 'ceylon',
    kind: 'aftermath',
    kicker: '城還在，船還在',
    entry: 'ce-z',
    nodes: [
      {
        id: 'ce-z',
        speakerId: 'wang',
        text: '錫蘭這一段不好寫。寫輕了，像沒發生。寫重了，像我們來滅人的國。朱棣後來也沒有把這個國除掉。你記得這個分寸。',
        variants: [
          {
            allFlags: ['ship_held', 'ceylon_strike'],
            text: '你讓我留在船上，所以岸上的貨沒有空。城是取了，船還是船。國王會被送去南京，國還在。這次你聽我把人留在海上，是對的。',
          },
          {
            allFlags: ['ceylon_strike'],
            text: '伏兵撲了空。奏章會很硬。我請你在硬裡留一句：我們不是來佔錫蘭山的。仗打完，朝貢還要接得上。',
          },
          {
            allFlags: ['ceylon_temple'],
            text: '你帶薄禮去了寺，沒有進那個太亮的宴。長老的香還在袖子裡。王宮的計謀未必死，可岸上有人願意告訴你哪條路乾淨。這比多殺一個人值。',
          },
          {
            allFlags: ['ceylon_caution'],
            text: '宴你沒赴。刀也沒有砍到你身上。謹慎保住了船，故事短了一截。短，有時是福氣。和尚那句「刀比盤子多」，你沒有拿去換一場仗。',
          },
          {
            allFlags: ['ceylon_muddle'],
            text: '兩邊同時動手，船亂了。我沒有話安慰你。下一更先點名，再談對錯。點完名，我們還得走大洋。',
          },
        ],
        continueLabel: '出了錫蘭，就看不見岸了。',
      },
    ],
  },
];
