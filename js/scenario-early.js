/* 魔法の町のなんでも屋 ― 序盤シナリオ（プロローグ・依頼1〜5）
 * 元資料：「序盤シナリオ」「序盤分岐」
 */
'use strict';

/* ---------- 小道具 ---------- */
// 依頼に関係する住人の「話す」を、依頼用の会話に差しかえる
function talkFor(list, id, scene) { return list.map(n => n.id === id ? Object.assign({}, n, { talk: scene, label: '💬 用事' }) : n); }
// 依頼用の調べる所を足す（同じidがあれば差しかえる）
function spotFor(list, s) { return list.filter(x => x.id !== s.id).concat([Object.assign({ key: true }, s)]); }
const objNow = (t, at) => S => { S.obj = t; S.objAt = at || null; renderTop(); };

/* ============ プロローグ ============ */
SCENES.prologue = [
  S => { S.loc = 'plaza'; render(); },
  { bg: 'black' },
  { n: '丘の上に広がる、小さな魔法の町――ひなたまち。' },
  { n: 'ここでは、魔法は特別なものじゃない。古い道具や暮らしの知恵みたいに、あたりまえにそこにある。' },
  { fade: true, then: () => { sceneBg = null; } },
  { n: 'ある晴れた朝。{name}は、特に行くあてもなく、町をぶらぶらしていた。' },
  { say: 'hero', f: 'a', t: '（いい天気。噴水の音、気持ちいいな）' },
  { show: 'shiki', at: 'c' },
  { say: 'shiki', t: 'そこの君。少し、いいかな' },
  { say: 'hero', f: 'b', t: 'わたし、ですか？' },
  { say: 'shiki', f: 'a', t: '私はシキ。この先の丘で、なんでも屋をやっている' },
  { say: 'shiki', t: '人手が足りなくてね。……とりあえず、働いてみない？' },
  { choice: [
    { t: '「はい、やってみます」', do: [] },
    { t: '「えっと……なんでも屋って？」', do: [
      { say: 'shiki', t: '町の人の、小さな困りごとを手伝う店だよ。ネコ探しとか、手紙探しとか' },
      { say: 'hero', f: 'c', t: '（なんだか、楽しそうかも）' },
      { say: 'hero', t: '……やってみます' },
    ] },
  ] },
  { say: 'shiki', f: 'a', t: 'よかった。じゃあ、ついておいで' },
  { meet: 'shiki' },
  { fade: true, then: S => { S.loc = 'shop'; sceneBg = null; tempChars = {}; } },
  { card: 'bg_exterior', t: 'なんでも屋「ほしや」' },
  { n: '丘を少し上った木々の間に、小さな木造の店があった。入口の上には「ほしや」と書かれた看板。' },
  { say: 'shiki', t: 'ようこそ、ほしやへ。今日から君は、ここの店員だ' },
  { say: 'shiki', t: '仕事は簡単。カウンターの依頼箱に、町の人から紙が届く。そこから一つ選んで、手伝いに行く' },
  { say: 'shiki', f: 'b', t: '一日に一つで十分。疲れていたら、休んでいい。店はね、閉まっていてもちゃんと店なんだ' },
  { say: 'hero', f: 'a', t: 'はい！' },
  { se: 'door' },
  { n: 'カラン、とドアの鈴が鳴った。' },
  { show: 'shiki', at: 'l' }, { show: 'hana', at: 'r' },
  { say: 'hana', t: 'シキさん、ちょっといいかしら。……あら、新しい子？' },
  { say: 'shiki', t: '今日から入った{name}だよ' },
  { say: 'hana', f: 'a', t: 'まあ、よろしくね。花屋のハナよ' },
  { meet: 'hana' },
  { say: 'hana', f: 'b', t: 'それでね、うちの庭の木に、チビが登ったまま降りてこないの。お願いできないかしら？' },
  { say: 'shiki', f: 'a', t: 'ちょうどいい。{name}、最初の仕事だ' },
  { accept: 'q1' }, { memo: ['q1', 'ハナさんから、庭の木に登ったチビのことを頼まれた'] },
  { say: 'hana', f: 'a', t: '助かるわ。先に庭に戻ってるわね' },
  { hide: 'hana' },
  { obj: '花屋の庭へ行ってみよう', at: 'hana' },
  { say: 'shiki', t: '花屋は広場の東だよ。「外へ出る」と、町の地図が開く' },
  { toast: '「🚪 外へ出る」で町マップが開きます' },
];

