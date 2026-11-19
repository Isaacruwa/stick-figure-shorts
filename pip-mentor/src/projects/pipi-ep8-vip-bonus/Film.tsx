import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { CAPTION_FONT, eio, eout, INK, lerp, Mood, pop, ramp, rnd, ShotDef, Shots, Sfx, Soundtrack, VH, VW, blinkAt } from "./kit";
import { Grandma, Pipi } from "./characters";
import { LEAD, LINES, VOICE_END } from "./lines";

// pip.mentor - Pipi ep 8 "VIP Bonus" (9:16 cartoon scene, no narrator, perfect loop). CLEAN STAGING: only Pipi and Grandma on screen, far apart, a table between them.
// A smarmy broker "account manager" (Chad, a voice on the phone) tries to sell Pipi a $5,000 VIP upgrade. Grandma takes the phone, roasts him three times (leash -> ex-husband -> free mugs),
// then drops the phone in the soup. Button: "A bonus you can't withdraw is a leash." The pot starts ringing -> loops to the ringing phone at frame 0.
// Shots, mouths, moods and props key off LINES (tools/make_dialogue.py), not frame numbers.
export const FILM_FRAMES = VOICE_END + 80;
const L = LINES;
const at = (i: number, off = 0) => L[Math.min(i, L.length - 1)].start + off;

const GROUND = 2240, GREEN = "#27d17f", RED = "#ff4d5e";
const PX = 250, RX = 1190, PHX = 880, POTX = 640, TABLE_Y = 1850;
const COL: Record<string, string> = { PIPI: "#8ff5cf", BROKER: "#9fd0ff", GRANDMA: "#ffc2dd" };
const MP: Mood[] = ["worried", "worried", "surprised", "neutral", "happy", "happy", "happy", "happy", "happy", "surprised", "happy"];
const MR: Mood[] = ["neutral", "neutral", "neutral", "sly", "sly", "sly", "sly", "sly", "sly", "sly", "happy"];
const cur = (g: number) => { let c = 0; for (let i = 0; i < L.length; i++) if (g >= L[i].start - 2) c = i; return c; };
const talking = (g: number, who: string) => { const i = L.findIndex((l) => g >= l.start && g <= l.end); return i >= 0 && L[i].who === who ? 0.25 + 0.75 * rnd(`m${who}${Math.floor(g / 3)}`) : 0; };
const mood = (t: Mood[], g: number): Mood => t[Math.min(cur(g), t.length - 1)];

const T_GRAB = at(3, -4), T_DROP = L[9].end - 4, T_SPLASH = T_DROP + 22;
// where Grandma's hand is for a given arm angle (s = 2.1, facing left)
const handXY = (a: number): [number, number] => [RX - (40 + Math.sin((a * Math.PI) / 180) * 120) * 2.1, GROUND + (-272 + Math.cos((a * Math.PI) / 180) * 120) * 2.1];

