/* 魔法の町のなんでも屋 ― 依頼15・エンディング・エピローグ・結末アルバム
 * 元資料：「終盤分岐」（依頼15）「エンディング」「エピローグ」
 * どの結末も「正解」にしない。最後のカットは町の日常か店の明かりで締める。
 */
'use strict';

const ENDINGS = {
  A: { title: 'このまま店を続ける', last: 'ただ、店の明かりが、以前より少し長く灯っている気がした。' },
  B: { title: 'もう少し町を見て回ってから決める', last: 'それでも、足は自然と店の方へ向いていた。' },
  C: { title: '別の場所へ行ってみたくなった', last: '「また、いつか」' },
  D: { title: '特に何も決めず、今まで通りにする', last: '店の中に、茶の香りがゆっくりと広がっていく。' },
};
// クレジット（原案の表記はここを書きかえる）
const CREDITS = [
  ['原案・シナリオ資料・イラスト', 'yma3mama-tech'],
  ['ゲーム制作', 'Claude'],
];

let endSnap = null; // 依頼15で答える直前の状態（エンディングのあと、ここから選び直せる）

/* ============ 依頼15：最後の確認 ============ */
QUESTS.push({
  id: 'q15', no: 15, title: '最後の確認', client: 'shiki',
  summary: '「これからどうするつもりだい？」',
  unlock: () => false, start: 'q15_talk',
  hint: S => 'ゆっくりでいいよ。……答えは、いつでもいいんだ',
});
HOOKS.push({
  morningPre(S) {
    if (S.f.festivalDone && !S.q.q15) return [{ accept: 'q15' }, { go: 'q15_talk' }];
  },
  enter(loc, S) {
    if (loc === 'shop' && S.f.festivalDone && !S.q.q15 && !S.active) return 'q15_start';
    if (loc === 'shop' && stage('q15') === 1) return 'q15_talk';
  },
});
SCENES.q15_start = [{ accept: 'q15' }, { go: 'q15_talk' }];

function q15Memories(S) {
  const m = [];
  m.push({ say: 'shiki', f: 'a', t: '最初の日、チビを木から降ろしてくれたね' });
  if (S.f.catLover) m.push({ say: 'shiki', t: '声をかけただけで降りてきたって、ハナさんがずいぶん自慢していたよ' });
  else if (S.f.chibiVisits) m.push({ say: 'shiki', t: 'あれから、チビがうちに入りびたりだ' });
  else m.push({ say: 'shiki', t: '少しびっくりさせたって、ハナさんが笑っていたよ' });
  if (S.f.lampStyle === 'soft') m.push({ say: 'shiki', t: 'ロキのランプは、今も夜になると昔の色で灯っている' });
  else if (S.f.lampStyle === 'strong') m.push({ say: 'shiki', t: 'ロキの店先のランプは、今じゃ町の目印だ' });
  if (S.f.spiritHome === 'shop') m.push({ say: 'shiki', f: 'b', t: '奥の部屋には、小さな同居人も増えたしね' });
  else if (S.f.spiritHome === 'hana') m.push({ say: 'shiki', t: 'ハナさんの物置の精霊も、すっかり庭の一員だ' });
  else if (S.f.spiritHome === 'view') m.push({ say: 'shiki', t: '見晴らし台の精霊は、夜になるとホタルさんと話しているらしい' });
  if (S.f.kidFriend) m.push({ say: 'shiki', f: 'a', t: '笛を借りていたあの子、今じゃすっかり、ほしやの常連さんだ' });
  if (S.f.hotaruNear) m.push({ say: 'shiki', t: 'ホタルさんが祭りに来るなんて、何年ぶりだろう' });
  if (S.f.signStyle === 'name') m.push({ say: 'shiki', f: 'a', t: '看板には、君の名前もある' });
  if (wishesDone(S) === 5) m.push({ say: 'shiki', t: '町のみんなの願いを、全部聞いてくれた' });
  const c = S.f.shikiConsult || 0;
  if (c >= 2) m.push({ say: 'shiki', f: 'b', t: '……それに、君はよく相談してくれた。実はね、それが一番うれしかったんだ' });
  else if (c === 1) m.push({ say: 'shiki', f: 'b', t: '一度、大事なことを相談してくれたね。……覚えているよ' });
  return m;
}
SCENES.q15_talk = S => [
  { n: '祭りが終わった、次の朝。' },
  { show: 'shiki', at: 'c' },
  { n: 'シキが、いつもより少しだけゆっくりと、お茶を淹れていた。' },
  { say: 'shiki', t: 'おはよう。……ゆうべは、いい祭りだったね' },
  { say: 'shiki', f: 'a', t: 'ここまで、よくやってくれたね' },
  ...q15Memories(S),
  { say: 'shiki', t: '……さて' },
  { say: 'shiki', t: 'もう一人前だと思うけど。これから、どうするつもりだい？' },
  S => { endSnap = JSON.parse(JSON.stringify(S)); },
  { choice: [
    { t: 'このまま店を続ける', go: 'end_A' },
    { t: 'もう少し町を見て回ってから決める', go: 'end_B' },
    { t: '別の場所へ行ってみたくなった', go: 'end_C' },
    { t: '特に何も決めず、今まで通りにする', go: 'end_D' },
  ] },
];

