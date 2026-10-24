/* 魔法の町のなんでも屋 ― 中盤シナリオ（依頼6〜10）
 * 元資料：「中盤シナリオ」「中盤分岐」
 * 同じ人から続けて頼まれる・依頼同士が軽くつながる・関係が少し深まる
 */
'use strict';

/* ---------- 中盤で増える住人・持ち物 ---------- */
CH.kid = { name: '小さな子', color: '#a58a64' };
CH.jumin = { name: '家の人', color: '#8c8c7a' };
Object.assign(ITEMS, {
  tokubetsupan: { name: 'お礼の特別なパン', icon: '🥯', desc: 'ココが精霊のお礼に焼いてくれた、特別なパン。' },
  fue: { name: 'スズの古い笛', icon: '🎶', desc: 'スズが大事にしている古い笛。やさしい音がする。' },
  kanifue: { name: 'お礼の簡易な笛', icon: '🎵', desc: 'スズが作ってくれた小さな笛。吹くと、ぴい、とかわいい音がする。' },
  sekiban: { name: '古い石板', icon: '🪨', desc: '花壇の下に埋まっていた石板。「ここに約束を残す」と読める。' },
  tane: { name: '特別に育てた種', icon: '🌱', desc: 'ハナが特別に育てた花の種。何の花が咲くかは、咲いてのお楽しみ。' },
  ita: { name: '丈夫な木の板', icon: '🪵', desc: '森の入口で見つけた、しっかりした木の板。' },
  kugi: { name: '古い釘', icon: '🔩', desc: 'ほしやの特別な引き出しに入っていた、古いけれど丈夫な釘。' },
  hokyonuno: { name: '補強用の布', icon: '🧶', desc: 'ハナにもらった、厚手で丈夫な布。' },
  kogu: { name: 'ロキの小さな道具', icon: '🔧', desc: 'ロキがくれた手になじむ道具。作業台での修理が少し楽になる。' },
});
SCENES.eat_tokubetsupan = [
  { take: 'tokubetsupan' },
  { n: '特別なパンは、ほんのり星の形をしていた。' },
  { say: 'shiki', f: 'a', t: 'ココさんは、こういう遊び心を隠すのがうまいんだ' },
];

const MID = ['q6', 'q7', 'q8', 'q9', 'q10'];
function emptyBoxMsg(S) {
  if (S.f.v2end) return 'いまは新しい依頼の紙は入っていない。<br>（終盤の依頼11〜15は、次の更新で追加予定です）';
  if (S.f.v1end && !S.f.midStart) return 'いまは依頼の紙が入っていない。<br>今日はのんびり過ごして、明日を待とう。';
  return 'いまは依頼の紙が入っていない。';
}
// 中盤の報告のあと：全部終わっていれば中盤のしめくくりへ
SCENES.after_mid = S => [{ go: MID.every(done) ? 'v2_end' : 'after_quest' }];

/* ---------- 中盤のはじまり（序盤を終えた次の朝） ---------- */
HOOKS.push({
  morningPre(S) {
    if (S.f.v1end && !S.f.midStart) return [
      { fade: 'それから、数日が過ぎた', then: S => { S.day += 3; } },
      { set: { midStart: true } },
      { n: '町の人に道を聞かれたり、ちょっとした荷物を運んだり。小さな手伝いをしながら、数日が過ぎた。' },
    ];
  },
});

/* ---------- 精霊の住まい（依頼6のあと） ---------- */
const HOME_LOC = { hana: 'hana', shop: 'backroom', view: 'view' };
HOOKS.push({
  npcs(loc, S, list) {
    // 依頼6の途中は、精霊がついてくる
    if (stage('q6') === 2 && !['basement'].includes(loc)) return list.concat([{ id: 'seirei', at: 'r', label: '精霊', talk: 'q6_follow' }]);
    if (done('q6') && HOME_LOC[S.f.spiritHome] === loc) return list.concat([{ id: 'seirei', at: loc === 'hana' ? 'c' : 'r', label: '精霊', talk: 'talk_seirei' }]);
  },
});
SCENES.talk_seirei = S => [{ meet: 'seirei' }, { se: 'magic' }, pick([
  { say: 'seirei', t: '……ここ、すき' },
  { say: 'seirei', t: 'パン、ある？' },
  { n: '精霊は、くるりと一回転して、少しだけ明るくなった。' },
  S.f.spiritHome === 'view' ? { say: 'seirei', t: 'よる、ホタルが、くる' } : { say: 'seirei', t: '……{name}、きた' },
])];

/* ============ 依頼6：精霊の居場所 ============ */
QUESTS.push({
  id: 'q6', no: 6, title: '精霊の居場所', client: 'coco',
  summary: '地下室の精霊に、ちゃんとした居場所を作ってあげたい',
  paper: 'あの子（地下室の精霊）のことで、また相談させてください。\n――パン屋　ココ',
  unlock: S => !!S.f.midStart, start: 'q6_start',
  hint: S => ({
    1: 'まずは地下室で、あの子にどんな場所がいいか聞いてごらん',
    2: '静かで、少し温かい場所……花屋の物置、うちの奥の部屋、見晴らし台の古い木。どこも悪くないよ',
    3: 'ココさんに知らせておいで。きっとほっとするよ',
  }[stage('q6')] || 'ゆっくりでいいよ'),
});
HOOKS.push({
  spots(loc, S, list) {
    const st = stage('q6');
    if (loc === 'pan' && st === 1) return spotFor(list, { id: 'q6door', x: 70, y: 55, label: '地下室への扉', scene: 'q6_door' });
    if (st === 2) {
      if (loc === 'hana') return spotFor(list, { id: 'q6shed', x: 80, y: 40, label: '庭の物置', scene: 'q6_cand_hana' });
      if (loc === 'backroom') return spotFor(list, { id: 'q6bench', x: 26, y: 62, label: '作業台の下', scene: 'q6_cand_shop' });
      if (loc === 'view') return spotFor(list, { id: 'q6tree', x: 24, y: 52, label: '古い木のうろ', scene: 'q6_cand_view' });
    }
  },
  enter(loc, S) {
    if (loc === 'basement' && stage('q6') === 1) return 'q6_talk';
    if (loc === 'pan' && stage('q6') === 3) return 'q6_coco';
    if (loc === 'shop' && stage('q6') === 4) return 'q6_report';
  },
});
SCENES.q6_start = [
  { se: 'door' },
  { n: 'パン屋のココが、焼きたての匂いと一緒に店に入ってきた。' },
  { show: 'shiki', at: 'l' }, { show: 'coco', at: 'r' },
  { say: 'coco', f: 'a', t: 'こんにちは。この前は、ありがとう' },
  { say: 'coco', t: 'あの子……地下室の精霊ね。その後も、ときどき顔を出すの' },
  { say: 'coco', t: '嫌っているわけじゃないんだけど、もう少しちゃんとした居場所を作ってあげられないかしら。地下室は、夜になると冷えるから' },
  { say: 'shiki', f: 'b', t: '精霊にも、好みの場所というのがあるからね。本人に聞いてみるのがいちばんだ' },
  { say: 'coco', f: 'a', t: 'お願いできるかしら' },
  { hide: 'coco' },
  { accept: 'q6' }, { memo: ['q6', 'ココさんから、精霊の居場所を探してほしいと頼まれた'] },
  { obj: 'パン屋の地下室で、精霊と話そう', at: 'pan' },
];
SCENES.q6_door = [
  { n: '地下室への扉。下から、ぽうっとやわらかい光がもれている。' },
  { loc: 'basement' },
];
SCENES.q6_talk = S => [
  { show: 'seirei', at: 'c' }, { se: 'magic' },
  { n: '樽の陰から、光の玉がふわりと浮かびあがった。' },
  S.f.spiritFriendly || S.f.gaveBread ? { say: 'seirei', t: '……{name}！' } : { say: 'seirei', t: '……だれ？　あ、このまえの' },
  { say: 'hero', f: 'a', t: 'ねえ、どんな場所に住みたい？' },
  { say: 'seirei', t: '……しずかで、すこし、あったかいところがいい' },
  S.f.gaveBread ? { say: 'seirei', t: 'それと……いいにおいが、すこしするところ' } : null,
  { say: 'hero', f: 'c', t: '（静かで、少し温かい場所……）' },
  { say: 'hero', t: '（花屋さんの庭の物置、ほしやの奥の部屋、見晴らし台の古い木。どこがいいかな）' },
  { say: 'hero', f: 'a', t: '一緒に見に行こう' },
  { say: 'seirei', t: 'うん' },
  { stage: ['q6', 2] },
  { memo: ['q6', '精霊の希望：「しずかで、すこし、あったかいところ」'] },
  { obj: '精霊と一緒に、居場所の候補を見て回ろう（花屋の物置・ほしやの奥の部屋・見晴らし台の木）', at: 'hana' },
  { toast: '精霊がついてきます。候補の場所で ✦ を調べよう' },
];
SCENES.q6_follow = S => [pick([
  { say: 'seirei', t: '……つぎ、どこ？' },
  { say: 'seirei', t: 'ふわふわ' },
  { n: '精霊は、肩のあたりをふわふわと漂っている。' },
])];
// 候補ごとの様子（パンを分けた子は、気持ちがはっきり伝わる）
function q6Cand(where, desc, like, decide) {
  return S => [
    { n: desc },
    { show: 'seirei', at: 'c' },
    { n: S.f.gaveBread ? like.clear : like.soft },
    { set: { ['q6seen_' + where]: true } },
    { choice: [
      { t: 'ここに決める', go: decide },
      { t: 'ほかの場所も見てみる', do: [{ say: 'seirei', t: 'うん、ほかも、みる' }] },
    ] },
  ];
}
SCENES.q6_cand_hana = q6Cand('hana', '花屋の庭のすみにある、小さな木の物置。花と土の匂いがする。',
  { clear: '精霊はすぐに物置の中へ飛びこんで、ぽっと小さな光を灯して見せた。「ここ、すき！」と言っているみたいだ。', soft: '精霊は物置のまわりを、ゆっくり一周した。' }, 'q6_home_hana');
