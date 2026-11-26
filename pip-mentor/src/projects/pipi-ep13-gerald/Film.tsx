import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { CAPTION_FONT, eio, eout, INK, keys, lerp, Mood, ramp, rnd, ShotDef, Shots, Sfx, Soundtrack, VH, VW, blinkAt, pop } from "./kit";
import { Devil, Grandma, Pipi } from "./characters";
import { LEAD, LINES, VOICE_END } from "./lines";

// pip.mentor - Pipi ep 13 "Gerald" (9:16 cartoon scene, no narrator, perfect loop).
// Pain: holding a loser and averaging down. Pipi adopted a LOSING TRADE as a pet dog (loss on his collar tag). The DEVIL is no longer on a shoulder: he is a free-standing pet-food
// salesman who drops onto Gerald's head and RIDES him while pushing "AVERAGE DOWN" kibble. Three escalating beats: a toothbrush in Grandma's bathroom -> a zoo -> the size of a bus, "and he's still down".
// Physical payoff: Gerald pops into a coin, the toothbrush clatters down, the devil falls off and resigns. Button: "Gerald cost two dollars. His snacks cost eight."
// Line indexes: GRANDMA 0,2,5,8,11 / PIPI 1,4,7,9,12 / DEVIL 3,6,10. Everything keys off LINES, not frame numbers.
export const FILM_FRAMES = VOICE_END + 80;
const L = LINES;
const at = (i: number, off = 0) => L[Math.min(i, L.length - 1)].start + off;
const ff = (i: number, p: number) => Math.round(L[i].start + p * (L[i].end - L[i].start));

const GROUND = 2240, RED = "#d9283b";
const PX = 300, RX = 1200, DOGX = 720, DOGY = GROUND + 6, SACKX = 500;
const COL: Record<string, string> = { PIPI: "#8ff5cf", DEVIL: "#ff7a7a", GRANDMA: "#ffc2dd" };
const MP: Mood[] = ["worried", "happy", "worried", "worried", "neutral", "worried", "worried", "neutral", "surprised", "sad", "sad", "sad", "sad"];
const MD: Mood[] = ["sly", "sly", "sly", "happy", "sly", "sly", "happy", "sly", "worried", "worried", "worried", "sad", "sad"];
const MR: Mood[] = ["neutral", "neutral", "sly", "sly", "sly", "sly", "neutral", "neutral", "surprised", "neutral", "neutral", "sly", "neutral"];
const cur = (g: number) => { let c = 0; for (let i = 0; i < L.length; i++) if (g >= L[i].start - 2) c = i; return c; };
const talking = (g: number, who: string) => { const i = L.findIndex((l) => g >= l.start && g <= l.end); return i >= 0 && L[i].who === who ? 0.25 + 0.75 * rnd(`m${who}${Math.floor(g / 3)}`) : 0; };
const mood = (t: Mood[], g: number): Mood => t[Math.min(cur(g), t.length - 1)];

const T_TB = ff(2, 0.5), T_DEV = at(3, -10), T_F1 = at(4, 4), T_G1 = T_F1 + 8, T_F2 = ff(6, 0.3), T_G2 = T_F2 + 8, T_POOF = ff(9, 0.55), T_LAND = T_POOF + 24, T_RUN = at(10, 22);

// Gerald's size: small -> big -> bus -> gone
const size = (g: number) => keys(g, [[0, 1.3], [T_G1, 1.3], [T_G1 + 14, 2.4], [T_G2, 2.4], [T_G2 + 20, 5.6], [T_POOF, 5.6], [T_POOF + 5, 0.01], [T_POOF + 6, 0.01]]);
const wob = (g: number) => {
  const a = g - (T_G1 + 14), b = g - (T_G2 + 20);
  return 1 + (a > 0 ? 0.08 * Math.exp(-a / 6) * Math.sin(a) : 0) + (b > 0 && g < T_POOF ? 0.06 * Math.exp(-b / 6) * Math.sin(b) : 0);
};
const headTop = (g: number) => DOGY - 262 * size(g);

