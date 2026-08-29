#!/usr/bin/env bash

set -euo pipefail

expected_version="150.0.7842.0"
expected_revision="r1631007"
expected_sha256="86de7ffdb70d3f41714bf5b2b6fe3ef23cbf6c924eb407343418f31b9c721f7f"
download_url="https://storage.googleapis.com/chrome-for-testing-per-commit-public/mac-arm64/r1631007/chrome-mac-arm64.zip"
install_app="/Users/jonathanburger/Applications/Recorder Chrome.app"

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
	printf '%s\n' 'Canvas Capture requires Apple Silicon macOS for this pinned browser build.' >&2
	exit 1
fi

installed_plist="$install_app/Contents/Info.plist"
installed_executable="$install_app/Contents/MacOS/Google Chrome for Testing"
if [[ -e "$install_app" ]]; then
	installed_version="$(/usr/libexec/PlistBuddy -c 'Print :CFBundleShortVersionString' "$installed_plist" 2>/dev/null || true)"
	if [[ "$installed_version" == "$expected_version" && -x "$installed_executable" ]]; then
		printf 'Chrome for Testing %s (%s) is already installed at %s\n' "$expected_version" "$expected_revision" "$install_app"
		exit 0
	fi

	printf 'Cannot install because an incompatible app already exists at: %s\n' "$install_app" >&2
	printf 'Expected Chrome for Testing %s (%s), found version: %s\n' "$expected_version" "$expected_revision" "${installed_version:-unknown}" >&2
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

archive_path="$temporary_dir/chrome-mac-arm64.zip"
extracted_dir="$temporary_dir/extracted"
source_app="$extracted_dir/chrome-mac-arm64/Google Chrome for Testing.app"

printf 'Downloading Chrome for Testing %s (%s)…\n' "$expected_version" "$expected_revision"
curl --fail --location --progress-bar "$download_url" --output "$archive_path"

actual_sha256="$(shasum -a 256 "$archive_path" | cut -d ' ' -f 1)"
if [[ "$actual_sha256" != "$expected_sha256" ]]; then
	printf '%s\n' 'The downloaded Chrome for Testing archive failed checksum verification.' >&2
	printf 'Expected SHA-256: %s\n' "$expected_sha256" >&2
	printf 'Found SHA-256:    %s\n' "$actual_sha256" >&2
	exit 1
fi

mkdir -p "$extracted_dir"
ditto -x -k "$archive_path" "$extracted_dir"

source_plist="$source_app/Contents/Info.plist"
source_executable="$source_app/Contents/MacOS/Google Chrome for Testing"
downloaded_version="$(/usr/libexec/PlistBuddy -c 'Print :CFBundleShortVersionString' "$source_plist" 2>/dev/null || true)"
if [[ "$downloaded_version" != "$expected_version" || ! -x "$source_executable" ]]; then
	printf '%s\n' 'The verified archive did not contain the required Chrome for Testing app.' >&2
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

printf 'Installed Chrome for Testing %s (%s) at %s\n' "$expected_version" "$expected_revision" "$install_app"
