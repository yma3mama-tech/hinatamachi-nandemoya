/* 魔法の町のなんでも屋 ― 世界のデータ
 * 住人・場所・持ち物・ふだんの会話（依頼に関係しない会話）
 */
'use strict';

const pick = a => a[Math.floor(Math.random() * a.length)];

/* ---------- 住人 ---------- */
CH = {
  hero: {
    name: () => S.name, color: '#c0703e',
    face: { n: 'f_hero_n', a: 'f_hero_a', b: 'f_hero_b', c: 'f_hero_c', d: 'f_hero_d' },
  },
  shiki: {
    name: 'シキ', color: '#6f82ad', st: 'shiki',
    face: { n: 'f_shiki_n', a: 'f_shiki_a', b: 'f_shiki_b' },
    note: 'なんでも屋「ほしや」の店主。年齢不詳。いつもお茶を飲んでいて、話し方が少し古風。「今日は休んでいいよ」が口ぐせ。',
  },
  hana: {
    name: 'ハナ', color: '#cf8585', st: 'hana',
    face: { n: 'f_hana_n', a: 'f_hana_a', b: 'f_hana_b' },
    note: '花屋のおばあさん。世話焼きで話し好き。少し頑固だけど根は優しい。庭にはネコや小さな精霊がよく遊びに来る。',
  },
  tsubaki: {
    name: 'ツバキ', color: '#6f8bb8', st: 'tsubaki',
    face: { n: 'f_tsubaki_n', a: 'f_tsubaki_a', b: 'f_tsubaki_b' },
    note: '郵便局の青年。誠実で責任感が強いけれど、少し融通が利かない。仕事の話になると急に早口になる。',
  },
  roki: {
    name: 'ロキ', color: '#b8924a', st: 'roki',
    face: { n: 'f_roki_n', a: 'f_roki_a', b: 'f_roki_b' },
    note: '雑貨屋の主人。ぶっきらぼうだが面倒見がいい。道具の修理と材料の調達が得意。ときどき店の商品を押しつけてくる。',
  },
  mil: {
    name: 'ミル', color: '#d98a4e', st: 'pan',
    face: { n: 'f_mil_n', a: 'f_mil_a' },
    note: 'パン屋の夫。明るくて話し好き。朝早くから店を開けている。',
  },
  coco: {
    name: 'ココ', color: '#d98a4e', st: 'pan',
    face: { n: 'f_coco_n', a: 'f_coco_a' },
    note: 'パン屋の妻。少しおとなしめの聞き役。夫婦の会話はときどき噛み合っていない。',
  },
  suzu: {
    name: 'スズ', color: '#7f9f7a', st: 'suzu',
    face: { n: 'f_suzu_n', a: 'f_suzu_a' },
    note: '楽器屋の青年。夢見がちで少し天然。話の途中でふと演奏を始めることがある。',
  },
  hotaru: {
    name: 'ホタル', color: '#8f84bd', st: 'hotaru',
    face: { n: 'f_hotaru_n', a: 'f_hotaru_a' },
    note: '夜しか現れない住人。静かで物知り。朝日が近づくと姿を消す。',
  },
  chibi: {
    name: 'チビ', color: '#8a9c84', st: 'chibi',
    face: { n: 'f_chibi_n', a: 'f_chibi_a' },
    note: 'ハナの庭にいる灰色のネコ。マイペースで、気に入らないとすぐ木に登る。少しだけ人の言葉がわかるらしい。',
  },
  seirei: {
    name: '小さな精霊', color: '#c9a83a', st: 'seirei', orb: true,
    note: 'パン屋の地下室に住み着いた、光の玉のような小さな精霊。パンが好き。',
  },
};

STANDEES = {
  shiki: 'img/st_shiki.png', hana: 'img/st_hana.png', tsubaki: 'img/st_tsubaki.png', roki: 'img/st_roki.png',
  pan: 'img/st_pan.png', suzu: 'img/st_suzu.png', hotaru: 'img/st_hotaru.png', chibi: 'img/st_chibi.png',
  seirei: 'orb',
};