SCENES.q6_cand_shop = q6Cand('shop', 'ほしやの奥の部屋。作業台の下は静かで、ランプの熱がほんのり届く。',
  { clear: '精霊は作業台の下にもぐりこんで、うれしそうに明滅した。お茶の香りが気に入ったらしい。', soft: '精霊は作業台の下をのぞきこんで、しばらくじっとしていた。' }, 'q6_home_shop');
SCENES.q6_cand_view = q6Cand('view', '見晴らし台の近くの古い木。幹に、ちょうどいい大きさのうろがある。',
  { clear: '精霊はうろの中で、風に合わせてゆらゆら揺れている。「かぜ、きもちいい」と笑ったように見えた。', soft: '精霊は、うろの入口で風に吹かれている。' }, 'q6_home_view');
const q6After = [
  { aff: { seirei: 1 } },
  { stage: ['q6', 3] },
  { obj: 'パン屋のココに報告しよう', at: 'pan' },
];
SCENES.q6_home_hana = [
  { say: 'hero', f: 'a', t: 'ここにしようか' },
  { say: 'seirei', t: 'ここ、すむ' },
  { show: 'hana', at: 'l' },
  { say: 'hana', f: 'b', t: 'あら、なあに？ ……まあ、精霊さん' },
  { say: 'hana', f: 'a', t: 'いい子ね。邪魔にならないなら、いいわよ。チビとも仲良くしてちょうだいね' },
  { set: { spiritHome: 'hana' } }, { aff: { hana: 1 } },
  { memo: ['q6', '精霊は、花屋の庭の物置に住むことになった'] },
  { note: ['seirei', 'ハナの庭の物置に住んでいる'] },
].concat(q6After);
SCENES.q6_home_shop = [
  { say: 'hero', f: 'a', t: 'ここにしようか' },
  { say: 'seirei', t: 'ここ、すむ' },
  { show: 'shiki', at: 'l' },
  { say: 'shiki', t: '……おや、新しい店員かな' },
  { say: 'shiki', f: 'a', t: 'まあ、静かだし、いいんじゃないか。夜の作業台が少し明るくなる' },
  { set: { spiritHome: 'shop' } }, { aff: { shiki: 1 } },
  { memo: ['q6', '精霊は、ほしやの奥の部屋に住むことになった'] },
  { note: ['seirei', 'ほしやの作業台の下に住んでいる'] },
].concat(q6After);
SCENES.q6_home_view = S => [
  { say: 'hero', f: 'a', t: 'ここにしようか' },
  { say: 'seirei', t: 'かぜ、きもちいい。ここ、すむ' },
  S.time === 3 ? { n: '……遠くで、誰かがくすりと笑った気がした。' } : { n: '丘の上を、やわらかい風が通りすぎていく。' },
  { set: { spiritHome: 'view' } },
  { memo: ['q6', '精霊は、見晴らし台の古い木のうろに住むことになった'] },
  { note: ['seirei', '見晴らし台の古い木のうろに住んでいる'] },
].concat(q6After);
SCENES.q6_coco = S => [
  S.time === 3 ? { n: 'パン屋では、ココが店の片づけをしていた。' } : null,
  { show: 'coco', at: 'c' },
  { say: 'hero', f: 'a', t: 'ココさん、あの子の居場所、見つかりました' },
  { say: 'coco', f: 'a', t: 'よかったわ……！ ありがとう' },
  { say: 'coco', t: 'これ、お礼。あの子のぶんも、と思って、ちょっと特別に焼いてみたの' },
  { get: 'tokubetsupan' },
  { aff: { pan: 1 } },
  { hide: 'coco' },
  { stage: ['q6', 4] },
  { obj: 'ほしやに戻って報告しよう', at: 'shop' },
];
SCENES.q6_report = S => [
  { say: 'shiki', t: 'おかえり。精霊の引っ越しは、うまくいったかい' },
  { say: 'hero', f: 'a', t: 'はい。気に入ってくれたみたいです' },
  S.f.spiritHome === 'shop' ? { say: 'shiki', f: 'a', t: '奥の部屋が、にぎやかになったね' } : { say: 'shiki', f: 'a', t: 'そうか。これからは、町のどこかで光っているのを見かけるだろうね' },
  { stage: ['q6', DONE] }, { obj: '' }, { time: '+1' },
  { say: 'shiki', t: '依頼箱に、また何枚か紙が入っていたよ。この町も、君に頼みごとをするのに慣れてきたらしい' },
  { go: 'after_mid' },
];

