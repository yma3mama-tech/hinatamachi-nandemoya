/* 魔法の町のなんでも屋 ― 終盤シナリオ（依頼11〜14・祭り当日）
 * 元資料：「終盤シナリオ」「終盤分岐」
 * 大きな事件は起こさず、関係が深まった結果として起きる静かな依頼
 */
'use strict';

/* ---------- 終盤で増える持ち物・場所 ---------- */
Object.assign(ITEMS, {
  hanatsuru: { name: '花と蔓', icon: '🌸', desc: 'ハナが祭りの飾り用に用意してくれた、とびきりの花と蔓。' },
  himo: { name: '丈夫な紐と木枠', icon: '🪢', desc: 'ロキが作った、飾りの骨組み。去年のより丈夫らしい。' },
  suzubell: { name: '小さな鈴', icon: '🔔', desc: 'スズがひとつずつ音を合わせた鈴。風が吹くと鳴る。' },
  haichizu: { name: '飾りの配置図', icon: '🗺️', desc: 'ツバキが広場を測って描いた配置図。誤差は二センチ以内。' },
  kanban: { name: '古い看板', icon: '🪧', desc: '「ほしや」の看板。だいぶ色あせている。' },
  toryo: { name: '塗料', icon: '🎨', desc: 'ロキが出してくれた、いちばんいい色の塗料。' },
  fude: { name: '筆', icon: '🖌️', desc: 'ハナが昔、花の名札を書くのに使っていた筆。' },
  furin: { name: '新しい風鈴', icon: '🎐', desc: 'ハナに頼まれた風鈴。庭のいちばん古い木に付ける。' },
  furutegami: { name: '昔の手紙', icon: '💌', desc: 'ツバキが届けられなかった昔の手紙。宛先の家族は坂道に住んでいる。' },
  seireipan: { name: '精霊へのパン', icon: '🥐', desc: 'ミルとココが祭りのために試作した、精霊のための小さなパン。' },
  kogakki: { name: 'スズの小さな楽器', icon: '🪕', desc: 'スズが作ったばかりの楽器。誰かに聞かせてほしいと頼まれた。' },
  furudougu: { name: '壊れた古い道具', icon: '⚙️', desc: 'ロキが「一度でいいから直してみてくれ」と預けた道具。' },
  naoshitadougu: { name: '直した古い道具', icon: '🛠️', desc: '作業台で直した、ロキの古い道具。' },
});
LOCS.forest_deep = {
  name: '森の奥', focal: [1010, 300], parent: 'forest',
  npcs: () => [],
  actions: S => [{ t: '⬅ 森の入口へ戻る', fn: () => moveTo('forest') }],
};

const LATE = ['q11', 'q12', 'q13', 'q14'];
const WISHES = ['w_hana', 'w_tsubaki', 'w_pan', 'w_suzu', 'w_roki'];
const wishesDone = S => WISHES.filter(k => S.f[k]).length;
// 依頼箱が空のときの案内（中盤の定義を上書き）
emptyBoxMsg = function (S) {
  if (S.f.festivalDone) return 'いまは依頼の紙が入っていない。';
  if (S.f.v2end && !S.f.lateStart) return 'いまは依頼の紙が入っていない。<br>今日は「🌙 おやすみ」して、明日を待とう。';
  if (S.f.v1end && !S.f.midStart) return 'いまは依頼の紙が入っていない。<br>今日は「🌙 おやすみ」して、明日を待とう。';
  return 'いまは依頼の紙が入っていない。';
};

/* ---------- 終盤のはじまり（中盤を終えた次の朝） ---------- */
HOOKS.push({
  morningPre(S) {
    if (S.f.v2end && !S.f.lateStart) return [{ go: 'q11_start' }];
  },
  // 前の版のまま朝を迎えていたセーブは、店に入ったときに始める
  enter(loc, S) {
    if (loc === 'shop' && S.f.v2end && !S.f.lateStart && S.time < 3 && !S.active) return 'q11_start';
  },
});

