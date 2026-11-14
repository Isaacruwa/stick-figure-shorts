"""Narration + word timings for a pip.mentor film, with the free Microsoft voice (edge-tts) and faster-whisper.
usage: python3 tools/make_audio.py <slug> [--voice en-US-GuyNeural] [--rate -4%] [--gap 0.42]
Reads src/projects/<slug>/script.txt (one paragraph per line). Writes public/projects/<slug>/narration.mp3 (-16 LUFS),
transcript.json and src/projects/<slug>/words.ts (via ../scripts/cues.py). Needs: pip install edge-tts faster-whisper imageio-ffmpeg
"""
import re, argparse, asyncio, json, os, shutil, subprocess, sys, tempfile
import edge_tts

ap = argparse.ArgumentParser()
ap.add_argument("slug"); ap.add_argument("--voice", default="en-US-GuyNeural"); ap.add_argument("--rate", default="+4%"); ap.add_argument("--gap", type=float, default=0.3); ap.add_argument("--lead", default="15")
a = ap.parse_args()
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
proj = f"{root}/src/projects/{a.slug}"; pub = f"{root}/public/projects/{a.slug}"; os.makedirs(pub, exist_ok=True)
FF = shutil.which("ffmpeg")
if not FF:
    import imageio_ffmpeg; FF = imageio_ffmpeg.get_ffmpeg_exe()
lines = [l.strip() for l in open(f"{proj}/script.txt") if l.strip()]
tmp = tempfile.mkdtemp()

async def go():
    for i, l in enumerate(lines):
        await edge_tts.Communicate(l, a.voice, rate=a.rate).save(f"{tmp}/l{i}.mp3")
asyncio.run(go())
ins = sum([["-i", f"{tmp}/l{i}.mp3"] for i in range(len(lines))], [])
chain = ";".join(f"[{i}:a]aresample=48000,aformat=channel_layouts=mono" + (f",apad=pad_dur={a.gap}" if i < len(lines) - 1 else "") + f"[a{i}]" for i in range(len(lines)))
cat = "".join(f"[a{i}]" for i in range(len(lines))) + f"concat=n={len(lines)}:v=0:a=1,loudnorm=I=-16:TP=-1.5:LRA=11[o]"
subprocess.run([FF, "-v", "error", "-y", *ins, "-filter_complex", chain + ";" + cat, "-map", "[o]", "-ar", "48000", f"{pub}/narration.mp3"], check=True)

from faster_whisper import WhisperModel
m = WhisperModel("base.en", device="cpu", compute_type="int8")
import numpy as np
raw = subprocess.run([FF, "-v", "error", "-i", f"{pub}/narration.mp3", "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True, check=True).stdout
audio = np.frombuffer(raw, dtype=np.float32)
segs, _ = m.transcribe(audio, word_timestamps=True, vad_filter=False, language="en")
res = []
for s in segs:
    res.append({"s": round(s.start, 2), "e": round(s.end, 2), "t": s.text, "words": [{"w": w.word, "s": round(w.start, 2), "e": round(w.end, 2)} for w in (s.words or [])]})
json.dump(res, open(f"{proj}/transcript.json", "w"), indent=1)
subprocess.run([sys.executable, f"{root}/../scripts/cues.py", f"{proj}/transcript.json", f"{proj}/words.ts", "--lead", a.lead, "--max", "4"], check=True)

# whisper writes "forex" as "4x" and spells numbers as digits: put the script spelling back
w = open(f"{proj}/words.ts").read()
w = re.sub(r'"4[xX]([,.?!]?)"', r'"forex\1"', w)
w = w.replace('"3"', '"three"')
open(f"{proj}/words.ts", "w").write(w)