/* ============ エンディングA：このまま店を続ける ============ */
SCENES.end_A = S => [
  { say: 'shiki', f: 'b', t: '……そうか。続けてくれるんだね' },
  { n: 'うなずくと、シキは小さく笑って、湯のみを差し出した。' },
  { n: '窓から朝の光が差しこんで、店の中がいつもより少し明るく感じられる。' },
  { hide: 'shiki' },
  { fade: true, then: S => { S.time = 1; } },
  { show: 'hana', at: 'c' },
  { n: 'その日の午後。ハナが、花を抱えて顔を出した。' },
  { say: 'hana', f: 'a', t: '看板、新しくなったわね。これから、よろしくね' },
  S.f.signStyle === 'name' ? { say: 'hana', t: '店員さん、じゃなくて……もう「ほしやの{name}ちゃん」ね' } : null,
  { hide: 'hana' },
  { fade: true, then: S => { S.time = 2; } },
  { se: 'meow' },
  { n: '夕方には、チビが窓から入ってきて、いつもの場所に丸くなった。' },
  { show: 'shiki', at: 'c' },
  { say: 'shiki', t: '明日の依頼、少し多いかもしれないよ' },
  S.f.yourShop ? { say: 'shiki', f: 'a', t: '……まあ、君の店でもあるからね。のんびりいこう' } : null,
  { say: 'hero', f: 'a', t: 'わかりました' },
  { hide: 'shiki' },
  { card: 'bg_exterior', t: '入口に掛かる、新しい看板' },
  { n: '夕暮れの町が、ゆっくりと、いつもの夜に変わっていく。' },
  { n: '何も劇的には変わらない。ただ「ここにいること」が、自然になった。' },
  { go: 'epi_A' },
];
SCENES.epi_A = S => [
  { fade: '十日ほど後', then: S => { S.time = 0; } },
  { show: 'hana', at: 'c' },
  { n: '新しい看板が掛かってから、十日ほど経った朝。ハナが、いつものように花を持って顔を出す。' },
  { say: 'hana', f: 'a', t: '最近、依頼の紙が増えたみたいね' },
  { hide: 'hana' },
  { n: 'カウンターの箱をのぞくと、確かに以前より少しだけ紙が多い。' },
  { show: 'shiki', at: 'c' },
  { say: 'shiki', t: 'まあ、慌てることはないよ' },
  { hide: 'shiki' },
  { se: 'meow' },
  { n: '午後、チビが窓から入ってきて、作業台の隅で丸くなる。近づくと、いつもより少しだけ長く喉を鳴らした。' },
  { fade: true, then: S => { S.time = 2; S.loc = 'saka'; } },
  { show: 'tsubaki', at: 'c' },
  { n: '夕方、店を出ると、坂道の向こうでツバキが手を振っているのが見えた。' },
  { say: 'tsubaki', f: 'a', t: '明日も、よろしくお願いします' },
  { hide: 'tsubaki' },
  { n: '特に何も変わっていない。' },
  { n: ENDINGS.A.last },
  { go: 'end_finish_A' },
];

