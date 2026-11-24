import { CrisisScript } from '../services/talk';

export const CRISIS_TALK: Record<string, CrisisScript> = {
  nanjing: {
    speakerId: 'zhou',
    lead: '雲已經壓到沿岸來了。正使，你現在選。我的建議你聽過：能繞就繞，星看不準就不要裝懂。鼓是最後的東西，不是第一的東西。',
    leadVariants: [
      {
        allFlags: ['listened_zhou'],
        text: '雲來了。你已經答應先去長樂候風，這團雲不是叫你改主意的理由。繞開，人還在，日子慢一點，南京我可以幫副使解釋。',
      },
      {
        allFlags: ['rushed_zhou'],
        text: '雲來了。你剛才說要快。快和闖不是同一個字。你若現在擂鼓，我不會替你喊第二聲。',
      },
    ],
    asideSpeakerId: 'wang',
    aside: '我在你左邊。你看我一眼再下令。水手的眼睛，比雲誠實。',
    asideVariants: [
      {
        minBond: { id: 'wang', value: 55 },
        text: '鄭公，你看我一眼。我點頭，是人齊了。我不點頭，你就不要擂鼓。這是我們說好的。',
      },
      {
        maxBond: { id: 'wang', value: 30 },
        text: '命令你下。我執行。看不看我，隨你。',
      },
    ],
  },
  champa: {
    speakerId: 'champa',
    lead: '（國王沒有坐下。）船還在我的岸外。你們下一句，是讓我看見旗，還是讓我看見布？我的淡水只給說得明白的人。',
    leadVariants: [
      {
        anyFlags: ['champa_gift_talk', 'champa_calm', 'champa_spoke_for'],
        text: '布的事我們談過了。岸上的人仍在看你們怎麼做，不是看你們怎麼許。下一句，請做給他們看。',
      },
      {
        allFlags: ['champa_hard_talk'],
        text: '旗你已經給我看過一次。再看一次，我的門就只剩一條縫。你若還有別的句子，現在說。',
      },
    ],
    asideSpeakerId: 'wang',
    aside: '他在等一個做得出來的動作。禮、旗、曆書，三選一。不要三個一起上。',
    asideVariants: [
      {
        allFlags: ['ma_protocol'],
        text: '馬歡把禮數問過了。你現在選一樣做透，比三樣都點到為止好。',
      },
    ],
  },
  palembang: {
    speakerId: 'chen',
    lead: '正使來了就好。酒是熱的，心是熱的。我陳祖義，願意歸附大明。河口這些小船，都是來迎接你們的。你笑一笑，這件事就過去了。',
    leadVariants: [
      {
        allFlags: ['knows_cousins'],
        text: '正使，酒還熱着。那些小船真是來迎接的。帆上有補丁的幾艘，你不用看那麼細。看細了，酒就涼了。來，歸附兩個字，你收下。',
      },
      {
        allFlags: ['sober_night'],
        text: '正使怎麼不喝？歸附這種事，乾着嘴說，多生分。我陳祖義最討厭生分。你把杯子端起來，河就安靜了。',
      },
    ],
    asideSpeakerId: 'wang',
    aside: '笑可以還，酒不要乾。施進卿的話若你還放在心上，就不要在這裡把他忘掉。',
    asideVariants: [
      {
        allFlags: ['trust_shi'],
        text: '施進卿把堂親的船告訴你了。你若現在只守着自己的艙，他會覺得自己被賣了。',
      },
      {
        allFlags: ['dismiss_shi'],
        text: '你不信施進卿。那你就只信自己的眼睛。小船比昨天多，這是眼睛看得見的。',
      },
      {
        allFlags: ['doubled_watch'],
        text: '哨已經加了。你有本錢跟他慢慢耗。不必為了顯得大方，就把哨撤掉。',
      },
    ],
  },
  malacca: {
    speakerId: 'malacca',
    lead: '正使，北面的影子還在。倉，名分，或者你替我跟暹羅說一句，這三樣你今天能做哪一樣？我的岸不在這三樣裡面。',
    leadVariants: [
      {
        allFlags: ['malacca_reassured'],
        text: '你說過，地仍是我的。我把這句話當成真的。現在談做事：冊封、蓋倉，還是去跟暹羅說和。倉若要蓋，蓋成屯米的地方，候西南風用。',
      },
      {
        allFlags: ['malacca_pressure'],
        text: '你剛才讓我數船。船我數完了，心也涼了一點。你若還想做朋友，就用做事來暖，不要再用數目。',
      },
    ],
    asideSpeakerId: 'wang',
    aside: '他要的是朋友。我們要的是倉。兩句都說，就不要再加第三句「順便」。',
    asideVariants: [
      {
        allFlags: ['depot_promise'],
        text: '你答應過親口說：官廠是倉，不是城。現在就是那個時候。',
      },
      {
        allFlags: ['pirate_ignored'],
        text: '他可能會問舊港。你若答「不關我們的事」，這座倉就會蓋得很慢。',
      },
    ],
  },
  semudera: {
    speakerId: 'semu',
    lead: '灰落下來了。孩子在跑。正使，你的船是往外海退，還是把乾糧放下來？書可以最後再寫。人不能最後再跑。',
    leadVariants: [
      {
        allFlags: ['semu_water'],
        text: '淡水你已經給過。灰卻忽然大了。正使，你是把人再往外海帶，還是連乾糧一起留下？我不會把宮裡的閒話混進來。今天只有灰。',
      },
    ],
    asideSpeakerId: 'wang',
    aside: '史書沒有把哪一年的噴發寫死在我們名下。人正在跑。我們先做人該做的事，不要做一篇文章。',
    asideVariants: [
      {
        allFlags: ['separated_stories'],
        text: '蘇幹剌的名字留在以後。你今天的命令裡不要出現它。灰是灰。',
      },
    ],
  },
  ceylon: {
    speakerId: 'envoy',
    lead: '國王在宮裡備了宴，座位已經按你們的禮數排好。請正使進城。岸上的貨，我們的人可以幫你看着。你不必帶太多隨從，城門窄。',
    leadVariants: [
      {
        anyFlags: ['ceylon_warned', 'ceylon_path', 'heed_monk'],
        text: '長老那邊你已經去過了。國王仍在等。宴是真心的，城門也是開的。請吧。人不用帶那麼多，窄路不好走。',
      },
    ],
    asideSpeakerId: 'wang',
    aside: '「幫你看着貨」這一句，我聽着像刀。你若進城，我留在船上。你若不進城，也給我一個說得過去的理由。',
    asideVariants: [
      {
        allFlags: ['wang_keeps_ship'],
        text: '你叫我留在船上掌指揮。我就留。城裡無論多亮，錨不離我的手。',
      },
      {
        allFlags: ['ceylon_warned'],
        text: '和尚說刀比盤子多。我信他。你要取王城，就快，不要在宴席上才明白。',
      },
      {
        allFlags: ['eager_feast'],
        text: '你說過赴宴才是禮。禮走到這一步，你可以改口。改口不丟臉。全軍進一座太乾淨的城，才丟臉。',
      },
    ],
  },
  indianocean: {
    speakerId: 'fei',
    lead: '風還是不來。水桶輕得能聽見木板。正使，再不定規矩，有人會自己去開桶。我可以把今天的星高寫下來，可寫不來水。',
    leadVariants: [
      {
        allFlags: ['shared_water'],
        text: '你的勺已經減過了。下面的人看見了，所以還沒有人搶桶。可水仍舊不夠。正使，定量、祭，或者去看洋流，你得選一個做完。',
      },
      {
        allFlags: ['censored_fei'],
        text: '我按你的意思，慘的沒有寫進要上交的那頁。水卻不會因為沒被寫下來就變多。你現在怎麼分？',
      },
    ],
    asideSpeakerId: 'wang',
    aside: '定量最狠，也最清楚。祭能讓人再等一夜。看星看水，是給以後的船留路。三樣都要，人會散。',
    asideVariants: [
      {
        allFlags: ['wang_watched'],
        text: '更我看過了。人還信你。你現在下狠命令，他們比較聽得進去。',
      },
      {
        allFlags: ['wang_executes_water'],
        text: '你說規矩由你定、我執行。那就定。定完你自己也喝那一勺。',
      },
    ],
  },
  calicut: {
    speakerId: 'calicut',
    lead: '單子可以寫，架也可以打。港上有兩夥商人為了你們的布在吵。正使，你是把契約簽了，站出去平架，還是只加水就走？',
    leadVariants: [
      {
        allFlags: ['fair_contract_talk'],
        text: '平價的話你說過。現在把話變成單子，或者去平那一場架。只加水就走，也可以，只是這座城會當你沒來過。',
      },
      {
        allFlags: ['calicut_squeeze'],
        text: '你壓過一次價。市集已經在看你第二次怎麼伸手。契約仍可以簽。人卻不一定再跟你笑。',
      },
    ],
    asideSpeakerId: 'wang',
    aside: '胡椒要上船，臉也要還在。你選一件主事。馬歡若在，讓他記，別讓他去吵。',
    asideVariants: [
      {
        allFlags: ['ma_stayed_calicut'],
        text: '馬歡在市集裡。你去平架的話，叫他站在你身後，不要站在兩夥人中間。筆不是盾。',
      },
    ],
  },
  hormuz: {
    speakerId: 'hormuz',
    lead: '熱還沒退。你們的醫官若要上來，現在走那條指定的路。你們若要走，就在天黑以前把水買走。停在中間看，是最讓我難堪的一種。',
    leadVariants: [
      {
        allFlags: ['doctor_terms'],
        text: '路我留了。醫官可以來。你若現在改口隔開，或趁夜離開，這座城會記住改口，不會記住你先前的好句子。',
      },
      {
        allFlags: ['hormuz_leave_talk'],
        text: '你說買水就走。水在這邊。走得明白一點，我還能把你送出港。不要走出一半又回頭看地毯。',
      },
    ],
    asideSpeakerId: 'wang',
    aside: '這不是史書裡的一場大疫。是這個碼頭、這個星期的病。可失約就是失約，跟史書有沒有寫無關。',
    asideVariants: [
      {
        allFlags: ['promised_doctor'],
        text: '醫官的事你答應過。你若現在隔開或連夜走，我會在結果裡寫上失約。不是嚇你。是我說到做到。',
      },
      {
        allFlags: ['wang_fear_told'],
        text: '名字我會寫。你只要告訴我：我們留，還是走。兩樣我都執行。兩樣都沾一點，我做不到。',
      },
    ],
  },
  mogadishu: {
    speakerId: 'mogadishu',
    lead: '香在這裡，象牙在這裡。你們可以換，可以記，也可以只補水。補水最快。換和記，才會讓這座城在你們的簿子裡是一座城。',
    leadVariants: [
      {
        allFlags: ['moga_respect_talk'],
        text: '禮我們見過了。現在是做事。絲瓷換香，或把城和星一起記下來。只補水，我也不攔。只是你來這麼遠，故事會很短。',
      },
      {
        allFlags: ['bluff_fleet'],
        noneFlags: ['withdrew_bluff'],
        text: '你的大話還在港外飄着。你可以換香。換的時候，我會記住桅杆的數目，跟你說的不一樣。',
      },
    ],
    asideSpeakerId: 'wang',
    aside: '分艙到了這裡，已經很遠。不要為了顯得忙，把非洲東岸走成一個水站。',
    asideVariants: [
      {
        allFlags: ['knows_detachments'],
        text: '你沒有把幾艘船說成全軍。這很好。接下來的選擇，就按這幾艘船做得到的來。',
      },
      {
        allFlags: ['asked_zebra'],
        text: '花福鹿他准你看了。費信的筆在抖。你若還要記星，讓他們記。祥瑞的名字，回北京再吵。',
      },
    ],
  },
  bengal: {
    speakerId: 'bengal',
    lead: '繩子在我手上。北京的人會問牠是甚麼。你現在就要決定：照見聞把牠認清楚，按朝貢的禮收下，還是只收香料、把動物留下。牠在聽鼓。你小聲一點。',
    leadVariants: [
      {
        allFlags: ['honest_creature', 'dated_qilin'],
        text: '你答應過照牠的樣子寫，也答應過不把年份說錯。現在就是寫的時候。認清楚，或只按禮收下。把牠留下，也可以，只是你要當着我說。',
      },
      {
        allFlags: ['omen_only'],
        text: '你說叫麒麟就夠了。牠仍要吃樹葉，仍不是永樂三年那艘船上的。名字你可以短。事實不行。',
      },
    ],
    asideSpeakerId: 'wang',
    aside: '永樂十二年。榜葛剌。長頸鹿。朝裡若稱麒麟，那是朝裡的字。這三樣不要弄亂。',
    asideVariants: [
      {
        allFlags: ['ma_compares'],
        text: '馬歡對過古里的叫法了。你若選「認清楚」，他的筆記用得上。這會變成你的學識，不是我的。',
      },
      {
        allFlags: ['wang_entrusted'],
        text: '你若回不去，這三個詞我帶得走。你還在，就由你自己說。我站在牠吃樹葉的那一側。',
      },
      {
        allFlags: ['shared_feeding'],
        text: '水手已經跟使臣的人一起餵過。牠認得他們的聲音。你現在不要突然擂鼓。',
      },
    ],
  },
};
