import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { CAPTION_FONT, eio, eout, INK, lerp, Mood, pop, ramp, rnd, ShotDef, Shots, Sfx, Soundtrack, VH, VW, blinkAt } from "./kit";
import { Devil, Grandma, Pipi } from "./characters";
import { LEAD, LINES, VOICE_END } from "./lines";

// pip.mentor - Pipi ep 12 "Captain's Log" (9:16 cartoon scene, no narrator, perfect loop). CLEAN STAGING: Pipi left (devil on his shoulder), the hanging log page in the middle gap, Grandma right.
// Grandma wears the captain's hat from ep 11's ending and reads Pipi's trading journal as her "captain's log". Lesson: it was never the market, it was your own entries (felt lucky, deleted the stop loss, devil said buy).
// Visual payoff: the devil's signature with a little horn on the D appears on the page. Button: "Good. Page one: Grandma was right." (stamp). Shots, mouths, moods and props key off LINES (tools/make_dialogue.py), not frame numbers.
// Line indexes: GRANDMA 0,2,4,6,8,10,12 / PIPI 1,5,9,11 / DEVIL 3,7.
export const FILM_FRAMES = VOICE_END + 80;
const L = LINES;
const at = (i: number, off = 0) => L[Math.min(i, L.length - 1)].start + off;
const ff = (i: number, p: number) => Math.round(L[i].start + p * (L[i].end - L[i].start));

const GROUND = 2240, GREEN = "#1a9a5a", RED = "#d9283b";
const PX = 300, RX = 1200, POOLX = 720, DVX = PX + 115, SY = 1650;
const COL: Record<string, string> = { PIPI: "#8ff5cf", DEVIL: "#ff7a7a", GRANDMA: "#ffc2dd" };
const MP: Mood[] = ["neutral", "happy", "worried", "happy", "worried", "surprised", "worried", "worried", "neutral", "surprised", "sad", "happy", "happy"];
const MD: Mood[] = ["sly", "sly", "sly", "happy", "sly", "worried", "worried", "worried", "sad", "sad", "sad", "sad", "sad"];
const MR: Mood[] = ["sly", "neutral", "sly", "sly", "sly", "neutral", "sly", "neutral", "sly", "neutral", "sly", "neutral", "happy"];
const cur = (g: number) => { let c = 0; for (let i = 0; i < L.length; i++) if (g >= L[i].start - 2) c = i; return c; };
const talking = (g: number, who: string) => { const i = L.findIndex((l) => g >= l.start && g <= l.end); return i >= 0 && L[i].who === who ? 0.25 + 0.75 * rnd(`m${who}${Math.floor(g / 3)}`) : 0; };
const mood = (t: Mood[], g: number): Mood => t[Math.min(cur(g), t.length - 1)];

const T_PAPER = ff(2, 0.24), T_E1 = ff(2, 0.4), T_E2 = ff(4, 0.78), T_E3 = ff(6, 0.72), T_SIGN = ff(8, 0.45), T_CRY = ff(7, 0.85), T_FAINT = L[8].end - 2, T_STAMP = ff(12, 0.45);