/* ============ 依頼7：消えた笛 ============ */
QUESTS.push({
  id: 'q7', no: 7, title: '消えた笛', client: 'suzu',
  summary: '大事にしていた古い笛が、なくなってしまった',
  paper: 'ほしやさんへ　古い笛がなくなりました。たぶん、どこかにはあると思います。\n――楽器屋　スズ',
  unlock: S => done('q6'), start: 'q7_start',
  when: S => S.time < 3 ? { ok: true } : { ok: false, note: '楽器屋はもう閉まっている。明日にしよう' },
  hint: S => {
    const st = stage('q7');
    if (st === 1) return '楽器屋は東の外れ。静かな通りにあるよ';
    if (st === 2) return 'まずは、スズくんの店の中を見せてもらうといい';
    if (st === 3) return S.time === 3 ? 'みんなもう家に帰っているね。聞きこみは明日にしよう' : '笛の音を聞いた人がいないか、町の人に聞いてごらん。ツバキくんやハナさんは、よく外にいるよ';
    if (st === 4) return 'ハナさんの庭の奥、だったね';
    if (st === 5) return 'スズくんに知らせておいで';
    return 'ゆっくりでいいよ';
  },
});
HOOKS.push({
  npcs(loc, S, list) {
    // スズは、会ってからは昼のあいだ楽器屋にいる
    if (loc === 'gakki' && S.time < 3 && (S.f.met_suzu || stage('q7') >= 1)) list = list.concat([{ id: 'suzu' }]);
    if (stage('q7') === 3) {
      if (loc === 'post' && !S.f.q7heardT) list = talkFor(list, 'tsubaki', 'q7_ask_tsubaki');
      if (loc === 'hana' && !S.f.q7heardH) list = talkFor(list, 'hana', 'q7_ask_hana');
    }
    return list;
  },
  spots(loc, S, list) {
    if (loc === 'gakki' && stage('q7') === 2) return spotFor(list, { id: 'q7box', x: 30, y: 50, label: '空っぽの笛の箱', scene: 'q7_box' });
    if (loc === 'hana' && stage('q7') === 4) return spotFor(list, { id: 'q7back', x: 84, y: 58, label: '庭の奥', scene: 'q7_kid' });
  },
  enter(loc, S) {
    if (loc === 'gakki' && stage('q7') === 1) return 'q7_meet';
    if (loc === 'gakki' && stage('q7') === 5) return 'q7_suzu';
    if (loc === 'shop' && stage('q7') === 6) return 'q7_report';
  },
  morning(S) {
    if (S.f.kidFriend && done('q7') && !S.f.kidVisited && S.day > (S.f.q7day || 0)) return [
      { se: 'door' },
      { n: 'カラン、とドアが鳴った。笛を借りていた、あの小さな子だ。両手に花を握っている。' },
      { say: 'kid', t: 'あのね、笛、ちゃんと返したよ。……ありがとう' },
      { get: 'hanataba' },
      { n: '小さな子は、ぺこりと頭を下げて、走って帰っていった。' },
      { say: 'shiki', f: 'a', t: 'いいお客さんだったね' },
      { set: { kidVisited: true } },
      { memo: ['q7', '翌日、笛を借りていた子が花を持ってお礼に来た'] },
    ];
  },
});
SCENES.q7_start = [
  { show: 'shiki', at: 'c' },
  { say: 'shiki', t: '楽器屋のスズくんからだね。そういえば、まだ会ったことはなかったかな' },
  { say: 'shiki', f: 'b', t: '東の外れの、静かな通りにある店だ。少し……話があちこちに飛ぶ子だけど、悪い子じゃない' },
  { accept: 'q7' }, { memo: ['q7', 'スズさんから、なくなった古い笛を探してほしいと頼まれた'] },
  { obj: '楽器屋のスズに話を聞こう', at: 'gakki' },
];
SCENES.q7_meet = [
  { show: 'suzu', at: 'c' },
  { se: 'flute' },
  { n: '店に入ると、髪を適当に結んだ青年が、ギターのような楽器をぽろんと鳴らしていた。' },
  { say: 'suzu', f: 'a', t: 'あ、いらっしゃい。……あれ、お客さん？ それとも、音につられて？' },
  { say: 'hero', t: 'ほしやから来ました。笛の依頼で' },
  { say: 'suzu', t: 'ああ、そうだった！ 楽器屋のスズです' },
  { meet: 'suzu' },
  { say: 'suzu', t: '大事にしていた古い笛がなくなったんです。店の中を探したんですけど……' },
  { say: 'suzu', f: 'a', t: 'そういえば、今朝の雲、笛みたいな形でしたよね。見ました？' },
  { say: 'hero', f: 'c', t: '（話が飛んだ……）' },
  { say: 'suzu', t: '……あ、笛の話でしたね。いつもの箱に入れておいたはずなんです' },
  { stage: ['q7', 2] },
  { obj: '楽器屋の中を調べてみよう', at: 'gakki' },
];
SCENES.q7_box = [
  { n: '棚の上の細長い箱。中は空っぽで、布だけが残っている。' },
  { n: 'ほかの棚や作業机も見てみたけれど、笛はどこにもなかった。' },
  { show: 'suzu', at: 'c' },
  { say: 'suzu', t: 'ね、ないでしょう？ 昨日は窓を開けて、ちょっと吹いてから箱に戻した……はずなんですけど' },
  { say: 'hero', f: 'c', t: '（窓を開けて吹いていた……誰か、音を聞いた人がいるかも）' },
  { stage: ['q7', 3] },
  { memo: ['q7', '店の中には見当たらなかった。町の人に聞きこみをすることに'] },
  { obj: '笛の音を聞いた人がいないか、町の人に聞いてみよう', at: 'post' },
];
SCENES.q7_ask_tsubaki = [
  { say: 'hero', t: 'ツバキさん、昨日、笛の音って聞きませんでした？' },
  { say: 'tsubaki', t: '笛……あ、聞きました。昨日の配達中、東の方で、笛のような音が' },
  { say: 'tsubaki', f: 'b', t: '午後三時十二分ごろです。ちょうど花屋さんの前を通っていたので' },
  { say: 'hero', f: 'c', t: '（細かい……）' },
  { set: { q7heardT: true } },
  S => { if (!S.f.q7heardH) { S.obj = '花屋のハナにも聞いてみよう'; S.objAt = 'hana'; renderTop(); } },
];
SCENES.q7_ask_hana = [
  { say: 'hero', t: 'ハナさん、昨日、笛の音って聞きませんでした？' },
  { say: 'hana', t: '笛？ そういえば……うちの庭で、誰かが短い音を鳴らしていた気がするわ' },
  { say: 'hana', f: 'b', t: '庭の奥のほうだったかしら。ネコの鳴き声かと思ったんだけど' },
  { set: { q7heardH: true } },
  { stage: ['q7', 4] },
  { obj: '花屋の庭の奥を探してみよう', at: 'hana' },
];
SCENES.q7_kid = [
  { n: '庭の奥の、低い木の陰。小さな子がしゃがみこんで、古い笛を大事そうに抱えていた。' },
  { say: 'kid', t: 'あっ……' },
  { say: 'hero', f: 'a', t: 'その笛、楽器屋さんのかな？' },
  { say: 'kid', t: '……うん。ごめんなさい。窓から聞こえた音が優しくて、つい借りちゃったの' },
  { say: 'kid', t: 'おばあちゃんの家、坂の上でね。ここで吹いたら、聞こえるかなって' },
  { say: 'hero', f: 'c', t: '（どうしよう）' },
  { choice: [
    { t: 'すぐに返してもらう', do: [
      { say: 'hero', t: '笛はスズさんの大事なものだから、返しに行こう' },
      { say: 'kid', t: '……うん。ごめんなさい' },
      { n: '小さな子は素直に笛を差し出して、小さく頭を下げた。' },
      { get: 'fue' },
      { set: { q7choice: 'return' } }, { memo: ['q7', '子供に、すぐ笛を返してもらった'] },
    ] },
    { t: 'もう少しだけ貸してあげる', do: [
      { say: 'hero', f: 'a', t: 'もう少しだけ、吹いてていいよ。スズさんには、わたしから話しておくね' },
      { say: 'kid', t: '……ほんとう？' },
      { n: '小さな子は、目を輝かせて聞き返した。' },
      { set: { q7choice: 'lend', kidFriend: true } }, { memo: ['q7', '子供に、もう少しだけ笛を貸してあげることにした'] },
    ] },
    { t: 'スズに事情を話して、判断を任せる', do: [
      { say: 'hero', t: '一緒に、スズさんのところへ行こうか。ちゃんと話せば、きっと大丈夫' },
      { say: 'kid', t: '……うん' },
      { set: { q7choice: 'ask' } }, { memo: ['q7', '子供と一緒にスズさんのところへ行き、判断を任せることにした'] },
    ] },
  ] },
  { stage: ['q7', 5] },
  { obj: '楽器屋のスズに知らせよう', at: 'gakki' },
];
SCENES.q7_suzu = S => {
  const c = S.f.q7choice;
  const head = [{ show: 'suzu', at: 'c' }];
  let body;
  if (c === 'return') body = [
    { say: 'hero', t: 'スズさん、笛、見つかりました' },
    { take: 'fue' },
    { n: '事情を話すと、スズは笛を受け取って、少し笑った。' },
    { say: 'suzu', t: 'いいんです。大事にしてくれたみたいですし' },
    { say: 'suzu', t: '……きちんとしてるんですね、ほしやさんは' },
    { set: { suzuFormal: true } },
  ];
  else if (c === 'lend') body = [
    { say: 'hero', t: 'スズさん、笛、見つかりました。でも……' },
    { n: '事情を話すと、スズは「へえ」と目を丸くした。' },
    { say: 'suzu', f: 'a', t: 'それなら、明日の夕方までに返してね、って伝えてもらえますか' },
    { say: 'suzu', t: '音が優しい、って言ってもらえたなら、笛も本望ですよ' },
    { aff: { suzu: 1 } },
  ];
  else body = [
    { n: '小さな子は、スズの前で、ぎゅっと笛を握りしめている。' },
    { say: 'kid', t: '……かってに借りて、ごめんなさい' },
    { n: 'スズは子供の顔を見て、少し困ったように笑った。' },
    { say: 'suzu', f: 'a', t: 'じゃあ、今日だけね。明日、ちゃんと返しに来てくれる？' },
    { say: 'kid', t: 'うん！' },
    { say: 'suzu', t: '……ほしやさんに任せてよかった' },
    { aff: { suzu: 1 } }, { set: { suzuTrust: true } },
  ];
  return head.concat(body, [
    { say: 'suzu', t: 'そうだ、お礼に……これ、試しに作った笛なんです' },
    { get: 'kanifue' },
    { se: 'flute' },
    { n: 'スズは、ふと思い出したように、もう一本の笛で短い曲を吹いた。' },
    { say: 'suzu', f: 'a', t: 'また何かあったら教えてください。音のことなら、だいたいわかるので' },
    { hide: 'suzu' },
    { note: ['suzu', '笛の件で知り合った。話はよく飛ぶけれど、音のことには詳しい'] },
    { stage: ['q7', 6] },
    { obj: 'ほしやに戻って報告しよう', at: 'shop' },
  ]);
};
SCENES.q7_report = S => [
  { say: 'shiki', t: 'おかえり。スズくんの笛は見つかったかい' },
  { say: 'hero', f: 'a', t: '小さな子が、音が優しくて借りていたみたいです' },
  { say: 'shiki', f: 'a', t: 'そうか。いい音は、人を連れていってしまうものだからね' },
  { stage: ['q7', DONE] }, { obj: '' }, { time: '+1' },
  S => { S.f.q7day = S.day; },
  { go: 'after_mid' },
];
SCENES.talk_suzu = S => [{ meet: 'suzu' }].concat(pick([
  [{ se: 'flute' }, { n: 'スズは、こちらに気づかないまま、楽しそうに笛を吹いている。' }, { say: 'suzu', f: 'a', t: '……あ、いらっしゃい。いつからいました？' }],
  [{ say: 'suzu', t: S.f.suzuFormal ? 'こんにちは。本日も、よろしくお願いします' : 'こんにちは。今日の風、いい音がしますね' }],
  [{ say: 'suzu', t: 'ツバキさんって、足音がいつも同じ速さなんですよ。メトロノームみたいで' }],
  [{ say: 'suzu', f: 'a', t: '新しい楽器を作ってるんです。完成したら……誰に聞いてもらおうかな' }],
]));

