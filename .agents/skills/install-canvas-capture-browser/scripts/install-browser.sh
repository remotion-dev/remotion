#!/usr/bin/env bash

set -euo pipefail

minimum_version=157
metadata_url="https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions-with-downloads.json"
install_app="${HOME:?}/Applications/Recorder Chrome.app"

usage() {
	printf '%s\n' 'Usage: install-browser.sh [--install-app PATH]'
}

while (($# > 0)); do
	case "$1" in
	--install-app)
		install_app="${2:?--install-app requires a path}"
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

if [[ "$(uname -s)" != "Darwin" || "$(uname -m)" != "arm64" ]]; then
	printf '%s\n' 'This Chrome for Testing installer requires Apple Silicon macOS.' >&2
	exit 1
fi

installed_plist="$install_app/Contents/Info.plist"
installed_executable="$install_app/Contents/MacOS/Google Chrome for Testing"
if [[ -e "$install_app" ]]; then
	installed_version="$(/usr/libexec/PlistBuddy -c 'Print :CFBundleShortVersionString' "$installed_plist" 2>/dev/null || true)"
	installed_major="${installed_version%%.*}"
	if [[ "$installed_major" =~ ^[0-9]+$ && -x "$installed_executable" ]] && ((installed_major >= minimum_version)); then
		printf 'Chrome for Testing %s is already installed at %s\n' "$installed_version" "$install_app"
		exit 0
	fi

	printf 'Cannot install because an incompatible app already exists at: %s\n' "$install_app" >&2
	printf 'Expected Chrome for Testing %s or newer, found version: %s\n' "$minimum_version" "${installed_version:-unknown}" >&2
	printf '%s\n' 'Move or remove that app after confirming it is safe to do so, then rerun this installer.' >&2
	exit 1
fi

temporary_dir="$(mktemp -d)"
cleanup() {
	if [[ -d "$temporary_dir" ]]; then
		rm -rf -- "$temporary_dir"
	fi
}
trap cleanup EXIT

metadata_path="$temporary_dir/chrome-for-testing.json"
curl --fail --location --silent --show-error "$metadata_url" --output "$metadata_path"

download_url=""
expected_version=""
selected_channel=""
for channel in Stable Beta Dev Canary; do
	candidate_version="$(plutil -extract "channels.$channel.version" raw -o - "$metadata_path" 2>/dev/null || true)"
	candidate_major="${candidate_version%%.*}"
	if [[ ! "$candidate_major" =~ ^[0-9]+$ ]] || ((candidate_major < minimum_version)); then
		continue
	fi

	index=0
	while candidate_platform="$(plutil -extract "channels.$channel.downloads.chrome.$index.platform" raw -o - "$metadata_path" 2>/dev/null)"; do
		if [[ "$candidate_platform" == "mac-arm64" ]]; then
			download_url="$(plutil -extract "channels.$channel.downloads.chrome.$index.url" raw -o - "$metadata_path")"
			expected_version="$candidate_version"
			selected_channel="$channel"
			break
		fi
		index=$((index + 1))
	done

	if [[ -n "$download_url" ]]; then
		break
	fi
done

if [[ -z "$download_url" ]]; then
	printf 'No Chrome for Testing %s or newer download is available for mac-arm64.\n' "$minimum_version" >&2
	exit 1
fi

archive_path="$temporary_dir/chrome-mac-arm64.zip"
extracted_dir="$temporary_dir/extracted"
source_app="$extracted_dir/chrome-mac-arm64/Google Chrome for Testing.app"

printf 'Downloading Chrome for Testing %s (%s)…\n' "$expected_version" "$selected_channel"
curl --fail --location --progress-bar "$download_url" --output "$archive_path"

mkdir -p "$extracted_dir"
ditto -x -k "$archive_path" "$extracted_dir"

source_plist="$source_app/Contents/Info.plist"
source_executable="$source_app/Contents/MacOS/Google Chrome for Testing"
downloaded_version="$(/usr/libexec/PlistBuddy -c 'Print :CFBundleShortVersionString' "$source_plist" 2>/dev/null || true)"
if [[ "$downloaded_version" != "$expected_version" || ! -x "$source_executable" ]]; then
	printf '%s\n' 'The downloaded archive did not contain the expected Chrome for Testing app.' >&2
	printf 'Expected version: %s\n' "$expected_version" >&2
	printf 'Found version:    %s\n' "${downloaded_version:-unknown}" >&2
	exit 1
fi

mkdir -p "$(dirname "$install_app")"
mv "$source_app" "$install_app"

installed_version="$(/usr/libexec/PlistBuddy -c 'Print :CFBundleShortVersionString' "$installed_plist")"
if [[ "$installed_version" != "$expected_version" || ! -x "$installed_executable" ]]; then
	printf 'Chrome for Testing could not be verified after installation at: %s\n' "$install_app" >&2
	exit 1
fi

printf 'Installed Chrome for Testing %s at %s\n' "$expected_version" "$install_app"
