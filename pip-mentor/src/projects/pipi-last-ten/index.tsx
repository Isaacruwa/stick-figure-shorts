import React from "react";
import { Composition, Folder } from "remotion";
import { FILM_FRAMES, PipiLastTenFilm } from "./Film";
// pip.mentor 9:16 film "pipi-last-ten". Canvas 1440x2560, render with --scale=0.75 for 1080x1920, 30 fps.
export const PipiLastTenRoot: React.FC = () => (
  <Folder name="pipi-last-ten">
    <Composition id="pipi-last-ten-FILM" component={PipiLastTenFilm} width={1440} height={2560} fps={30} durationInFrames={FILM_FRAMES} />
  </Folder>
);