/* ============ 依頼8：雨が避けている花壇 ============ */
QUESTS.push({
  id: 'q8', no: 8, title: '雨が避けている花壇', client: 'hana',
  summary: '特定の花壇だけ、雨が降っても乾いたまま',
  paper: 'ひとつの花壇だけ、雨が降っても土が乾いたままなの。おかしいでしょう？\n――花屋　ハナ',
  unlock: S => done('q6'), start: 'q8_start',
  when: S => S.time < 3 ? { ok: true } : { ok: false, note: 'ハナさんはもう休んでいる時間。明日にしよう' },
  hint: S => {
    const st = stage('q8');
    if (st === 1) return 'ハナさんの庭の、乾いた花壇を調べてごらん';
    if (st === 2) return S.time === 3 ? '夜になったね。花壇へ行ってごらん。……誰かが待っているかもしれない' : '夜になると、こういうことに詳しい人が歩いているんだ。ひと休みして、夜を待つといい';
    if (st === 3) return '石板のことだね。……話を聞かせてごらん';
    if (st === 4) return '花壇に、石板を置きに行っておいで';
    return 'ゆっくりでいいよ';
  },
});
HOOKS.push({
  spots(loc, S, list) {
    if (loc === 'hana' && stage('q8') === 1) return spotFor(list, { id: 'flower', x: 50, y: 34, label: '乾いた花壇', scene: 'q8_dig' });
  },
  enter(loc, S) {
    if (loc === 'hana' && stage('q8') === 2 && S.time === 3) return 'q8_hotaru';
    if (loc === 'shop' && stage('q8') === 3) return 'q8_shiki';
    if (loc === 'hana' && stage('q8') === 4) return 'q8_place';
    if (loc === 'shop' && stage('q8') === 5) return 'q8_report';
  },
  npcs(loc, S, list) {
    // 依頼8のあと、ホタルは夜の見晴らし台にいる
    if (loc === 'view' && S.time === 3 && done('q8')) return list.concat([{ id: 'hotaru', at: 'l' }]);
  },
  morning(S) {
    if (done('q8') && !S.f.q8seed && S.day > (S.f.q8day || 0)) return [
      { se: 'door' },
      { show: 'shiki', at: 'l' }, { show: 'hana', at: 'r' },
      { say: 'hana', f: 'a', t: 'おはよう！ ねえ聞いて、ゆうべ、あの花壇にちゃんと雨が降ったのよ' },
      { say: 'hana', t: '土がしっとりして、花がみんな、背伸びしてるみたいだったわ' },
      { say: 'hana', f: 'b', t: 'これ、お礼。特別に育てた種よ。何が咲くかは、咲いてのお楽しみ' },
      { get: 'tane' },
      { set: { q8seed: true } }, { aff: { hana: 1 } },
      { hide: 'hana' },
    ];
  },
});
SCENES.q8_start = [
  { se: 'door' },
  { show: 'shiki', at: 'l' }, { show: 'hana', at: 'r' },
  { say: 'hana', t: 'シキさん、{name}ちゃん、ちょっと聞いてちょうだい' },
  { say: 'hana', f: 'b', t: '特定の花壇だけ、雨が降っても土が乾いたままなの。おかしいでしょう？' },
  { say: 'hana', t: 'ほかの花壇はびしょびしょなのに、そこだけ、雨が避けて通るみたいに' },
  { say: 'shiki', f: 'b', t: '……ほう' },
  { say: 'hero', f: 'c', t: '（シキさん、何か知ってそう……）' },
  { say: 'shiki', t: '見に行っておいで、{name}。何か見つかるかもしれない' },
  { hide: 'hana' },
  { accept: 'q8' }, { memo: ['q8', 'ハナさんから、雨が避ける花壇のことを頼まれた'] },
  { obj: '花屋の庭の花壇を調べよう', at: 'hana' },
];
SCENES.q8_dig = S => [
  { n: 'ひとつの花壇だけ、土がからからに乾いている。指で触ると、さらさらとこぼれた。' },
  { n: '掘ってみると――こつん、と何か固いものに当たった。' },
  { n: '小さな、古い石板だ。表面に、薄い文字が刻まれている。' },
  { say: 'hero', f: 'c', t: '「ここに……約束を残す」？' },
  { get: 'sekiban' },
  S.time < 3 ? { show: 'hana', at: 'c' } : null,
  S.time < 3 ? { say: 'hana', f: 'b', t: 'まあ……こんなものが埋まっていたなんて。何十年もこの庭にいるのに、知らなかったわ' } : null,
  S.time < 3 ? { say: 'hana', t: 'そういえば、夜になると、こういうことに詳しい人が町を歩いているって聞いたことがあるわ' } : null,
  { stage: ['q8', 2] },
  { memo: ['q8', '乾いた花壇の下から、「ここに約束を残す」と刻まれた石板が出てきた'] },
  { obj: '夜にもう一度、花壇へ行ってみよう', at: 'hana' },
  S.time < 3 ? { toast: '「☕ ひと休み」で夜まで時間を進められます' } : null,
];
SCENES.q8_hotaru = [
  { n: '夜の花屋の庭。乾いた花壇のそばに、薄い光をまとった誰かが立っていた。' },
  { show: 'hotaru', at: 'c' }, { se: 'night' },
  { say: 'hotaru', t: '……こんばんは。その石、見つけたのね' },
  { say: 'hero', f: 'b', t: 'あなたは……？' },
  { say: 'hotaru', f: 'a', t: 'ホタル。夜にだけ、町を歩いているの' },
  { meet: 'hotaru' },
  { say: 'hotaru', t: 'ここは、昔、誰かが小さな約束をした場所' },
  { say: 'hotaru', t: '「この花壇を、ずっと守る」って。……約束が律儀すぎて、雨まで遠ざけていたみたい' },
  { say: 'hero', f: 'c', t: '（この石板、どうしよう）' },
  { choice: [
    { t: '石板を元に戻す', do: [
      { n: '掘った土を丁寧に戻して、石板をそっと埋めなおした。' },
      { say: 'hotaru', t: '……それでいいと思う' },
      { take: 'sekiban' },
      { set: { q8choice: 'back' } }, { memo: ['q8', '石板は、元どおり土の中に戻した'] },
      { go: 'q8_rain' },
    ] },
    { t: '石板をきれいにして、花壇の端に残す', do: [
      { n: '袖で汚れを落とすと、文字がはっきり読めるようになった。花壇の端に、そっと立てかける。' },
      { say: 'hotaru', f: 'a', t: '残すのも、ひとつの選択ね' },
      { take: 'sekiban' },
      { aff: { hotaru: 1 } }, { set: { q8choice: 'keep', hotaruLonger: true } }, { memo: ['q8', '石板はきれいにして、花壇の端に残した'] },
      { go: 'q8_rain' },
    ] },
    { t: 'シキに相談してから決める', do: [
      { say: 'hero', t: 'シキさんに相談してから決めてもいいですか？' },
      { say: 'hotaru', t: 'ええ。……あの人なら、きっと知っている' },
      { n: 'ホタルは小さく笑って、夜の中へ溶けるように消えていった。' },
      { hide: 'hotaru' },
      { set: { q8choice: 'ask' } },
      { stage: ['q8', 3] },
      { obj: 'シキに石板のことを相談しよう', at: 'shop' },
    ] },
  ] },
];
SCENES.q8_rain = [
  { hide: 'hotaru' },
  { se: 'rain' },
  { n: 'ぽつ、ぽつ……。乾いていた花壇に、細い雨が落ちはじめた。' },
  { n: '気がつくと、ホタルの姿はもうなかった。' },
  { note: ['hotaru', '雨の避ける花壇の、古い約束のことを教えてくれた'] },
  { stage: ['q8', 5] },
  { obj: 'ほしやに戻ろう', at: 'shop' },
];
SCENES.q8_shiki = [
  { say: 'hero', t: 'シキさん、花壇の下から、こんな石板が' },
  { n: '石板の文字と、ホタルの話をそのまま伝えた。' },
  { say: 'shiki', f: 'b', t: '……そうか。あの花壇に、まだ残っていたんだね' },
  { say: 'shiki', t: '無理に動かす必要はない。ただ、綺麗にしておくのは悪くない' },
  { say: 'shiki', f: 'a', t: '約束っていうのは、覚えている人がいるうちは、ちゃんと生きているものだから' },
  { say: 'hero', f: 'a', t: 'じゃあ、きれいにして、花壇の端に置いてきます' },
  { aff: { shiki: 1 } }, S => { S.f.shikiConsult = (S.f.shikiConsult || 0) + 1; },
  { memo: ['q8', 'シキさんに相談した。「綺麗にしておくのは悪くない」'] },
  { stage: ['q8', 4] },
  { obj: '花壇に石板を置きに行こう', at: 'hana' },
];
SCENES.q8_place = [
  { n: '石板の汚れを落として、花壇の端にそっと立てかけた。' },
  { take: 'sekiban' },
  { set: { hotaruLonger: true } },
  { memo: ['q8', '石板はきれいにして、花壇の端に残した'] },
  { go: 'q8_rain' },
];
SCENES.q8_report = [
  { say: 'shiki', t: 'おかえり。……雨の匂いがするね' },
  { say: 'hero', f: 'a', t: 'あの花壇に、雨が降りはじめました' },
  { say: 'shiki', f: 'a', t: 'そうか。明日の朝、ハナさんが飛んでくるだろうね' },
  { stage: ['q8', DONE] }, { obj: '' }, { time: '+1' },
  S => { S.f.q8day = S.day; },
  { go: 'after_mid' },
];
SCENES.talk_hotaru = S => {
  const l = [{ meet: 'hotaru' }];
  if (S.f.spiritHome === 'view' && !S.f.saidSpiritView) l.push({ set: { saidSpiritView: true } }, { say: 'hotaru', t: 'あの子、あそこにいるのね' });
  l.push(pick([
    { say: 'hotaru', t: '夜の町は、昼よりすこしだけ、本当のことを話すの' },
    { say: 'hotaru', f: 'a', t: 'こんばんは。……今日も、いい一日だった？' },
    { say: 'hotaru', t: '星が多い夜は、古い記憶がよく見える' },
  ]));
  if (S.f.hotaruLonger) l.push(pick([
    { say: 'hotaru', t: 'あの石板、花壇の端で、ちゃんと雨にあたっている。……よかった' },
    { say: 'hotaru', t: '昔ね、この見晴らし台で、誰かがお茶を飲みながら町を見ていたの。毎晩、毎晩' },
  ]));
  l.push({ n: '……話しているうちに、ずいぶん時間が経った気がした。' });
  return l;
};

