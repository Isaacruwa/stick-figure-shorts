import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { CAPTION_FONT, eio, eout, INK, keys, lerp, Mood, ramp, rnd, ShotDef, Shots, Sfx, Soundtrack, VH, VW, blinkAt, pop } from "./kit";
import { Angel, Devil, Grandma, Guru, Pipi } from "./characters";
import { LEAD, LINES, VOICE_END } from "./lines";

// pip.mentor - Pipi ep 14 "Pipi has lost everything" (9:16 cartoon scene, owner-written script, no narrator, perfect loop).
// Living room: Pipi sits on the couch staring at a phone showing $0.00; Grandma stands right; Devil (right shoulder) and Angel (left shoulder) pop in; the Guru walks in at line 9.
// Visual gags that back up the owner's lines: bills with wings fly away ("even your money is tired of living with you"), a GUARANTEED* sign with fine print, underwear on a clothesline ("before his underwear dries"),
// the three ancestor portraits turn their backs on the final line. Line indexes: GRANDMA 0,2,6,8,12,16 / PIPI 1,5,10,15 / DEVIL 3,7,13 / ANGEL 4,14 / GURU 9,11.
export const FILM_FRAMES = VOICE_END + 80;
const L = LINES;
const at = (i: number, off = 0) => L[Math.min(i, L.length - 1)].start + off;
const ff = (i: number, p: number) => Math.round(L[i].start + p * (L[i].end - L[i].start));

const GROUND = 2240, RED = "#d9283b";
const PX = 300, PY = GROUND + 60, RX = 1200, GURUX = 820, DVX = PX + 115, ANX = PX - 115, SY = PY - 590;
const COL: Record<string, string> = { PIPI: "#8ff5cf", DEVIL: "#ff7a7a", ANGEL: "#fff3a8", GURU: "#ffd27a", GRANDMA: "#ffc2dd" };
const MP: Mood[] = ["sad", "sad", "sad", "worried", "worried", "worried", "sad", "worried", "worried", "sad", "sad", "worried", "sad", "worried", "worried", "sad", "sad"];
const MD: Mood[] = ["sly", "sly", "sly", "happy", "sly", "worried", "worried", "worried", "sad", "sly", "sly", "sly", "sly", "happy", "sly", "sly", "worried"];
const MA: Mood[] = ["neutral", "neutral", "neutral", "neutral", "worried", "neutral", "neutral", "neutral", "neutral", "neutral", "neutral", "neutral", "neutral", "neutral", "worried", "sad", "sad"];
const MR: Mood[] = ["surprised", "neutral", "sly", "neutral", "neutral", "neutral", "surprised", "sly", "sly", "neutral", "neutral", "neutral", "sly", "neutral", "neutral", "surprised", "sly"];
const MG: Mood[] = ["neutral", "neutral", "neutral", "neutral", "neutral", "neutral", "neutral", "neutral", "neutral", "neutral", "neutral", "sly", "neutral", "neutral", "neutral", "neutral", "neutral"];
const cur = (g: number) => { let c = 0; for (let i = 0; i < L.length; i++) if (g >= L[i].start - 2) c = i; return c; };
const talking = (g: number, who: string) => { const i = L.findIndex((l) => g >= l.start && g <= l.end); return i >= 0 && L[i].who === who ? 0.25 + 0.75 * rnd(`m${who}${Math.floor(g / 3)}`) : 0; };
const mood = (t: Mood[], g: number): Mood => t[Math.min(cur(g), t.length - 1)];

const T_BILLS = ff(2, 0.6), T_DEVIL = L[3].start - 8, T_ANGEL = L[4].start - 8, T_SIGN = ff(5, 0.55), T_SIGN_END = L[6].end, T_CRY = ff(8, 0.75), T_GURU = L[9].start - 40, T_ARRIVE = L[9].start + 4, T_UND = ff(12, 0.62), T_PORT = ff(16, 0.5);

