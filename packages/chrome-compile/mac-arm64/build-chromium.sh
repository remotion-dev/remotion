#!/bin/bash
set -euo pipefail
export PATH="/opt/homebrew/bin:$PATH"

# Run on an EC2 M4 Mac with macOS 26 and Command Line Tools 26.6.
# The capture patch, GN args, and CLT support helper are required local inputs.
CHROMIUM_VERSION=157.0.8080.0
CHROMIUM_COMMIT=ab28d45abdcf95062bcb97d82e8a01b662d7cbdf
DEPOT_TOOLS_COMMIT=9b264039190fa270f3fc44779b4e26b43008ba41
source_dir="${CODEBUILD_SRC_DIR:-$(cd "$(dirname "$0")" && pwd)}"
build_root="${REMOTION_BUILD_ROOT:-$source_dir/.build}"
artifact_dir="$source_dir/artifacts"
output_dir="${REMOTION_OUTPUT_DIR:-$source_dir/../output}"
jobs="${CHROMIUM_BUILD_JOBS:-8}"
capture_patch="$source_dir/remotion-shared-memory-v3.patch"
gn_args="$source_dir/args.gn"
mkdir -p "$artifact_dir" "$output_dir"
exec > >(tee -a "$artifact_dir/build-v3.log") 2>&1
trap 'result=$?; printf "Build finished with exit code %s at %s\n" "$result" "$(date -u +%FT%TZ)"; exit "$result"' EXIT

test "$(uname -s)" = Darwin
test "$(uname -m)" = arm64
test -f "$capture_patch"
test -f "$gn_args"
case "$jobs" in 4|5|6|7|8|9|10) ;; *) echo 'CHROMIUM_BUILD_JOBS must be between 4 and 10.'; exit 1;; esac

echo 'Checking the build user and task-specific cache directories.'
id
command -v git
git --version
mkdir -p "$build_root" || true
for path in "$source_dir" "$artifact_dir" "$output_dir" "$build_root"; do
  ls -ld "$path" || true
  stat -L -f '%N owner=%Su group=%Sg permissions=%Sp' "$path" || true
done
# LOCAL_CUSTOM_CACHE may restore .build as a symlink to a directory owned by
# the CodeBuild agent. mkdir -p succeeds for an existing directory even when
# the current build user cannot create children in it. Probe an actual write.
if ! write_probe=$(mktemp -d "$build_root/.remotion-write-check.XXXXXX"); then
  cache_target=$(python3 -c 'from pathlib import Path; import sys; print(Path(sys.argv[1]).resolve())' "$build_root")
  echo "Cache target is not writable: $cache_target"
  ls -ld "$cache_target" || true
  stat -L -f '%N owner=%Su group=%Sg permissions=%Sp' "$cache_target" || true
  # Repair only this cache directory, never its parents or unrelated caches.
  # Existing checkout contents remain untouched.
  if [ -d "$cache_target" ] && [ "$cache_target" != / ] && \
     sudo -n chown "$(id -u):$(id -g)" "$cache_target" && \
     chmod u+rwx "$cache_target"; then
    echo 'Repaired ownership and user access on the task cache directory.'
  fi
  if ! write_probe=$(mktemp -d "$build_root/.remotion-write-check.XXXXXX"); then
    # Reserved Mac hosts retain their filesystem between builds. This stable,
    # user-owned fallback can also resume retries without deleting the cache
    # that CodeBuild restored under the source directory.
    build_root="$HOME/Library/Caches/remotion-chromium-shm/$CHROMIUM_VERSION"
    echo "Using writable task cache fallback: $build_root"
    mkdir -p "$build_root"
    write_probe=$(mktemp -d "$build_root/.remotion-write-check.XXXXXX")
  fi
fi
rmdir "$write_probe"
# Use the stable physical cache path, not a per-build source-directory symlink.
build_root=$(python3 -c 'from pathlib import Path; import sys; print(Path(sys.argv[1]).resolve(strict=True))' "$build_root")
depot_dir="$build_root/depot_tools"
checkout_dir="$build_root/chromium"
src="$checkout_dir/src"
printf 'Resolved build root: %s\n' "$build_root"
ls -ld "$build_root"
stat -f '%N owner=%Su group=%Sg permissions=%Sp' "$build_root"
case "$build_root" in *' '*) echo 'Chromium requires a build path without spaces.'; exit 1;; esac
unset FORCE_MAC_TOOLCHAIN
export DEPOT_TOOLS_UPDATE=0
export PATH="$depot_dir:$PATH"