/* ---------- 持ち物 ---------- */
ITEMS = {
  hoshizakana: { name: '干し魚', icon: '🐟', desc: 'チビの大好物。ハナに多めにもらった。' },
  hanataba: { name: '季節の花束', icon: '💐', desc: 'ハナがくれた小さな花束。飾ると店が少し華やかになる。' },
  tegami: { name: '迷子の手紙', icon: '✉️', desc: '風に飛ばされて、木のうろに挟まっていた手紙。ツバキに届けよう。' },
  lamp: { name: 'ロキのランプ', icon: '🏮', desc: 'ロキが大事にしている古いランプ。急に光らなくなったらしい。' },
  nuno: { name: '古い布切れ', icon: '🧵', desc: 'ハナにもらった、やわらかい古布。ランプの芯になる。' },
  ishi: { name: '光る石', icon: '💎', desc: '噴水の底で拾った、ほのかに光る小石。' },
  dougubako: { name: '小さな道具箱', icon: '🧰', desc: 'ロキにもらった道具箱。材料を拾うとき、ついでにもう少し持ち帰れることがある。' },
  komugi: { name: '小麦粉', icon: '🌾', desc: 'ロキの店の奥にあった小麦粉。パン屋に届けよう。' },
  herb: { name: '乾燥ハーブの小袋', icon: '🌿', desc: 'ロキが「ついでに持っていけ」とくれた。お茶に入れるといい香りがする。' },
  pan: { name: '焼きたてパン', icon: '🥐', desc: 'ミルとココのパン。ほしやのテーブルで食べられる。' },
  amapan: { name: 'ココ特製の甘いパン', icon: '🍯', desc: 'はちみつの香りがする、ココ特製のパン。' },
};

/* ---------- 場所 ---------- */
const dayOnly = S => S.time < 3;
const closedSpot = (x, y) => ({ id: 'closed', x, y, label: '閉まった店', scene: 'closed_shop' });