const Room: React.FC = () => (
  <g>
    <rect x={-800} y={-1200} width={3040} height={3400} fill="#e9d2a6" />
    {Array.from({ length: 22 }).map((_, i) => <rect key={i} x={i * 120 - 800} y={-1200} width={60} height={3400} fill="#c9a96a" opacity={0.15} />)}
    <rect x={-800} y={GROUND - 30} width={3040} height={1400} fill="#8d6238" />
  </g>
);
const Portrait: React.FC<{ g: number; x: number; i: number }> = ({ g, x, i }) => {
  const u = ramp(g, T_PORT + i * 7, T_PORT + i * 7 + 12), w = Math.abs(Math.cos(Math.PI * u)), back = u > 0.5;
  const cols = ["#2d3a5a", "#6b2d3a", "#3a5a2d"];
  return (
    <g transform={`translate(${x} 820) scale(${Math.max(0.02, w)} 1)`}>
      <rect x={-75} y={-95} width={150} height={190} rx={8} fill={back ? "#7a5a3a" : "#d9a441"} stroke={INK} strokeWidth={6} />
      {back ? (
        <g><path d="M -60,-80 L 60,80 M 60,-80 L -60,80" stroke="#5a3f26" strokeWidth={6} /><rect x={-62} y={-82} width={124} height={164} fill="none" stroke="#5a3f26" strokeWidth={5} /></g>
      ) : (
        <g>
          <rect x={-62} y={-83} width={124} height={166} fill="#cdb89a" />
          <path d="M -58,83 Q -58,32 0,32 Q 58,32 58,83 Z" fill={cols[i]} />
          <circle cx={0} cy={-12} r={42} fill="#f2d6b0" stroke={INK} strokeWidth={4} />
          <circle cx={-15} cy={-20} r={4.5} fill={INK} /><circle cx={15} cy={-20} r={4.5} fill={INK} />
          <path d="M -24,-32 L -8,-27 M 24,-32 L 8,-27" stroke={INK} strokeWidth={4} strokeLinecap="round" />
          <path d="M -12,8 L 12,8" stroke={INK} strokeWidth={4} strokeLinecap="round" />
          {i === 0 && <path d="M -26,0 Q -12,-8 0,-2 Q 12,-8 26,0 Q 12,4 0,0 Q -12,4 -26,0 Z" fill="#2a1d14" />}
          {i === 1 && <g><circle cx={0} cy={-62} r={14} fill="#bbb" stroke={INK} strokeWidth={3} /><circle cx={-15} cy={-20} r={11} fill="none" stroke={INK} strokeWidth={3} /><circle cx={15} cy={-20} r={11} fill="none" stroke={INK} strokeWidth={3} /></g>}
          {i === 2 && <path d="M -34,2 Q -30,40 0,44 Q 30,40 34,2 Q 18,16 0,16 Q -18,16 -34,2 Z" fill="#7a7a7a" stroke={INK} strokeWidth={3} />}
        </g>
      )}
    </g>
  );
};
const CouchBack: React.FC = () => (
  <g>
    <rect x={30} y={1600} width={610} height={500} rx={50} fill="#7a3b3b" stroke={INK} strokeWidth={8} />
    <rect x={80} y={1650} width={250} height={300} rx={30} fill="#8a4646" /><rect x={340} y={1650} width={250} height={300} rx={30} fill="#8a4646" />
  </g>
);
const CouchFront: React.FC = () => (
  <g>
    <rect x={50} y={2040} width={570} height={290} rx={24} fill="#9b4a4a" stroke={INK} strokeWidth={8} />
    <rect x={50} y={2012} width={570} height={56} rx={26} fill="#b05a5a" stroke={INK} strokeWidth={8} />
    <rect x={-10} y={1850} width={110} height={480} rx={40} fill="#8a4646" stroke={INK} strokeWidth={8} />
    <rect x={570} y={1850} width={110} height={480} rx={40} fill="#8a4646" stroke={INK} strokeWidth={8} />
  </g>
);
const Phone: React.FC<{ g: number }> = ({ g }) => (
  <g transform="rotate(6)">
    <rect x={-82} y={-300} width={164} height={290} rx={22} fill="#15192b" stroke={INK} strokeWidth={6} />
    <rect x={-70} y={-282} width={140} height={254} rx={12} fill="#10162e" />
    <text x={0} y={-250} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={20} fill="#9fb3d9">BALANCE</text>
    <text x={0} y={-204} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={46} fill={RED} opacity={0.85 + 0.15 * Math.sin(g * 0.4)}>$0.00</text>
    {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={-52 + i * 24} y={-150 + i * 20} width={14} height={34} rx={3} fill={RED} />)}
  </g>
);
const Bills: React.FC<{ g: number }> = ({ g }) => (
  <g>
    {[0, 1, 2, 3].map((i) => {
      const t0 = T_BILLS + i * 7, u = ramp(g, t0, t0 + 46);
      if (u <= 0 || u >= 1) return null;
      const x = lerp(600, 1500 + i * 30, u), y = lerp(1760, 260 + i * 80, u) + Math.sin(u * 9 + i) * 40, fl = Math.sin(g * 0.9 + i) * 28;
      return (
        <g key={i} transform={`translate(${x} ${y}) rotate(${(i - 1.5) * 8})`} opacity={1 - ramp(u, 0.85, 1)}>
          <ellipse cx={-62} cy={-6} rx={38} ry={16} transform={`rotate(${-20 - fl} -50 0)`} fill="#fbfbf8" stroke={INK} strokeWidth={4} />
          <ellipse cx={62} cy={-6} rx={38} ry={16} transform={`rotate(${20 + fl} 50 0)`} fill="#fbfbf8" stroke={INK} strokeWidth={4} />
          <rect x={-52} y={-28} width={104} height={56} rx={6} fill="#5fbf6f" stroke={INK} strokeWidth={5} />
          <circle r={16} fill="#3f9a50" stroke={INK} strokeWidth={3} />
          <text x={0} y={8} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={22} fill="#fff">$</text>
        </g>
      );
    })}
  </g>
);
const Sign: React.FC<{ g: number }> = ({ g }) => {
  const k = pop(g, T_SIGN, 8) * (g < T_SIGN_END ? 1 : 1 - ramp(g, T_SIGN_END, T_SIGN_END + 6));
  if (k < 0.02) return null;
  return (
    <g transform={`translate(700 1500) rotate(${5 + Math.sin(g * 0.3) * 1.5}) scale(${k})`}>
      <rect x={-140} y={-62} width={280} height={124} rx={14} fill="#fff" stroke={INK} strokeWidth={7} />
      <text x={0} y={-8} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={30} fill={RED}>GUARANTEED*</text>
      <text x={0} y={34} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={17} fill="#666">*not really guaranteed</text>
    </g>
  );
};
const Undies: React.FC<{ g: number }> = ({ g }) => {
  const k = pop(g, T_UND, 9);
  if (k < 0.02) return null;
  return (
    <g>
      <path d="M 640,1040 Q 900,1100 1160,1040" fill="none" stroke="#6b5a45" strokeWidth={6} />
      <g transform={`translate(900 1070) scale(${k})`}>
        <rect x={-62} y={-4} width={124} height={28} rx={5} fill="#ff8fb8" stroke={INK} strokeWidth={5} />
        <path d="M -60,24 L -66,112 L -10,112 L 0,72 L 10,112 L 66,112 L 60,24 Z" fill="#ffc2dd" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <circle cx={-34} cy={58} r={8} fill="#ff8fb8" /><circle cx={34} cy={58} r={8} fill="#ff8fb8" /><circle cx={0} cy={44} r={8} fill="#ff8fb8" />
        <rect x={-46} y={-22} width={12} height={24} rx={3} fill="#ffd400" stroke={INK} strokeWidth={3} /><rect x={34} y={-22} width={12} height={24} rx={3} fill="#ffd400" stroke={INK} strokeWidth={3} />
        {[-40, 0, 40].map((dx, j) => <circle key={j} cx={dx} cy={118 + ((g * 3 + j * 21) % 64)} r={7} fill="#5ab8ff" opacity={0.85} />)}
      </g>
    </g>
  );
};
const Spoon: React.FC = () => (
  <g transform="rotate(-8)">
    <line x1={0} y1={0} x2={0} y2={-120} stroke="#b9763b" strokeWidth={14} strokeLinecap="round" />
    <ellipse cx={0} cy={-142} rx={24} ry={32} fill="#c98a4b" stroke={INK} strokeWidth={5} />
  </g>
);

