#!/bin/bash
set -euo pipefail

# =============================================================================
# build-chromium.sh — Build Chromium 157.0.8080.0 headless_shell (ARM64)
#
# Runs INSIDE the Docker container (Ubuntu 22.04 ARM64).
# Targets regular Linux distros (Debian/Ubuntu) — no system libs bundled.
# =============================================================================

CHROME_VERSION="157.0.8080.0"

echo "========================================="
echo "Building Chromium $CHROME_VERSION headless_shell (Linux ARM64)"
echo "========================================="

# =============================================================================
# 1. Install depot_tools
# =============================================================================
echo ">>> Step 1: Install depot_tools"
export DEPOT_TOOLS_BOOTSTRAP_PYTHON3=0
cd /root
git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git
export PATH="$PATH:/root/depot_tools"

# =============================================================================
# 2. Clone Chromium and checkout the target version
# =============================================================================
echo ">>> Step 2: Clone Chromium source and checkout $CHROME_VERSION"

# Use chromium.googlesource.com rather than the GitHub mirror: the canonical
# mirror has proper packfile sharding for shallow clones of tags and completes
# in minutes; github.com/chromium/chromium.git ships a single 30GB+ pack that
# can take an hour to index on cold-cache runners.
git config --global http.postBuffer 524288000
git config --global user.email "build@localhost"
git config --global user.name "Build"

mkdir -p /root/chromium
cp /root/dot-gclient /root/chromium/.gclient
cd /root/chromium
git clone --depth 1 --branch "$CHROME_VERSION" \
  https://chromium.googlesource.com/chromium/src.git src
cd src
git log -1 --oneline

# =============================================================================
# 3. Sync depot_tools to match the Chromium commit date
# =============================================================================
echo ">>> Step 3: Sync depot_tools to matching date"
COMMIT_DATE=$(git log -n 1 --pretty=format:%ci)
CHROMIUM_COMMIT_YMD=$(git log -n 1 --pretty=format:%cd --date=format:%Y-%m-%d)
echo "Chromium $CHROME_VERSION commit date: $COMMIT_DATE ($CHROMIUM_COMMIT_YMD)"
cd /root/depot_tools
git checkout $(git rev-list -n 1 --before="$COMMIT_DATE" main)
export DEPOT_TOOLS_UPDATE=0

# =============================================================================
# 4. Patch DEPS and lastchange.py
# =============================================================================
echo ">>> Step 4: Patch DEPS and lastchange.py"
cd /root/chromium/src

# Fix lastchange.py quoting for git log format
if [ -f build/util/lastchange.py ]; then
  sed -i "s/git_args = \['log', '-1', '--format=%H %ct'\]/git_args = ['log', '-1', '--format=\"%H %ct\"']/" build/util/lastchange.py
  echo "Patched lastchange.py"
fi

# The `infra/3pp/tools/gperf/<platform>` CIPD package has no linux-arm64 build,
# so gclient sync fails with "no such package: infra/3pp/tools/gperf/linux-arm64".
# We already install system gperf via apt in the Dockerfile, so restrict the
# CIPD dep to x64 to let arm64 skip it.
python3 - <<'PY'
import re
p = 'DEPS'
with open(p) as f:
    s = f.read()
block_re = re.compile(r"('src/third_party/gperf/cipd':[\s\S]*?'condition':\s*)('[^']+')")
m = block_re.search(s)
if m and 'host_cpu == "x64"' not in m.group(2):
    new_cond = "'host_os == \"linux\" and host_cpu == \"x64\" and non_git_source'"
    s = s[:m.start(2)] + new_cond + s[m.end(2):]
    with open(p, 'w') as f:
        f.write(s)
    print("Patched gperf cipd condition to x64-only")
else:
    print("gperf cipd condition already patched or pattern not found")
PY

# =============================================================================
# 5. gclient sync and runhooks
# =============================================================================
echo ">>> Step 5: gclient sync"
cd /root/chromium/src
gclient sync -D --no-history --shallow --force --reset
gclient runhooks

# Apply the same shared-memory CDP patch as the macOS build.
cd /root/chromium/src
git apply --check /root/remotion-shared-memory-v3.patch
git apply /root/remotion-shared-memory-v3.patch

