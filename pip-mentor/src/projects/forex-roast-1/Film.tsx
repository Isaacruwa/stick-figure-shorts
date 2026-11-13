import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Captions, CAPTION_FONT, eio, eout, Figure, FigureProps, Glint, INK, keys, lerp, mix, Mood, pop, ramp, rnd, ShotDef, Shots, Sfx, Soundtrack, VH, VW, blinkAt, clamp01 } from "./kit";
import { CHUNKS, VOICE_END, WORDS } from "./words";

// pip.mentor · "forex-roast-1" (16:9). A stick-figure roast of classic retail-trader mistakes.
// Narration: free Microsoft voice (edge-tts en-US-GuyNeural), word timings from faster-whisper, muxed at +15 frames.
// Hero = the viewer ("you", mint hoodie). Acted out: clock flips to 3:00, half the coins fly into one trade, the stop loss is dragged away
// then deleted, more coins follow, a "strategy" whiteboard doodle, an unbothered screen, 7 of 10 traders lose, brokers flip the loss-rate board.
// Fact: EU/UK regulators (ESMA/FCA) make CFD/forex brokers publish the % of retail accounts that lose money; typical figures are roughly 50-85%, average ~71%.
export const FILM_FRAMES = VOICE_END + 110;

const SFX: Sfx[] = [
  [88, "sfx_ding", 0.35], [160, "sfx_sad", 0.25],
  [252, "sfx_coin", 0.3], [256, "sfx_coin", 0.3], [260, "sfx_coin", 0.3], [264, "sfx_coin", 0.3], [268, "sfx_coin", 0.3], [284, "sfx_click", 0.5],
  [343, "sfx_sad", 0.35], [450, "sfx_whoosh", 0.25], [545, "sfx_click", 0.5], [546, "sfx_pop", 0.3],
  [589, "sfx_coin", 0.3], [594, "sfx_coin", 0.3], [599, "sfx_coin", 0.3], [604, "sfx_coin", 0.3], [609, "sfx_coin", 0.3],
  [653, "sfx_pop", 0.35], [661, "sfx_whoosh", 0.2], [744, "sfx_sad", 0.25], [834, "sfx_whoosh", 0.25],
  [892, "sfx_sad", 0.4], [972, "sfx_whoosh", 0.25], [990, "sfx_ding", 0.3], [1127, "sfx_pop", 0.3],
];

const WALL = "#161e3a", FLOOR = "#0b0f20", DESKTOP = "#5a4136", DESKC = "#3a2c26", SCREEN = "#0a1220";
const GREEN = "#27d17f", RED = "#ff4d5e", GOLD = "#f0b84a", HERO = "#2fbf8f";
const GROUND = 1380;
const HX = 1060; // hero x at the desk

// ---------- price story (0..1) ----------
const PRICE: [number, number][] = [[0, 0.52], [216, 0.6], [284, 0.66], [331, 0.7], [358, 0.62], [395, 0.58], [445, 0.555], [470, 0.5], [521, 0.38], [545, 0.31], [582, 0.22], [643, 0.12], [719, 0.07], [796, 0.05], [1400, 0.05]];
const priceAt = (g: number) => keys(Math.max(0, g), PRICE);
const STOP: [number, number][] = [[0, 0.55], [452, 0.55], [470, 0.3], [1400, 0.3]];
const CH = { x: 1530, y: 590, w: 460, h: 270 };
const yOf = (p: number) => CH.y + CH.h - p * CH.h;
const glowColor = (g: number) => mix(RED, GREEN, clamp01((priceAt(g) - 0.1) / 0.5));

