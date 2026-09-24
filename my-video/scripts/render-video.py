"""Render a MortgageReel video end to end.

    python scripts/render-video.py <slug>

Writes to out/videos/<slug>/: <slug>.mp4 (1080x1920 H.264), <slug>-mobile.mp4
(720x1280, two-pass x264 sized to about 27 MB), thumbnail.png (the cover card,
frame 45) and <slug>.srt. Exits non-zero on the first failure.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
# The Remotion CLI run through node directly: same as `npx remotion`, without
# cmd.exe mangling the JSON in --props on Windows.
REMOTION = ["node", str(ROOT / "node_modules" / "@remotion" / "cli" / "remotion-cli.js")]
MOBILE_TARGET_BYTES = 27_000_000
MOBILE_AUDIO_BPS = 96_000
THUMBNAIL_FRAME = 45


def run(cmd: list[str], what: str, capture: bool = False) -> str:
    """Run a command in the project root; fail loudly with its exit code.

    Output streams to the console unless `capture`, then it is returned.
    """
    print(f"\n== {what}", flush=True)
    try:
        result = subprocess.run(
            cmd, cwd=ROOT, check=True, text=True, encoding="utf-8",
            stdout=subprocess.PIPE if capture else None,
            stderr=subprocess.STDOUT if capture else None,
        )
    except FileNotFoundError as err:
        raise SystemExit(f"{what} failed: {cmd[0]} not found ({err}).") from err
    except subprocess.CalledProcessError as err:
        print(err.stdout or "", file=sys.stderr)
        raise SystemExit(f"{what} failed (exit {err.returncode}).") from err
    return result.stdout or ""


def duration_s(path: Path) -> float:
    out = run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=nw=1:nk=1", str(path)],
        f"ffprobe {path.name}", capture=True,
    )
    return float(out.strip())


def mean_volume_db(path: Path) -> str:
    out = run(
        ["ffmpeg", "-hide_banner", "-i", str(path), "-map", "0:a:0",
         "-af", "volumedetect", "-f", "null", os.devnull],
        f"volumedetect {path.name}", capture=True,
    )
    match = re.search(r"mean_volume: (-?[\d.]+) dB", out)
    if not match:
        raise SystemExit(f"{path.name} has no audio stream.")
    return f"{match.group(1)} dB"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("slug", help="folder name under public/videos/")
    slug: str = parser.parse_args().slug

    if not (ROOT / "public" / "videos" / slug / "edit.json").exists():
        raise SystemExit(f"public/videos/{slug}/edit.json not found; run prep-video.py first.")
    out_dir = ROOT / "out" / "videos" / slug
    out_dir.mkdir(parents=True, exist_ok=True)
    full = out_dir / f"{slug}.mp4"
    mobile = out_dir / f"{slug}-mobile.mp4"
    thumb = out_dir / "thumbnail.png"
    props = json.dumps({"slug": slug})

    run(REMOTION + ["render", "src/index.ts", "MortgageReel", str(full),
                    f"--props={props}", "--codec=h264", "--gl=angle",
                    "--concurrency=8", "--timeout=120000"],
        f"render {full.name} (several minutes)")

    seconds = duration_s(full)
    video_bps = int(MOBILE_TARGET_BYTES * 8 / seconds) - MOBILE_AUDIO_BPS
    with tempfile.TemporaryDirectory() as tmp:
        passlog = str(Path(tmp) / "x264pass")
        common = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", str(full),
                  "-vf", "scale=720:1280", "-c:v", "libx264", "-preset", "slow",
                  "-b:v", str(video_bps), "-passlogfile", passlog]
        run(common + ["-pass", "1", "-an", "-f", "null", os.devnull], "mobile pass 1")
        run(common + ["-pass", "2", "-c:a", "aac", "-b:a", str(MOBILE_AUDIO_BPS),
                      "-movflags", "+faststart", str(mobile)], "mobile pass 2")

    run(REMOTION + ["still", "src/index.ts", "MortgageReel", str(thumb),
                    f"--props={props}", f"--frame={THUMBNAIL_FRAME}", "--gl=angle"],
        "thumbnail")
    run(["node", "--no-warnings", "scripts/export-srt.mjs", slug], "captions (.srt)")
    srt = out_dir / f"{slug}.srt"

    print("\n== done")
    for path in (full, mobile):
        print(f"{path}  {path.stat().st_size / 1e6:.1f} MB  {duration_s(path):.2f} s  "
              f"audio mean {mean_volume_db(path)}")
    for path in (thumb, srt):
        print(f"{path}  {path.stat().st_size / 1e3:.0f} KB")


if __name__ == "__main__":
    main()