/* ============ 依頼11：祭りの飾りの準備 ============ */
const Q11_NEED = [['hanatsuru', 'hana', 'ハナ'], ['himo', 'zakka', 'ロキ'], ['suzubell', 'gakki', 'スズ'], ['haichizu', 'post', 'ツバキ']];
const checkQ11 = S => {
  const miss = Q11_NEED.filter(([id]) => !has(id));
  if (!miss.length) { S.obj = '中央広場で飾りを組み立てよう'; S.objAt = 'plaza'; }
  else { S.obj = '飾りの材料と協力を集めよう（あと：' + miss.map(m => m[2]).join('・') + '）'; S.objAt = miss[0][1]; }
  renderTop();
};
QUESTS.push({
  id: 'q11', no: 11, title: '祭りの飾りの準備', client: 'shiki',
  summary: '町の小さな祭りの飾りを、みんなと一緒に作る',
  unlock: S => !!S.f.lateStart, start: 'q11_start',
  hint: S => {
    const st = stage('q11');
    if (st === 1) return 'まずは奥の部屋の作業台で、去年の飾りを見てごらん';
    if (st === 2) {
      const miss = Q11_NEED.filter(([id]) => !has(id));
      if (!miss.length) return '材料はそろったね。広場へどうぞ。みんな待っているよ';
      return S.time === 3 ? 'みんなもう休んでいる時間だ。続きは明日にしよう' : 'ハナさん、ロキ、スズくん、ツバキくん。まだの人に声をかけてごらん';
    }
    return 'ゆっくりでいいよ';
  },
});
HOOKS.push({
  npcs(loc, S, list) {
    if (stage('q11') !== 2) return;
    if (loc === 'hana' && !has('hanatsuru')) return talkFor(list, 'hana', 'q11_hana');
    if (loc === 'zakka' && !has('himo')) return talkFor(list, 'roki', 'q11_roki');
    if (loc === 'gakki' && !has('suzubell')) return talkFor(list, 'suzu', 'q11_suzu');
    if (loc === 'post' && !has('haichizu')) return talkFor(list, 'tsubaki', 'q11_tsubaki');
  },
  bench(S) { if (stage('q11') === 1) return 'q11_check'; },
  enter(loc, S) {
    if (loc === 'plaza' && stage('q11') === 2 && Q11_NEED.every(([id]) => has(id))) return 'q11_build';
    if (loc === 'shop' && stage('q11') === 3) return 'q11_report';
  },
});
SCENES.q11_start = [
  { set: { lateStart: true } },
  { show: 'shiki', at: 'c' },
  { say: 'shiki', t: 'そういえば、今年も小さな祭りがあるんだ' },
  { say: 'hero', f: 'b', t: 'お祭り？' },
  { say: 'shiki', f: 'a', t: '町のみんなで広場に飾りをつけて、ご飯を食べるだけの、小さな祭りだよ' },
  { se: 'door' },
  { n: 'ちょうどそのとき、ドアの鈴が鳴った。' },
  { show: 'shiki', at: 'l' }, { show: 'hana', at: 'r' },
  { say: 'hana', t: 'シキさん、今年の飾りの話なんだけど……' },
  { say: 'mil', f: 'a', t: '例年より、ちょっと手が足りなくてさ！' },
  { n: 'ハナの後ろから、パン屋のミルも顔を出した。' },
  { say: 'hana', f: 'a', t: '{name}ちゃん、祭りの飾りを一緒に作ってくれないかしら' },
  { say: 'hero', f: 'a', t: 'はい、ぜひ！' },
  { hide: 'hana' },
  { accept: 'q11' }, { memo: ['q11', 'ハナさんとミルさんから、祭りの飾りづくりを頼まれた'] },
  { say: 'shiki', t: 'まずは奥の仕事部屋で、飾りの材料を確かめておいで。去年の骨組みが残っているはずだ' },
  { obj: '奥の部屋で、飾りの材料を確かめよう', at: 'backroom' },
];
SCENES.q11_check = [
  { card: 'card_magic', t: '作業台' },
  { n: '作業台の下から、去年の飾りの骨組みが出てきた。花も鈴も、すっかり色あせている。' },
  { show: 'shiki', at: 'c' },
  { say: 'shiki', t: '飾りは毎年、町のみんなで少しずつ持ち寄るんだ' },
  { say: 'shiki', t: 'ハナさんは花と蔓、ロキは紐と木枠、スズくんは鈴。ツバキくんは、飾りの配置図を作ってくれる' },
  { say: 'shiki', f: 'a', t: 'みんなに声をかけて回るのも、祭りの楽しみのうちだよ' },
  { stage: ['q11', 2] },
  checkQ11,
];
SCENES.q11_hana = [
  { say: 'hana', f: 'a', t: '花と蔓ね。とびきりのを用意してあるわ' },
  { say: 'hana', t: '蔓はね、去年より長めにしたの。ロキの木枠、いつも大きすぎるんだもの' },
  { get: 'hanatsuru' }, checkQ11,
];
SCENES.q11_roki = [
  { say: 'roki', t: '紐と木枠だ。……去年のも俺が作った' },
  { say: 'roki', f: 'a', t: '今年のほうが丈夫だぞ。ばあさんの蔓が多少長くても、びくともしねえ' },
  { get: 'himo' }, checkQ11,
];
SCENES.q11_suzu = [
  { say: 'suzu', f: 'a', t: '鈴ですね！ 風が吹くと鳴るように、ひとつずつ音を合わせておきました' },
  { se: 'bell' },
  { say: 'suzu', t: '全部鳴ると、ちょっとした曲になるんですよ。……たぶん' },
  { get: 'suzubell' }, checkQ11,
];
SCENES.q11_tsubaki = [
  { say: 'tsubaki', t: '配置図です。広場の寸法を測っておきました。誤差は二センチ以内です' },
  { say: 'tsubaki', f: 'a', t: '組み立ての日は、僕も広場へ行きます' },
  { get: 'haichizu' }, checkQ11,
];
SCENES.q11_build = [
  { n: '中央広場に、町の人たちが少しずつ集まってきた。' },
  { show: 'hana', at: 'l' }, { show: 'roki', at: 'r' },
  { say: 'tsubaki', f: 'a', t: '配置図どおりにいきましょう！ 噴水から北へ三歩、そこが一つ目です！' },
  { n: 'ロキが木枠を立て、ハナが花と蔓を編みこみ、スズが鈴をひとつずつ吊るしていく。' },
  { se: 'bell' },
  { say: 'hana', f: 'a', t: 'ほら、{name}ちゃんも。そこの蔓、持っててちょうだい' },
  { n: '気がつけば、自分も輪の中にいた。' },
  { say: 'hero', f: 'c', t: '（最後に、全体の雰囲気を決めることになった）' },
  { take: 'hanatsuru' }, { take: 'himo' }, { take: 'suzubell' }, { take: 'haichizu' },
  { choice: [
    { t: '控えめにまとめる', do: [
      { n: 'シンプルで落ち着いた飾りになった。' },
      { say: 'hana', f: 'a', t: '上品でいいわね。この町らしい' },
      { say: 'mil', f: 'a', t: '派手じゃなくても、ちゃんとお祭りだよ' },
      { set: { decoStyle: 'calm' } }, { memo: ['q11', '飾りは控えめにまとめた'] },
    ] },
    { t: '少し華やかにする', do: [
      { n: '花と鈴を多めに使った、明るい飾りになった。' },
      { say: 'suzu', f: 'a', t: '音がしそうでいいですね' },
      { say: 'coco', f: 'a', t: '子供たちが喜びそう' },
      { set: { decoStyle: 'bright' } }, { memo: ['q11', '飾りは少し華やかにした'] },
    ] },
    { t: 'みんなの意見を聞いてから決める', do: [
      { n: 'その場にいる人たちに、順番に意見を聞いて回った。' },
      { show: 'shiki', at: 'c' },
      { say: 'shiki', f: 'a', t: '……君らしいやり方だね' },
      { n: '控えめと華やかの、ちょうど間くらいの飾りになった。' },
      { aff: { shiki: 1 } }, S => { S.f.shikiConsult = (S.f.shikiConsult || 0) + 1; },
      { set: { decoStyle: 'mixed' } }, { memo: ['q11', 'みんなの意見を聞いて、飾りを決めた'] },
    ] },
  ] },
  { n: '広場に、新しい飾りが揺れている。祭りまでは、あと少しだ。' },
  { stage: ['q11', 3] },
  { obj: 'ほしやに戻って報告しよう', at: 'shop' },
];
SCENES.q11_report = [
  { say: 'shiki', f: 'a', t: 'おかえり。広場、ここからでも見えたよ。いい飾りになったね' },
  { say: 'shiki', t: '祭りまでは、まだ少し日がある。……依頼箱を見てごらん' },
  { stage: ['q11', DONE] }, { obj: '' }, { time: '+1' },
  { go: 'after_quest' },
];