LOCS = {
  shop: {
    name: 'ほしや', bg: 'img:bg_shop.jpg', indoor: true, map: [600, 290],
    npcs: S => {
      const l = [{ id: 'shiki', at: 'c' }];
      if (S.f.chibiVisits && S.day % 2 === 0 && S.time < 3) l.push({ id: 'chibi', at: 'r', cls: 'win', label: 'チビ' });
      return l;
    },
    deco: (S, d) => {
      if (S.f.bouquetShown) {
        const b = el('div', '', '💐');
        Object.assign(b.style, { position: 'absolute', left: '4%', top: '47%', fontSize: 'min(7vh,48px)', filter: 'drop-shadow(0 3px 4px rgba(0,0,0,.4))' });
        d.appendChild(b);
      }
    },
    actions: S => {
      const canTake = !S.active && QUESTS.some(q => questState(q) === 'open' && (!q.when || q.when(S).ok));
      return [
        { t: '📮 依頼箱', fn: openRequests, hl: canTake },
        { t: '🔧 奥の部屋', fn: () => moveTo('backroom'), hl: S.objAt === 'backroom' },
        { t: '☕ ひと休み', fn: () => play('rest') },
        { t: '🚪 外へ出る', fn: openMap, hl: !!(S.active && S.objAt && !['shop', 'backroom'].includes(S.objAt)) },
        { t: '🌙 おやすみ', fn: () => play('sleep'), hl: !S.active && S.time === 3 },
      ];
    },
  },
  backroom: {
    name: 'ほしや・奥の部屋', bg: 'img:bg_backroom.jpg', indoor: true, parent: 'shop',
    npcs: () => [],
    actions: S => [
      { t: '🛠 作業台', fn: () => play(benchScene()), hl: S.objAt === 'backroom' },
      { t: '🗄 特別な引き出し', fn: () => play('drawer') },
      { t: '⬅ 店にもどる', fn: () => moveTo('shop') },
    ],
  },
  plaza: {
    name: '中央広場', focal: [600, 530], map: [598, 500],
    spots: S => [
      { id: 'fountain', x: 50, y: 52, label: '噴水', scene: 'look_fountain' },
      { id: 'bench', x: 22, y: 62, label: 'ベンチ', scene: 'look_bench' },
    ],
  },
  hana: {
    name: '花屋（ハナの店）', focal: [845, 420], map: [845, 395],
    npcs: S => dayOnly(S) ? [{ id: 'hana' }, { id: 'chibi', at: 'r', cls: 'small', label: 'チビ' }] : [],
    spots: S => dayOnly(S) ? [{ id: 'flower', x: 50, y: 30, label: '花壇', scene: 'look_flower' }] : [closedSpot(50, 40)],
  },
  pan: {
    name: 'パン屋（ミル＆ココ）', focal: [760, 700], map: [758, 680],
    npcs: S => dayOnly(S) ? [{ id: 'pan', st: 'pan', talk: 'talk_pan' }] : [],
    spots: S => dayOnly(S) ? [{ id: 'smell', x: 25, y: 35, label: 'いい匂い', scene: 'look_bread' }] : [closedSpot(50, 40)],
  },
  zakka: {
    name: '雑貨屋（ロキの店）', focal: [478, 660], map: [475, 630],
    npcs: S => dayOnly(S) ? [{ id: 'roki' }] : [],
    spots: S => dayOnly(S) ? [{ id: 'shelf', x: 80, y: 32, label: '店先の棚', scene: 'look_shelf' }] : [closedSpot(50, 40)],
  },
  post: {
    name: '郵便局', focal: [400, 335], map: [400, 300],
    npcs: S => dayOnly(S) ? [{ id: 'tsubaki' }] : [],
    spots: S => [{ id: 'postbox', x: 22, y: 40, label: '赤いポスト', scene: 'look_postbox' }],
  },
  gakki: {
    name: '楽器屋（スズの店）', focal: [1050, 525], map: [1055, 490],
    spots: S => [{ id: 'door', x: 50, y: 42, label: '店の扉', scene: 'look_gakki' }],
  },
  view: {
    name: '丘の上の見晴らし台', focal: [655, 130], map: [660, 85],
    spots: S => [{ id: 'view', x: 50, y: 40, label: '町を見下ろす', scene: 'look_view' }],
  },
  forest: {
    name: '小さな森の入口', focal: [960, 290], map: [1030, 265],
    spots: S => [{ id: 'trees', x: 50, y: 40, label: '木漏れ日', scene: 'look_forest' }],
  },
  saka: {
    name: '坂道の住宅街', focal: [175, 630], map: [175, 585],
    spots: S => [{ id: 'houses', x: 50, y: 42, label: '家並み', scene: 'look_saka' }],
  },
  basement: {
    name: 'パン屋・地下室', bg: 'basement', indoor: true, parent: 'pan',
    npcs: () => [],
    actions: S => [{ t: '⬆ 地下室を出る', fn: () => moveTo('pan') }],
  },
};

function benchScene() {
  for (const h of HOOKS) if (h.bench) { const s = h.bench(S); if (s) return s; }
  return 'bench_idle';
}