const SceneW: React.FC<{ g: number }> = ({ g }) => {
  const c = cur(g), bob = Math.sin(g / 14) * 3, gb = Math.sin(g / 12) * 3, yap = talking(g, "GRANDMA");
  const pipiTalks = L[Math.min(c, L.length - 1)].who === "PIPI";
  const look: [number, number] = pipiTalks ? [8, 0] : [5, 6];
  const dvk = pop(g, T_DEVIL, 8), ank = pop(g, T_ANGEL, 8), cry = ramp(g, T_CRY, T_CRY + 12);
  const moving = g < T_GURU + 44;
  const gx = lerp(1750, GURUX, eio(ramp(g, T_GURU, T_GURU + 44)));
  const gt = talking(g, "GURU");
  return (
    <g>
      <Room />
      {[150, 330, 510].map((x, i) => <Portrait key={i} g={g} x={x} i={i} />)}
      <Undies g={g} />
      <CouchBack />
      {g >= T_GURU && (
        <Guru x={gx} y={GROUND} s={2.1} facing={-1} mood={mood(MG, g)} talk={gt} blink={blinkAt(g, 5)} look={[8, 0]} bob={moving ? Math.abs(Math.sin(g * 0.55)) * 5 : Math.sin(g / 13) * 3}
          walk={moving ? g * 0.55 : undefined} armR={moving ? 25 : gt > 0 ? 100 + 8 * Math.sin(g * 0.6) : 40} armL={moving ? -25 : 18 + gt * 40 * Math.sin(g * 0.5)} />
      )}
      <Pipi x={PX} y={PY} s={2.1} facing={1} mood={mood(MP, g)} talk={talking(g, "PIPI")} blink={blinkAt(g, 2)} look={look} bob={bob} headTilt={4}
        sweat={c === 5 || c === 10 ? 0.5 : 0} armR={40} elbowR={60} armL={12} holdR={<Phone g={g} />} />
      <CouchFront />
      {ank > 0.02 && (
        <Angel x={ANX} y={SY} s={0.5 * ank} facing={1} mood={mood(MA, g)} talk={talking(g, "ANGEL")} blink={blinkAt(g, 6)} look={[8, 0]} bob={Math.sin(g / 8) * 3}
          armR={talking(g, "ANGEL") > 0 ? 100 + 22 * Math.sin(g * 0.45) : 40} armL={14} />
      )}
      {dvk > 0.02 && (
        <Devil x={DVX} y={SY} s={0.5 * dvk} facing={-1} mood={mood(MD, g)} talk={talking(g, "DEVIL")} blink={blinkAt(g, 8)} look={[8, 0]} cry={cry} bob={Math.sin(g / 7) * 3}
          armR={talking(g, "DEVIL") > 0 ? 100 + 25 * Math.sin(g * 0.45) : 40} armL={14} />
      )}
      <Sign g={g} />
      <Bills g={g} />
      <Grandma x={RX} y={GROUND} s={2.1} facing={-1} mood={mood(MR, g)} talk={yap} blink={blinkAt(g, 9)} look={[8, 0]} bob={gb} headTilt={yap > 0 ? 3 : 0}
        armR={yap > 0 ? 100 + 6 * Math.sin(g * 0.7) : 58} armL={20 + yap * 45 * Math.sin(g * 0.55)} holdR={<Spoon />} />
    </g>
  );
};