/* ============ 依頼1：木から降りられないネコ ============ */
QUESTS.push({
  id: 'q1', no: 1, title: '木から降りられないネコ', client: 'hana',
  summary: '庭の木にチビが登ったまま降りてこない',
  start: 'prologue',
  hint: S => 'チビは花屋の庭だよ。広場の東だ。……木登りが趣味みたいな子でね',
});
HOOKS.push({
  npcs(loc, S, list) { if (loc === 'hana' && stage('q1') === 1) return list.filter(n => n.id !== 'chibi'); },
  enter(loc, S) {
    if (loc === 'hana' && stage('q1') === 1) return 'q1_tree';
    if (loc === 'shop' && stage('q1') === 2) return 'q1_report';
  },
});
SCENES.q1_tree = [
  { show: 'hana', at: 'l' }, { show: 'chibi', at: 'c', cls: 'up' },
  { n: '花屋の庭。いちばん高い木の枝の上に、灰色のネコがちょこんと座っている。' },
  { say: 'hana', t: '来てくれたのね。ほら、あそこ。もう一時間もああなのよ' },
  { se: 'meow' }, { say: 'chibi', t: '……にゃ' },
  { say: 'hero', f: 'c', t: '（けっこう高いところにいる……どうしよう）' },
  { choice: [
    { t: '優しく声をかける', go: 'q1_a' },
    { t: '近くの枝を揺らしてみる（簡単な魔法）', go: 'q1_b' },
    { t: 'ハナさんに「好物はありますか？」と聞く', go: 'q1_c' },
  ] },
];
SCENES.q1_a = [
  { say: 'hero', f: 'a', t: '降りておいで。大丈夫だよ' },
  { n: 'チビはしばらくこちらを見ていたが、やがてゆっくりと枝を伝って降りてきた。' },
  { show: 'chibi', at: 'r', cls: 'small' },
  { say: 'hana', f: 'a', t: 'あら、素直ね。あなた、猫の扱いが上手なのね' },
  { aff: { hana: 1, chibi: 1 }, set: { catLover: true } },
  { memo: ['q1', 'やさしく声をかけたら、チビが自分で降りてきた'] },
  { go: 'q1_end' },
];
SCENES.q1_b = [
  { say: 'hero', t: 'えいっ' },
  { se: 'magic' },
  { n: '指先で小さく円を描くと、枝がさわさわと揺れた。チビが驚いて、一段下の枝へ移る。' },
  { n: 'もう一度揺らすと、チビはぴょんと地面に飛び降りた。' },
  { show: 'chibi', at: 'r', cls: 'small' },
  { say: 'hana', f: 'b', t: 'まあ、魔法で……少しびっくりしたみたいだけど、無事でよかったわ' },
  { say: 'hana', t: '次はもう少し優しくね' },
  { say: 'hero', f: 'd', t: 'はい……' },
  { memo: ['q1', '魔法で枝を揺らして、チビを降ろした（少し驚かせてしまった）'] },
  { go: 'q1_end' },
];
SCENES.q1_c = [
  { say: 'hero', f: 'c', t: 'ハナさん、チビの好物って何かありますか？' },
  { say: 'hana', f: 'a', t: '干し魚が大好きなのよ。ちょっと待ってて' },
  { get: 'hoshizakana' },
  { n: '干し魚を高く掲げて見せると、チビはするすると木を降りてきて、足元で鳴いた。' },
  { take: 'hoshizakana' },
  { show: 'chibi', at: 'r', cls: 'small' },
  { se: 'meow' }, { say: 'chibi', f: 'a', t: 'にゃあ！' },
  { say: 'hana', f: 'a', t: 'よく思いついたわね。これ、あげなさい。またあの子が登ったときのために' },
  { get: 'hoshizakana', num: 3 },
  { aff: { chibi: 2 }, set: { chibiVisits: true } },
  { memo: ['q1', 'ハナさんに好物を聞いて、干し魚でチビを呼んだ'] },
  { note: ['chibi', '干し魚が大好物。ほしやにも遊びに来るようになった'] },
  { go: 'q1_end' },
];
SCENES.q1_end = [
  { say: 'hana', t: 'ありがとうね、助かったわ。……そうだ、ちょっと待ってて' },
  { get: 'hanataba' },
  { say: 'hana', f: 'a', t: 'お礼よ。お店に飾ってちょうだい。少し華やかになるわよ' },
  { say: 'hana', t: 'シキさんにもよろしくね' },
  { meet: 'chibi' },
  { stage: ['q1', 2] },
  { obj: 'ほしやに戻って報告しよう', at: 'shop' },
];
SCENES.q1_report = [
  { say: 'shiki', f: 'a', t: 'おかえり。……チビだったろう？ あの子は木登りが趣味みたいなものでね' },
  { say: 'hero', t: 'ハナさんから、お礼に花束をもらいました' },
  { say: 'shiki', t: 'いい花だね。どうする？' },
  { choice: [
    { t: 'カウンターに飾る', do: [
      { take: 'hanataba' }, { set: { bouquetShown: true } },
      { n: 'カウンターの端に花を活けると、店の中がぱっと明るくなった。' },
      { say: 'shiki', f: 'a', t: 'うん、いい。店が少し華やかになった' },
    ] },
    { t: '大事にしまっておく', do: [{ say: 'shiki', t: 'それもいい。飾りたくなったら、ひと休みのときにでも' }] },
  ] },
  { stage: ['q1', DONE] }, { obj: '' }, { time: '+1' },
  { say: 'shiki', t: '初仕事、おつかれさま。こんなふうに依頼を一つ片づけたら、その日はおしまいにしていい' },
  { go: 'after_quest' },
];

