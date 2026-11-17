import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { CAPTION_FONT, eio, eout, INK, lerp, Mood, pop, ramp, rnd, ShotDef, Shots, Sfx, Soundtrack, VH, VW, blinkAt } from "./kit";
import { Angel, Devil, Grandma, Pipi } from "./characters";
import { LEAD, LINES, VOICE_END } from "./lines";

// pip.mentor - Pipi ep 6 "FOMO Roast" (9:16 cartoon scene, no narrator, perfect loop).
// Grandma (speed-talking roast queen) and the Angel (sweet assassin) roast the Devil in three escalating insults while he tempts Pipi to FOMO-buy.
// Payoffs: he cries, faints, and is carried out by the horns ("security carried you out by the horns"). Button: "If you're late, you're their exit."
// Shots, mouths, moods and props key off LINES (tools/make_dialogue.py), not frame numbers.
export const FILM_FRAMES = VOICE_END + 80;
const L = LINES;
const at = (i: number, off = 0) => L[Math.min(i, L.length - 1)].start + off;

const GROUND = 2240, GREEN = "#27d17f", RED = "#ff4d5e";
const PX = 420, DVX = PX + 115, ANX = PX - 115, SY = 1650, GRX = 1000;
const COL: Record<string, string> = { PIPI: "#8ff5cf", DEVIL: "#ff7a7a", ANGEL: "#fff3a6", GRANDMA: "#ffc2dd" };
const MP: Mood[] = ["neutral", "neutral", "neutral", "happy", "worried", "neutral", "surprised", "happy", "neutral", "surprised", "worried", "surprised", "surprised", "sly"];
const MD: Mood[] = ["sly", "surprised", "sly", "sly", "happy", "worried", "worried", "sly", "happy", "sad", "sad", "sad", "surprised", "sad"];
const MA: Mood[] = ["sly", "sly", "sly", "happy", "worried", "sly", "happy", "sly", "sly", "sly", "sly", "sly", "sly", "happy"];
const MR: Mood[] = ["sly", "neutral", "neutral", "neutral", "neutral", "sly", "neutral", "neutral", "neutral", "sly", "neutral", "neutral", "neutral", "happy"];
const cur = (g: number) => { let c = 0; for (let i = 0; i < L.length; i++) if (g >= L[i].start - 2) c = i; return c; };
const talking = (g: number, who: string) => { const i = L.findIndex((l) => g >= l.start && g <= l.end); return i >= 0 && L[i].who === who ? 0.25 + 0.75 * rnd(`m${who}${Math.floor(g / 3)}`) : 0; };
const mood = (t: Mood[], g: number): Mood => t[Math.min(cur(g), t.length - 1)];

const T_CRY = at(9, 20), T_FAINT = L[11].end - 4, T_GRAB = at(12, -14), T_LIFT = at(12, -2), T_WAKE = at(12, 2);