const Book: React.FC = () => (
  <g transform="rotate(-8)">
    <rect x={-56} y={-160} width={112} height={150} rx={8} fill="#27386b" stroke={INK} strokeWidth={6} />
    <rect x={-56} y={-160} width={22} height={150} rx={8} fill="#1b2750" stroke={INK} strokeWidth={4} />
    <text x={10} y={-92} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={34} fill="#ffd400">LOG</text>
    <path d="M -20,-62 L 40,-62" stroke="#ffd400" strokeWidth={5} strokeLinecap="round" />
  </g>
);
const Pen: React.FC = () => (
  <g transform="rotate(-20)">
    <rect x={-7} y={-120} width={14} height={110} rx={4} fill="#ffd400" stroke={INK} strokeWidth={4} />
    <path d="M -7,-10 L 7,-10 L 0,14 Z" fill="#f2d6b0" stroke={INK} strokeWidth={3} />
  </g>
);
const Stars: React.FC<{ x: number; y: number; g: number }> = ({ x, y, g }) => (
  <g>{[0, 1, 2].map((k) => { const a = g * 0.3 + k * 2.1; return <path key={k} d="M0,-14 L4,-4 L14,-3 L6,3 L9,13 L0,7 L-9,13 L-6,3 L-14,-3 L-4,-4 Z" fill="#ffd400" stroke={INK} strokeWidth={2} transform={`translate(${x + 62 * Math.cos(a)} ${y + 18 * Math.sin(a)})`} />; })}</g>
);
const Kitchen: React.FC<{ g: number }> = ({ g }) => (
  <g>
    <rect x={-800} y={-1200} width={3040} height={3400} fill="#e9d2a6" />
    {Array.from({ length: 22 }).map((_, i) => <rect key={i} x={i * 120 - 800} y={-1200} width={60} height={3400} fill="#c9a96a" opacity={0.15} />)}
    <rect x={-800} y={GROUND - 30} width={3040} height={1400} fill="#8d6238" />
    <g transform="translate(1180 760)"><circle r={86} fill="#fbfbf8" stroke={INK} strokeWidth={7} /><path d="M0,0 L0,-56" stroke={INK} strokeWidth={6} strokeLinecap="round" transform={`rotate(${g * 0.5})`} /><path d="M0,0 L40,0" stroke={INK} strokeWidth={6} strokeLinecap="round" /></g>
  </g>
);

// the hanging "captain's log" page: drops in during line 3, fills with Pipi's entries as Grandma reads them, gets the devil's horned signature, then the green stamp
const Log: React.FC<{ g: number }> = ({ g }) => {
  if (g < T_PAPER) return null;
  const drop = pop(g, T_PAPER, 16), ext = eio(ramp(g, T_STAMP - 10, T_STAMP + 2));
  const bot = 700 + 700 * drop + 230 * ext, x0 = 510, x1 = 930;
  const edge: string[] = [];
  for (let x = x1; x >= x0; x -= 30) edge.push(`${x},${bot + (Math.round((x - x0) / 30) % 2) * 14}`);
  const rows: [number, string, number][] = [[T_E1, "FELT LUCKY", 980], [T_E2, "NO STOP LOSS", 1090], [T_E3, "DEVIL SAID BUY", 1200]];
  const sg = pop(g, T_SIGN, 10), st = pop(g, T_STAMP, 8);
  return (
    <g>
      <path d={`M${x0},-1200 L${x1},-1200 L${edge.join(" L")} Z`} fill="#fffbea" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      {Array.from({ length: 14 }).map((_, i) => { const y = 930 + i * 55; return y < bot - 30 ? <line key={i} x1={x0 + 14} y1={y} x2={x1 - 14} y2={y} stroke="#9bc4e8" strokeWidth={2} opacity={0.6} /> : null; })}
      <text x={720} y={880} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={34} fill="#8a5a14">CAPTAIN'S LOG</text>
      {rows.map(([t, s, y], i) => {
        const o = ramp(g, t, t + 5), fs = Math.min(38, 354 / (s.length * 0.72));
        return o > 0.01 ? (
          <g key={i} opacity={o} transform={`translate(${-20 * (1 - eout(o))} 0)`}>
            <path d={`M 528,${y - 24} l 22,22 m -22,0 l 22,-22`} stroke={RED} strokeWidth={7} strokeLinecap="round" fill="none" />
            <text x={562} y={y} fontFamily={CAPTION_FONT} fontWeight={800} fontSize={fs} fill="#1b2340">{s}</text>
          </g>
        ) : null;
      })}
      {sg > 0.01 && (
        <g>
          <text x={540} y={1345} fontFamily={CAPTION_FONT} fontWeight={800} fontSize={26} fill="#1b2340">SIGNED:</text>
          <path d="M 676,1352 L 912,1352" stroke="#1b2340" strokeWidth={3} />
          <g transform={`translate(800 1320) scale(${Math.max(0.01, sg)}) translate(-800 -1320)`}>
            <path d="M 690,1294 L 690,1346 Q 742,1346 742,1320 Q 742,1294 690,1294 Z" fill="none" stroke={RED} strokeWidth={8} strokeLinejoin="round" />
            <path d="M 694,1294 L 684,1262 L 710,1288 Z" fill="#8b1220" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
            <path d="M 728,1291 L 742,1262 L 746,1298 Z" fill="#8b1220" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
            <path d="M 752,1328 q 14,-22 26,0 t 26,0 t 26,0 t 26,0" fill="none" stroke={RED} strokeWidth={6} strokeLinecap="round" />
          </g>
        </g>
      )}
      {st > 0.01 && (
        <g transform={`translate(720 1500) rotate(-4) scale(${Math.max(0.01, st)})`}>
          <rect x={-200} y={-48} width={400} height={96} rx={14} fill="#fffbea" stroke={GREEN} strokeWidth={9} />
          <text x={0} y={11} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={30} fill={GREEN}>GRANDMA WAS RIGHT</text>
        </g>
      )}
    </g>
  );
};