// ---------- hero acting ----------
const MOODS: [number, Mood][] = [[0, "neutral"], [107, "sad"], [216, "neutral"], [241, "sly"], [331, "neutral"], [343, "worried"], [395, "sly"], [445, "worried"], [470, "sly"], [595, "happy"], [719, "sad"], [1030, "sly"], [1139, "worried"]];
const moodAt = (g: number): Mood => { let m: Mood = "neutral"; for (const [a, b] of MOODS) if (g >= a) m = b; return m; };
const LX: [number, number][] = [[0, 7], [145, 7], [163, -9], [190, -9], [205, 7], [1010, 7], [1030, 0], [1127, 0], [1135, 8], [1150, 8], [1175, 0], [1400, 0]];
const LY: [number, number][] = [[0, 1], [145, 1], [163, 3], [190, 3], [205, 1], [1010, 1], [1030, 0], [1400, 0]];
const DROOP: [number, number][] = [[0, 1], [100, 1], [122, 0.35], [205, 0.35], [225, 1], [1400, 1]];
const SWEAT: [number, number][] = [[0, 0], [345, 0], [385, 0.9], [580, 0.9], [600, 0.4], [719, 0.4], [800, 0.8], [1030, 0.5], [1400, 0.9]];
const tilt = (g: number) => (g >= 107 && g < 225 ? (4 + 6 * Math.sin((g - 107) / 9)) * ramp(g, 107, 125) * (1 - ramp(g, 205, 225)) : g >= 1096 ? 5 * ramp(g, 1096, 1140) : 0);
const heroDesk = (g: number): Omit<FigureProps, "x" | "y"> => {
  const click = ramp(g, 280, 284) - ramp(g, 286, 292);
  const delClick = ramp(g, 543, 546) - ramp(g, 548, 553);
  const wave = ramp(g, 397, 405) * (1 - ramp(g, 438, 445));
  const beg = ramp(g, 719, 735) * (1 - ramp(g, 826, 836));
  return {
    coat: HERO, s: 1.5, facing: 1, mood: moodAt(g),
    look: [keys(g, LX), keys(g, LY)], blink: blinkAt(g, 1) * keys(g, DROOP), sweat: keys(g, SWEAT),
    headTilt: tilt(g), bob: Math.sin(g / 18) * 3,
    armR: lerp(80 - 14 * click - 14 * delClick - 8 * ramp(g, 452, 470), 108, beg), elbowR: lerp(10, -25, beg),
    armL: lerp(12 + wave * (75 + 20 * Math.sin((g - 397) * 0.5)), 100, beg), elbowL: lerp(20 * wave, -25, beg),
  };
};

