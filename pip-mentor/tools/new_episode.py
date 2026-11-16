"""Scaffold a new dialogue episode from an existing one, with the PERFECT LOOP built in.
usage: python3 tools/new_episode.py <new-slug> <episode-number> [--from pipi-ep4-revenge-trade]
Copies kit.tsx, characters.tsx, Film.tsx, index.tsx, entry.tsx, renames the slug / composition id and the on-screen EP stamp,
replaces the Film root with the loop version (the last frames dissolve into frame 0, so the last frame == the first frame),
and writes a dialogue.txt template. Then: edit dialogue.txt, run tools/make_dialogue.py <slug>, adapt Film.tsx (moods, props, PLAN, SFX), push, run the render workflow.
"""
import argparse, os, re
ap = argparse.ArgumentParser(); ap.add_argument("slug"); ap.add_argument("n"); ap.add_argument("--from", dest="src", default="pipi-ep4-revenge-trade")
a = ap.parse_args()
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src, dst = f"{root}/src/projects/{a.src}", f"{root}/src/projects/{a.slug}"
os.makedirs(dst, exist_ok=True); os.makedirs(f"{root}/public/projects/{a.slug}", exist_ok=True)

# Film root with the perfect loop: <Frame f> draws one frame (scene + flash + vignette + subtitles + stamp); the real timeline is Frame(f), and during the last
# 14 frames Frame(0) is cross-faded on top, so the final frame is identical to the first frame (the hook image). Audio plays under the real timeline only.
LOOP_ROOT = r'''const Frame: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: "#0e1329" }}>
    <Shots f={f} shots={SHOTS} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)" }} />
    <AbsoluteFill style={{ background: "#ff2d3d", opacity: 0.5 * (1 - ramp(f, 0, 10)) }} />
    <AbsoluteFill style={{ background: "#fff", opacity: 0.8 * (1 - ramp(f, 0, 5)) }} />
    <Subs f={f} />
    <Stamp f={f} />
  </AbsoluteFill>
);

export const Film: React.FC = () => {
  const f = useCurrentFrame();
  const back = ramp(f, FILM_FRAMES - 16, FILM_FRAMES - 2); // 0 -> 1: last frame == first frame
  return (
    <AbsoluteFill style={{ background: "#0e1329" }}>
      <Frame f={f} />
      {back > 0 && <AbsoluteFill style={{ opacity: back }}><Frame f={0} /></AbsoluteFill>}
      <Soundtrack total={FILM_FRAMES} voice={staticFile("projects/__SLUG__/narration.mp3")} voiceAt={LEAD} voiceEnd={VOICE_END} music="music_pad" musicLen={1800} amb="amb_night" ambVol={0.2} sfx={SFX} />
    </AbsoluteFill>
  );
};
'''
for f in ["kit.tsx", "characters.tsx", "Film.tsx", "index.tsx", "entry.tsx"]:
    t = open(f"{src}/{f}").read().replace(a.src, a.slug)
    t = re.sub(r">EP \d+<", f">EP {a.n}<", t)
    if f == "Film.tsx" and "const Frame:" not in t:
        k = t.index("export const Film: React.FC = () => {")
        t = t[:k] + LOOP_ROOT.replace("__SLUG__", a.slug)
    open(f"{dst}/{f}", "w").write(t)
if not os.path.exists(f"{dst}/dialogue.txt"):
    open(f"{dst}/dialogue.txt", "w").write("# WHO|text|(pause=seconds)  WHO = PIPI, GURU, GRANDMA, DEVIL, ANGEL\nPIPI|First line is the hook.\\n")
print("scaffolded", dst)