const Gerald: React.FC<{ g: number }> = ({ g }) => {
  const s = size(g);
  if (s < 0.05) return null;
  const w = wob(g), sx = s * w, sy = s / w;
  const chew = (g > T_F1 + 2 && g < T_F1 + 42) || (g > T_F2 + 2 && g < T_F2 + 48);
  const brush = g >= T_TB && g < T_G1 + 2;
  const wag = chew ? Math.sin(g * 0.7) * 18 : Math.sin(g * 0.15) * 4;
  const tag = g < T_G1 + 7 ? "-$2" : g < T_G2 + 10 ? "-$5" : "-$10";
  const open = 0.5 + 0.5 * Math.sin(g * 0.9);
  const fur = "#c68e5a", furD = "#8f5f33", cream = "#f2d9b3";
  return (
    <g transform={`translate(${DOGX} ${DOGY}) scale(${sx} ${sy})`}>
      <path d="M 85,-70 Q 150,-90 135,-150" fill="none" stroke="#a86f3a" strokeWidth={18} strokeLinecap="round" transform={`rotate(${wag} 85 -70)`} />
      <ellipse cx={0} cy={-80} rx={100} ry={82} fill={fur} stroke={INK} strokeWidth={6} />
      <ellipse cx={0} cy={-62} rx={52} ry={56} fill={cream} />
      <ellipse cx={-64} cy={-14} rx={34} ry={18} fill={fur} stroke={INK} strokeWidth={5} />
      <ellipse cx={64} cy={-14} rx={34} ry={18} fill={fur} stroke={INK} strokeWidth={5} />
      <rect x={-52} y={-96} width={34} height={88} rx={17} fill={fur} stroke={INK} strokeWidth={5} />
      <rect x={18} y={-96} width={34} height={88} rx={17} fill={fur} stroke={INK} strokeWidth={5} />
      <ellipse cx={-35} cy={-8} rx={26} ry={14} fill={cream} stroke={INK} strokeWidth={5} />
      <ellipse cx={35} cy={-8} rx={26} ry={14} fill={cream} stroke={INK} strokeWidth={5} />
      <circle cx={0} cy={-190} r={72} fill={fur} stroke={INK} strokeWidth={6} />
      <ellipse cx={-72} cy={-186} rx={28} ry={58} transform="rotate(14 -72 -186)" fill={furD} stroke={INK} strokeWidth={5} />
      <ellipse cx={72} cy={-186} rx={28} ry={58} transform="rotate(-14 72 -186)" fill={furD} stroke={INK} strokeWidth={5} />
      <ellipse cx={0} cy={-168} rx={38} ry={28} fill={cream} stroke={INK} strokeWidth={4} />
      <ellipse cx={0} cy={-178} rx={13} ry={9} fill={INK} />
      {chew ? (
        <g>
          <path d="M -40,-204 Q -26,-224 -12,-204" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
          <path d="M 12,-204 Q 26,-224 40,-204" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
          <ellipse cx={0} cy={-152} rx={20} ry={6 + 16 * open} fill="#5a1f1f" stroke={INK} strokeWidth={4} />
        </g>
      ) : (
        <g>
          {[-1, 1].map((sd) => (
            <g key={sd}>
              <circle cx={sd * 26} cy={-206} r={17} fill="#fff" stroke={INK} strokeWidth={4} />
              <circle cx={sd * 26 - 5} cy={-203} r={8} fill={INK} />
              <path d={`M ${sd * 46},-234 L ${sd * 14},-222`} stroke={INK} strokeWidth={6} strokeLinecap="round" />
            </g>
          ))}
          {brush ? <ellipse cx={0} cy={-152} rx={14} ry={8} fill="#5a1f1f" stroke={INK} strokeWidth={3} /> : <path d="M -16,-146 Q 0,-158 16,-146" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />}
        </g>
      )}
      {brush && (
        <g transform="translate(10 -152) rotate(-28)">
          <rect x={0} y={-9} width={92} height={18} rx={9} fill="#3fa7ff" stroke={INK} strokeWidth={4} />
          <circle cx={-4} cy={-8} r={11} fill="#fff" stroke={INK} strokeWidth={3} /><circle cx={6} cy={-18} r={8} fill="#fff" stroke={INK} strokeWidth={3} />
        </g>
      )}
      <path d="M -62,-132 Q 0,-112 62,-132" fill="none" stroke={RED} strokeWidth={14} strokeLinecap="round" />
      <rect x={-42} y={-128} width={84} height={36} rx={10} fill="#fff" stroke={INK} strokeWidth={5} />
      <text x={0} y={-101} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={27} fill={RED}>{tag}</text>
    </g>
  );
};

