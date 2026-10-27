#!/bin/bash
set -euo pipefail

# =============================================================================
# build-chromium.sh — Build Chromium 157.0.8080.0 headless_shell (x86_64)
#
# Runs INSIDE the Docker container (Ubuntu 22.04).
# Targets regular Linux distros (Debian/Ubuntu) — no system libs bundled.
#
# SIMPLIFIED vs ARM64: No LLVM bootstrap needed — uses pre-built toolchain.
# =============================================================================

CHROME_VERSION="157.0.8080.0"

echo "========================================="
echo "Building Chromium $CHROME_VERSION headless_shell (Linux x86_64)"
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

git config --global http.postBuffer 524288000
git config --global user.email "build@localhost"
git config --global user.name "Build"

mkdir -p /root/chromium
cp /root/dot-gclient /root/chromium/.gclient
cd /root/chromium

echo "Cloning Chromium $CHROME_VERSION (shallow)..."
git clone --depth 1 --branch "$CHROME_VERSION" \
  https://chromium.googlesource.com/chromium/src.git src

cd src
echo "Verifying checkout..."
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
# 4. Patch lastchange.py
# =============================================================================
echo ">>> Step 4: Patch lastchange.py"
cd /root/chromium/src

if [ -f build/util/lastchange.py ]; then
  sed -i "s/git_args = \['log', '-1', '--format=%H %ct'\]/git_args = ['log', '-1', '--format=\"%H %ct\"']/" build/util/lastchange.py
  echo "Patched lastchange.py"
fi

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
# 6. Download pre-built LLVM/Clang (SIMPLIFIED — no bootstrap needed!)
# =============================================================================
echo ">>> Step 6: Download pre-built LLVM/Clang toolchain"
cd /root/chromium/src
python3 tools/clang/scripts/update.py

if [ ! -f "third_party/llvm-build/Release+Asserts/bin/clang" ]; then
  echo "ERROR: Pre-built clang not found!"
  exit 1
fi
echo "Pre-built clang installed successfully"

# Copy libclang.so into rust-toolchain lib for bindgen
LLVM_LIB=/root/chromium/src/third_party/llvm-build/Release+Asserts/lib
mkdir -p /root/chromium/src/third_party/rust-toolchain/lib
cp -P "$LLVM_LIB"/libclang.so* /root/chromium/src/third_party/rust-toolchain/lib/ 2>/dev/null || true
export LIBCLANG_PATH=/root/chromium/src/third_party/rust-toolchain/lib

# =============================================================================
# 7. Verify Node.js x86_64 (bundled build usually works on x64)
# =============================================================================
echo ">>> Step 7: Verify Node.js x86_64"
cd /root/chromium/src

if third_party/node/linux/node-linux-x64/bin/node --version 2>/dev/null; then
  echo "Bundled Node.js works: $(third_party/node/linux/node-linux-x64/bin/node --version)"
else
  # Fallback: download directly using the NODE_VERSION declared in the script.
  NODE_VERSION=$(grep -E '^NODE_VERSION=' third_party/node/update_node_binaries | head -1 | cut -d'"' -f2)
  echo "Falling back to direct download of Node $NODE_VERSION (x64)..."
  cd third_party/node/linux
  rm -rf node-linux-x64
  wget -q "https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}-linux-x64.tar.gz" -O node-x64.tar.gz
  tar xzf node-x64.tar.gz
  mv "node-${NODE_VERSION}-linux-x64" node-linux-x64
  rm -f node-x64.tar.gz
  cd /root/chromium/src
fi

# =============================================================================
# 8. Install Java x86_64
# =============================================================================
echo ">>> Step 8: Install Java x86_64"
cd /root
if [ ! -d "/root/chromium/src/third_party/jdk/current/bin" ]; then
  rm -rf /root/chromium/src/third_party/jdk/current
  wget -q https://github.com/adoptium/temurin11-binaries/releases/download/jdk-11.0.15%2B10/OpenJDK11U-jre_x64_linux_hotspot_11.0.15_10.tar.gz
  tar zxf OpenJDK11U-jre_x64_linux_hotspot_11.0.15_10.tar.gz
  mv jdk-11.0.15+10-jre /root/chromium/src/third_party/jdk/current
  echo "Java installed"
else
  echo "Java already present"
fi

# =============================================================================
# 9. Build Ninja from source (Ubuntu's version may be too old)
# =============================================================================
echo ">>> Step 9: Build and install Ninja"

# Ensure python command exists (Ubuntu 22.04 has python3 only)
ln -sf /usr/bin/python3 /usr/bin/python

cd /root
git clone https://github.com/ninja-build/ninja.git -b v1.8.2
cd ninja
./configure.py --bootstrap
rm -f /root/depot_tools/ninja
ln -s /root/ninja/ninja /root/depot_tools/ninja

# =============================================================================
# 10. Set up build output directory
# =============================================================================
echo ">>> Step 10: Set up build directory"
mkdir -p /root/chromium/src/out/Headless
cp /root/args.gn /root/chromium/src/out/Headless/args.gn