echo 'Checking the EC2 Mac command-line tools installation.'
xcode-select -p | tee "$artifact_dir/xcode.txt"
pkgutil --pkg-info com.apple.pkg.CLTools_Executables | tee -a "$artifact_dir/xcode.txt"
xcrun --sdk macosx --show-sdk-path | tee "$artifact_dir/sdk-path.txt"
xcrun --sdk macosx --show-sdk-version | tee "$artifact_dir/sdk-version.txt"
sw_vers | tee "$artifact_dir/host-macos.txt"
df -h "$build_root"

echo "Fetching pinned depot_tools $DEPOT_TOOLS_COMMIT."
if [ ! -d "$depot_dir/.git" ]; then
  git init "$depot_dir"
  git -C "$depot_dir" remote add origin https://chromium.googlesource.com/chromium/tools/depot_tools.git
fi
if ! git -C "$depot_dir" rev-parse --verify HEAD >/dev/null 2>&1; then
  # A failed network fetch can leave an initialized cache with no HEAD.
  git -C "$depot_dir" fetch --depth 1 origin "$DEPOT_TOOLS_COMMIT"
  git -C "$depot_dir" checkout --detach FETCH_HEAD
fi
test "$(git -C "$depot_dir" rev-parse HEAD)" = "$DEPOT_TOOLS_COMMIT"

# gclient's vpython runtime and autoninja's python-bin runtime bootstrap
# separately. With DEPOT_TOOLS_UPDATE=0, gclient does not initialize python-bin.
# Repeat the supported bootstrap on cached retries without updating Git.
echo 'Initializing the pinned depot_tools runtimes.'
DEPOT_TOOLS_DIR="$depot_dir" DEPOT_TOOLS_BOOTSTRAP_PYTHON3=1 \
  "$depot_dir/ensure_bootstrap"
test "$(git -C "$depot_dir" rev-parse HEAD)" = "$DEPOT_TOOLS_COMMIT"
test -s "$depot_dir/python3_bin_reldir.txt"
"$depot_dir/python-bin/python3" --version | tee "$artifact_dir/depot-python-version.txt"
"$depot_dir/python-bin/python3" - <<'PY' | tee "$artifact_dir/depot-python-path.txt"
import sys
print(sys.executable)
assert sys.version_info >= (3, 11)
PY
"$depot_dir/vpython3" -c 'import sys; print(sys.version); print(sys.executable)' \
  | tee "$artifact_dir/vpython-version.txt"
type -a python3 vpython3 gclient autoninja ninja \
  | tee "$artifact_dir/build-tool-paths.txt"

mkdir -p "$checkout_dir"
cat > "$checkout_dir/.gclient" <<'GCLIENT'
solutions = [{
  "name": "src",
  "url": "https://chromium.googlesource.com/chromium/src.git",
  "managed": False,
  "deps_file": "DEPS",
  "custom_deps": {},
  "custom_vars": {
    "checkout_configuration": "small",
    "checkout_android": False,
    "checkout_fuchsia": False,
    "checkout_ios": False,
    "checkout_js_coverage_modules": False,
    "checkout_pgo_profiles": False,
    "checkout_telemetry_dependencies": False,
    "checkout_wpr_archives": False,
    "skip_wpr_archives_download": True,
    "checkout_instrumented_libraries": False,
    "download_remoteexec_cfg": False,
    "download_reclient": False,
  },
}]
target_os = ["mac"]
GCLIENT

echo "Fetching Chromium $CHROMIUM_VERSION."
if [ ! -d "$src/.git" ]; then
  git clone --depth 1 --branch "$CHROMIUM_VERSION" \
    https://chromium.googlesource.com/chromium/src.git "$src"
fi
test "$(git -C "$src" rev-parse HEAD)" = "$CHROMIUM_COMMIT"
cd "$src"
if [ ! -f "$build_root/dependencies-ready" ]; then
  gclient sync --nohooks --no-history --shallow --jobs 8 \
    --revision "src@$CHROMIUM_COMMIT"
  gclient runhooks
  touch "$build_root/dependencies-ready"
fi

echo 'Enabling prototype CLT support in this disposable checkout.'
export REMOTION_ALLOW_COMMAND_LINE_TOOLS=1
python3 "$source_dir/apply-clt-support.py" "$src"