/* ============ エンディングB：もう少し町を見て回ってから決める ============ */
SCENES.end_B = [
  { say: 'shiki', f: 'a', t: 'そうか。焦ることはないよ。町は逃げないから' },
  { hide: 'shiki' },
  { n: 'それから数日、依頼は受けずに、町を歩いた。' },
  { fade: true, then: S => { S.loc = 'hana'; S.time = 0; } },
  { show: 'hana', at: 'c' },
  { say: 'hana', f: 'a', t: 'あら、今日はお仕事じゃないの？ じゃあ、ゆっくりしていきなさい' },
  { hide: 'hana' },
  { fade: true, then: S => { S.loc = 'pan'; S.time = 1; } },
  { show: 'mil', at: 'c' },
  { say: 'mil', f: 'a', t: '焼きたて、食べていきなよ！ お代？ いいのいいの！' },
  { hide: 'mil' },
  { fade: true, then: S => { S.loc = 'view'; S.time = 3; } },
  { n: '夜の見晴らし台。誰もいないのに、隣に誰かが座っているような気配がした。' },
  { fade: true, then: S => { S.loc = 'plaza'; S.time = 2; } },
  { n: 'ある夕方。中央広場のベンチに座っていると、ツバキが配達の帰りに立ち寄った。' },
  { show: 'tsubaki', at: 'c' },
  { say: 'tsubaki', t: '最近、店の前を通ると、なんだか落ち着きます' },
  { n: '何も答えないでいると、後ろから声がした。' },
  { hide: 'tsubaki' },
  { show: 'shiki', at: 'c' },
  { say: 'shiki', f: 'a', t: '戻ってきたら、お茶にするよ' },
  { hide: 'shiki' },
  { time: 3 },
  { n: '夕暮れの広場の向こうに、ほしやの明かりが小さく灯った。' },
  { go: 'epi_B' },
];
SCENES.epi_B = [
  { fade: '一週間後', then: S => { S.loc = 'view'; S.time = 1; } },
  { n: '決めないまま、一週間が過ぎた。' },
  { n: 'ある午後、見晴らし台のベンチに座っていると、ホタルがそっと現れる。' },
  { show: 'hotaru', at: 'c' },
  { say: 'hotaru', f: 'a', t: '焦らなくても、町は逃げない' },
  { hide: 'hotaru' },
  { n: '短い言葉を残して、姿を消す。' },
  { fade: true, then: S => { S.loc = 'pan'; S.time = 2; } },
  { show: 'coco', at: 'c' },
  { n: 'その帰り、パン屋の前を通ると、ココが手を振って呼び止めた。' },
  { say: 'coco', f: 'a', t: 'よかったら、焼きたてを一つ' },
  { n: '受け取る手に、まだ熱いパンが載る。' },
  { hide: 'coco' },
  { n: 'ほしやの方を見ると、窓からシキがこちらを見ているのに気づいた。手を振ると、シキも小さく手を挙げて、すぐに窓からいなくなった。' },
  { n: '「戻る」と決めたわけではない。' },
  { n: ENDINGS.B.last },
  { go: 'end_finish_B' },
];

/* ============ エンディングC：別の場所へ行ってみたくなった ============ */
SCENES.end_C = S => [
  { say: 'shiki', t: '……そうか' },
  { n: 'シキは引き止めなかった。ただ、いつもより少し長く、お茶を淹れていた。' },
  { hide: 'shiki' },
  { fade: '出発の朝', then: S => { S.loc = 'plaza'; S.time = 0; } },
  { n: '中央広場に、町の人たちが見送りに来てくれた。' },
  { show: 'hana', at: 'l' }, { show: 'roki', at: 'r' },
  { say: 'hana', f: 'a', t: '道中、さびしくないようにね' },
  { get: 'hanataba' },
  { say: 'roki', t: '路用だ。持っていけ' },
  { n: 'ロキが、小さな道具をひとつ、手に押しつけてきた。' },
  { hide: 'hana' }, { hide: 'roki' },
  { show: 'coco', at: 'l' }, { show: 'suzu', at: 'r' },
  { say: 'coco', f: 'a', t: 'お腹がすいたら、食べてね' },
  { get: 'pan' },
  { n: 'スズは、小さな鈴をひとつ渡して、それだけ言った。' },
  { say: 'suzu', t: '音が聞こえたら、思い出してください' },
  { hide: 'coco' }, { hide: 'suzu' },
  { n: '見送りの人たちに軽く手を振って、坂道を下りはじめる。' },
  { fade: true, then: S => { S.loc = 'saka'; } },
  { n: '振り返ると、ほしやの看板が朝日に照らされて見えた。' },
  { n: 'シキの声が、風に乗って聞こえる。' },
  { say: 'shiki', t: 'また、いつでも顔を出していいからね' },
  { n: '町を離れていく道の先に、遠く、ひなたまちの屋根並みが小さく見えていた。' },
  { go: 'epi_C' },
];
SCENES.epi_C = [
  { fade: '十日ほど後', then: S => { sceneBg = 'black'; } },
  { n: '町を出て、十日ほど経った頃。別の土地の小さな宿で、窓の外を見ていた。' },
  { n: '荷物の中で、ハナが持たせてくれた花は、もう枯れている。' },
  { n: 'それでも、パンの包み紙に書かれたココの字や、スズがくれた小さな鈴は残っていた。' },
  { n: '夜、宿の窓を開けると、遠くから風が吹いてきた。' },
  { se: 'flute' },
  { n: 'その風に乗って、ほんのかすかに、笛の音が聞こえた気がした。' },
  { n: '錯覚かもしれない。それでも、小さく笑って、鈴を一度振ってみた。' },
  { se: 'bell' },
  { n: ENDINGS.C.last },
  { n: 'その言葉は、誰に向けたものでもなかった。' },
  { go: 'end_finish_C' },
];

