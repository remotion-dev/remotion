#!/bin/bash
set -euo pipefail

# =============================================================================
# build-chromium.sh — Build Chromium 157.0.8080.0 headless_shell (ARM64)
#
# Runs INSIDE the Docker container.
# Adapted from V2.md (Chrome 123) for Chrome 157.
# =============================================================================

CHROME_VERSION="157.0.8080.0"

echo "========================================="
echo "Building Chromium $CHROME_VERSION headless_shell"
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
mkdir -p /root/chromium
cp /root/dot-gclient /root/chromium/.gclient
cd /root/chromium

# GitHub's chromium mirror occasionally hangs forever after the pack download
# completes — the LB silently drops the connection and libcurl never notices.
# Configure git to abort if the HTTP transfer drops below 1 KB/s for 10 min,
# then retry the whole step a few times. Without this, a single stall can wedge
# the build for hours (last seen: 27min stuck in do_select on a dead socket).
# googlesource can take more than a minute to prepare the depth-1 pack before
# it sends any data, so a 60 s window failed every attempt (October 2026).
git config --global http.lowSpeedLimit 1024
git config --global http.lowSpeedTime 600
git config --global http.postBuffer 1048576000

retry_git() {
  local n=0
  local max=4
  until "$@"; do
    n=$((n + 1))
    if [ $n -ge $max ]; then
      echo "git command failed after $max attempts: $*" >&2
      return 1
    fi
    echo "git command failed, retrying ($n/$max): $*" >&2
    sleep $((n * 5))
  done
}

# Use Google's canonical chromium repo rather than the github.com mirror.
# The github mirror has been hitting <1 KB/s on sustained reads from
# eu-central-1 (Apr 2026), causing every retry to timeout. googlesource is
# the source-of-truth used by depot_tools for everything else in Step 5
# anyway, so we already trust it.
#
# Do the whole thing as `git clone --branch <tag> --depth 1` so we only have
# ONE round-trip to googlesource instead of clone+fetch. The earlier
# `git fetch --tags origin <tag>` was reliably dying on the last few sideband
# bytes — googlesource closes the connection right after sending the final
# packet and an unlucky retry timing makes it look like a stall.
# protocol.version=2 cuts ref-discovery overhead and is the chromium default.
retry_git git -c protocol.version=2 clone \
  --branch "$CHROME_VERSION" \
  --depth 1 \
  --no-tags \
  https://chromium.googlesource.com/chromium/src.git src
cd src
git checkout --quiet "$CHROME_VERSION"

# =============================================================================
# 3. Sync depot_tools to match the Chromium commit date
# =============================================================================
echo ">>> Step 3: Sync depot_tools to matching date"
COMMIT_DATE=$(git log -n 1 --pretty=format:%ci)
# Also capture the date (YYYY-MM-DD) so we can pick a matching Rust nightly later.
CHROMIUM_COMMIT_YMD=$(git log -n 1 --pretty=format:%cd --date=format:%Y-%m-%d)
echo "Chromium $CHROME_VERSION commit date: $COMMIT_DATE ($CHROMIUM_COMMIT_YMD)"
cd /root/depot_tools
git checkout $(git rev-list -n 1 --before="$COMMIT_DATE" main)
export DEPOT_TOOLS_UPDATE=0

# =============================================================================
# 4. Patch DEPS to skip reclient (Windows-only) and fix lastchange.py
# =============================================================================
echo ">>> Step 4: Patch DEPS and lastchange.py"
cd /root/chromium/src

# In Chrome 144, reclient already has a condition ('download_reclient and non_git_source')
# and download_reclient defaults to 'checkout_chromeos' which is false for us.
# No DEPS patching needed for reclient.
echo "Skipping reclient DEPS patch (not needed for Chrome 144)"

# Fix lastchange.py quoting for git log format
if [ -f build/util/lastchange.py ]; then
  sed -i "s/git_args = \['log', '-1', '--format=%H %ct'\]/git_args = ['log', '-1', '--format=\"%H %ct\"']/" build/util/lastchange.py
  echo "Patched lastchange.py"
fi

