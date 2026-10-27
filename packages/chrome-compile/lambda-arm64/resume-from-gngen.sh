#!/bin/bash
# Resume the build from Step 14b onward.
#
# Use case: the main build-chromium.sh has already completed Steps 1-14
# (clone, gclient sync, LLVM build, Rust install, GCC paths) inside a
# container, and got as far as the BUILD.gn assert patcher (Step 14b).
# `gn gen` then failed because some asserts live in `.gni` files that the
# patcher's BUILD.gn-only glob missed.
#
# Rather than redoing 50min of LLVM + clone work, snapshot the failed
# container and re-run JUST this script with the fix.
#
# Idempotency: the assert patcher's substitution leaves a trailing
# `# patched: disabled-on-lambda` marker so re-running doesn't double-patch.
# The printing-stub appender uses a `__PATCHED_PRINTING_STUBS__` marker
# for the same reason.
set -euo pipefail

export PATH="$PATH:/root/depot_tools:/usr/local/bin"
export DEPOT_TOOLS_UPDATE=0
export DEPOT_TOOLS_BOOTSTRAP_PYTHON3=0

cd /root/chromium/src

# If a host-mounted args.gn override is present (e.g. when iterating on
# args.gn flags without rebuilding the docker image), copy it into the
# Headless out-dir before gn gen runs.
if [ -f /root/args.gn.override ]; then
  echo "Using host-mounted args.gn override:"
  cp /root/args.gn.override /root/chromium/src/out/Headless/args.gn
  diff /root/args.gn /root/args.gn.override || true
fi

# Re-export library paths so autoninja can find clang/rust.
export LIBCLANG_PATH=/root/chromium/src/third_party/rust-toolchain/lib
export LD_LIBRARY_PATH="${LIBCLANG_PATH}:${LD_LIBRARY_PATH:-}"

# vpython3.11 may not be on PATH after `docker run` of a snapshot.
VPYTHON3=$(find /root/.cache/vpython-root.0/store -name python3.11 -path "*/bin/python3.11" 2>/dev/null | head -1)
if [ -n "$VPYTHON3" ] && [ -x "$VPYTHON3" ]; then
  ln -sf "$VPYTHON3" /usr/local/bin/python3
  ln -sf "$VPYTHON3" /usr/local/bin/python
  echo "Using vpython Python 3.11: $VPYTHON3"
fi
mkdir -p /root/depot_tools/.cipd_bin
ln -sf /usr/local/bin/python3 /root/depot_tools/.cipd_bin/python3
echo ".cipd_bin" > /root/depot_tools/python3_bin_reldir.txt

# GCC dirs may need re-linking if the snapshot lost /usr/lib/crtbegin{S,end}.o.
GCC_DIR=$(find /usr/lib/gcc/aarch64-amazon-linux/ -maxdepth 1 -type d 2>/dev/null | tail -1)
if [ -n "$GCC_DIR" ] && [ -d "$GCC_DIR" ]; then
  export LIBRARY_PATH="${GCC_DIR}:${LIBRARY_PATH:-}"
  ln -sf "${GCC_DIR}/crtbeginS.o" /usr/lib/crtbeginS.o
  ln -sf "${GCC_DIR}/crtendS.o" /usr/lib/crtendS.o
fi

# Cargo / Rust env.
[ -f "$HOME/.cargo/env" ] && source "$HOME/.cargo/env"

echo ">>> (resume) Step 14b: Patch BUILD.gn AND .gni asserts (multiline-aware)"
python3 - <<'PY'
import re, subprocess
FLAGS = ['pdf', 'printing', 'print_preview', 'oop_printing', 'pdf_save_to_drive',
         'extensions', 'extensions_core', 'compose', 'screen_ai_service',
         'library_cdms']
flag_re = '|'.join(FLAGS)
pat = re.compile(rf'^assert\(enable_({flag_re})\b.*?\)', re.MULTILINE | re.DOTALL)
out = subprocess.run(
    ['grep', '-rlE',
     f'^assert\\(enable_({flag_re})\\b',
     '--include=BUILD.gn', '--include=*.gni', '.'],
    capture_output=True, text=True)
