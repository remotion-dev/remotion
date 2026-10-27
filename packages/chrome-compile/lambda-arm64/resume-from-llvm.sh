#!/bin/bash
# Resume build from Step 10 (LLVM). Assumes:
#  - Chromium source at /root/chromium/src
#  - depot_tools at /root/depot_tools
#  - Java, CMake, Ninja already installed
#  - DEPS gperf patched
#  - build.py already patched (via patch-build-py.py + PIC OFF in bootstrap)
set -uo pipefail

export PATH="$PATH:/root/depot_tools:/usr/local/bin"
export DEPOT_TOOLS_UPDATE=0
export DEPOT_TOOLS_BOOTSTRAP_PYTHON3=0
export LD_LIBRARY_PATH="${LD_LIBRARY_PATH:-}:/lib64"

cd /root/chromium/src

echo "============================================="
echo ">>> Step 10: Build LLVM/Clang"
echo "============================================="
./tools/clang/scripts/build.py \
  --without-android \
  --without-fuchsia \
  --use-system-cmake \
  --host-cc /bin/clang \
  --host-cxx /bin/clang++ \
  --bootstrap
LLVM_EXIT=$?
echo "LLVM build exit code: $LLVM_EXIT (nonzero expected if libclang-cpp.so link fails after libclang.so)"

LLVM_LIB=/root/chromium/src/third_party/llvm-build/Release+Asserts/lib
mkdir -p /root/chromium/src/third_party/rust-toolchain/lib
if ls "$LLVM_LIB"/libclang.so* >/dev/null 2>&1; then
  cp -P "$LLVM_LIB"/libclang.so* /root/chromium/src/third_party/rust-toolchain/lib/
  echo "Copied libclang.so* -> third_party/rust-toolchain/lib/"
else
  echo "ERROR: no libclang.so* found in $LLVM_LIB"
  exit 1
fi
export LIBCLANG_PATH=/root/chromium/src/third_party/rust-toolchain/lib
export LD_LIBRARY_PATH="${LIBCLANG_PATH}:${LD_LIBRARY_PATH:-}"

# Back to strict mode from here.
set -e

echo "============================================="
echo ">>> Step 11-12: out dir + compat patches"
echo "============================================="
mkdir -p /root/chromium/src/out/Headless
cp /root/args.gn /root/chromium/src/out/Headless/args.gn

if ! grep -q 'F_LINUX_SPECIFIC_BASE' /usr/include/fcntl.h 2>/dev/null; then
  cat >> /usr/include/fcntl.h <<'EOF'
#ifndef F_LINUX_SPECIFIC_BASE
#define F_LINUX_SPECIFIC_BASE 1024
#endif
#define F_ADD_SEALS (F_LINUX_SPECIFIC_BASE + 9)
#define F_GET_SEALS (F_LINUX_SPECIFIC_BASE + 10)
#define F_SEAL_SEAL 0x0001
#define F_SEAL_SHRINK 0x0002
#define F_SEAL_GROW 0x0004
#define F_SEAL_FUTURE_WRITE 0x0010
EOF
fi
if [ -f /root/chromium/src/v8/src/base/platform/platform-posix.cc ]; then
  if ! grep -q 'MFD_CLOEXEC' /root/chromium/src/v8/src/base/platform/platform-posix.cc; then
    sed -i '1i#define MFD_CLOEXEC 0x0001U' /root/chromium/src/v8/src/base/platform/platform-posix.cc
  fi
fi
for gn_file in content/gpu/BUILD.gn media/gpu/sandbox/BUILD.gn; do
  if [ -f "$gn_file" ] && grep -q '//build/config/linux/dri' "$gn_file"; then
    sed -i 's/configs += \[ "\/\/build\/config\/linux\/dri" \]/    configs += []/g' "$gn_file"
  fi
done

