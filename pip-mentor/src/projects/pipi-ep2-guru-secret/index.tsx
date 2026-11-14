import React from "react";
import { Composition, Folder } from "remotion";
import { FILM_FRAMES, Film } from "./Film";
// pip.mentor 9:16 cartoon scene. Canvas 1440x2560, render with --scale=0.75 for 1080x1920, 30 fps.
export const Root: React.FC = () => (
  <Folder name="pipi-ep2-guru-secret">
    <Composition id="pipi-ep2-guru-secret-FILM" component={Film} width={1440} height={2560} fps={30} durationInFrames={FILM_FRAMES} />
  </Folder>
);
