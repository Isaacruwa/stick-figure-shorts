import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { CAPTION_FONT, eio, eout, Glint, INK, keys, lerp, Mood, pop, ramp, rnd, ShotDef, Shots, Sfx, Soundtrack, VH, VW, blinkAt } from "./kit";
import { Grandma, Guru, Pipi } from "./characters";
import { LEAD, LINES, VOICE_END } from "./lines";

// pip.mentor - Pipi ep 2 "The Guru's Secret" (9:16 cartoon scene, NO narrator: the characters talk).
// Pipi (nine dollars) begs the guru for his secret, pays him, learns the secret is "take other people's money", and Grandma (certified in spoons) gets the money back.
// Everything is driven by LINES (generated from dialogue.txt by tools/make_dialogue.py): shots, mouths, moods and props key off line indexes, not frame numbers.
export const FILM_FRAMES = VOICE_END + 80;
const L = LINES;
const at = (i: number, off = 0) => L[Math.min(i, L.length - 1)].start + off;

const GROUND = 2240, GREEN = "#27d17f", RED = "#ff4d5e", GOLD = "#f0b84a";
const PX = 300, GX = 900, RX = 1200; // Pipi, Guru, Grandma stand positions
const COL: Record<string, string> = { PIPI: "#8ff5cf", GURU: "#ffd36b", GRANDMA: "#ffc2dd" };
// moods per line index (what each character feels while that line is spoken / reacted to)
const MP: Mood[] = ["surprised", "surprised", "happy", "happy", "neutral", "worried", "worried", "neutral", "worried", "neutral", "happy", "happy", "happy", "sly"];
const MG: Mood[] = ["happy", "sly", "sly", "sly", "sly", "sly", "sly", "worried", "worried", "worried", "sad", "sad", "sad", "sad"];
const MR: Mood[] = ["neutral", "neutral", "neutral", "neutral", "neutral", "neutral", "neutral", "neutral", "neutral", "neutral", "neutral", "happy", "happy", "happy"];
const cur = (g: number) => { let c = 0; for (let i = 0; i < L.length; i++) if (g >= L[i].start - 2) c = i; return c; };
const talking = (g: number, who: string) => { const i = L.findIndex((l) => g >= l.start && g <= l.end); return i >= 0 && L[i].who === who ? 0.25 + 0.75 * rnd(`m${who}${Math.floor(g / 3)}`) : 0; };
const mood = (t: Mood[], g: number): Mood => t[Math.min(cur(g), t.length - 1)];

