import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { CAPTION_FONT, eio, eout, Glint, INK, keys, lerp, Mood, pop, ramp, rnd, ShotDef, Shots, Sfx, Soundtrack, VH, VW, blinkAt } from "./kit";
import { Grandma, Guru, Pipi } from "./characters";
import { LEAD, LINES as L, VOICE_END } from "./lines";

// pip.mentor - Pipi ep 2 "The Guru's Secret": a cartoon scene, no narrator. Pipi, the Guru and Grandma talk; free Microsoft voices (one per character).
// 9:16 (1440x2560 world, render at 0.75 -> 1080x1920). Everything is timed from the generated lines.ts, so retiming the audio never breaks the acting.
export const FILM_FRAMES = VOICE_END + 80;

const GROUND = 2240, PX = 330, GX = 900, RX = 1200, GREEN = "#27d17f", GOLD = "#f0b84a";
const at = (i: number, off = 0) => L[i].start + off;
const lineAt = (g: number) => { let c = 0; for (let i = 0; i < L.length; i++) if (g >= L[i].start - 2) c = i; return c; };
const talk = (g: number, who: string) => { const i = L.findIndex((l) => g >= l.start && g <= l.end); return i >= 0 && L[i].who === who ? 0.25 + 0.75 * rnd(`m${who}${Math.floor(g / 3)}`) : 0; };
function pick<T>(arr: T[], i: number): T { return arr[Math.min(i, arr.length - 1)]; }
const MP: Mood[] = ["surprised", "surprised", "happy", "happy", "neutral", "worried", "worried", "neutral", "worried", "neutral", "happy", "happy", "happy", "sly"];
const MG: Mood[] = ["sly", "sly", "sly", "sly", "sly", "sly", "sly", "worried", "worried", "worried", "sad", "sad", "sad", "sad"];
const MR: Mood[] = ["neutral", "neutral", "neutral", "neutral", "neutral", "neutral", "neutral", "neutral", "neutral", "neutral", "happy", "happy", "happy", "happy"];

const GIVE = at(3, 24), BACK = at(10, 22), SIGN0 = at(6, 4), SIGN1 = at(7, 10), ENTER0 = at(7, -14), ENTER1 = at(7, 24);

const SFX: Sfx[] = [
  [at(0, 0), "sfx_whoosh", 0.35], [at(0, 8), "sfx_coin", 0.3], [at(0, 18), "sfx_coin", 0.3],
  [at(1, 0), "sfx_pop", 0.25], [GIVE, "sfx_coin", 0.45], [at(5, 28), "sfx_pop", 0.45], [SIGN0, "sfx_pop", 0.4],
  ...[0, 1, 2, 3, 4, 5].map((k): Sfx => [ENTER0 + k * 7, "sfx_tap", 0.3]),
  [at(9, 26), "sfx_sparkle", 0.5], [BACK, "sfx_whoosh", 0.45], [BACK + 2, "sfx_coin", 0.4],
  [at(12, 12), "sfx_sparkle", 0.4], [at(13, 0), "sfx_thump", 0.7], [at(13, 50), "sfx_ding", 0.35],
];