/* ============ 依頼2：届かない手紙 ============ */
QUESTS.push({
  id: 'q2', no: 2, title: '届かない手紙', client: 'tsubaki',
  summary: '配達の途中で、手紙が一通消えてしまった',
  paper: 'ほしやさんへ\n手紙が一通、配達の途中で消えてしまいました。探していただけませんか。\n――郵便局　ツバキ',
  unlock: S => done('q1'), start: 'q2_start',
  hint: S => ({
    1: '最後に見たのは広場の東側だったね。風の通り道を探してごらん',
    2: '葉っぱの向きを追ってごらん。風は正直だよ',
    3: '花屋のほうの道沿いに、古い木があったね',
    4: 'ツバキくんは郵便局だよ。広場の北西だ',
  }[stage('q2')] || 'ゆっくりでいいよ'),
});
HOOKS.push({
  spots(loc, S, list) {
    const st = stage('q2');
    if (loc === 'plaza' && st === 1) return spotFor(list, { id: 'q2leaf', x: 76, y: 66, label: '落ち葉の列', scene: 'q2_leaf1' });
    if (loc === 'plaza' && st === 2) return spotFor(list, { id: 'q2leaf2', x: 90, y: 38, label: '揺れる木の葉', scene: 'q2_leaf2' });
    if (loc === 'hana' && st === 3) return spotFor(list, { id: 'q2hollow', x: 18, y: 46, label: '道沿いの古い木', scene: 'q2_hollow' });
  },
  enter(loc, S) {
    if (loc === 'post' && stage('q2') === 4) return 'q2_deliver';
    if (loc === 'shop' && stage('q2') === 5) return 'q2_report';
  },
});
SCENES.q2_start = [
  { se: 'door' },
  { n: 'カラン、とドアの鈴が鳴った。制服をきちんと着た青年が、少し息を切らして入ってくる。' },
  { show: 'shiki', at: 'l' }, { show: 'tsubaki', at: 'r' },
  { say: 'tsubaki', t: 'ほしやさん、ですよね。郵便局のツバキです' },
  { meet: 'tsubaki' },
  { say: 'tsubaki', f: 'b', t: '届け先の住所が書いてあるのに、手紙が途中で消えてしまったんです。探してもらえませんか？' },
  { say: 'tsubaki', t: '最後に見たのは中央広場の東側です。配達かばんを開けたときに強い風が吹いて、配達順は北から時計回りで広場は三番目で、それで、それで……' },
  { say: 'shiki', f: 'a', t: 'ツバキくん、息をして' },
  { say: 'tsubaki', f: 'b', t: '……すみません。仕事の話になると、つい' },
  { accept: 'q2' }, { memo: ['q2', 'ツバキさんから、消えた手紙を探してほしいと頼まれた'] },
  { say: 'tsubaki', f: 'a', t: 'よろしくお願いします！ 僕は郵便局にいますので' },
  { hide: 'tsubaki' },
  { obj: '中央広場の東側を調べてみよう', at: 'plaza' },
];
SCENES.q2_leaf1 = [
  { n: '石畳の上に、小さな葉っぱが点々と落ちている。みんな同じ向きに並んでいる。' },
  { say: 'hero', f: 'c', t: '（風が通った跡みたい。東のほうへ続いてる……）' },
  { stage: ['q2', 2] },
  { obj: '葉っぱの続く先を調べよう', at: 'plaza' },
];
SCENES.q2_leaf2 = [
  { n: '東の道沿いの木々が、そろって同じ向きにそよいでいる。道は花屋のほうへ続いている。' },
  { say: 'hero', t: '（この先かな）' },
  { stage: ['q2', 3] },
  { obj: '東の道沿い（花屋のほう）を探してみよう', at: 'hana' },
];
SCENES.q2_hollow = S => [
  { n: '道沿いの古い木の幹に、ぽっかりとうろが開いている。' },
  { n: '……のぞきこむと、白い封筒が挟まっていた。' },
  { get: 'tegami' },
  { say: 'hero', f: 'a', t: 'あった！' },
  S.time < 3 ? { say: 'hana', t: 'あら、郵便屋さんの？ 風のいたずらねえ' } : null,
  { stage: ['q2', 4] },
  { obj: '郵便局のツバキに手紙を届けよう', at: 'post' },
];
SCENES.q2_deliver = S => [
  S.time === 3 ? { n: '郵便局の窓に、まだ明かりがついていた。' } : null,
  { show: 'tsubaki', at: 'c' },
  { say: 'tsubaki', f: 'b', t: 'あっ……！ ほしやさん、それ……！' },
  { say: 'hero', f: 'c', t: '（渡す前に、どうしよう）' },
  { choice: [
    { t: '中身を見ずに渡す', do: [
      { take: 'tegami' },
      { say: 'tsubaki', f: 'a', t: 'ありがとうございます。助かりました' },
      { n: 'ツバキはほっとした顔で手紙を受け取り、宛名をそっと指でなぞった。' },
      { aff: { tsubaki: 1 } }, { memo: ['q2', '手紙は中身を見ずに渡した'] },
      { say: 'tsubaki', t: '次もお願いします' },
    ] },
    { t: '中身を軽く確認してから渡す', do: [
      { n: '封のゆるんだ手紙をそっと開くと、「元気でやっています」という短い近況が書いてあった。' },
      { take: 'tegami' },
      { say: 'tsubaki', f: 'b', t: '……見ましたか' },
      { say: 'tsubaki', t: 'まあ、大事な内容ではなかったので、いいですが' },
      { n: 'ツバキは少しだけ居心地悪そうに、帽子のつばを直した。' },
      { set: { peekedLetter: true } }, { memo: ['q2', '渡す前に中身を確かめた（ふつうの近況報告だった）'] },
    ] },
    { t: '「届け先の人に、何か伝言は？」と聞く', do: [
      { say: 'tsubaki', f: 'b', t: '伝言、ですか？ いえ、特には……' },
      { say: 'tsubaki', f: 'a', t: 'ただ、早く届くと嬉しいと思います。待っている人がいるので' },
      { take: 'tegami' },
      { aff: { tsubaki: 1 } }, { memo: ['q2', '届け先の人のことを、ツバキさんに聞いてみた'] },
      { say: 'tsubaki', t: '次もお願いします' },
    ] },
  ] },
  { say: 'tsubaki', t: 'これ、お礼です。郵便局で余った記念切手なんですが……' },
  { stamps: 4 },
  { say: 'tsubaki', f: 'a', t: 'では、配達に行ってきます！' },
  { hide: 'tsubaki' },
  { note: ['tsubaki', 'ほしやに手紙探しを頼んできた。仕事の話になると止まらない'] },
  { stage: ['q2', 5] },
  { obj: 'ほしやに戻って報告しよう', at: 'shop' },
];
SCENES.q2_report = [
  { say: 'shiki', t: 'おかえり。手紙は見つかったかい' },
  { say: 'hero', f: 'a', t: '道沿いの木のうろに挟まってました' },
  { say: 'shiki', f: 'a', t: '風のいたずらだね。手紙は、届くまでが手紙だから。いい仕事をした' },
  { stage: ['q2', DONE] }, { obj: '' }, { time: '+1' },
  { go: 'after_quest' },
];

