import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { CAPTION_FONT, eio, eout, INK, lerp, Mood, pop, ramp, rnd, ShotDef, Shots, Sfx, Soundtrack, VH, VW, blinkAt } from "./kit";
import { Devil, Grandma, Pipi } from "./characters";
import { LEAD, LINES, VOICE_END } from "./lines";

// pip.mentor - Pipi ep 9 "Leverage" (9:16 cartoon scene, no narrator, perfect loop). CLEAN STAGING: three characters spread out (Devil left, trampoline + pit centre, Grandma right).
// Leverage as a trampoline over a lava pit: the devil's remote cranks it from 500x to 1000x, Pipi bounces higher, the mat rips, he drops into the lava ("liquidated") and sits in it like a hot spring.
// Grandma roasts the devil and throws her spoon like a boomerang. Button: "Leverage doesn't make you rich faster. It makes you broke faster."
// Shots, mouths, moods and props key off LINES (tools/make_dialogue.py), not frame numbers.
export const FILM_FRAMES = VOICE_END + 80;
const L = LINES;
const at = (i: number, off = 0) => L[Math.min(i, L.length - 1)].start + off;

const GROUND = 2240, GREEN = "#27d17f", RED = "#ff4d5e";
const DX = 200, RX = 1300, PXC = 720, PIT_L = 380, PIT_R = 1060, TR = 2130, LAVA_Y = 2300;
const COL: Record<string, string> = { PIPI: "#8ff5cf", DEVIL: "#ff7a7a", GRANDMA: "#ffc2dd" };
const MP: Mood[] = ["happy", "happy", "happy", "worried", "happy", "worried", "surprised", "sad", "neutral", "neutral", "neutral", "sad"];
const MD: Mood[] = ["happy", "happy", "sly", "happy", "happy", "worried", "worried", "sly", "happy", "happy", "sad", "sad"];
const MR: Mood[] = ["neutral", "neutral", "sly", "neutral", "neutral", "sly", "neutral", "happy", "sly", "sly", "neutral", "happy"];
const cur = (g: number) => { let c = 0; for (let i = 0; i < L.length; i++) if (g >= L[i].start - 2) c = i; return c; };
const talking = (g: number, who: string) => { const i = L.findIndex((l) => g >= l.start && g <= l.end); return i >= 0 && L[i].who === who ? 0.25 + 0.75 * rnd(`m${who}${Math.floor(g / 3)}`) : 0; };
const mood = (t: Mood[], g: number): Mood => t[Math.min(cur(g), t.length - 1)];

// ---- Pipi's physics: bounce (amplitude grows when the devil cranks the remote), final giant jump, mat rips, lava ----
const P = 36;
const T_CRANK = at(4, 8);
const T_JUMP = Math.ceil((L[6].start - 14) / P) * P, T_RIP = T_JUMP + 54, T_SPLASH = T_JUMP + 70;
const T_THROW = L[9].start + 6, T_HIT = T_THROW + 12, T_BACK = T_HIT + 14;
const pipiY = (g: number): number => {
  if (g < T_JUMP) { const A = g < T_CRANK ? 520 : lerp(520, 1500, ramp(g, T_CRANK, T_CRANK + 30)), ph = (g % P) / P; return TR - A * 4 * ph * (1 - ph); }
  const dt = g - T_JUMP;
  if (dt <= 54) return TR - 2300 * 4 * (dt / 54) * (1 - dt / 54);
  if (dt <= 70) return lerp(TR, 2480, Math.pow((dt - 54) / 16, 1.5));
  return 2480 + Math.sin(g / 18) * 6;
};
const airborne = (g: number) => g < T_SPLASH && pipiY(g) < TR - 40;