// ---------- props ----------
const Stack: React.FC<{ n: number }> = ({ n }) => (
  <g>{Array.from({ length: n }).map((_, k) => <g key={k}><ellipse cx={0} cy={-6 - k * 11} rx={34} ry={10} fill="#b88a22" stroke={INK} strokeWidth={3.5} /><ellipse cx={0} cy={-11 - k * 11} rx={34} ry={10} fill={GOLD} stroke={INK} strokeWidth={3.5} /></g>)}</g>
);
const Sign: React.FC = () => (
  <g transform="rotate(-8)">
    <line x1={0} y1={0} x2={0} y2={-150} stroke="#8a5a2b" strokeWidth={12} strokeLinecap="round" />
    <rect x={30} y={-290} width={220} height={140} rx={12} fill="#fff6d5" stroke={INK} strokeWidth={7} />
    <g transform="translate(140 -190) scale(-1 1)"><text x={0} y={0} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={96} fill="#d9283b">$90</text></g>
  </g>
);
const Spoon: React.FC = () => (
  <g transform="rotate(-8)">
    <line x1={0} y1={0} x2={0} y2={-120} stroke="#b9763b" strokeWidth={14} strokeLinecap="round" />
    <ellipse cx={0} cy={-142} rx={24} ry={32} fill="#c98a4b" stroke={INK} strokeWidth={5} />
  </g>
);
const CashRain: React.FC<{ g: number }> = ({ g }) => {
  const fade = 1 - ramp(g, at(1, 0), at(1, 24));
  if (fade <= 0) return null;
  return (
    <g opacity={fade}>{Array.from({ length: 26 }).map((_, i) => {
      const sp = 14 + rnd(`s${i}`) * 14, y = ((g * sp + rnd(`y${i}`) * 3400) % 3400) - 500, x = 60 + rnd(`x${i}`) * 1320, rot = Math.sin(g * 0.1 + i) * 40;
      return <g key={i} transform={`translate(${x} ${y}) rotate(${rot})`}><rect x={-55} y={-28} width={110} height={56} rx={6} fill="#79d493" stroke={INK} strokeWidth={5} /><circle r={16} fill="#4fae6c" stroke={INK} strokeWidth={3} /></g>;
    })}</g>
  );
};
const Bg: React.FC = () => (
  <g>
    <defs><linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1f1b45" /><stop offset="1" stopColor="#f08a5d" /></linearGradient></defs>
    <rect x={-800} y={-1200} width={3040} height={3200} fill="url(#sky2)" />
    <circle cx={1060} cy={1560} r={150} fill="#ffd7a0" opacity={0.9} />
    {Array.from({ length: 14 }).map((_, i) => { const h = 420 + rnd(`bh${i}`) * 520; return <rect key={i} x={-400 + i * 170} y={2000 - h} width={150} height={h} fill="#171a33" />; })}
    <rect x={-800} y={2000} width={3040} height={1800} fill="#2b2d3f" />
    <rect x={-800} y={1990} width={3040} height={14} fill="#4a4d66" />
    <path d="M-800,2420 L2240,2420" stroke="#e8e3c8" strokeWidth={10} strokeDasharray="90 70" opacity={0.6} />
  </g>
);