# =============================================================================
# 5.5. Replace system Python 3.10 with Python 3.11 from vpython cache
# =============================================================================
# Ubuntu 22.04 ships Python 3.10. depot_tools' autoninja.py imports
# `StrEnum` from enum, which only exists in Python 3.11+. Swap in the vpython
# cached Python 3.11 (downloaded during `gclient sync`) as the default
# interpreter on PATH.
echo ">>> Step 5.5: Fix Python version (Ubuntu 22.04 ships 3.10, Chromium needs 3.11+)"
PY311=$(ls -d /root/.cache/vpython-root.0/store/cpython+*/contents/bin/python3.11 2>/dev/null | head -1)
if [ -n "$PY311" ] && [ -x "$PY311" ]; then
  ln -sf "$PY311" /usr/local/bin/python3
  ln -sf "$PY311" /usr/local/bin/python
  ln -sf "$PY311" /usr/local/bin/python3.11
  hash -r
  echo "Linked Python 3.11 from vpython cache: $PY311"
  python3 --version
else
  echo "WARNING: Python 3.11 not found in vpython cache — autoninja may fail on StrEnum import"
fi

# =============================================================================
# 6. Replace Node.js with aarch64 version
# =============================================================================
echo ">>> Step 6: Replace Node.js with aarch64"
cd /root/chromium/src

# Chromium's node comes from linux-x64 — replace it with arm64 directly.
# In Chromium 149, the helper function in `update_node_binaries` was renamed
# from `update_unix` to `download_unix`; avoid the script and download the
# arm64 tarball manually using NODE_VERSION declared inside.
NODE_VERSION=$(grep -E '^NODE_VERSION=' third_party/node/update_node_binaries | head -1 | cut -d'"' -f2)
echo "Chromium wants Node $NODE_VERSION; downloading arm64 build."
cd third_party/node/linux
rm -rf node-linux-x64 node-linux-arm64 node-linux-x64.tar.gz
wget -q "https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}-linux-arm64.tar.gz"
tar xf "node-${NODE_VERSION}-linux-arm64.tar.gz"
mv "node-${NODE_VERSION}-linux-arm64" node-linux-arm64
rm -f "node-${NODE_VERSION}-linux-arm64.tar.gz"
ln -s /root/chromium/src/third_party/node/linux/node-linux-arm64 /root/chromium/src/third_party/node/linux/node-linux-x64
cd /root/chromium/src

# gperf: the `third_party/gperf/cipd` CIPD package has no linux-arm64 build
# (see DEPS patch in step 4). We installed system gperf in the Dockerfile,
# so link it into the spot gn expects the CIPD-managed binary.
mkdir -p third_party/gperf/cipd/bin
ln -sf "$(command -v gperf)" third_party/gperf/cipd/bin/gperf

# DevTools compiles TypeScript with the native compiler from
# third_party/typescript/linux-amd64, an x86_64-only download. The CIPD package
# is the npm release, so install the same version's arm64 binary in its place.
TS_DIR=third_party/typescript/linux-amd64/src
TS_VERSION=$(python3 -c "import json, sys; print(json.load(open(sys.argv[1]))['version'])" "$TS_DIR/package.json")
echo "Replacing the x86_64 TypeScript $TS_VERSION compiler with its arm64 build"
python3 - "$TS_VERSION" "$TS_DIR/lib/tsc" <<'PY'
import base64, hashlib, io, json, sys, tarfile, urllib.request
version, destination = sys.argv[1:]
meta = json.load(urllib.request.urlopen(
    f'https://registry.npmjs.org/@typescript/typescript-linux-arm64/{version}'))
data = urllib.request.urlopen(meta['dist']['tarball']).read()
algorithm, expected = meta['dist']['integrity'].split('-', 1)
assert base64.b64encode(hashlib.new(algorithm, data).digest()).decode() == expected
with tarfile.open(fileobj=io.BytesIO(data)) as archive:
    tsc = archive.extractfile('package/lib/tsc').read()
with open(destination, 'wb') as f:
    f.write(tsc)
PY
chmod 0755 "$TS_DIR/lib/tsc"
"$TS_DIR/lib/tsc" --version

# =============================================================================
# 7. Replace Java with aarch64 version
# =============================================================================
echo ">>> Step 7: Replace Java with aarch64"
cd /root
rm -rf /root/chromium/src/third_party/jdk/current
wget -q https://github.com/adoptium/temurin11-binaries/releases/download/jdk-11.0.15%2B10/OpenJDK11U-jre_aarch64_linux_hotspot_11.0.15_10.tar.gz
tar zxf OpenJDK11U-jre_aarch64_linux_hotspot_11.0.15_10.tar.gz
mv jdk-11.0.15+10-jre /root/chromium/src/third_party/jdk/current