/* ============ 依頼12：ホタルの頼みごと ============ */
QUESTS.push({
  id: 'q12', no: 12, title: 'ホタルの頼みごと', client: 'hotaru', tag: '夜',
  summary: '夜の見晴らし台で、待っている人がいる',
  paper: '夜、見晴らし台で待っています。\n――ホタル',
  unlock: S => done('q11'), start: 'q12_card',
  hint: S => ({
    1: S.time === 3 ? '夜になったね。見晴らし台へ行っておいで' : 'あの人は夜にしか現れない。ひと休みして、夜を待つといい',
    2: '森の奥の灯籠だね。森の入口から、奥への小道が続いているよ',
    3: '灯籠のことだね。……話を聞かせてごらん',
    4: '夜になったら、森の奥の灯籠へ戻っておいで',
    5: 'おかえり、を言わせておくれ',
  }[stage('q12')] || 'ゆっくりでいいよ'),
});
HOOKS.push({
  spots(loc, S, list) {
    if (loc === 'forest' && S.time === 3 && [2, 4].includes(stage('q12'))) return spotFor(list, { id: 'q12path', x: 70, y: 46, label: '森の奥への小道', scene: 'q12_path' });
  },
  enter(loc, S) {
    if (loc === 'view' && stage('q12') === 1 && S.time === 3) return 'q12_meet';
    if (loc === 'forest_deep' && stage('q12') === 2) return 'q12_lantern';
    if (loc === 'shop' && stage('q12') === 3) return 'q12_shiki';
    if (loc === 'forest_deep' && stage('q12') === 4) return 'q12_lantern2';
    if (loc === 'shop' && stage('q12') === 5) return 'q12_report';
  },
  npcs(loc, S, list) {
    // ホタルとの距離が縮まると、夜の広場にも来るようになる
    if (loc === 'plaza' && S.time === 3 && S.f.hotaruNear) return list.concat([{ id: 'hotaru', at: 'r' }]);
  },
});
SCENES.q12_card = S => [
  { show: 'shiki', at: 'c' },
  { say: 'shiki', f: 'b', t: '見晴らし台の、あの人からだね。……夜にしか会えない人だ' },
  { accept: 'q12' }, { memo: ['q12', 'ホタルさんから「夜、見晴らし台で待っています」と手紙が来た'] },
  { obj: '夜になったら、見晴らし台へ行こう', at: 'view' },
  S.time < 3 ? { toast: '「☕ ひと休み」で夜まで時間を進められます' } : null,
];
SCENES.q12_path = [{ n: '木々の間に、細い小道が続いている。足元を、光の粒がふわりと照らした。' }, { loc: 'forest_deep' }];
SCENES.q12_meet = [
  { show: 'hotaru', at: 'c' }, { se: 'night' },
  { say: 'hotaru', f: 'a', t: '……来てくれたのね' },
  { say: 'hotaru', t: '一つだけ、頼みたいことがある' },
  { say: 'hotaru', t: '昔この町に残した小さな光を、もう一度確かめてほしいの。森の奥にあるわ' },
  { say: 'hero', f: 'a', t: 'わかりました。一緒に行きましょう' },
  { stage: ['q12', 2] },
  { obj: 'ホタルと一緒に、森の奥へ', at: 'forest' },
  { loc: 'forest_deep' },
];
const q12Choice = withAsk => ({ choice: [
  { t: '光を優しく整える', do: [
    { se: 'magic' },
    { n: '両手で灯籠を包むようにして、揺れる光にそっと魔法を通す。光は少しずつ落ち着いて、柔らかく灯った。' },
    { say: 'hotaru', f: 'a', t: '……ありがとう。これで十分' },
    { aff: { hotaru: 1 } }, { set: { hotaruNear: true, q12choice: 'tend' } },
    { memo: ['q12', '石灯籠の光を、優しく整えた'] },
    { go: 'q12_end' },
  ] },
  { t: 'そのままにしておく', do: [
    { n: '手を下ろした。光は弱いままだけれど、消えることはなさそうだ。' },
    { say: 'hotaru', t: '無理に変えなくても、いいのね' },
    { set: { q12choice: 'leave' } },
    { memo: ['q12', '石灯籠の光は、そのままにしておいた'] },
    { go: 'q12_end' },
  ] },
  withAsk ? { t: 'シキに相談してから決める', do: [
    { say: 'hero', t: 'シキさんに、相談してきてもいいですか？' },
    { say: 'hotaru', f: 'a', t: 'ええ。……待ってる' },
    { stage: ['q12', 3] },
    { obj: 'シキに、石灯籠のことを相談しよう', at: 'shop' },
  ] } : null,
].filter(Boolean) });
SCENES.q12_lantern = [
  { show: 'hotaru', at: 'l' },
  { n: '森の奥の、苔むした小さな広場。古い石灯籠がひとつ、ぽつんと立っている。' },
  { n: '中で、小さな光が今にも消えそうに揺れていた。' },
  { say: 'hotaru', t: '昔、この町に残した小さな光。……ずっと気になっていたの' },
  { n: '手をかざすと、ほんのり温かい。光の奥に、誰かがお茶を淹れる手と、小さな笑い声が見えた気がした。' },
  { say: 'hero', f: 'c', t: '（誰かの……優しい記憶だ）' },
  { say: 'hotaru', t: 'どうする？' },
  q12Choice(true),
];
SCENES.q12_shiki = [
  { say: 'hero', t: 'シキさん、森の奥に、古い石灯籠があって' },
  { n: '光のこと、光の奥に見えた記憶のことを話した。' },
  { say: 'shiki', f: 'b', t: '……森の奥の灯籠か。まだ、灯っていたんだね' },
  { say: 'shiki', t: '触るなら、優しくね。触らないなら、それでもいい' },
  { say: 'shiki', f: 'a', t: '……君が決めたほうなら、きっとどちらでもいいんだ' },
  { aff: { shiki: 1 } }, S => { S.f.shikiConsult = (S.f.shikiConsult || 0) + 1; S.f.shikiDeep = true; },
  { memo: ['q12', 'シキさんに相談した。「触るなら、優しくね」'] },
  { stage: ['q12', 4] },
  { obj: '夜、森の奥の灯籠へ戻ろう（森の入口から）', at: 'forest' },
];
SCENES.q12_lantern2 = [
  { show: 'hotaru', at: 'l' },
  { n: '石灯籠のそばで、ホタルが待っていた。' },
  { say: 'hotaru', t: 'おかえり。……決めた？' },
  q12Choice(false),
];
SCENES.q12_end = [
  { say: 'hotaru', t: 'お礼に……夜の町を、すこしだけ明るくしておくね' },
  { n: 'ホタルが指を鳴らすと、木々の間を光の粒が流れていった。' },
  { set: { nightBright: true } },
  { hide: 'hotaru' },
  { note: ['hotaru', '森の奥の石灯籠の光を、一緒に確かめた'] },
  { stage: ['q12', 5] },
  { obj: 'ほしやに戻ろう', at: 'shop' },
];
SCENES.q12_report = S => [
  { say: 'shiki', t: 'おかえり。……今夜は、町がいつもより明るいね' },
  { say: 'hero', f: 'a', t: 'ホタルさんの、お礼みたいです' },
  S.f.shikiDeep ? { say: 'shiki', f: 'b', t: '……あの灯籠を見てくれて、ありがとう。いや、なんでもないよ' } : { say: 'shiki', f: 'a', t: 'そうか。あの人がお礼をするなんて、珍しいことだ' },
  { stage: ['q12', DONE] }, { obj: '' },
  { go: 'after_quest' },
];