// ---------- set pieces ----------
const Win: React.FC<{ g: number }> = ({ g }) => (
  <g>
    <rect x={180} y={250} width={480} height={540} fill="#0a1230" stroke={INK} strokeWidth={9} />
    {Array.from({ length: 16 }).map((_, i) => <circle key={i} cx={210 + rnd(`sx${i}`) * 420} cy={280 + rnd(`sy${i}`) * 230} r={2.5 + rnd(`sr${i}`) * 2} fill="#fff" opacity={0.45 + 0.4 * Math.sin(g * 0.06 + i * 1.7)} />)}
    <circle cx={540} cy={360} r={46} fill="#f3ecc8" /><circle cx={562} cy={348} r={40} fill="#0a1230" />
    {Array.from({ length: 8 }).map((_, i) => {
      const x = 190 + i * 58, h = 90 + rnd(`b${i}`) * 110;
      return <g key={i}><rect x={x} y={790 - h} width={52} height={h} fill="#141c40" />{Array.from({ length: 5 }).map((__, k) => rnd(`w${i}-${k}`) > 0.5 ? <rect key={k} x={x + 8 + (k % 2) * 22} y={790 - h + 12 + Math.floor(k / 2) * 30} width={14} height={14} fill="#ffd36b" opacity={0.8} /> : null)}</g>;
    })}
    <path d="M420,250 L420,790 M180,520 L660,520" stroke={INK} strokeWidth={9} />
  </g>
);
const Bed: React.FC = () => (
  <g>
    <rect x={60} y={1255} width={660} height={100} fill="#2a2f55" stroke={INK} strokeWidth={7} />
    <rect x={60} y={1190} width={660} height={74} rx={12} fill="#3b4372" stroke={INK} strokeWidth={7} />
    <rect x={90} y={1152} width={210} height={58} rx={26} fill="#e8e6df" stroke={INK} strokeWidth={7} />
  </g>
);
const Zs: React.FC<{ g: number }> = ({ g }) => (
  <g>{[0, 1, 2].map((i) => {
    const t = ramp(g, 163 + i * 8, 193 + i * 8);
    if (t <= 0 || t >= 1) return null;
    const sc = 0.8 + i * 0.4;
    return <path key={i} d="M0,0 L28,0 L0,34 L28,34" stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={1 - t} transform={`translate(${200 + i * 40} ${1130 - t * 170}) scale(${sc})`} />;
  })}</g>
);
const Clock: React.FC<{ g: number }> = ({ g }) => {
  const flipped = g >= 91;
  const sc = flipped ? 0.9 + 0.1 * pop(g, 91, 10) : 1;
  return (
    <g transform={`translate(1760 360) scale(${sc})`}>
      <rect x={-150} y={-60} width={300} height={120} rx={14} fill="#05101a" stroke={INK} strokeWidth={8} />
      <text x={0} y={30} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={86} fill={flipped ? "#ff6a4a" : "#7a4a44"}>{flipped ? "03:00" : "11:47"}</text>
    </g>
  );
};
const Coin: React.FC<{ x: number; y: number; o?: number }> = ({ x, y, o = 1 }) => (
  <g opacity={o}><ellipse cx={x} cy={y + 8} rx={46} ry={13} fill="#b88a22" stroke={INK} strokeWidth={4} /><ellipse cx={x} cy={y} rx={46} ry={13} fill={GOLD} stroke={INK} strokeWidth={4} /></g>
);
const COIN_X = 2190;
const COIN_REST = (i: number) => 1030 - i * 14;
const leaveAt = (i: number) => (i >= 5 ? 252 + (9 - i) * 4 : 589 + (4 - i) * 5);
const Coins: React.FC<{ g: number }> = ({ g }) => (
  <g>{Array.from({ length: 10 }).map((_, i) => {
    const t0 = leaveAt(i), t = ramp(g, t0, t0 + 22), ry = COIN_REST(i);
    if (t <= 0) return <Coin key={i} x={COIN_X} y={ry} />;
    if (t >= 1) return null;
    const e = eio(t);
    return <Coin key={i} x={lerp(COIN_X, 1760, e)} y={lerp(ry, 720, e) - Math.sin(Math.PI * e) * 260} />;
  })}</g>
);
const Tumble: React.FC<{ g: number }> = ({ g }) => {
  if (g < 790 || g > 840) return null;
  const x = lerp(2450, 1330, ramp(g, 796, 836)), y = 1000 - Math.abs(Math.sin((g - 796) * 0.25)) * 30;
  return (
    <g transform={`translate(${x} ${y}) rotate(${(g - 796) * -14})`}>
      <circle r={38} fill="none" stroke="#b08d57" strokeWidth={5} />
      {[0, 1, 2, 3, 4, 5].map((k) => <line key={k} x1={-36} y1={0} x2={36} y2={0} stroke="#b08d57" strokeWidth={4} transform={`rotate(${k * 30})`} />)}
    </g>
  );
};
const Monitor: React.FC<{ g: number }> = ({ g }) => {
  const stopVis = (g >= 296 && g < 560 ? pop(g, 296, 10) * (1 - eout(ramp(g, 545, 556))) : 0) + (g >= 1127 ? pop(g, 1127, 10) : 0);
  const lvl = keys(g, STOP), ly = yOf(lvl);
  const press = ramp(g, 280, 284) - ramp(g, 286, 292);
  const cx = keys(g, [[0, 1700], [216, 1700], [270, 1945], [300, 1945], [440, 1960], [452, 1760], [1400, 1760]]);
  const cy = keys(g, [[0, 700], [216, 700], [270, 833], [300, 833], [440, 840], [452, 712], [470, 779], [1400, 779]]);
  const cursorOn = ramp(g, 210, 225) * (1 - ramp(g, 556, 566));
  const faceOn = ramp(g, 719, 729) * (1 - ramp(g, 826, 836));
  const yawn = Math.sin(Math.PI * ramp(g, 730, 775));
  return (
    <g>
      <rect x={1740} y={880} width={40} height={140} fill="#262c4b" stroke={INK} strokeWidth={6} />
      <rect x={1680} y={1006} width={160} height={34} rx={8} fill="#262c4b" stroke={INK} strokeWidth={6} />
      <rect x={1490} y={540} width={540} height={360} rx={18} fill="#1b2140" stroke={INK} strokeWidth={8} />
      <rect x={1510} y={560} width={500} height={320} fill={SCREEN} />
      <Chart g={g} />
      {stopVis > 0.01 && (
        <g opacity={clamp01(stopVis)}>
          <line x1={CH.x} x2={CH.x + CH.w * stopVis} y1={ly} y2={ly} stroke={RED} strokeWidth={5} strokeDasharray="18 12" />
          <rect x={CH.x + CH.w - 6} y={ly - 12} width={30} height={24} rx={5} fill={RED} />
        </g>
      )}
      <g transform={`translate(1945 833) scale(${1 - 0.08 * press})`}>
        <rect x={-45} y={-18} width={90} height={36} rx={8} fill={GREEN} />
        <text x={0} y={9} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={24} fill="#06281a">BUY</text>
      </g>
      {faceOn > 0.01 && (
        <g opacity={faceOn}>
          <rect x={1510} y={560} width={500} height={320} fill="#16243a" />
          <rect x={1590} y={650} width={130} height={64} rx={20} fill={INK} /><rect x={1800} y={650} width={130} height={64} rx={20} fill={INK} />
          <line x1={1720} y1={668} x2={1800} y2={668} stroke={INK} strokeWidth={8} />
          <path d="M1610,664 l40,0 M1820,664 l40,0" stroke="#fff" strokeWidth={5} opacity={0.5} strokeLinecap="round" />
          {yawn > 0.05 ? <ellipse cx={1760} cy={800} rx={34} ry={6 + 30 * yawn} fill={INK} /> : <line x1={1700} y1={800} x2={1820} y2={800} stroke={INK} strokeWidth={8} strokeLinecap="round" />}
        </g>
      )}
      {cursorOn > 0.01 && (
        <g opacity={cursorOn} transform={`translate(${cx} ${cy})`}>
          <path d="M0,0 L0,34 L9,26 L16,40 L23,36 L16,23 L28,23 Z" fill="#fff" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        </g>
      )}
    </g>
  );
};
const Chart: React.FC<{ g: number }> = ({ g }) => {
  const N = 60, pts: string[] = [];
  for (let i = 0; i < N; i++) {
    const gt = g - (N - 1 - i) * 5;
    const p = clamp01(priceAt(gt) + (rnd(`n${Math.round(gt / 3)}`) - 0.5) * 0.04);
    pts.push(`${CH.x + (i / (N - 1)) * CH.w},${yOf(p)}`);
  }
  const col = priceAt(g) >= priceAt(g - 45) ? GREEN : RED;
  const last = pts[N - 1].split(",");
  return (
    <g>
      {[0, 1, 2, 3].map((k) => <line key={k} x1={CH.x} x2={CH.x + CH.w} y1={CH.y + k * (CH.h / 3)} y2={CH.y + k * (CH.h / 3)} stroke="#fff" opacity={0.08} strokeWidth={2} />)}
      <path d={`M ${pts.join(" L ")} L ${CH.x + CH.w},${CH.y + CH.h} L ${CH.x},${CH.y + CH.h} Z`} fill={col} opacity={0.12} />
      <polyline points={pts.join(" ")} fill="none" stroke={col} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r={9 + 3 * Math.sin(g * 0.3)} fill={col} />
    </g>
  );
};
const Desk: React.FC = () => (
  <g>
    <rect x={1260} y={1076} width={36} height={290} fill={DESKC} stroke={INK} strokeWidth={6} />
    <rect x={2290} y={1076} width={36} height={290} fill={DESKC} stroke={INK} strokeWidth={6} />
    <rect x={1240} y={1040} width={1100} height={40} rx={8} fill={DESKTOP} stroke={INK} strokeWidth={7} />
    <rect x={1520} y={1014} width={300} height={26} rx={8} fill="#2b3050" stroke={INK} strokeWidth={5} />
    <ellipse cx={1310} cy={1030} rx={30} ry={14} fill="#2b3050" stroke={INK} strokeWidth={5} />
  </g>
);
const Room: React.FC<{ g: number }> = ({ g }) => (
  <g>
    <rect width={VW} height={VH} fill={WALL} />
    <rect y={GROUND - 40} width={VW} height={VH - GROUND + 40} fill={FLOOR} />
    <rect y={GROUND - 48} width={VW} height={10} fill="#222c52" />
    <Win g={g} /><Bed />
  </g>
);
const DeskScene: React.FC<{ g: number }> = ({ g }) => {
  const glow = glowColor(g);
  return (
    <g>
      <Room g={g} />
      <defs><radialGradient id="mg"><stop offset="0%" stopColor={glow} stopOpacity={0.55} /><stop offset="100%" stopColor={glow} stopOpacity={0} /></radialGradient></defs>
      <ellipse cx={1760} cy={820} rx={900} ry={620} fill="url(#mg)" opacity={0.5} />
      <Zs g={g} /><Clock g={g} /><Desk /><Monitor g={g} /><Coins g={g} /><Tumble g={g} />
      <Figure x={HX} y={GROUND} {...heroDesk(g)} />
    </g>
  );
};