const Sack: React.FC<{ g: number }> = ({ g }) => {
  const sc = lerp(1, 0.16, eio(ramp(g, T_F2 + 4, T_F2 + 22))), shake = g > T_F2 - 6 && g < T_F2 + 20 ? Math.sin(g * 2.4) * 6 : 0;
  return (
    <g transform={`translate(${SACKX + shake} ${GROUND + 4}) scale(1 ${sc})`}>
      <path d="M -62,0 L -70,-172 L 70,-172 L 62,0 Z" fill="#d8b074" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <path d="M -70,-172 L -58,-198 L 58,-198 L 70,-172 Z" fill="#c29a5c" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <rect x={-56} y={-150} width={112} height={84} rx={8} fill="#fffbea" stroke={INK} strokeWidth={4} />
      <text x={0} y={-118} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={21} fill={RED}>AVERAGE</text>
      <text x={0} y={-84} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={32} fill={RED}>DOWN</text>
    </g>
  );
};
const Pellets: React.FC<{ g: number }> = ({ g }) => {
  const out: React.ReactNode[] = [];
  for (let i = 0; i < 6; i++) {
    const t0 = T_F1 + 2 + i * 2, u = ramp(g, t0, t0 + 12);
    if (u > 0 && u < 1) out.push(<circle key={`a${i}`} cx={lerp(640, DOGX - 20, u)} cy={lerp(1590, DOGY - 150 * 1.3, u) - 140 * Math.sin(Math.PI * u)} r={12} fill="#7a4a22" stroke={INK} strokeWidth={3} />);
  }
  for (let i = 0; i < 22; i++) {
    const t0 = T_F2 + i, u = ramp(g, t0, t0 + 14);
    if (u > 0 && u < 1) out.push(<circle key={`b${i}`} cx={lerp(SACKX, DOGX - 10 + (i % 5) * 6, u)} cy={lerp(2040, DOGY - 150 * 2.4, u) - 300 * Math.sin(Math.PI * u)} r={13} fill="#7a4a22" stroke={INK} strokeWidth={3} />);
  }
  return <g>{out}</g>;
};
const Poof: React.FC<{ g: number }> = ({ g }) => {
  const u = ramp(g, T_POOF, T_POOF + 16);
  if (u <= 0 || u >= 1) return null;
  return (
    <g opacity={1 - u}>
      {[0, 1, 2, 3, 4, 5].map((k) => { const a = k * 1.05; return <circle key={k} cx={DOGX + Math.cos(a) * 380 * eout(u)} cy={DOGY - 520 + Math.sin(a) * 330 * eout(u)} r={170 + 90 * u} fill="#fbfbf8" stroke={INK} strokeWidth={6} />; })}
    </g>
  );
};
const Leftovers: React.FC<{ g: number }> = ({ g }) => {
  const tc = g - (T_POOF + 10), tb = g - (T_POOF + 14);
  return (
    <g>
      {tc >= 0 && (
        <g transform={`translate(${DOGX + 40 + 30 * (1 - Math.exp(-tc / 20))} ${GROUND - 32 - 650 * Math.exp(-tc / 9) * Math.abs(Math.cos(tc * 0.32))})`}>
          <circle r={32} fill="#f0b84a" stroke={INK} strokeWidth={6} /><text x={0} y={13} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={38} fill="#7a5a14">$</text>
        </g>
      )}
      {tb >= 0 && (
        <g transform={`translate(${DOGX - 120} ${GROUND - 14 - 520 * Math.exp(-tb / 8) * Math.abs(Math.cos(tb * 0.35))}) rotate(${-14 + 40 * Math.exp(-tb / 10)})`}>
          <rect x={-60} y={-9} width={112} height={18} rx={9} fill="#3fa7ff" stroke={INK} strokeWidth={4} />
          <rect x={44} y={-20} width={26} height={14} rx={3} fill="#fff" stroke={INK} strokeWidth={3} />
        </g>
      )}
    </g>
  );
};
const Scoop: React.FC = () => (
  <g transform="rotate(-8)">
    <line x1={0} y1={0} x2={0} y2={-100} stroke="#9aa3ad" strokeWidth={12} strokeLinecap="round" />
    <path d="M -34,-100 L 34,-100 Q 34,-160 0,-164 Q -34,-160 -34,-100 Z" fill="#c8ced6" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
  </g>
);
const Spoon: React.FC = () => (
  <g transform="rotate(-8)">
    <line x1={0} y1={0} x2={0} y2={-120} stroke="#b9763b" strokeWidth={14} strokeLinecap="round" />
    <ellipse cx={0} cy={-142} rx={24} ry={32} fill="#c98a4b" stroke={INK} strokeWidth={5} />
  </g>
);
const Kitchen: React.FC<{ g: number }> = ({ g }) => (
  <g>
    <rect x={-800} y={-1200} width={3040} height={3400} fill="#e9d2a6" />
    {Array.from({ length: 22 }).map((_, i) => <rect key={i} x={i * 120 - 800} y={-1200} width={60} height={3400} fill="#c9a96a" opacity={0.15} />)}
    <rect x={-800} y={GROUND - 30} width={3040} height={1400} fill="#8d6238" />
    <g transform="translate(1180 760)"><circle r={86} fill="#fbfbf8" stroke={INK} strokeWidth={7} /><path d="M0,0 L0,-56" stroke={INK} strokeWidth={6} strokeLinecap="round" transform={`rotate(${g * 0.5})`} /><path d="M0,0 L40,0" stroke={INK} strokeWidth={6} strokeLinecap="round" /></g>
  </g>
);