/* ============ 依頼3：光らなくなった古いランプ ============ */
QUESTS.push({
  id: 'q3', no: 3, title: '光らなくなった古いランプ', client: 'roki',
  summary: '大事にしているランプが、急に光らなくなった',
  paper: 'ランプが光らねえ。直してくれ。\n――雑貨屋　ロキ',
  unlock: S => done('q1'), start: 'q3_start',
  hint: S => {
    const st = stage('q3');
    if (st === 1) return '作業台は奥の部屋だよ。まずはランプを見てごらん';
    if (st === 2) {
      if (!has('nuno')) return S.time === 3 ? 'ハナさんはもう店じまいだね。布は明日もらいに行くといい' : '布はハナさんが持っているはずだ。花屋は広場の東だよ';
      if (!has('ishi')) return '光る石は、広場の噴水のあたりに転がっているよ';
      return '材料はそろったね。奥の部屋の作業台へどうぞ';
    }
    if (st === 3) return 'ロキの店は広場の西。路地を少し入ったところだ';
    return 'ゆっくりでいいよ';
  },
});
const checkQ3 = S => {
  if (has('nuno') && has('ishi')) { S.obj = '奥の部屋の作業台でランプを直そう'; S.objAt = 'backroom'; }
  else if (has('nuno')) { S.obj = '光る石を探そう（中央広場の噴水）'; S.objAt = 'plaza'; }
  else { S.obj = '古い布切れをもらおう（花屋のハナ）'; S.objAt = 'hana'; }
  renderTop();
};
HOOKS.push({
  npcs(loc, S, list) { if (loc === 'hana' && stage('q3') === 2 && !has('nuno')) return talkFor(list, 'hana', 'q3_cloth'); },
  spots(loc, S, list) { if (loc === 'plaza' && stage('q3') === 2 && !has('ishi')) return spotFor(list, { id: 'fountain', x: 50, y: 52, label: '噴水の底で光る物', scene: 'q3_stone' }); },
  bench(S) {
    if (stage('q3') === 1) return 'q3_inspect';
    if (stage('q3') === 2) return has('nuno') && has('ishi') ? 'q3_fix' : 'q3_wait';
  },
  enter(loc, S) {
    if (loc === 'zakka' && stage('q3') === 3) return 'q3_return';
    if (loc === 'shop' && stage('q3') === 4) return 'q3_report';
  },
});
SCENES.q3_start = [
  { se: 'door' },
  { n: 'ドアが勢いよく開いて、がっしりした体格の男の人が入ってきた。手に古いランプを提げている。' },
  { show: 'shiki', at: 'l' }, { show: 'roki', at: 'r' },
  { say: 'roki', t: 'シキ、いるか。……ん、新入りか' },
  { say: 'shiki', t: '{name}だよ。うちの新しい店員だ' },
  { say: 'roki', t: '雑貨屋のロキだ' },
  { meet: 'roki' },
  { say: 'roki', f: 'b', t: '大事にしてるランプがな、急に光らなくなってな。直してくれないか' },
  { get: 'lamp' },
  { say: 'shiki', t: '奥の部屋の作業台で見てごらん。道具はひと通りそろっているから' },
  { say: 'roki', t: '頼んだぞ。……壊すなよ' },
  { hide: 'roki' },
  { accept: 'q3' }, { memo: ['q3', 'ロキさんから、光らなくなったランプの修理を頼まれた'] },
  { obj: '奥の部屋の作業台でランプを調べよう', at: 'backroom' },
];
SCENES.q3_inspect = [
  { card: 'card_lamp', t: 'ロキのランプ' },
  { n: 'ふたを開けてみると、芯が黒く傷んでいる。これでは光らないはずだ。' },
  { show: 'shiki', at: 'c' },
  { say: 'shiki', t: 'ああ、芯だね。古い布切れと、光る石がひとつあれば、また灯るよ' },
  { say: 'shiki', f: 'b', t: '布ならハナさんが持っているはずだ。石は……広場の噴水のあたりに、よく転がっている' },
  { stage: ['q3', 2] },
  { memo: ['q3', '芯が傷んでいた。古い布切れと光る石を集めることに'] },
  checkQ3,
];
SCENES.q3_wait = [{ n: '芯を替えるには、古い布切れと光る石が要る。' }, checkQ3];
SCENES.q3_cloth = [
  { say: 'hero', t: 'ハナさん、古い布切れってありませんか？' },
  { say: 'hana', t: '古い布？ あるわよ。……急いでるの？' },
  { choice: [
    { t: '「急いでいます」', do: [{ say: 'hana', f: 'a', t: 'はいはい、じゃあこれ。気をつけてね' }] },
    { t: '「いえ、ゆっくりで大丈夫です」', do: [
      { say: 'hana', f: 'a', t: 'そう？ じゃあ、ちょっと聞いてちょうだい' },
      { say: 'hana', t: 'この布はね、昔、花を包むのに使っていたの。春は桜色、夏は空色……季節ごとに替えてね' },
      { say: 'hana', t: 'ロキったら「どれも同じ布だろ」なんて言うのよ。全然ちがうのに' },
      { say: 'hana', f: 'b', t: '……あら、ごめんなさい。話が長くなっちゃったわ。はい、どうぞ' },
      { aff: { hana: 1 } },
    ] },
  ] },
  { get: 'nuno' },
  checkQ3,
];
SCENES.q3_stone = S => [
  { n: '噴水の底で、小石がひとつ、ほのかに光っている。' },
  { n: '袖をまくって手を伸ばす。……つめたい！' },
  { get: 'ishi' },
  checkQ3,
];
SCENES.q3_fix = [
  { bench: { title: 'ランプの芯を替える', img: 'card_lamp', needs: ['nuno', 'ishi'] } },
  { take: 'nuno' }, { take: 'ishi' },
  { n: '傷んだ芯を外して、布を細く撚る。光る石を台座にはめこむと――' },
  { se: 'magic' },
  { n: 'ランプの奥で、小さな光がまたたいた。' },
  { say: 'hero', f: 'c', t: '（最後に、光り方を整えられそう）' },
  { choice: [
    { t: '強く光るようにする', do: [{ set: { lampStyle: 'strong' } }, { n: 'ランプは、昼間でもはっきりわかる明るさになった。' }, { memo: ['q3', 'ランプは強く光るように仕上げた'] }] },
    { t: '優しく光るようにする', do: [{ set: { lampStyle: 'soft' } }, { n: 'ランプは、影をあまり作らない、柔らかな光になった。' }, { memo: ['q3', 'ランプは優しく光るように仕上げた'] }] },
    { t: '光り方は変えない', do: [{ set: { lampStyle: 'plain' } }, { n: '元通りの、控えめで安定した光。' }, { memo: ['q3', 'ランプは元通りの光り方にした'] }] },
  ] },
  { stage: ['q3', 3] },
  { obj: '雑貨屋のロキにランプを届けよう', at: 'zakka' },
];
SCENES.q3_return = S => [
  S.time === 3 ? { n: '店じまいした雑貨屋の前で、ロキが煙管をくゆらせていた。' } : null,
  { show: 'roki', at: 'c' },
  { say: 'hero', f: 'a', t: 'ロキさん、ランプ直りました！' },
  { take: 'lamp' },
  { n: 'ロキはランプを受け取ると、黙って灯をともした。' },
  S.f.lampStyle === 'strong' ? { say: 'roki', f: 'a', t: 'おお、しっかり光るじゃねえか。店先に置くのにちょうどいい' }
    : S.f.lampStyle === 'soft' ? { say: 'roki', t: '……悪くないな。こっちのほうが、昔の感じに近いかもな' }
      : { say: 'roki', t: '無難だな。まあ、間違っちゃいねえ' },
  S.f.lampStyle === 'soft' ? { aff: { roki: 1 } } : null,
  { say: 'roki', t: '礼だ。これ、持っていけ' },
  { get: 'dougubako' }, { set: { toolbox: true } },
  { say: 'roki', t: '道具箱だ。材料を拾うとき、ついでにもう少し持って帰れる' },
  { hide: 'roki' },
  { note: ['roki', 'ランプを直したお礼に、道具箱をくれた'] },
  { stage: ['q3', 4] },
  { obj: 'ほしやに戻って報告しよう', at: 'shop' },
];
SCENES.q3_report = [
  { say: 'shiki', t: 'おかえり。ロキは喜んでいたかい' },
  { say: 'hero', f: 'a', t: 'お礼に、道具箱をもらいました' },
  { say: 'shiki', f: 'a', t: 'ほう。ロキが物をくれるのは、気に入った相手だけだよ。……たぶんね' },
  { stage: ['q3', DONE] }, { obj: '' }, { time: '+1' },
  { go: 'after_quest' },
];