const Phone: React.FC = () => (
  <g transform="rotate(-8)">
    <rect x={-25} y={-290} width={170} height={280} rx={20} fill="#10162b" stroke={INK} strokeWidth={6} />
    <polyline points="-5,-60 30,-90 55,-80 85,-170 125,-240" fill="none" stroke={GREEN} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
    <text x={60} y={-250} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={44} fill={GREEN}>+400%</text>
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
const Steam: React.FC<{ g: number }> = ({ g }) => (
  <g>{[0, 1, 2].map((k) => { const t = ((g * 1.2 + k * 26) % 78) / 78; return <path key={k} d="M0,0 q 14,-24 0,-48 q -14,-24 0,-48" fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" opacity={0.6 * (1 - t)} transform={`translate(${-30 + k * 30} ${-90 - t * 90})`} />; })}</g>
);
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
  const c = cur(g), spk = L[Math.min(c, L.length - 1)].who, finalLine = c >= L.length - 1, bob = Math.sin(g / 14) * 3;
  const grab = eio(ramp(g, T_GRAB, T_GRAB + 10)), le = eio(ramp(g, T_LIFT, T_LIFT + 70)), attached = g >= T_GRAB + 10;
  const ax = lerp(ANX, DVX, grab) + 260 * le, ay = SY + bob * (1 - grab) - 152 * grab - 2500 * le;
  const dvx = attached ? DVX + 260 * le : DVX, dvy = attached ? SY - 2500 * le : SY + bob;
  const faint = eio(ramp(g, T_FAINT, T_FAINT + 8)) * (1 - eio(ramp(g, T_WAKE, T_WAKE + 6)));
  const cry = ramp(g, T_CRY, T_CRY + 14) * (g < T_FAINT ? 1 : 0);
  const look: [number, number] = finalLine ? [0, 0] : spk === "DEVIL" ? [9, -4] : spk === "ANGEL" ? [-9, -4] : spk === "GRANDMA" ? [9, 0] : [6, 0];
  const phone = g < at(6, 30);
  const yap = talking(g, "GRANDMA");
  return (
    <g>
      <Kitchen g={g} />
      <Grandma x={GRX} y={GROUND} s={2.1} facing={-1} mood={mood(MR, g)} talk={yap} blink={blinkAt(g, 9)} look={[8, 0]} bob={Math.sin(g / 12) * 3} headTilt={yap > 0 ? 4 * Math.sin(g * 0.4) : 0}
        armR={c === 0 || c === 9 ? 105 + 6 * Math.sin(g * 0.7) : 58} armL={20 + yap * 45 * Math.sin(g * 0.55)} holdR={<Spoon />} />
      <rect x={640} y={1850} width={860} height={46} rx={8} fill="#b4763e" stroke={INK} strokeWidth={7} />
      <rect x={660} y={1896} width={820} height={344} fill="#f2e6d0" stroke={INK} strokeWidth={6} />
      {Array.from({ length: 8 }).map((_, r) => Array.from({ length: 10 }).map((__, cc) => (r + cc) % 2 === 0 ? <rect key={`${r}-${cc}`} x={660 + cc * 82} y={1896 + r * 43} width={82} height={43} fill="#d9283b" opacity={0.55} /> : null))}
      <g transform="translate(1250 1850)"><rect x={-90} y={-130} width={180} height={130} rx={18} fill="#6b6f80" stroke={INK} strokeWidth={6} /><rect x={-104} y={-140} width={208} height={24} rx={10} fill="#8b8fa3" stroke={INK} strokeWidth={5} /><Steam g={g} /></g>
      <Pipi x={PX} y={GROUND} s={2.1} facing={1} mood={mood(MP, g)} talk={talking(g, "PIPI")} blink={blinkAt(g, 2)} look={look} bob={bob} headTilt={finalLine ? 4 : 0}
        armR={phone ? 108 : 40} elbowR={phone ? -30 : 0} armL={12 + talking(g, "PIPI") * 16 * Math.sin(g * 0.3)} holdR={phone ? <Phone /> : undefined} />
      <g transform={faint > 0.001 ? `rotate(${80 * faint} ${dvx} ${dvy})` : undefined}>
        <Devil x={dvx} y={dvy} s={0.5} facing={-1} mood={mood(MD, g)} talk={talking(g, "DEVIL")} blink={faint > 0.5 ? 0.04 : blinkAt(g, 8)} look={[8, 0]} cry={cry}
          bob={attached ? 0 : Math.sin(g / 7) * 3} sweat={c === 8 ? 0.6 : 0} armR={talking(g, "DEVIL") > 0 ? 100 + 25 * Math.sin(g * 0.45) : 40} armL={14} />
        {faint > 0.1 && <Stars x={dvx} y={dvy - 215} g={g} />}
      </g>
      <Angel x={ax} y={ay} s={0.5} facing={1} mood={mood(MA, g)} talk={talking(g, "ANGEL")} blink={blinkAt(g, 6)} look={[8, 0]} bob={attached ? 0 : Math.sin(g / 9) * 2}
        armR={g >= T_GRAB ? 12 : talking(g, "ANGEL") > 0 ? 70 + 20 * Math.sin(g * 0.3) : 30} armL={g >= T_GRAB ? 12 : 14} />
    </g>
  );
};

type Cam = [number, number, number];
const WIDE: Cam = [760, 1700, 1.15];
const PLAN: { a: Cam; a2: Cam; split?: number; b?: Cam; b2?: Cam }[] = [
  { a: [GRX, 1590, 2.4], a2: [GRX, 1590, 2.0] },
  { a: [DVX, 1530, 4.6], a2: [DVX, 1530, 4.2] },
  { a: [ANX, 1530, 4.4], a2: [ANX, 1530, 4.1] },
  { a: [PX, 1580, 2.0], a2: [PX, 1580, 2.2] },
  { a: [DVX, 1530, 4.5], a2: [DVX, 1530, 4.1] },
  { a: [GRX, 1600, 1.9], a2: [GRX, 1600, 2.1], split: 0.6, b: WIDE, b2: [760, 1700, 1.2] },
  { a: [PX, 1580, 2.1], a2: [PX, 1580, 2.5] },
  { a: [ANX, 1530, 4.2], a2: [ANX, 1530, 4.0] },
  { a: [DVX, 1530, 4.3], a2: [DVX, 1530, 4.0] },
  { a: [GRX, 1600, 2.2], a2: [GRX, 1600, 2.0], split: 0.55, b: [DVX, 1530, 4.0], b2: [DVX, 1530, 3.7] },
  { a: [DVX, 1530, 3.8], a2: [DVX, 1530, 3.4] },
  { a: [ANX, 1530, 4.2], a2: [ANX, 1530, 4.0], split: 0.62, b: [DVX, 1530, 4.0], b2: [DVX, 1530, 3.6] },
  { a: [700, 1500, 1.0], a2: [820, 700, 1.0] },
  { a: [PX, 1560, 2.2], a2: [PX, 1540, 2.5] },
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
  const sh = i === 0 ? [0] : i === 11 ? [T_FAINT] : [];
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
  return <div style={{ position: "absolute", left: 0, right: 0, top: 330 + sh, textAlign: "center", transform: `rotate(-5deg) scale(${k})`, fontFamily: CAPTION_FONT, fontWeight: 800, fontSize: 250, color: "#ffd400", WebkitTextStroke: "16px #0a0d1a", paintOrder: "stroke fill" }}>EP 6</div>;
};

const SFX: Sfx[] = [
  [at(0, 0), "sfx_whoosh", 0.35], [L[0].end + 1, "sfx_burn", 0.55], [L[2].end + 2, "sfx_rimshot", 0.4], [L[5].end + 1, "sfx_burn", 0.55], [at(6, 40), "sfx_pop", 0.4],
  [L[9].end + 1, "sfx_burn", 0.7], [L[9].end + 6, "sfx_rimshot", 0.5], [T_CRY, "sfx_sad", 0.4], [T_FAINT, "sfx_faint", 0.7],
  [T_GRAB, "sfx_boing", 0.45], [T_LIFT, "sfx_whoosh", 0.45], [at(13, 0), "sfx_thump", 0.65], [at(13, 40), "sfx_ding", 0.35],
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
      <Soundtrack total={FILM_FRAMES} voice={staticFile("projects/pipi-ep6-fomo-roast/narration.mp3")} voiceAt={LEAD} voiceEnd={VOICE_END} music="music_pad" musicLen={1800} amb="amb_night" ambVol={0.2} sfx={SFX} />
    </AbsoluteFill>
  );
};
