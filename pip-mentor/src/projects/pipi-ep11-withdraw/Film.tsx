import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { CAPTION_FONT, eio, eout, INK, lerp, Mood, pop, ramp, rnd, ShotDef, Shots, Sfx, Soundtrack, VH, VW, blinkAt } from "./kit";
import { Devil, Grandma, Pipi } from "./characters";
import { LEAD, LINES, VOICE_END } from "./lines";

// pip.mentor - Pipi ep 11 "Withdraw" (9:16 cartoon scene, no narrator, perfect loop). CLEAN STAGING: Pipi left (devil on his shoulder), an empty floor spot in the middle for the pool, Grandma right.
// Lesson: profit you never withdraw is just a number (Grandma: "a video game score"). Pipi withdraws $20 and buys Grandma a "yacht" = an inflatable duck boat in a kiddie pool, paying off ep 10's "in this house, that's a yacht".
// Devil gets owned again (cries, faints: "My commission!"). Button: "Fine. But I'm the captain." Shots, mouths, moods and props key off LINES (tools/make_dialogue.py), not frame numbers.
export const FILM_FRAMES = VOICE_END + 80;
const L = LINES;
const at = (i: number, off = 0) => L[Math.min(i, L.length - 1)].start + off;

const GROUND = 2240, GREEN = "#27d17f", RED = "#ff4d5e";
const PX = 300, RX = 1200, POOLX = 720, DVX = PX + 115, SY = 1650;
const COL: Record<string, string> = { PIPI: "#8ff5cf", DEVIL: "#ff7a7a", GRANDMA: "#ffc2dd" };
const MP: Mood[] = ["neutral", "happy", "worried", "neutral", "worried", "neutral", "happy", "surprised", "happy", "surprised", "happy", "happy"];
const MD: Mood[] = ["sly", "sly", "happy", "sly", "happy", "sly", "worried", "sad", "sad", "sad", "sad", "sad"];
const MR: Mood[] = ["sly", "neutral", "neutral", "sly", "neutral", "sly", "neutral", "neutral", "happy", "sly", "neutral", "happy"];
const cur = (g: number) => { let c = 0; for (let i = 0; i < L.length; i++) if (g >= L[i].start - 2) c = i; return c; };
const talking = (g: number, who: string) => { const i = L.findIndex((l) => g >= l.start && g <= l.end); return i >= 0 && L[i].who === who ? 0.25 + 0.75 * rnd(`m${who}${Math.floor(g / 3)}`) : 0; };
const mood = (t: Mood[], g: number): Mood => t[Math.min(cur(g), t.length - 1)];

const T_PRESS = at(6, 18), T_CRY = at(7, 4), T_FAINT = L[7].end - 2, T_YACHT = at(8, 6), T_HAT = at(11, 10);

