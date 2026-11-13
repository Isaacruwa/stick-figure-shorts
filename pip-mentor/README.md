# pip.mentor films

Stick-figure story films drawn in code (Remotion), narrated with the free Microsoft voice (edge-tts).
Forked from the stick-figure-shorts skill; story, characters and look here are original.

- `src/projects/<slug>/` : `script.txt` (narration), `Film.tsx` (the picture), `words.ts` (word timings)
- `tools/make_audio.py <slug>` : narration + timings. `tools/make_sfx.sh` : free synthesised sound effects
- Actions → **Render film** → pick the slug. The MP4 lands in `videos/` for review. Nothing is posted until approved.