/* ============ 依頼9：届きそうで届かない荷物 ============ */
QUESTS.push({
  id: 'q9', no: 9, title: '届きそうで届かない荷物', client: 'tsubaki',
  summary: '届け先の家の前まで行くのに、なぜかノックできない',
  paper: '今度は荷物です。届け先の前まで行けるのに、なぜかノックができません。\n――郵便局　ツバキ',
  unlock: S => done('q6'), start: 'q9_start',
  when: S => S.time < 3 ? { ok: true } : { ok: false, note: '夜は配達がお休み。明日にしよう' },
  hint: S => ({
    1: '坂道の住宅街は南西だよ。ツバキくんが待っている',
    2: 'その家のまわりを、よく見てごらん。何か貼ってあるかもしれない',
    3: '札の模様を写してきたのかい？ 見せてごらん',
    4: '坂道の家に戻って、札をどうするか決めておいで',
    5: 'ほしやに戻っておいで。ツバキくんの話を聞かせてほしい',
  }[stage('q9')] || 'ゆっくりでいいよ'),
});
HOOKS.push({
  npcs(loc, S, list) {
    if (loc === 'saka' && [2, 4].includes(stage('q9'))) return list.concat([{ id: 'tsubaki', talk: 'q9_wait', label: 'ツバキ' }]);
  },
  spots(loc, S, list) {
    if (loc === 'saka' && stage('q9') === 2) return spotFor(spotFor(list,
      { id: 'q9box', x: 22, y: 56, label: '郵便受け', scene: 'q9_mailbox', key: false }),
      { id: 'q9charm', x: 62, y: 28, label: '玄関の上', scene: 'q9_charm' });
  },
  enter(loc, S) {
    if (loc === 'saka' && stage('q9') === 1) return 'q9_door';
    if (loc === 'shop' && stage('q9') === 3) return 'q9_shiki';
    if (loc === 'saka' && stage('q9') === 4) return 'q9_decide';
    if (loc === 'shop' && stage('q9') === 5) return 'q9_report';
  },
});
SCENES.q9_start = [
  { se: 'door' },
  { show: 'shiki', at: 'l' }, { show: 'tsubaki', at: 'r' },
  { say: 'tsubaki', t: 'こんにちは。……今度は、荷物です' },
  { say: 'tsubaki', f: 'b', t: '届け先の家の前まで行くのに、なぜかドアをノックできないんです。手を上げると、急に「今じゃなくてもいいかな」って気持ちになって……' },
  { say: 'tsubaki', t: 'もう三日も持ち帰っています。こんなこと、配達を始めてから一度もなかったのに' },
  { say: 'tsubaki', t: '一緒に来てもらえませんか。坂道の住宅街です' },
  { hide: 'tsubaki' },
  { accept: 'q9' }, { memo: ['q9', 'ツバキさんから、なぜかノックできない家への配達を手伝ってほしいと頼まれた'] },
  { obj: '坂道の住宅街で、ツバキと合流しよう', at: 'saka' },
];
SCENES.q9_door = [
  { show: 'tsubaki', at: 'l' },
  { say: 'tsubaki', f: 'a', t: 'ほしやさん！ こっちです。この家です' },
  { n: '坂の途中の、ごく普通の家。ツバキと並んで、玄関の前に立つ。' },
  { n: 'ノックしようと手を上げた、そのとき――' },
  { say: 'hero', f: 'd', t: '（……なんだか、今じゃなくてもいいような気がしてきた）' },
  { say: 'tsubaki', f: 'b', t: 'ですよね！？ そうなるんです！' },
  { say: 'hero', f: 'c', t: '（魔法……かな。家のまわりを調べてみよう）' },
  { stage: ['q9', 2] },
  { obj: '家のまわりを調べてみよう', at: 'saka' },
];
SCENES.q9_wait = [{ say: 'tsubaki', t: '僕はここで待っています。……荷物は、ちゃんと抱えていますので' }];
SCENES.q9_mailbox = [{ n: '郵便受けには、ちゃんと名札がついている。宛先は合っているみたいだ。' }];
SCENES.q9_charm = [
  { n: '玄関の上を見上げると、ドアの上に、小さな古い札が貼ってある。' },
  { n: '色あせた紙に、くるくると渦を巻いた模様。……近づくと、なんだか気持ちがぼんやりする。' },
  { say: 'hero', f: 'c', t: '（これのせいかも。どうしよう）' },
  { choice: [
    { t: '自分で確かめてみる', do: [
      { n: '指先で、札にそっと触れてみる。……ひんやりと、古い魔法の手ざわりがした。' },
      { say: 'hero', t: '（たぶん、ただの古い魔除け。効き目が強すぎて、お客さんまで遠ざけちゃってるんだ）' },
      { stage: ['q9', 4] },
      { go: 'q9_decide' },
    ] },
    { t: '模様を写して、シキに見てもらう', do: [
      { n: '札の模様を、手帳にていねいに写しとった。' },
      { say: 'tsubaki', t: 'わかりました。僕は荷物を持って、ここで待っています' },
      { stage: ['q9', 3] },
      { obj: 'シキに札の模様を見せよう', at: 'shop' },
    ] },
  ] },
];
SCENES.q9_shiki = [
  { say: 'hero', t: 'シキさん、この模様の札が、家のドアの上に貼ってあって' },
  { say: 'shiki', f: 'b', t: 'どれどれ。……ああ、懐かしい形だ' },
  { say: 'shiki', t: 'ただの古い魔除けだね。悪いものじゃない。効き目が強すぎて、配達まで遠ざけているだけだ' },
  { say: 'shiki', f: 'a', t: '外すも、弱めるも、そのままにするも、君が決めていい。……住んでいる人のことも、少し考えてね' },
  { aff: { shiki: 1 } },
  { memo: ['q9', 'シキさんに札を見てもらった。「ただの古い魔除けで、効き目が強すぎるだけ」'] },
  { stage: ['q9', 4] },
  { obj: '坂道の家に戻って、札をどうするか決めよう', at: 'saka' },
];
SCENES.q9_decide = [
  { show: 'tsubaki', at: 'l' },
  { say: 'tsubaki', t: 'どうしましょう、その札' },
  { choice: [
    { t: '札を外す', do: [
      { n: '札の端をそっとはがして、丁寧に外した。ふっと、空気が軽くなる。' },
      { say: 'tsubaki', f: 'a', t: 'これで普通に配達できます。助かりました' },
      { se: 'knock' },
      { say: 'jumin', t: 'はいはい、おや、郵便かい。……ここのところ、誰も訪ねてこないから、静かすぎると思っていたんだよ' },
      { aff: { tsubaki: 1 } }, { set: { q9choice: 'remove', tsubakiPriority: true } },
      { memo: ['q9', '古い札を外した。家の人は「静かすぎると思っていた」と笑っていた'] },
    ] },
    { t: '札の効き目を弱める（魔法で調整）', do: [
      { se: 'magic' },
      { n: '札に手をかざして、渦の模様を少しだけゆるめる。ぼんやりした感じが、すっと薄くなった。' },
      { say: 'tsubaki', f: 'a', t: '残しつつ、邪魔にならないようにするんですね。気が利きます' },
      { se: 'knock' },
      { say: 'jumin', t: 'おや、郵便かい。……その札、そのままにしてくれたのかい。ばあさんが貼ったものでね。ありがとう' },
      { aff: { tsubaki: 1 } }, { set: { q9choice: 'weaken', tsubakiFlexible: true } },
      { memo: ['q9', '札は残したまま、効き目だけ弱めた'] },
    ] },
    { t: 'そのまま残す', do: [
      { say: 'hero', t: '無理に外さなくても、いいかなって' },
      { say: 'tsubaki', f: 'b', t: 'そう、ですか……' },
      { say: 'tsubaki', t: '……わかりました。別の方法を考えます。裏口に回るとか、お隣に預けるとか' },
      { n: 'しばらくして、ツバキが「お隣さんが、ちょうど届けてくれるそうです」と戻ってきた。' },
      { set: { q9choice: 'keep', tsubakiSelf: true } },
      { memo: ['q9', '札はそのまま残した。ツバキさんがお隣経由で荷物を届けた'] },
    ] },
  ] },
  { say: 'tsubaki', t: 'これ、お礼です。また記念切手なんですが……' },
  { stamps: 2 },
  { say: 'tsubaki', f: 'a', t: '次も何かあったら、頼むかもしれません' },
  { hide: 'tsubaki' },
  { note: ['tsubaki', '配達の困りごとを、ほしやに相談してくれるようになった'] },
  { stage: ['q9', 5] },
  { obj: 'ほしやに戻って報告しよう', at: 'shop' },
];
SCENES.q9_report = S => [
  { say: 'shiki', t: 'おかえり。荷物は届いたかい' },
  { say: 'hero', f: 'a', t: 'はい、ちゃんと' },
  S.f.q9choice === 'weaken' ? { say: 'shiki', f: 'a', t: '弱めたのか。……いい落としどころだ' } : { say: 'shiki', f: 'a', t: 'そうか。ツバキくんも、ほっとしただろうね' },
  { stage: ['q9', DONE] }, { obj: '' }, { time: '+1' },
  { go: 'after_mid' },
];

