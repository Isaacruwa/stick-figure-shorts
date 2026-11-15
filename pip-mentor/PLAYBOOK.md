# pip.mentor / Pipi series - playbook (handoff for any new chat)

Read this first, then `EPISODES.md` (what has been made), `CHARACTERS.md` (cast) and the newest folder in `src/projects/` (the code to copy).

## 1. What we make
A daily forex-flavoured cartoon series starring **Pipi** (broke trader with a mint hoodie), drawn entirely in code (SVG + React in Remotion), voiced with free Microsoft voices (edge-tts). One short per day on **YouTube Shorts** and **Instagram Reels** (account pip.mentor). Every 10 episodes get combined into one long 16:9 video. Audience: forex traders. Goal: people watch episode after episode, laugh or feel something, and follow.

## 2. Standing rules from the owner (do not break these)
1. **Hook in the first 2 seconds.** Open on the most extreme, funny or striking image plus a short line (white/red flash, cash rain, a disguised guru...). No slow set-up.
2. **No narrator** (from ep 2). It is a cartoon scene: the characters talk to each other, each with their own voice, like a movie or series scene. Mouths move while they speak.
3. **Never say "Episode N" out loud.** Only the on-screen stamp "EP N" slams in on the last line. The last spoken line is the punchline or lesson.
4. **9:16 (1440x2560 canvas, render at 0.75 = 1080x1920)** is the default. 16:9 only for the compilations.
5. **Post public, always** (never private or unlisted), to **both** YouTube and Instagram, straight after rendering.
6. **One post per day. Never post two episodes on the same day.** Check the schedule with the owner first. (Mon 2026-11-16 skipped; ep 5 planned Tue 2026-11-17.)
7. **No "not financial advice" disclaimers.** The audience are already traders.
8. Stories should be funny, warm or touching and give one real trading lesson (never bet the rent, no proof no pay, close the chart after a loss...). Characters recur; keep money and gag continuity (see EPISODES.md).
9. **Keep the rendered videos** (they may be reposted to other apps later, e.g. TikTok under the same username) and **update `EPISODES.md` after every episode**.
10. Thumbnails: skipped for now (YouTube custom thumbnails need the channel phone-verified at youtube.com/verify). A 1280x720 thumbnail was made for forex-roast-1 (`videos/forex-roast-1_thumb.jpg`).
11. Every 10 episodes: one long 16:9 YouTube video combining them (title cards between episodes). Nothing to do until ep 10.

## 3. Accounts and connections (Composio, session id "safe" in meta calls)
- GitHub: account `github_chord-jeerer` (user Isaacruwa). Repo `Isaacruwa/stick-figure-shorts` (fork of deenukhan/stick-figure-shorts, public).
- YouTube: account `youtube_ole-chance`, channel **PipMentor Forex Coach** (channel id UCJAFsCpvDnYKnT04KA_teVg).
- Instagram: account `instagram_suable-uncase` (alias pipmentor-reauth2), username pip.mentor, **ig_user_id 30262234916699320**. The older `instagram_serum-sequin` token expired (401 "session invalidated"). If Instagram returns 401, run COMPOSIO_SEARCH_TOOLS for instagram, read `toolkit_connection_statuses`, and use the newest ACTIVE account or ask the owner to reconnect.
- Voices need no keys (edge-tts, free). ElevenLabs is NOT used.

