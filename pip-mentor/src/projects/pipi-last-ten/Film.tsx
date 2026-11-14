import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Captions, CAPTION_FONT, eio, eout, Glint, INK, keys, lerp, Mood, pop, ramp, rnd, ShotDef, Shots, Sfx, Soundtrack, VH, VW, blinkAt, clamp01 } from "./kit";
import { Grandma, Guru, Pipi, RepoMan } from "./characters";
import { CHUNKS, VOICE_END, WORDS } from "./words";

// pip.mentor - "Pipi's last ten dollars" (9:16, 1440x2560 world, render at 0.75 -> 1080x1920).
// Pipi (poor): $10 left, rent due, a guru texts "all in". Grandma's rule (never bet the rent) saves him: he risks $1 of $10, loses it, keeps nine.
// The guru's Lamborghini was rented and gets repossessed. Pipi wins $3 next week and buys grandma a tea. Ends on "Would you have pressed the button?".
// Narration: free Microsoft voice (en-US-GuyNeural), word timings from faster-whisper, narration muxed at +6 frames so the hook starts at once.
export const FILM_FRAMES = VOICE_END + 90;

const SFX: Sfx[] = [
  [8, "sfx_whoosh", 0.3], [94, "sfx_thump", 0.6], [181, "sfx_buzz", 0.35], [192, "sfx_pop", 0.3], [219, "sfx_pop", 0.35], [269, "sfx_ding", 0.4],
  [330, "sfx_thump", 0.5], [346, "sfx_thump", 0.5], [362, "sfx_thump", 0.55], [374, "sfx_thump", 0.6],
  [449, "sfx_sparkle", 0.4], [511, "sfx_tap", 0.6], [518, "sfx_tap", 0.6], [526, "sfx_tap", 0.6], [532, "sfx_tap", 0.7],
  [599, "sfx_coin", 0.4], [619, "sfx_click", 0.5], [715, "sfx_sad", 0.4], [782, "sfx_sparkle", 0.4],
  [837, "sfx_whoosh", 0.25], [910, "sfx_pop", 0.45], [953, "sfx_whoosh", 0.3], [975, "sfx_ding", 0.35], [984, "sfx_whoosh", 0.35], [1015, "sfx_thud", 0.7],
  [1073, "sfx_coin", 0.35], [1078, "sfx_coin", 0.35], [1083, "sfx_coin", 0.35], [1144, "sfx_sparkle", 0.45], [1195, "sfx_thump", 0.7], [1262, "sfx_ding", 0.4],
];

const GROUND = 2240, GREEN = "#27d17f", RED = "#ff4d5e", GOLD = "#f0b84a", WOOD = "#b4763e";
const beat = (g: number, bs: number[]) => bs.reduce((m, b) => (g >= b ? Math.max(m, Math.exp(-(g - b) / 5)) : m), 0);