echo 'Applying the shared-memory capture patch.'
if ! git apply --reverse --check "$capture_patch" 2>/dev/null; then
  # This disposable checkout owns these seven files. Restore only the previous
  # capture patch so an updated patch can reuse downloaded deps and object files.
  git restore --source="$CHROMIUM_COMMIT" -- \
    third_party/blink/public/devtools_protocol/domains/Page.pdl \
    content/browser/devtools/protocol/page_handler.h \
    content/browser/devtools/protocol/page_handler.cc \
    content/browser/devtools/protocol_config.json \
    content/browser/renderer_host/render_widget_host_impl.cc \
    content/browser/renderer_host/render_widget_host_impl.h \
    third_party/blink/renderer/core/inspector/inspector_protocol_config.json
  git apply --check "$capture_patch"
  git apply "$capture_patch"
fi

# Xcode 26 moved the offline Metal compiler into a separately downloaded
# component. ANGLE already has a runtime source-shader fallback. Use that
# existing path to avoid any additional Xcode downloads or authentication.
# This retains the Metal backend and only changes when internal shaders compile.
python3 - <<'PY'
from pathlib import Path
import re
p = Path('third_party/angle/src/libANGLE/renderer/metal/metal_backend.gni')
s = p.read_text()
before = re.compile(
    r'^metal_internal_shader_compilation_supported =\n(?:[ \t]+\S.*\n)+', re.M)
after = ('# Remotion prototype: use the existing runtime source-shader path.\n'
         'metal_internal_shader_compilation_supported = false\n')
if 'metal_internal_shader_compilation_supported = false' not in s:
    assert len(before.findall(s)) == 1, 'Unexpected ANGLE revision'
    p.write_text(before.sub(after, s, count=1))
PY

mkdir -p out/Remotion
cp "$gn_args" out/Remotion/args.gn
cp out/Remotion/args.gn "$artifact_dir/args.gn"
cp "$capture_patch" "$artifact_dir/remotion-shared-memory-v3.patch"
git diff --binary > "$artifact_dir/chromium-applied.patch"
git -C third_party/angle diff --binary > "$artifact_dir/angle-runtime-shaders.patch"
buildtools/mac/gn gen out/Remotion --fail-on-unused-args
buildtools/mac/gn --version > "$artifact_dir/gn-version.txt"
third_party/llvm-build/Release+Asserts/bin/clang --version > "$artifact_dir/clang-version.txt"
third_party/rust-toolchain/bin/rustc --version > "$artifact_dir/rust-version.txt"
test -x third_party/ninja/ninja
autoninja -C out/Remotion --version | tee "$artifact_dir/ninja-version.txt"

# Ask this generated GN graph for the patched source's actual object targets.
# Building them first catches capture/API errors before the remaining browser
# compilation; Ninja reuses all generated headers and objects in the full build.
buildtools/mac/gn outputs out/Remotion \
  content/browser/devtools/protocol/page_handler.cc \
  > "$artifact_dir/capture-object-targets.txt"
capture_targets=()
while IFS= read -r target; do
  if [ -n "$target" ]; then
    capture_targets+=("$target")
  fi
done < "$artifact_dir/capture-object-targets.txt"
test "${#capture_targets[@]}" -gt 0
echo 'Compiling the shared-memory capture source first.'
cat "$artifact_dir/capture-object-targets.txt"
autoninja -C out/Remotion -j "$jobs" "${capture_targets[@]}"

echo "Building headless_shell with $jobs jobs."
autoninja -C out/Remotion -j "$jobs" headless_shell
buildtools/mac/gn desc out/Remotion //headless:headless_shell runtime_deps \
  > "$artifact_dir/runtime-deps.txt"
out/Remotion/headless_shell --version | tee "$artifact_dir/browser-version.txt"

echo 'Packaging the executable and its runtime dependencies.'
export REMOTION_ARTIFACT_DIR="$artifact_dir"
export REMOTION_CHROMIUM_SRC="$src"
export REMOTION_CHROMIUM_COMMIT="$CHROMIUM_COMMIT"
export REMOTION_DEPOT_TOOLS_COMMIT="$DEPOT_TOOLS_COMMIT"
export REMOTION_CHROMIUM_VERSION="$CHROMIUM_VERSION"
python3 - <<'PY'
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess

artifact = Path(os.environ['REMOTION_ARTIFACT_DIR'])
src = Path(os.environ['REMOTION_CHROMIUM_SRC'])
out = src / 'out/Remotion'
package = artifact / 'chrome-headless-shell-mac-arm64'
package.mkdir(exist_ok=True)
deps = set((artifact / 'runtime-deps.txt').read_text().splitlines())
deps.update(['headless_shell', 'LICENSE.headless_shell'])
# Include dynamically loaded libraries and conventional resource locations even
# when a GN data dependency does not list them explicitly.
deps.update(str(p.relative_to(out)) for p in out.glob('*.dylib'))
deps.update(str(p.relative_to(out)) for p in out.glob('*.pak'))
for name in ['Helpers', 'locales', 'swiftshader', 'icudtl.dat',
             'snapshot_blob.bin', 'v8_context_snapshot.bin',
             'vk_swiftshader_icd.json']:
    if (out / name).exists():
        deps.add(name)