files = [f for f in out.stdout.splitlines() if f]
patched = 0
for f in files:
    with open(f) as fp:
        s = fp.read()
    def comment(m):
        block = m.group(0)
        return '\n'.join('# ' + line for line in block.splitlines()) + '  # patched: disabled-on-lambda'
    new = pat.sub(comment, s)
    if new != s:
        with open(f, 'w') as fp:
            fp.write(new)
        patched += 1
        print(f'  patched asserts in {f}')
print(f'  patched {patched} file(s) total')
PY

PRINTING_BUILD=chrome/browser/printing/BUILD.gn
PRINTING_MARKER='# __PATCHED_PRINTING_STUBS__'
if [ -f "$PRINTING_BUILD" ] && ! grep -qF "$PRINTING_MARKER" "$PRINTING_BUILD"; then
  cat >> "$PRINTING_BUILD" <<'PRINTING_PATCH'

# __PATCHED_PRINTING_STUBS__
if (!enable_printing) {
  group("printing") {
  }
  group("impl") {
  }
}
PRINTING_PATCH
  echo "  appended printing stubs to $PRINTING_BUILD"
fi

echo ">>> (resume) Step 15: gn gen + autoninja"
gn gen out/Headless

# Same fail-fast compile of the patched capture source as build-chromium.sh.
gn outputs out/Headless content/browser/devtools/protocol/page_handler.cc \
  | grep -E '^obj/.*\.o$' | tee /root/capture-object-targets.txt
xargs -r autoninja -C out/Headless < /root/capture-object-targets.txt

autoninja -C out/Headless headless_shell

# Exercise both pool backends of the shared-memory patch before packaging.
python3 /root/probe-fast-path.py out/Headless/headless_shell

echo ">>> (resume) Step 16: Strip and package"
strip -o out/Headless/headless_shell out/Headless/headless_shell
strip -o out/Headless/libEGL.so out/Headless/libEGL.so
strip -o out/Headless/libGLESv2.so out/Headless/libGLESv2.so
strip -o out/Headless/libvk_swiftshader.so out/Headless/libvk_swiftshader.so
strip -o out/Headless/libvulkan.so.1 out/Headless/libvulkan.so.1

OUTPUT_DIR="chromium-headless-shell-amazon-linux2023-arm64"
rm -rf "final/${OUTPUT_DIR}" "final/${OUTPUT_DIR}.zip"
mkdir -p "final/${OUTPUT_DIR}"
cp out/Headless/headless_shell        "final/${OUTPUT_DIR}/"
cp out/Headless/libEGL.so             "final/${OUTPUT_DIR}/"
cp out/Headless/libGLESv2.so          "final/${OUTPUT_DIR}/"
cp out/Headless/libvk_swiftshader.so  "final/${OUTPUT_DIR}/"
cp out/Headless/libvulkan.so.1        "final/${OUTPUT_DIR}/"
cp out/Headless/vk_swiftshader_icd.json "final/${OUTPUT_DIR}/"

for lib in libnss3.so libnssutil3.so libsoftokn3.so libnspr4.so libexpat.so.1 \
           libplc4.so libplds4.so libfreebl3.so libfreeblpriv3.so \
           libdbus-1.so.3 libsystemd.so.0; do
  if [ -f "/lib64/$lib" ]; then
    cp "/lib64/$lib" "final/${OUTPUT_DIR}/$lib"
  elif [ -f "/usr/lib64/$lib" ]; then
    cp "/usr/lib64/$lib" "final/${OUTPUT_DIR}/$lib"
  else
    echo "WARNING: $lib not found"
  fi
done

for libgcc in /lib64/libgcc_s-*.so.1 /usr/lib64/libgcc_s-*.so.1 /lib64/libgcc_s.so.1 /usr/lib64/libgcc_s.so.1; do
  if [ -f "$libgcc" ]; then
    cp "$libgcc" "final/${OUTPUT_DIR}/$(basename "$libgcc")"
    echo "Copied $(basename "$libgcc")"
    break
  fi
done

cd final
zip -r "${OUTPUT_DIR}.zip" "${OUTPUT_DIR}"

echo ""
echo "========================================="
echo "BUILD COMPLETE!"
echo "Output: /root/chromium/src/final/${OUTPUT_DIR}.zip"
echo "========================================="