# The `infra/3pp/tools/gperf/<platform>` CIPD package has no linux-arm64 build,
# so gclient sync fails with "no such package: infra/3pp/tools/gperf/linux-arm64".
# We already install system gperf via dnf in the Dockerfile, so restrict the
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
# 5.5. Use Python 3.11 from the vpython cache
# =============================================================================
# AL2023 ships Python 3.9, but Chromium's scripts need 3.11+ (since 157,
# tools/clang/scripts/build.py parses "...Z" timestamps with
# datetime.fromisoformat; autoninja imports StrEnum). Put the vpython 3.11
# downloaded by `gclient runhooks` first on PATH. Only /usr/local/bin changes,
# so dnf keeps the system interpreter.
echo ">>> Step 5.5: Use Python 3.11 (AL2023 ships 3.9)"
VPYTHON3=$(find /root/.cache/vpython-root.0/store -name python3.11 -path "*/bin/python3.11" 2>/dev/null | head -1)
if [ -z "$VPYTHON3" ] || [ ! -x "$VPYTHON3" ]; then
  echo "ERROR: Python 3.11 not found in the vpython cache"
  exit 1
fi
ln -sf "$VPYTHON3" /usr/local/bin/python3
ln -sf "$VPYTHON3" /usr/local/bin/python
hash -r
python3 --version

# =============================================================================
# 6. Replace Node.js with aarch64 version
# =============================================================================
echo ">>> Step 6: Replace Node.js with aarch64"
cd /root/chromium/src
# Chromium's node comes from the linux-x64 prebuilt — replace it with arm64.
# `update_node_binaries` in Chromium 149 uses `download_unix` (was `update_unix`
# pre-149). Rather than patching the script, download the arm64 tarball directly
# using the NODE_VERSION declared inside it.
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
# (see DEPS patch in step 4). We install system gperf via dnf, so link it into
# the spot gn expects the CIPD-managed binary.
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
# 8. Install CMake from source
# =============================================================================
echo ">>> Step 8: Install CMake"
cd /root
wget -q https://cmake.org/files/v3.23/cmake-3.23.0.tar.gz
tar -xzf cmake-3.23.0.tar.gz
cd cmake-3.23.0
./bootstrap
make -j$(nproc)
make install
export PATH="$PATH:/usr/local/bin"

# =============================================================================
# 9. Replace Ninja with aarch64 version
# =============================================================================
echo ">>> Step 9: Build and install Ninja"
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

# Fix libxml2 path for aarch64 (lib64 instead of lib)
sed -i "s#dirs.lib_dir, 'libxml2.a'#os.path.join(dirs.install_dir, 'lib64'), 'libxml2.a'#g" tools/clang/scripts/build.py

# Remove -DLLVM_ENABLE_LLD=ON (not available without prebuilt lld)
sed -i "s/ *'-DLLVM_ENABLE_LLD=ON',//" tools/clang/scripts/build.py

# Remove ML inlining model block if present
python3 -c "
import re
with open('tools/clang/scripts/build.py', 'r') as f:
    content = f.read()
# Remove the if args.with_ml_inline_model block
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

# PIC patches + libxml2 disable. bindgen needs a SHARED libclang.so; the
# default LLVM build produces only static archives. We need PIC OFF for
# bootstrap and PIC ON for the final stage. libxml2 linking on aarch64 is
# fragile, so disable it in both stages. See README.md for details.
python3 - <<'PY'
import re
p = 'tools/clang/scripts/build.py'
with open(p) as f:
    src = f.read()

# 1. Drop the blanket -DLLVM_ENABLE_PIC line from base_cmake_args (if present).
src = re.sub(r"\s*f?'-DLLVM_ENABLE_PIC=\{?pic_mode\}?',?", '', src)

# 2. Force PIC ON + libxml2 OFF for BOTH bootstrap and final stages.
#    - bootstrap: Chromium 149 now links libclang.so during bootstrap, so all
#      static archives need -fPIC or the shared-library link fails with
#      R_AARCH64_ADR_PREL_PG_HI21 relocation errors.
#    - final: PIC is already needed here for the eventual libclang.so that
#      feeds bindgen.
#    The bootstrap list is
#      bootstrap_args = base_cmake_args + compiler_wrapper_cmake_args + [
#    on one line in v149 and wrapped in parentheses across several lines in
#    v157; match both and fail loudly rather than silently building without
#    these flags. Sentinel markers guard against double-patching on re-runs.
boot_marker = "# __PATCHED_BOOTSTRAP_PIC__"
if boot_marker not in src:
    boot = re.search(
        r"bootstrap_args = \(?\s*base_cmake_args\s*\+\s*"
        r"compiler_wrapper_cmake_args\s*\+\s*\[", src)
    if not boot:
        raise SystemExit("build.py: bootstrap_args list not found")
    inject = " " + boot_marker + "\n        '-DLLVM_ENABLE_PIC=ON', '-DCMAKE_POSITION_INDEPENDENT_CODE=ON',\n        '-DLLVM_ENABLE_LIBXML2=OFF',"
    src = src[:boot.end()] + inject + src[boot.end():]