const Backdrop: React.FC<{ id: string }> = ({ id }) => (
  <g>
    <rect width={VW} height={VH} fill={WALL} />
    <rect y={GROUND - 40} width={VW} height={VH - GROUND + 40} fill={FLOOR} />
    <rect y={GROUND - 48} width={VW} height={10} fill="#222c52" />
    <defs><radialGradient id={id}><stop offset="0%" stopColor="#3a4a8a" stopOpacity={0.5} /><stop offset="100%" stopColor="#3a4a8a" stopOpacity={0} /></radialGradient></defs>
    <ellipse cx={1280} cy={900} rx={1100} ry={700} fill={`url(#${id})`} opacity={0.6} />
  </g>
);

// shot 11: the "strategy" whiteboard
const BoardScene: React.FC<{ g: number }> = ({ g }) => {
  const draw = ramp(g, 661, 715);
  return (
    <g>
      <Backdrop id="bs" />
      <line x1={1700} y1={980} x2={1700} y2={GROUND - 20} stroke={INK} strokeWidth={14} />
      <rect x={1340} y={520} width={720} height={460} rx={10} fill="#f2efe6" stroke={INK} strokeWidth={9} />
      <path d="M1420,620 L1520,600 L1600,670 L1680,640 L1760,770 L1840,740 L1980,900" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} fill="none" stroke="#e0473a" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
      {draw > 0.97 && <path d="M1945,890 l40,12 l-10,-42" fill="none" stroke="#e0473a" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />}
      <Figure x={1180} y={GROUND} coat={HERO} s={1.5} mood="happy" glasses={g >= 653} look={[8, -2]} blink={blinkAt(g, 3)} armR={100} elbowR={-10} armL={10}
        holdR={<rect x={-4} y={-6} width={46} height={12} rx={6} fill="#e0473a" stroke={INK} strokeWidth={4} transform="rotate(-20)" />} />
    </g>
  );
};

