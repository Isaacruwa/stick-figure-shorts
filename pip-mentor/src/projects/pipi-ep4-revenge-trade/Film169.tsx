import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { CAPTION_FONT, eio, eout, INK, keys, lerp, Mood, ramp, rnd, ShotDef, Shots, Sfx, Soundtrack, VH, VW, blinkAt, clamp01 } from "../_shared169/kit169";
import { Angel, Devil, Grandma, Pipi } from "./characters";
import { LEAD, LINES, VOICE_END } from "./lines";
// 16:9 camera conversion: the vertical shots were framed for 1440x2560, here they are re-framed for 2560x1440 (close-ups stay close, wides show the whole set)
const zH = (z: number) => (z >= 1.6 ? z * 0.75 : Math.max(1.0, z * 0.85));
const cyH = (cy: number, z: number) => (z >= 1.6 || cy < 1200 ? cy : Math.max(cy, 2300 - 720 / zH(z)));

// pip.mentor - Pipi ep 4 "The Revenge Trade" (9:16 cartoon scene, no narrator).
// Pipi just lost a dollar. The devil on his shoulder says double it (revenge), the angel says close the chart. Pipi closes it. Grandma finds the devil and whacks him with her spoon.
// Shots, mouths, moods and props key off LINES (tools/make_dialogue.py), not frame numbers.
export const FILM_FRAMES = VOICE_END + 80;
const L = LINES;
const at = (i: number, off = 0) => L[Math.min(i, L.length - 1)].start + off;

const GROUND = 2240, GREEN = "#27d17f", RED = "#ff4d5e", GOLD = "#f0b84a";
const PX = 480, DVX = PX + 120, ANX = PX - 120, SY = 1650, GRX = 900;
const COL: Record<string, string> = { PIPI: "#8ff5cf", DEVIL: "#ff7a7a", ANGEL: "#fff3a6", GRANDMA: "#ffc2dd" };
const MP: Mood[] = ["sad", "worried", "worried", "worried", "worried", "sad", "sad", "sad", "worried", "neutral", "happy", "happy", "surprised", "sly"];
const MD: Mood[] = ["happy", "sly", "happy", "worried", "sly", "worried", "sly", "worried", "sly", "worried", "sad", "worried", "surprised", "sad"];
const MA: Mood[] = ["worried", "worried", "worried", "neutral", "worried", "neutral", "neutral", "happy", "worried", "happy", "happy", "happy", "sly", "happy"];
const MR: Mood[] = ["neutral", "neutral", "neutral", "neutral", "neutral", "neutral", "neutral", "neutral", "neutral", "neutral", "happy", "sly", "happy", "happy"];
const cur = (g: number) => { let c = 0; for (let i = 0; i < L.length; i++) if (g >= L[i].start - 2) c = i; return c; };
const talking = (g: number, who: string) => { const i = L.findIndex((l) => g >= l.start && g <= l.end); return i >= 0 && L[i].who === who ? 0.25 + 0.75 * rnd(`m${who}${Math.floor(g / 3)}`) : 0; };
const mood = (t: Mood[], g: number): Mood => t[Math.min(cur(g), t.length - 1)];

