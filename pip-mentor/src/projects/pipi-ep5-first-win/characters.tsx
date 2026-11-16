import React from "react";
import { Figure, FigureProps, INK } from "./kit";

// pip.mentor cast. Same code = same look in every film.
// PIPI: white round head, one tuft of hair, MINT hoodie, white sneakers. Poor = patch on the hoodie (+ empty pockets when asked). Rich = gold chain + round glasses.
export const MINT = "#2fbf8f";
export const GOLD = "#f0b84a";
type P = Omit<FigureProps, "coat">;

export const Pipi: React.FC<P & { rich?: boolean; pockets?: number }> = ({ rich, pockets = 0, ...p }) => {
  const s = p.s ?? 1, fc = p.facing ?? 1;
  return (
    <g>
      <Figure {...p} coat={MINT} hair="tuft" glasses={rich ? true : p.glasses} />
      <g transform={`translate(${p.x} ${p.y}) scale(${s * fc} ${s})`}>
        {!rich && (
          <g transform="rotate(-6 -22 -212)">
            <rect x={-34} y={-228} width={26} height={24} rx={3} fill="#1f8f6a" stroke={INK} strokeWidth={3.5} />
            <path d="M-31,-225 l20,0 M-31,-207 l20,0" stroke="#d8f5e8" strokeWidth={2} strokeDasharray="4 3" />
          </g>
        )}
        {rich && (
          <g>
            <path d="M -34,-288 Q 0,-240 34,-288" fill="none" stroke={GOLD} strokeWidth={7} />
            <circle cx={0} cy={-250} r={13} fill={GOLD} stroke={INK} strokeWidth={4} />
          </g>
        )}
        {pockets > 0 && [-1, 1].map((side) => (
          <path key={side} d={`M ${side * 44},-176 L ${side * 92},-176 L ${side * 92},${-176 + 80 * pockets} Q ${side * 68},${-176 + 104 * pockets} ${side * 44},${-176 + 80 * pockets} Z`} fill="#e9e7e0" stroke={INK} strokeWidth={4} />
        ))}
      </g>
    </g>
  );
};
export const Grandma: React.FC<P> = (p) => <Figure {...p} coat="#d98aa8" hair="bun" hairColor="#c9c6c0" glasses />;
// THE GURU: gold suit, glasses, no hair. disguise = beige trench coat + fedora + fake mustache (mustache can be pulled off).
export const Guru: React.FC<P & { disguise?: boolean; mustache?: boolean }> = ({ disguise, mustache = true, ...p }) => {
  const s = p.s ?? 1, fc = p.facing ?? 1;
  return (
    <g>
      <Figure {...p} coat={disguise ? "#8b7d63" : "#d9a441"} hair="none" glasses />
      {disguise && (
        <g transform={`translate(${p.x} ${p.y}) scale(${s * fc} ${s})`}>
          <path d="M -50,-282 L -20,-248 L 0,-282 L 20,-248 L 50,-282" fill="#6f6249" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          {mustache && <path d="M -40,-329 Q -22,-340 0,-331 Q 22,-340 40,-329 Q 22,-319 0,-325 Q -22,-319 -40,-329 Z" fill="#2a1d14" stroke={INK} strokeWidth={2.5} transform="rotate(-5 0 -330)" />}
          <ellipse cx={0} cy={-410} rx={80} ry={15} fill="#4a3a2e" stroke={INK} strokeWidth={5} />
          <path d="M -48,-410 L -44,-466 Q 0,-482 44,-466 L 48,-410 Z" fill="#4a3a2e" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <rect x={-47} y={-428} width={94} height={14} fill="#d9a441" stroke={INK} strokeWidth={3} />
        </g>
      )}
    </g>
  );
};
export const RepoMan: React.FC<P> = (p) => <Figure {...p} coat="#e08a2f" hair="none" />;

// THE DEVIL: tiny red troublemaker with horns, tail and pitchfork. Sits on Pipi's shoulder.
export const Devil: React.FC<P> = (p) => {
  const s = p.s ?? 1, fc = p.facing ?? 1;
  return (
    <g>
      <g transform={`translate(${p.x} ${p.y}) scale(${s * fc} ${s})`}>
        <path d="M -26,-150 Q -92,-132 -72,-196" fill="none" stroke="#d9283b" strokeWidth={9} strokeLinecap="round" />
        <path d="M -72,-196 l -20,-4 l 8,24 z" fill="#d9283b" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      </g>
      <Figure {...p} coat="#d9283b" hair="none" />
      <g transform={`translate(${p.x} ${p.y}) scale(${s * fc} ${s})`}>
        <path d="M -44,-402 L -34,-458 L -12,-410 Z" fill="#8b1220" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        <path d="M 44,-402 L 34,-458 L 12,-410 Z" fill="#8b1220" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      </g>
    </g>
  );
};
// THE ANGEL: tiny white robe, wings and a halo. Sits on Pipi's other shoulder.
export const Angel: React.FC<P> = (p) => {
  const s = p.s ?? 1, fc = p.facing ?? 1;
  return (
    <g>
      <g transform={`translate(${p.x} ${p.y}) scale(${s * fc} ${s})`}>
        <ellipse cx={-74} cy={-290} rx={46} ry={110} transform="rotate(24 -74 -290)" fill="#fbfbf8" stroke={INK} strokeWidth={5} />
        <ellipse cx={74} cy={-290} rx={46} ry={110} transform="rotate(-24 74 -290)" fill="#fbfbf8" stroke={INK} strokeWidth={5} />
      </g>
      <Figure {...p} coat="#fbfbf8" hair="none" />
      <g transform={`translate(${p.x} ${p.y}) scale(${s * fc} ${s})`}>
        <ellipse cx={0} cy={-448} rx={48} ry={14} fill="none" stroke="#ffd400" strokeWidth={10} />
      </g>
    </g>
  );
};