// ---------- the scene ----------
const Scene: React.FC<{ g: number }> = ({ g }) => {
  const cur = lineAt(g);
  const pStack = g < GIVE || g >= BACK + 24;
  const signOn = g >= SIGN0 && g < SIGN1;
  const gStack = (g >= GIVE && g < SIGN0) || (g >= at(10, 8) && g < BACK);
  const flee = ramp(g, BACK, BACK + 32);
  const gs = 2.1 * (1 + 0.9 * eio(flee)), gy = GROUND + 1000 * eio(flee), gx = lerp(GX, 760, eio(flee));
  const enter = ramp(g, ENTER0, ENTER1), rx = lerp(1750, RX, eio(enter)), walking = g > ENTER0 && g < ENTER1;
  const fb = ramp(g, BACK, BACK + 24), efb = eio(fb);
  const gTalk = talk(g, "GURU");
  const sweatP = keys(g, [[0, 0], [at(5, 0), 0], [at(5, 50), 0.8], [at(10, 40), 0.8], [at(11, 30), 0]]);
  return (
    <g>
      <Bg />
      <CashRain g={g} />
      <Pipi x={PX} y={GROUND} s={2.1} facing={1} mood={pick(MP, cur)} look={g >= at(13, 0) ? [0, 0] : [8, 1]} blink={blinkAt(g, 1)} sweat={sweatP} talk={talk(g, "PIPI")}
        armR={keys(g, [[0, 70], [GIVE - 6, 70], [GIVE, 52], [at(5, 0), 40], [BACK + 24, 40], [BACK + 34, 62], [99999, 62]])} armL={14 + 16 * Math.sin(g * 0.2) * (talk(g, "PIPI") > 0 ? 1 : 0.3)}
        headTilt={g >= at(13, 0) ? 4 : 0} bob={Math.sin(g / 12) * 3} holdR={pStack ? <Stack n={9} /> : undefined} />
      {flee < 1 && (
        <Guru x={gx} y={gy} s={gs} facing={-1} mood={flee > 0 ? "surprised" : pick(MG, cur)} look={[8, 0]} blink={blinkAt(g, 4)} sweat={keys(g, [[0, 0], [at(7, 20), 0], [at(8, 60), 0.9], [99999, 0.9]])} talk={gTalk}
          walk={flee > 0 ? g * 0.9 : 0}
          armR={keys(g, [[0, 130], [at(1, 0), 130], [at(1, 12), 50], [SIGN0 - 4, 50], [SIGN0 + 2, 100], [SIGN1, 100], [SIGN1 + 12, 24], [at(10, 0), 24], [at(10, 8), 60], [BACK, 60], [BACK + 20, 110], [99999, 110]]) + (cur === 0 ? 10 * Math.sin(g * 0.5) : 0)}
          armL={gTalk > 0 ? 20 + 25 * Math.sin(g * 0.25) : 10} headTilt={cur === 4 ? 6 : 0}
          holdR={signOn ? <Sign /> : gStack ? <Stack n={9} /> : undefined} />
      )}
      {g >= ENTER0 && (
        <Grandma x={rx} y={GROUND} s={2.1} facing={-1} mood={pick(MR, cur)} look={[8, 0]} blink={blinkAt(g, 9)} talk={talk(g, "GRANDMA")} walk={walking ? g * 0.45 : 0}
          armR={keys(g, [[0, 58], [at(9, 18), 58], [at(9, 28), 150], [at(10, 20), 150], [at(10, 40), 60], [99999, 60]])} armL={12} holdR={<Spoon />} />
      )}
      {fb > 0 && fb < 1 && <g transform={`translate(${lerp(623, 621, efb)} ${lerp(1830, 1755, efb) - Math.sin(Math.PI * efb) * 300})`}><Stack n={9} /></g>}
      {g >= at(5, 28) && g < SIGN0 + 10 && <g transform={`translate(${PX + 160} 1340) scale(${pop(g, at(5, 28), 10)})`}><text x={0} y={0} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={240} fill="#ffd400" stroke={INK} strokeWidth={12} paintOrder="stroke">?</text></g>}
      {g >= at(12, 14) && <g transform={`translate(${RX} ${1330 - ramp(g, at(12, 14), at(12, 60)) * 80}) scale(${1.4 * pop(g, at(12, 14), 10)})`} opacity={1 - ramp(g, at(12, 50), at(12, 80))}><path d="M0,40 C-80,-20 -52,-80 0,-40 C52,-80 80,-20 0,40 Z" fill="#ff5a7a" stroke={INK} strokeWidth={6} /></g>}
      <Glint x={985} y={1330} t={ramp(g, at(9, 26), at(9, 56))} r={90} />
    </g>
  );
};