/* ============ 依頼4：朝のパンが足りない ============ */
QUESTS.push({
  id: 'q4', no: 4, title: '朝のパンが足りない', client: 'mil', tag: '朝',
  summary: 'お客さんが多くて、小麦粉が足りなくなりそう',
  paper: 'おはようございます！ 小麦粉が足りなくなりそうです！ 朝のうちに助けてください！\n――パン屋　ミル',
  unlock: S => done('q1'), start: 'q4_start',
  when: S => S.time === 0 ? { ok: true } : { ok: false, note: '「朝のうちに」と書いてある。明日の朝に受けよう' },
  hint: S => ({
    1: S.time === 3 ? 'ロキの店はもう閉まっているね。明日の朝いちばんに行くといい' : 'ロキの雑貨屋は広場の西だよ',
    2: 'パン屋は広場の南。いい匂いがするから、すぐわかる',
  }[stage('q4')] || 'ゆっくりでいいよ'),
});
HOOKS.push({
  npcs(loc, S, list) { if (loc === 'zakka' && stage('q4') === 1) return talkFor(list, 'roki', 'q4_ask'); },
  enter(loc, S) {
    if (loc === 'zakka' && stage('q4') === 1 && S.time < 3) return 'q4_ask';
    if (loc === 'pan' && stage('q4') === 2) return 'q4_deliver';
    if (loc === 'shop' && stage('q4') === 3) return 'q4_report';
  },
});
SCENES.q4_start = [
  { se: 'door' },
  { n: '朝いちばん。丸い顔の男の人が、粉まみれのエプロンのまま駆けこんできた。' },
  { show: 'shiki', at: 'l' }, { show: 'mil', at: 'r' },
  { say: 'mil', f: 'a', t: 'おはよう！ パン屋のミルです！' },
  { meet: 'mil' },
  { say: 'mil', t: '今日は朝からお客さんが多くて、材料が足りなくなりそうなんだ。小麦粉を少し分けてもらえないかな？' },
  { say: 'shiki', t: 'うちには小麦粉はないねえ。……ロキのところなら、あるかもしれない' },
  { say: 'mil', f: 'a', t: 'ほんと！？ じゃあ、お願い！ ぼくは窯の番があるから！' },
  { hide: 'mil' },
  { accept: 'q4' }, { memo: ['q4', 'ミルさんから、小麦粉を分けてほしいと頼まれた'] },
  { obj: '雑貨屋のロキに、小麦粉がないか聞こう', at: 'zakka' },
];
SCENES.q4_ask = [
  { show: 'roki', at: 'c' },
  { say: 'hero', t: 'ロキさん、小麦粉ってありますか？ パン屋さんが困ってて' },
  { say: 'roki', t: '小麦粉？ 奥に少しある' },
  { say: 'roki', f: 'b', t: '……代わりに、棚の整理を手伝ってくれ。散らかってて、どこに何があるかわからねえ' },
  { n: '店の奥の棚には、箱や瓶がぎっしり詰まっている。' },
  { choice: [
    { t: '丁寧に整理する', do: [
      { n: 'ラベルを確かめながら、ひとつずつ並べ直していく。少し時間がかかった。' },
      { say: 'roki', t: '……気を遣う奴だな。まあ、助かる' },
      { aff: { roki: 1 } }, { set: { q4style: 'careful' } }, { memo: ['q4', 'ロキさんの棚を丁寧に整理した'] },
      { get: 'komugi' },
      { say: 'roki', f: 'a', t: 'ついでにこれも持っていけ' },
      { get: 'herb' },
    ] },
    { t: '手早く済ませる', do: [
      { n: '同じ種類の物をざっくりまとめて、手早く片づけた。' },
      { say: 'roki', f: 'a', t: '要領はいいな。いいぜ、持っていけ' },
      { set: { q4style: 'quick' } }, { memo: ['q4', 'ロキさんの棚を手早く片づけた'] },
      { get: 'komugi' },
    ] },
    { t: '「棚、少し傾いてませんか？」と指摘する', do: [
      { say: 'hero', f: 'c', t: 'あの……この棚、少し傾いてませんか？' },
      { say: 'roki', f: 'b', t: '……気づけたか。目がいいな' },
      { n: 'ロキと一緒に、棚の脚に木っ端をかませて補強した。' },
      { aff: { roki: 1 } }, { set: { q4style: 'notice', noticedShelf: true } }, { memo: ['q4', '棚の傾きに気づいて、ロキさんと補強した'] },
      { get: 'komugi' },
    ] },
  ] },
  { stage: ['q4', 2] },
  { obj: 'パン屋に小麦粉を届けよう', at: 'pan' },
];
SCENES.q4_deliver = S => [
  { show: 'mil', at: 'c' },
  { say: 'hero', f: 'a', t: 'ミルさん、小麦粉もらってきました！' },
  { take: 'komugi' },
  S.f.q4style === 'careful' ? { say: 'mil', f: 'a', t: 'ありがとう！ 気が利くね、袋の口まできっちり縛ってある！' }
    : S.f.q4style === 'quick' ? { say: 'mil', f: 'a', t: '早い！ 助かったよ！' }
      : { say: 'mil', f: 'a', t: 'ありがとう！ 助かったよ！' },
  { say: 'coco', t: 'あなた、ちゃんとお礼は言ったの？……ほしやさん、ありがとう。わたしはココ' },
  { meet: 'coco' },
  { say: 'mil', f: 'a', t: '焼きたて、持っていって！' },
  { get: 'pan', num: 2 },
  { say: 'mil', t: 'また何かあったら頼むね' },
  { hide: 'mil' },
  { stage: ['q4', 3] },
  { obj: 'ほしやに戻って報告しよう', at: 'shop' },
];
SCENES.q4_report = [
  { say: 'shiki', f: 'a', t: 'おかえり。……いい匂いがするね' },
  { say: 'hero', f: 'a', t: '焼きたてパンをもらいました。ひと休みのときに、一緒に食べましょう' },
  { say: 'shiki', f: 'a', t: 'それは楽しみだ' },
  { stage: ['q4', DONE] }, { obj: '' }, { time: '+1' },
  { toast: 'もらったパンは「☕ ひと休み」で食べられます' },
  { go: 'after_quest' },
];

