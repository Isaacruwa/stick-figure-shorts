import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { CAPTION_FONT, eio, eout, INK, keys, lerp, Mood, pop, ramp, rnd, ShotDef, Shots, Sfx, Soundtrack, VH, VW, blinkAt } from "../_shared169/kit169";
import { Grandma, Guru, Pipi } from "./characters";
import { LEAD, LINES, VOICE_END } from "./lines";
// 16:9 camera conversion: the vertical shots were framed for 1440x2560, here they are re-framed for 2560x1440 (close-ups stay close, wides show the whole set)
const zH = (z: number) => (z >= 1.6 ? z * 0.75 : Math.max(1.0, z * 0.85));
const cyH = (cy: number, z: number) => (z >= 1.6 || cy < 1200 ? cy : Math.max(cy, 2300 - 720 / zH(z)));

// pip.mentor - Pipi ep 3 "No Proof, No Pay" (9:16 cartoon scene, no narrator).
// The guru returns in a terrible disguise selling "98% win" signals. Pipi asks for the losses; they are "in the other group". Grandma pulls off the fake mustache.
// Shots, mouths, moods and props key off LINES (tools/make_dialogue.py), not frame numbers.
export const FILM_FRAMES = VOICE_END + 80;
const L = LINES;
const at = (i: number, off = 0) => L[Math.min(i, L.length - 1)].start + off;

const GROUND = 2240, GREEN = "#27d17f", RED = "#ff4d5e", GOLD = "#f0b84a";
const PX = 300, GX = 900, RX = 1200;
const COL: Record<string, string> = { PIPI: "#8ff5cf", GURU: "#ffd36b", GRANDMA: "#ffc2dd" };
const MP: Mood[] = ["neutral", "neutral", "neutral", "sly", "sly", "sly", "sly", "sly", "sly", "neutral", "happy", "happy", "happy", "sly"];
const MG: Mood[] = ["sly", "neutral", "sly", "sly", "happy", "worried", "worried", "worried", "worried", "worried", "worried", "worried", "surprised", "sad"];
const MR: Mood[] = ["neutral", "neutral", "neutral", "neutral", "neutral", "neutral", "neutral", "neutral", "neutral", "neutral", "happy", "sly", "happy", "happy"];
const cur = (g: number) => { let c = 0; for (let i = 0; i < L.length; i++) if (g >= L[i].start - 2) c = i; return c; };
const talking = (g: number, who: string) => { const i = L.findIndex((l) => g >= l.start && g <= l.end); return i >= 0 && L[i].who === who ? 0.25 + 0.75 * rnd(`m${who}${Math.floor(g / 3)}`) : 0; };
const mood = (t: Mood[], g: number): Mood => t[Math.min(cur(g), t.length - 1)];

const Stack: React.FC<{ n?: number }> = ({ n = 9 }) => (
  <g>{Array.from({ length: n }).map((_, k) => <g key={k}><ellipse cx={0} cy={-6 - k * 11 + 4} rx={34} ry={10} fill="#b88a22" stroke={INK} strokeWidth={3} /><ellipse cx={0} cy={-6 - k * 11} rx={34} ry={10} fill={GOLD} stroke={INK} strokeWidth={3.5} /></g>)}</g>
);
const Sign: React.FC<{ text: string }> = ({ text }) => (
  <g transform="rotate(-8)">
    <line x1={0} y1={0} x2={0} y2={-120} stroke="#6b4a2f" strokeWidth={12} strokeLinecap="round" />
    <rect x={-105} y={-260} width={210} height={130} rx={12} fill="#f4f1e8" stroke={INK} strokeWidth={7} />
    <text x={0} y={-165} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={86} fill={RED}>{text}</text>
  </g>
);
const Phone: React.FC = () => (
  <g transform="rotate(-8)">
    <rect x={-20} y={-250} width={150} height={240} rx={18} fill="#10162b" stroke={INK} strokeWidth={6} />
    {Array.from({ length: 10 }).map((_, k) => { const cx = 10 + (k % 2) * 60, cy = -225 + Math.floor(k / 2) * 42; return <g key={k}><rect x={cx - 5} y={cy - 3} width={50} height={34} rx={6} fill="#173a2a" /><path d={`M ${cx + 8},${cy + 14} l 9,9 l 18,-18`} stroke={GREEN} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>; })}
  </g>
);
const Spoon: React.FC = () => (
  <g transform="rotate(-8)">
    <line x1={0} y1={0} x2={0} y2={-120} stroke="#b9763b" strokeWidth={14} strokeLinecap="round" />
    <ellipse cx={0} cy={-142} rx={24} ry={32} fill="#c98a4b" stroke={INK} strokeWidth={5} />
  </g>
);
const Bg: React.FC = () => (
  <g>
    <defs><linearGradient id="sky3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1f1b45" /><stop offset="1" stopColor="#f08a5d" /></linearGradient></defs>
    <rect x={-800} y={-1200} width={3040} height={3200} fill="url(#sky3)" />
    <circle cx={1060} cy={1560} r={150} fill="#ffd7a0" opacity={0.9} />
    {Array.from({ length: 14 }).map((_, i) => { const h = 420 + rnd(`bh${i}`) * 520; return <rect key={i} x={i * 170 - 500} y={2000 - h} width={150} height={h} fill="#171a33" />; })}
    <rect x={-800} y={2000} width={3040} height={1800} fill="#2b2d3f" />
    <rect x={-800} y={1990} width={3040} height={14} fill="#4a4d66" />
    <path d="M-800,2420 L2240,2420" stroke="#e8e3c8" strokeWidth={10} strokeDasharray="90 70" opacity={0.6} />
    <ellipse cx={GX} cy={GROUND + 6} rx={150} ry={18} fill="#000" opacity={0.25} /><ellipse cx={PX} cy={GROUND + 6} rx={150} ry={18} fill="#000" opacity={0.25} />
  </g>
);