/* ============ 依頼13：店の看板を塗り直す ============ */
const checkQ13 = S => {
  if (has('toryo') && has('fude')) { S.obj = '奥の部屋の作業台で、看板を塗り直そう'; S.objAt = 'backroom'; }
  else if (!has('toryo')) { S.obj = '塗料をもらおう（雑貨屋のロキ）'; S.objAt = 'zakka'; }
  else { S.obj = '筆をもらおう（花屋のハナ）'; S.objAt = 'hana'; }
  renderTop();
};
QUESTS.push({
  id: 'q13', no: 13, title: '店の看板を塗り直す', client: 'shiki',
  summary: '「ほしや」の看板が、だいぶ古くなった',
  paper: '看板、そろそろ塗り直そうか。\n――シキ',
  unlock: S => done('q11'), start: 'q13_start',
  when: S => S.time < 3 ? { ok: true } : { ok: false, note: '夜は暗くて塗れない。明日にしよう' },
  hint: S => {
    if (stage('q13') === 1) {
      if (!has('toryo')) return S.time === 3 ? 'ロキの店はもう閉まっているね。明日にしよう' : '塗料はロキに頼んでごらん';
      if (!has('fude')) return S.time === 3 ? 'ハナさんはもう休んでいる時間だ。明日にしよう' : '筆はハナさんが譲ってくれるはずだ';
      return '材料はそろったね。奥の作業台でどうぞ';
    }
    return 'ゆっくりでいいよ';
  },
});
HOOKS.push({
  npcs(loc, S, list) {
    if (stage('q13') !== 1) return;
    if (loc === 'zakka' && !has('toryo')) return talkFor(list, 'roki', 'q13_roki');
    if (loc === 'hana' && !has('fude')) return talkFor(list, 'hana', 'q13_hana');
  },
  bench(S) {
    if (stage('q13') === 1) return has('toryo') && has('fude') ? 'q13_paint' : 'q13_wait';
  },
  enter(loc, S) { if (loc === 'shop' && stage('q13') === 2) return 'q13_hang'; },
});
SCENES.q13_start = [
  { show: 'shiki', at: 'c' },
  { say: 'shiki', t: '看板がだいぶ古くなったね。塗り直すなら、今のうちかもしれない' },
  { say: 'shiki', f: 'a', t: '祭りの日に、新しい看板で迎えるのも悪くないだろう？' },
  { card: 'bg_exterior', t: 'ほしやの看板' },
  { n: 'シキと二人で、入口の上の看板をそっと外した。近くで見ると、文字の色がすっかり薄くなっている。' },
  { get: 'kanban' },
  { say: 'shiki', t: '塗料はロキ、筆はハナさんが譲ってくれるはずだ' },
  { accept: 'q13' }, { memo: ['q13', 'シキさんと、店の看板を塗り直すことになった'] },
  checkQ13,
];
SCENES.q13_roki = [
  { say: 'roki', t: '塗料か。……ほしやの看板なら、いちばんいい色を出してやる' },
  { say: 'roki', f: 'b', t: 'あの看板、俺がガキのころからあるんだ。……ちゃんと塗れよ' },
  { get: 'toryo' }, checkQ13,
];
SCENES.q13_hana = [
  { say: 'hana', f: 'a', t: '筆ね。昔、花の名札を書くのに使ってた筆があるの' },
  { say: 'hana', t: '毛先がやわらかいから、細い線もきれいに引けるわよ' },
  { get: 'fude' }, checkQ13,
];
SCENES.q13_wait = [{ n: '塗り直すには、塗料と筆が要る。' }, checkQ13];
SCENES.q13_paint = [
  { bench: { title: '看板を塗り直す', img: 'bg_exterior', needs: ['kanban', 'toryo', 'fude'] } },
  { take: 'toryo' }, { take: 'fude' },
  { n: '古い色をていねいに落として、下地を整える。筆に塗料をふくませて、「ほしや」の文字をなぞっていく。' },
  { show: 'shiki', at: 'c' },
  { say: 'shiki', t: '仕上げは、君の好きにしていいよ' },
  { choice: [
    { t: 'これまで通りの「ほしや」の文字にする', do: [
      { n: '文字の形はそのままに、色だけを新しくした。' },
      { say: 'shiki', f: 'a', t: '無難でいい。これが一番、店らしい' },
      { set: { signStyle: 'plain' } }, { memo: ['q13', '看板は、これまで通りの文字で塗り直した'] },
    ] },
    { t: '少しだけデザインを変える', do: [
      { n: '文字の端に、小さな星と葉の模様を描き足した。' },
      { say: 'shiki', f: 'b', t: '……悪くないね。新しい風だ' },
      { set: { signStyle: 'new' } }, { memo: ['q13', '看板に、小さな星と葉の模様を描き足した'] },
    ] },
    { t: '自分の名前を小さく添える', do: [
      { n: '「ほしや」の下に、小さな文字で「{name}」と書き添えた。' },
      { say: 'shiki', f: 'b', t: '……入れていいの？' },
      { say: 'shiki', f: 'a', t: 'まあ、君の店でもあるからね' },
      { set: { signStyle: 'name', yourShop: true } }, { aff: { shiki: 1 } }, { memo: ['q13', '看板の下に、自分の名前を小さく添えた'] },
    ] },
  ] },
  { stage: ['q13', 2] },
  { obj: '看板を店の入口に掛けよう', at: 'shop' },
  { loc: 'shop' },
];
SCENES.q13_hang = S => [
  { take: 'kanban' },
  { card: 'bg_exterior', t: S.f.signStyle === 'name' ? '「ほしや」　――{name}' : S.f.signStyle === 'new' ? '星と葉の模様が入った「ほしや」' : '塗りたての「ほしや」' },
  { n: '二人で看板を入口の上に掛け直すと、店の前が少しだけ明るくなった。' },
  { say: 'shiki', f: 'a', t: 'うん。……いい顔になった' },
  { note: ['shiki', '一緒に看板を塗り直した'] },
  { stage: ['q13', DONE] }, { obj: '' }, { time: '+1' },
  { go: 'after_quest' },
];

