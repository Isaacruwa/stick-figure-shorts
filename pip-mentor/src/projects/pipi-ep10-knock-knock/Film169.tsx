import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { CAPTION_FONT, eio, eout, INK, lerp, Mood, pop, ramp, rnd, ShotDef, Shots, Sfx, Soundtrack, VH, VW, blinkAt } from "../_shared169/kit169";
import { Angel, Devil, Grandma, Guru, Pipi } from "./characters";
import { LEAD, LINES, VOICE_END } from "./lines";
// 16:9 camera conversion: the vertical shots were framed for 1440x2560, here they are re-framed for 2560x1440 (close-ups stay close, wides show the whole set)
const zH = (z: number) => (z >= 1.6 ? z * 0.75 : Math.max(1.0, z * 0.85));
const cyH = (cy: number, z: number) => (z >= 1.6 || cy < 1200 ? cy : Math.max(cy, 2300 - 720 / zH(z)));

// pip.mentor - Pipi ep 10 "Knock Knock" (9:16 cartoon scene, no narrator, perfect loop). Series milestone: Pipi has $100.
// Everyone who ignored him when he was broke knocks (the guru with the RETURN BY FRIDAY sticker, the devil, then the angel). Grandma roasts them one by one through the door.
// CLEAN STAGING: Pipi left, Grandma right, the front door in the middle; visitors only appear in the doorway. Button: "Baby, in this house, that's a yacht." The door rattles again -> loops to frame 0.
// Shots, mouths, moods and props key off LINES (tools/make_dialogue.py), not frame numbers.
export const FILM_FRAMES = VOICE_END + 80;
const L = LINES;
const at = (i: number, off = 0) => L[Math.min(i, L.length - 1)].start + off;

const GROUND = 2240, RED = "#ff4d5e";
const PX = 240, RX = 1200, DOOR_X = 540, DOOR_W = 360, DOOR_TOP = 1480, MID = 720;
const COL: Record<string, string> = { PIPI: "#8ff5cf", GURU: "#ffd36b", GRANDMA: "#ffc2dd", DEVIL: "#ff7a7a", ANGEL: "#fff3a6" };
const MP: Mood[] = ["worried", "happy", "happy", "surprised", "happy", "surprised", "happy", "happy", "happy", "happy", "happy"];
const MR: Mood[] = ["sly", "neutral", "sly", "neutral", "sly", "neutral", "sly", "neutral", "happy", "neutral", "happy"];
const cur = (g: number) => { let c = 0; for (let i = 0; i < L.length; i++) if (g >= L[i].start - 2) c = i; return c; };
const talking = (g: number, who: string) => { const i = L.findIndex((l) => g >= l.start && g <= l.end); return i >= 0 && L[i].who === who ? 0.25 + 0.75 * rnd(`m${who}${Math.floor(g / 3)}`) : 0; };
const mood = (t: Mood[], g: number): Mood => t[Math.min(cur(g), t.length - 1)];

// door schedule: three visitors (guru, devil, angel)
const OP = [at(3, -10), at(5, -10), at(7, -10)];
const CL = [L[4].end - 3, L[6].end - 3, L[8].end - 2];
const ENTER = at(8, 4);
const KNOCKS = [2, 10, 18, OP[0] - 26, OP[0] - 17, OP[1] - 26, OP[1] - 17, OP[2] - 26, OP[2] - 17];
const openAmt = (g: number) => { let o = 0; for (let k = 0; k < 3; k++) { if (g >= OP[k] && g < CL[k]) o = Math.max(o, eio(ramp(g, OP[k], OP[k] + 8))); else if (g >= CL[k] && g < CL[k] + 5) o = Math.max(o, 1 - ramp(g, CL[k], CL[k] + 4)); } return o; };
const knockShake = (g: number) => KNOCKS.reduce((s, k) => (g >= k && g < k + 10 ? s + Math.exp(-(g - k) / 3) * Math.sin((g - k) * 2.6) : s), 0);
const visitor = (g: number): number => { for (let k = 0; k < 3; k++) if (g >= OP[k] - 30 && g < CL[k] + 6) return k; return -1; };

const Bill: React.FC<{ text: string }> = ({ text }) => (
  <g transform="rotate(-12)">
    <rect x={-8} y={-96} width={130} height={64} rx={7} fill="#79d493" stroke={INK} strokeWidth={5} />
    <circle cx={57} cy={-64} r={20} fill="#4fae6c" stroke={INK} strokeWidth={3} />
    <text x={57} y={-56} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={22} fill={INK}>{text}</text>
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
    <rect x={150} y={900} width={260} height={220} fill="#fff0c4" stroke={INK} strokeWidth={9} /><path d="M280,900 L280,1120 M150,1010 L410,1010" stroke={INK} strokeWidth={8} />
  </g>
);

