import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { CAPTION_FONT, eio, eout, INK, lerp, Mood, pop, ramp, rnd, ShotDef, Shots, Sfx, Soundtrack, VH, VW, blinkAt } from "../_shared169/kit169";
import { Angel, Devil, Grandma, Guru, Pipi } from "./characters";
import { LEAD, LINES, VOICE_END } from "./lines";
// 16:9 camera conversion: the vertical shots were framed for 1440x2560, here they are re-framed for 2560x1440 (close-ups stay close, wides show the whole set)
const zH = (z: number) => (z >= 1.6 ? z * 0.75 : Math.max(1.0, z * 0.85));
const cyH = (cy: number, z: number) => (z >= 1.6 || cy < 1200 ? cy : Math.max(cy, 2300 - 720 / zH(z)));

// pip.mentor - Pipi ep 7 "Ransom Note" (9:16 cartoon scene, no narrator, perfect loop).
// The guru sells a $500 "funded challenge"; Grandma roasts him in three escalating hits (ransom note -> fishing hook with a ring light -> everything he owns is rented).
// Twists: the devil quit Pipi and now sits on the GURU's shoulder ("better benefits than hell"); a "RETURN BY FRIDAY" sticker is slapped on the guru's forehead.
// Button: "If they win when you fail, that's not a mentor." Shots, mouths, moods and props key off LINES (tools/make_dialogue.py), not frame numbers.
export const FILM_FRAMES = VOICE_END + 80;
const L = LINES;
const at = (i: number, off = 0) => L[Math.min(i, L.length - 1)].start + off;

const GROUND = 2240, GREEN = "#27d17f", RED = "#ff4d5e", GOLD = "#f0b84a";
const PX = 300, GX = 900, RX = 1200, SY = 1650, DVX = GX + 110, ANX = PX - 115;
const COL: Record<string, string> = { PIPI: "#8ff5cf", GURU: "#ffd36b", GRANDMA: "#ffc2dd", DEVIL: "#ff7a7a", ANGEL: "#fff3a6" };
const MP: Mood[] = ["neutral", "neutral", "neutral", "worried", "surprised", "neutral", "neutral", "happy", "neutral", "happy", "neutral", "happy", "sly"];
const MG: Mood[] = ["happy", "worried", "sly", "sly", "happy", "worried", "worried", "worried", "worried", "sad", "sad", "sad", "sad"];
const MD: Mood[] = ["sly", "sly", "sly", "sly", "sly", "sly", "happy", "happy", "happy", "sly", "sly", "sly", "sly"];
const MA: Mood[] = ["sly", "sly", "sly", "worried", "worried", "sly", "sly", "surprised", "sly", "sly", "sly", "sly", "happy"];
const MR: Mood[] = ["neutral", "sly", "neutral", "neutral", "neutral", "sly", "neutral", "neutral", "neutral", "sly", "neutral", "sly", "happy"];
const cur = (g: number) => { let c = 0; for (let i = 0; i < L.length; i++) if (g >= L[i].start - 2) c = i; return c; };
const talking = (g: number, who: string) => { const i = L.findIndex((l) => g >= l.start && g <= l.end); return i >= 0 && L[i].who === who ? 0.25 + 0.75 * rnd(`m${who}${Math.floor(g / 3)}`) : 0; };
const mood = (t: Mood[], g: number): Mood => t[Math.min(cur(g), t.length - 1)];

const T_STICK = L[11].end - 8;