const SceneW: React.FC<{ g: number }> = ({ g }) => {
  const c = cur(g), finalLine = c >= L.length - 1, bob = Math.sin(g / 14) * 3, yap = talking(g, "GRANDMA"), gb = Math.sin(g / 12) * 3;
  const cry = ramp(g, T_CRY, T_CRY + 12) * (g < T_FAINT ? 1 : 0);
  const faint = eio(ramp(g, T_FAINT, T_FAINT + 8));
  const writing = c >= 11;
  const look: [number, number] = finalLine ? [0, 0] : c === 3 || c === 7 ? [9, -4] : c === 1 || c === 5 || c === 9 || c === 11 ? [8, 0] : [-8, 0];
  const reading = c === 0 || c === 2 || c === 4 || c === 6 || c === 8;
  return (
    <g>
      <Kitchen g={g} />
      <Log g={g} />
      <Pipi x={PX} y={GROUND} s={2.1} facing={1} mood={mood(MP, g)} talk={talking(g, "PIPI")} blink={blinkAt(g, 2)} look={look} bob={bob} headTilt={finalLine ? 4 : 0}
        sweat={c === 4 || c === 6 ? 0.5 : 0} armR={writing ? 100 : 40} elbowR={writing ? -30 : 0} armL={12 + talking(g, "PIPI") * 16 * Math.sin(g * 0.3)}
        holdR={writing ? <Pen /> : undefined} />
      <g transform={faint > 0.001 ? `rotate(${80 * faint} ${DVX} ${SY + bob})` : undefined}>
        <Devil x={DVX} y={SY + bob} s={0.5} facing={-1} mood={mood(MD, g)} talk={talking(g, "DEVIL")} blink={faint > 0.5 ? 0.04 : blinkAt(g, 8)} look={[8, 0]} cry={cry} bob={Math.sin(g / 7) * 3}
          armR={talking(g, "DEVIL") > 0 ? 100 + 25 * Math.sin(g * 0.45) : 40} armL={14} />
        {faint > 0.1 && <Stars x={DVX} y={SY + bob - 215} g={g} />}
      </g>
      <Grandma x={RX} y={GROUND} s={2.1} facing={-1} mood={mood(MR, g)} talk={yap} blink={blinkAt(g, 9)} look={[8, 0]} bob={gb} headTilt={0}
        armR={reading ? 100 + 6 * Math.sin(g * 0.7) : 58} armL={20 + yap * 45 * Math.sin(g * 0.55)} holdR={<Book />} />
      <g transform={`translate(${RX} ${GROUND - 352 * 2.1 - 118 + gb}) scale(1.1)`}>
        <ellipse cx={0} cy={0} rx={130} ry={22} fill="#1d2a4d" stroke={INK} strokeWidth={7} /><path d="M -92,0 Q -92,-84 0,-90 Q 92,-84 92,0 Z" fill="#fbfbf8" stroke={INK} strokeWidth={7} />
        <rect x={-92} y={-26} width={184} height={22} fill="#1d2a4d" stroke={INK} strokeWidth={5} /><circle cx={0} cy={-48} r={20} fill="#f0b84a" stroke={INK} strokeWidth={5} />
      </g>
    </g>
  );
};