const Stack: React.FC<{ n?: number }> = ({ n = 8 }) => (
  <g>{Array.from({ length: n }).map((_, k) => <g key={k}><ellipse cx={0} cy={-6 - k * 11 + 4} rx={34} ry={10} fill="#b88a22" stroke={INK} strokeWidth={3} /><ellipse cx={0} cy={-6 - k * 11} rx={34} ry={10} fill={GOLD} stroke={INK} strokeWidth={3.5} /></g>)}</g>
);
const Spoon: React.FC = () => (
  <g transform="rotate(-8)">
    <line x1={0} y1={0} x2={0} y2={-120} stroke="#b9763b" strokeWidth={14} strokeLinecap="round" />
    <ellipse cx={0} cy={-142} rx={24} ry={32} fill="#c98a4b" stroke={INK} strokeWidth={5} />
  </g>
);
const Fork: React.FC = () => (
  <g transform="rotate(-10)">
    <line x1={0} y1={0} x2={0} y2={-240} stroke="#3a2a2a" strokeWidth={14} strokeLinecap="round" />
    <path d="M -34,-300 L -34,-250 L 34,-250 L 34,-300 M 0,-310 L 0,-250" fill="none" stroke="#c9c9d6" strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

const T_CLOSE = at(9, 22), T_WHACK = at(12, 4);
const Room: React.FC<{ g: number }> = ({ g }) => {
  const sway = Math.sin(g * 0.08) * 2.5, ma = g * 0.1;
  return (
    <g>
      <rect x={-800} y={-1200} width={3040} height={3500} fill="#1a2342" />
      <rect x={-800} y={GROUND - 30} width={3040} height={1400} fill="#0e1329" />
      <rect x={-800} y={GROUND - 38} width={3040} height={10} fill="#222c52" />
      <defs><linearGradient id="cone4" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe9a8" stopOpacity={0.5} /><stop offset="1" stopColor="#ffe9a8" stopOpacity={0.03} /></linearGradient></defs>
      <g transform={`rotate(${sway} 720 0)`}>
        <polygon points={`700,390 740,390 1300,${GROUND} 140,${GROUND}`} fill="url(#cone4)" />
        <line x1={720} y1={-300} x2={720} y2={330} stroke={INK} strokeWidth={5} />
        <rect x={700} y={318} width={40} height={30} fill="#3a3f5c" stroke={INK} strokeWidth={5} />
        <circle cx={720} cy={362} r={38} fill="#fff1bf" stroke={INK} strokeWidth={6} />
      </g>
      <g transform={`translate(${720 + 120 * Math.cos(ma)} ${400 + 60 * Math.sin(ma * 1.5)})`}>
        <ellipse cx={-14} cy={-4} rx={18} ry={8 + 9 * Math.sin(g * 1.4)} fill="#e9e3d0" stroke={INK} strokeWidth={3} />
        <ellipse cx={14} cy={-4} rx={18} ry={8 + 9 * Math.sin(g * 1.4)} fill="#e9e3d0" stroke={INK} strokeWidth={3} />
        <ellipse cx={0} cy={4} rx={5} ry={13} fill="#6b5a4a" stroke={INK} strokeWidth={3} />
      </g>
    </g>
  );
};
const PRICE: [number, number][] = [[0, 0.75], [24, 0.3], [60, 0.28], [200, 0.25], [1500, 0.22]];
const CHX = 850, CHY = 1520, CHW = 420, CHH = 170;
const Desk: React.FC<{ g: number }> = ({ g }) => {
  const N = 36, pts: string[] = [];
  for (let i = 0; i < N; i++) { const gt = g - (N - 1 - i) * 4; pts.push(`${CHX + (i / (N - 1)) * CHW},${CHY + CHH - clamp01(keys(Math.max(0, gt), PRICE) + (rnd(`c${Math.round(gt / 3)}`) - 0.5) * 0.06) * CHH}`); }
  const on = g < T_CLOSE, last = pts[N - 1].split(","), x2 = ramp(g, at(2, 2), at(2, 12)) * (on ? 1 : 0), pulse = 1 + 0.06 * Math.sin(g * 0.35);
  return (
    <g>
      <rect x={720} y={1946} width={700} height={294} fill="#4a3328" stroke={INK} strokeWidth={6} />
      <rect x={700} y={1900} width={760} height={46} rx={8} fill="#6a4a38" stroke={INK} strokeWidth={7} />
      <rect x={1040} y={1840} width={40} height={64} fill="#262c4b" stroke={INK} strokeWidth={5} />
      <rect x={800} y={1470} width={520} height={380} rx={22} fill="#1b2140" stroke={INK} strokeWidth={8} />
      <rect x={820} y={1490} width={480} height={340} fill="#0a1220" />
      {on ? (
        <g>
          <path d={`M ${pts.join(" L ")} L ${CHX + CHW},${CHY + CHH} L ${CHX},${CHY + CHH} Z`} fill={RED} opacity={0.12} />
          <polyline points={pts.join(" ")} fill="none" stroke={RED} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" />
          <circle cx={last[0]} cy={last[1]} r={9 + 3 * Math.sin(g * 0.3)} fill={RED} />
        </g>
      ) : <rect x={820} y={1490} width={480} height={340} fill="#05070f" />}
      {x2 > 0.01 && <g transform={`translate(1160 1770) scale(${x2 * pulse})`}><rect x={-100} y={-38} width={200} height={76} rx={16} fill={RED} stroke={INK} strokeWidth={6} /><text x={0} y={18} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={60} fill="#fff">x2</text></g>}
      <g transform="translate(1385 1900)"><Stack n={8} /></g>
    </g>
  );
};

const SceneW: React.FC<{ g: number }> = ({ g }) => {
  const c = cur(g), spk = L[Math.min(c, L.length - 1)].who, finalLine = c >= L.length - 1;
  const click = ramp(g, at(9, 16), at(9, 20)) - ramp(g, at(9, 22), at(9, 28));
  const enter = ramp(g, at(11, -14), at(11, 26)), grx = lerp(1750, GRX, eout(enter)), walking = enter > 0 && enter < 1;
  const sp = g < at(12, -10) ? 58 : g < T_WHACK ? lerp(58, 125, ramp(g, at(12, -10), at(12, 2))) : lerp(125, 45, ramp(g, T_WHACK, T_WHACK + 5)) + 13 * ramp(g, T_WHACK + 8, T_WHACK + 30);
  const fl = ramp(g, T_WHACK, T_WHACK + 26), fe = eio(fl);
  const dvx = g < T_WHACK ? DVX : lerp(DVX, -420, fe), dvy = g < T_WHACK ? SY : SY - 520 * Math.sin(Math.PI * fe) - 100 * fe;
  const shrink = c === 10 ? 1 - 0.2 * ramp(g, at(10, 4), at(10, 22)) : c > 10 ? 0.8 : 1;
  const look: [number, number] = finalLine ? [0, 0] : spk === "DEVIL" ? [9, -4] : spk === "ANGEL" ? [-9, -4] : spk === "GRANDMA" ? [9, 0] : [6, 3];
  const bob = Math.sin(g / 14) * 3;
  return (
    <g>
      <Room g={g} />
      <Desk g={g} />
      <Pipi x={PX} y={GROUND} s={2.1} facing={1} mood={mood(MP, g)} talk={talking(g, "PIPI")} blink={blinkAt(g, 2)} look={look}
        sweat={c >= 5 && c < 9 ? 0.7 : 0} headTilt={finalLine ? 5 : c === 0 ? -4 : 0} bob={bob} armR={62 - 14 * click} armL={12 + talking(g, "PIPI") * 16 * Math.sin(g * 0.3)} />
      <Angel x={ANX} y={SY + bob} s={0.5} facing={1} mood={mood(MA, g)} talk={talking(g, "ANGEL")} blink={blinkAt(g, 6)} look={[8, 0]} bob={Math.sin(g / 9) * 2}
        armR={talking(g, "ANGEL") > 0 ? 70 + 20 * Math.sin(g * 0.3) : 30} armL={14} />
      {(g < T_WHACK + 26) && (
        <g transform={g >= T_WHACK ? `rotate(${900 * fe} ${dvx} ${dvy - 100})` : undefined}>
          <Devil x={dvx} y={dvy + (g < T_WHACK ? bob : 0)} s={0.5 * shrink} facing={-1} mood={mood(MD, g)} talk={talking(g, "DEVIL")} blink={blinkAt(g, 8)} look={[8, 0]}
            sweat={c >= 9 ? 0.9 : 0} bob={Math.sin(g / 7) * 3} armR={talking(g, "DEVIL") > 0 ? 100 + 25 * Math.sin(g * 0.45) : 40} armL={14} holdR={<Fork />} />
        </g>
      )}
      {g >= at(11, -14) && (
        <Grandma x={grx} y={GROUND} s={2.1} facing={-1} mood={mood(MR, g)} talk={talking(g, "GRANDMA")} blink={blinkAt(g, 9)} look={[8, 0]} bob={Math.sin(g / 16) * 2}
          walk={walking ? g * 0.45 : 0} armR={g < at(12, -10) ? 58 : sp} armL={12} holdR={<Spoon />} />
      )}
    </g>
  );
};

type Cam = [number, number, number];
const CUD: Cam = [600, 1530, 4.4], CUA: Cam = [360, 1530, 4.4], CUP: Cam = [480, 1580, 1.9], WIDE: Cam = [760, 1700, 1.15], TAB: Cam = [1060, 1670, 2.4];
const PLAN: { a: Cam; a2: Cam; split?: number; b?: Cam; b2?: Cam }[] = [
  { a: [600, 1530, 4.9], a2: [600, 1530, 4.3] },
  { a: CUP, a2: [480, 1580, 2.1] },
  { a: CUD, a2: [600, 1530, 4.1], split: 0.6, b: WIDE, b2: [800, 1700, 1.25] },
  { a: CUA, a2: [360, 1530, 4.1] },
  { a: CUD, a2: [600, 1530, 4.1] },
  { a: CUA, a2: [360, 1530, 4.1] },
  { a: CUP, a2: [480, 1580, 2.3] },
  { a: CUA, a2: [360, 1530, 4.0] },
  { a: CUD, a2: [600, 1530, 4.2] },
  { a: CUP, a2: [480, 1580, 2.05], split: 0.5, b: TAB, b2: [1060, 1670, 2.6] },
  { a: [600, 1530, 4.2], a2: [600, 1530, 3.8] },
  { a: WIDE, a2: [780, 1700, 1.2], split: 0.5, b: [900, 1620, 1.9], b2: [880, 1620, 2.0] },
  { a: [700, 1600, 2.0], a2: [620, 1600, 2.3] },
  { a: CUP, a2: [480, 1560, 2.4] },
];
const mk = (from: number, to: number, c0: Cam, c1: Cam, shakes: number[] = []): ShotDef => ({
  from, to, z0: 1, z1: 1,
  render: (l, p) => {
    const g = from + l, e = eio(p), cx = lerp(c0[0], c1[0], e), cy = lerp(c0[1], c1[1], e), z = lerp(c0[2], c1[2], e);
    let sx = 0, sy = 0;
    for (const b of shakes) if (g >= b) { const d = Math.exp(-(g - b) / 4) * 20; sx += Math.sin((g - b) * 2.3) * d; sy += Math.cos((g - b) * 3.1) * d * 0.7; }
    return <g transform={`translate(${VW / 2 + sx} ${VH / 2 + sy}) scale(${zH(z)}) translate(${-cx} ${-cyH(cy, z)})`}><SceneW g={g} /></g>;
  },
});
const SHOTS: ShotDef[] = [];
for (let i = 0; i < L.length; i++) {
  const from = i === 0 ? 0 : L[i].start - 3, to = i === L.length - 1 ? FILM_FRAMES + 1 : L[i + 1].start - 3, pl = PLAN[Math.min(i, PLAN.length - 1)];
  const sh = i === 0 ? [0] : i === 12 ? [T_WHACK] : [];
  if (pl.split && pl.b && pl.b2) { const mid = Math.round(from + (to - from) * pl.split); SHOTS.push(mk(from, mid, pl.a, pl.a2, sh), mk(mid, to, pl.b, pl.b2)); }
  else SHOTS.push(mk(from, to, pl.a, pl.a2, sh));
}

const Subs: React.FC<{ f: number }> = ({ f }) => {
  const i = L.findIndex((l) => f >= l.start - 2 && f <= l.end + 6);
  if (i < 0) return null;
  const l = L[i], words = l.text.split(" "), chunks: string[] = [];
  for (let k = 0; k < words.length; k += 4) chunks.push(words.slice(k, k + 4).join(" "));
  let acc = 0, show = chunks[chunks.length - 1];
  for (const c of chunks) { acc += c.length; if ((f - l.start) / Math.max(1, l.end - l.start) <= acc / l.text.length) { show = c; break; } }
  return <div style={{ position: "absolute", left: 320, right: 320, top: 1130, textAlign: "center", fontFamily: CAPTION_FONT, fontWeight: 800, fontSize: 66, lineHeight: 1.1, color: COL[l.who] ?? "#fff", WebkitTextStroke: "10px #0a0d1a", paintOrder: "stroke fill", textTransform: "uppercase" }}>{show}</div>;
};
const Stamp: React.FC<{ f: number }> = ({ f }) => {
  const t0 = at(L.length - 1, 0);
  if (f < t0) return null;
  const k = 1 + 0.6 * (1 - eout(ramp(f, t0, t0 + 10))), sh = Math.exp(-(f - t0) / 4) * 14 * Math.sin((f - t0) * 2.3);
  return <div style={{ position: "absolute", left: 0, right: 0, top: 70 + sh, textAlign: "center", transform: `rotate(-5deg) scale(${k})`, fontFamily: CAPTION_FONT, fontWeight: 800, fontSize: 190, color: "#ffd400", WebkitTextStroke: "12px #0a0d1a", paintOrder: "stroke fill" }}>EP 4</div>;
};

const SFX: Sfx[] = [
  [at(0, 0), "sfx_whoosh", 0.35], [at(0, 6), "sfx_sad", 0.3], [at(2, 2), "sfx_pop", 0.45], [T_CLOSE - 2, "sfx_click", 0.55], [at(10, 2), "sfx_sad", 0.4],
  [at(11, -14), "sfx_tap", 0.4], [at(11, -6), "sfx_tap", 0.4], [at(11, 2), "sfx_tap", 0.4], [at(11, 10), "sfx_tap", 0.4], [at(11, 18), "sfx_tap", 0.4],
  [T_WHACK, "sfx_tap", 0.9], [T_WHACK + 1, "sfx_whoosh", 0.5], [at(13, 0), "sfx_thump", 0.65], [at(13, 40), "sfx_ding", 0.35],
];

const Frame: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: "#0e1329" }}>
    <Shots f={f} shots={SHOTS} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)" }} />
    <AbsoluteFill style={{ background: "#fff", opacity: 0.35 * (1 - ramp(f, 0, 4)) }} />
    <Subs f={f} />
    <Stamp f={f} />
  </AbsoluteFill>
);

export const Episode169: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#0e1329" }}>
      <Frame f={f} />
      <Soundtrack total={EP169_FRAMES} voice={staticFile("projects/pipi-ep4-revenge-trade/narration.mp3")} voiceAt={LEAD} voiceEnd={VOICE_END} music="music_pad" musicLen={1800} amb="amb_night" ambVol={0.2} sfx={SFX} />
    </AbsoluteFill>
  );
};
export const EP169_FRAMES = VOICE_END + 34;