// ---------- shared props ----------
const Car: React.FC<{ x: number; y: number; s?: number; color?: string; sticker?: number }> = ({ x, y, s = 1, color = "#f5c331", sticker = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={10} cy={4} rx={340} ry={14} fill="#000" opacity={0.25} />
    <path d="M -300,-60 L -300,-100 Q -290,-120 -230,-130 L -90,-150 Q -40,-190 40,-190 L 120,-188 Q 170,-180 200,-140 L 280,-120 Q 320,-110 320,-70 L 320,-50 L -300,-50 Z" fill={color} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <path d="M -60,-146 Q -20,-176 40,-176 L 110,-174 Q 140,-170 160,-140 Z" fill="#cfe8f2" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M -200,-96 L 240,-96" stroke="#fff6cf" strokeWidth={7} strokeLinecap="round" opacity={0.7} />
    <rect x={296} y={-96} width={26} height={16} rx={4} fill="#fff7d6" stroke={INK} strokeWidth={4} />
    {[-170, 190].map((wx) => (<g key={wx}><circle cx={wx} cy={-40} r={52} fill="#1d1d26" stroke={INK} strokeWidth={7} /><circle cx={wx} cy={-40} r={20} fill="#cfd3da" stroke={INK} strokeWidth={4} /></g>))}
    {sticker > 0.01 && (
      <g transform={`translate(-20 -96) rotate(-6) scale(${sticker})`}>
        <rect x={-130} y={-34} width={260} height={68} rx={8} fill="#ffe14a" stroke={INK} strokeWidth={6} />
        <text x={0} y={16} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={50} fill={INK}>RENTED</text>
      </g>
    )}
  </g>
);
const Bill: React.FC = () => (
  <g transform="rotate(-12)">
    <rect x={-8} y={-96} width={130} height={64} rx={7} fill="#79d493" stroke={INK} strokeWidth={5} />
    <circle cx={57} cy={-64} r={20} fill="#4fae6c" stroke={INK} strokeWidth={3} />
    <text x={57} y={-55} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={26} fill={INK}>10</text>
  </g>
);
const Coin: React.FC<{ x: number; y: number; o?: number; s?: number }> = ({ x, y, o = 1, s = 1 }) => (
  <g opacity={o} transform={`translate(${x} ${y}) scale(${s})`}><ellipse cx={0} cy={9} rx={56} ry={16} fill="#b88a22" stroke={INK} strokeWidth={4} /><ellipse cx={0} cy={0} rx={56} ry={16} fill={GOLD} stroke={INK} strokeWidth={4} /></g>
);
const BuyBtn: React.FC<{ x: number; y: number; r: number; k?: number }> = ({ x, y, r, k = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    <circle r={r * 1.18} fill={GREEN} opacity={0.18} />
    <circle r={r} fill={GREEN} stroke={INK} strokeWidth={9} />
    <path d={`M ${-r * 0.7},${-r * 0.25} A ${r * 0.75} ${r * 0.75} 0 0 1 ${r * 0.3},${-r * 0.7}`} stroke="#aef5cf" strokeWidth={r * 0.1} fill="none" strokeLinecap="round" />
    <text x={0} y={r * 0.28} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={r * 0.72} fill="#06281a">BUY</text>
  </g>
);

// ---------- Pipi's room ----------
const Moth: React.FC<{ g: number }> = ({ g }) => {
  if (g < 8) return null;
  let x: number, y: number;
  if (g < 75) {
    const t = eout(ramp(g, 8, 75));
    x = lerp(846, 830, t) + Math.sin(g * 0.7) * 22 * (1 - t); y = lerp(1925, 430, t) + Math.cos(g * 0.5) * 16 * (1 - t);
  } else { x = 720 + 120 * Math.cos((g - 75) * 0.1); y = 400 + 60 * Math.sin((g - 75) * 0.15); }
  const fl = Math.sin(g * 1.4);
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={-14} cy={-4} rx={18} ry={8 + 9 * fl} fill="#e9e3d0" stroke={INK} strokeWidth={3} />
      <ellipse cx={14} cy={-4} rx={18} ry={8 + 9 * fl} fill="#e9e3d0" stroke={INK} strokeWidth={3} />
      <ellipse cx={0} cy={4} rx={5} ry={13} fill="#6b5a4a" stroke={INK} strokeWidth={3} />
    </g>
  );
};
const PoorRoom: React.FC<{ g: number; warm?: number }> = ({ g, warm = 0 }) => {
  const sway = Math.sin(g * 0.08) * 2.5;
  return (
    <g>
      <rect width={VW} height={VH} fill="#1a2342" />
      <rect y={GROUND - 30} width={VW} height={VH - GROUND + 30} fill="#0e1329" />
      <rect y={GROUND - 38} width={VW} height={10} fill="#222c52" />
      <g transform="rotate(-3 330 1000)">
        <rect x={120} y={720} width={420} height={560} fill="#d8cfb8" stroke={INK} strokeWidth={6} />
        <rect x={150} y={760} width={360} height={300} fill="#2a2f55" />
        <Car x={330} y={1010} s={0.5} />
        <rect x={100} y={700} width={70} height={30} fill="#e8dca0" opacity={0.8} /><rect x={500} y={700} width={70} height={30} fill="#e8dca0" opacity={0.8} />
      </g>
      <defs>
        <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe9a8" stopOpacity={0.55 + warm * 0.2} /><stop offset="1" stopColor="#ffe9a8" stopOpacity={0.03} /></linearGradient>
      </defs>
      <g transform={`rotate(${sway} 720 0)`}>
        <polygon points={`700,390 740,390 1300,${GROUND} 140,${GROUND}`} fill="url(#cone)" />
        <line x1={720} y1={0} x2={720} y2={330} stroke={INK} strokeWidth={5} />
        <rect x={700} y={318} width={40} height={30} fill="#3a3f5c" stroke={INK} strokeWidth={5} />
        <circle cx={720} cy={362} r={38} fill="#fff1bf" stroke={INK} strokeWidth={6} />
      </g>
      <Moth g={g} />
    </g>
  );
};
const Calendar: React.FC<{ g: number }> = ({ g }) => {
  if (g < 88) return null;
  const t = ramp(g, 88, 98), drop = -(1 - eio(t)) * 700, rot = Math.sin((g - 98) * 0.6) * 5 * Math.exp(-Math.max(0, g - 98) / 8);
  return (
    <g transform={`translate(1090 ${900 + drop}) rotate(${rot})`}>
      <rect x={-150} y={-170} width={300} height={340} rx={10} fill="#f4f1e8" stroke={INK} strokeWidth={7} />
      <rect x={-150} y={-170} width={300} height={84} rx={10} fill="#e23b4e" stroke={INK} strokeWidth={7} />
      <text x={0} y={-108} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={60} fill="#fff">DUE</text>
      <circle cx={0} cy={20} r={92} fill="none" stroke={RED} strokeWidth={11} />
      <text x={0} y={80} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={190} fill={INK}>1</text>
    </g>
  );
};
const HookScene: React.FC<{ g: number }> = ({ g }) => (
  <g>
    <PoorRoom g={g} />
    <Calendar g={g} />
    <Pipi x={720} y={GROUND} s={2.1} facing={1} pockets={1} mood="sad" look={[g > 94 ? 9 : 0, g > 94 ? -3 : 4]} blink={blinkAt(g, 2) * keys(g, [[0, 1], [40, 0.55], [150, 0.55]])}
      sweat={ramp(g, 100, 130) * 0.85} headTilt={4} armR={100} elbowR={-30} armL={8} holdR={<Bill />} />
    <Glint x={1040} y={1640} t={ramp(g, 24, 50)} r={70} />
  </g>
);

// ---------- street (guru, Lambo, repo man) ----------
const liftAt = (g: number) => eio(ramp(g, 976, 1000)) * 2400;
const StreetScene: React.FC<{ g: number }> = ({ g }) => {
  const carY = GROUND - liftAt(g), hang = (gg: number) => Math.min(GROUND, GROUND - liftAt(gg) + 743);
  const gy = g < 994 ? hang(g) : Math.min(GROUND, hang(994) + 3.5 * (g - 994) * (g - 994));
  const landed = g >= 1015 ? ramp(g, 1015, 1021) : 0;
  const gx = g < 953 ? 1130 : lerp(1130, 1060, ramp(g, 953, 968));
  const magY = g < 972 ? keys(g, [[0, -300], [953, -300], [972, 1890]]) : 1890 - liftAt(g);
  const gm: Mood = g < 910 ? "sly" : g < 984 ? "worried" : g < 1015 ? "surprised" : "sad";
  return (
    <g>
      <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2b2350" /><stop offset="1" stopColor="#f08a5d" /></linearGradient></defs>
      <rect width={VW} height={VH} fill="url(#sky)" />
      <circle cx={1060} cy={1560} r={150} fill="#ffd7a0" opacity={0.9} />
      {Array.from({ length: 9 }).map((_, i) => { const h = 420 + rnd(`bh${i}`) * 520; return <rect key={i} x={i * 170 - 20} y={2000 - h} width={150} height={h} fill="#171a33" />; })}
      <rect y={2000} width={VW} height={VH - 2000} fill="#2b2d3f" />
      <rect y={1990} width={VW} height={14} fill="#4a4d66" />
      <path d="M0,2420 L1440,2420" stroke="#e8e3c8" strokeWidth={10} strokeDasharray="90 70" opacity={0.6} />
      <Car x={560} y={carY} s={1.5} sticker={g >= 910 ? pop(g, 910, 8) : 0} />
      {g >= 940 && (
        <g>
          <line x1={560} y1={-200} x2={560} y2={magY - 60} stroke={INK} strokeWidth={6} />
          <path d={`M ${510},${magY - 60} L ${510},${magY} A 50 50 0 0 0 ${610},${magY} L ${610},${magY - 60}`} fill="none" stroke="#d9283b" strokeWidth={38} strokeLinejoin="round" />
          <rect x={491} y={magY - 62} width={38} height={26} fill="#eee" stroke={INK} strokeWidth={3} /><rect x={591} y={magY - 62} width={38} height={26} fill="#eee" stroke={INK} strokeWidth={3} />
        </g>
      )}
      <g transform={`rotate(${landed * 88} ${gx} ${gy})`}>
        <Guru x={gx} y={gy} s={2.1} facing={-1} mood={gm} blink={blinkAt(g, 4)} sweat={ramp(g, 910, 940)}
          walk={g >= 953 && g < 976 ? g * 0.55 : 0}
          armR={g < 976 ? lerp(100 + 12 * Math.sin(g * 0.3), 110, ramp(g, 953, 968)) : 172} elbowR={g < 976 ? -50 : 0} armL={g < 976 ? 30 : 172} />
      </g>
      {g >= 953 && (
        <RepoMan x={250} y={GROUND} s={2.1} facing={1} mood="sly" blink={blinkAt(g, 6)}
          armR={keys(g, [[953, 10], [968, 70], [972, 82], [1400, 82]])}
          holdR={<g><rect x={-6} y={-40} width={44} height={64} rx={8} fill="#222" stroke={INK} strokeWidth={4} /><circle cx={16} cy={-12} r={11} fill={RED} stroke={INK} strokeWidth={3} /></g>} />
      )}
    </g>
  );
};

// ---------- phone ----------
const PhoneScene: React.FC<{ g: number }> = ({ g }) => {
  const buzz = g >= 181 && g < 200 ? Math.sin(g * 2.2) * 10 : 0;
  const typing = g >= 192 && g < 219;
  const bubble = (y: number, w: number, at: number, text: string, col: string, tc = "#fff") => {
    const k = g >= at ? pop(g, at, 9) : 0;
    return k > 0.01 ? (
      <g transform={`translate(300 ${y}) scale(${k})`}>
        <rect x={0} y={0} width={w} height={150} rx={42} fill={col} />
        <text x={46} y={96} fontFamily={CAPTION_FONT} fontWeight={800} fontSize={58} fill={tc}>{text}</text>
      </g>
    ) : null;
  };
  return (
    <g>
      <rect width={VW} height={VH} fill="#0b0e1c" />
      <g transform={`translate(${buzz} 0)`}>
        <rect x={190} y={300} width={1060} height={1960} rx={110} fill="#0c1020" stroke={INK} strokeWidth={12} />
        <rect x={225} y={340} width={990} height={1880} rx={80} fill="#161d33" />
        <rect x={225} y={340} width={990} height={250} rx={80} fill="#1d2644" />
        <circle cx={400} cy={465} r={78} fill="#fbfbf8" stroke={INK} strokeWidth={7} />
        <rect x={340} y={445} width={50} height={30} rx={10} fill={INK} /><rect x={410} y={445} width={50} height={30} rx={10} fill={INK} /><path d="M390,460 l20,0" stroke={INK} strokeWidth={5} />
        <text x={520} y={490} fontFamily={CAPTION_FONT} fontWeight={800} fontSize={66} fill="#fff">GURU</text>
        {typing && [0, 1, 2].map((k) => <circle key={k} cx={360 + k * 50} cy={760} r={14 + 5 * Math.sin(g * 0.5 + k)} fill="#7d89b8" />)}
        {bubble(700, 700, 219, "Put it ALL in.", "#2a3556")}
        {bubble(900, 880, 262, "100% GUARANTEED", "#d9283b")}
      </g>
    </g>
  );
};

// ---------- the button ----------
const ButtonScene: React.FC<{ g: number }> = ({ g }) => {
  const pulse = 1 + 0.045 * beat(g, [330, 346, 362, 374]);
  const tx = 920 + Math.sin(g * 1.7) * 6 + 6 * rnd(`tx${g}`), ty = lerp(1090, 1170, ramp(g, 322, 372)) + Math.cos(g * 2.1) * 5;
  return (
    <g>
      <rect width={VW} height={VH} fill="#0e1326" />
      <rect x={150} y={260} width={1140} height={2040} rx={90} fill="#161d33" stroke={INK} strokeWidth={10} />
      <text x={720} y={470} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={120} fill="#fff">$10.00</text>
      <path d="M260,780 L420,720 L540,760 L700,640 L860,700 L1020,600 L1180,640" fill="none" stroke={GREEN} strokeWidth={9} opacity={0.5} strokeLinecap="round" strokeLinejoin="round" />
      <BuyBtn x={720} y={1500} r={290} k={pulse} />
      {[340, 355, 368].map((at, i) => { const t = ramp(g, at, at + 22); return t > 0 && t < 1 ? <path key={i} d={`M ${760 + i * 70},${900 + t * 480} q -16,26 0,34 q 16,-8 0,-34 z`} fill="#8fd0ff" stroke={INK} strokeWidth={4} opacity={1 - t * 0.4} /> : null; })}
      <g transform={`translate(${tx} ${ty}) rotate(-22)`}>
        <rect x={-75} y={-60} width={150} height={460} rx={75} fill="#fbfbf8" stroke={INK} strokeWidth={9} />
        <path d="M-40,-10 Q0,-40 40,-10" fill="none" stroke="#e7d9d0" strokeWidth={6} />
      </g>
    </g>
  );
};

// ---------- grandma's kitchen ----------
const Steam: React.FC<{ g: number }> = ({ g }) => (
  <g>{[0, 1, 2].map((k) => { const t = ((g * 1.2 + k * 26) % 78) / 78; return <path key={k} d="M0,0 q 14,-24 0,-48 q -14,-24 0,-48" fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" opacity={0.6 * (1 - t)} transform={`translate(${-26 + k * 26} ${-70 - t * 90})`} />; })}</g>
);
const Cup: React.FC<{ g?: number }> = ({ g }) => (
  <g>
    <rect x={-34} y={-58} width={68} height={60} rx={12} fill="#fbfbf8" stroke={INK} strokeWidth={5} />
    <path d="M34,-44 q 30,4 0,34" fill="none" stroke={INK} strokeWidth={5} /><rect x={-30} y={-60} width={60} height={10} rx={5} fill="#b9763b" />
    {g !== undefined && <Steam g={g} />}
  </g>
);
const Spoon: React.FC<{ down: boolean }> = ({ down }) => (
  <g transform={down ? "rotate(160)" : "rotate(-8)"}>
    <line x1={0} y1={0} x2={0} y2={-120} stroke="#b9763b" strokeWidth={14} strokeLinecap="round" />
    <ellipse cx={0} cy={-142} rx={24} ry={32} fill="#c98a4b" stroke={INK} strokeWidth={5} />
  </g>
);
const Heart: React.FC<{ g: number }> = ({ g }) => {
  if (g < 1144) return null;
  const k = pop(g, 1144, 10), up = ramp(g, 1144, 1195) * 90;
  return <g transform={`translate(1000 ${1290 - up}) scale(${1.4 * k})`} opacity={1 - ramp(g, 1170, 1196)}><path d="M0,40 C-80,-20 -52,-80 0,-40 C52,-80 80,-20 0,40 Z" fill="#ff5a7a" stroke={INK} strokeWidth={6} /></g>;
};
const KitchenScene: React.FC<{ g: number; pipi?: boolean }> = ({ g, pipi }) => {
  const gr = pipi ? 1 : g >= 449 ? Math.max(0.01, pop(g, 449, 10)) : 0;
  const tap = beat(g, [511, 518, 526, 532]);
  const armR = pipi ? 55 : g < 505 ? 70 + 22 * Math.sin((g - 456) * 0.5) : 58 - 16 * tap;
  return (
    <g>
      <rect width={VW} height={VH} fill="#e9d2a6" />
      {Array.from({ length: 12 }).map((_, i) => <rect key={i} x={i * 120} y={0} width={60} height={GROUND} fill="#c9a96a" opacity={0.15} />)}
      <rect y={GROUND - 30} width={VW} height={VH - GROUND + 30} fill="#8d6238" />
      <rect x={140} y={700} width={380} height={460} fill="#fff0c4" stroke={INK} strokeWidth={9} /><path d="M330,700 L330,1160 M140,930 L520,930" stroke={INK} strokeWidth={8} />
      <g transform="translate(1100 780)"><circle r={86} fill="#fbfbf8" stroke={INK} strokeWidth={7} /><path d="M0,0 L0,-56" stroke={INK} strokeWidth={6} strokeLinecap="round" transform={`rotate(${g * 0.5})`} /><path d="M0,0 L40,0" stroke={INK} strokeWidth={6} strokeLinecap="round" /></g>
      <rect x={700} y={1030} width={600} height={24} fill="#a8703b" stroke={INK} strokeWidth={5} />
      {[0, 1, 2].map((k) => <g key={k}><rect x={730 + k * 190} y={930} width={90} height={100} rx={14} fill={["#d9283b", "#27d17f", "#f0b84a"][k]} stroke={INK} strokeWidth={5} /></g>)}
      {gr > 0 && <Grandma x={1000} y={GROUND} s={2.1 * gr} facing={-1} mood={pipi || g > 540 ? "happy" : "neutral"} blink={blinkAt(g, 9)} armR={armR} elbowR={0} armL={12}
        holdR={pipi ? undefined : <Spoon down={g >= 505} />} />}
      {pipi && <Pipi x={380} y={GROUND} s={2.0} facing={1} mood="happy" blink={blinkAt(g, 2)} armR={lerp(80, 55, ramp(g, 1136, 1146))} armL={10} look={[10, 0]} holdR={<Cup g={g} />} />}
      <rect x={400} y={1850} width={1000} height={46} rx={8} fill={WOOD} stroke={INK} strokeWidth={7} />
      <rect x={420} y={1896} width={960} height={344} fill="#f2e6d0" stroke={INK} strokeWidth={6} />
      {Array.from({ length: 8 }).map((_, r) => Array.from({ length: 12 }).map((__, c) => (r + c) % 2 === 0 ? <rect key={`${r}-${c}`} x={420 + c * 80} y={1896 + r * 43} width={80} height={43} fill="#d9283b" opacity={0.55} /> : null))}
      {!pipi && g < 560 && (
        <g transform="translate(725 1832)"><rect x={-90} y={-50} width={180} height={100} fill="#f7f2e4" stroke={INK} strokeWidth={5} /><path d="M-90,-50 L0,10 L90,-50" fill="none" stroke={INK} strokeWidth={4} />
          <text x={0} y={36} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={40} fill={RED}>RENT</text></g>
      )}
      <g transform="translate(1230 1850)"><Cup g={pipi ? undefined : g} /></g>
      <Heart g={g} />
      <rect width={VW} height={VH} fill="#ffb35a" opacity={0.12} />
      <rect width={VW} height={VH} fill="#fff" opacity={0.25 * (1 - ramp(g, 414, 436)) * (pipi ? 0 : 1)} />
    </g>
  );
};

// ---------- Pipi's desk: coins, tablet, the trade ----------
const PRICE: [number, number][] = [[0, 0.5], [600, 0.52], [704, 0.52], [727, 0.36], [1020, 0.4], [1060, 0.45], [1100, 0.8], [1500, 0.85]];
const CH = { x: 730, y: 1520, w: 460, h: 170 };
const yOf = (p: number) => CH.y + CH.h - p * CH.h;
const TC_X = 1335, TC_REST = (i: number) => 1885 - i * 17;
const TradeScene: React.FC<{ g: number }> = ({ g }) => {
  const price = (t: number) => keys(Math.max(0, t), PRICE);
  const N = 40, pts: string[] = [];
  for (let i = 0; i < N; i++) { const gt = g - (N - 1 - i) * 5; pts.push(`${CH.x + (i / (N - 1)) * CH.w},${yOf(clamp01(price(gt) + (rnd(`c${Math.round(gt / 3)}`) - 0.5) * 0.05))}`); }
  const col = price(g) >= price(g - 40) ? GREEN : RED, last = pts[N - 1].split(",");
  const press = ramp(g, 612, 618) - ramp(g, 620, 628);
  const mood: Mood = g < 650 ? "neutral" : g < 704 ? "worried" : g < 753 ? "sad" : "happy";
  const slot = (i: number) => {
    if (i < 9) return <Coin key={i} x={TC_X} y={TC_REST(i)} />;
    if (i === 9 && g < 599) return <Coin key={i} x={TC_X} y={TC_REST(i)} />;
    if (i === 9 && g >= 599 && g < 621) { const e = eio(ramp(g, 599, 619)); return <Coin key={i} x={lerp(TC_X, 960, e)} y={lerp(TC_REST(9), 1767, e) - Math.sin(Math.PI * e) * 220} />; }
    const t0 = 1073 + (i - 9) * 5, t = ramp(g, t0, t0 + 22);
    if (t <= 0) return null;
    if (t >= 1) return <Coin key={i} x={TC_X} y={TC_REST(i)} />;
    const e = eio(t);
    return <Coin key={i} x={lerp(960, TC_X, e)} y={lerp(1660, TC_REST(i), e) - Math.sin(Math.PI * e) * 200} />;
  };
  return (
    <g>
      <PoorRoom g={g} warm={g > 1022 ? 1 : 0} />
      <rect x={560} y={1900} width={860} height={46} rx={8} fill="#6a4a38" stroke={INK} strokeWidth={7} />
      <rect x={580} y={1946} width={820} height={294} fill="#4a3328" stroke={INK} strokeWidth={6} />
      <rect x={940} y={1840} width={40} height={64} fill="#262c4b" stroke={INK} strokeWidth={5} />
      <rect x={690} y={1470} width={540} height={380} rx={22} fill="#1b2140" stroke={INK} strokeWidth={8} />
      <rect x={710} y={1490} width={500} height={340} fill="#0a1220" />
      <path d={`M ${pts.join(" L ")} L ${CH.x + CH.w},${CH.y + CH.h} L ${CH.x},${CH.y + CH.h} Z`} fill={col} opacity={0.12} />
      <polyline points={pts.join(" ")} fill="none" stroke={col} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r={9 + 3 * Math.sin(g * 0.3)} fill={col} />
      <g transform={`translate(960 1767) scale(${1 - 0.1 * press})`}><rect x={-80} y={-32} width={160} height={64} rx={14} fill={GREEN} stroke={INK} strokeWidth={5} /><text x={0} y={14} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={38} fill="#06281a">BUY</text></g>
      {g >= 727 && g < 770 && <text x={1090} y={1580} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={64} fill={RED} opacity={1 - ramp(g, 755, 770)}>-$1</text>}
      {g >= 1083 && <g transform={`translate(1090 1580) scale(${pop(g, 1083, 10)})`}><text x={0} y={0} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={64} fill={GREEN}>+$3</text></g>}
      {Array.from({ length: 12 }).map((_, i) => slot(i))}
      <Glint x={TC_X} y={1700} t={ramp(g, 782, 812)} r={80} />
      <Pipi x={380} y={GROUND} s={2.0} facing={1} mood={mood} look={[9, 2]} blink={blinkAt(g, 3)} sweat={g < 704 ? 0.5 : g < 753 ? 0.3 : 0} armR={55} armL={10} />
    </g>
  );
};

// ---------- day one ----------
const DayOneScene: React.FC<{ g: number }> = ({ g }) => {
  const k = g >= 1195 ? 1 + 0.6 * (1 - eout(ramp(g, 1195, 1205))) : 0;
  const look: [number, number] = g < 1251 ? [0, 0] : g < 1272 ? [10, 9] : [0, 0];
  const btn = 1 + 0.05 * Math.sin(g * 0.2) + 0.12 * beat(g, [1262]);
  return (
    <g>
      <PoorRoom g={g} warm={1} />
      {k > 0 && <g transform={`translate(720 700) rotate(-5) scale(${k})`}><text x={0} y={0} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={250} fill="#ffd400" stroke={INK} strokeWidth={16} paintOrder="stroke">DAY 1</text></g>}
      <Pipi x={560} y={GROUND} s={2.1} facing={1} mood={g < 1276 ? "happy" : "sly"} look={look} blink={blinkAt(g, 5)} armR={20} armL={10} headTilt={g > 1276 ? 5 : 0} />
      {g >= 1240 && <g opacity={ramp(g, 1240, 1252)}><BuyBtn x={1090} y={2060} r={140} k={btn} /></g>}
      <Glint x={640} y={1470} t={ramp(g, 1205, 1235)} r={60} />
    </g>
  );
};

// ---------- shots ----------
type Cam = [number, number, number];
const shot = (from: number, to: number, c0: Cam, c1: Cam, scene: (g: number) => React.ReactNode, shakes: number[] = []): ShotDef => ({
  from, to, z0: 1, z1: 1,
  render: (l, p) => {
    const g = from + l, e = eio(p), cx = lerp(c0[0], c1[0], e), cy = lerp(c0[1], c1[1], e), z = lerp(c0[2], c1[2], e);
    let sx = 0, sy = 0;
    for (const b of shakes) if (g >= b) { const d = Math.exp(-(g - b) / 4) * 20; sx += Math.sin((g - b) * 2.3) * d; sy += Math.cos((g - b) * 3.1) * d * 0.7; }
    return <g transform={`translate(${VW / 2 + sx} ${VH / 2 + sy}) scale(${z}) translate(${-cx} ${-cy})`}>{scene(g)}</g>;
  },
});
const hook = (g: number) => <HookScene g={g} />, street = (g: number) => <StreetScene g={g} />, trade = (g: number) => <TradeScene g={g} />;
const SHOTS: ShotDef[] = [
  shot(0, 75, [880, 1680, 2.1], [720, 1280, 1.0], hook),
  shot(75, 152, [720, 1500, 1.15], [760, 1480, 1.3], hook, [94]),
  shot(152, 200, [720, 1700, 1.1], [760, 1660, 1.22], street),
  shot(200, 318, [720, 1280, 1.0], [720, 1280, 1.07], (g) => <PhoneScene g={g} />),
  shot(318, 414, [720, 1500, 1.0], [720, 1440, 1.12], (g) => <ButtonScene g={g} />),
  shot(414, 508, [820, 1500, 1.3], [860, 1560, 1.45], (g) => <KitchenScene g={g} />),
  shot(508, 572, [780, 1800, 2.0], [760, 1790, 2.2], (g) => <KitchenScene g={g} />, [511, 518, 526, 532]),
  shot(572, 648, [900, 1700, 1.5], [980, 1740, 1.65], trade),
  shot(648, 704, [980, 1760, 2.2], [980, 1760, 2.5], trade),
  shot(704, 753, [960, 1650, 2.0], [960, 1650, 1.8], trade),
  shot(753, 815, [820, 1650, 1.5], [800, 1620, 1.4], trade),
  shot(815, 872, [720, 1700, 1.1], [800, 1660, 1.25], street),
  shot(872, 935, [500, 2050, 2.0], [470, 2050, 2.2], street),
  shot(935, 1022, [720, 1280, 1.0], [720, 1280, 1.0], street, [1015]),
  shot(1022, 1122, [900, 1700, 1.5], [1000, 1700, 1.6], trade),
  shot(1122, 1190, [720, 1600, 1.3], [700, 1580, 1.4], (g) => <KitchenScene g={g} pipi />),
  shot(1190, 1248, [560, 1560, 1.1], [560, 1540, 1.2], (g) => <DayOneScene g={g} />, [1195]),
  shot(1248, FILM_FRAMES + 1, [660, 1600, 1.25], [640, 1560, 1.6], (g) => <DayOneScene g={g} />),
];

export const PipiLastTenFilm: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#0e1329" }}>
      <Shots f={f} shots={SHOTS} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)" }} />
      <Captions f={f} words={WORDS} chunks={CHUNKS} />
      <Soundtrack total={FILM_FRAMES} voice={staticFile("projects/pipi-last-ten/narration.mp3")} voiceAt={6} voiceEnd={VOICE_END} music="music_pad" musicLen={1500} amb="amb_night" ambVol={0.3} sfx={SFX} />
    </AbsoluteFill>
  );
};
