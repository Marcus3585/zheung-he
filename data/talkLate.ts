import { TalkScene } from '../services/talk';

export const LATE_SCENES: TalkScene[] = [
  {
    id: 'arrival-indianocean',
    locationId: 'indianocean',
    kind: 'arrival',
    kicker: '看不見岸',
    entry: 'io-a1',
    nodes: [
      {
        id: 'io-a1',
        speakerId: 'wang',
        text: '帆要垂了。海平得像一塊銅，水桶一天比一天輕。費信還在問星星離海平面有多高。你去跟他說，或者跟我說水怎麼分。仗的本事，在這片海上不管用。',
        variants: [
          {
            maxBond: { id: 'wang', value: 30 },
            text: '水不夠。命令你寫下來就好，不必跟我商量。費信在記星。你若要見他，自己去。我按你寫的數字分勺。',
          },
          {
            anyFlags: ['ceylon_strike', 'ceylon_muddle'],
            text: '錫蘭那一仗的勁還沒散，這片海卻不吃那一套。沒有城可取，只有水和風。費信在船頭數星星。你要去說人話，現在去。',
          },
        ],
        choices: [
          { text: '我去看費信。星星和水，都讓他寫。', next: 'io-a2', effects: { bonds: [{ id: 'fei', delta: 2 }] } },
          {
            text: '水的規矩我來定，你執行。',
            next: 'io-a3',
            effects: { flags: ['wang_executes_water'], bonds: [{ id: 'wang', delta: -1 }] },
          },
          {
            text: '景弘，今晚的更你替我看。我去睡一個時辰。',
            next: 'io-a4',
            minBond: { id: 'wang', value: 60 },
            effects: { flags: ['wang_watched'], morale: 6, bonds: [{ id: 'wang', delta: 4 }] },
          },
          {
            text: '你有話就現在說，別等水乾了。',
            next: 'io-a3',
            maxBond: { id: 'wang', value: 34 },
          },
        ],
      },
      {
        id: 'io-a2',
        speakerId: 'wang',
        text: '去吧。他年輕，筆比胃誠實。你若叫他把慘的句子塗掉，他會塗，可他會看不起你。這件事我不管，我管勺。',
        continueLabel: '我不會叫他塗。',
      },
      {
        id: 'io-a3',
        speakerId: 'wang',
        text: '規矩可以硬。硬完你自己也要喝那一勺，不能另有一個壺。水手數得比你清楚。費信在船頭，你還是去看他一眼，他快被星星晃暈了。',
        continueLabel: '先看他，再定勺。',
      },
      {
        id: 'io-a4',
        speakerId: 'wang',
        text: '你肯把更交給我，我才肯接。去睡。醒來如果風還不來，我們再談祭不祭天妃。神不負責吹風，人卻需要一個肯等的理由。',
        continueLabel: '更交給你。',
      },
    ],
  },
  {
    id: 'local-indianocean',
    locationId: 'indianocean',
    kind: 'local',
    kicker: '記室的筆',
    entry: 'io-l1',
    nodes: [
      {
        id: 'io-l1',
        speakerId: 'fei',
        text: '正使。我費信，崑山人，負責把所見寫下來。我的名字在後來幾次航行的名冊上更清楚；眼下你要我記，我就記這片海。星星還在，水不在。兩件都寫，還是只寫星星？',
        choices: [
          {
            text: '都寫。飢渴也是航路的一部分。',
            next: 'io-l2',
            effects: {
              flags: ['fei_honest'],
              knowledge: 1,
              bonds: [{ id: 'fei', delta: 8 }, { id: 'ma', delta: 2 }, { id: 'wang', delta: 2 }],
            },
          },
          {
            text: '水份給最弱的人。我的份減一勺。',
            next: 'io-l3',
            effects: {
              flags: ['shared_water'],
              morale: 8,
              bonds: [{ id: 'fei', delta: 6 }, { id: 'wang', delta: 4 }],
            },
          },
          {
            text: '別寫得太慘。南京要看的是功，不是抱怨。',
            next: 'io-l4',
            effects: { flags: ['censored_fei'], trust: 2, bonds: [{ id: 'fei', delta: -6 }, { id: 'wang', delta: -2 }] },
          },
        ],
      },
      {
        id: 'io-l2',
        speakerId: 'fei',
        text: '那我寫：某日無風，水按人頭髮，星的高度仍可量。牽星板沒有因為口渴就變短。這樣以後的船知道，這裡不是永遠過不去。',
        choices: [
          {
            text: '副使在看更的話，你也可以寫上去。',
            allFlags: ['wang_watched'],
            effects: { knowledge: 1, bonds: [{ id: 'fei', delta: 3 }, { id: 'wang', delta: 2 }] },
          },
          { text: '就這樣寫。不要添神。', effects: { bonds: [{ id: 'fei', delta: 2 }] } },
        ],
      },
      {
        id: 'io-l3',
        speakerId: 'fei',
        text: '你的勺我看見了，別人也看見了。這一句我會寫得很小，不寫成你的功德。寫大了，像做戲。人在喝水的時候，最討厭戲。',
        continueLabel: '寫小一點。這樣對。',
      },
      {
        id: 'io-l4',
        speakerId: 'fei',
        text: '功我會寫。口渴我會另外留一頁，不交給這次的奏章。你不能叫我假裝海是溫柔的。那一頁我自己收着。將來有人問，我還在。',
        continueLabel: '那一頁你留着吧。',
      },
    ],
  },
  {
    id: 'aftermath-indianocean',
    locationId: 'indianocean',
    kind: 'aftermath',
    kicker: '帆又吃到風',
    entry: 'io-z',
    nodes: [
      {
        id: 'io-z',
        speakerId: 'wang',
        text: '風回來一點了。人沒有先渴死，也沒有先被皇上忘記。古里就在前面，那裡胡椒比話還多。',
        variants: [
          {
            allFlags: ['ration_respected'],
            text: '你先把自己的水讓了，又在危急裡定量。甲板上的人懂：你不是自己喝飽才喊省。怨少了很多。費信那一頁，我准他留着。',
          },
          {
            allFlags: ['ocean_stars'],
            text: '洋流比風誠實，你看出來了。簿子上多了一條以後用得着的線。費信興奮得幾乎把筆掉進海裡。讓他興奮，這種興奮不花錢。',
          },
          {
            allFlags: ['ocean_rite'],
            text: '天妃沒有把風吹來，人卻肯再等一個晚上。第二天帆面自己鼓了一點。神若有聽，聽的是你們還肯互相讓一勺水。',
          },
          {
            allFlags: ['censored_fei', 'ocean_ration'],
            text: '定量之後話變少了。你又叫費信把慘的收起來。船是過去了，簿子卻薄了。薄的簿子，到了南京最好看，路上最沒用。',
          },
          {
            allFlags: ['ocean_ration'],
            text: '人沒有渴死。話變少了，剩下的多是怨。你若再有一次這樣的海，先讓自己的勺跟大家一樣，怨會輕一點。',
          },
        ],
        continueLabel: '古里的市集，應該已經看見我們的帆。',
      },
    ],
  },
  {
    id: 'arrival-calicut',
    locationId: 'calicut',
    kind: 'arrival',
    kicker: '大市在等契約',
    entry: 'ca-a1',
    nodes: [
      {
        id: 'ca-a1',
        speakerId: 'wang',
        text: '古里。西洋的大市，胡椒麻袋比人高。這裡講契約，不講鼓。船隊多次在這座港分艙，有的去忽魯謨斯，有的去東非。你今天不要一張嘴把所有的帆都許出去。',
        variants: [
          {
            allFlags: ['fei_honest'],
            text: '古里到了。費信的簿子已經夠厚，這座城會讓它更厚。馬歡在跳板上，他想上岸問價錢以外的事。你准不准，現在說。',
          },
          {
            allFlags: ['censored_fei'],
            text: '古里到了。你讓費信把慘的收起來，馬歡不一定肯跟着收。見大頭目前，先跟通事說清楚：哪些可以問，哪些你不想見紙。',
          },
        ],
        choices: [
          {
            text: '讓馬歡跟我一起問。筆記比嗓門重要。',
            next: 'ca-a2',
            effects: { flags: ['ma_with_me'], bonds: [{ id: 'ma', delta: 4 }, { id: 'wang', delta: 2 }] },
          },
          {
            text: '買賣我來。筆記少寫，免得把價錢寫死。',
            next: 'ca-a3',
            effects: { flags: ['trade_first'], bonds: [{ id: 'ma', delta: -3 }] },
          },
          {
            text: '把占城和滿剌加託我們的話一起帶上。',
            next: 'ca-a2',
            anyFlags: ['champa_spoke_for', 'malacca_champa_word', 'malacca_reassured'],
            effects: { flags: ['letters_carried'], connections: 1, bonds: [{ id: 'wang', delta: 2 }] },
          },
        ],
      },
      {
        id: 'ca-a2',
        speakerId: 'wang',
        text: '大頭目管着港市，不愛空話。你把前面港口的信用帶去，比多擺一匹緞有用。馬歡問曆法的時候，你別在旁邊敲桌子。',
        continueLabel: '我不敲桌子。',
      },
      {
        id: 'ca-a3',
        speakerId: 'wang',
        text: '價錢你談。談完把數字告訴我，我來對艙。你若把人家壓得太狠，這座城記得住。它是大市，不缺下一支船。',
        continueLabel: '我知道這座城不求我們。',
      },
    ],
  },
  {
    id: 'local-calicut',
    locationId: 'calicut',
    kind: 'local',
    kicker: '大頭目的秤',
    entry: 'ca-l1',
    nodes: [
      {
        id: 'ca-l1',
        speakerId: 'calicut',
        text: '大明的船，我們認識。胡椒按契約走，不按嗓門走。你們的絲綢和瓷器可以留下，我們的胡椒和棉布可以上船。字要寫下來。口說的價錢，風一吹就改。',
        choices: [
          {
            text: '契約寫清楚。貨換貨，不拖，也不另加條件。',
            next: 'ca-l2',
            effects: { flags: ['fair_contract_talk'], bonds: [{ id: 'calicut', delta: 7 }, { id: 'wang', delta: 2 }] },
          },
          {
            text: '請讓我的通事在市集聽三日，不攪買賣。',
            next: 'ca-l3',
            allFlags: ['ma_with_me'],
            minSilver: 15,
            lockedHint: '留通事三日要 15 銀',
            effects: {
              flags: ['ma_stayed_calicut'],
              silver: -15,
              knowledge: 1,
              connections: 1,
              bonds: [{ id: 'ma', delta: 10 }, { id: 'calicut', delta: 4 }],
            },
          },
          {
            text: '船多，價錢再讓一讓。你不肯，自然有人肯。',
            next: 'ca-l4',
            effects: {
              flags: ['calicut_squeeze'],
              silver: 8,
              trust: -3,
              bonds: [{ id: 'calicut', delta: -8 }, { id: 'wang', delta: -2 }, { id: 'ma', delta: -2 }],
            },
          },
          {
            text: '前面的港口託我帶話。我們是來接路的，不是來壓市的。',
            next: 'ca-l2',
            allFlags: ['letters_carried'],
            effects: { flags: ['calicut_heard_friends'], connections: 1, bonds: [{ id: 'calicut', delta: 6 }] },
          },
        ],
      },
      {
        id: 'ca-l2',
        speakerId: 'calicut',
        text: '這樣的話，秤可以擺出來。古里不欠你們一個奇蹟，只欠一份寫明白的單。單平了，人就平。你們西邊還要去哪裡，自己分艙，不要在我的碼頭上吵架。',
        continueLabel: '分艙的事，我們回船上吵。',
      },
      {
        id: 'ca-l3',
        speakerId: 'ma',
        text: '三日夠我問港路、曆法和他們自己怎樣講這座城。我不會替你把價錢寫好看。正使，古里的人若問我大明為甚麼來，我就說：送禮物，接朋友，不是來佔市。',
        continueLabel: '就這樣答。我也是這樣想的。',
      },
      {
        id: 'ca-l4',
        speakerId: 'calicut',
        text: '銀子你多拿了一點。名字你掉了一點。這座城見慣了急着成交的船。你可以成交。只是下一支從東邊來的船，會先被人警告：他們的手緊。',
        choices: [
          {
            text: '這點銀我不要了。按你說的平價寫。',
            effects: {
              flags: ['calicut_amended'],
              clearFlags: ['calicut_squeeze'],
              silver: -8,
              bonds: [{ id: 'calicut', delta: 6 }, { id: 'wang', delta: 3 }],
            },
          },
          { text: '手緊就手緊。單子仍然有效。', effects: { bonds: [{ id: 'calicut', delta: -2 }] } },
        ],
      },
    ],
  },
  {
    id: 'aftermath-calicut',
    locationId: 'calicut',
    kind: 'aftermath',
    kicker: '單子疊好了',
    entry: 'ca-z',
    nodes: [
      {
        id: 'ca-z',
        speakerId: 'wang',
        text: '古里這筆帳，可以拿去給皇上看。能不能拿去給下一個港口看，就看你剛才的手緊不緊。',
        variants: [
          {
            allFlags: ['calicut_squeeze', 'calicut_deal'],
            text: '契約你簽了，市集卻已經在說你會壓價。馬歡的筆記若誠實，這句也會在。忽魯謨斯比這裡更富，也更會記仇。你收着點。',
          },
          {
            allFlags: ['ma_stayed_calicut', 'calicut_learn'],
            text: '你帶走的不只是胡椒。馬歡在市集裡聽了三日，回來的句子是這座城自己的，不是我們替它編的。我把那幾頁夾在海圖旁邊。',
          },
          {
            allFlags: ['calicut_deal'],
            text: '胡椒上船，布匹上岸。帳是平的。這種平，皇上聽得懂。我也可以拿去跟水手解釋，為甚麼艙裡突然這麼香。',
          },
          {
            allFlags: ['calicut_peace'],
            text: '商人的架沒有打起來。你站在中間的樣子，比你站在旗下的樣子更像這趟航行該有的人。',
          },
          {
            allFlags: ['calicut_learn'],
            text: '你少談了一點價，多問了曆法和港路。馬歡高興得像撿到一本書。書確實被他撿到了。',
          },
          {
            allFlags: ['calicut_skip'],
            text: '船能走。這麼大的市，你幾乎空手。南京會問一句很短的話。我可以幫你答「水滿了」，可我不會幫你答成「我們很忙」。',
          },
        ],
        continueLabel: '西邊還有一座熱的石城。',
      },
    ],
  },
  {
    id: 'arrival-hormuz',
    locationId: 'hormuz',
    kind: 'arrival',
    kicker: '熱風裡的另一種熱',
    entry: 'ho-a1',
    nodes: [
      {
        id: 'ho-a1',
        speakerId: 'wang',
        text: '忽魯謨斯。波斯灣口的大市，石頭城，熱風，碼頭上是地毯、馬和寶石。簿子記得的是這些，不是一場有名字的大疫。可眼前碼頭上確實有人在發燒。多停一天，就多一分被染上的可能。我們照眼前的病來辦，不要編成史書沒有寫過的災。',
        variants: [
          {
            anyFlags: ['calicut_squeeze'],
            text: '忽魯謨斯到了。古里的人覺得你的手緊，這裡更富，也更會記。碼頭上有人發燒。史書沒把這座城寫成疫港，眼前仍是一船人的病。你別一副只想抽身、又想把地毯搬光的樣子。',
          },
        ],
        choices: [
          {
            text: '先答應把醫官送上去，再看病情允不允許。',
            next: 'ho-a2',
            minSilver: 10,
            lockedHint: '藥和清潔要 10 銀',
            effects: { flags: ['promised_doctor'], silver: -10, bonds: [{ id: 'wang', delta: 3 }] },
          },
          {
            text: '先保護自己的船。病的事慢一點說。',
            next: 'ho-a3',
            effects: { flags: ['protect_fleet_first'], morale: 3, bonds: [{ id: 'wang', delta: 1 }] },
          },
          {
            text: '你怕甚麼，直接說。這裡沒有外人。',
            next: 'ho-a4',
            minBond: { id: 'wang', value: 55 },
          },
        ],
      },
      {
        id: 'ho-a2',
        speakerId: 'wang',
        text: '你把這句話許出去，就不要在天黑的時候偷偷拔錨。醫官可以不上內廷，不能不上病人。我去告訴他準備乾淨的水和布。',
        continueLabel: '許了的事，我會做完。',
      },
      {
        id: 'ho-a3',
        speakerId: 'wang',
        text: '保護船沒有錯。你若後來決定走，就走得明白，不要先答應人家再失約。國王在等你先開口。他很驕傲，也在怕。',
        continueLabel: '我見了他再定。',
      },
      {
        id: 'ho-a4',
        speakerId: 'wang',
        text: '我怕的不是熱。我怕人死在一份沒有名字的名單裡，回南京只剩「途中損若干」。你若要我把每一個倒下的人寫上名字，我就肯跟你一起留。你若要我把這座城寫成我們的功，我不肯。',
        choices: [
          {
            text: '寫名字。不要寫功。',
            effects: { flags: ['wang_fear_told'], morale: 3, bonds: [{ id: 'wang', delta: 6 }] },
          },
        ],
      },
    ],
  },
  {
    id: 'local-hormuz',
    locationId: 'hormuz',
    kind: 'local',
    kicker: '石城的主人',
    entry: 'ho-l1',
    nodes: [
      {
        id: 'ho-l1',
        speakerId: 'hormuz',
        text: '你們的瓷器我見了，絲綢我也見了。碼頭上的人在發燒，我不敢讓你的水手亂走，也不想你連夜把忽魯謨斯說成一座廢港。寶石還在，馬還在。病是這個星期的病。',
        choices: [
          {
            text: '醫官只看病人，不進內廷，也不傳閒話。',
            next: 'ho-l2',
            anyFlags: ['promised_doctor', 'wang_fear_told'],
            effects: { flags: ['doctor_terms'], bonds: [{ id: 'hormuz', delta: 8 }, { id: 'wang', delta: 2 }] },
          },
          {
            text: '我們買足水就離開。城的名聲，我不評論。',
            next: 'ho-l3',
            effects: { flags: ['hormuz_leave_talk'], bonds: [{ id: 'hormuz', delta: -3 }] },
          },
          {
            text: '地毯和國書的事，留到病人穩一點再談。',
            next: 'ho-l2',
            effects: { flags: ['hormuz_patience'], trust: 2, bonds: [{ id: 'hormuz', delta: 5 }, { id: 'wang', delta: 2 }] },
          },
          {
            text: '古里的話若傳到了，我按平價補上一份禮，證明手不緊。',
            next: 'ho-l2',
            allFlags: ['calicut_squeeze'],
            minSilver: 20,
            lockedHint: '補禮要 20 銀',
            effects: {
              flags: ['hormuz_proof'],
              silver: -20,
              connections: 1,
              bonds: [{ id: 'hormuz', delta: 7 }, { id: 'calicut', delta: 2 }],
            },
          },
        ],
      },
      {
        id: 'ho-l2',
        speakerId: 'hormuz',
        text: '這樣我可以讓你的人上岸，走指定的路。病穩了，地毯仍在。你們若肯回來，這座城會把你們叫做肯回來的船，而不是來撿便宜的船。',
        continueLabel: '路我們照走。',
      },
      {
        id: 'ho-l3',
        speakerId: 'hormuz',
        text: '水可以賣。故事也會自己走。你不評論，別人會替你評論。走就走得快，不要在港外停着看，像在等我們更倒楣。',
        continueLabel: '我不會停在港外看熱鬧。',
      },
    ],
  },
  {
    id: 'aftermath-hormuz',
    locationId: 'hormuz',
    kind: 'aftermath',
    kicker: '熱風還在',
    entry: 'ho-z',
    nodes: [
      {
        id: 'ho-z',
        speakerId: 'wang',
        text: '忽魯謨斯留在後面了。地毯有沒有上船是一回事。我們留下的句子，是另一回事。',
        variants: [
          {
            allFlags: ['kept_doctor_promise'],
            text: '醫官上去了，你沒有食言。藥和乾淨的水比金杯子有用。這座城開始把我們叫做肯回來的船。名字我按你的吩咐寫，功我不寫。',
          },
          {
            allFlags: ['broke_doctor_promise'],
            text: '你先答應了醫官，後來又把船拉開。國王不會當着你罵。罵會在我們走後才開始。我把這句寫進只有你看的那一頁：失約。',
          },
          {
            allFlags: ['hormuz_heal'],
            text: '船上沒有被這股熱拖垮。城裡有人把我們的旗認出來，是因為旗下面有藥箱，不是因為旗很大。',
          },
          {
            allFlags: ['hormuz_flee'],
            text: '水滿了，帆也滿了。外交留在後面。這樣選，人安全。你自己知道安全的代價叫甚麼就好。',
          },
          {
            allFlags: ['hormuz_shut'],
            text: '船與城隔開了，沒有新的病人，也沒有新的朋友。這座最富的市，我們幾乎只在海上看了一眼。',
          },
        ],
        continueLabel: '有的船要往非洲那邊分艙了。',
      },
    ],
  },
  {
    id: 'arrival-mogadishu',
    locationId: 'mogadishu',
    kind: 'arrival',
    kicker: '不是每一面帆都在',
    entry: 'mo-a1',
    nodes: [
      {
        id: 'mo-a1',
        speakerId: 'wang',
        text: '木骨都束。珊瑚石的城，對着印度洋。你跟蘇丹說話時，別把整支艦隊說成停在他門口。來的是分艙。木骨都束、卜剌哇、麻林，是不同的岸。我們帶得走的，有龍涎香，也有被叫做花福鹿的斑馬。沒有帶得走的，是這座城本身。',
        variants: [
          {
            anyFlags: ['kept_doctor_promise', 'hormuz_heal'],
            text: '木骨都束在前面。忽魯謨斯的事也許比船先到：有人會說我們沒有丟下病人。你就更不要吹牛。來的是分艙，不是一整片帆。城是人家的。',
          },
        ],
        choices: [
          {
            text: '我明白。來的是分艙，我不會說成全軍。',
            next: 'mo-a2',
            effects: { flags: ['knows_detachments'], knowledge: 1, bonds: [{ id: 'wang', delta: 3 }] },
          },
          {
            text: '岸上的人分不清。氣勢有用，讓他們以為船很多。',
            next: 'mo-a3',
            effects: { flags: ['bluff_fleet'], trust: 2, bonds: [{ id: 'wang', delta: -4 }] },
          },
          {
            text: '花福鹿若在市上，我想讓費信看見真的。',
            next: 'mo-a2',
            effects: { flags: ['want_zebra'], bonds: [{ id: 'fei', delta: 2 }, { id: 'ma', delta: 1 }] },
          },
        ],
      },
      {
        id: 'mo-a2',
        speakerId: 'wang',
        text: '蘇丹站在風裡，等你先開口。你開口的第一句若是實的，後面的香和象牙都好談。第一句若是虛的，珊瑚石會把那句話彈回來。',
        continueLabel: '第一句我說實的。',
      },
      {
        id: 'mo-a3',
        speakerId: 'wang',
        text: '氣勢能撐一刻。蘇丹數得清桅杆。你要吹，就準備好被問：其餘的帆在哪。答不出，比一開始就說分艙更難看。',
        continueLabel: '……我知道了。見了再看。',
      },
    ],
  },
  {
    id: 'local-mogadishu',
    locationId: 'mogadishu',
    kind: 'local',
    kicker: '珊瑚石上的城',
    entry: 'mo-l1',
    nodes: [
      {
        id: 'mo-l1',
        speakerId: 'mogadishu',
        text: '你們從太陽升起的那邊來。我聽過大明的船，今天看見的是幾艘，不是一片樹林。龍涎香在庫裡，象牙在市上。你們想看城，還是想拿東西就走？',
        variants: [
          {
            allFlags: ['bluff_fleet'],
            text: '你的人在港外說，船像樹林一樣多。我看見的是幾艘。你要我信哪一個？香可以談。謊我沒有興趣買。',
          },
          {
            allFlags: ['knows_detachments'],
            text: '你說還有船在別的岸，不在我門口。這句話我比較信。分艙而來的人，通常不是來搶城的。說吧。你要看，還是要換？',
          },
          {
            anyFlags: ['kept_doctor_promise', 'hormuz_heal'],
            text: '有商人說，你們在忽魯謨斯沒有丟下病人。所以我願意見你。幾艘船就幾艘船，不必裝成一支大軍。城對着海，海對着你們來的方向。',
          },
        ],
        choices: [
          {
            text: '以絲瓷換龍涎香，互相見禮。我們不多待，也不搶。',
            next: 'mo-l2',
            minSilver: 10,
            lockedHint: '見面的禮要 10 銀',
            effects: {
              flags: ['moga_respect_talk'],
              silver: -10,
              connections: 1,
              bonds: [{ id: 'mogadishu', delta: 8 }, { id: 'wang', delta: 2 }],
            },
          },
          {
            text: '我想看看你們叫做花福鹿的那種動物。',
            next: 'mo-l3',
            effects: { flags: ['asked_zebra'], knowledge: 1, morale: 2, bonds: [{ id: 'mogadishu', delta: 3 }, { id: 'fei', delta: 2 }] },
          },
          {
            text: '城和夜裡的星，我都想記下來，好讓後來的船找得到。',
            next: 'mo-l2',
            effects: { flags: ['moga_notes_talk'], knowledge: 1, bonds: [{ id: 'mogadishu', delta: 4 }, { id: 'ma', delta: 4 }] },
          },
          {
            text: '剛才的話過了。就照你看見的船來往。',
            next: 'mo-l2',
            allFlags: ['bluff_fleet'],
            effects: {
              flags: ['withdrew_bluff'],
              trust: -2,
              bonds: [{ id: 'mogadishu', delta: 6 }, { id: 'wang', delta: 3 }],
            },
          },
        ],
      },
      {
        id: 'mo-l2',
        speakerId: 'mogadishu',
        text: '這樣可以。香換布，名字換名字。你把木骨都束寫進簿子的時候，寫成一座有人的城，不要寫成航線的盡頭。盡頭是你們自己的詞。我們明天還要開市。',
        continueLabel: '寫成一座有人的城。',
      },
      {
        id: 'mo-l3',
        speakerId: 'mogadishu',
        text: '花福鹿在城外的欄裡，條紋比你們的旗誠實。牠不賣。看可以。你們的人若叫牠別的祥瑞名字，那是你們回國以後的事。在這裡，牠就是牠。',
        choices: [
          {
            text: '看就好。名字我們不在這裡改。',
            effects: { knowledge: 1, bonds: [{ id: 'mogadishu', delta: 4 }, { id: 'fei', delta: 3 }] },
          },
        ],
      },
    ],
  },
  {
    id: 'aftermath-mogadishu',
    locationId: 'mogadishu',
    kind: 'aftermath',
    kicker: '東非的風',
    entry: 'mo-z',
    nodes: [
      {
        id: 'mo-z',
        speakerId: 'wang',
        text: '非洲這一岸，是船隊真正踏過的遠岸。不是整支艦隊擠進同一座港。你記得這一點，奏章就不會浮。',
        variants: [
          {
            allFlags: ['moga_warm'],
            text: '禮物換了禮物。你沒有把幾艘船說成一片樹林，蘇丹因此肯把名字讓我們寫進簿子。龍涎香進艙的時候，我叫人輕一點，這東西比銀子金貴，也比牛皮氣容易散。',
          },
          {
            allFlags: ['bluff_cost'],
            text: '桅杆他數過了。你多說的那些帆，變成了信任上的一個洞。洞不大，可是在這麼遠的地方，補起來特別貴。',
          },
          {
            allFlags: ['withdrew_bluff', 'moga_trade'],
            text: '你把大話收回去了，禮也送到了。蘇丹的臉鬆下來。收回大話這件事，比禮還難得。我記在你名下，不記在我名下。',
          },
          {
            allFlags: ['moga_survey'],
            text: '石城、市集、夜裡那幾顆低低的星，都留下了。以後的船可以沿着你的句子來。句子裡沒有「我們的木骨都束」。好。',
          },
          {
            allFlags: ['moga_rush'],
            text: '船安全。人已經到了非洲東岸，你幾乎沒有把這裡的故事帶回去。皇上會覺得這一段白走。我會寫「到過」，不會寫「懂了」。',
          },
          {
            allFlags: ['moga_trade'],
            text: '香進了艙，名字進了簿。這座城肯認我們來過。分艙的船能做到這樣，就夠把遠岸帶回去。',
          },
        ],
        continueLabel: '還有一頭長脖子的鹿，在等我們把年份說對。',
      },
    ],
  },
  {
    id: 'arrival-bengal',
    locationId: 'bengal',
    kind: 'arrival',
    kicker: '先把年份放在桌上',
    entry: 'be-a1',
    nodes: [
      {
        id: 'be-a1',
        speakerId: 'wang',
        text: '鄭公，先把年份放在桌上。這不是永樂三年從劉家港出發的那一天。永樂十二年，第四次下西洋前後，榜葛剌要把一頭長脖子的鹿送去北京。翌年麻林也獻過。朝裡有人想叫牠麒麟。你怎麼叫，是你的事。我只要你別把它說成首航在占城牽到的。',
        choices: [
          {
            text: '年份我記住了。永樂十二年。見使臣吧。',
            next: 'be-a2',
            effects: { flags: ['dated_qilin'], knowledge: 1, bonds: [{ id: 'wang', delta: 4 }] },
          },
          {
            text: '皇上愛祥瑞。叫麒麟就好，少解釋。',
            next: 'be-a3',
            effects: { flags: ['rush_omen'], bonds: [{ id: 'wang', delta: -3 }, { id: 'ma', delta: -2 }] },
          },
          {
            text: '若我進不了北京，人和奏章都交給你。',
            next: 'be-a4',
            minBond: { id: 'wang', value: 65 },
          },
          {
            text: '讓馬歡用他在古里聽到的叫法先對一對。',
            next: 'be-a2',
            anyFlags: ['ma_stayed_calicut', 'ma_with_me', 'fei_honest'],
            effects: { flags: ['ma_compares'], knowledge: 1, bonds: [{ id: 'ma', delta: 4 }] },
          },
        ],
      },
      {
        id: 'be-a2',
        speakerId: 'wang',
        text: '使臣在等。牠吃樹葉。你對牠客氣一點，對年份也客氣一點。這兩樣客氣，都不會讓你變小。',
        continueLabel: '兩樣我都客氣。',
      },
      {
        id: 'be-a3',
        speakerId: 'wang',
        text: '祥瑞兩個字很好聽，也好寫。可你若不肯解釋牠從哪裡來、哪一年來，將來有學生會把整個航程記成「去占城牽麒麟」。這個錯，比少一塊賞賜難看。',
        choices: [
          {
            text: '你罵得對。年份我補上。',
            effects: {
              flags: ['dated_qilin'],
              clearFlags: ['rush_omen'],
              knowledge: 1,
              bonds: [{ id: 'wang', delta: 5 }, { id: 'ma', delta: 2 }],
            },
          },
          { text: '奏章要短。祥瑞二字夠了。', effects: { bonds: [{ id: 'wang', delta: -2 }] } },
        ],
      },
      {
        id: 'be-a4',
        speakerId: 'wang',
        text: '你把這句話說出來，我才答得了。若你回不去，我把人帶回去，把年份帶回去，把牠帶回去。麒麟這個詞，我讓朝裡自己叫。我不會改你的口。',
        choices: [
          {
            text: '那就交給你。我盡量自己走回去。',
            effects: { flags: ['wang_entrusted'], morale: 5, bonds: [{ id: 'wang', delta: 8 }] },
          },
        ],
      },
    ],
  },
  {
    id: 'local-bengal',
    locationId: 'bengal',
    kind: 'local',
    kicker: '使臣與那頭鹿',
    entry: 'be-l1',
    nodes: [
      {
        id: 'be-l1',
        speakerId: 'bengal',
        text: '正使。我國國王命我把牠送上你們的船。牠吃樹葉，不吃金，也不吃你們的祥瑞。脖子很長，脾氣比馬好。你們的朝會若叫牠麒麟，那是你們的字。我只要牠活着到北京。',
        variants: [
          {
            allFlags: ['calicut_squeeze'],
            text: '正使。古里有人說你們的手緊。手緊不要緊，我不管。這頭鹿不是拿來壓價的。國王命我送來，是禮。你們若把牠當成一筆好講的貨，我就把牠牽回去。',
          },
        ],
        choices: [
          {
            text: '我們會照牠的樣子寫，也會寫你們的禮，不把牠寫成怪物。',
            next: 'be-l2',
            effects: {
              flags: ['honest_creature'],
              bonds: [{ id: 'bengal', delta: 8 }, { id: 'ma', delta: 4 }, { id: 'wang', delta: 2 }],
            },
          },
          {
            text: '我不會說牠永樂三年就在船上。那是另一趟的事。',
            next: 'be-l2',
            allFlags: ['dated_qilin'],
            effects: {
              flags: ['qilin_dated_aloud'],
              knowledge: 1,
              bonds: [{ id: 'bengal', delta: 4 }, { id: 'wang', delta: 3 }],
            },
          },
          {
            text: '朝裡稱麒麟就夠了。你不用管我們的字。',
            next: 'be-l3',
            effects: { flags: ['omen_only'], trust: 3, bonds: [{ id: 'bengal', delta: -3 }, { id: 'ma', delta: -2 }] },
          },
          {
            text: '路上怎麼餵，請你的人跟我的水手一起看。',
            next: 'be-l2',
            effects: { flags: ['shared_feeding'], morale: 4, bonds: [{ id: 'bengal', delta: 6 }, { id: 'wang', delta: 2 }] },
          },
          {
            text: '東非的岸我們是去見過，不是去佔的。牠的來路，也請照實說。',
            next: 'be-l2',
            anyFlags: ['moga_respect_talk', 'withdrew_bluff', 'moga_survey'],
            effects: {
              flags: ['qilin_provenance'],
              knowledge: 1,
              connections: 1,
              bonds: [{ id: 'bengal', delta: 4 }, { id: 'mogadishu', delta: 2 }],
            },
          },
        ],
      },
      {
        id: 'be-l2',
        speakerId: 'bengal',
        text: '這樣我可以把繩子交給你的人。樹葉每天要新鮮。牠怕突然的鼓。你們的副使看起來不像會亂擂鼓的人，讓他站得近一點。北京很遠。活着到，比叫對名字重要。',
        continueLabel: '鼓收起來。樹葉的事我親自問。',
      },
      {
        id: 'be-l3',
        speakerId: 'bengal',
        text: '字你們自己愛怎麼用。我把話留在這裡：牠是一頭長脖子的鹿，從海商的網裡來，由我國當禮送出。你們若把這句話弄丟，那是你們的簿子，不是我的。',
        continueLabel: '這句話我不會弄丟。',
      },
    ],
  },
  {
    id: 'aftermath-bengal',
    locationId: 'bengal',
    kind: 'aftermath',
    kicker: '繩子交過來了',
    entry: 'be-z',
    nodes: [
      {
        id: 'be-z',
        speakerId: 'wang',
        text: '最會說故事的那一份禮物，已經有了着落。船要找西南風，慢慢回家。回家以前，我還有幾句只對你說。',
        variants: [
          {
            allFlags: ['qilin_well_read', 'qilin_named'],
            text: '你沒有把牠說成神話，也沒有把牠說成首航的戰利品。馬歡的筆記對上了。南京可以叫牠麒麟，我們知道牠吃樹葉。這兩句可以同時是真的。',
          },
          {
            allFlags: ['qilin_named'],
            text: '祥瑞這一次是你帶回去的。我要你在奏章開頭寫上永樂十二年，再寫榜葛剌。次序一錯，整趟航行的年份都會跟着錯。',
          },
          {
            allFlags: ['qilin_tribute'],
            text: '禮數到了。珍禽進了名單，皇上不算失望，也還沒有聽見那聲「麒麟」。不是失敗。只是你把最響的那個詞留在了嘴邊。',
          },
          {
            allFlags: ['qilin_left'],
            text: '穩。沒有人被不認識的蹄子踢到。可這趟最會說故事的禮物，你讓它留在岸上。我不會笑你。我只會在奏章裡空出那一行。',
          },
          {
            allFlags: ['qilin_miss'],
            text: '你猶豫太久。動物還在，名字沒有定。使臣在等。我們還可以在船上補一句實話，不必等進了午門才慌。',
          },
        ],
        continueLabel: '回家的話，我聽你說。',
      },
    ],
  },
];