echo "============================================="
echo ">>> Step 13: Install Rust nightly"
echo "============================================="
cd /root/chromium/src
CHROMIUM_COMMIT_YMD=$(git log -n 1 --pretty=format:%cd --date=format:%Y-%m-%d)
echo "Chromium commit date: $CHROMIUM_COMMIT_YMD"
rm -f ./third_party/rust-toolchain/bin/rustc 2>/dev/null || true
if [ ! -x "$HOME/.cargo/bin/rustup" ]; then
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --no-modify-path
fi
source "$HOME/.cargo/env"
RUST_NIGHTLY_DATE="${RUST_NIGHTLY_DATE:-${CHROMIUM_COMMIT_YMD:-2026-04-13}}"
echo "Using Rust nightly: $RUST_NIGHTLY_DATE"
rustup install "nightly-${RUST_NIGHTLY_DATE}"
rustup default "nightly-${RUST_NIGHTLY_DATE}"
RUSTC_ACTUAL=$(rustup which rustc)
ln -sf "$RUSTC_ACTUAL" ./third_party/rust-toolchain/bin/rustc
cargo install bindgen-cli 2>/dev/null || cargo install bindgen-cli --version 0.71.1 || true
RUSTFMT_ACTUAL=$(rustup which rustfmt 2>/dev/null || which rustfmt || true)
[ -n "${RUSTFMT_ACTUAL:-}" ] && ln -sf "$RUSTFMT_ACTUAL" ./third_party/rust-toolchain/bin/rustfmt || true
BINDGEN_BIN=$(which bindgen || true)
[ -n "$BINDGEN_BIN" ] && ln -sf "$BINDGEN_BIN" ./third_party/rust-toolchain/bin/bindgen || true

echo "============================================="
echo ">>> Step 14: Fix GCC paths"
echo "============================================="
GCC_DIR=$(find /usr/lib/gcc/aarch64-amazon-linux/ -maxdepth 1 -type d 2>/dev/null | tail -1)
if [ -n "$GCC_DIR" ] && [ -d "$GCC_DIR" ]; then
  export LIBRARY_PATH="${GCC_DIR}:${LIBRARY_PATH:-}"
  ln -sf "${GCC_DIR}/crtbeginS.o" /usr/lib/crtbeginS.o
  ln -sf "${GCC_DIR}/crtendS.o" /usr/lib/crtendS.o
fi

echo "============================================="
echo ">>> Step 15: Python3.11 + depot_tools + gn gen + autoninja"
echo "============================================="
cd /root/chromium/src
VPYTHON3=$(find /root/.cache/vpython-root.0/store -name python3.11 -path "*/bin/python3.11" 2>/dev/null | head -1)
if [ -n "$VPYTHON3" ] && [ -x "$VPYTHON3" ]; then
  ln -sf "$VPYTHON3" /usr/local/bin/python3
  ln -sf "$VPYTHON3" /usr/local/bin/python
  echo "Using vpython Python 3.11: $VPYTHON3"
fi
mkdir -p /root/depot_tools/.cipd_bin
ln -sf /usr/local/bin/python3 /root/depot_tools/.cipd_bin/python3
echo ".cipd_bin" > /root/depot_tools/python3_bin_reldir.txt

export LIBCLANG_PATH=/root/chromium/src/third_party/rust-toolchain/lib
export LD_LIBRARY_PATH="${LIBCLANG_PATH}:${LD_LIBRARY_PATH:-}"

gn gen out/Headless
autoninja -C out/Headless headless_shell

echo "============================================="
echo ">>> Step 16: Strip + package"
echo "============================================="
cd /root/chromium/src
strip -o out/Headless/headless_shell out/Headless/headless_shell
strip -o out/Headless/libEGL.so out/Headless/libEGL.so
strip -o out/Headless/libGLESv2.so out/Headless/libGLESv2.so
strip -o out/Headless/libvk_swiftshader.so out/Headless/libvk_swiftshader.so
strip -o out/Headless/libvulkan.so.1 out/Headless/libvulkan.so.1

# Required layout: chromium-headless-shell-amazon-linux2023-arm64/<files>
# (See ../README.md → "Output zip layout requirements".)
OUTPUT_DIR="chromium-headless-shell-amazon-linux2023-arm64"
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
