import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { CAPTION_FONT, eio, eout, INK, lerp, Mood, pop, ramp, rnd, ShotDef, Shots, Sfx, Soundtrack, VH, VW, blinkAt } from "../_shared169/kit169";
import { Angel, Devil, Grandma, Pipi } from "./characters";
import { LEAD, LINES, VOICE_END } from "./lines";
// 16:9 camera conversion: the vertical shots were framed for 1440x2560, here they are re-framed for 2560x1440 (close-ups stay close, wides show the whole set)
const zH = (z: number) => (z >= 1.6 ? z * 0.75 : Math.max(1.0, z * 0.85));
const cyH = (cy: number, z: number) => (z >= 1.6 || cy < 1200 ? cy : Math.max(cy, 2300 - 720 / zH(z)));

// pip.mentor - Pipi ep 5 "First Real Win" (9:16 cartoon scene, no narrator, PERFECT LOOP: the last frame is frame 0).
// Pipi wins $2 by following a plan. The devil says go bigger, the angel says the plan is the win, Grandma feeds the devil her soup and he converts.
// Shots, mouths, moods and props key off LINES (tools/make_dialogue.py), not frame numbers.
export const FILM_FRAMES = VOICE_END + 80;
const L = LINES;
const at = (i: number, off = 0) => L[Math.min(i, L.length - 1)].start + off;

const GROUND = 2240, GREEN = "#27d17f", RED = "#ff4d5e";
const PX = 420, DVX = PX + 115, ANX = PX - 115, SY = 1650, GRX = 1000;
const COL: Record<string, string> = { PIPI: "#8ff5cf", DEVIL: "#ff7a7a", ANGEL: "#fff3a6", GRANDMA: "#ffc2dd" };
const MP: Mood[] = ["happy", "happy", "happy", "neutral", "neutral", "happy", "happy", "neutral", "surprised", "happy", "happy"];
const MD: Mood[] = ["sly", "sly", "sly", "sly", "worried", "worried", "worried", "sly", "surprised", "happy", "happy"];
const MA: Mood[] = ["happy", "happy", "happy", "worried", "happy", "happy", "happy", "happy", "worried", "happy", "happy"];
const MR: Mood[] = ["happy", "happy", "happy", "neutral", "neutral", "neutral", "happy", "neutral", "sly", "happy", "happy"];
const cur = (g: number) => { let c = 0; for (let i = 0; i < L.length; i++) if (g >= L[i].start - 2) c = i; return c; };
const talking = (g: number, who: string) => { const i = L.findIndex((l) => g >= l.start && g <= l.end); return i >= 0 && L[i].who === who ? 0.25 + 0.75 * rnd(`m${who}${Math.floor(g / 3)}`) : 0; };
const mood = (t: Mood[], g: number): Mood => t[Math.min(cur(g), t.length - 1)];