// ---------- props ----------
const Stack: React.FC<{ n?: number }> = ({ n = 9 }) => (
  <g>{Array.from({ length: n }).map((_, k) => <g key={k}><ellipse cx={0} cy={-6 - k * 11 + 4} rx={34} ry={10} fill="#b88a22" stroke={INK} strokeWidth={3} /><ellipse cx={0} cy={-6 - k * 11} rx={34} ry={10} fill={GOLD} stroke={INK} strokeWidth={3.5} /></g>)}</g>
);
const Sign: React.FC = () => (
  <g transform="rotate(-8)">
    <line x1={0} y1={0} x2={0} y2={-120} stroke="#6b4a2f" strokeWidth={12} strokeLinecap="round" />
    <rect x={-95} y={-260} width={190} height={130} rx={12} fill="#f4f1e8" stroke={INK} strokeWidth={7} />
    <text x={0} y={-165} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={90} fill={RED}>$90</text>
  </g>
);
const Spoon: React.FC = () => (
  <g transform="rotate(-8)">
    <line x1={0} y1={0} x2={0} y2={-120} stroke="#b9763b" strokeWidth={14} strokeLinecap="round" />
    <ellipse cx={0} cy={-142} rx={24} ry={32} fill="#c98a4b" stroke={INK} strokeWidth={5} />
  </g>
);
const CashRain: React.FC<{ g: number }> = ({ g }) => {
  const o = 1 - ramp(g, at(1, 0), at(1, 24));
  if (o <= 0) return null;
  return (
    <g opacity={o}>{Array.from({ length: 44 }).map((_, i) => {
      const sp = 20 + rnd(`s${i}`) * 22, y = ((g * sp + rnd(`y${i}`) * 3400) % 3400) - 500, x = 40 + rnd(`x${i}`) * 1360, rot = Math.sin(g * 0.12 + i) * 45;
      return (
        <g key={i} transform={`translate(${x} ${y}) rotate(${rot})`}>
          <rect x={-65} y={-33} width={130} height={66} rx={6} fill="#79d493" stroke={INK} strokeWidth={5} /><circle r={19} fill="#4fae6c" stroke={INK} strokeWidth={3} />
          <text x={0} y={9} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={26} fill={INK}>10</text>
        </g>
      );
    })}</g>
  );
};
const Heart: React.FC<{ g: number }> = ({ g }) => {
  const t0 = at(12, 14);
  if (g < t0) return null;
  const k = pop(g, t0, 10), up = ramp(g, t0, t0 + 50) * 90;
  return <g transform={`translate(${RX} ${1290 - up}) scale(${1.4 * k})`} opacity={1 - ramp(g, t0 + 30, t0 + 56)}><path d="M0,40 C-80,-20 -52,-80 0,-40 C52,-80 80,-20 0,40 Z" fill="#ff5a7a" stroke={INK} strokeWidth={6} /></g>;
};
const Bg: React.FC<{ g: number }> = ({ g }) => (
  <g>
    <defs><linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1f1b45" /><stop offset="1" stopColor="#f08a5d" /></linearGradient></defs>
    <rect x={-800} y={-1200} width={3040} height={3200} fill="url(#sky2)" />
    <circle cx={1060} cy={1560} r={150} fill="#ffd7a0" opacity={0.9} />
    {Array.from({ length: 14 }).map((_, i) => { const h = 420 + rnd(`bh${i}`) * 520; return <rect key={i} x={i * 170 - 500} y={2000 - h} width={150} height={h} fill="#171a33" />; })}
    <rect x={-800} y={2000} width={3040} height={1800} fill="#2b2d3f" />
    <rect x={-800} y={1990} width={3040} height={14} fill="#4a4d66" />
    <path d="M-800,2420 L2240,2420" stroke="#e8e3c8" strokeWidth={10} strokeDasharray="90 70" opacity={0.6} />
    <ellipse cx={GX} cy={GROUND + 6} rx={150} ry={18} fill="#000" opacity={0.25} /><ellipse cx={PX} cy={GROUND + 6} rx={150} ry={18} fill="#000" opacity={0.25} />
  </g>
);