for name in sorted(deps):
    name = name.strip()
    if not name:
        continue
    path = Path(os.path.abspath(out / name))
    try:
        relative = path.relative_to(out)
    except ValueError:
        raise RuntimeError(f'Unexpected dependency outside build output: {name}')
    if not path.exists():
        raise RuntimeError(f'Missing runtime dependency: {name}')
    # Match Remotion BrowserFetcher's macOS headless-shell contract. Chromium's
    # Ninja target is named headless_shell, while the downloaded executable is
    # expected at chrome-headless-shell-mac-arm64/chrome-headless-shell.
    dest_relative = (Path('chrome-headless-shell')
                     if relative == Path('headless_shell') else relative)
    dest = package / dest_relative
    dest.parent.mkdir(parents=True, exist_ok=True)
    if path.is_dir():
        shutil.copytree(path, dest, symlinks=True, dirs_exist_ok=True)
    else:
        shutil.copy2(path, dest, follow_symlinks=False)

mach_o = []
for path in sorted(package.rglob('*')):
    if not path.is_file() or path.is_symlink():
        continue
    kind = subprocess.check_output(['file', '-b', str(path)], text=True)
    if 'Mach-O' not in kind:
        continue
    mach_o.append(str(path.relative_to(package)))
    check = subprocess.run(['codesign', '--verify', '--strict', str(path)],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if check.returncode:
        subprocess.run(['codesign', '--force', '--sign', '-', '--timestamp=none',
                        str(path)], check=True)
    subprocess.run(['codesign', '--verify', '--strict', str(path)], check=True)
    with (artifact / 'macho-inspection.txt').open('a') as f:
        f.write(f'\n{path.relative_to(package)}\n')
        subprocess.run(['otool', '-L', str(path)], stdout=f, check=True)
        subprocess.run(['otool', '-l', str(path)], stdout=f, check=True)

subprocess.run([str(package / 'chrome-headless-shell'), '--version'], check=True)
manifest = {
    'chromium_version': os.environ['REMOTION_CHROMIUM_VERSION'],
    'chromium_commit': os.environ['REMOTION_CHROMIUM_COMMIT'],
    'depot_tools_commit': os.environ['REMOTION_DEPOT_TOOLS_COMMIT'],
    'target_cpu': 'arm64',
    'mac_deployment_target': '13.0',
    'proprietary_codecs': True,
    'ffmpeg_branding': 'Chrome',
    'is_official_build': False,
    'angle_internal_shaders': 'runtime-source-compilation',
    'encoding_transport': 'CPU shared-memory capture patch; no forced VideoToolbox',
    'mach_o_files': mach_o,
    'metadata': {name: (artifact / name).read_text().strip() for name in [
        'xcode.txt', 'sdk-path.txt', 'sdk-version.txt', 'host-macos.txt',
        'clang-version.txt', 'rust-version.txt', 'gn-version.txt', 'args.gn',
        'browser-version.txt', 'depot-python-version.txt',
        'depot-python-path.txt', 'vpython-version.txt', 'build-tool-paths.txt',
        'ninja-version.txt', 'capture-object-targets.txt']},
    'files': {},
}
for path in sorted(package.rglob('*')):
    if path.is_file():
        manifest['files'][str(path.relative_to(package))] = {
            'bytes': path.stat().st_size,
            'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
        }
(artifact / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
PY

echo 'Probing the private shared-memory CDP command.'
python3 "$source_dir/probe-fast-path.py" \
  "$artifact_dir/chrome-headless-shell-mac-arm64/chrome-headless-shell" \
  | tee "$artifact_dir/fast-path-probe.json"

cd "$artifact_dir"
archive="chromium-headless-shell-mac-arm64.zip"
output_archive="$output_dir/$archive"
rm -f "$output_archive"
# -y preserves runtime-dependency symlinks and -X omits host-specific metadata.
zip -qry -X -y "$output_archive" chrome-headless-shell-mac-arm64
(cd "$output_dir" && shasum -a 256 "$archive") > SHA256SUMS
unzip -tq "$output_archive"
du -sh "$src" "$artifact_dir"
echo "Build and package completed: $output_archive"
echo 'Run the verification steps in README.md before publishing the artifact.'