const Phone: React.FC = () => (
  <g transform="rotate(-8)">
    <rect x={-25} y={-290} width={170} height={280} rx={20} fill="#10162b" stroke={INK} strokeWidth={6} />
    <text x={60} y={-130} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={72} fill={GREEN}>+$2</text>
  </g>
);
const Spoon: React.FC<{ soup: boolean }> = ({ soup }) => (
  <g transform="rotate(-8)">
    <line x1={0} y1={0} x2={0} y2={-120} stroke="#b9763b" strokeWidth={14} strokeLinecap="round" />
    <ellipse cx={0} cy={-142} rx={24} ry={32} fill="#c98a4b" stroke={INK} strokeWidth={5} />
    {soup && <ellipse cx={0} cy={-146} rx={16} ry={22} fill="#f0a040" />}
  </g>
);
const SpoonSide: React.FC<{ soup: boolean }> = ({ soup }) => (
  <g transform="rotate(90)">
    <line x1={0} y1={0} x2={0} y2={-70} stroke="#b9763b" strokeWidth={14} strokeLinecap="round" />
    <ellipse cx={0} cy={-90} rx={24} ry={32} fill="#c98a4b" stroke={INK} strokeWidth={5} />
    {soup && <ellipse cx={0} cy={-94} rx={16} ry={22} fill="#f0a040" />}
  </g>
);
const Confetti: React.FC<{ g: number }> = ({ g }) => {
  const o = 1 - ramp(g, at(1, 0), at(1, 30));
  if (o <= 0) return null;
  return (
    <g opacity={o}>{Array.from({ length: 70 }).map((_, i) => {
      const sp = 10 + rnd(`cs${i}`) * 14, y = ((g * sp + rnd(`cy${i}`) * 3400) % 3400) - 500, x = -560 + rnd(`cx${i}`) * 2560, rot = (g * 6 + i * 40) % 360;
      return <rect key={i} x={x} y={y} width={22} height={40} fill={["#ff4d5e", "#ffd400", "#27d17f", "#4f8ff0", "#d25f9a"][i % 5]} transform={`rotate(${rot} ${x} ${y})`} />;
    })}</g>
  );
};
const Steam: React.FC<{ g: number }> = ({ g }) => (
  <g>{[0, 1, 2].map((k) => { const t = ((g * 1.2 + k * 26) % 78) / 78; return <path key={k} d="M0,0 q 14,-24 0,-48 q -14,-24 0,-48" fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" opacity={0.6 * (1 - t)} transform={`translate(${-30 + k * 30} ${-90 - t * 90})`} />; })}</g>
);
const Heart: React.FC<{ g: number }> = ({ g }) => {
  const t0 = at(9, 10);
  if (g < t0) return null;
  const k = pop(g, t0, 10), up = ramp(g, t0, t0 + 50) * 90;
  return <g transform={`translate(${DVX + 60} ${1330 - up}) scale(${1.2 * k})`} opacity={1 - ramp(g, t0 + 30, t0 + 56)}><path d="M0,40 C-80,-20 -52,-80 0,-40 C52,-80 80,-20 0,40 Z" fill="#ff5a7a" stroke={INK} strokeWidth={6} /></g>;
};
const Kitchen: React.FC<{ g: number }> = ({ g }) => (
  <g>
    <rect x={-800} y={-1200} width={3040} height={3400} fill="#e9d2a6" />
    {Array.from({ length: 22 }).map((_, i) => <rect key={i} x={i * 120 - 800} y={-1200} width={60} height={3400} fill="#c9a96a" opacity={0.15} />)}
    <rect x={-800} y={GROUND - 30} width={3040} height={1400} fill="#8d6238" />
    <rect x={100} y={700} width={380} height={460} fill="#fff0c4" stroke={INK} strokeWidth={9} /><path d="M290,700 L290,1160 M100,930 L480,930" stroke={INK} strokeWidth={8} />
    <g transform="translate(1100 780)"><circle r={86} fill="#fbfbf8" stroke={INK} strokeWidth={7} /><path d="M0,0 L0,-56" stroke={INK} strokeWidth={6} strokeLinecap="round" transform={`rotate(${g * 0.5})`} /><path d="M0,0 L40,0" stroke={INK} strokeWidth={6} strokeLinecap="round" /></g>
    <rect x={700} y={1030} width={600} height={24} fill="#a8703b" stroke={INK} strokeWidth={5} />
    {[0, 1, 2].map((k) => <rect key={k} x={730 + k * 190} y={930} width={90} height={100} rx={14} fill={["#d9283b", "#27d17f", "#f0b84a"][k]} stroke={INK} strokeWidth={5} />)}
  </g>
);

const SceneW: React.FC<{ g: number }> = ({ g }) => {
  const c = cur(g), spk = L[Math.min(c, L.length - 1)].who, finalLine = c >= L.length - 1;
  const bob = Math.sin(g / 14) * 3;
  const dvPop = g >= at(3, -3) ? Math.max(0.01, pop(g, at(3, -3), 9)) : 0, anPop = g >= at(4, -3) ? Math.max(0.01, pop(g, at(4, -3), 9)) : 0;
  const feed = ramp(g, at(8, 0), at(8, 14)) * (1 - ramp(g, at(9, 8), at(9, 22)));
  const soup = g < at(8, 18);
  const look: [number, number] = finalLine ? [0, 0] : spk === "DEVIL" ? [9, -4] : spk === "ANGEL" ? [-9, -4] : spk === "GRANDMA" ? [9, 0] : [6, 0];
  const phone = g < at(2, 30);
  return (
    <g>
      <Kitchen g={g} />
      <Grandma x={GRX} y={GROUND} s={2.1} facing={-1} mood={mood(MR, g)} talk={talking(g, "GRANDMA")} blink={blinkAt(g, 9)} look={[8, 0]} bob={Math.sin(g / 16) * 2}
        armR={g < at(8, 0) ? 58 : lerp(58, 135, feed)} armL={12} holdR={feed > 0.3 ? <SpoonSide soup={soup} /> : <Spoon soup={false} />} />
      <rect x={640} y={1850} width={860} height={46} rx={8} fill="#b4763e" stroke={INK} strokeWidth={7} />
      <rect x={660} y={1896} width={820} height={344} fill="#f2e6d0" stroke={INK} strokeWidth={6} />
      {Array.from({ length: 8 }).map((_, r) => Array.from({ length: 10 }).map((__, cc) => (r + cc) % 2 === 0 ? <rect key={`${r}-${cc}`} x={660 + cc * 82} y={1896 + r * 43} width={82} height={43} fill="#d9283b" opacity={0.55} /> : null))}
      <g transform="translate(1250 1850)"><rect x={-90} y={-130} width={180} height={130} rx={18} fill="#6b6f80" stroke={INK} strokeWidth={6} /><rect x={-104} y={-140} width={208} height={24} rx={10} fill="#8b8fa3" stroke={INK} strokeWidth={5} /><Steam g={g} /></g>
      <Pipi x={PX} y={GROUND} s={2.1} facing={1} mood={mood(MP, g)} talk={talking(g, "PIPI")} blink={blinkAt(g, 2)} look={look} bob={bob} headTilt={finalLine ? 4 : 0}
        armR={phone ? 108 : 40} elbowR={phone ? -30 : 0} armL={12 + talking(g, "PIPI") * 16 * Math.sin(g * 0.3)} holdR={phone ? <Phone /> : undefined} />
      {anPop > 0 && <Angel x={ANX} y={SY + bob} s={0.5 * anPop} facing={1} mood={mood(MA, g)} talk={talking(g, "ANGEL")} blink={blinkAt(g, 6)} look={[8, 0]} bob={Math.sin(g / 9) * 2} armR={talking(g, "ANGEL") > 0 ? 70 + 20 * Math.sin(g * 0.3) : 30} armL={14} />}
      {dvPop > 0 && <Devil x={DVX} y={SY + bob} s={0.5 * dvPop} facing={c >= 7 ? 1 : -1} mood={mood(MD, g)} talk={talking(g, "DEVIL")} blink={blinkAt(g, 8)} look={[8, 0]} bob={Math.sin(g / 7) * 3}
        sweat={c === 8 ? 0.6 : 0} armR={talking(g, "DEVIL") > 0 ? 100 + 25 * Math.sin(g * 0.45) : 40} armL={14} />}
      <Confetti g={g} />
      <Heart g={g} />
      <rect x={-800} y={-1200} width={3040} height={3800} fill="#ffb35a" opacity={0.1} />
    </g>
  );
};

type Cam = [number, number, number];
const CUP: Cam = [PX, 1580, 2.0], CUG: Cam = [GRX, 1600, 1.9], CUD: Cam = [DVX, 1530, 4.4], CUA: Cam = [ANX, 1530, 4.4], WIDE: Cam = [760, 1700, 1.15], FEED: Cam = [760, 1600, 1.8];
const PLAN: { a: Cam; a2: Cam; split?: number; b?: Cam; b2?: Cam }[] = [
  { a: [PX, 1560, 2.8], a2: [PX, 1560, 2.3] },
  { a: CUG, a2: [GRX, 1600, 2.05] },
  { a: CUP, a2: [PX, 1580, 2.2] },
  { a: CUD, a2: [DVX, 1530, 4.1] },
  { a: CUA, a2: [ANX, 1530, 4.1] },
  { a: CUP, a2: [PX, 1580, 2.2] },
  { a: CUG, a2: [GRX, 1600, 2.1], split: 0.6, b: WIDE, b2: [760, 1700, 1.2] },
  { a: [DVX, 1530, 4.2], a2: [DVX, 1530, 3.9] },
  { a: FEED, a2: [740, 1600, 1.95] },
  { a: [DVX, 1530, 4.2], a2: [DVX, 1530, 3.8] },
  { a: CUP, a2: [PX, 1560, 2.4] },
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
  const sh = i === 0 ? [0] : [];
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
  return <div style={{ position: "absolute", left: 0, right: 0, top: 70 + sh, textAlign: "center", transform: `rotate(-5deg) scale(${k})`, fontFamily: CAPTION_FONT, fontWeight: 800, fontSize: 190, color: "#ffd400", WebkitTextStroke: "12px #0a0d1a", paintOrder: "stroke fill" }}>EP 5</div>;
};

const SFX: Sfx[] = [
  [at(0, 0), "sfx_whoosh", 0.35], [at(0, 2), "sfx_sparkle", 0.5], [at(2, 4), "sfx_coin", 0.4], [at(3, -3), "sfx_pop", 0.45], [at(4, -3), "sfx_sparkle", 0.4],
  [at(8, 14), "sfx_pop", 0.45], [at(9, 10), "sfx_sparkle", 0.5], [at(10, 0), "sfx_thump", 0.6], [at(10, 40), "sfx_ding", 0.35],
];

const Frame: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: "#0e1329" }}>
    <Shots f={f} shots={SHOTS} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)" }} />
    <AbsoluteFill style={{ background: "#ff2d3d", opacity: 0 }} />
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
      <Soundtrack total={EP169_FRAMES} voice={staticFile("projects/pipi-ep5-first-win/narration.mp3")} voiceAt={LEAD} voiceEnd={VOICE_END} music="music_pad" musicLen={1800} amb="amb_night" ambVol={0.2} sfx={SFX} />
    </AbsoluteFill>
  );
};
export const EP169_FRAMES = VOICE_END + 34;