// ---------- the scene ----------
const T_GIVE = at(3, 24), T_THROW = at(10, 36), T_LAND = T_THROW + 22;
const SceneW: React.FC<{ g: number }> = ({ g }) => {
  const pipiHas = g < T_GIVE || g >= T_LAND;
  const signOn = g >= at(6, 2) && g < at(8, 0);
  const guruHas = g >= T_GIVE && g < T_THROW && !signOn;
  const flee = ramp(g, T_THROW, T_THROW + 30), fe = eio(flee);
  const enter = ramp(g, at(7, -14), at(7, 24));
  const rx = lerp(1750, RX, eout(enter)), walking = enter > 0 && enter < 1;
  const spoonUp = ramp(g, at(9, 16), at(9, 28)) * (1 - ramp(g, at(10, 10), at(10, 30)));
  const fly = ramp(g, T_THROW, T_LAND), fe2 = eio(fly);
  const finalLine = cur(g) >= L.length - 1;
  const gm = mood(MG, g), pm = mood(MP, g), rm = mood(MR, g);
  const spk = cur(g) < L.length ? L[cur(g)].who : "";
  return (
    <g>
      <Bg g={g} />
      <CashRain g={g} />
      {/* briefcase of cash */}
      {flee < 1 && <g transform={`translate(${GX + 190} ${GROUND})`}><rect x={-80} y={-96} width={160} height={90} rx={8} fill="#5a3a22" stroke={INK} strokeWidth={6} /><rect x={-66} y={-92} width={132} height={26} fill="#79d493" stroke={INK} strokeWidth={4} /><rect x={-14} y={-60} width={28} height={16} fill={GOLD} stroke={INK} strokeWidth={3} /></g>}
      <Pipi x={PX} y={GROUND} s={2.1} facing={1} mood={pm} talk={talking(g, "PIPI")} blink={blinkAt(g, 2)}
        look={finalLine ? [0, 0] : [8, 0]} sweat={cur(g) >= 5 && cur(g) < 8 ? 0.8 : 0} headTilt={finalLine ? 5 : 0} bob={Math.sin(g / 14) * 3}
        armR={pipiHas ? 62 + (cur(g) <= 2 ? 4 * Math.sin(g * 0.3) : 0) : 30} armL={12 + talking(g, "PIPI") * 18 * Math.sin(g * 0.3)}
        holdR={pipiHas ? <Stack /> : undefined} />
      {flee < 1 && (
        <Guru x={lerp(GX, 760, fe)} y={GROUND + 900 * fe} s={2.1 * (1 + 0.9 * fe)} facing={-1} mood={gm} talk={talking(g, "GURU")} blink={blinkAt(g, 4)}
          look={[8, 0]} sweat={cur(g) >= 7 ? 0.9 : 0} headTilt={cur(g) === 0 ? -5 : cur(g) === 4 ? 6 : 0} bob={Math.sin(g / 12) * 3}
          walk={flee > 0 ? g * 0.9 : 0}
          armR={flee > 0 ? 100 + 40 * Math.sin(g * 0.9) : signOn ? 100 : cur(g) === 0 ? 130 + 10 * Math.sin(g * 0.5) : cur(g) <= 6 ? 50 : 20}
          elbowR={signOn ? -20 : 0} armL={flee > 0 ? -50 * Math.sin(g * 0.9) : 14 + talking(g, "GURU") * 22 * Math.sin(g * 0.25)}
          holdR={flee > 0 ? undefined : signOn ? <Sign /> : guruHas ? <Stack /> : undefined} />
      )}
      {fly > 0 && fly < 1 && <g transform={`translate(${lerp(623, 607, fe2)} ${lerp(1830, 1786, fe2) - Math.sin(Math.PI * fe2) * 380})`}><Stack /></g>}
      {g >= at(7, -14) && (
        <Grandma x={rx} y={GROUND} s={2.1} facing={-1} mood={rm} talk={talking(g, "GRANDMA")} blink={blinkAt(g, 9)} look={[8, 0]} bob={Math.sin(g / 16) * 2}
          walk={walking ? g * 0.45 : 0} armR={lerp(58, 150, spoonUp)} armL={12} holdR={<Spoon />} />
      )}
      {spoonUp > 0.6 && g < at(10, 40) && <Glint x={RX - 330} y={1350} t={ramp(g, at(9, 26), at(9, 54))} r={90} />}
      {cur(g) === 5 && g >= at(5, 26) && <g transform={`translate(${PX + 30} ${1230}) scale(${pop(g, at(5, 26), 10)})`}><text x={0} y={0} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={200} fill="#fff" stroke={INK} strokeWidth={14} paintOrder="stroke">?</text></g>}
      <Heart g={g} />
      {spk === "" && null}
    </g>
  );
};

