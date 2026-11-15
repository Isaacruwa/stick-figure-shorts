"""Scaffold a new dialogue episode from an existing one.
usage: python3 tools/new_episode.py <new-slug> <episode-number> [--from pipi-ep4-revenge-trade]
Copies kit.tsx, characters.tsx, Film.tsx, index.tsx, entry.tsx, renames the slug / composition id and the on-screen EP stamp,
and writes a dialogue.txt template. Then: edit dialogue.txt, run tools/make_dialogue.py <slug>, adapt Film.tsx (moods, props, PLAN, SFX), push, run the render workflow.
"""
import argparse, os, shutil
ap = argparse.ArgumentParser(); ap.add_argument("slug"); ap.add_argument("n"); ap.add_argument("--from", dest="src", default="pipi-ep4-revenge-trade")
a = ap.parse_args()
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src, dst = f"{root}/src/projects/{a.src}", f"{root}/src/projects/{a.slug}"
os.makedirs(dst, exist_ok=True); os.makedirs(f"{root}/public/projects/{a.slug}", exist_ok=True)
for f in ["kit.tsx", "characters.tsx", "Film.tsx", "index.tsx", "entry.tsx"]:
    t = open(f"{src}/{f}").read().replace(a.src, a.slug)
    import re
    t = re.sub(r">EP \d+<", f">EP {a.n}<", t)
    open(f"{dst}/{f}", "w").write(t)
if not os.path.exists(f"{dst}/dialogue.txt"):
    open(f"{dst}/dialogue.txt", "w").write("# WHO|text|(pause=seconds)  WHO = PIPI, GURU, GRANDMA, DEVIL, ANGEL\nPIPI|First line is the hook.\n")
print("scaffolded", dst)