/* ---------- 町を眺める（調べる所） ---------- */
SCENES.look_fountain = S => [{ n: S.time === 3 ? '夜の噴水。水面に街灯の光がゆらゆら映っている。' : '小さな噴水。水の音が心地いい。ベンチで立ち話をしている人たちがいる。' }];
SCENES.look_bench = S => [{ n: pick(['ベンチに座ると、噴水の水音とパンの匂いが一緒に流れてくる。', 'ベンチで、おじいさんが鳩に話しかけている。返事はない。', '「今日はいい天気だねえ」と、知らない人に声をかけられた。']) }];
SCENES.look_flower = [{ n: '季節の花が、少しずつ色を変えながら咲いている。土の匂いがする。' }];
SCENES.look_bread = [{ n: '焼きたてのパンの匂い。お腹が小さく鳴った。' }];
SCENES.look_shelf = [{ n: '工具、ひも、瓶、釘……。何に使うのかわからない物もたくさん並んでいる。' }];
SCENES.look_postbox = [{ n: '赤いポスト。ていねいに磨かれていて、ぴかぴかだ。' }];
SCENES.look_gakki = S => [{ n: S.time === 3 ? '楽器屋は閉まっている。窓の奥に、ギターの形の影が見える。' : '中から、ぽろん……と弦の音が聞こえる。今は手が離せないみたいだ。' }];
SCENES.look_view = S => S.time === 3
  ? [{ n: '夜の町の明かりが、星みたいに小さく灯っている。' }, { n: '……誰かが隣にいた気がした。振り向くと、光の粒がひとつ、ふわりと消えていった。' }]
  : [{ n: '町が一望できる。屋根がおもちゃみたいに小さい。遠くに海が光っている。' }];
SCENES.look_forest = S => [{ n: S.time === 3 ? '夜の森は、しんと静まりかえっている。今日はやめておこう。' : '昼間でも少し薄暗い。木漏れ日がまだら模様を描いている。いつか材料集めに来ることになりそうだ。' }];
SCENES.look_saka = [{ n: '普通の家が並んでいる。洗濯物が風に揺れて、どこかで子供の笑い声がする。' }];
SCENES.closed_shop = [{ n: '今日はもう閉まっている。明かりの消えた窓が、少しさびしそうだ。' }];
SCENES.bench_idle = [{ n: '作業台。魔法で動く小さな道具や、光る石が無造作に並んでいる。今は直す物がない。' }];
SCENES.drawer = [{ n: '星の飾りがついた、特別な引き出し。' }, { n: '……開かない。シキさんいわく「そのうちね」とのこと。' }];

/* ---------- ふだんの会話 ---------- */
SCENES.talk_shiki = S => {
  const q = QUESTS.find(x => x.id === S.active);
  if (q && q.hint) return [{ say: 'shiki', f: 'n', t: q.hint(S) }];
  if (QUESTS.some(x => questState(x) === 'open')) {
    const w = QUESTS.filter(x => questState(x) === 'open').every(x => x.when && !x.when(S).ok);
    if (w) return [{ say: 'shiki', t: '依頼の紙はあるけれど、今はまだ時間が合わないみたいだね。ひと休みでもして待つといい' }];
    return [{ say: 'shiki', t: '依頼箱に紙が入っているよ。気が向いたら見てごらん' }];
  }
  return [pick([
    { say: 'shiki', f: 'a', t: 'お茶、もう一杯どうだい。……ああ、熱いから気をつけて' },
    { say: 'shiki', t: '今日は休んでいいよ。店はね、閉まっていてもちゃんと店なんだ' },
    { say: 'shiki', f: 'b', t: 'この町の人はみんな、どこか抜けていて、どこか優しい。君もそのうちわかるよ' },
    { say: 'shiki', t: '帳簿をつけていたら、眠くなってしまった。……いや、起きているよ' },
    { say: 'shiki', f: 'a', t: '窓から見える木、昔からあそこにあるんだ。ネコの通り道でもあるらしい' },
  ])];
};