// shot 14: ten traders, seven lose
const COATS = ["#e5674a", "#4f8ff0", "#9b6ad8", "#e0b13a", HERO, "#d25f9a", "#5fb3c9", "#8a9a3a", "#c9733d", "#6f7fd1"];
const LOSERS = new Set([0, 1, 2, 4, 5, 7, 8]);
const CrowdScene: React.FC<{ g: number }> = ({ g }) => (
  <g>
    <Backdrop id="cw" />
    {COATS.map((c, i) => {
      const t0 = 836 + i * 6;
      if (g < t0) return null;
      const x = 330 + i * 220, lose = LOSERS.has(i), lt = lose ? ramp(g, 892, 902) : 0;
      const mood: Mood = lose ? (g < 886 ? "happy" : g < 896 ? "worried" : "sad") : "happy";
      return (
        <g key={i}>
          {[0, 1, 2].map((k) => <Coin key={k} x={x + 88} y={1352 - k * 14 - lt * 320} o={1 - lt} />)}
          <Figure x={x} y={GROUND - 20} s={0.82 * Math.max(0.01, pop(g, t0, 10))} coat={c} mood={mood} sweat={lt} blink={blinkAt(g, i)} hair={i % 3 === 1 ? "bun" : "tuft"} hairColor="#6b5a4a" />
          {!lose && g > 902 && <Glint x={x} y={GROUND - 20 - 380 * 0.82} t={ramp(g, 902 + i * 2, 932 + i * 2)} />}
        </g>
      );
    })}
  </g>
);