const SceneW: React.FC<{ g: number }> = ({ g }) => {
  const c = cur(g), finalLine = c >= L.length - 1, bob = Math.sin(g / 14) * 3, yap = talking(g, "GRANDMA"), gb = Math.sin(g / 12) * 3;
  const look: [number, number] = c >= 11 ? [6, 5] : [8, 0];
  const reading = c === 0 || c === 2 || c === 5 || c === 8 || c === 11;
  const armP = keys(g, [[0, 40], [T_F1 - 8, 40], [T_F1 - 2, 105], [T_F1 + 4, 128], [T_F1 + 16, 40], [T_F2 - 8, 40], [T_F2 - 2, 110], [T_F2 + 4, 135], [T_F2 + 18, 50], [T_POOF - 14, 50], [T_POOF - 6, 95], [T_POOF, 95], [T_POOF + 14, 40], [99999, 40]]);
  // devil: drops in, rides Gerald's head, falls when Gerald pops, lands, resigns, storms off left
  let dvx = DOGX + Math.sin(g / 6) * 8, dvy = headTop(g) + 10, running = false;
  if (g < T_DEV + 10) dvy -= (1 - pop(g, T_DEV, 10)) * 1100;
  const y0 = DOGY - 262 * 5.6 + 10;
  if (g >= T_POOF) { dvx = DOGX; dvy = Math.min(GROUND, y0 + 0.5 * 5 * (g - T_POOF) * (g - T_POOF)); }
  if (g >= T_RUN) { dvx = DOGX - 30 * (g - T_RUN); dvy = GROUND; running = true; }
  const showDevil = g >= T_DEV && dvx > -300;
  return (
    <g>
      <Kitchen g={g} />
      <Gerald g={g} />
      <Poof g={g} />
      <Leftovers g={g} />
      <Sack g={g} />
      {showDevil && (
        <Devil x={dvx} y={dvy} s={0.8} facing={-1} mood={mood(MD, g)} talk={talking(g, "DEVIL")} blink={blinkAt(g, 8)} look={[8, 0]} cry={0} bob={0}
          walk={running ? g * 0.7 : undefined} armR={running ? 30 : 105 + 28 * Math.sin(g * 0.5)} armL={running ? -30 : 20 + 20 * Math.sin(g * 0.45)} />
      )}
      <Pellets g={g} />
      <Pipi x={PX} y={GROUND} s={2.1} facing={1} mood={mood(MP, g)} talk={talking(g, "PIPI")} blink={blinkAt(g, 2)} look={look} bob={bob} headTilt={finalLine ? 4 : 0}
        sweat={c === 3 || c === 5 || c === 8 ? 0.5 : 0} armR={armP} elbowR={0} armL={12 + talking(g, "PIPI") * 16 * Math.sin(g * 0.3)} holdR={<Scoop />} />
      <Grandma x={RX} y={GROUND} s={2.1} facing={-1} mood={mood(MR, g)} talk={yap} blink={blinkAt(g, 9)} look={[8, 0]} bob={gb} headTilt={yap > 0 ? 3 : 0}
        armR={reading ? 100 + 6 * Math.sin(g * 0.7) : 58} armL={20 + yap * 45 * Math.sin(g * 0.55)} holdR={<Spoon />} />
    </g>
  );
};