SCENES.talk_hana = S => {
  const l = [{ meet: 'hana' }];
  if (S.f.catLover && !S.f.saidCatLover) return l.concat([{ set: { saidCatLover: true } }, { say: 'hana', f: 'a', t: 'あら、猫好きさん。いらっしゃい' }, { say: 'hana', t: 'チビったら、あれからあなたの話をすると耳がぴくっと動くのよ' }]);
  return l.concat([pick([
    { say: 'hana', f: 'a', t: 'あら、いらっしゃい。今日はどの花も機嫌がいいのよ' },
    { say: 'hana', t: 'ロキったらね、昔から花を「草」って呼ぶの。失礼しちゃうわ' },
    { say: 'hana', f: 'b', t: 'この時期は、朝に水をあげるのがいちばん。花も人も、朝ごはんは大事でしょう？' },
    { say: 'hana', t: '若いのにしっかりしてるわねえ。シキさん、いい人を見つけたわ' },
  ])]);
};
SCENES.talk_chibi = S => [{ meet: 'chibi' }, { se: 'meow' }, pick([
  { say: 'chibi', t: 'にゃあ' },
  { say: 'chibi', f: 'a', t: 'ん、にゃ' },
  { n: 'チビはこちらを見て、ゆっくりまばたきをした。' },
  { n: 'チビは足元をくるりと一周して、またお昼寝に戻った。' },
])];
SCENES.talk_tsubaki = S => {
  const l = [{ meet: 'tsubaki' }];
  if (S.f.peekedLetter && !S.f.saidPeek) return l.concat([{ set: { saidPeek: true } }, { say: 'tsubaki', f: 'b', t: 'あ、ほしやさん。……手紙の中身は……いえ、なんでもありません' }]);
  return l.concat([pick([
    { say: 'tsubaki', t: 'こんにちは。今日は配達が十二件、うち坂道が五件で……あっ、すみません、つい' },
    { say: 'tsubaki', f: 'a', t: '雨の日の配達は大変ですが、晴れた日の坂道は気持ちいいんですよ' },
    { say: 'tsubaki', t: 'スズさんの家の住所、なぜか毎回ちょっとずつ違うんです。本人に聞いても「だいたい合ってるよ」って……' },
  ])]);
};
SCENES.talk_roki = S => {
  const l = [{ meet: 'roki' }];
  if (S.f.lampStyle === 'soft' && !S.f.saidLampSoft) return l.concat([{ set: { saidLampSoft: true } }, { say: 'roki', t: '……あのランプ、夜に点けると昔のことを思い出す' }, { say: 'roki', f: 'b', t: 'お前、案外気が利くな' }]);
  if (S.f.lampStyle === 'strong' && !S.f.saidLampStrong) return l.concat([{ set: { saidLampStrong: true } }, { say: 'roki', f: 'a', t: 'あのランプ、店先でよく目立ってる。客が「あれ売り物か」って聞いてきやがる' }]);
  return l.concat([pick([
    { say: 'roki', t: 'おう。用がないなら……まあ、見ていけ' },
    { say: 'roki', f: 'a', t: 'これ、持っていけ。……いや、やっぱり売り物だ。また今度な' },
    { say: 'roki', t: 'ハナのばあさんに会ったら、「草に水をやりすぎるな」って言っとけ。……いや、言わなくていい' },
  ])]);
};
SCENES.talk_pan = S => [{ meet: 'mil' }, { meet: 'coco' }].concat(pick([
  [{ say: 'mil', f: 'a', t: 'いらっしゃい！ 今日のおすすめは、くるみパン！' }, { say: 'coco', t: '……今日はくるみ、入れ忘れたのよ' }],
  [{ say: 'coco', f: 'a', t: 'いらっしゃい。朝のうちに来ると、焼きたてがあるわよ' }],
  [{ say: 'mil', t: 'ねえココ、明日は何を焼こうか' }, { say: 'coco', t: 'さっき決めたじゃない' }, { say: 'mil', f: 'a', t: 'そうだっけ！' }],
  [{ say: 'mil', t: 'この町のうわさなら、だいたいうちに集まってくるんだ。パンの匂いにつられてね' }],
]));