const Phone: React.FC<{ amount: string; press: number }> = ({ amount, press }) => (
  <g transform="rotate(-8)">
    <rect x={-25} y={-290} width={170} height={280} rx={20} fill="#10162b" stroke={INK} strokeWidth={6} />
    <text x={60} y={-210} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={46} fill={GREEN}>{amount}</text>
    <g transform={`translate(60 -90) scale(${1 - 0.1 * press})`}><rect x={-62} y={-26} width={124} height={52} rx={12} fill={GREEN} stroke={INK} strokeWidth={4} /><text x={0} y={9} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={20} fill="#06281a">WITHDRAW</text></g>
  </g>
);
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
const Stars: React.FC<{ x: number; y: number; g: number }> = ({ x, y, g }) => (
  <g>{[0, 1, 2].map((k) => { const a = g * 0.3 + k * 2.1; return <path key={k} d="M0,-14 L4,-4 L14,-3 L6,3 L9,13 L0,7 L-9,13 L-6,3 L-14,-3 L-4,-4 Z" fill="#ffd400" stroke={INK} strokeWidth={2} transform={`translate(${x + 62 * Math.cos(a)} ${y + 18 * Math.sin(a)})`} />; })}</g>
);
// the "yacht": an inflatable duck boat in a kiddie pool
const Yacht: React.FC<{ g: number }> = ({ g }) => {
  if (g < T_YACHT) return null;
  const k = Math.max(0.01, pop(g, T_YACHT, 12)), bob = Math.sin(g / 10) * 8, squeak = c9(g);
  return (
    <g transform={`translate(${POOLX} ${GROUND}) scale(${k})`}>
      <ellipse cx={0} cy={-26} rx={250} ry={46} fill="#2fa8e0" stroke={INK} strokeWidth={8} />
      <rect x={-250} y={-60} width={500} height={34} rx={17} fill="#ff6fa3" stroke={INK} strokeWidth={8} />
      <g transform={`translate(0 ${bob})`}>
        <path d="M -170,-90 L 170,-90 Q 150,-24 90,-20 L -90,-20 Q -150,-24 -170,-90 Z" fill="#fbfbf8" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
        <line x1={0} y1={-92} x2={0} y2={-330} stroke={INK} strokeWidth={10} /><path d="M 8,-320 L 8,-130 L 130,-130 Z" fill="#fff" stroke={INK} strokeWidth={7} strokeLinejoin="round" /><path d="M 0,-330 L 0,-370 L 56,-352 Z" fill={RED} stroke={INK} strokeWidth={6} />
        <g transform={`translate(170 ${-120 - 10 * squeak}) scale(${1 + 0.25 * squeak})`}><circle r={46} fill="#ffd400" stroke={INK} strokeWidth={7} /><path d="M 38,6 L 100,18 L 40,34 Z" fill="#ff9a1a" stroke={INK} strokeWidth={5} strokeLinejoin="round" /><circle cx={6} cy={-10} r={8} fill={INK} /></g>
      </g>
    </g>
  );
};
const c9 = (g: number) => (g >= at(9, 2) ? Math.exp(-(g - at(9, 2)) / 6) * Math.abs(Math.sin((g - at(9, 2)) * 0.5)) : 0);
const Kitchen: React.FC<{ g: number }> = ({ g }) => (
  <g>
    <rect x={-800} y={-1200} width={3040} height={3400} fill="#e9d2a6" />
    {Array.from({ length: 22 }).map((_, i) => <rect key={i} x={i * 120 - 800} y={-1200} width={60} height={3400} fill="#c9a96a" opacity={0.15} />)}
    <rect x={-800} y={GROUND - 30} width={3040} height={1400} fill="#8d6238" />
    <g transform="translate(1180 760)"><circle r={86} fill="#fbfbf8" stroke={INK} strokeWidth={7} /><path d="M0,0 L0,-56" stroke={INK} strokeWidth={6} strokeLinecap="round" transform={`rotate(${g * 0.5})`} /><path d="M0,0 L40,0" stroke={INK} strokeWidth={6} strokeLinecap="round" /></g>
    <rect x={500} y={660} width={440} height={400} fill="#fff0c4" stroke={INK} strokeWidth={9} /><path d="M720,660 L720,1060 M500,860 L940,860" stroke={INK} strokeWidth={8} />
  </g>
);

const SceneW: React.FC<{ g: number }> = ({ g }) => {
  const c = cur(g), finalLine = c >= L.length - 1, bob = Math.sin(g / 14) * 3, yap = talking(g, "GRANDMA");
  const press = ramp(g, T_PRESS - 4, T_PRESS) - ramp(g, T_PRESS + 2, T_PRESS + 6);
  const cash = g >= T_PRESS + 8, phoneOn = g < T_PRESS + 8;
  const cry = ramp(g, T_CRY, T_CRY + 12) * (g < T_FAINT ? 1 : 0);
  const faint = eio(ramp(g, T_FAINT, T_FAINT + 8));
  const hat = g >= T_HAT ? Math.max(0.01, pop(g, T_HAT, 8)) : 0;
  const look: [number, number] = finalLine ? [0, 0] : c === 2 || c === 4 || c === 7 ? [9, -4] : c === 0 || c === 3 || c === 5 || c === 9 || c === 11 ? [-8, 0] : [8, 0];
  return (
    <g>
      <Kitchen g={g} />
      <Yacht g={g} />
      <Pipi x={PX} y={GROUND} s={2.1} facing={1} mood={mood(MP, g)} talk={talking(g, "PIPI")} blink={blinkAt(g, 2)} look={look} bob={bob} headTilt={finalLine ? 4 : 0}
        sweat={c === 4 ? 0.5 : 0} armR={phoneOn || cash ? 108 : 40} elbowR={phoneOn || cash ? -30 : 0} armL={12 + talking(g, "PIPI") * 16 * Math.sin(g * 0.3)}
        holdR={phoneOn ? <Phone amount={g < T_PRESS ? "$100" : "$80"} press={press} /> : cash && g < at(9, 0) ? <Bill text="20" /> : undefined} />
      <g transform={faint > 0.001 ? `rotate(${80 * faint} ${DVX} ${SY + bob})` : undefined}>
        <Devil x={DVX} y={SY + bob} s={0.5} facing={-1} mood={mood(MD, g)} talk={talking(g, "DEVIL")} blink={faint > 0.5 ? 0.04 : blinkAt(g, 8)} look={[8, 0]} cry={cry} bob={Math.sin(g / 7) * 3}
          armR={talking(g, "DEVIL") > 0 ? 100 + 25 * Math.sin(g * 0.45) : 40} armL={14} />
        {faint > 0.1 && <Stars x={DVX} y={SY + bob - 215} g={g} />}
      </g>
      <Grandma x={RX} y={GROUND} s={2.1} facing={-1} mood={mood(MR, g)} talk={yap} blink={blinkAt(g, 9)} look={[8, 0]} bob={Math.sin(g / 12) * 3} headTilt={yap > 0 ? 4 * Math.sin(g * 0.4) : 0}
        armR={c === 0 || c === 3 || c === 5 ? 100 + 6 * Math.sin(g * 0.7) : 58} armL={20 + yap * 45 * Math.sin(g * 0.55)} holdR={<Spoon />} />
      {hat > 0 && (
        <g transform={`translate(${RX} ${GROUND - 352 * 2.1 - 118}) scale(${hat * 1.1})`}>
          <ellipse cx={0} cy={0} rx={130} ry={22} fill="#1d2a4d" stroke={INK} strokeWidth={7} /><path d="M -92,0 Q -92,-84 0,-90 Q 92,-84 92,0 Z" fill="#fbfbf8" stroke={INK} strokeWidth={7} />
          <rect x={-92} y={-26} width={184} height={22} fill="#1d2a4d" stroke={INK} strokeWidth={5} /><circle cx={0} cy={-48} r={20} fill="#f0b84a" stroke={INK} strokeWidth={5} />
        </g>
      )}
    </g>
  );
};