const Stack: React.FC<{ n?: number }> = ({ n = 10 }) => (
  <g>{Array.from({ length: n }).map((_, k) => <g key={k}><ellipse cx={0} cy={-6 - k * 11 + 4} rx={34} ry={10} fill="#b88a22" stroke={INK} strokeWidth={3} /><ellipse cx={0} cy={-6 - k * 11} rx={34} ry={10} fill={GOLD} stroke={INK} strokeWidth={3.5} /></g>)}</g>
);
const Sign: React.FC<{ text: string }> = ({ text }) => (
  <g transform="rotate(-8)">
    <line x1={0} y1={0} x2={0} y2={-120} stroke="#6b4a2f" strokeWidth={12} strokeLinecap="round" />
    <rect x={-120} y={-260} width={240} height={130} rx={12} fill="#f4f1e8" stroke={INK} strokeWidth={7} />
    <text x={0} y={-165} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={86} fill={RED}>{text}</text>
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
      const sp = 20 + rnd(`s${i}`) * 22, y = ((g * sp + rnd(`y${i}`) * 3400) % 3400) - 500, x = -560 + rnd(`x${i}`) * 2560, rot = Math.sin(g * 0.12 + i) * 45;
      return (
        <g key={i} transform={`translate(${x} ${y}) rotate(${rot})`}>
          <rect x={-65} y={-33} width={130} height={66} rx={6} fill="#79d493" stroke={INK} strokeWidth={5} /><circle r={19} fill="#4fae6c" stroke={INK} strokeWidth={3} />
          <text x={0} y={9} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={26} fill={INK}>500</text>
        </g>
      );
    })}</g>
  );
};
const Bg: React.FC = () => (
  <g>
    <defs><linearGradient id="sky7" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1f1b45" /><stop offset="1" stopColor="#f08a5d" /></linearGradient></defs>
    <rect x={-800} y={-1200} width={3040} height={3200} fill="url(#sky7)" />
    <circle cx={1060} cy={1560} r={150} fill="#ffd7a0" opacity={0.9} />
    {Array.from({ length: 14 }).map((_, i) => { const h = 420 + rnd(`bh${i}`) * 520; return <rect key={i} x={i * 170 - 500} y={2000 - h} width={150} height={h} fill="#171a33" />; })}
    <rect x={-800} y={2000} width={3040} height={1800} fill="#2b2d3f" />
    <rect x={-800} y={1990} width={3040} height={14} fill="#4a4d66" />
    <path d="M-800,2420 L2240,2420" stroke="#e8e3c8" strokeWidth={10} strokeDasharray="90 70" opacity={0.6} />
    <ellipse cx={GX} cy={GROUND + 6} rx={150} ry={18} fill="#000" opacity={0.25} /><ellipse cx={PX} cy={GROUND + 6} rx={150} ry={18} fill="#000" opacity={0.25} />
  </g>
);

const SceneW: React.FC<{ g: number }> = ({ g }) => {
  const c = cur(g), spk = L[Math.min(c, L.length - 1)].who, finalLine = c >= L.length - 1, bob = Math.sin(g / 14) * 3;
  const yap = talking(g, "GRANDMA");
  const signOn = c <= 4 && g < at(5, -6);
  const stick = g >= T_STICK ? Math.max(0.01, pop(g, T_STICK, 8)) : 0;
  const look: [number, number] = finalLine ? [0, 0] : spk === "GURU" ? [9, 0] : spk === "GRANDMA" ? [9, 0] : spk === "DEVIL" ? [9, -4] : [8, 0];
  return (
    <g>
      <Bg />
      <CashRain g={g} />
      <Pipi x={PX} y={GROUND} s={2.1} facing={1} mood={mood(MP, g)} talk={talking(g, "PIPI")} blink={blinkAt(g, 2)} look={look} bob={bob} headTilt={finalLine ? 4 : 0}
        sweat={c === 3 || c === 4 ? 0.6 : 0} armR={50} armL={12 + talking(g, "PIPI") * 16 * Math.sin(g * 0.3)} holdR={<Stack n={10} />} />
      <Angel x={ANX} y={SY + bob} s={0.5} facing={1} mood={mood(MA, g)} talk={talking(g, "ANGEL")} blink={blinkAt(g, 6)} look={[8, 0]} bob={Math.sin(g / 9) * 2}
        armR={talking(g, "ANGEL") > 0 ? 70 + 20 * Math.sin(g * 0.3) : 30} armL={14} />
      <Guru x={GX} y={GROUND} s={2.1} facing={-1} mood={mood(MG, g)} talk={talking(g, "GURU")} blink={blinkAt(g, 4)} look={[8, 0]} bob={Math.sin(g / 12) * 3}
        sweat={c >= 5 ? 0.8 : 0} headTilt={c === 0 ? -5 : 0}
        armR={signOn ? 100 : 30} elbowR={signOn ? -20 : 0} armL={14 + talking(g, "GURU") * 22 * Math.sin(g * 0.25)}
        holdR={signOn ? <Sign text={c <= 1 ? "$500" : "$500"} /> : undefined} />
      <Devil x={DVX} y={SY + bob} s={0.5} facing={-1} mood={mood(MD, g)} talk={talking(g, "DEVIL")} blink={blinkAt(g, 8)} look={[8, 0]} bob={Math.sin(g / 7) * 3}
        armR={talking(g, "DEVIL") > 0 ? 100 + 25 * Math.sin(g * 0.45) : 40} armL={14} />
      <Grandma x={RX} y={GROUND} s={2.1} facing={-1} mood={mood(MR, g)} talk={yap} blink={blinkAt(g, 9)} look={[8, 0]} bob={Math.sin(g / 12) * 3} headTilt={yap > 0 ? 4 * Math.sin(g * 0.4) : 0}
        armR={c === 1 || c === 5 || c === 9 || c === 11 ? 105 + 6 * Math.sin(g * 0.7) : 58} armL={20 + yap * 45 * Math.sin(g * 0.55)} holdR={<Spoon />} />
      {stick > 0 && (
        <g transform={`translate(${GX} 1452) rotate(-6) scale(${stick})`}>
          <rect x={-170} y={-38} width={340} height={76} rx={8} fill="#ffe14a" stroke={INK} strokeWidth={6} />
          <text x={0} y={13} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={36} fill={INK}>RETURN BY FRIDAY</text>
        </g>
      )}
    </g>
  );
};