// shot 15: the regulator makes the broker flip the board
const HearingScene: React.FC<{ g: number }> = ({ g }) => {
  const t = ramp(g, 972, 990), sx = Math.abs(Math.cos(Math.PI * t)), front = t > 0.5;
  return (
    <g>
      <Backdrop id="hs" />
      <line x1={1360} y1={850} x2={1360} y2={GROUND - 20} stroke={INK} strokeWidth={14} />
      <g transform={`translate(1360 700) scale(${sx} 1)`}>
        <rect x={-190} y={-150} width={380} height={300} rx={10} fill={front ? "#f2efe6" : "#a8845c"} stroke={INK} strokeWidth={9} />
        {front && (<g>
          <circle r={96} fill={GREEN} stroke={INK} strokeWidth={6} />
          <path d={`M 0,0 L 0,-96 A 96 96 0 1 1 ${96 * Math.sin(2 * Math.PI * 0.71 - 2 * Math.PI)},${-96 * Math.cos(2 * Math.PI * 0.71)} Z`} fill={RED} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        </g>)}
      </g>
      <Figure x={820} y={GROUND} s={1.5} coat="#7b8496" glasses hair="bun" hairColor="#b9b6b0" mood={g < 990 ? "neutral" : "sly"} blink={blinkAt(g, 5)}
        armL={lerp(10, 100, ramp(g, 941, 960))} armR={30} elbowR={-30}
        holdR={<rect x={-6} y={-70} width={50} height={68} rx={5} fill="#d9d4c4" stroke={INK} strokeWidth={5} />} />
      <Figure x={1900} y={GROUND} s={1.5} facing={-1} coat={GOLD} glasses mood={g < 968 ? "sly" : g < 990 ? "worried" : "sad"} sweat={ramp(g, 960, 985)} blink={blinkAt(g, 8)}
        armR={keys(g, [[0, 10], [960, 10], [972, 85], [990, 40], [1400, 40]])} armL={10} />
    </g>
  );
};

// ---------- shots ----------
type Cam = [number, number, number];
const shot = (from: number, to: number, c0: Cam, c1: Cam, scene: (g: number) => React.ReactNode): ShotDef => ({
  from, to, z0: 1, z1: 1,
  render: (l, p) => {
    const e = eio(p), cx = lerp(c0[0], c1[0], e), cy = lerp(c0[1], c1[1], e), z = lerp(c0[2], c1[2], e);
    return <g transform={`translate(${VW / 2} ${VH / 2}) scale(${z}) translate(${-cx} ${-cy})`}>{scene(from + l)}</g>;
  },
});
const desk = (g: number) => <DeskScene g={g} />;
const SHOTS: ShotDef[] = [
  shot(0, 81, [1280, 720, 1.0], [1280, 730, 1.07], desk),
  shot(81, 145, [1760, 380, 2.2], [1760, 380, 2.5], desk),
  shot(145, 216, [900, 940, 1.5], [940, 940, 1.6], desk),
  shot(216, 290, [1700, 900, 1.5], [1700, 900, 1.6], desk),
  shot(290, 331, [1500, 920, 2.0], [1500, 920, 2.15], desk),
  shot(331, 395, [1560, 800, 1.9], [1560, 790, 2.05], desk),
  shot(395, 445, [1150, 950, 1.9], [1150, 950, 2.0], desk),
  shot(445, 521, [1760, 730, 2.6], [1760, 730, 2.8], desk),
  shot(521, 582, [1760, 740, 2.4], [1760, 735, 2.8], desk),
  shot(582, 643, [1800, 880, 1.7], [1800, 880, 1.8], desk),
  shot(643, 719, [1450, 800, 1.25], [1450, 800, 1.35], (g) => <BoardScene g={g} />),
  shot(719, 796, [1560, 820, 1.7], [1560, 820, 1.85], desk),
  shot(796, 836, [1560, 985, 1.6], [1560, 985, 1.7], desk),
  shot(836, 941, [1280, 900, 1.0], [1280, 900, 1.08], (g) => <CrowdScene g={g} />),
  shot(941, 1030, [1280, 880, 1.2], [1280, 880, 1.3], (g) => <HearingScene g={g} />),
  shot(1030, 1096, [1080, 870, 3.0], [1080, 870, 3.15], desk),
  shot(1096, FILM_FRAMES + 1, [1080, 870, 3.15], [1080, 880, 3.5], desk),
];

export const ForexRoast1Film: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: FLOOR }}>
      <Shots f={f} shots={SHOTS} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)" }} />
      <Captions f={f} words={WORDS} chunks={CHUNKS} />
      <Soundtrack total={FILM_FRAMES} voice={staticFile("projects/forex-roast-1/narration.mp3")} voiceEnd={VOICE_END} amb="amb_night" ambVol={0.35} sfx={SFX} />
    </AbsoluteFill>
  );
};