const Remote: React.FC<{ lcd: string; knob: number }> = ({ lcd, knob }) => (
  <g transform="rotate(-6)">
    <line x1={50} y1={-190} x2={50} y2={-260} stroke={INK} strokeWidth={8} strokeLinecap="round" /><circle cx={50} cy={-266} r={10} fill={RED} stroke={INK} strokeWidth={4} />
    <rect x={-40} y={-200} width={120} height={200} rx={16} fill="#2b2f4a" stroke={INK} strokeWidth={7} />
    <rect x={-28} y={-186} width={96} height={54} rx={8} fill="#0a1a12" stroke={INK} strokeWidth={4} />
    <text x={20} y={-146} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={34} fill={GREEN}>{lcd}</text>
    <circle cx={20} cy={-76} r={32} fill="#d9283b" stroke={INK} strokeWidth={5} /><line x1={20} y1={-76} x2={20 + 26 * Math.sin(knob)} y2={-76 - 26 * Math.cos(knob)} stroke="#fff" strokeWidth={7} strokeLinecap="round" />
  </g>
);
const Spoon: React.FC = () => (
  <g transform="rotate(-8)">
    <line x1={0} y1={0} x2={0} y2={-120} stroke="#b9763b" strokeWidth={14} strokeLinecap="round" />
    <ellipse cx={0} cy={-142} rx={24} ry={32} fill="#c98a4b" stroke={INK} strokeWidth={5} />
  </g>
);
const Stars: React.FC<{ x: number; y: number; g: number }> = ({ x, y, g }) => (
  <g>{[0, 1, 2].map((k) => { const a = g * 0.3 + k * 2.1; return <path key={k} d="M0,-14 L4,-4 L14,-3 L6,3 L9,13 L0,7 L-9,13 L-6,3 L-14,-3 L-4,-4 Z" fill="#ffd400" stroke={INK} strokeWidth={2} transform={`translate(${x + 62 * Math.cos(a)} ${y + 18 * Math.sin(a)})`} />; })}</g>
);
const Yard: React.FC<{ g: number }> = ({ g }) => {
  const ripped = g >= T_RIP, sag = !ripped && !airborne(g) && g < T_JUMP ? 40 : 0, splash = ramp(g, T_SPLASH, T_SPLASH + 26);
  return (
    <g>
      <defs>
        <linearGradient id="sky9" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5aa9ee" /><stop offset="1" stopColor="#cfe9ff" /></linearGradient>
        <linearGradient id="lava9" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd25a" /><stop offset="0.5" stopColor="#ff7a1a" /><stop offset="1" stopColor="#c2260c" /></linearGradient>
        <radialGradient id="glow9"><stop offset="0" stopColor="#ff9a3a" stopOpacity={0.55} /><stop offset="1" stopColor="#ff9a3a" stopOpacity={0} /></radialGradient>
      </defs>
      <rect x={-800} y={-1400} width={3040} height={3500} fill="url(#sky9)" />
      <circle cx={1180} cy={560} r={120} fill="#fff3b0" opacity={0.95} />
      {[0, 1, 2].map((k) => <ellipse key={k} cx={260 + k * 480 + (g * 0.3) % 80} cy={420 + k * 130} rx={170} ry={54} fill="#fff" opacity={0.9} />)}
      <rect x={-800} y={1760} width={3040} height={500} fill="#8a5a36" />{Array.from({ length: 30 }).map((_, i) => <rect key={i} x={-760 + i * 100} y={1740} width={70} height={280} fill={i % 2 ? "#a06a40" : "#946138"} stroke={INK} strokeWidth={4} />)}
      <rect x={-800} y={2000} width={3040} height={240} fill="#58b868" />
      <rect x={-800} y={GROUND} width={3040} height={1400} fill="#3f9a50" />
      <rect x={PIT_L} y={GROUND} width={PIT_R - PIT_L} height={1200} fill="#4a2a1a" stroke={INK} strokeWidth={8} />
      <ellipse cx={PXC} cy={GROUND + 120} rx={460} ry={260} fill="url(#glow9)" />
      <rect x={PIT_L + 6} y={LAVA_Y} width={PIT_R - PIT_L - 12} height={900} fill="url(#lava9)" />
      {[0, 1, 2, 3, 4].map((k) => { const t = ((g * 0.03 + k * 0.21) % 1); return <circle key={k} cx={PIT_L + 90 + k * 125} cy={LAVA_Y + 30 + 30 * Math.sin(g * 0.1 + k)} r={16 + 8 * t} fill="#ffd25a" stroke={INK} strokeWidth={3} opacity={0.9} />; })}
      {splash > 0 && splash < 1 && [0, 1, 2, 3, 4, 5].map((k) => <circle key={k} cx={PXC + (k - 2.5) * 70 * splash} cy={LAVA_Y - 520 * Math.sin(Math.PI * splash) * (1 - 0.1 * Math.abs(k - 2.5))} r={24 * (1 - splash * 0.4)} fill="#ff9a1a" stroke={INK} strokeWidth={4} />)}
      {/* trampoline: posts, springs and the mat (rips when overloaded) */}
      <rect x={PIT_L - 24} y={TR} width={30} height={GROUND - TR} fill="#2b2f4a" stroke={INK} strokeWidth={5} /><rect x={PIT_R - 6} y={TR} width={30} height={GROUND - TR} fill="#2b2f4a" stroke={INK} strokeWidth={5} />
      {!ripped ? (
        <path d={`M ${PIT_L - 10},${TR} Q ${PXC},${TR + 2 * sag} ${PIT_R + 10},${TR}`} fill="none" stroke="#1d1d2e" strokeWidth={22} strokeLinecap="round" />
      ) : (
        <g><path d={`M ${PIT_L - 10},${TR} Q ${PIT_L + 130},${TR + 70} ${PXC - 60},${TR + 150}`} fill="none" stroke="#1d1d2e" strokeWidth={22} strokeLinecap="round" /><path d={`M ${PIT_R + 10},${TR} Q ${PIT_R - 130},${TR + 70} ${PXC + 60},${TR + 150}`} fill="none" stroke="#1d1d2e" strokeWidth={22} strokeLinecap="round" /></g>
      )}
      {Array.from({ length: 9 }).map((_, k) => <line key={k} x1={PIT_L + 40 + k * 75} y1={TR} x2={PIT_L + 40 + k * 75} y2={TR + 18} stroke={INK} strokeWidth={5} opacity={ripped && Math.abs(PIT_L + 40 + k * 75 - PXC) < 120 ? 0 : 1} />)}
    </g>
  );
};