type Cam = [number, number, number];
const WIDE: Cam = [740, 1700, 1.15], TWO: Cam = [1050, 1650, 1.5];
const PLAN: { a: Cam; a2: Cam; split?: number; b?: Cam; b2?: Cam }[] = [
  { a: [GX, 1590, 2.7], a2: [GX, 1590, 2.3] },
  { a: [RX, 1590, 2.3], a2: [RX, 1590, 2.0] },
  { a: [GX, 1600, 2.0], a2: [GX, 1600, 2.2] },
  { a: [PX, 1590, 2.0], a2: [PX, 1590, 2.2] },
  { a: [GX, 1600, 2.0], a2: [GX, 1600, 2.3] },
  { a: [RX, 1600, 1.9], a2: [RX, 1600, 2.1], split: 0.55, b: WIDE, b2: [760, 1700, 1.2] },
  { a: [DVX, 1530, 4.4], a2: [DVX, 1530, 4.1] },
  { a: [ANX, 1530, 4.4], a2: [ANX, 1530, 4.1] },
  { a: [DVX, 1530, 4.3], a2: [DVX, 1530, 4.0] },
  { a: [RX, 1600, 2.2], a2: [RX, 1600, 2.0], split: 0.6, b: TWO, b2: [1050, 1650, 1.7] },
  { a: [GX, 1600, 2.1], a2: [GX, 1600, 2.4] },
  { a: [RX, 1600, 2.2], a2: [RX, 1600, 2.0], split: 0.55, b: [GX, 1480, 3.2], b2: [GX, 1480, 3.5] },
  { a: [PX, 1580, 2.2], a2: [PX, 1560, 2.5] },
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
  const sh = i === 0 ? [0] : i === 11 ? [T_STICK] : [];
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
  return <div style={{ position: "absolute", left: 320, right: 320, top: 1130, textAlign: "center", fontFamily: CAPTION_FONT, fontWeight: 800, fontSize: 66, lineHeight: 1.1, color: COL[l.who] ?? "#fff", WebkitTextStroke: "10px #0a0d1a", paintOrder: "stroke fill", textTransform: "uppercase" }}>{show}</div>;
};
const Stamp: React.FC<{ f: number }> = ({ f }) => {
  const t0 = at(L.length - 1, 0);
  if (f < t0) return null;
  const k = 1 + 0.6 * (1 - eout(ramp(f, t0, t0 + 10))), sh = Math.exp(-(f - t0) / 4) * 14 * Math.sin((f - t0) * 2.3);
  return <div style={{ position: "absolute", left: 0, right: 0, top: 70 + sh, textAlign: "center", transform: `rotate(-5deg) scale(${k})`, fontFamily: CAPTION_FONT, fontWeight: 800, fontSize: 190, color: "#ffd400", WebkitTextStroke: "12px #0a0d1a", paintOrder: "stroke fill" }}>EP 7</div>;
};

const SFX: Sfx[] = [
  [at(0, 0), "sfx_whoosh", 0.35], [at(0, 6), "sfx_coin", 0.3], [at(0, 16), "sfx_coin", 0.3], [L[1].end + 1, "sfx_burn", 0.6], [L[1].end + 6, "sfx_rimshot", 0.4],
  [L[5].end + 1, "sfx_burn", 0.65], [L[8].end + 2, "sfx_rimshot", 0.45], [L[9].end + 1, "sfx_burn", 0.7], [T_STICK, "sfx_click", 0.7], [T_STICK + 1, "sfx_burn", 0.6], [T_STICK + 6, "sfx_rimshot", 0.5],
  [at(12, 0), "sfx_thump", 0.65], [at(12, 40), "sfx_ding", 0.35],
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
      <Soundtrack total={EP169_FRAMES} voice={staticFile("projects/pipi-ep7-ransom-note/narration.mp3")} voiceAt={LEAD} voiceEnd={VOICE_END} music="music_pad" musicLen={1800} amb="amb_night" ambVol={0.2} sfx={SFX} />
    </AbsoluteFill>
  );
};
export const EP169_FRAMES = VOICE_END + 34;