const T_YANK = at(11, 28), T_FLEE = at(12, 30);
const Stache: React.FC<{ g: number }> = ({ g }) => {
  if (g < T_YANK) return null;
  const a = eio(ramp(g, T_YANK, T_YANK + 8)), b = ramp(g, T_YANK + 8, T_YANK + 30), fall = b * b;
  const x = b > 0 ? lerp(897, 840, b) : 900 - 3 * a, y = b > 0 ? lerp(1790, 2232, fall) : lerp(1547, 1790, a), rot = b > 0 ? 540 * Math.min(1, b * 1.2) : -30 * a;
  return <g transform={`translate(${x} ${y}) rotate(${rot}) scale(2.1)`}><path d="M -40,-4 Q -22,-15 0,-6 Q 22,-15 40,-4 Q 22,6 0,0 Q -22,6 -40,-4 Z" fill="#2a1d14" stroke={INK} strokeWidth={2.5} /></g>;
};
const SceneW: React.FC<{ g: number }> = ({ g }) => {
  const signNo = g >= at(2, 20) && g < at(3, 6), signVip = g >= at(8, 16) && g < at(9, 4), phoneOn = g >= at(4, 0) && g < at(5, 10);
  const flee = ramp(g, T_FLEE, T_FLEE + 30), fe = eio(flee);
  const enter = ramp(g, at(7, -14), at(7, 24)), rx = lerp(1750, RX, eout(enter)), walking = enter > 0 && enter < 1;
  const yank = ramp(g, at(11, 0), at(11, 10)) * (1 - ramp(g, T_YANK, T_YANK + 6) * 0.5), oww = ramp(g, T_YANK, T_YANK + 4) * (1 - ramp(g, T_YANK + 14, T_YANK + 24));
  const finalLine = cur(g) >= L.length - 1;
  const pumping = cur(g) === 10 || (cur(g) === 11 && g < at(11, 4));
  return (
    <g>
      <Bg />
      <Pipi x={PX} y={GROUND} s={2.1} facing={1} mood={mood(MP, g)} talk={talking(g, "PIPI")} blink={blinkAt(g, 2)}
        look={finalLine ? [0, 0] : [8, 0]} sweat={0} headTilt={finalLine ? 5 : 0} bob={Math.sin(g / 14) * 3}
        armR={pumping ? 130 + 6 * Math.sin(g * 0.5) : 28} armL={12 + talking(g, "PIPI") * 16 * Math.sin(g * 0.3)} holdR={<Stack />} />
      {flee < 1 && (
        <Guru disguise mustache={g < T_YANK} x={lerp(GX, 760, fe)} y={GROUND + 900 * fe} s={2.1 * (1 + 0.9 * fe)} facing={-1} mood={mood(MG, g)} talk={talking(g, "GURU")} blink={blinkAt(g, 4)}
          look={[8, 0]} sweat={cur(g) >= 5 ? 0.9 : 0} headTilt={cur(g) === 0 ? -5 : oww * 16} bob={Math.sin(g / 12) * 3}
          walk={flee > 0 ? g * 0.9 : 0}
          armR={flee > 0 ? 100 + 40 * Math.sin(g * 0.9) : signNo || signVip || phoneOn ? 100 : 30} elbowR={signNo || signVip || phoneOn ? -20 : 0}
          armL={flee > 0 ? -50 * Math.sin(g * 0.9) : 14 + talking(g, "GURU") * 22 * Math.sin(g * 0.25)}
          holdR={flee > 0 ? undefined : signNo ? <Sign text="98%" /> : signVip ? <Sign text="$99" /> : phoneOn ? <Phone /> : undefined} />
      )}
      {g >= at(7, -14) && (
        <Grandma x={rx} y={GROUND} s={2.1} facing={-1} mood={mood(MR, g)} talk={talking(g, "GRANDMA")} blink={blinkAt(g, 9)} look={[8, 0]} bob={Math.sin(g / 16) * 2}
          walk={walking ? g * 0.45 : 0} armR={g < at(11, 0) ? 58 : lerp(58, 120, yank) - (g >= T_YANK ? 60 * ramp(g, T_YANK, T_YANK + 6) : 0)} armL={12}
          holdR={g >= at(11, 0) && g < T_YANK + 6 ? undefined : <Spoon />} />
      )}
      <Stache g={g} />
    </g>
  );
};