/* ============ 依頼14：みんなの小さな願い ============ */
QUESTS.push({
  id: 'q14', no: 14, title: 'みんなの小さな願い', client: 'hana',
  summary: '祭りの前に、町のみんながひとつずつお願いを持ってきた',
  paper: '祭りの前に、ひとつだけお願いがあるの。\n――ひなたまちのみんなより',
  unlock: S => done('q12') && done('q13'), start: 'q14_start',
  when: S => S.time < 3 ? { ok: true } : { ok: false, note: 'みんなが店に来るのは昼のうち。明日にしよう' },
  hint: S => {
    const left = [];
    if (!S.f.w_hana) left.push('ハナさんの風鈴');
    if (!S.f.w_tsubaki) left.push('ツバキくんの手紙');
    if (!S.f.w_pan) left.push('精霊へのパン');
    if (!S.f.w_suzu) left.push('スズくんの楽器');
    if (!S.f.w_roki) left.push('ロキの道具');
    if (!left.length) return '全部かなえたんだね。準備ができたら「祭りの日へ」を押してごらん';
    return 'まだのものは……' + left.join('、') + '。全部でなくていいんだよ。気が済んだら「祭りの日へ」だ';
  },
});
{
  const baseShopActions = LOCS.shop.actions;
  LOCS.shop.actions = S => {
    const a = baseShopActions(S);
    if (stage('q14') >= 1 && !done('q14')) a.splice(3, 0, { t: '🏮 祭りの日へ', fn: () => play('q14_ready'), hl: wishesDone(S) === 5 });
    return a;
  };
}
const HOME_LOC2 = { hana: 'hana', shop: 'backroom', view: 'view' };
HOOKS.push({
  spots(loc, S, list) {
    if (stage('q14') !== 1) return;
    if (loc === 'hana' && has('furin')) list = spotFor(list, { id: 'q14tree', x: 30, y: 30, label: '庭のいちばん古い木', scene: 'q14_furin' });
    if (loc === 'saka' && has('furutegami')) list = spotFor(list, { id: 'q14letter', x: 40, y: 44, label: '宛先の家族の家', scene: 'q14_letter' });
    if (loc === 'saka' && has('kogakki') && S.f.kidFriend) list = spotFor(list, { id: 'q14kid', x: 74, y: 36, label: '笛の子の家', scene: 'q14_kid' });
    return list;
  },
  npcs(loc, S, list) {
    if (stage('q14') !== 1) return;
    if (has('seireipan') && HOME_LOC2[S.f.spiritHome] === loc) list = talkFor(list, 'seirei', 'q14_spirit');
    if (loc === 'hana' && has('kogakki')) list = talkFor(list, 'chibi', 'q14_chibi');
    if (loc === 'zakka' && has('naoshitadougu') && !S.f.w_roki) list = talkFor(list, 'roki', 'q14_roki');
    return list;
  },
  bench(S) { if (stage('q14') === 1 && has('furudougu')) return 'q14_fix'; },
});
SCENES.q14_start = [
  { n: '祭りが近づいたある日。ほしやのドアの鈴が、何度も鳴った。' },
  { se: 'door' },
  { show: 'hana', at: 'c' },
  { say: 'hana', f: 'a', t: '{name}ちゃん、ひとつだけお願い。庭のいちばん古い木に、新しい風鈴を付けてほしいの' },
  { say: 'hana', f: 'b', t: 'わたし、もう脚立に登るのが怖くてね' },
  { get: 'furin' }, { hide: 'hana' },
  { se: 'door' },
  { show: 'tsubaki', at: 'c' },
  { say: 'tsubaki', t: '届かなかった昔の手紙を、もう一度届けてほしいんです' },
  { say: 'tsubaki', f: 'b', t: '宛先の人はもう町を出ていて……でも、坂道にご家族がいるんです。僕が届けると、どうしても「仕事」になってしまうので' },
  { get: 'furutegami' }, { hide: 'tsubaki' },
  { se: 'door' },
  { show: 'mil', at: 'c' },
  { say: 'mil', f: 'a', t: '精霊ちゃんに、特別なパンを届けてほしいんだ！' },
  { say: 'coco', t: '祭りの日に出す新作の、試作なの。最初に食べてほしくて' },
  { get: 'seireipan' }, { hide: 'mil' },
  { se: 'door' },
  { show: 'suzu', at: 'c' },
  { say: 'suzu', t: '作ったばかりの小さな楽器を、誰かに聞かせてほしいんです' },
  { say: 'suzu', f: 'a', t: '僕が弾くと、つい曲が長くなっちゃうので' },
  { get: 'kogakki' }, { hide: 'suzu' },
  { se: 'door' },
  { show: 'roki', at: 'c' },
  { say: 'roki', t: '……壊れたままの古い道具がある。一度でいいから、直してみてくれ' },
  { say: 'roki', f: 'b', t: '俺じゃ、もう手が覚えてねえ' },
  { get: 'furudougu' }, { hide: 'roki' },
  { show: 'shiki', at: 'c' },
  { say: 'shiki', f: 'a', t: 'ずいぶん頼まれたね。……全部やらなくていいんだよ。気になるものだけでいい' },
  { say: 'shiki', t: '準備ができたと思ったら、店で「祭りの日へ」と声をかけておくれ' },
  { accept: 'q14' }, { memo: ['q14', '祭りの前に、町のみんなから小さな願いを預かった'] },
  { obj: 'みんなの小さな願いをかなえよう（いくつでも。準備ができたら店で「祭りの日へ」）', at: null },
  { toast: '願いは全部かなえなくても大丈夫。店の「🏮 祭りの日へ」で祭りが始まります' },
];
SCENES.q14_furin = S => [
  { n: '庭のいちばん古い木。太い枝に、そっと風鈴を結びつけた。' },
  { take: 'furin' },
  { se: 'bell' },
  { n: '風が吹いて、ちりん、と澄んだ音が鳴った。' },
  S.time < 3 ? { show: 'hana', at: 'c' } : null,
  S.time < 3 ? { say: 'hana', f: 'a', t: '……いい音。あの木もきっと喜んでるわ' } : { n: '窓の明かりの向こうで、ハナがこちらに手を振っているのが見えた。' },
  S.time < 3 ? { n: 'ハナは、長いこと風鈴を見上げて微笑んでいた。' } : null,
  { set: { w_hana: true } }, { aff: { hana: 1 } },
  { memo: ['q14', 'ハナさんの庭のいちばん古い木に、風鈴を付けた'] },
];
SCENES.q14_letter = [
  { n: '坂道の途中の、小さな家。宛先の家族だという、おばあさんが出てきた。' },
  { take: 'furutegami' },
  { say: 'jumin', t: 'まあ……あの子の字だわ。こんなに前の手紙が' },
  { say: 'jumin', t: 'ありがとう。郵便屋さんにも、よろしく伝えてちょうだいね' },
  { n: 'おばあさんは、手紙を胸に当てて、ていねいに頭を下げた。' },
  { set: { w_tsubaki: true } }, { aff: { tsubaki: 2 } },
  { memo: ['q14', 'ツバキさんの昔の手紙を、坂道の家族に届けた'] },
];
SCENES.q14_spirit = [
  { say: 'hero', f: 'a', t: 'ミルさんとココさんから。祭りの新作だって' },
  { take: 'seireipan' },
  { se: 'magic' },
  { n: '精霊はパンのまわりをくるくる回って、それから、少しずつ大事そうにかじった。' },
  { say: 'seirei', t: '……おいしい。おまつり、いく' },
  { set: { w_pan: true } }, { aff: { seirei: 1, pan: 1 } },
  { memo: ['q14', '精霊に、ミルさんとココさんの新作パンを届けた'] },
];
SCENES.q14_chibi = [
  { say: 'hero', t: 'チビ、ちょっと聞いてくれる？' },
  { take: 'kogakki' },
  { se: 'flute' },
  { n: 'スズの小さな楽器を、ぽろん、ぽろんと鳴らしてみる。' },
  { n: 'チビは耳をぴくりと動かして、それから目を細め、喉をごろごろ鳴らしはじめた。' },
  { se: 'meow' },
  { say: 'chibi', f: 'a', t: 'にゃあ' },
  { set: { w_suzu: true } }, { aff: { suzu: 1, chibi: 1 } },
  { memo: ['q14', 'スズさんの楽器を、チビに聞かせた'] },
];
SCENES.q14_kid = [
  { n: '坂の上の家。窓から、笛を借りていたあの子が顔を出した。' },
  { say: 'kid', t: 'あ！ ほしやの人！' },
  { take: 'kogakki' },
  { se: 'flute' },
  { n: 'スズの小さな楽器を鳴らすと、子供は目を輝かせて、最後まで聞いてくれた。' },
  { say: 'kid', t: 'すごい！ もういっかい！' },
  { set: { w_suzu: true, w_suzuKid: true } }, { aff: { suzu: 1 } },
  { memo: ['q14', 'スズさんの楽器を、笛の子に聞かせた'] },
];
SCENES.q14_fix = [
  { bench: { title: 'ロキの古い道具を直す', icon: '⚙️', needs: ['furudougu'] } },
  { take: 'furudougu' },
  { n: '錆を落として、ゆるんだ部品を締めなおす。最後に油をさすと、道具は、かちり、と気持ちのいい音を立てた。' },
  { get: 'naoshitadougu' },
  { obj: 'みんなの小さな願いをかなえよう（直した道具をロキへ）', at: 'zakka' },
];
SCENES.q14_roki = [
  { say: 'hero', f: 'a', t: 'ロキさん、直りました' },
  { n: 'ロキは道具を受け取ると、何度も手の中で動かして、珍しく満足そうな顔をした。' },
  { say: 'roki', f: 'a', t: '……ああ。この音だ' },
  { say: 'roki', t: 'お前には任せられる。……それ、お前が持ってろ。俺より、お前の手に合ってる' },
  { set: { w_roki: true } }, { aff: { roki: 2 } },
  { memo: ['q14', 'ロキさんの古い道具を直した。「お前には任せられる」'] },
  S => { S.obj = 'みんなの小さな願いをかなえよう（いくつでも。準備ができたら店で「祭りの日へ」）'; S.objAt = null; renderTop(); },
];
SCENES.q14_ready = S => {
  const n = wishesDone(S);
  return [
    n === 5 ? { say: 'shiki', f: 'a', t: 'みんなの願い、全部かなえたんだね。……祭りの日を迎えようか' }
      : { say: 'shiki', t: n ? `${n}つ、かなえたんだね。まだ途中の願いもあるけれど、無理しなくていい` : 'まだ誰の願いも聞いていないけれど……それでもいいんだよ' },
    { choice: [
      { t: '祭りの日を迎える', go: 'festival' },
      { t: 'もう少し準備する', do: [{ say: 'shiki', t: 'そうか。祭りは逃げないよ' }] },
    ] },
  ];
};