final_marker = "# __PATCHED_FINAL_PIC__"
if final_marker not in src:
    final = re.search(r"^\s*cmake_args = base_cmake_args \+ \[", src, re.M)
    if not final:
        raise SystemExit("build.py: final cmake_args list not found")
    inject = " " + final_marker + "\n      '-DLLVM_ENABLE_PIC=ON',\n      '-DCMAKE_POSITION_INDEPENDENT_CODE=ON',\n      '-DLLVM_ENABLE_LIBXML2=OFF',"
    src = src[:final.end()] + inject + src[final.end():]

# 4. Downgrade LLVM_ENABLE_LIBXML2=FORCE_ON → OFF.
src = src.replace("'-DLLVM_ENABLE_LIBXML2=FORCE_ON'", "'-DLLVM_ENABLE_LIBXML2=OFF'")

with open(p, 'w') as f:
    f.write(src)
print("Applied PIC + libxml2 patches to build.py")
PY

# Remove non-aarch64 runtime triples via brace-matching. A naive regex approach
# leaves `if ...:` blocks empty and breaks Python indentation (see v149 failure
# at build.py:~1332 when runtimes_triples_args blocks were inside an if).
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

# The low-speed abort configured for the Chromium clone in Step 2 kills the
# full llvm-project clone below: googlesource spends more than 60 s preparing
# that pack before it sends any data, so every attempt died with "curl 28
# Operation too slow" (seen September 2026). Lift the limit for the LLVM fetch.
git config --global --unset-all http.lowSpeedLimit || true
git config --global --unset-all http.lowSpeedTime || true

# The final libclang-cpp.so link may fail after the libclang.so needed by
# bindgen is built. Retry when the LLVM source download fails before that.
LLVM_LIB=/root/chromium/src/third_party/llvm-build/Release+Asserts/lib
for attempt in 1 2 3; do
  ./tools/clang/scripts/build.py \
    --without-android \
    --without-fuchsia \
    --use-system-cmake \
    --host-cc /bin/clang \
    --host-cxx /bin/clang++ \
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
# 11. Set up build output directory
# =============================================================================
echo ">>> Step 11: Set up build directory"
# IMPORTANT: Do NOT use tmpfs here. ThinLTO needs ~50 GB of temp space during
# the final link; a 48 GB tmpfs on a 64 GB RAM machine runs out and fails the
# link. Use disk instead — it's plenty fast enough on gp3.
mkdir -p /root/chromium/src/out/Headless
cp /root/args.gn /root/chromium/src/out/Headless/args.gn

# =============================================================================
# 12. Apply compatibility patches
# =============================================================================
echo ">>> Step 12: Apply compatibility patches"

# fcntl.h seals — check if already defined before patching
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
  echo "fcntl.h already has F_LINUX_SPECIFIC_BASE"
fi

# MFD_CLOEXEC for V8
if [ -f /root/chromium/src/v8/src/base/platform/platform-posix.cc ]; then
  if ! grep -q 'MFD_CLOEXEC' /root/chromium/src/v8/src/base/platform/platform-posix.cc; then
    sed -i '1i#define MFD_CLOEXEC 0x0001U' /root/chromium/src/v8/src/base/platform/platform-posix.cc
    echo "Patched platform-posix.cc"
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
# Find the GCC version directory
GCC_DIR=$(find /usr/lib/gcc/aarch64-amazon-linux/ -maxdepth 1 -type d | tail -1)
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

# Chrome 144+ uses `type | type` (PEP 604) in build scripts, which needs
# Python 3.10+. AL2023 ships Python 3.9, so hop onto Python 3.11 from the
# vpython cache (populated by `gclient runhooks` in Step 5).
VPYTHON3=$(find /root/.cache/vpython-root.0/store -name python3.11 -path "*/bin/python3.11" 2>/dev/null | head -1)
if [ -n "$VPYTHON3" ] && [ -x "$VPYTHON3" ]; then
  ln -sf "$VPYTHON3" /usr/local/bin/python3
  ln -sf "$VPYTHON3" /usr/local/bin/python
  echo "Using vpython Python 3.11: $VPYTHON3"
else
  echo "WARNING: could not find vpython Python 3.11 — build may fail on PEP 604 syntax"
fi