/* ============ エンディングD：特に何も決めず、今まで通りにする ============ */
SCENES.end_D = S => [
  { say: 'shiki', f: 'a', t: '……うん。それもいいね' },
  { n: '特に何かを宣言するでもなく、二人はいつものように店を開けた。' },
  { hide: 'shiki' },
  { fade: true, then: S => { S.time = 1; } },
  { n: '午前中はハナの依頼を受け、午後はツバキが荷物を届けに来た。' },
  { fade: true, then: S => { S.time = 2; } },
  { se: 'meow' },
  { n: '夕方には、チビが窓辺で眠っている。' },
  { fade: true, then: S => { S.time = 3; } },
  { show: 'shiki', at: 'c' },
  { n: '夜になって、シキがふと口を開いた。' },
  { say: 'shiki', t: '君が来てから、店の空気が少し変わったよ。悪い意味じゃない' },
  S.f.yourShop ? { say: 'shiki', f: 'a', t: '……なにしろ、君の店でもあるんだから' } : null,
  { n: '何も答えないでいると、シキはお茶をすすりながら続けた。' },
  { say: 'shiki', f: 'b', t: 'このままで、十分だと思う' },
  { hide: 'shiki' },
  { n: 'ランプの明かりに照らされた店の外を、静かな夜道がのびていた。' },
  { go: 'epi_D' },
];
SCENES.epi_D = S => [
  { fade: '二週間後', then: S => { S.time = 0; } },
  { show: 'shiki', at: 'c' },
  { n: '祭りから二週間が過ぎた、いつもの朝。シキが帳簿を開きながら言う。' },
  { say: 'shiki', t: '今日は依頼が三つか。少なければ、午後は休んでもいい' },
  { se: 'door' },
  { show: 'shiki', at: 'l' }, { show: 'roki', at: 'r' },
  { n: '返事をする前に、ドアが開いてロキが入ってきた。' },
  { say: 'roki', t: '棚の件、もう一つ直したいものがある。材料、分けてくれ' },
  { say: 'hero', f: 'a', t: 'いいですよ' },
  { say: 'roki', t: '恩に着る' },
  { hide: 'roki' },
  { se: 'meow' },
  { n: 'その直後、窓の外でチビが鳴く。' },
  S.f.w_hana ? { se: 'bell' } : null,
  { n: S.f.w_hana ? 'ハナの庭の方から、風鈴の音が聞こえてくる。' : 'ハナの庭の方から、木の葉がさらさらと鳴る音が聞こえてくる。' },
  { n: '何も決まっていない。決める必要も、なかった。' },
  { n: ENDINGS.D.last },
  { go: 'end_finish_D' },
];

/* ============ おしまい（アルバムに残して、タイトルへ） ============ */
['A', 'B', 'C', 'D'].forEach(k => {
  SCENES['end_finish_' + k] = [
    { hide: 'shiki' },
    S => { sceneBg = 'black'; renderBg(); },
    S => {
      const album = fetchStore(ALBUM_KEY) || [];
      if (!album.includes(k)) album.push(k);
      store(ALBUM_KEY, album);
    },
    { se: 'night' },
    S => popup(`<div class="ds">エンディング${k}</div><div class="nm">${esc(ENDINGS[k].title)}</div>`, 'ending'),
    { go: 'credits' },
  ];
});
SCENES.credits = [
  S => popup(`<div class="credits"><h3>魔法の町のなんでも屋</h3>${CREDITS.map(([a, b]) => `<div>${esc(a)}<br><b>${esc(b)}</b></div>`).join('<br>')}<br><div>遊んでくれて、ありがとう。</div><div style="font-size:12px;opacity:.75;margin-top:8px">「つづきから」で、シキの問いかけの前から<br>別の答えを選び直せます</div></div>`, 'ending'),
  () => {
    // セーブは「依頼15で答える直前」に戻しておく（別の結末も見られるように）
    if (endSnap) S = endSnap;
    S.f.cleared = true;
    store(SAVE_KEY, S);
    setTimeout(() => { showTitle(); }, 30);
  },
];

/* ============ 結末アルバム ============ */
function openAlbum() {
  const album = fetchStore(ALBUM_KEY) || [];
  const html = '<h2>📜 結末アルバム</h2><div class="album">' + ['A', 'B', 'C', 'D'].map(k => album.includes(k)
    ? `<div class="end"><b>エンディング${k}　${esc(ENDINGS[k].title)}</b><span>${esc(ENDINGS[k].last)}</span></div>`
    : `<div class="end no"><b>エンディング${k}　？？？</b><span>まだ見ていない結末</span></div>`).join('') +
    `</div><p class="empty">見た結末：${album.length} / 4<br>「つづきから」で、シキの問いかけの前から選び直せます</p>`;
  openModal(html);
}
