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
export const Guru: React.FC<P> = (p) => <Figure {...p} coat="#d9a441" hair="none" glasses />;
export const RepoMan: React.FC<P> = (p) => <Figure {...p} coat="#e08a2f" hair="none" />;
