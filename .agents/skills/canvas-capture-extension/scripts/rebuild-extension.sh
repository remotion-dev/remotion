#!/usr/bin/env bash

set -euo pipefail

repo_dir=""
install_dir="/Users/jonathanburger/Applications/Remotion Canvas Capture Extension"

usage() {
	printf '%s\n' "Usage: rebuild-extension.sh [--repo PATH] [--install-dir PATH]"
}

while (($# > 0)); do
	case "$1" in
	--repo)
		repo_dir="${2:?--repo requires a path}"
		shift 2
		;;
	--install-dir)
		install_dir="${2:?--install-dir requires a path}"
		shift 2
		;;
	--help | -h)
		usage
		exit 0
		;;
	*)
		usage >&2
		printf 'Unknown argument: %s\n' "$1" >&2
		exit 1
		;;
	esac
done

if [[ -z "$repo_dir" ]]; then
	candidate_repo="$(git rev-parse --show-toplevel 2>/dev/null || true)"
	if [[ -f "$candidate_repo/packages/canvas-capture-extension/package.json" ]]; then
		repo_dir="$candidate_repo"
	elif [[ -f /Users/jonathanburger/remotion/packages/canvas-capture-extension/package.json ]]; then
		repo_dir="/Users/jonathanburger/remotion"
	else
		printf '%s\n' 'Could not find a Remotion checkout containing packages/canvas-capture-extension.' >&2
		exit 1
	fi
fi

package_dir="$repo_dir/packages/canvas-capture-extension"
dist_dir="$package_dir/dist"

if [[ ! -f "$package_dir/package.json" || ! -f "$package_dir/manifest.json" ]]; then
	printf 'Not a canvas capture extension source directory: %s\n' "$package_dir" >&2
	exit 1
fi

if ! command -v bun >/dev/null 2>&1; then
	printf '%s\n' 'Bun is required to build the extension.' >&2
	exit 1
fi

(
	cd "$package_dir"
	bun run make
)

for required_file in manifest.json background.js content.js receiver.js; do
	if [[ ! -f "$dist_dir/$required_file" ]]; then
		printf 'Build did not produce %s\n' "$dist_dir/$required_file" >&2
		exit 1
	fi
done

mkdir -p "$install_dir"
for extension_file in manifest.json background.js content.js receiver.js; do
	cp "$dist_dir/$extension_file" "$install_dir/$extension_file"
done

printf 'Installed Remotion Canvas Capture in %s\n' "$install_dir"
printf '%s\n' 'Open chrome://extensions manually, then click Reload or choose Load unpacked for this directory.'