/* ---------- 店の中のこと ---------- */
SCENES.rest = S => {
  const opts = [];
  if (S.time < 3) opts.push({ t: `${TIMES[S.time + 1].k}までのんびりする`, do: [
    { fade: true, then: S => { S.time += 1; } },
    { say: 'shiki', f: 'a', t: pick(['いい顔になったね。少し休むのも仕事のうちだよ', 'お茶が冷めないうちに、と思ったら、もう冷めていたよ', '窓の外、だいぶ日が傾いてきたね']) },
  ] });
  if (has('pan')) opts.push({ t: '焼きたてパンを食べる', go: 'eat_pan' });
  if (has('amapan')) opts.push({ t: 'ココ特製の甘いパンを食べる', go: 'eat_amapan' });
  if (has('hanataba') && !S.f.bouquetShown) opts.push({ t: '花束をカウンターに飾る', do: [
    { take: 'hanataba' }, { set: { bouquetShown: true } },
    { n: 'カウンターの端に花を活けると、店の中がぱっと明るくなった。' },
    { say: 'shiki', f: 'a', t: 'うん、いい。店が少し華やかになった' },
  ] });
  opts.push({ t: 'やめておく', do: [] });
  return [{ n: 'テーブルの椅子に腰かけた。窓から庭の木が見える。' }, { choice: opts }];
};
SCENES.eat_pan = [
  { take: 'pan' },
  { n: 'パンをちぎると、ふわっと湯気が立った。' },
  { say: 'shiki', f: 'a', t: 'いい匂いだね。……半分もらってもいいかい' },
  { say: 'hero', f: 'a', t: 'どうぞ' },
  { say: 'shiki', t: 'ミルのパンは、お茶に合うように焼いてあるんだ。本人は気づいていないけれどね' },
];
SCENES.eat_amapan = [
  { take: 'amapan' },
  { n: 'はちみつの甘い香り。ひと口かじると、体の力がふっと抜けた。' },
  { say: 'shiki', f: 'a', t: '甘いものを食べている人の顔は、だいたいいい顔だ' },
];
SCENES.sleep = S => {
  const go = [{ sleep: true }, { go: 'morning' }];
  if (S.time < 3) return [
    { say: 'shiki', t: `まだ${TIMES[S.time].k}だけど、今日はもう休むかい？` },
    { choice: [{ t: 'うん、今日はおしまい', do: go }, { t: 'もう少しだけ', do: [{ say: 'shiki', f: 'a', t: 'そうか。無理はしないようにね' }] }] },
  ];
  return [{ say: 'shiki', f: 'a', t: 'おつかれさま。明日のことは、明日考えればいい' }].concat(go);
};
SCENES.morning = S => {
  const l = [];
  const fresh = QUESTS.some(q => questState(q) === 'open');
  l.push(pick([
    { say: 'shiki', f: 'a', t: 'おはよう。よく眠れたかい' },
    { say: 'shiki', t: 'おはよう。お茶を淹れたところだよ' },
    { say: 'shiki', f: 'b', t: 'おはよう。今日は風が気持ちいいね' },
  ]));
  if (S.f.chibiVisits && S.day % 2 === 0) l.push({ se: 'meow' }, { n: '窓辺で、チビが丸くなっている。いつのまに来たんだろう。' });
  if (S.active) l.push({ say: 'shiki', t: '昨日の依頼の続きだね。焦らなくていいよ' });
  else if (fresh) l.push({ say: 'shiki', t: '依頼箱に紙が入っているよ。気が向いたら見てごらん' });
  return l;
};
SCENES.after_quest = S => [
  { say: 'shiki', f: 'a', t: 'おつかれさま。今日はここまでにするかい？' },
  { choice: [
    { t: '今日はおしまいにする', do: [{ sleep: true }, { go: 'morning' }] },
    { t: 'もう少し続ける', do: [{ say: 'shiki', t: 'そうか。依頼箱は、いつでもそこにあるよ' }] },
  ] },
];