type Cam = [number, number, number];
const PLAN: { a: Cam; a2: Cam; split?: number; b?: Cam; b2?: Cam }[] = [
  { a: [700, 1650, 1.08], a2: [700, 1650, 1.15] },
  { a: [450, 1700, 2.0], a2: [450, 1700, 2.15] },
  { a: [750, 1650, 1.1], a2: [750, 1650, 1.15] },
  { a: [380, 1560, 2.1], a2: [400, 1560, 2.3] },
  { a: [300, 1560, 1.9], a2: [290, 1560, 2.0] },
  { a: [430, 1600, 1.7], a2: [450, 1600, 1.8] },
  { a: [750, 1650, 1.1], a2: [750, 1650, 1.15] },
  { a: [415, 1560, 3.0], a2: [415, 1560, 3.3] },
  { a: [1200, 1600, 2.0], a2: [1200, 1600, 2.2], split: 0.5, b: [750, 1650, 1.1], b2: [760, 1650, 1.1] },
  { a: [780, 1620, 1.3], a2: [780, 1620, 1.4] },
  { a: [450, 1700, 2.0], a2: [450, 1700, 2.15] },
  { a: [820, 1620, 1.9], a2: [820, 1620, 2.0] },
  { a: [1200, 1600, 2.0], a2: [1200, 1600, 2.2], split: 0.45, b: [760, 1560, 1.0], b2: [760, 1560, 1.05] },
  { a: [380, 1560, 2.1], a2: [400, 1560, 2.3] },
  { a: [250, 1560, 2.4], a2: [250, 1560, 2.6] },
  { a: [330, 1620, 2.0], a2: [330, 1620, 2.2] },
  { a: [1200, 1600, 2.0], a2: [1200, 1600, 2.1], split: 0.4, b: [740, 1500, 1.0], b2: [740, 1500, 1.05] },
];
const mk = (from: number, to: number, c0: Cam, c1: Cam, shakes: number[] = []): ShotDef => ({
  from, to, z0: 1, z1: 1,
  render: (l, p) => {
    const g = from + l, e = eio(p), cx = lerp(c0[0], c1[0], e), cy = lerp(c0[1], c1[1], e), z = lerp(c0[2], c1[2], e);
    let sx = 0, sy = 0;
    for (const b of shakes) if (g >= b) { const d = Math.exp(-(g - b) / 4) * 18; sx += Math.sin((g - b) * 2.3) * d; sy += Math.cos((g - b) * 3.1) * d * 0.7; }
    return <g transform={`translate(${VW / 2 + sx} ${VH / 2 + sy}) scale(${z}) translate(${-cx} ${-cy})`}><SceneW g={g} /></g>;
  },
});
const SHOTS: ShotDef[] = [];
for (let i = 0; i < L.length; i++) {
  const from = i === 0 ? 0 : L[i].start - 3, to = i === L.length - 1 ? FILM_FRAMES + 1 : L[i + 1].start - 3, pl = PLAN[Math.min(i, PLAN.length - 1)];
  const sh = (i === 0 ? [0] : []).concat([T_ARRIVE, T_PORT + 12].filter((s) => s >= from && s < to));
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
  return <div style={{ position: "absolute", left: 0, right: 0, top: 330 + sh, textAlign: "center", transform: `rotate(-5deg) scale(${k})`, fontFamily: CAPTION_FONT, fontWeight: 800, fontSize: 250, color: "#ffd400", WebkitTextStroke: "16px #0a0d1a", paintOrder: "stroke fill" }}>EP 14</div>;
};

