#!/bin/bash
# Free, synthesised sound effects + a night ambience bed (no downloads, no credits). usage: make_sfx.sh [ffmpeg]
FF="${1:-$(command -v ffmpeg || python3 -c 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())')}"
O="$(dirname "$0")/../public/projects/stick-sound-library"; mkdir -p "$O"
g() { "$FF" -v error -y -f lavfi -i "$2" ${3:+-af "$3"} -ar 44100 -ac 1 -b:a 128k "$O/$1.mp3"; }
g sfx_pop    "aevalsrc='0.8*sin(2*PI*(380+900*t)*t)*exp(-28*t)':d=0.2"
g sfx_click  "aevalsrc='0.7*sin(2*PI*2200*t)*exp(-90*t)+0.3*sin(2*PI*900*t)*exp(-60*t)':d=0.1"
g sfx_coin   "aevalsrc='0.45*sin(2*PI*1319*t)*exp(-9*t)+0.4*sin(2*PI*1976*t)*exp(-7*t)':d=0.5"
g sfx_ding   "aevalsrc='0.6*sin(2*PI*880*t)*exp(-4*t)+0.2*sin(2*PI*1760*t)*exp(-6*t)':d=1.0"
g sfx_sad    "aevalsrc='0.45*sin(2*PI*(420*t-120*t*t))*(1-t/0.8)':d=0.8"
g sfx_whoosh "anoisesrc=d=0.5:c=pink:a=0.6" "highpass=f=500,lowpass=f=4000,afade=t=in:d=0.18,afade=t=out:st=0.2:d=0.3"
g amb_night  "anoisesrc=d=60:c=brown:a=0.5" "lowpass=f=260,volume=0.5"
ls "$O"