// ---------- shots: one per line, cut to the speaker, reaction cut on long lines ----------
type Cam = [number, number, number];
const shot = (from: number, to: number, c0: Cam, c1: Cam, shakes: number[] = []): ShotDef => ({
  from, to, z0: 1, z1: 1,
  render: (l, p) => {
    const g = from + l, e = eio(p), cx = lerp(c0[0], c1[0], e), cy = lerp(c0[1], c1[1], e), z = lerp(c0[2], c1[2], e);
    let sx = 0, sy = 0;
    for (const b of shakes) if (g >= b) { const d = Math.exp(-(g - b) / 4) * 22; sx += Math.sin((g - b) * 2.3) * d; sy += Math.cos((g - b) * 3.1) * d * 0.7; }
    return <g transform={`translate(${VW / 2 + sx} ${VH / 2 + sy}) scale(${z}) translate(${-cx} ${-cy})`}><Scene g={g} /></g>;
  },
});
const cu = (x: number, z: number, y = 1600): Cam => [x, y, z];
const TWO: Cam = [615, 1700, 1.45], TWO2: Cam = [615, 1700, 1.6], WIDE: Cam = [760, 1700, 1.12], WIDE2: Cam = [760, 1700, 1.2];
const PLAN: { a: Cam; a2: Cam; split?: number; b?: Cam; b2?: Cam }[] = [
  { a: cu(GX, 3.4, 1580), a2: cu(GX, 2.5, 1580) },
  { a: cu(PX, 1.9), a2: cu(PX, 2.05), split: 0.62, b: cu(GX, 1.9), b2: cu(GX, 1.97) },
  { a: cu(GX, 1.9), a2: cu(GX, 2.05), split: 0.55, b: TWO, b2: TWO2 },
  { a: TWO, a2: TWO2 },
  { a: cu(GX, 1.8), a2: cu(GX, 2.15), split: 0.64, b: cu(PX, 1.9), b2: cu(PX, 2.0) },
  { a: cu(PX, 1.9), a2: cu(PX, 2.15) },
  { a: TWO, a2: TWO2 },
  { a: WIDE, a2: WIDE2, split: 0.45, b: cu(RX, 1.8), b2: cu(RX, 1.95) },
  { a: cu(GX, 1.8), a2: cu(GX, 2.0) },
  { a: cu(RX, 1.8), a2: cu(RX, 2.0), split: 0.6, b: WIDE, b2: WIDE2 },
  { a: cu(GX, 1.9), a2: cu(GX, 2.0), split: 0.3, b: WIDE, b2: WIDE2 },
  { a: cu(PX, 1.9), a2: cu(PX, 2.05) },
  { a: cu(RX, 1.85), a2: cu(RX, 2.0) },
  { a: cu(PX, 2.0, 1600), a2: cu(PX, 2.4, 1560) },
];
const SHOTS: ShotDef[] = [];
L.forEach((_, i) => {
  const from = i === 0 ? 0 : L[i].start - 3, to = i === L.length - 1 ? FILM_FRAMES + 1 : L[i + 1].start - 3, P = PLAN[Math.min(i, PLAN.length - 1)];
  const sk = i === 0 ? [0] : i === 7 ? [] : [];
  if (P.split && P.b && P.b2) { const mid = Math.round(from + (to - from) * P.split); SHOTS.push(shot(from, mid, P.a, P.a2, sk), shot(mid, to, P.b, P.b2)); }
  else SHOTS.push(shot(from, to, P.a, P.a2, sk));
});

// ---------- overlays ----------
const COL: Record<string, string> = { PIPI: "#8ff5cf", GURU: "#ffd36b", GRANDMA: "#ffc2dd" };
const Subs: React.FC<{ f: number }> = ({ f }) => {
  const i = L.findIndex((l) => f >= l.start - 2 && f <= l.end + 6);
  if (i < 0) return null;
  const l = L[i], words = l.text.split(" "), chunks: string[] = [];
  for (let k = 0; k < words.length; k += 4) chunks.push(words.slice(k, k + 4).join(" "));
  let acc = 0, show = chunks[chunks.length - 1];
  for (const c of chunks) { acc += c.length; if ((f - l.start) / Math.max(1, l.end - l.start) <= acc / l.text.length) { show = c; break; } }
  return <div style={{ position: "absolute", left: 80, right: 80, top: 1700, textAlign: "center", fontFamily: CAPTION_FONT, fontWeight: 800, fontSize: 92, lineHeight: 1.1, color: COL[l.who] ?? "#fff", WebkitTextStroke: "14px #0a0d1a", paintOrder: "stroke fill", textTransform: "uppercase" }}>{show}</div>;
};
const Stamp: React.FC<{ f: number }> = ({ f }) => {
  const t = at(13, 0);
  if (f < t) return null;
  const k = 1 + 0.8 * (1 - eout(ramp(f, t, t + 10)));
  return <div style={{ position: "absolute", top: 360, left: 0, right: 0, textAlign: "center", transform: `scale(${k}) rotate(-5deg)`, fontFamily: CAPTION_FONT, fontWeight: 800, fontSize: 300, color: "#ffd400", WebkitTextStroke: "18px #0a0d1a", paintOrder: "stroke fill" }}>EP 2</div>;
};

export const Film: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#0e1329" }}>
      <Shots f={f} shots={SHOTS} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)" }} />
      <AbsoluteFill style={{ background: "#fff", opacity: 0.9 * (1 - Math.min(1, f / 5)) }} />
      <Subs f={f} />
      <Stamp f={f} />
      <Soundtrack total={FILM_FRAMES} voice={staticFile("projects/pipi-ep2-guru-secret/narration.mp3")} voiceAt={LEAD} voiceEnd={VOICE_END} music="music_pad" musicLen={1800} amb="amb_night" ambVol={0.25} sfx={SFX} />
    </AbsoluteFill>
  );
};