type Cam = [number, number, number];
const CUP: Cam = [PX, 1590, 2.0], CUG: Cam = [RX, 1600, 2.0], CUD: Cam = [DVX - 20, 1530, 4.2], WIDE: Cam = [POOLX, 1700, 1.15];
const PLAN: { a: Cam; a2: Cam; split?: number; b?: Cam; b2?: Cam }[] = [
  { a: [RX, 1600, 2.4], a2: [RX, 1600, 2.1] },
  { a: CUP, a2: [PX, 1590, 2.2] },
  { a: CUD, a2: [DVX - 20, 1530, 4.5] },
  { a: CUG, a2: [RX, 1600, 2.2] },
  { a: CUD, a2: [DVX - 20, 1530, 4.5] },
  { a: [RX, 1600, 2.1], a2: [RX, 1600, 2.3], split: 0.6, b: CUP, b2: [PX, 1590, 2.2] },
  { a: [PX, 1650, 2.2], a2: [PX, 1650, 2.5] },
  { a: CUD, a2: [DVX - 20, 1530, 3.8] },
  { a: WIDE, a2: [POOLX, 1700, 1.3] },
  { a: [RX, 1600, 2.1], a2: [RX, 1600, 2.3], split: 0.5, b: [POOLX + 120, 1750, 1.8], b2: [POOLX + 120, 1750, 2.0] },
  { a: CUP, a2: [PX, 1590, 2.3] },
  { a: [RX, 1600, 2.1], a2: [RX, 1600, 2.0], split: 0.5, b: WIDE, b2: [POOLX, 1700, 1.2] },
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
  const sh = (i === 0 ? [0] : []).concat([T_FAINT, T_YACHT].filter((s) => s >= from && s < to));
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
  return <div style={{ position: "absolute", left: 0, right: 0, top: 330 + sh, textAlign: "center", transform: `rotate(-5deg) scale(${k})`, fontFamily: CAPTION_FONT, fontWeight: 800, fontSize: 250, color: "#ffd400", WebkitTextStroke: "16px #0a0d1a", paintOrder: "stroke fill" }}>EP 11</div>;
};

const SFX: Sfx[] = [
  [at(0, 0), "sfx_whoosh", 0.35], [at(0, 4), "sfx_click", 0.3], [L[0].end + 1, "sfx_burn", 0.6], [L[3].end + 1, "sfx_burn", 0.65], [L[5].end + 1, "sfx_burn", 0.7], [L[5].end + 7, "sfx_rimshot", 0.4],
  [T_PRESS, "sfx_click", 0.6], [T_PRESS + 4, "sfx_coin", 0.5], [T_PRESS + 8, "sfx_ding", 0.4], [T_CRY, "sfx_sad", 0.4], [T_FAINT, "sfx_faint", 0.7],
  [T_YACHT, "sfx_pop", 0.5], [T_YACHT + 2, "sfx_sparkle", 0.5], [at(9, 2), "sfx_boing", 0.5], [T_HAT, "sfx_pop", 0.45], [at(11, 0), "sfx_thump", 0.6], [at(11, 40), "sfx_ding", 0.35],
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
      <Soundtrack total={FILM_FRAMES} voice={staticFile("projects/pipi-ep11-withdraw/narration.mp3")} voiceAt={LEAD} voiceEnd={VOICE_END} music="music_pad" musicLen={1800} amb="amb_night" ambVol={0.2} sfx={SFX} />
    </AbsoluteFill>
  );
};
