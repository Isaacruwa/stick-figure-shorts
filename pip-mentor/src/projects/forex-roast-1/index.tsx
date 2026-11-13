import React from "react";
import { Composition, Folder } from "remotion";
import { FILM_FRAMES, ForexRoast1Film } from "./Film";
// pip.mentor film "forex-roast-1" (16:9). Canvas 2560x1440, render with --scale=0.75 for 1920x1080, 30 fps.
export const ForexRoast1Root: React.FC = () => (
  <Folder name="forex-roast-1">
    <Composition id="forex-roast-1-FILM" component={ForexRoast1Film} width={2560} height={1440} fps={30} durationInFrames={FILM_FRAMES} />
  </Folder>
);