const SFX: Sfx[] = [
  [at(0, 0), "sfx_whoosh", 0.35], [at(0, 4), "sfx_click", 0.3], [L[0].end + 1, "sfx_sad", 0.3],
  [T_BILLS, "sfx_whoosh", 0.5], [T_BILLS + 8, "sfx_coin", 0.3], [L[2].end + 1, "sfx_burn", 0.55],
  [T_DEVIL, "sfx_pop", 0.5], [T_ANGEL, "sfx_sparkle", 0.4], [T_SIGN, "sfx_pop", 0.5],
  [L[6].end + 1, "sfx_burn", 0.6], [L[8].end + 1, "sfx_burn", 0.7], [L[8].end + 7, "sfx_rimshot", 0.45], [T_CRY, "sfx_sad", 0.45],
  [T_GURU, "sfx_whoosh", 0.3], [T_ARRIVE, "sfx_thump", 0.4],
  [T_UND, "sfx_pop", 0.5], [L[12].end + 1, "sfx_burn", 0.6], [L[12].end + 7, "sfx_rimshot", 0.4],
  [T_PORT, "sfx_whoosh", 0.4], [T_PORT + 6, "sfx_tap", 0.4], [T_PORT + 13, "sfx_tap", 0.4], [T_PORT + 20, "sfx_tap", 0.4],
  [L[16].end + 1, "sfx_burn", 0.7], [L[16].end + 7, "sfx_rimshot", 0.45], [at(16, 0), "sfx_thump", 0.6],
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
      <Soundtrack total={FILM_FRAMES} voice={staticFile("projects/pipi-ep14-lost-everything/narration.mp3")} voiceAt={LEAD} voiceEnd={VOICE_END} music="music_pad" musicLen={1800} amb="amb_night" ambVol={0.2} sfx={SFX} />
    </AbsoluteFill>
  );
};