# depot_tools needs to find python3 via its .cipd_bin directory.
mkdir -p /root/depot_tools/.cipd_bin
ln -sf /usr/local/bin/python3 /root/depot_tools/.cipd_bin/python3
echo ".cipd_bin" > /root/depot_tools/python3_bin_reldir.txt

# Make sure LIBCLANG_PATH / LD_LIBRARY_PATH are still set for this shell.
export LIBCLANG_PATH=/root/chromium/src/third_party/rust-toolchain/lib
export LD_LIBRARY_PATH="${LIBCLANG_PATH}:${LD_LIBRARY_PATH:-}"

# args.gn turns OFF subsystems that default to ON for Linux desktop builds
# (pdf, printing, print preview, platform apps, Lens, screen_ai, library CDMs)
# to keep the Lambda binary small. headless_shell depends on none of them, but
# the full Chrome graph no longer evaluates with them disabled: since Chromium
# 157, for example, //chrome/browser/ui/browser_web_contents_delegate depends on
# //components/printing/browser, and //printing asserts enable_printing.
# Generate only headless_shell and its transitive dependencies instead of
# patching asserts across the whole tree. This goes into .gn rather than onto
# the gn command line so that gn invocations made by build steps (the
# LICENSE.headless_shell action runs `gn desc`) see the same graph.
if ! grep -q '^root_patterns' .gn; then
  cat >> .gn <<'GN'

# Remotion Lambda build: only headless_shell and its dependencies are defined.
root = "//headless:headless_shell"
root_patterns = [ "//headless:headless_shell" ]
GN
fi
gn gen out/Headless

# Compile the patched capture source first so a patch error surfaces within
# minutes instead of after the full two-hour browser compile. Ninja reuses the
# generated headers and objects in the headless_shell build below. gn prints
# unused-arg warnings on stdout too, so keep only object paths.
gn outputs out/Headless content/browser/devtools/protocol/page_handler.cc \
  | grep -E '^obj/.*\.o$' | tee /root/capture-object-targets.txt
xargs -r autoninja -C out/Headless < /root/capture-object-targets.txt

autoninja -C out/Headless headless_shell

# Exercise the private CDP commands with both pool backends: POSIX shared memory
# (read back from /dev/shm) and a file-backed pool in a private directory.
python3 /root/probe-fast-path.py out/Headless/headless_shell

# =============================================================================
# 16. Strip binaries and package as chromium-headless-shell-amazon-linux2023-arm64.zip
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

# Required layout for Remotion's BrowserFetcher:
#   chromium-headless-shell-amazon-linux2023-arm64/headless_shell
# i.e. the binary + bundled libs MUST be inside a subdirectory named
# `chromium-headless-shell-amazon-linux2023-arm64/`. The extractor's
# `possibleSubdirs` list looks for that exact folder name; without it,
# extraction silently fails and `getExecutablePath` returns a path that
# doesn't exist on AL2023 arm64.
# (See ../README.md → "Output zip layout requirements".)
OUTPUT_DIR="chromium-headless-shell-amazon-linux2023-arm64"
mkdir -p "final/${OUTPUT_DIR}"
cp out/Headless/headless_shell        "final/${OUTPUT_DIR}/"
cp out/Headless/libEGL.so             "final/${OUTPUT_DIR}/"
cp out/Headless/libGLESv2.so          "final/${OUTPUT_DIR}/"
cp out/Headless/libvk_swiftshader.so  "final/${OUTPUT_DIR}/"
cp out/Headless/libvulkan.so.1        "final/${OUTPUT_DIR}/"
cp out/Headless/vk_swiftshader_icd.json "final/${OUTPUT_DIR}/"

# Copy system shared libraries needed at runtime. The libgcc_s name varies with
# the host gcc version, so glob for it.
for lib in libnss3.so libnssutil3.so libsoftokn3.so libnspr4.so libexpat.so.1 \
           libplc4.so libplds4.so libfreebl3.so libfreeblpriv3.so \
           libdbus-1.so.3 libsystemd.so.0; do
  if [ -f "/lib64/$lib" ]; then
    cp "/lib64/$lib" "final/${OUTPUT_DIR}/$lib"
  elif [ -f "/usr/lib64/$lib" ]; then
    cp "/usr/lib64/$lib" "final/${OUTPUT_DIR}/$lib"
  else
    echo "WARNING: $lib not found in /lib64 or /usr/lib64, skipping"
  fi
done

# libgcc_s has a date-stamped filename (e.g. libgcc_s-14-20250110.so.1).
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