# =============================================================================
# 8. CMake — skip (Ubuntu 22.04 apt cmake 3.22 is sufficient)
# =============================================================================
echo ">>> Step 8: CMake — using system cmake ($(cmake --version | head -1))"

# =============================================================================
# 9. Replace Ninja with aarch64 version
# =============================================================================
echo ">>> Step 9: Build and install Ninja"

# ninja's configure.py has `#!/usr/bin/env python` — Ubuntu 22.04 only ships
# python3, so make sure there's a python symlink on PATH.
ln -sf /usr/bin/python3 /usr/bin/python

cd /root
git clone https://github.com/ninja-build/ninja.git -b v1.8.2
cd ninja
./configure.py --bootstrap
rm -f /root/depot_tools/ninja
ln -s /root/ninja/ninja /root/depot_tools/ninja

# =============================================================================
# 10. Patch and build LLVM/Clang
# =============================================================================
echo ">>> Step 10: Build LLVM/Clang"
cd /root/chromium/src

# Fix libxml2 path for aarch64 Ubuntu (lib/aarch64-linux-gnu instead of lib64)
sed -i "s#dirs.lib_dir, 'libxml2.a'#os.path.join(dirs.install_dir, 'lib/aarch64-linux-gnu'), 'libxml2.a'#g" tools/clang/scripts/build.py

# Remove -DLLVM_ENABLE_LLD=ON (not available without prebuilt lld)
sed -i "s/ *'-DLLVM_ENABLE_LLD=ON',//" tools/clang/scripts/build.py

# Remove ML inlining model block if present
python3 -c "
import re
with open('tools/clang/scripts/build.py', 'r') as f:
    content = f.read()
content = re.sub(r'  if args\.with_ml_inlin.*?(?=\n  [a-z]|\n  #|\nif |\ndef )', '', content, flags=re.DOTALL)
with open('tools/clang/scripts/build.py', 'w') as f:
    f.write(content)
" 2>/dev/null || echo "ML inline model block not found or already removed"

# Fix lib_dir to use build_dir
sed -i "s/self\.lib_dir = os\.path\.join(self\.install_dir, 'lib')/self\.lib_dir = os\.path\.join(self\.build_dir, 'lib')/g" tools/clang/scripts/build.py

# Add -lrt -lpthread to cxxflags
sed -i "s/cxxflags = \[\]/cxxflags = ['-lrt', '-lpthread']/g" tools/clang/scripts/build.py

# Target ARM/AArch64 instead of X86
sed -i "s/bootstrap_targets = 'X86'/bootstrap_targets = 'ARM;AArch64'/g" tools/clang/scripts/build.py

# PIC patches + libxml2 disable — same Python patch used for lambda-arm64.
python3 - <<'PY'
import re
p = 'tools/clang/scripts/build.py'
with open(p) as f:
    src = f.read()

# 1. Drop the blanket -DLLVM_ENABLE_PIC line from base_cmake_args.
src = re.sub(r"\s*f?'-DLLVM_ENABLE_PIC=\{?pic_mode\}?',?", '', src)

# 2. Chromium links libclang.so during bootstrap, so its static objects must
#    also be compiled with PIC. The bootstrap list is
#    `base_cmake_args + compiler_wrapper_cmake_args + [` on one line in 149 and
#    wrapped in parentheses across several lines in 157; match both and fail
#    loudly rather than silently building without these flags.
boot_marker = "# __PATCHED_BOOTSTRAP_PIC__"
if boot_marker not in src:
    boot = re.search(
        r"bootstrap_args = \(?\s*base_cmake_args\s*\+\s*"
        r"compiler_wrapper_cmake_args\s*\+\s*\[", src)
    if not boot:
        raise SystemExit("build.py: bootstrap_args list not found")
    inject = " " + boot_marker + "\n        '-DLLVM_ENABLE_PIC=ON', '-DCMAKE_POSITION_INDEPENDENT_CODE=ON',\n        '-DLLVM_ENABLE_LIBXML2=OFF',"
    src = src[:boot.end()] + inject + src[boot.end():]