type Cam = [number, number, number];
const BIG: Cam = [720, 1400, 0.8];
const PLAN: { a: Cam; a2: Cam; split?: number; b?: Cam; b2?: Cam }[] = [
  { a: [800, 1560, 1.25], a2: [800, 1560, 1.35] },
  { a: [520, 1700, 1.6], a2: [520, 1700, 1.75] },
  { a: [960, 1600, 1.5], a2: [900, 1600, 1.65] },
  { a: [720, 1650, 1.5], a2: [720, 1700, 1.4] },
  { a: [520, 1750, 1.5], a2: [560, 1800, 1.4] },
  { a: [800, 1650, 1.1], a2: [800, 1650, 1.0] },
  { a: [760, 1750, 1.2], a2: [720, 1450, 0.95] },
  { a: [300, 1600, 2.0], a2: [300, 1600, 2.2] },
  { a: BIG, a2: [720, 1400, 0.76], split: 0.6, b: [RX, 1600, 2.0], b2: [RX, 1600, 2.2] },
  { a: [300, 1600, 2.0], a2: [300, 1600, 2.2], split: 0.55, b: [720, 1550, 1.0], b2: [720, 1600, 1.05] },
  { a: [660, 1750, 1.25], a2: [560, 1750, 1.25] },
  { a: [960, 1760, 1.4], a2: [960, 1760, 1.5] },
  { a: [520, 1750, 1.55], a2: [480, 1750, 1.7] },
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
  const sh = (i === 0 ? [0] : []).concat([T_DEV + 9, T_G1 + 6, T_G2 + 8, T_POOF, T_LAND].filter((s) => s >= from && s < to));
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
  return <div style={{ position: "absolute", left: 0, right: 0, top: 330 + sh, textAlign: "center", transform: `rotate(-5deg) scale(${k})`, fontFamily: CAPTION_FONT, fontWeight: 800, fontSize: 250, color: "#ffd400", WebkitTextStroke: "16px #0a0d1a", paintOrder: "stroke fill" }}>EP 13</div>;
};

const SFX: Sfx[] = [
  [at(0, 0), "sfx_whoosh", 0.35], [at(0, 4), "sfx_click", 0.3],
  [T_TB, "sfx_pop", 0.4], [L[2].end + 1, "sfx_burn", 0.6], [L[2].end + 7, "sfx_rimshot", 0.35],
  [T_DEV, "sfx_whoosh", 0.5], [T_DEV + 9, "sfx_thump", 0.6],
  [T_F1, "sfx_pop", 0.5], [T_G1, "sfx_boing", 0.6], [L[5].end + 1, "sfx_burn", 0.6],
  [T_F2, "sfx_whoosh", 0.5], [T_G2, "sfx_boing", 0.8], [T_G2 + 3, "sfx_thump", 0.6],
  [L[8].end + 1, "sfx_burn", 0.7], [L[8].end + 7, "sfx_rimshot", 0.45],
  [T_POOF, "sfx_pop", 0.8], [T_POOF + 3, "sfx_whoosh", 0.4], [T_POOF + 10, "sfx_coin", 0.5], [T_POOF + 15, "sfx_tap", 0.4], [T_LAND, "sfx_thump", 0.6],
  [L[11].end + 1, "sfx_burn", 0.55], [L[11].end + 8, "sfx_rimshot", 0.35], [at(12, 6), "sfx_sad", 0.35],
  [at(12, 0), "sfx_thump", 0.6], [at(12, 40), "sfx_ding", 0.35],
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
      <Soundtrack total={FILM_FRAMES} voice={staticFile("projects/pipi-ep13-gerald/narration.mp3")} voiceAt={LEAD} voiceEnd={VOICE_END} music="music_pad" musicLen={1800} amb="amb_night" ambVol={0.2} sfx={SFX} />
    </AbsoluteFill>
  );
};
