import React from "react";
import { Composition, Folder } from "remotion";
import { MOVIE_FRAMES, Movie } from "./Movie";
// pip.mentor long film, 16:9. Canvas 2560x1440, render with --scale=0.75 for 1920x1080, 30 fps.
export const Root: React.FC = () => (
  <Folder name="pipi-movie">
    <Composition id="pipi-movie-FILM" component={Movie} width={2560} height={1440} fps={30} durationInFrames={MOVIE_FRAMES} />
  </Folder>
);