# 3. Force PIC ON for the final cmake_args and disable libxml2 there too.
final_marker = "# __PATCHED_FINAL_PIC__"
if final_marker not in src:
    final = re.search(r"^\s*cmake_args = base_cmake_args \+ \[", src, re.M)
    if not final:
        raise SystemExit("build.py: final cmake_args list not found")
    inject = " " + final_marker + "\n      '-DLLVM_ENABLE_PIC=ON',\n      '-DCMAKE_POSITION_INDEPENDENT_CODE=ON',\n      '-DLLVM_ENABLE_LIBXML2=OFF',"
    src = src[:final.end()] + inject + src[final.end():]

# 4. Downgrade LLVM_ENABLE_LIBXML2=FORCE_ON → OFF (libxml2 linking on aarch64 is fragile).
src = src.replace("'-DLLVM_ENABLE_LIBXML2=FORCE_ON'", "'-DLLVM_ENABLE_LIBXML2=OFF'")

with open(p, 'w') as f:
    f.write(src)
print("Applied PIC + libxml2 patches to build.py")
PY

# Remove non-aarch64 runtime triples via brace-matching.
python3 - <<'PY'
p = 'tools/clang/scripts/build.py'
with open(p) as f:
    lines = f.readlines()

out = []
skip_to_close = False
depth = 0
for line in lines:
    if skip_to_close:
        depth += line.count('{') + line.count('[') + line.count('(')
        depth -= line.count('}') + line.count(']') + line.count(')')
        if depth <= 0:
            skip_to_close = False
        continue
    for bad in (
        "runtimes_triples_args['i386-unknown-linux-gnu']",
        "runtimes_triples_args['x86_64-unknown-linux-gnu']",
        "runtimes_triples_args['armv7-unknown-linux-gnueabihf']",
        "runtimes_triples_args['riscv64-unknown-linux-gnu']",
    ):
        if bad in line:
            depth = line.count('{') + line.count('[') + line.count('(')
            depth -= line.count('}') + line.count(']') + line.count(')')
            skip_to_close = depth > 0
            break
    else:
        out.append(line)
with open(p, 'w') as f:
    f.writelines(out)
print("Dropped non-aarch64 runtime triples")
PY

export LD_LIBRARY_PATH="${LD_LIBRARY_PATH:-}:/lib64"

# The final libclang-cpp.so link may fail after the libclang.so needed by
# bindgen is built. Retry when the LLVM source download fails before that.
LLVM_LIB=/root/chromium/src/third_party/llvm-build/Release+Asserts/lib
for attempt in 1 2 3; do
  ./tools/clang/scripts/build.py \
    --without-android \
    --without-fuchsia \
    --use-system-cmake \
    --host-cc /usr/bin/clang \
    --host-cxx /usr/bin/clang++ \
    --bootstrap || true
  if ls "$LLVM_LIB"/libclang.so* >/dev/null 2>&1; then
    break
  fi
  if [ "$attempt" -lt 3 ]; then
    echo "LLVM ended before libclang.so was built; retrying ($attempt/3)"
    rm -rf third_party/llvm
    sleep 15
  fi
done

# Copy libclang.so* where bindgen/Chromium expects it.
LLVM_LIB=/root/chromium/src/third_party/llvm-build/Release+Asserts/lib
mkdir -p /root/chromium/src/third_party/rust-toolchain/lib
if ls "$LLVM_LIB"/libclang.so* >/dev/null 2>&1; then
  cp -P "$LLVM_LIB"/libclang.so* /root/chromium/src/third_party/rust-toolchain/lib/
  echo "Copied libclang.so* -> third_party/rust-toolchain/lib/"
else
  echo "ERROR: no libclang.so* found in $LLVM_LIB — LLVM build failed too early"
  exit 1
fi
export LIBCLANG_PATH=/root/chromium/src/third_party/rust-toolchain/lib
export LD_LIBRARY_PATH="${LIBCLANG_PATH}:${LD_LIBRARY_PATH:-}"

# =============================================================================
# 11. Set up build output directory (NO tmpfs — disk only)
# =============================================================================
echo ">>> Step 11: Set up build directory"
mkdir -p /root/chromium/src/out/Headless
cp /root/args.gn /root/chromium/src/out/Headless/args.gn

# =============================================================================
# 12. Apply compatibility patches
# =============================================================================
echo ">>> Step 12: Apply compatibility patches"