# =============================================================================
# 11. Apply compatibility patches
# =============================================================================
echo ">>> Step 11: Apply compatibility patches"
cd /root/chromium/src

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

if [ -f /root/chromium/src/v8/src/base/platform/platform-posix.cc ]; then
  if ! grep -q 'MFD_CLOEXEC' /root/chromium/src/v8/src/base/platform/platform-posix.cc; then
    sed -i '1i#define MFD_CLOEXEC 0x0001U' /root/chromium/src/v8/src/base/platform/platform-posix.cc
    echo "Patched platform-posix.cc with MFD_CLOEXEC"
  else
    echo "MFD_CLOEXEC already defined — no patch needed"
  fi
fi

for gn_file in content/gpu/BUILD.gn media/gpu/sandbox/BUILD.gn; do
  if [ -f "$gn_file" ] && grep -q '//build/config/linux/dri' "$gn_file"; then
    sed -i 's/configs += \[ "\/\/build\/config\/linux\/dri" \]/    configs += []/g' "$gn_file"
    echo "Patched DRI config in $gn_file"
  fi
done

# =============================================================================
# 12. Use Chromium's bundled Rust toolchain
# =============================================================================
echo ">>> Step 12: Use Chromium's bundled Rust toolchain"
cd /root/chromium/src

# gclient sync installed Chromium's own x86_64 Rust toolchain; keep it intact.
# Since Chromium 157, Blink depends on C++ headers generated by Crubit's
# cc_bindings_from_rs, a rustc driver that rejects crates compiled by any other
# rustc (E0514), so a rustup nightly can no longer replace the bundled rustc.
cat third_party/rust-toolchain/VERSION
third_party/rust-toolchain/bin/rustc -V

# =============================================================================
# 13. Fix GCC paths
# =============================================================================
echo ">>> Step 13: Fix GCC paths"
GCC_DIR=$(find /usr/lib/gcc/x86_64-linux-gnu/ -maxdepth 1 -type d | tail -1)
if [ -n "$GCC_DIR" ] && [ -d "$GCC_DIR" ]; then
  export LIBRARY_PATH="${GCC_DIR}:${LIBRARY_PATH:-}"
  ln -sf "${GCC_DIR}/crtbeginS.o" /usr/lib/crtbeginS.o
  ln -sf "${GCC_DIR}/crtendS.o" /usr/lib/crtendS.o
  echo "Linked GCC CRT objects from $GCC_DIR"
else
  echo "WARNING: Could not find GCC directory"
fi

# =============================================================================
# 14. Generate build files and compile
# =============================================================================
echo ">>> Step 14: gn gen + autoninja"
cd /root/chromium/src

mkdir -p /root/depot_tools/.cipd_bin
# Point depot_tools at the Python 3.11 we symlinked in Step 5.5 (autoninja.py
# requires `StrEnum` from Python 3.11; Ubuntu 22.04 only ships 3.10).
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
# 15. Strip binaries and package as chromium-headless-shell-linux64.zip
# =============================================================================
echo ">>> Step 15: Strip and package"
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
# IMPORTANT — required layout for Remotion's BrowserFetcher:
#   chrome-headless-shell-linux64/chrome-headless-shell
# i.e. the binary inside MUST be named `chrome-headless-shell`, not
# `headless_shell`. `getExecutablePath` for non-AL2023 linux64 looks for
# `chrome-headless-shell`; the post-extract rename loop only fires when the
# binary is named `chrome`, so we have to rename it here at packaging time.
# (See ../README.md → "Output zip layout requirements".)
mkdir -p final/chrome-headless-shell-linux64
cp out/Headless/headless_shell        final/chrome-headless-shell-linux64/chrome-headless-shell
cp out/Headless/libEGL.so             final/chrome-headless-shell-linux64/
cp out/Headless/libGLESv2.so          final/chrome-headless-shell-linux64/
cp out/Headless/libvk_swiftshader.so  final/chrome-headless-shell-linux64/
cp out/Headless/libvulkan.so.1        final/chrome-headless-shell-linux64/
cp out/Headless/vk_swiftshader_icd.json final/chrome-headless-shell-linux64/

cd final
zip -r chromium-headless-shell-linux64.zip chrome-headless-shell-linux64

echo ""
echo "========================================="
echo "BUILD COMPLETE!"
echo "Output: /root/chromium/src/final/chromium-headless-shell-linux64.zip"
echo "========================================="
echo ""
echo "On target system, install runtime deps:"
echo "  sudo apt install -y libnss3 libnspr4 libexpat1 libdbus-1-3 libgbm1 \\"
echo "    libasound2 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \\"
echo "    libxkbcommon0 libx11-6 libxcomposite1 libxdamage1 libxext6 \\"
echo "    libxfixes3 libxrandr2 libpango-1.0-0 libcairo2 fonts-liberation"