// the door: frame, a night porch seen through the doorway (visitors stand here), and the door panel that swings
const Doorway: React.FC<{ g: number }> = ({ g }) => {
  const open = openAmt(g), vk = visitor(g), sh = knockShake(g) * 7;
  const DW = DOOR_W, DH = GROUND - DOOR_TOP;
  const k = vk;
  const enter = ramp(g, ENTER, ENTER + 18);
  return (
    <g>
      <defs><clipPath id="doorway"><rect x={DOOR_X} y={DOOR_TOP} width={DW} height={DH} /></clipPath>
        <linearGradient id="porch" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#10213f" /><stop offset="1" stopColor="#23365e" /></linearGradient></defs>
      <rect x={DOOR_X - 24} y={DOOR_TOP - 24} width={DW + 48} height={DH + 24} fill="#7a5230" stroke={INK} strokeWidth={10} />
      <g clipPath="url(#doorway)">
        <rect x={DOOR_X} y={DOOR_TOP} width={DW} height={DH} fill="url(#porch)" />
        <circle cx={DOOR_X + DW - 60} cy={DOOR_TOP + 90} r={26} fill="#ffe9a8" /><ellipse cx={DOOR_X + DW - 60} cy={GROUND - 20} rx={150} ry={26} fill="#ffe9a8" opacity={0.18} />
        {k === 0 && <g><Guru x={MID} y={GROUND} s={1.5} facing={-1} mood={cur(g) >= 4 ? "worried" : "sly"} talk={talking(g, "GURU")} blink={blinkAt(g, 4)} look={[8, 0]} bob={Math.sin(g / 12) * 2} armR={30} armL={14} />
          <g transform={`translate(${MID} ${GROUND - 352 * 1.5 + 36}) rotate(-6)`}><rect x={-125} y={-28} width={250} height={56} rx={6} fill="#ffe14a" stroke={INK} strokeWidth={5} /><text x={0} y={10} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={27} fill={INK}>RETURN BY FRIDAY</text></g></g>}
        {k === 1 && <Devil x={MID} y={GROUND} s={1.5} facing={-1} mood={cur(g) >= 6 ? "worried" : "happy"} talk={talking(g, "DEVIL")} blink={blinkAt(g, 8)} look={[8, 0]} bob={Math.sin(g / 7) * 3} armR={talking(g, "DEVIL") > 0 ? 100 + 25 * Math.sin(g * 0.45) : 40} armL={14} />}
        {k === 2 && enter < 0.02 && <Angel x={MID} y={GROUND} s={1.5} facing={-1} mood="happy" talk={talking(g, "ANGEL")} blink={blinkAt(g, 6)} look={[8, 0]} bob={Math.sin(g / 9) * 3} armR={30} armL={14} />}
      </g>
      <g transform={`translate(${DOOR_X + sh} 0)`}>
        <g transform={`scale(${1 - 0.86 * open} 1)`}>
          <rect x={0} y={DOOR_TOP} width={DW} height={DH} fill="#a8703b" stroke={INK} strokeWidth={8} />
          <rect x={30} y={DOOR_TOP + 40} width={DW - 60} height={250} rx={10} fill="none" stroke={INK} strokeWidth={6} opacity={0.5} /><rect x={30} y={DOOR_TOP + 330} width={DW - 60} height={330} rx={10} fill="none" stroke={INK} strokeWidth={6} opacity={0.5} />
          <circle cx={DW - 40} cy={DOOR_TOP + 380} r={16} fill="#f0b84a" stroke={INK} strokeWidth={4} />
        </g>
      </g>
    </g>
  );
};