# fcntl.h seals — check if already defined (Ubuntu 22.04 should have these)
if ! grep -q 'F_LINUX_SPECIFIC_BASE' /usr/include/fcntl.h 2>/dev/null; then
  echo '#ifndef F_LINUX_SPECIFIC_BASE' >> /usr/include/fcntl.h
  echo '#define F_LINUX_SPECIFIC_BASE 1024' >> /usr/include/fcntl.h
  echo '#endif' >> /usr/include/fcntl.h
  echo '#define F_ADD_SEALS (F_LINUX_SPECIFIC_BASE + 9)' >> /usr/include/fcntl.h
  echo '#define F_GET_SEALS (F_LINUX_SPECIFIC_BASE + 10)' >> /usr/include/fcntl.h
  echo '#define F_SEAL_SEAL 0x0001' >> /usr/include/fcntl.h
  echo '#define F_SEAL_SHRINK 0x0002' >> /usr/include/fcntl.h
  echo '#define F_SEAL_GROW 0x0004' >> /usr/include/fcntl.h
  echo '#define F_SEAL_FUTURE_WRITE 0x0010' >> /usr/include/fcntl.h
  echo "Patched fcntl.h"
else
  echo "fcntl.h already has F_LINUX_SPECIFIC_BASE — no patch needed"
fi

# MFD_CLOEXEC for V8 — check if already defined
if [ -f /root/chromium/src/v8/src/base/platform/platform-posix.cc ]; then
  if ! grep -q 'MFD_CLOEXEC' /root/chromium/src/v8/src/base/platform/platform-posix.cc; then
    sed -i '1i#define MFD_CLOEXEC 0x0001U' /root/chromium/src/v8/src/base/platform/platform-posix.cc
    echo "Patched platform-posix.cc with MFD_CLOEXEC"
  else
    echo "MFD_CLOEXEC already defined — no patch needed"
  fi
fi

# Disable GPU DRI config references
for gn_file in content/gpu/BUILD.gn media/gpu/sandbox/BUILD.gn; do
  if [ -f "$gn_file" ] && grep -q '//build/config/linux/dri' "$gn_file"; then
    sed -i 's/configs += \[ "\/\/build\/config\/linux\/dri" \]/    configs += []/g' "$gn_file"
    echo "Patched DRI config in $gn_file"
  fi
done

# =============================================================================
# 13. Install the Rust toolchain Chromium's prebuilt toolchain is built from
# =============================================================================
echo ">>> Step 13: Install Rust"
cd /root/chromium/src

# Chromium's bundled Rust toolchain is x86_64-only. Since Chromium 157, Blink
# depends on C++ headers generated by Crubit's cc_bindings_from_rs, a rustc
# driver that rejects crates compiled by any other rustc (E0514), so a nightly
# from a different commit no longer works. Install rust-lang/rust CI builds of
# the exact commit Chromium's toolchain is built from, then build
# cc_bindings_from_rs against them with Chromium's own build_crubit.py.
#
# Two prefixes: rustc-dev's compiler crates share lib/rustlib/<host>/lib with
# the prebuilt std that Chromium's Rust host build tools link against, so the
# build toolchain must not contain them. Crubit is built with the rustc-dev one.
RUST_COMMIT=$(awk '{print $3}' third_party/rust-toolchain/VERSION | head -1)
RUST_CI_DIR=/root/rust-ci
RUST_CI_DEV_DIR=/root/rust-ci-dev
RUST_HOST=aarch64-unknown-linux-gnu
echo "Installing rust-lang/rust CI toolchain $RUST_COMMIT"
mkdir -p /root/rust-ci-dist
for component in rustc rust-std rustc-dev cargo rustfmt; do
  name="${component}-nightly-${RUST_HOST}"
  curl -fsSL --retry 3 -o "/root/rust-ci-dist/${name}.tar.xz" \
    "https://ci-artifacts.rust-lang.org/rustc-builds/${RUST_COMMIT}/${name}.tar.xz"
  python3 -c "import sys, tarfile; tarfile.open(sys.argv[1]).extractall(sys.argv[2])" \
    "/root/rust-ci-dist/${name}.tar.xz" /root/rust-ci-dist
done
for component in rustc rust-std cargo rustfmt; do
  bash "/root/rust-ci-dist/${component}-nightly-${RUST_HOST}/install.sh" \
    --prefix="$RUST_CI_DIR" --disable-ldconfig