const SceneW: React.FC<{ g: number }> = ({ g }) => {
  const c = cur(g), finalLine = c >= L.length - 1, bob = Math.sin(g / 14) * 3;
  const yap = talking(g, "GRANDMA"), py = pipiY(g), air = airborne(g), inLava = g >= T_SPLASH;
  const crank = ramp(g, T_CRANK, T_CRANK + 20), lcd = g >= T_CRANK + 6 ? "x1000" : "x500";
  const flight = ramp(g, T_THROW, T_HIT), back = ramp(g, T_HIT, T_BACK), spoonHome = g < T_THROW || g >= T_BACK;
  const hit = g >= T_HIT ? Math.max(0, 1 - ramp(g, T_HIT + 40, T_HIT + 70)) : 0;
  const sx = flight < 1 && g >= T_THROW ? lerp(RX - 300, DX + 30, eio(flight)) : g >= T_HIT && g < T_BACK ? lerp(DX + 30, RX - 300, eio(back)) : 0;
  const sy = g >= T_THROW && g < T_BACK ? 1530 - 170 * Math.sin(Math.PI * (g < T_HIT ? flight : back)) : 0;
  const look: [number, number] = finalLine ? [0, 0] : [8, 0];
  const smoke = inLava ? 1 : 0;
  return (
    <g>
      <Yard g={g} />
      <Devil x={DX} y={GROUND} s={2.1} facing={1} mood={g >= T_HIT && c <= 10 ? "sad" : mood(MD, g)} talk={talking(g, "DEVIL")} blink={blinkAt(g, 8)} look={[8, 0]} bob={Math.sin(g / 12) * 3}
        sweat={c >= 5 && c < 8 ? 0.6 : 0} headTilt={hit > 0 ? 12 * hit : 0} armR={150 + 8 * Math.sin(g * 0.5) + 30 * crank * Math.sin(g * 0.9)} elbowR={-40} armL={14 + talking(g, "DEVIL") * 22 * Math.sin(g * 0.25)}
        holdR={<Remote lcd={lcd} knob={0.6 + 2.2 * crank} />} />
      {hit > 0.01 && <Stars x={DX} y={GROUND - 735} g={g} />}
      <Pipi x={PXC} y={py} s={2.1} facing={1} mood={mood(MP, g)} talk={talking(g, "PIPI")} blink={blinkAt(g, 2)} look={inLava ? look : air ? [0, -5] : look} bob={inLava ? 2 : 0} headTilt={finalLine ? 4 : 0}
        sweat={c >= 3 && c < 7 ? 0.5 : inLava ? 0.9 : 0} walk={air ? g * 0.8 : 0} armR={air ? 150 + 20 * Math.sin(g * 0.6) : 28} armL={air ? 150 + 20 * Math.cos(g * 0.6) : 28} />
      {/* lava in front of Pipi's legs when he sits in the pit */}
      {inLava && <rect x={PIT_L + 6} y={LAVA_Y} width={PIT_R - PIT_L - 12} height={900} fill="url(#lava9)" />}
      {inLava && [0, 1, 2, 3].map((k) => { const t = ((g * 0.035 + k * 0.25) % 1); return <ellipse key={k} cx={PXC - 30 + (k - 1.5) * 28 + Math.sin(g * 0.1 + k) * 14} cy={1560 - 420 * t} rx={26 + 22 * t} ry={20 + 16 * t} fill="#6b6b78" opacity={0.55 * (1 - t)} />; })}
      <Grandma x={RX} y={GROUND} s={2.1} facing={-1} mood={mood(MR, g)} talk={yap} blink={blinkAt(g, 9)} look={[8, 0]} bob={Math.sin(g / 12) * 3} headTilt={yap > 0 ? 4 * Math.sin(g * 0.4) : 0}
        armR={c === 7 ? 95 : g >= T_THROW - 8 && g < T_THROW + 4 ? 125 : 58 + (yap > 0 ? 8 * Math.sin(g * 0.7) : 0)} armL={20 + yap * 45 * Math.sin(g * 0.55)} holdR={spoonHome ? <Spoon /> : undefined} />
      {!spoonHome && <g transform={`translate(${sx} ${sy}) rotate(${g * 38})`}><g transform="scale(0.9) translate(0 70)"><Spoon /></g></g>}
    </g>
  );
};