type Cam = [number, number, number];
const cu = (x: number, z: number, y = 1600): Cam => [x, y, z];
const WIDE: Cam = [740, 1750, 1.15], TWOGR: Cam = [1050, 1650, 1.5];
const PLAN: { a: Cam; a2: Cam; split?: number; b?: Cam; b2?: Cam }[] = [
  { a: cu(GX, 2.9), a2: cu(GX, 2.5) },
  { a: cu(PX, 1.9), a2: cu(PX, 2.1) },
  { a: cu(GX, 1.8), a2: cu(GX, 2.0) },
  { a: cu(PX, 1.9), a2: cu(PX, 2.05) },
  { a: cu(GX, 1.8), a2: cu(GX, 2.0), split: 0.62, b: cu(PX, 1.9), b2: cu(PX, 2.0) },
  { a: cu(PX, 1.9), a2: cu(PX, 2.1) },
  { a: cu(GX, 1.9), a2: cu(GX, 2.2) },
  { a: WIDE, a2: [760, 1750, 1.2], split: 0.45, b: cu(RX, 1.8), b2: cu(RX, 1.95) },
  { a: cu(GX, 1.85), a2: cu(GX, 2.0) },
  { a: cu(RX, 1.8), a2: cu(RX, 1.95), split: 0.55, b: cu(PX, 1.9), b2: cu(PX, 2.0) },
  { a: cu(PX, 1.9), a2: cu(PX, 2.05) },
  { a: TWOGR, a2: [1050, 1650, 1.7] },
  { a: cu(GX, 2.0), a2: cu(GX, 2.3), split: 0.4, b: WIDE, b2: [740, 1750, 1.2] },
  { a: cu(PX, 2.0), a2: [PX, 1560, 2.4] },
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
  const sh = i === 0 ? [0] : i === 11 ? [T_YANK] : [];
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
  return <div style={{ position: "absolute", left: 0, right: 0, top: 70 + sh, textAlign: "center", transform: `rotate(-5deg) scale(${k})`, fontFamily: CAPTION_FONT, fontWeight: 800, fontSize: 190, color: "#ffd400", WebkitTextStroke: "12px #0a0d1a", paintOrder: "stroke fill" }}>EP 3</div>;
};

const SFX: Sfx[] = [
  [at(0, 0), "sfx_whoosh", 0.35], [at(2, 20), "sfx_pop", 0.45], [at(4, 0), "sfx_pop", 0.45], [at(5, 10), "sfx_sad", 0.3], [at(8, 16), "sfx_pop", 0.45],
  [at(7, -14), "sfx_tap", 0.4], [at(7, -6), "sfx_tap", 0.4], [at(7, 2), "sfx_tap", 0.4], [at(7, 10), "sfx_tap", 0.4], [at(7, 18), "sfx_tap", 0.4],
  [at(10, 4), "sfx_sparkle", 0.45], [T_YANK, "sfx_click", 0.6], [T_YANK + 1, "sfx_pop", 0.5], [T_FLEE, "sfx_whoosh", 0.45],
  [at(13, 0), "sfx_thump", 0.65], [at(13, 40), "sfx_ding", 0.35],
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
      <Soundtrack total={EP169_FRAMES} voice={staticFile("projects/pipi-ep3-no-proof/narration.mp3")} voiceAt={LEAD} voiceEnd={VOICE_END} music="music_pad" musicLen={1800} amb="amb_night" ambVol={0.2} sfx={SFX} />
    </AbsoluteFill>
  );
};
export const EP169_FRAMES = VOICE_END + 34;