const SceneW: React.FC<{ g: number }> = ({ g }) => {
  const c = cur(g), finalLine = c >= L.length - 1, bob = Math.sin(g / 14) * 3, yap = talking(g, "GRANDMA");
  const enter = eio(ramp(g, ENTER, ENTER + 18));
  const pointing = c === 2 || c === 4 || c === 6;
  return (
    <g>
      <Kitchen g={g} />
      <Doorway g={g} />
      {enter > 0.02 && <Angel x={MID} y={lerp(GROUND, GROUND + 50, enter)} s={lerp(1.5, 1.9, enter)} facing={1} mood="happy" talk={talking(g, "ANGEL")} blink={blinkAt(g, 6)} look={[0, 0]} bob={Math.sin(g / 9) * 3} armR={30} armL={14} />}
      <Pipi x={PX} y={GROUND} s={2.1} facing={1} mood={mood(MP, g)} talk={talking(g, "PIPI")} blink={blinkAt(g, 2)} look={finalLine ? [0, 0] : [8, 0]} bob={bob} headTilt={finalLine ? 4 : 0}
        armR={105} elbowR={-30} armL={12 + talking(g, "PIPI") * 16 * Math.sin(g * 0.3)} holdR={<Bill text="100" />} />
      <Grandma x={RX} y={GROUND} s={2.1} facing={-1} mood={mood(MR, g)} talk={yap} blink={blinkAt(g, 9)} look={[8, 0]} bob={Math.sin(g / 12) * 3} headTilt={yap > 0 ? 4 * Math.sin(g * 0.4) : 0}
        armR={pointing ? 100 + 6 * Math.sin(g * 0.7) : 58} armL={20 + yap * 45 * Math.sin(g * 0.55)} holdR={<Spoon />} />
    </g>
  );
};

type Cam = [number, number, number];
const CUP: Cam = [PX, 1590, 2.0], CUG: Cam = [RX, 1600, 2.0], DOOR: Cam = [MID, 1750, 2.3], WIDE: Cam = [MID, 1700, 1.15];
const PLAN: { a: Cam; a2: Cam; split?: number; b?: Cam; b2?: Cam }[] = [
  { a: [1000, 1600, 2.1], a2: [1000, 1600, 1.9] },
  { a: CUP, a2: [PX, 1590, 2.2] },
  { a: CUG, a2: [RX, 1600, 2.2] },
  { a: DOOR, a2: [MID, 1750, 2.5] },
  { a: CUG, a2: [RX, 1600, 2.2], split: 0.72, b: DOOR, b2: [MID, 1750, 2.4] },
  { a: DOOR, a2: [MID, 1750, 2.5] },
  { a: CUG, a2: [RX, 1600, 2.2], split: 0.6, b: DOOR, b2: [MID, 1750, 2.4] },
  { a: DOOR, a2: [MID, 1750, 2.5] },
  { a: CUG, a2: [RX, 1600, 2.2], split: 0.55, b: [MID, 1800, 1.5], b2: [MID, 1800, 1.6] },
  { a: CUP, a2: [PX, 1590, 2.3] },
  { a: [RX, 1600, 2.2], a2: [RX, 1600, 2.0], split: 0.55, b: WIDE, b2: [MID, 1700, 1.2] },
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
  const slams = [CL[0], CL[1], CL[2]];
  const sh = (i === 0 ? [0] : []).concat(slams.filter((s) => s >= from && s < to));
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
  return <div style={{ position: "absolute", left: 0, right: 0, top: 70 + sh, textAlign: "center", transform: `rotate(-5deg) scale(${k})`, fontFamily: CAPTION_FONT, fontWeight: 800, fontSize: 190, color: "#ffd400", WebkitTextStroke: "12px #0a0d1a", paintOrder: "stroke fill" }}>EP 10</div>;
};

const SFX: Sfx[] = [
  [at(0, 0), "sfx_whoosh", 0.35], [2, "sfx_knock", 0.8], [OP[0] - 26, "sfx_knock", 0.8], [OP[0], "sfx_whoosh", 0.3], [L[4].end + 1, "sfx_burn", 0.65], [CL[0], "sfx_thud", 0.7], [CL[0] + 4, "sfx_rimshot", 0.4],
  [OP[1] - 26, "sfx_knock", 0.8], [OP[1], "sfx_whoosh", 0.3], [L[6].end + 1, "sfx_burn", 0.7], [CL[1], "sfx_thud", 0.7],
  [OP[2] - 26, "sfx_knock", 0.5], [OP[2], "sfx_sparkle", 0.4], [ENTER, "sfx_pop", 0.4], [CL[2], "sfx_thud", 0.4],
  [L[10].end + 6, "sfx_knock", 0.8], [at(10, 40), "sfx_thump", 0.5],
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
      <Soundtrack total={EP169_FRAMES} voice={staticFile("projects/pipi-ep10-knock-knock/narration.mp3")} voiceAt={LEAD} voiceEnd={VOICE_END} music="music_pad" musicLen={1800} amb="amb_night" ambVol={0.2} sfx={SFX} />
    </AbsoluteFill>
  );
};
export const EP169_FRAMES = VOICE_END + 34;