type Cam = [number, number, number];
const WIDE: Cam = [720, 1280, 1.0], CUD: Cam = [330, 1540, 2.5], CUR: Cam = [RX, 1600, 2.1];
const FOLLOW = (g: number) => Math.max(1000, Math.min(1750, pipiY(g) - 250));
const PLAN: { a: Cam | "follow"; a2?: Cam; z?: number; split?: number; b?: Cam | "follow"; b2?: Cam; zb?: number }[] = [
  { a: [330, 1540, 2.8], a2: [330, 1540, 2.4] },
  { a: "follow", z: 1.5 },
  { a: CUR, a2: [RX, 1600, 2.3] },
  { a: "follow", z: 1.7 },
  { a: CUD, a2: [330, 1540, 2.7] },
  { a: [RX, 1600, 2.0], a2: [RX, 1600, 2.2], split: 0.5, b: WIDE, b2: WIDE },
  { a: WIDE, a2: WIDE },
  { a: [980, 1750, 1.3], a2: [940, 1750, 1.45] },
  { a: [200, 1560, 2.2], a2: [200, 1560, 2.5] },
  { a: [720, 1700, 1.1], a2: [720, 1700, 1.1] },
  { a: [200, 1560, 2.8], a2: [200, 1560, 3.1] },
  { a: [720, 1900, 2.0], a2: [720, 1880, 2.3] },
];
const mk = (from: number, to: number, c0: Cam | "follow", c1: Cam | undefined, z: number | undefined, shakes: number[] = []): ShotDef => ({
  from, to, z0: 1, z1: 1,
  render: (l, p) => {
    const g = from + l, e = eio(p);
    let cx: number, cy: number, zz: number;
    if (c0 === "follow") { cx = 720; cy = FOLLOW(g); zz = z ?? 1.5; }
    else { const b = c1 ?? c0; cx = lerp(c0[0], b[0], e); cy = lerp(c0[1], b[1], e); zz = lerp(c0[2], b[2], e); }
    let sx = 0, sy = 0;
    for (const b of shakes) if (g >= b) { const d = Math.exp(-(g - b) / 4) * 22; sx += Math.sin((g - b) * 2.3) * d; sy += Math.cos((g - b) * 3.1) * d * 0.7; }
    return <g transform={`translate(${VW / 2 + sx} ${VH / 2 + sy}) scale(${zz}) translate(${-cx} ${-cy})`}><SceneW g={g} /></g>;
  },
});
const SHOTS: ShotDef[] = [];
for (let i = 0; i < L.length; i++) {
  const from = i === 0 ? 0 : L[i].start - 3, to = i === L.length - 1 ? FILM_FRAMES + 1 : L[i + 1].start - 3, pl = PLAN[Math.min(i, PLAN.length - 1)];
  const sh = i === 0 ? [0] : i === 6 ? [T_RIP, T_SPLASH] : i === 9 ? [T_HIT] : [];
  if (pl.split && pl.b) { const mid = Math.round(from + (to - from) * pl.split); SHOTS.push(mk(from, mid, pl.a, pl.a2, pl.z, sh.filter((x) => x < mid)), mk(mid, to, pl.b, pl.b2, pl.zb, sh.filter((x) => x >= mid))); }
  else SHOTS.push(mk(from, to, pl.a, pl.a2, pl.z, sh));
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
  return <div style={{ position: "absolute", left: 0, right: 0, top: 330 + sh, textAlign: "center", transform: `rotate(-5deg) scale(${k})`, fontFamily: CAPTION_FONT, fontWeight: 800, fontSize: 250, color: "#ffd400", WebkitTextStroke: "16px #0a0d1a", paintOrder: "stroke fill" }}>EP 9</div>;
};