export const EPILOGUE: TalkScene = {
  id: 'epilogue',
  locationId: 'bengal',
  kind: 'epilogue',
  kicker: '船要回頭了',
  entry: 'end-1',
  nodes: [
    {
      id: 'end-1',
      speakerId: 'wang',
      text: '風向要轉了。人還在甲板上的，就算這趟沒有白走。你要我補甚麼，現在補。進了劉家港，就全是別人的問題。',
      variants: [
        {
          allFlags: ['wang_entrusted'],
          minBond: { id: 'wang', value: 70 },
          text: '你把人和奏章交給過我。我沒有拿去邀功。船要回頭了。你還在，這句交代就還在你自己嘴裡。我只在你真的回不去時才開口。',
        },
        {
          minBond: { id: 'wang', value: 70 },
          allFlags: ['qilin_named'],
          text: '麒麟在，人也在。我站在你身後，不搶着說話。北京若問為甚麼值得走這一趟，你就說：海路是通的，朋友有名字，倉沒有變成城。',
        },
        {
          minBond: { id: 'wang', value: 70 },
          text: '沒有那頭鹿也好。人齊，這是我要的。你後來肯問我，我才把難聽的話說完。這趟我跟你走得完。',
        },
        {
          maxBond: { id: 'wang', value: 32 },
          text: '奏章我寫好了，你簽字就行。這一路你不大問我。難聽的句子我沒有替你改順。改順了，就不像你了。',
        },
      ],
      choices: [
        { text: '景弘，你還有甚麼一定要補的？', next: 'end-2' },
        { text: '回南京吧。剩下的路，我們少說話也好。', next: 'end-3', effects: { bonds: [{ id: 'wang', delta: -1 }] } },
      ],
    },
    {
      id: 'end-2',
      speakerId: 'wang',
      text: '我記得的是人還在不在，不是旗有多響。其餘的，海自己會記住。',
      variants: [
        {
          allFlags: ['broke_doctor_promise'],
          text: '有一句我必須補：忽魯謨斯的醫官，你先答應了，又帶走。這一句會在奏章的夾頁裡。你若自己說，比我說好看。',
        },
        {
          allFlags: ['shi_disappointed'],
          text: '施進卿的事我會照實寫。你信過他，又把海盜留在河上。你別讓我替你圓。圓了，下一個頭目就不會再送信來。',
        },
        {
          allFlags: ['depot_uneasy'],
          text: '滿剌加的倉立了，國王卻不放心。占城那一面旗的影子還在。我會寫明柵欄不是城牆。你回國以後，不准別人把它說成我們的地。',
        },
        {
          allFlags: ['depot_warm'],
          text: '官廠那幾間倉，我寫明了是滿剌加的岸，我們只是屯米、候風、會合。這一句比多一個祥瑞重要。你點頭，我就這樣送進南京。',
        },
        {
          allFlags: ['kept_doctor_promise'],
          text: '忽魯謨斯的醫案比地毯好看。你沒有食言。我會把這件事寫得很短：病人得到水，船沒有趁夜跑。短，才像真的。',
        },
        {
          allFlags: ['censored_fei'],
          text: '費信有一頁你不讓他交。那一頁還在。我不會偷去上奏。你若後悔，現在說，他還肯把飢渴寫回去。',
        },
        {
          allFlags: ['qilin_well_read'],
          text: '麒麟這兩個字可以進朝。年份和榜葛剌也必須進朝。馬歡對過古里的叫法。你不要在午門前突然改口，說是第一年就牽到的。',
        },
      ],
      choices: [
        {
          text: '這些話，照你說的寫進奏章。',
          next: 'end-3',
          effects: { trust: 2, bonds: [{ id: 'wang', delta: 3 }] },
        },
        { text: '奏章你看着重點。細節我自己記得。', next: 'end-3' },
      ],
    },
    {
      id: 'end-3',
      speakerId: 'ma',
      text: '正使。我馬歡。能問的我問了，不能問的我沒有編。年份、港口、誰先伸手誰先伸刀，簿子上是分開的。你若要我再讀一遍給你聽，回到劉家港以前還來得及。',
      variants: [
        {
          maxBond: { id: 'ma', value: 18 },
          text: '馬歡把簿子合上。他只說：年份我對過了。其餘的路，你自己記得。通事不是用來把故事說圓的。',
        },
        {
          minBond: { id: 'ma', value: 40 },
          text: '正使，這一路你准我問。占城的衣冠、古里的契約、那頭鹿吃樹葉，都在。我不會把滿剌加的倉寫成我們的城，也不會把木骨都束寫成全軍都到過。你要聽，我現在就能背給你。',
        },
      ],
      choices: [
        {
          text: '背要緊的三句就好。',
          next: 'end-4',
          minBond: { id: 'ma', value: 25 },
        },
        { text: '夠了。讓船去找風。', next: 'end-5' },
      ],
    },
    {
      id: 'end-4',
      speakerId: 'ma',
      text: '三句。第一，冬天由五虎門放洋，不是盛夏從劉家港直渡。第二，滿剌加的官廠是人家岸上的倉。第三，麒麟是永樂十二年榜葛剌送來的長頸鹿，不是首航的戰利品。其餘的選擇，是你的，不是我的。',
      continueLabel: '這三句，我帶回去。',
    },
    {
      id: 'end-5',
      speakerId: 'wang',
      text: '那就起錨。沙漏可以再走了。劉家港見。',
      variants: [
        {
          minBond: { id: 'wang', value: 60 },
          text: '那就起錨。你去船頭站着就好，不用再下命令。風的事，我和周聞看着。劉家港見。',
        },
      ],
      continueLabel: '劉家港見。',
    },
  ],
};