type Cam = [number, number, number];
const CUP: Cam = [PX, 1590, 2.0], CUG: Cam = [RX, 1600, 2.0], CUD: Cam = [DVX - 20, 1530, 4.2], WIDE: Cam = [POOLX, 1700, 1.15], PAPER: Cam = [720, 1250, 1.6], SIG: Cam = [720, 1330, 2.2];
const PLAN: { a: Cam; a2: Cam; split?: number; b?: Cam; b2?: Cam }[] = [
  { a: [RX, 1600, 2.4], a2: [RX, 1600, 2.1] },
  { a: CUP, a2: [PX, 1590, 2.2] },
  { a: [RX, 1600, 2.1], a2: [RX, 1600, 2.3], split: 0.3, b: PAPER, b2: [720, 1250, 1.75] },
  { a: CUD, a2: [DVX - 20, 1530, 4.5] },
  { a: [RX, 1600, 2.1], a2: [RX, 1600, 2.3], split: 0.55, b: PAPER, b2: [720, 1250, 1.75] },
  { a: [PX, 1650, 2.2], a2: [PX, 1650, 2.5] },
  { a: [RX, 1600, 2.1], a2: [RX, 1600, 2.3], split: 0.35, b: PAPER, b2: [720, 1250, 1.75] },
  { a: CUD, a2: [DVX - 20, 1530, 3.8] },
  { a: SIG, a2: [720, 1330, 2.4], split: 0.7, b: CUD, b2: [DVX - 20, 1530, 3.8] },
  { a: CUP, a2: [PX, 1590, 2.3] },
  { a: [RX, 1600, 2.1], a2: [RX, 1600, 2.3], split: 0.5, b: WIDE, b2: [POOLX, 1700, 1.25] },
  { a: [PX, 1650, 2.2], a2: [PX, 1650, 2.5] },
  { a: [RX, 1600, 2.1], a2: [RX, 1600, 2.0], split: 0.35, b: [720, 1450, 1.5], b2: [720, 1450, 1.7] },
];
const mk = (from: number, to: number, c0: Cam, c1: Cam, shakes: number[] = []): ShotDef => ({
  from, to, z0: 1, z1: 1,
  render: (l, p) => {
    const g = from + l, e = eio(p), cx = lerp(c0[0], c1[0], e), cy = lerp(c0[1], c1[1], e), z = lerp(c0[2], c1[2], e);
    let sx = 0, sy = 0;
    for (const b of shakes) if (g >= b) { const d = Math.exp(-(g - b) / 4) * 20; sx += Math.sin((g - b) * 2.3) * d; sy += Math.cos((g - b) * 3.1) * d * 0.7; }
    return <g transform={`translate(${VW / 2 + sx} ${VH / 2 + sy}) scale(${z}) translate(${-cx} ${-cy})`}><SceneW g={g} /></g>;
  },
});
const SHOTS: ShotDef[] = [];
for (let i = 0; i < L.length; i++) {
  const from = i === 0 ? 0 : L[i].start - 3, to = i === L.length - 1 ? FILM_FRAMES + 1 : L[i + 1].start - 3, pl = PLAN[Math.min(i, PLAN.length - 1)];
  const sh = (i === 0 ? [0] : []).concat([T_FAINT, T_SIGN, T_STAMP].filter((s) => s >= from && s < to));
  if (pl.split && pl.b && pl.b2) { const mid = Math.round(from + (to - from) * pl.split); SHOTS.push(mk(from, mid, pl.a, pl.a2, sh.filter((x) => x < mid)), mk(mid, to, pl.b, pl.b2, sh.filter((x) => x >= mid))); }
  else SHOTS.push(mk(from, to, pl.a, pl.a2, sh));
}