done
for component in rustc rust-std rustc-dev cargo; do
  bash "/root/rust-ci-dist/${component}-nightly-${RUST_HOST}/install.sh" \
    --prefix="$RUST_CI_DEV_DIR" --disable-ldconfig
done
"$RUST_CI_DIR/bin/rustc" -vV
# rustc-dev ships a second librustc_driver in lib/rustlib/<host>/lib, which
# cargo puts on LD_LIBRARY_PATH for build scripts; that copy's $ORIGIN/../lib
# runpath needs the dynamically linked libLLVM next to it.
for lib in "$RUST_CI_DEV_DIR"/lib/libLLVM*.so*; do
  ln -sf "$lib" "$RUST_CI_DEV_DIR/lib/rustlib/$RUST_HOST/lib/"
done

RUST_TOOLCHAIN=third_party/rust-toolchain
for tool in rustc cargo rustfmt; do
  ln -sf "$RUST_CI_DIR/bin/$tool" "$RUST_TOOLCHAIN/bin/$tool"
done
# rustc derives its sysroot from where it loaded librustc_driver, and the build
# puts $RUST_TOOLCHAIN/lib on LD_LIBRARY_PATH, so expose the arm64 prebuilt std
# that Chromium's Rust host build tools link against in that sysroot too.
ln -sfn "$RUST_CI_DIR/lib/rustlib/$RUST_HOST" "$RUST_TOOLCHAIN/lib/rustlib/$RUST_HOST"
# cc_bindings_from_rs finds librustc_driver through an $ORIGIN/../lib rpath.
cp -P "$RUST_CI_DIR"/lib/*.so* "$RUST_TOOLCHAIN/lib/"
# Earlier steps put $RUST_TOOLCHAIN/lib on LD_LIBRARY_PATH, which would make
# these cargo builds' rustc load librustc_driver (and so its sysroot) from there
# instead of from the rustc-dev prefix.
env -u LD_LIBRARY_PATH python3 - "$RUST_CI_DEV_DIR" <<'PY'
import sys
sys.path.insert(0, 'tools/rust')
import build_crubit
build_crubit.CheckoutGitRepo('crubit', build_crubit.CRUBIT_GIT,
                             build_crubit.CRUBIT_REVISION,
                             build_crubit.CRUBIT_SRC_DIR)
sys.exit(build_crubit.BuildCrubit(sys.argv[1], '/root/crubit-out'))
PY
"$RUST_TOOLCHAIN/bin/cc_bindings_from_rs" --help | head -1
LD_LIBRARY_PATH="$(pwd)/$RUST_TOOLCHAIN/lib" "$RUST_TOOLCHAIN/bin/rustc" \
  --print target-libdir --target "$RUST_HOST"

# The x86_64 bindgen from Chromium's toolchain can't run here either.
export CARGO_HOME=/root/.cargo
env -u LD_LIBRARY_PATH PATH="$RUST_CI_DIR/bin:$PATH" cargo install bindgen-cli ||
  env -u LD_LIBRARY_PATH PATH="$RUST_CI_DIR/bin:$PATH" \
    cargo install bindgen-cli --version 0.72.1
ln -sf "$CARGO_HOME/bin/bindgen" "$RUST_TOOLCHAIN/bin/bindgen"

# Crubit formats the headers it generates with buildtools/linux64-format's
# clang-format, also an x86_64-only download; use the one built in Step 10.
ln -sf /root/chromium/src/third_party/llvm-build/Release+Asserts/bin/clang-format \
  buildtools/linux64-format/clang-format
buildtools/linux64-format/clang-format --version

# V8's metagen loads third_party/llvm-libclang/lib/libclang.so through Python's
# ctypes; that download is x86_64-only as well. Use the libclang from Step 10,
# which is built from the same LLVM revision.
ln -sf /root/chromium/src/third_party/llvm-build/Release+Asserts/lib/libclang.so \
  third_party/llvm-libclang/lib/libclang.so

# =============================================================================
# 14. Fix GCC paths
# =============================================================================
echo ">>> Step 14: Fix GCC paths"
GCC_DIR=$(find /usr/lib/gcc/aarch64-linux-gnu/ -maxdepth 1 -type d | tail -1)
if [ -n "$GCC_DIR" ] && [ -d "$GCC_DIR" ]; then
  export LIBRARY_PATH="${GCC_DIR}:${LIBRARY_PATH:-}"
  ln -sf "${GCC_DIR}/crtbeginS.o" /usr/lib/crtbeginS.o
  ln -sf "${GCC_DIR}/crtendS.o" /usr/lib/crtendS.o
  echo "Linked GCC CRT objects from $GCC_DIR"
else
  echo "WARNING: Could not find GCC directory"
fi

# =============================================================================
# 15. Generate build files and compile
# =============================================================================
echo ">>> Step 15: gn gen + autoninja"
cd /root/chromium/src

# depot_tools Python path fix — point at the Python 3.11 symlinked in Step 5.5.
mkdir -p /root/depot_tools/.cipd_bin
ln -sf "$(readlink -f /usr/local/bin/python3)" /root/depot_tools/.cipd_bin/python3
echo ".cipd_bin" > /root/depot_tools/python3_bin_reldir.txt

export LIBCLANG_PATH=/root/chromium/src/third_party/rust-toolchain/lib
export LD_LIBRARY_PATH="${LIBCLANG_PATH}:${LD_LIBRARY_PATH:-}"

gn gen out/Headless

# Compile the patched capture source first so a patch error surfaces within
# minutes instead of after the full browser compile. Ninja reuses the generated
# headers and objects in the headless_shell build below. gn prints unused-arg
# warnings on stdout too, so keep only object paths.
gn outputs out/Headless content/browser/devtools/protocol/page_handler.cc \
  | grep -E '^obj/.*\.o$' | tee /root/capture-object-targets.txt
xargs -r autoninja -C out/Headless < /root/capture-object-targets.txt

autoninja -C out/Headless headless_shell

# Exercise the private CDP commands and read the frame from POSIX shared memory.
python3 /root/probe-fast-path.py out/Headless/headless_shell

# =============================================================================
# 16. Strip binaries and package as chromium-headless-shell-linux-arm64.zip
# =============================================================================
echo ">>> Step 16: Strip and package"
cd /root/chromium/src

for bin in out/Headless/headless_shell out/Headless/libEGL.so out/Headless/libGLESv2.so \
           out/Headless/libvk_swiftshader.so out/Headless/libvulkan.so.1; do
  # libEGL.so and libGLESv2.so can be zero-byte placeholders, which strip rejects.
  if [ -s "$bin" ]; then
    strip "$bin"
  fi
done

# Package only Chromium-built outputs (no system libs — user installs via apt).
#
# Required layout for Remotion's BrowserFetcher:
#   chrome-headless-shell-linux-arm64/headless_shell
# The folder name matches `chrome-headless-shell-${platform}` (platform =
# `linux-arm64`) so the extractor's post-rename step is a no-op. The binary
# stays `headless_shell` for ARM64 (unlike linux64, where it must be renamed
# to `chrome-headless-shell`). Do NOT rename it here.
# (See ../README.md → "Output zip layout requirements".)
mkdir -p final/chrome-headless-shell-linux-arm64
cp out/Headless/headless_shell        final/chrome-headless-shell-linux-arm64/
cp out/Headless/libEGL.so             final/chrome-headless-shell-linux-arm64/
cp out/Headless/libGLESv2.so          final/chrome-headless-shell-linux-arm64/
cp out/Headless/libvk_swiftshader.so  final/chrome-headless-shell-linux-arm64/
cp out/Headless/libvulkan.so.1        final/chrome-headless-shell-linux-arm64/
cp out/Headless/vk_swiftshader_icd.json final/chrome-headless-shell-linux-arm64/

cd final
zip -r chromium-headless-shell-linux-arm64.zip chrome-headless-shell-linux-arm64

echo ""
echo "========================================="
echo "BUILD COMPLETE!"
echo "Output: /root/chromium/src/final/chromium-headless-shell-linux-arm64.zip"
echo "========================================="
echo ""
echo "On target system, install runtime deps:"
echo "  sudo apt install -y libnss3 libnspr4 libexpat1 libdbus-1-3 libgbm1 \\"
echo "    libasound2 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \\"
echo "    libxkbcommon0 libx11-6 libxcomposite1 libxdamage1 libxext6 \\"
echo "    libxfixes3 libxrandr2 libpango-1.0-0 libcairo2 fonts-liberation"