const Bill: React.FC = () => (
  <g transform="rotate(-12)">
    <rect x={-8} y={-96} width={130} height={64} rx={7} fill="#79d493" stroke={INK} strokeWidth={5} />
    <circle cx={57} cy={-64} r={20} fill="#4fae6c" stroke={INK} strokeWidth={3} />
    <text x={57} y={-55} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={26} fill={INK}>10</text>
  </g>
);
// the phone: origin = bottom centre, 260 x 430. Chad (the broker) is on the screen.
const Chad: React.FC<{ talk: number }> = ({ talk }) => (
  <g>
    <rect x={-110} y={-380} width={220} height={330} rx={14} fill="#0e2a4a" />
    <circle cx={0} cy={-230} r={74} fill="#fbfbf8" stroke={INK} strokeWidth={6} />
    <path d="M -72,-250 Q -60,-318 0,-312 Q 62,-318 72,-250 Q 40,-282 0,-280 Q -40,-282 -72,-250 Z" fill="#2a1d14" stroke={INK} strokeWidth={4} />
    <path d="M -78,-232 Q -84,-300 0,-306 Q 84,-300 78,-232" fill="none" stroke="#222" strokeWidth={9} /><rect x={-92} y={-246} width={24} height={44} rx={10} fill="#222" />
    <path d="M -80,-200 Q -70,-170 -40,-172" fill="none" stroke="#222" strokeWidth={6} strokeLinecap="round" />
    <circle cx={-26} cy={-240} r={8} fill={INK} /><circle cx={26} cy={-240} r={8} fill={INK} />
    <path d="M -24,-262 l 40,-6" stroke={INK} strokeWidth={5} strokeLinecap="round" /><path d="M 24,-262 l -40,-6" stroke={INK} strokeWidth={5} strokeLinecap="round" opacity={0} />
    {talk > 0.06 ? <ellipse cx={0} cy={-196} rx={26} ry={6 + 16 * talk} fill={INK} /> : <path d="M -32,-200 Q 0,-176 32,-200" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />}
    <rect x={-92} y={-120} width={184} height={46} rx={10} fill="#ffd400" stroke={INK} strokeWidth={5} />
    <text x={0} y={-86} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={40} fill={INK}>VIP</text>
  </g>
);
const PhoneProp: React.FC<{ g: number; scale?: number; ring?: boolean }> = ({ g, scale = 1, ring }) => {
  const tk = talking(g, "BROKER"), active = tk > 0 || ring;
  return (
    <g transform={`scale(${scale})`}>
      {active && [0, 1, 2].map((k) => { const t = ((g * 0.06 + k / 3) % 1); return <rect key={k} x={-130 - t * 70} y={-400 - t * 70} width={260 + t * 140} height={430 + t * 140} rx={30 + t * 30} fill="none" stroke="#9fd0ff" strokeWidth={6} opacity={0.55 * (1 - t)} />; })}
      <rect x={-130} y={-400} width={260} height={430} rx={30} fill="#10162b" stroke={INK} strokeWidth={8} />
      <g transform="translate(0 -12)"><Chad talk={tk} /></g>
    </g>
  );
};
const Pot: React.FC<{ g: number; shake: number; soup: number }> = ({ g, shake, soup }) => (
  <g transform={`translate(${POTX + Math.sin(g * 2.4) * 6 * shake} ${TABLE_Y})`}>
    <rect x={-120} y={-150} width={240} height={150} rx={22} fill="#6b6f80" stroke={INK} strokeWidth={7} />
    <ellipse cx={0} cy={-150} rx={120} ry={22} fill="#f0a040" stroke={INK} strokeWidth={6} />
    <rect x={-140} y={-168} width={280} height={22} rx={10} fill="#8b8fa3" stroke={INK} strokeWidth={5} opacity={0} />
    <rect x={-150} y={-110} width={30} height={20} rx={8} fill="#8b8fa3" stroke={INK} strokeWidth={5} /><rect x={120} y={-110} width={30} height={20} rx={8} fill="#8b8fa3" stroke={INK} strokeWidth={5} />
    {[0, 1, 2].map((k) => { const t = ((g * 1.2 + k * 26) % 78) / 78; return <path key={k} d="M0,0 q 14,-24 0,-48 q -14,-24 0,-48" fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" opacity={0.6 * (1 - t)} transform={`translate(${-40 + k * 40} ${-170 - t * 90})`} />; })}
    {soup > 0 && [0, 1, 2, 3].map((k) => <circle key={k} cx={-60 + k * 40} cy={-165 - 60 * soup * ((g * 0.07 + k * 0.3) % 1)} r={12} fill="#f0a040" stroke={INK} strokeWidth={3} opacity={1 - ((g * 0.07 + k * 0.3) % 1)} />)}
  </g>
);
const Kitchen: React.FC<{ g: number }> = ({ g }) => (
  <g>
    <rect x={-800} y={-1200} width={3040} height={3400} fill="#e9d2a6" />
    {Array.from({ length: 22 }).map((_, i) => <rect key={i} x={i * 120 - 800} y={-1200} width={60} height={3400} fill="#c9a96a" opacity={0.15} />)}
    <rect x={-800} y={GROUND - 30} width={3040} height={1400} fill="#8d6238" />
    <rect x={500} y={640} width={440} height={420} fill="#fff0c4" stroke={INK} strokeWidth={9} /><path d="M720,640 L720,1060 M500,850 L940,850" stroke={INK} strokeWidth={8} />
    <g transform="translate(1180 760)"><circle r={86} fill="#fbfbf8" stroke={INK} strokeWidth={7} /><path d="M0,0 L0,-56" stroke={INK} strokeWidth={6} strokeLinecap="round" transform={`rotate(${g * 0.5})`} /><path d="M0,0 L40,0" stroke={INK} strokeWidth={6} strokeLinecap="round" /></g>
  </g>
);

const SceneW: React.FC<{ g: number }> = ({ g }) => {
  const c = cur(g), finalLine = c >= L.length - 1, bob = Math.sin(g / 14) * 3, yap = talking(g, "GRANDMA");
  const holding = g >= T_GRAB && g < T_DROP;
  const grab = ramp(g, T_GRAB, T_GRAB + 8);
  const toss = ramp(g, T_DROP, T_SPLASH), te = eio(toss);
  const inPot = g >= T_SPLASH;
  const ringing = g < at(0, 0) + 60 && c === 0;
  const armHold = lerp(58, 128, grab) + (yap > 0 ? 6 * Math.sin(g * 0.8) : 0);
  const armR = g < T_GRAB ? 58 : holding ? armHold : g < T_SPLASH ? lerp(128, 55, ramp(g, T_DROP, T_DROP + 6)) : 55;
  const [hx0, hy0] = handXY(128);
  const potShake = inPot ? 1 : 0;
  const ringWob = g < T_GRAB && (ringing || talking(g, "BROKER") > 0) ? Math.sin(g * 2.2) * 3 : 0;
  const look: [number, number] = finalLine ? [0, 0] : [8, 0];
  return (
    <g>
      <Kitchen g={g} />
      <rect x={480} y={TABLE_Y} width={540} height={46} rx={8} fill="#b4763e" stroke={INK} strokeWidth={7} />
      <rect x={500} y={TABLE_Y + 46} width={500} height={344} fill="#f2e6d0" stroke={INK} strokeWidth={6} />
      {Array.from({ length: 8 }).map((_, r) => Array.from({ length: 6 }).map((__, cc) => (r + cc) % 2 === 0 ? <rect key={`${r}-${cc}`} x={500 + cc * 83} y={TABLE_Y + 46 + r * 43} width={83} height={43} fill="#d9283b" opacity={0.55} /> : null))}
      <Pipi x={PX} y={GROUND} s={2.1} facing={1} mood={mood(MP, g)} talk={talking(g, "PIPI")} blink={blinkAt(g, 2)} look={look} bob={bob} headTilt={finalLine ? 4 : 0}
        sweat={c <= 2 ? 0.5 : 0} armR={c === 1 || c === 2 ? 105 : 40} elbowR={c === 1 || c === 2 ? -30 : 0} armL={12 + talking(g, "PIPI") * 16 * Math.sin(g * 0.3)} holdR={c === 1 || c === 2 ? <Bill /> : undefined} />
      {!inPot && g < T_GRAB && <g transform={`translate(${PHX} ${TABLE_Y}) rotate(${ringWob})`}><PhoneProp g={g} scale={1} ring={ringing} /></g>}
      <Pot g={g} shake={potShake} soup={inPot ? 1 : 0} />
      {g >= T_DROP && g < T_SPLASH && <g transform={`translate(${lerp(hx0, POTX, te)} ${lerp(hy0 + 40, TABLE_Y - 150, te) - Math.sin(Math.PI * te) * 380}) rotate(${720 * te})`}><PhoneProp g={g} scale={0.5} /></g>}
      {g >= T_SPLASH && g < T_SPLASH + 14 && <g transform={`translate(${POTX} ${TABLE_Y - 150})`}>{[0, 1, 2, 3, 4].map((k) => { const t = ramp(g, T_SPLASH, T_SPLASH + 14); return <circle key={k} cx={(k - 2) * 40 * t} cy={-120 * t * (1 - 0.3 * Math.abs(k - 2))} r={14 * (1 - t * 0.5)} fill="#f0a040" stroke={INK} strokeWidth={3} opacity={1 - t * 0.6} />; })}</g>}
      <Grandma x={RX} y={GROUND} s={2.1} facing={-1} mood={mood(MR, g)} talk={yap} blink={blinkAt(g, 9)} look={[8, 0]} bob={Math.sin(g / 12) * 3} headTilt={yap > 0 ? 4 * Math.sin(g * 0.4) : 0}
        elbowR={holding ? -70 * grab : 0} armR={armR} armL={20 + yap * 45 * Math.sin(g * 0.55)} holdR={holding ? <g transform="translate(0 -6)"><PhoneProp g={g} scale={0.42} /></g> : undefined} />
    </g>
  );
};

type Cam = [number, number, number];
const WIDE: Cam = [720, 1700, 1.15], PHONE: Cam = [PHX, 1600, 2.6], CUP: Cam = [PX, 1590, 2.0], CUG: Cam = [RX, 1600, 2.0], HELD: Cam = [1010, 1560, 2.3];
const PLAN: { a: Cam; a2: Cam; split?: number; b?: Cam; b2?: Cam }[] = [
  { a: [PHX, 1600, 2.8], a2: [PHX, 1600, 2.4] },
  { a: CUP, a2: [PX, 1590, 2.2] },
  { a: PHONE, a2: [PHX, 1600, 2.3], split: 0.6, b: [PX, 1590, 2.4], b2: [PX, 1590, 2.7] },
  { a: CUG, a2: [RX, 1600, 2.2] },
  { a: HELD, a2: [1010, 1560, 2.5] },
  { a: [RX, 1600, 2.2], a2: [RX, 1600, 2.0], split: 0.6, b: [PX, 1590, 2.2], b2: [PX, 1590, 2.4] },
  { a: HELD, a2: [1010, 1560, 2.6] },
  { a: [RX, 1600, 2.2], a2: [RX, 1600, 2.0], split: 0.5, b: [PX, 1590, 2.3], b2: [PX, 1590, 2.5] },
  { a: HELD, a2: [1010, 1560, 2.8] },
  { a: [RX, 1600, 2.2], a2: [RX, 1600, 2.0], split: 0.5, b: WIDE, b2: [700, 1700, 1.25] },
  { a: [480, 1650, 1.6], a2: [460, 1650, 1.75] },
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
  if (pl.split && pl.b && pl.b2) { const mid = Math.round(from + (to - from) * pl.split); SHOTS.push(mk(from, mid, pl.a, pl.a2, sh.filter((x) => x < mid)), mk(mid, to, pl.b, pl.b2, [...sh.filter((x) => x >= mid), ...(i === 9 ? [T_SPLASH] : [])])); }
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
  return <div style={{ position: "absolute", left: 0, right: 0, top: 330 + sh, textAlign: "center", transform: `rotate(-5deg) scale(${k})`, fontFamily: CAPTION_FONT, fontWeight: 800, fontSize: 250, color: "#ffd400", WebkitTextStroke: "16px #0a0d1a", paintOrder: "stroke fill" }}>EP 8</div>;
};

const SFX: Sfx[] = [
  [at(0, 0), "sfx_ring", 0.35], [at(0, 4), "sfx_sparkle", 0.35], [L[3].end + 1, "sfx_burn", 0.6], [L[5].end + 1, "sfx_burn", 0.65], [L[5].end + 7, "sfx_rimshot", 0.4],
  [L[7].end + 1, "sfx_burn", 0.7], [T_DROP, "sfx_whoosh", 0.4], [T_SPLASH, "sfx_splash", 0.7], [T_SPLASH + 4, "sfx_rimshot", 0.5],
  [at(10, -10), "sfx_buzz", 0.45], [at(10, 6), "sfx_buzz", 0.45], [at(10, 22), "sfx_buzz", 0.45], [at(10, 40), "sfx_thump", 0.55], [at(10, 60), "sfx_ding", 0.35],
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
      <Soundtrack total={FILM_FRAMES} voice={staticFile("projects/pipi-ep8-vip-bonus/narration.mp3")} voiceAt={LEAD} voiceEnd={VOICE_END} music="music_pad" musicLen={1800} amb="amb_night" ambVol={0.2} sfx={SFX} />
    </AbsoluteFill>
  );
};