/* ============ 祭り当日 ============ */
SCENES.festival = S => {
  const w = k => !!S.f[k];
  const all = wishesDone(S) === 5;
  const L = [
    { fade: 'そして、祭りの日', then: S => { S.day += 1; S.time = 2; S.loc = 'plaza'; } },
    { stage: ['q14', DONE] }, { obj: '' },
    { se: 'bell' },
    { n: '夕暮れの中央広場。飾りが風に揺れて、鈴がちりちりと鳴っている。' },
    S.f.decoStyle === 'bright' ? { n: '花と鈴でいっぱいの飾りのまわりに、子供たちが集まって、鈴の数を数えている。' }
      : S.f.decoStyle === 'calm' ? { n: '落ち着いた飾りの下で、年配の人たちが「いい味だ」と目を細めている。' }
        : { n: '控えめで、でもどこか明るい飾り。大人も子供も、それぞれの場所で足を止めている。' },
    { show: 'shiki', at: 'c' },
    { say: 'shiki', f: 'a', t: 'いい祭りだね。……さ、みんなに顔を見せておいで' },
    { hide: 'shiki' },
    // ハナ
    { show: 'hana', at: 'l' },
    w('w_hana') ? { say: 'hana', f: 'a', t: '{name}ちゃん！ 風鈴ね、朝から晩まで鳴りっぱなしなのよ。はい、お礼' } : { say: 'hana', f: 'a', t: '{name}ちゃん、来てくれたのね。今日の花、どう？' },
    w('w_hana') ? { get: 'hanataba' } : null,
    S.f.signStyle === 'new' ? { say: 'hana', t: 'そうそう、看板、変わったわね。星の模様、かわいいじゃない' } : null,
    S.f.signStyle === 'name' ? { say: 'hana', f: 'b', t: '看板に名前、見たわよ。うふふ' } : null,
    { hide: 'hana' },
    // ツバキ
    { show: 'tsubaki', at: 'r' },
    w('w_tsubaki') ? { say: 'tsubaki', f: 'b', t: 'ほしやさん……あの手紙、本当に助かりました。ご家族から、お礼の手紙が届いたんです' } : { say: 'tsubaki', t: 'こんばんは。今日は配達がお休みなので、ゆっくり見て回っています' },
    w('w_tsubaki') ? { say: 'tsubaki', t: 'これは、僕からのお礼です' } : null,
    w('w_tsubaki') ? { stamps: 2 } : null,
    { hide: 'tsubaki' },
    // パン屋
    { show: 'mil', at: 'l' },
    { say: 'mil', f: 'a', t: '焼きたて、どうぞ！ 今日は特別に、全部の種類を持ってきたんだ！' },
    w('w_pan') ? { say: 'coco', f: 'a', t: 'あの子、新作を「おいしい」って言ってくれたんでしょう？ ……ほら、来てるわよ' } : null,
    w('w_pan') ? { show: 'seirei', at: 'r' } : null,
    w('w_pan') ? { say: 'seirei', t: 'おまつり、きた' } : null,
    { get: 'pan', num: 2 },
    { hide: 'mil' }, { hide: 'seirei' },
    // スズ
    { show: 'suzu', at: 'r' },
    { se: 'flute' },
    w('w_suzu') ? { say: 'suzu', f: 'a', t: S.f.w_suzuKid ? 'あの子、僕の楽器の曲を、もう口笛で吹けるんですよ。……また作ったら、聞いてもらえますか？' : 'チビくんが、僕の楽器で寝ちゃったって聞きました。最高の感想です。……また作ったら、聞いてもらえますか？' }
      : { say: 'suzu', t: '今日の鈴、いい音でしょう？ 風と相談して決めたんです' },
    { hide: 'suzu' },
    // ロキ
    { show: 'roki', at: 'l' },
    w('w_roki') ? { say: 'roki', t: '……あの道具、ちゃんと使ってるか。お前の手なら、大事にするだろ' } : { say: 'roki', t: 'おう。木枠、びくともしてねえだろ' },
    { say: 'roki', f: 'a', t: 'ばあさんの蔓、やっぱり長すぎたな' },
    { say: 'hana', f: 'b', t: '聞こえてるわよ！' },
    { hide: 'roki' },
    // 笛の子
    S.f.kidFriend ? { n: '笛を借りていたあの子が、飾りの下で、スズの笛を楽しそうに吹いている。' } : null,
    // 食事
    { n: '日が沈むと、広場の真ん中に長いテーブルが並べられた。パンと、ハナの花と、シキが淹れたお茶。' },
    { n: 'みんなで同じテーブルを囲んで、軽い食事をする。それだけの、小さな祭りだ。' },
    { time: 3 },
    { show: 'shiki', at: 'c' },
    { say: 'shiki', f: 'a', t: '……毎年、同じことをしているんだけどね。今年は、なんだか少し違う気がするよ' },
  ];
  if (all) L.push(
    { n: '――ふと気がつくと、テーブルのみんなが、こちらを見ていた。' },
    { say: 'hana', f: 'a', t: '{name}ちゃん、今年はありがとうね' },
    { say: 'tsubaki', f: 'a', t: 'ほしやさんがいてくれて、本当によかったです' },
    { say: 'roki', t: '……まあ、なんだ。助かった' },
    { say: 'mil', f: 'a', t: '乾杯しよう、乾杯！ ほしやの{name}に！' },
    { n: '湯のみと、パンと、笛の音が、いっせいに上がった。' },
    { say: 'shiki', f: 'b', t: '君がこの町にいてくれて、よかった' },
    { memo: ['q14', '祭りの夜、町のみんなにお礼を言われた'] },
  );
  L.push(
    S.f.hotaruNear ? { show: 'hotaru', at: 'r' } : null,
    S.f.hotaruNear ? { say: 'hotaru', f: 'a', t: '……来ちゃった。にぎやかなのも、たまにはいいわね' } : { n: '見晴らし台のほうで、光の粒がひとつ、楽しそうに揺れていた。' },
    { n: '祭りの明かりは、夜遅くまで消えなかった。' },
    { set: { festivalDone: true } },
    { memo: ['q14', `願いは ${wishesDone(S)} つかなえて、祭りの日を迎えた`] },
    { sleep: true },
    { go: 'morning' },
  );
  return L;
};

/* ---------- 終盤の関係を、ふだんの会話に少しだけ ---------- */
{
  const baseShiki = SCENES.talk_shiki, baseHotaru = SCENES.talk_hotaru;
  SCENES.talk_shiki = S => {
    if (S.f.yourShop && !S.active && Math.random() < .35) return [{ say: 'shiki', f: 'a', t: '君の店でもあるからね。好きにしていいんだよ' }];
    return baseShiki(S);
  };
  SCENES.talk_hotaru = S => {
    const l = baseHotaru(S);
    if (S.f.hotaruNear) l.splice(1, 0, { say: 'hotaru', f: 'a', t: 'あの灯籠ね、毎晩ちゃんと灯ってる。……あなたのおかげ' });
    return l;
  };
}