## 4. Environment facts and gotchas (learned the hard way)
- The Composio bash/workbench sandbox has Node but **no npm**, 1 CPU, ~1 GB RAM and **resets between calls** (files vanish). So generate audio + write all files + push to GitHub **in the same call**. Use the workbench: `run_composio_tool("GITHUB_CREATE_OR_UPDATE_FILE_CONTENTS", {owner, repo, path, message, content=base64})`; updating an existing file needs its `sha` from `GITHUB_GET_REPOSITORY_CONTENT`.
- **Rendering happens in GitHub Actions** (`.github/workflows/render.yml`, manual trigger with input `slug`): installs deps, typechecks (`tsc`), makes sound effects, renders stills + video at scale 0.75, normalises loudness, saves `videos/<slug>_v<run#>.mp4`, `_sheet.jpg`, `_stills.jpg` back to the repo (also uploaded as an artifact). Takes ~4-5 min. Start it with `GITHUB_CREATE_A_WORKFLOW_DISPATCH_EVENT` (`workflow_id: "render.yml"`, `ref: "main"`, `inputs` as a JSON **string** like `"{\"slug\": \"pipi-ep5-...\"}"`). Poll with `GITHUB_LIST_WORKFLOW_RUNS_FOR_A_REPOSITORY` + `GITHUB_LIST_JOBS_FOR_A_WORKFLOW_RUN`. If a step fails, the typecheck output explains it.
- You **cannot see frames** of the video. QA = it typechecks + renders, and the owner watches. Say so honestly and name the riskiest shots.
- The owner could not open GitHub video links; they review on YouTube/Instagram after posting.
- YouTube upload: in the workbench `curl` the mp4 from `https://raw.githubusercontent.com/Isaacruwa/stick-figure-shorts/main/videos/<file>.mp4`, `upload_local_file(path)` returns an `s3key`, then `YOUTUBE_MULTIPART_UPLOAD_VIDEO` (`account: youtube_ole-chance`, `privacyStatus: "public"`, `categoryId: "24"`, title ending `#Shorts`, tags, description). To change privacy later: `YOUTUBE_UPDATE_VIDEO` (`video_id`, `privacy_status`).
- Instagram: `INSTAGRAM_POST_IG_USER_MEDIA` (`video_url` = the raw GitHub URL, `media_type: "REELS"`, `share_to_feed: true`, caption with plain `#hashtags` works) then `INSTAGRAM_POST_IG_USER_MEDIA_PUBLISH` (`creation_id`, `ig_user_id`, `max_wait_seconds: 240`). Captions cannot be edited after posting, so get them right. Verify with `INSTAGRAM_GET_IG_MEDIA`.
- Fonts: captions/in-scene text use `CAPTION_FONT` (Inter 800, loaded by kit.tsx). Do not use emoji inside SVG text.

## 5. Repo layout (`pip-mentor/` is our work; the rest is the upstream skill)
- `pip-mentor/EPISODES.md` episode log, `CHARACTERS.md` cast, `PLAYBOOK.md` this file.
- `pip-mentor/src/projects/<slug>/` one folder per film: `dialogue.txt` (or `script.txt` for narrated ones), `lines.ts` (generated timings), `Film.tsx`, `characters.tsx`, `kit.tsx`, `index.tsx`, `entry.tsx`, and `public/projects/<slug>/narration.mp3`.
- `pip-mentor/tools/make_dialogue.py` (multi-voice audio + exact line timings), `make_audio.py` (single narrator + whisper word timings, used for eps before 2), `make_sfx.sh` (free synthesised sound effects and `music_pad`, `amb_night`), `new_episode.py` (scaffold).
- Latest template to copy: **`src/projects/pipi-ep4-revenge-trade/`** (dialogue, devil/angel on shoulders). `pipi-ep3-no-proof` has the disguised guru and a pulled-off prop; `pipi-ep2-guru-secret` the simplest three-character scene; `pipi-last-ten` (narrated, many sets: room, street, phone, kitchen, desk).

## 6. Making an episode (the routine)
1. Pick/ask for the premise (see ideas in EPISODES.md). Write `dialogue.txt` lines as `WHO|text|pause=seconds` (WHO: PIPI, GURU, GRANDMA, DEVIL, ANGEL; add voices in `make_dialogue.py` VOICES). Aim for 35-45 s (past episodes ran 50-56 s: trim). ~12-14 short lines, punchlines, a callback, one lesson, last line = punchline.
2. `python3 tools/new_episode.py <slug> <N>` scaffolds the folder from the latest episode (or copy by hand). In the workbench: clone repo, `pip install edge-tts imageio-ffmpeg`, run `python3 tools/make_dialogue.py <slug>`; it writes `narration.mp3` and `lines.ts` (LEAD, LINES with start/end frames, VOICE_END).
3. Adapt `Film.tsx`: everything keys off **line indexes** (`at(i, offset)`), never absolute frames, so re-timing the audio never breaks it. Edit: moods tables (one mood per line per character), props, staging, the `PLAN` array (camera per line: speaker close-up, optional split to a reaction/wide shot), SFX list, and `Stamp` text (`EP N`).
4. Push all files (same call), dispatch the render, poll, then post (section 4), then update `EPISODES.md`, memory, and tell the owner.
5. Report honestly: what it is, what's risky to check, links.

