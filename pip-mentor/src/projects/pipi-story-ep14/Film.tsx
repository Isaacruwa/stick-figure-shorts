import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { CAPTION_FONT, INK, Soundtrack, VH, VW } from "./kit";
import { Pipi } from "./characters";

// pip.mentor Instagram STORY CARD (one photo, 9:16). Copy this folder for each new episode: change EP, the two title lines and the pose.
// Layout keeps everything inside Instagram's story safe zone (top ~330 px and bottom ~330 px of the 2560 canvas stay clear of important text).
// A still frame (t = 2 s) is extracted from the rendered mp4 and posted as the story photo.
export const FILM_FRAMES = 120;
const EP = "14", LINE1 = "PIPI HAS LOST", LINE2 = "EVERYTHING!", RED = "#d9283b";

const Phone: React.FC = () => (
  <g transform="scale(0.7) rotate(6)">
    <rect x={-82} y={-300} width={164} height={290} rx={22} fill="#15192b" stroke={INK} strokeWidth={6} />
    <rect x={-70} y={-282} width={140} height={254} rx={12} fill="#10162e" />
    <text x={0} y={-250} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={20} fill="#9fb3d9">BALANCE</text>
    <text x={0} y={-204} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={46} fill={RED}>$0.00</text>
    {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={-52 + i * 24} y={-150 + i * 20} width={14} height={34} rx={3} fill={RED} />)}
  </g>
);
const txt = (fs: number, color: string, extra: React.CSSProperties = {}): React.CSSProperties => ({
  position: "absolute", left: 0, right: 0, textAlign: "center", fontFamily: CAPTION_FONT, fontWeight: 800, fontSize: fs, lineHeight: 1, color,
  WebkitTextStroke: "14px #0a0d1a", paintOrder: "stroke fill", textTransform: "uppercase", ...extra,
});

export const Film: React.FC = () => {
  const f = useCurrentFrame();
  const bob = Math.sin(f / 14) * 3;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 38%, #27357d 0%, #0e1329 72%)" }}>
      <svg width={VW} height={VH} viewBox={`0 0 ${VW} ${VH}`} style={{ position: "absolute", left: 0, top: 0 }}>
        <ellipse cx={470} cy={1968} rx={270} ry={34} fill="#000" opacity={0.35} />
        <Pipi x={470} y={1960} s={2.5} facing={1} mood="sad" talk={0} blink={1} look={[5, 6]} bob={bob} headTilt={4} sweat={0.4} armR={40} elbowR={60} armL={12} holdR={<Phone />} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 390, textAlign: "center" }}>
        <span style={{ background: "#ffd400", color: "#0a0d1a", fontFamily: CAPTION_FONT, fontWeight: 800, fontSize: 52, padding: "12px 44px", borderRadius: 60, border: "8px solid #0a0d1a" }}>NEW EPISODE</span>
      </div>
      <div style={txt(104, "#ffffff", { top: 560 })}>{LINE1}</div>
      <div style={txt(104, "#ff7a7a", { top: 685 })}>{LINE2}</div>
      <div style={{ ...txt(200, "#ffd400", { top: 1440 }), left: 820, right: "auto", width: 560, transform: "rotate(-7deg)", WebkitTextStroke: "16px #0a0d1a" }}>EP</div>
      <div style={{ ...txt(300, "#ffd400", { top: 1640 }), left: 820, right: "auto", width: 560, transform: "rotate(-7deg)", WebkitTextStroke: "18px #0a0d1a" }}>{EP}</div>
      <div style={{ position: "absolute", left: 110, width: 1220, top: 2010, height: 230, borderRadius: 50, background: "#ffd400", border: "10px solid #0a0d1a", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: CAPTION_FONT, fontWeight: 800, fontSize: 68, lineHeight: 1.15, color: "#0a0d1a", textTransform: "uppercase" }}>
        <div>WATCH THE FULL EPISODE</div><div>ON OUR LATEST POST</div>
      </div>
      <Soundtrack total={FILM_FRAMES} voice={staticFile("projects/pipi-story-ep14/narration.mp3")} voiceAt={4} voiceEnd={100} music="music_pad" musicLen={1800} amb="amb_night" ambVol={0.2} sfx={[]} />
    </AbsoluteFill>
  );
};