/* ============ 依頼10：店の棚が崩れた ============ */
QUESTS.push({
  id: 'q10', no: 10, title: '店の棚が崩れた', client: 'roki',
  summary: '棚が崩れた。直すのは自分でやるが、材料が足りない',
  paper: '棚が崩れた。材料を集めてくれ。\n――雑貨屋　ロキ',
  unlock: S => done('q6'), start: 'q10_start',
  hint: S => {
    if (stage('q10') === 1) {
      if (!has('ita')) return '丈夫な木の板なら、東の端の森の入口に落ちているよ';
      if (!has('kugi')) return '古い釘か。……奥の部屋の、特別な引き出しを開けてごらん。今の君なら、開くかもしれない';
      if (!has('hokyonuno')) return S.time === 3 ? 'ハナさんはもう休んでいるね。布は明日にしよう' : '補強用の布は、ハナさんだね';
      return '材料はそろったね。ロキの店へどうぞ';
    }
    return 'ゆっくりでいいよ';
  },
});
const q10All = () => has('ita') && has('kugi') && has('hokyonuno');
const checkQ10 = S => {
  if (q10All()) { S.obj = 'ロキの店に材料を届けよう'; S.objAt = 'zakka'; }
  else if (!has('ita')) { S.obj = '丈夫な木の板を探そう（小さな森の入口）'; S.objAt = 'forest'; }
  else if (!has('kugi')) { S.obj = '古い釘を探そう（ほしやの奥の部屋の引き出し）'; S.objAt = 'backroom'; }
  else { S.obj = '補強用の布をもらおう（花屋のハナ）'; S.objAt = 'hana'; }
  renderTop();
};
HOOKS.push({
  npcs(loc, S, list) {
    if (loc === 'hana' && stage('q10') === 1 && !has('hokyonuno')) return talkFor(list, 'hana', 'q10_cloth');
  },
  spots(loc, S, list) {
    if (loc === 'forest' && stage('q10') === 1 && !has('ita')) return spotFor(list, { id: 'q10wood', x: 40, y: 58, label: '丈夫そうな木の板', scene: 'q10_wood' });
  },
  enter(loc, S) {
    if (loc === 'zakka' && stage('q10') === 1 && q10All()) return 'q10_fix';
    if (loc === 'shop' && stage('q10') === 2) return 'q10_report';
  },
});
SCENES.q10_start = S => [
  { se: 'door' },
  { show: 'shiki', at: 'l' }, { show: 'roki', at: 'r' },
  { say: 'roki', t: 'おう。……棚が急に崩れてな' },
  S.f.noticedShelf ? { say: 'roki', f: 'b', t: 'お前が前に傾いてるって言った棚とは、別のやつだ。あっちは無事だ。……先に全部見てもらえばよかったな' } : null,
  { say: 'roki', t: '直すのは自分でやる。だが、材料が足りない' },
  { say: 'roki', t: '丈夫な木の板と、古い釘と、補強用の布だ。板は森の入口あたり、布はハナのばあさんが持ってる' },
  { say: 'roki', f: 'b', t: '釘は……古いやつがいい。新しい釘は、あの棚には合わねえ' },
  { say: 'shiki', f: 'b', t: '古い釘なら、心当たりがあるよ。うちの奥の部屋の、特別な引き出しにね' },
  { say: 'hero', f: 'b', t: 'え、あの開かない引き出しですか？' },
  { say: 'shiki', f: 'a', t: '今の君なら、開くかもしれない' },
  { hide: 'roki' },
  { accept: 'q10' }, { memo: ['q10', 'ロキさんから、崩れた棚を直す材料集めを頼まれた'] },
  checkQ10,
];
SCENES.q10_wood = S => [
  { n: '森の入口の倒木のそばに、しっかりした板が何枚か立てかけてある。誰かが置いていったものらしい。' },
  { get: 'ita' },
  S.f.toolbox ? { n: 'ロキにもらった道具箱に、もう一枚すっぽり収まった。' } : null,
  S.f.toolbox ? { get: 'ita' } : null,
  checkQ10,
];
SCENES.drawer = S => {
  if (stage('q10') === 1 && !S.f.drawerOpen) return [
    { card: 'card_drawer', t: '特別な引き出し' },
    { n: '星の飾りの引き出しに、そっと手をかける。' },
    { se: 'magic' },
    { n: '――今日は、すっと開いた。' },
    { show: 'shiki', at: 'c' },
    { say: 'shiki', f: 'a', t: 'おや。開いたかい' },
    { say: 'shiki', t: 'その引き出しはね、店に馴染んだ人にしか開かないんだ。……君がこの店の人になってきた、ってことだろうね' },
    { n: '引き出しの中には、古いけれど丈夫そうな釘が、紙に包まれて入っていた。' },
    { get: 'kugi' },
    { set: { drawerOpen: true } },
    { note: ['shiki', '「特別な引き出しは、店に馴染んだ人にしか開かない」'] },
    checkQ10,
  ];
  if (S.f.drawerOpen) return [{ n: '特別な引き出しの中には、古い道具が少し。……いちばん奥の段だけは、まだ開かない。' }];
  return [{ n: '星の飾りがついた、特別な引き出し。' }, { n: '……開かない。シキさんいわく「そのうちね」とのこと。' }];
};
SCENES.q10_cloth = [
  { say: 'hero', t: 'ハナさん、補強用の布ってありますか？ ロキさんの棚が崩れて' },
  { say: 'hana', f: 'b', t: 'まあ、ロキったら、また棚を壊したの？' },
  { say: 'hana', t: 'あの人、昔から物を詰めこみすぎるのよ。言っても聞かないんだから' },
  { say: 'hana', f: 'a', t: 'はい、いちばん丈夫なのを持っていって。「ハナからだ」って言っちゃだめよ。素直に受け取らないから' },
  { get: 'hokyonuno' },
  checkQ10,
];
SCENES.q10_fix = S => [
  { show: 'roki', at: 'c' },
  { say: 'roki', t: 'そろったか。……悪くない材料だ' },
  { take: 'kugi' }, { take: 'hokyonuno' },
  S => { S.f.q10extra = (S.items.ita || 0) >= 2; delete S.items.ita; },
  { n: 'ロキと並んで、崩れた棚を組み直していく。板を当て、釘を打ち、布で角を補強する。' },
  { say: 'roki', t: '……昔は、もっと物が少なかった' },
  { n: 'ロキは手を止めずに、ぼそりとつぶやいた。' },
  { choice: [
    { t: '手を止めて、話に聞き入る', do: [
      { n: '黙って、ロキの話に耳をかたむけた。' },
      { say: 'roki', t: '店を始めたころは、棚ひとつで足りたんだ。釘も、道具も、ぜんぶ見渡せた' },
      { say: 'roki', f: 'b', t: '……まあ、今の方がいいか。散らかってるが、町のやつらが何でも持ちこんでくるからな' },
      { aff: { roki: 1 } }, { set: { q10choice: 'listen', rokiEasy: true } },
      { memo: ['q10', '作業しながら、ロキさんの昔話に聞き入った'] },
    ] },
    { t: '手を動かし続け、作業を優先する', do: [
      { n: '相づちを打ちながら、手は止めずに釘を打ち続けた。' },
      { say: 'roki', f: 'a', t: '要領いいな' },
      { set: { q10choice: 'work' } },
      { memo: ['q10', '作業を優先して、手早く棚を直した'] },
    ] },
    { t: '「この棚、前も壊れかけでした？」と聞く', do: [
      { say: 'hero', f: 'c', t: 'この棚、前も壊れかけでした？' },
      S.f.noticedShelf ? { say: 'roki', f: 'b', t: '……よく覚えてたな。前に一度、傾いてた。お前に言われた、あの棚の隣だ' } : { say: 'roki', f: 'b', t: '……よく気づいたな。前に一度、傾いてた' },
      { say: 'roki', t: '直したつもりで、無理に物を載せてた。……棚にも、限界ってもんがある' },
      { aff: { roki: 1 } }, { set: { q10choice: 'notice', rokiRely: true } },
      { memo: ['q10', '棚の前の傷みに気づいて、ロキさんと話した'] },
    ] },
  ] },
  { n: '最後の釘を打ち終えると、棚はどっしりと元の場所に立った。' },
  S.f.q10extra ? { say: 'roki', t: '板が一枚余ったな。……今度、お前の店の棚もこれで直してやる' } : null,
  S.f.q10extra ? { aff: { roki: 1 } } : null,
  { say: 'roki', t: '礼だ。これ、使っていいぞ' },
  { get: 'kogu' }, { set: { goodTool: true } },
  { say: 'roki', t: '手になじむやつだ。作業台の仕事が少し楽になる' },
  { hide: 'roki' },
  { note: ['roki', '崩れた棚を一緒に直した。お礼に、手になじむ小さな道具をくれた'] },
  { stage: ['q10', 2] },
  { obj: 'ほしやに戻って報告しよう', at: 'shop' },
];
SCENES.q10_report = S => [
  { say: 'shiki', t: 'おかえり。ロキの棚は、元どおりになったかい' },
  { say: 'hero', f: 'a', t: 'はい。お礼に、道具をもらいました' },
  { say: 'shiki', f: 'a', t: 'ロキの道具か。……あの人が道具を手放すのは、本当に珍しいことなんだ' },
  { stage: ['q10', DONE] }, { obj: '' }, { time: '+1' },
  { go: 'after_mid' },
];