## 7. How the Film.tsx pattern works
- World = 1440x2560 SVG. Characters stand on `GROUND = 2240`, scale `s = 2.1` (tiny shoulder characters 0.5). `Figure` (from the upstream kit) draws one stick figure: head, face (`mood`, `look`, `blink`, `sweat`), `armR/armL` angles (0 down, positive forward, ~90 horizontal, 120+ raised), `holdR` prop in the front hand, `walk`, `bob`, `headTilt`, `facing` (1 right, -1 left; the whole figure mirrors) and our patched **`talk`** (0..1 mouth openness, from `talking(g, who)`).
- Camera = `mk(from, to, camStart, camEnd, shakes)`: `translate(VW/2, VH/2) scale(z) translate(-cx, -cy)`; cam = [cx, cy, z]. Close-up ~[x, 1580, 1.9]; wide ~[760, 1700, 1.15]; shoulder characters ~z 4.4. Backgrounds must extend past the world edges (x -800..2240, y -1200..3600) because close-ups can show outside 0..1440.
- One shot per spoken line starting 3 frames before the line; `PLAN[i].split` cuts to a second shot (reaction or wide) part-way. Hook shot 0 gets a flash + shake.
- Subtitles are a `div` at top 1690 (inside the Reels safe zone), 92 px uppercase, coloured per speaker, 4-word chunks timed by character count. No karaoke captions.
- Sound: `Soundtrack` plays `narration.mp3` at `voiceAt = LEAD`, `music_pad`, `amb_night` and an `SFX` list of `[frame, name, volume]` (names: sfx_pop, click, coin, ding, sad, whoosh, buzz, thump, thud, tap, sparkle). Library is synthesised by `make_sfx.sh`.
- Staging reminders: figure arm length 120*s; a hand at armR=a is at x = X + (40 + sin(a)*120)*s (mirrored for facing -1), y = GROUND + (-272 + cos(a)*120)*s. Face geometry (figure-local): eyes y=-350, mouth y=-320, head top -414. Overlays (hats, mustache, horns, halo) are drawn in figure-local coordinates in `characters.tsx`.

## 8. Cast and voices
See `CHARACTERS.md`. Voices: Pipi en-US-EricNeural (+6%, +10Hz), Guru en-US-ChristopherNeural (-2%, -6Hz), Grandma en-GB-SoniaNeural (-6%, -4Hz), Devil en-US-RogerNeural (-6Hz), Angel en-US-JennyNeural (+4%, +8Hz), old narrator en-US-GuyNeural. `make_dialogue.py` tries fallbacks if a voice fails (en-US-AndrewNeural failed once).

## 9. Posting templates
- YouTube: title = hook line + emoji + ` #Shorts` (<=100 chars). Description: 2-3 hook lines, the lesson in one sentence, comment prompt, "Follow so you don't miss the next one.", hashtags (`#shorts #forex #forextrading #pipi #pipimentor` + topic). Tags ~12. Category 24. Public.
- Instagram: same hook, the lesson, a question, "Follow @pip.mentor for the next one", hashtags. `share_to_feed: true`.

## 10. Status (update me)
Episodes 1-4 posted (YouTube + Instagram; forex-roast-1 YouTube only). Ep 2 and 3 passed 1k views on YouTube. Next: ep 5 on Tue 2026-11-17 (idea: Pipi's first real win, or the guru's fake funded-account challenge). Pipi's money is $8 after ep 4. Open: thumbnail needs channel verification; TikTok not set up; compilation at ep 10.
