"""Prepare a new talking-head video for the MortgageReel template.

    python scripts/prep-video.py "<path to the recorded video>" <slug>

1. public/videos/<slug>/source.mp4: a short-GOP proxy (a keyframe every 15
   frames) so every OffthreadVideo seek is cheap; phone originals often have one
   keyframe every 8 s, which times out parallel renders. Checked frame-for-frame
   against the original, so transcript timestamps apply to both.
2. public/videos/<slug>/words.json: word-level faster-whisper large-v3
   transcript (Vietnamese) of the proxy. Slow on CPU; progress is printed.
3. A sentence table with each sentence's pace (words/s), flagging slow and fast
   delivery, to help write edit.json.
4. public/videos/<slug>/edit.json: a skeleton (title from the file name), only
   if none exists yet.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SLOW_WPS = 3.4
FAST_WPS = 5.4
# A table row ends at a full stop, a pause, or this many words.
ROW_PAUSE_MS = 400
ROW_MAX_WORDS = 20


def run(cmd: list[str], what: str) -> str:
    """Run a command; on failure print its output and exit non-zero."""
    try:
        result = subprocess.run(cmd, check=True, text=True, encoding="utf-8",
                                capture_output=True)
    except FileNotFoundError as err:
        raise SystemExit(f"{what}: {cmd[0]} not found ({err}).") from err
    except subprocess.CalledProcessError as err:
        print(err.stderr or err.stdout or "", file=sys.stderr)
        raise SystemExit(f"{what} failed (exit {err.returncode}).") from err
    return result.stdout


def frame_count(path: Path) -> int:
    """Video frame count from the container, or by counting packets."""
    out = run(["ffprobe", "-v", "error", "-select_streams", "v:0",
               "-show_entries", "stream=nb_frames", "-of", "default=nw=1:nk=1",
               str(path)], f"ffprobe {path.name}").strip()
    if out.isdigit():
        return int(out)
    out = run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-count_packets",
               "-show_entries", "stream=nb_read_packets", "-of", "default=nw=1:nk=1",
               str(path)], f"ffprobe {path.name}").strip()
    return int(out)


def make_proxy(src: Path, proxy: Path) -> None:
    print(f"Encoding proxy -> {proxy} ...", flush=True)
    run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", str(src),
         "-c:v", "libx264", "-crf", "16", "-preset", "medium",
         "-g", "15", "-keyint_min", "15", "-sc_threshold", "0",
         "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
         "-movflags", "+faststart", str(proxy)], "proxy encode")
    original, copy = frame_count(src), frame_count(proxy)
    if original != copy:
        raise SystemExit(
            f"Frame-count mismatch: original {original}, proxy {copy}. The proxy "
            f"dropped or duplicated frames (variable frame rate?), so transcript "
            f"timestamps would drift. Not continuing.")
    print(f"Proxy OK: {copy} frames, identical to the original.", flush=True)


def transcribe(proxy: Path) -> list[dict]:
    try:
        from faster_whisper import WhisperModel
    except ImportError as err:
        raise SystemExit("faster-whisper is not installed: pip install faster-whisper") from err
    print("Loading faster-whisper large-v3 (CPU, int8) ...", flush=True)
    model = WhisperModel("large-v3", device="cpu", compute_type="int8", cpu_threads=16)
    segments, info = model.transcribe(str(proxy), language="vi",
                                      word_timestamps=True, beam_size=5)
    started = time.time()
    words: list[dict] = []
    for seg in segments:
        for w in seg.words or []:
            words.append({
                "text": w.word,  # keeps Whisper's leading space (token merge relies on it)
                "startMs": round(w.start * 1000),
                "endMs": round(w.end * 1000),
                "timestampMs": None,
                "confidence": round(w.probability, 3),
            })
        pct = 100 * seg.end / max(info.duration, 1)
        print(f"  {pct:5.1f}%  [{seg.start:7.2f}-{seg.end:7.2f}] "
              f"({time.time() - started:.0f}s elapsed) {seg.text.strip()}", flush=True)
    if not words:
        raise SystemExit("Transcription produced no words.")
    return words


def sentence_table(words: list[dict]) -> None:
    """Print start/end/pace per sentence, merging split tokens like '4' '.1'."""
    merged: list[dict] = []
    for w in words:
        if merged and not w["text"].startswith(" "):
            merged[-1] = {**merged[-1], "text": merged[-1]["text"] + w["text"],
                          "endMs": w["endMs"]}
        else:
            merged.append(dict(w))
    print(f"\n{'start':>8} {'end':>8} {'wps':>5} FLAG  text")
    sentence: list[dict] = []
    for i, w in enumerate(merged):
        sentence.append(w)
        nxt = merged[i + 1] if i + 1 < len(merged) else None
        if nxt is None or re.search(r"[.?!]$", w["text"].strip()) \
                or nxt["startMs"] - w["endMs"] > ROW_PAUSE_MS \
                or len(sentence) >= ROW_MAX_WORDS:
            start, end = sentence[0]["startMs"], sentence[-1]["endMs"]
            wps = len(sentence) / max((end - start) / 1000, 0.001)
            flag = "slow" if wps < SLOW_WPS else "fast" if wps > FAST_WPS else ""
            text = "".join(s["text"] for s in sentence).strip()
            print(f"{start:8d} {end:8d} {wps:5.2f} {flag:4}  {text}")
            sentence = []


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("video", type=Path, help="the recorded video file")
    parser.add_argument("slug", help="short folder name, e.g. lmi-explained")
    args = parser.parse_args()
    src: Path = args.video.resolve()
    slug: str = args.slug
    if not src.is_file():
        raise SystemExit(f"Video not found: {src}")
    if not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", slug):
        raise SystemExit(f'Slug "{slug}" must be lowercase letters, digits and hyphens.')

    folder = ROOT / "public" / "videos" / slug
    folder.mkdir(parents=True, exist_ok=True)
    proxy = folder / "source.mp4"
    make_proxy(src, proxy)

    words = transcribe(proxy)
    words_path = folder / "words.json"
    words_path.write_text(json.dumps(words, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"Wrote {words_path} ({len(words)} tokens)")
    sentence_table(words)

    edit_path = folder / "edit.json"
    if edit_path.exists():
        print(f"\n{edit_path} already exists; left unchanged.")
    else:
        skeleton = {
            "title": src.stem,
            "pacing": {"mode": "auto"},
            "chapters": [],
            "stats": [],
            "cues": [],
            "compliance": {"illustrativeNumbers": True},
        }
        edit_path.write_text(json.dumps(skeleton, ensure_ascii=False, indent=2) + "\n",
                             encoding="utf-8")
        print(f"\nWrote skeleton {edit_path}; fill in the edit, then run "
              f"python scripts/render-video.py {slug}")


if __name__ == "__main__":
    main()
