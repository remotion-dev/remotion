#!/usr/bin/env bash
# Downloads sound effects from myinstants.com pages listed in issue #7054.
set -euo pipefail

OUT_DIR="$(cd "$(dirname "$0")/.." && pwd)/myinstants-downloads"
mkdir -p "$OUT_DIR"

declare -a ITEMS=(
  "faaah|https://www.myinstants.com/en/instant/fahhhhhhhhhhhhhh-3525/"
  "spongebob-fail|https://www.myinstants.com/en/instant/spongebob-fail-11236/"
  "omg-hell-nah|https://www.myinstants.com/en/instant/oh-my-god-bro-oh-hell-nah-man-42939/"
  "x-files|https://www.myinstants.com/en/instant/x-files/"
  "fail-horn|https://www.myinstants.com/en/instant/fail-horn/"
  "romance|https://www.myinstants.com/en/instant/romanceeeeeeeeeeeeee-29042/"
  "bone-crack|https://www.myinstants.com/en/instant/bone-crack-23901/"
  "anime-wow|https://www.myinstants.com/en/instant/anime-wow/"
  "yippieh|https://www.myinstants.com/en/instant/yippeeeeeeeeeeeeee-34261/"
  "lagging|https://www.myinstants.com/en/instant/lagging-loading-11339/"
  "wilhelm-scream|https://www.myinstants.com/en/instant/man-screaming-aaaah-32768/"
  "quack|https://www.myinstants.com/en/instant/mac-quack-83896/"
  "skedaddle|https://www.myinstants.com/en/instant/skedaddle-78470/"
  "notification|https://www.myinstants.com/en/instant/notification-snap-43481/"
  "aah|https://www.myinstants.com/en/instant/nelly-ahh-89172/"
  "what|https://www.myinstants.com/en/instant/what-bottom-text-meme-sanctuary-guardian-s-24591/"
  "hurt|https://www.myinstants.com/en/instant/minecraft-hurt/"
  "oh-ma-gaud|https://www.myinstants.com/en/instant/oh-ma-gaud-vine-78004/"
  "illuminati|https://www.myinstants.com/en/instant/illuminati-confirmed-meme-99730/"
  "dramatic-boomer|https://www.myinstants.com/en/instant/dramatic-boomer-29428/"
  "core-trigger|https://www.myinstants.com/en/instant/core-sound-effect-57998/"
)

ok=0
fail=0

for item in "${ITEMS[@]}"; do
  name="${item%%|*}"
  url="${item#*|}"
  mp3_url=$(curl -fsSL "$url" | rg -o 'https://www\.myinstants\.com/media/sounds/[^"'\'' ]+\.mp3' -m 1 || true)

  if [[ -z "$mp3_url" ]]; then
    echo "FAIL $name: no MP3 link on $url"
    fail=$((fail + 1))
    continue
  fi

  out="$OUT_DIR/${name}.mp3"
  if curl -fsSL "$mp3_url" -o "$out"; then
    bytes=$(wc -c <"$out" | tr -d ' ')
    echo "OK   $name ($bytes bytes) <- $mp3_url"
    ok=$((ok + 1))
  else
    echo "FAIL $name: download failed for $mp3_url"
    rm -f "$out"
    fail=$((fail + 1))
  fi
done

echo ""
echo "Done: $ok succeeded, $fail failed -> $OUT_DIR"