/* ============ 依頼5：夜中の変な音 ============ */
QUESTS.push({
  id: 'q5', no: 5, title: '夜中の変な音', client: 'coco', tag: '夕方から',
  summary: '夜中に、店の地下室から変な音がする',
  paper: '夜中に、地下室から音がするんです。こわくて見に行けません。\n――パン屋　ココ',
  unlock: S => done('q4'), start: 'q5_start',
  when: S => S.time >= 2 ? { ok: true } : { ok: false, note: '夕方以降に、依頼人が来るみたい（「ひと休み」で時間を進められます）' },
  hint: S => ({
    1: S.time < 3 ? '音がするのは夜中だそうだ。ひと休みして、夜を待つといい' : '夜になったね。パン屋の地下室へ行ってごらん。……怖いものじゃないよ',
    2: 'ココさんが待っているよ',
  }[stage('q5')] || 'ゆっくりでいいよ'),
});
HOOKS.push({
  spots(loc, S, list) {
    const st = stage('q5');
    if (loc === 'pan' && st === 1) return spotFor(list, { id: 'q5door', x: 70, y: 55, label: '地下室への扉', scene: 'q5_door' });
    if (loc === 'basement' && st === 1) return [
      { id: 'sack', x: 22, y: 58, label: '粉袋', scene: 'q5_sack' },
      { id: 'bshelf', x: 48, y: 34, label: '古い棚', scene: 'q5_shelf' },
      { id: 'barrel', x: 78, y: 60, label: '奥の樽の陰', scene: 'q5_spirit', key: true },
    ];
  },
  enter(loc, S) {
    if (loc === 'basement' && stage('q5') === 1 && !S.f.q5entered) return 'q5_dark';
    if (loc === 'pan' && stage('q5') === 2) return 'q5_tell';
    if (loc === 'shop' && stage('q5') === 3) return 'q5_report';
  },
});
SCENES.q5_start = S => [
  { se: 'door' },
  { n: '夕暮れ。ドアが控えめに開いて、パン屋のココが顔をのぞかせた。' },
  { show: 'shiki', at: 'l' }, { show: 'coco', at: 'r' },
  { say: 'coco', t: 'こんばんは……少し、相談してもいいですか' },
  { meet: 'coco' },
  { say: 'coco', t: '最近、夜中に店の地下室から変な音がするの。カリ、カリって……' },
  { say: 'coco', t: '怖くて見ていないんだけど……調べてもらえませんか？' },
  { say: 'shiki', t: '音の主は、夜にならないと出てこないだろうね' },
  { say: 'shiki', f: 'b', t: '{name}、夜になったら行ってごらん。怖いものじゃないと思うよ。……たぶんね' },
  { say: 'hero', f: 'd', t: 'たぶん……' },
  { hide: 'coco' },
  { accept: 'q5' }, { memo: ['q5', 'ココさんから、地下室の変な音を調べてほしいと頼まれた'] },
  { obj: '夜になったら、パン屋の地下室を調べよう', at: 'pan' },
  S.time < 3 ? { toast: '「☕ ひと休み」で夜まで時間を進められます' } : null,
];
SCENES.q5_door = S => S.time < 3 ? [
  { n: '地下室への扉。まだ明るいうちは、何の音もしない。' },
  { say: 'hero', t: '（夜になってから来よう）' },
] : [
  { n: 'ココが店の灯りをつけて、待っていてくれた。' },
  { show: 'coco', at: 'c' },
  { say: 'coco', t: '来てくれたのね……地下室は、その扉の下よ。わたしはここで待ってるわ' },
  { say: 'hero', f: 'c', t: '（よし……）' },
  { loc: 'basement' },
];
SCENES.q5_dark = [
  { set: { q5entered: true } },
  { n: 'ひんやりした空気。粉と、古い木の匂いがする。' },
  { n: '……カリ、カリ。奥のほうから、小さな音が聞こえる。' },
  { say: 'hero', f: 'd', t: '（怖くない、怖くない……）' },
];
SCENES.q5_sack = [{ n: '積まれた粉袋。端っこが、少しだけかじられている。' }];
SCENES.q5_shelf = [{ n: '空き瓶がきちんと並んでいる。……音は、もっと奥からだ。' }];
SCENES.q5_spirit = S => [
  { n: '樽の陰を、そっとのぞきこむ。' },
  { show: 'seirei', at: 'c' }, { se: 'magic' },
  { n: '――小さな光の玉が、パンの切れ端を抱えて、カリカリとかじっていた。' },
  { say: 'hero', f: 'b', t: '（せ、精霊……？）' },
  { meet: 'seirei' },
  { choice: [
    { t: '優しく声をかける', do: [
      { say: 'hero', f: 'a', t: '怖い？ 大丈夫だよ' },
      { n: '光の玉は少し驚いたように揺れたあと、ゆっくりと明るくなった。' },
      { say: 'seirei', t: '……パン、すき' },
      { aff: { seirei: 1 } }, { set: { spiritFriendly: true } },
      { memo: ['q5', '精霊にやさしく声をかけた。「パン、すき」と言っていた'] },
    ] },
    { t: '少しパンを分けてあげる', do: [
      has('pan') ? { take: 'pan' } : null,
      { n: has('pan') ? 'かばんの焼きたてパンをちぎって、そっと差し出した。' : '近くに落ちていたパンの切れ端を拾って、そっと差し出した。' },
      { n: '精霊はすぐに飛びついて、あっという間に食べてしまった。' },
      { say: 'seirei', t: '……ありがと' },
      { n: 'ぽうっと光って、精霊は樽の陰に消えていった。' },
      { hide: 'seirei' },
      { aff: { seirei: 1 } }, { set: { gaveBread: true } },
      { memo: ['q5', '精霊にパンを分けてあげた'] },
    ] },
    { t: '静かに見守る', do: [
      { n: '何もせず、しばらく見守ることにした。' },
      { n: '精霊はこちらに気づいているようだったが、逃げずに食べ続けた。' },
      { n: '食べ終わると、ちらりとこちらを見て、すうっと姿を消した。' },
      { hide: 'seirei' },
      { memo: ['q5', '精霊が食べ終わるまで、静かに見守った'] },
    ] },
  ] },
  { say: 'hero', f: 'c', t: '（お腹が空いていただけ、みたい）' },
  { stage: ['q5', 2] },
  { obj: 'ココに報告しよう', at: 'pan' },
  { loc: 'pan' },
];
SCENES.q5_tell = S => [
  { show: 'coco', at: 'c' },
  { say: 'coco', t: 'ど、どうだった……？' },
  { choice: [
    { t: '正直に全部話す', do: [
      { say: 'hero', t: '小さな精霊がいました。お腹が空いて、パンの切れ端を食べてたみたいです' },
      S.f.gaveBread ? { say: 'hero', f: 'a', t: 'パンを分けたら、「ありがと」って' } : S.f.spiritFriendly ? { say: 'hero', f: 'a', t: '「パン、すき」って言ってました' } : null,
      { say: 'coco', f: 'a', t: 'まあ……精霊さんだったの。……優しいのね、あなた' },
      { aff: { pan: 1 } },
    ] },
    { t: '簡潔に話す', do: [
      { say: 'hero', f: 'a', t: '怖いものじゃなかったです。お腹を空かせた、小さな子でした' },
      { say: 'coco', t: 'そう……それなら仕方ないわね' },
    ] },
  ] },
  { say: 'coco', f: 'a', t: 'ありがとう。これ、わたしが焼いたの。よかったら' },
  { get: 'amapan' },
  { say: 'coco', t: 'また困ったことがあったら頼むわね' },
  { hide: 'coco' },
  { note: ['coco', '地下室の精霊のことを相談してきた。甘いパンが得意'] },
  { note: ['seirei', 'パン屋の地下室で、パンの切れ端を食べていた'] },
  { stage: ['q5', 3] },
  { obj: 'ほしやに戻って報告しよう', at: 'shop' },
];
SCENES.q5_report = [
  { say: 'shiki', f: 'a', t: 'おかえり。夜の町はどうだった' },
  { say: 'hero', t: '地下室に、小さな精霊がいました' },
  { say: 'shiki', t: '精霊か。この町には、ときどきそういう子が住み着くんだ。……悪い子はいないよ' },
  { say: 'shiki', f: 'b', t: 'あの子とは、また会うことになるかもしれないね' },
  { stage: ['q5', DONE] }, { obj: '' },
  { go: 'v1_end' },
];
SCENES.v1_end = [
  { say: 'shiki', f: 'a', t: 'これで、町のひと通りの人とは顔見知りだね' },
  { say: 'shiki', t: 'ネコに、手紙に、ランプに、パン。それから精霊。……なかなかの働きぶりだ' },
  { say: 'hero', f: 'a', t: 'えへへ' },
  { say: 'shiki', t: '明日からも、無理のない範囲で頼むよ' },
  { set: { v1end: true } },
  { fade: '― 序盤　おしまい ―' },
  { n: '（ここまでが v1〈序盤〉です。中盤の依頼6〜10は、次の更新で追加されます）' },
  { n: '（このまま町を歩いたり、住人と話したりして過ごすこともできます）' },
  { go: 'after_quest' },
];