const Subs: React.FC<{ f: number }> = ({ f }) => {
  const i = L.findIndex((l) => f >= l.start - 2 && f <= l.end + 6);
  if (i < 0) return null;
  const l = L[i], words = l.text.split(" "), chunks: string[] = [];
  for (let k = 0; k < words.length; k += 4) chunks.push(words.slice(k, k + 4).join(" "));
  let acc = 0, show = chunks[chunks.length - 1];
  for (const c of chunks) { acc += c.length; if ((f - l.start) / Math.max(1, l.end - l.start) <= acc / l.text.length) { show = c; break; } }
  return <div style={{ position: "absolute", left: 80, right: 80, top: 1690, textAlign: "center", fontFamily: CAPTION_FONT, fontWeight: 800, fontSize: 92, lineHeight: 1.1, color: COL[l.who] ?? "#fff", WebkitTextStroke: "14px #0a0d1a", paintOrder: "stroke fill", textTransform: "uppercase" }}>{show}</div>;
};
const Stamp: React.FC<{ f: number }> = ({ f }) => {
  const t0 = at(L.length - 1, 0);
  if (f < t0) return null;
  const k = 1 + 0.6 * (1 - eout(ramp(f, t0, t0 + 10))), sh = Math.exp(-(f - t0) / 4) * 14 * Math.sin((f - t0) * 2.3);
  return <div style={{ position: "absolute", left: 0, right: 0, top: 330 + sh, textAlign: "center", transform: `rotate(-5deg) scale(${k})`, fontFamily: CAPTION_FONT, fontWeight: 800, fontSize: 250, color: "#ffd400", WebkitTextStroke: "16px #0a0d1a", paintOrder: "stroke fill" }}>EP 12</div>;
};

const SFX: Sfx[] = [
  [at(0, 0), "sfx_whoosh", 0.35], [at(0, 4), "sfx_click", 0.3],
  [T_PAPER, "sfx_whoosh", 0.45], [T_PAPER + 12, "sfx_thump", 0.3], [T_E1, "sfx_tap", 0.4], [L[2].end + 1, "sfx_burn", 0.6], [L[2].end + 8, "sfx_rimshot", 0.35],
  [T_E2, "sfx_tap", 0.4], [L[4].end + 1, "sfx_burn", 0.65], [T_E3, "sfx_tap", 0.4],
  [T_CRY, "sfx_sad", 0.4], [T_SIGN, "sfx_pop", 0.5], [T_SIGN + 3, "sfx_thump", 0.4], [T_FAINT, "sfx_faint", 0.7],
  [L[10].end + 2, "sfx_rimshot", 0.4], [at(11, 20), "sfx_tap", 0.35],
  [at(12, 0), "sfx_thump", 0.6], [T_STAMP, "sfx_thump", 0.55], [T_STAMP + 3, "sfx_ding", 0.4],
];

const Frame: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: "#0e1329" }}>
    <Shots f={f} shots={SHOTS} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)" }} />
    <AbsoluteFill style={{ background: "#ff2d3d", opacity: 0.5 * (1 - ramp(f, 0, 10)) }} />
    <AbsoluteFill style={{ background: "#fff", opacity: 0.8 * (1 - ramp(f, 0, 5)) }} />
    <Subs f={f} />
    <Stamp f={f} />
  </AbsoluteFill>
);

export const Film: React.FC = () => {
  const f = useCurrentFrame();
  const back = ramp(f, FILM_FRAMES - 16, FILM_FRAMES - 2); // 0 -> 1: last frame == first frame
  return (
    <AbsoluteFill style={{ background: "#0e1329" }}>
      <Frame f={f} />
      {back > 0 && <AbsoluteFill style={{ opacity: back }}><Frame f={0} /></AbsoluteFill>}
      <Soundtrack total={FILM_FRAMES} voice={staticFile("projects/pipi-ep12-captains-log/narration.mp3")} voiceAt={LEAD} voiceEnd={VOICE_END} music="music_pad" musicLen={1800} amb="amb_night" ambVol={0.2} sfx={SFX} />
    </AbsoluteFill>
  );
};