const SFX: Sfx[] = [
  [at(0, 0), "sfx_whoosh", 0.35], [at(0, 6), "sfx_sparkle", 0.35], [at(1, 0), "sfx_boing", 0.4], [L[2].end + 1, "sfx_burn", 0.6], [T_CRANK, "sfx_click", 0.55], [T_CRANK + 2, "sfx_whoosh", 0.4],
  [L[5].end + 1, "sfx_burn", 0.65], [T_JUMP, "sfx_boing", 0.5], [T_JUMP + 28, "sfx_whistle", 0.45], [T_RIP, "sfx_rip", 0.7], [T_SPLASH, "sfx_splash", 0.7], [T_SPLASH + 2, "sfx_burn", 0.7],
  [T_THROW, "sfx_whoosh", 0.5], [T_HIT, "sfx_tap", 0.9], [T_HIT + 2, "sfx_rimshot", 0.5], [T_BACK, "sfx_pop", 0.4], [at(11, 0), "sfx_thump", 0.65], [at(11, 40), "sfx_ding", 0.35],
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
      <Soundtrack total={FILM_FRAMES} voice={staticFile("projects/pipi-ep9-leverage/narration.mp3")} voiceAt={LEAD} voiceEnd={VOICE_END} music="music_pad" musicLen={1800} amb="amb_night" ambVol={0.2} sfx={SFX} />
    </AbsoluteFill>
  );
};
