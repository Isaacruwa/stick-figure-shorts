import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Episode169 as E1, EP169_FRAMES as N1 } from "../pipi-last-ten/Film169";
import { Episode169 as E2, EP169_FRAMES as N2 } from "../pipi-ep2-guru-secret/Film169";
import { Episode169 as E3, EP169_FRAMES as N3 } from "../pipi-ep3-no-proof/Film169";
import { Episode169 as E4, EP169_FRAMES as N4 } from "../pipi-ep4-revenge-trade/Film169";
import { Episode169 as E5, EP169_FRAMES as N5 } from "../pipi-ep5-first-win/Film169";
import { Episode169 as E6, EP169_FRAMES as N6 } from "../pipi-ep6-fomo-roast/Film169";
import { Episode169 as E7, EP169_FRAMES as N7 } from "../pipi-ep7-ransom-note/Film169";
import { Episode169 as E8, EP169_FRAMES as N8 } from "../pipi-ep8-vip-bonus/Film169";
import { Episode169 as E9, EP169_FRAMES as N9 } from "../pipi-ep9-leverage/Film169";
import { Episode169 as E10, EP169_FRAMES as N10 } from "../pipi-ep10-knock-knock/Film169";

// pip.mentor - the long film: episodes 1-10 back to back as ONE continuous movie in 16:9 (2560x1440). No title cards. Only the on-screen EP N stamps say which episode it is.
const EPS: [React.FC, number][] = [[E1, N1], [E2, N2], [E3, N3], [E4, N4], [E5, N5], [E6, N6], [E7, N7], [E8, N8], [E9, N9], [E10, N10]];
export const MOVIE_FRAMES = EPS.reduce((s, [, n]) => s + n, 0);
export const Movie: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{ background: "#0e1329" }}>
      {EPS.map(([C, n], i) => {
        const el = (<Sequence key={i} from={from} durationInFrames={n}><C /></Sequence>);
        from += n;
        return el;
      })}
    </AbsoluteFill>
  );
};