// ---------- cameras: one shot per line (some split into speaker + reaction/wide) ----------
type Cam = [number, number, number];
const cu = (x: number, z: number, y = 1600): Cam => [x, y, z];
const WIDE: Cam = [740, 1750, 1.15], TWO: Cam = [600, 1700, 1.45];
const PLAN: { a: Cam; a2: Cam; split?: number; b?: Cam; b2?: Cam }[] = [
  { a: cu(GX, 2.9), a2: cu(GX, 2.5) },
  { a: cu(PX, 1.9), a2: cu(PX, 2.05), split: 0.62, b: cu(GX, 1.9), b2: cu(GX, 1.95) },
  { a: cu(GX, 1.9), a2: cu(GX, 2.05), split: 0.55, b: TWO, b2: [600, 1700, 1.55] },
  { a: TWO, a2: [600, 1700, 1.65] },
  { a: cu(GX, 1.8), a2: cu(GX, 2.1), split: 0.62, b: cu(PX, 1.9), b2: cu(PX, 2.0) },
  { a: cu(PX, 1.9), a2: cu(PX, 2.15) },
  { a: TWO, a2: [600, 1700, 1.6] },
  { a: WIDE, a2: [760, 1750, 1.2], split: 0.45, b: cu(RX, 1.8), b2: cu(RX, 1.95) },
  { a: cu(GX, 1.8), a2: cu(GX, 2.0) },
  { a: cu(RX, 1.8), a2: cu(RX, 2.0), split: 0.6, b: WIDE, b2: WIDE },
  { a: cu(GX, 1.9), a2: cu(GX, 2.0), split: 0.4, b: WIDE, b2: [740, 1750, 1.2] },
  { a: cu(PX, 1.9), a2: cu(PX, 2.05) },
  { a: cu(RX, 1.85), a2: cu(RX, 2.0) },
  { a: cu(PX, 2.0), a2: [PX, 1560, 2.4] },
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
  const sh = i === 0 ? [0] : [];
  if (pl.split && pl.b && pl.b2) { const mid = Math.round(from + (to - from) * pl.split); SHOTS.push(mk(from, mid, pl.a, pl.a2, sh), mk(mid, to, pl.b, pl.b2)); }
  else SHOTS.push(mk(from, to, pl.a, pl.a2, sh));
}

// ---------- subtitles, stamp, flash ----------
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
  return <div style={{ position: "absolute", left: 0, right: 0, top: 330 + sh, textAlign: "center", transform: `rotate(-5deg) scale(${k})`, fontFamily: CAPTION_FONT, fontWeight: 800, fontSize: 250, color: "#ffd400", WebkitTextStroke: "16px #0a0d1a", paintOrder: "stroke fill" }}>EP 2</div>;
};

const SFX: Sfx[] = [
  [at(0, 0), "sfx_whoosh", 0.35], [at(0, 8), "sfx_coin", 0.3], [at(0, 18), "sfx_coin", 0.3], [at(0, 30), "sfx_coin", 0.3],
  [at(3, 24), "sfx_coin", 0.45], [at(5, 26), "sfx_pop", 0.45], [at(6, 2), "sfx_pop", 0.45],
  [at(7, -14), "sfx_tap", 0.4], [at(7, -6), "sfx_tap", 0.4], [at(7, 2), "sfx_tap", 0.4], [at(7, 10), "sfx_tap", 0.4], [at(7, 18), "sfx_tap", 0.4],
  [at(9, 26), "sfx_sparkle", 0.5], [T_THROW, "sfx_whoosh", 0.45], [T_THROW + 2, "sfx_coin", 0.4], [T_LAND, "sfx_click", 0.4],
  [at(12, 14), "sfx_sparkle", 0.45], [at(13, 0), "sfx_thump", 0.65], [at(13, 40), "sfx_ding", 0.35],
];

export const Film: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#0e1329" }}>
      <Shots f={f} shots={SHOTS} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)" }} />
      <AbsoluteFill style={{ background: "#fff", opacity: 0.85 * (1 - ramp(f, 0, 8)) }} />
      <Subs f={f} />
      <Stamp f={f} />
      <Soundtrack total={FILM_FRAMES} voice={staticFile("projects/pipi-ep2-guru-secret/narration.mp3")} voiceAt={LEAD} voiceEnd={VOICE_END} music="music_pad" musicLen={1800} amb="amb_night" ambVol={0.2} sfx={SFX} />
    </AbsoluteFill>
  );
};