/* ---------- 中盤の関係を、ふだんの会話に少しだけ ---------- */
{
  const baseRoki = SCENES.talk_roki, baseHana = SCENES.talk_hana, baseTsubaki = SCENES.talk_tsubaki;
  SCENES.talk_roki = S => {
    if (S.f.rokiEasy && !S.f.saidRokiEasy) return [{ set: { saidRokiEasy: true } }, { say: 'roki', t: '……お前には、なんか話しやすいな。余計なことまで喋っちまう' }];
    if (S.f.rokiRely && !S.f.saidRokiRely) return [{ set: { saidRokiRely: true } }, { say: 'roki', f: 'b', t: 'お前、細かいところに気づくな。今度、店の道具の具合も見てくれ' }];
    return baseRoki(S);
  };
  SCENES.talk_hana = S => {
    if (S.f.spiritHome === 'hana' && !S.f.saidSpiritHana) return [{ meet: 'hana' }, { set: { saidSpiritHana: true } }, { say: 'hana', f: 'a', t: 'あの精霊さん、毎晩物置でぴかぴかしてるのよ。チビったら、夜じゅう見張ってるわ' }];
    return baseHana(S);
  };
  SCENES.talk_tsubaki = S => {
    if (S.f.tsubakiFlexible && !S.f.saidTsubakiFlex) return [{ meet: 'tsubaki' }, { set: { saidTsubakiFlex: true } }, { say: 'tsubaki', t: 'ほしやさん、ちょっと相談が……あ、いえ、また今度にします。でも、相談してもいいですか？' }];
    if (S.f.tsubakiPriority && !S.f.saidTsubakiPrio) return [{ meet: 'tsubaki' }, { set: { saidTsubakiPrio: true } }, { say: 'tsubaki', f: 'a', t: '次に困った配達があったら、いちばんにほしやさんに声をかけますね' }];
    return baseTsubaki(S);
  };
}

/* ---------- 中盤のしめくくり ---------- */
SCENES.v2_end = [
  { say: 'shiki', t: 'そういえば、今日、パン屋の前でね' },
  { say: 'shiki', f: 'a', t: '「ほしやの人に頼めば大丈夫」って、町の人が話しているのを聞いたよ' },
  { say: 'hero', f: 'b', t: 'ほしやの人……' },
  { say: 'shiki', t: 'ただの手伝いじゃなくて、ちゃんと顔を覚えられた、ってことだ' },
  { say: 'shiki', f: 'b', t: '……最近、店の空気が少し変わったね。悪い意味じゃないよ' },
  { set: { v2end: true } },
  { fade: '― 中盤　おしまい ―' },
  { go: 'after_quest' },
];
