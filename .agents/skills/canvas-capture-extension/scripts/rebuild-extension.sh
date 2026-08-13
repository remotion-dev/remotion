#!/usr/bin/env bash

set -euo pipefail

repo_dir=""
install_dir="/Users/jonathanburger/Applications/Remotion Canvas Capture Extension"
browser_executable="/Users/jonathanburger/Applications/Recorder Chrome.app/Contents/MacOS/Google Chrome for Testing"
expected_browser_version="150.0.7842.0"
expected_browser_revision="r1631007"
browser_download_url="https://storage.googleapis.com/chrome-for-testing-per-commit-public/mac-arm64/r1631007/chrome-mac-arm64.zip"

usage() {
	printf '%s\n' "Usage: rebuild-extension.sh [--repo PATH] [--install-dir PATH] [--browser-executable PATH]"
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
	--browser-executable)
		browser_executable="${2:?--browser-executable requires a path}"
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

if [[ ! -f "$package_dir/package.json" || ! -f "$package_dir/wxt.config.ts" ]]; then
	printf 'Not a canvas capture extension source directory: %s\n' "$package_dir" >&2
	exit 1
fi

if [[ ! -x "$browser_executable" ]]; then
	printf 'Chrome for Testing was not found at: %s\n' "$browser_executable" >&2
	printf 'Canvas Capture requires Chrome for Testing %s (revision %s).\n' "$expected_browser_version" "$expected_browser_revision" >&2
	printf 'Download it from: %s\n' "$browser_download_url" >&2
	printf '%s\n' 'After installing it, rerun this command. For a different location, pass --browser-executable PATH.' >&2
	exit 1
fi

browser_version="$("$browser_executable" --version 2>&1 || true)"
browser_version="${browser_version%"${browser_version##*[![:space:]]}"}"
expected_browser_description="Google Chrome for Testing $expected_browser_version"
if [[ "$browser_version" != "$expected_browser_description" ]]; then
	printf '%s\n' 'The installed browser is incompatible with Canvas Capture.' >&2
	printf 'Expected: %s (revision %s)\n' "$expected_browser_description" "$expected_browser_revision" >&2
	printf 'Found: %s\n' "${browser_version:-unknown browser or version}" >&2
	printf 'Download the required browser from: %s\n' "$browser_download_url" >&2
	printf '%s\n' 'Then rerun this command, passing --browser-executable PATH if it is installed in a different location.' >&2
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

for required_file in manifest.json background.js capture.js recorder.html logo.svg content-scripts/receiver.js; do
	if [[ ! -f "$dist_dir/$required_file" ]]; then
		printf 'Build did not produce %s\n' "$dist_dir/$required_file" >&2
		exit 1
	fi
done

if ! find "$dist_dir/assets" -type f -name 'recorder-*.css' -print -quit | grep -q .; then
	printf 'Build did not produce the recorder CSS in %s\n' "$dist_dir/assets" >&2
	exit 1
fi

if ! find "$dist_dir/chunks" -type f -name 'recorder-*.js' -print -quit | grep -q .; then
	printf 'Build did not produce the recorder JavaScript in %s\n' "$dist_dir/chunks" >&2
	exit 1
fi

mkdir -p "$install_dir"
cp -R "$dist_dir/." "$install_dir/"

printf 'Installed Remotion Canvas Capture in %s\n' "$install_dir"
printf '%s\n' 'Open chrome://extensions manually, then click Reload or choose Load unpacked for this directory.'
