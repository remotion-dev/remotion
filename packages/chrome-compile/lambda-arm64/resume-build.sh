#!/bin/bash
# Runs inside the chrome-build container. Resumes from Step 5 after the
# gperf DEPS patch was applied.
set -euo pipefail

export PATH="$PATH:/root/depot_tools:/usr/local/bin"
export DEPOT_TOOLS_UPDATE=0
export DEPOT_TOOLS_BOOTSTRAP_PYTHON3=0

echo ">>> (resume) Step 5: gclient sync"
cd /root/chromium/src
gclient sync -D --no-history --shallow --force --reset
gclient runhooks

echo ">>> (resume) Step 6: Replace Node.js with aarch64"
cd /root/chromium/src
if [ -d third_party/node/linux/node-linux-x64 ] && [ ! -L third_party/node/linux/node-linux-x64 ]; then
  sed -i 's@update_unix "darwin-x64" "mac"@# update_unix "darwin-x64" "mac"@g' third_party/node/update_node_binaries || true
  sed -i 's@update_unix "darwin-arm64" "mac"@# update_unix "darwin-arm64" "mac"@g' third_party/node/update_node_binaries || true
  sed -i 's@update_unix "linux-x64" "linux"@update_unix "linux-arm64" "linux"@g' third_party/node/update_node_binaries || true
  ./third_party/node/update_node_binaries || true
  rm -rf third_party/node/linux/node-linux-x64
  ln -sf /root/chromium/src/third_party/node/linux/node-linux-arm64 /root/chromium/src/third_party/node/linux/node-linux-x64
fi

echo ">>> (resume) Step 7: Replace Java with aarch64"
cd /root
if [ ! -d /root/chromium/src/third_party/jdk/current ] || [ ! -f /root/chromium/src/third_party/jdk/current/bin/java ]; then
  rm -rf /root/chromium/src/third_party/jdk/current
  if [ ! -f OpenJDK11U-jre_aarch64_linux_hotspot_11.0.15_10.tar.gz ]; then
    wget -q https://github.com/adoptium/temurin11-binaries/releases/download/jdk-11.0.15%2B10/OpenJDK11U-jre_aarch64_linux_hotspot_11.0.15_10.tar.gz
  fi
  tar zxf OpenJDK11U-jre_aarch64_linux_hotspot_11.0.15_10.tar.gz
  mv jdk-11.0.15+10-jre /root/chromium/src/third_party/jdk/current
fi

echo ">>> (resume) Step 8: Install CMake"
if ! command -v cmake >/dev/null || ! cmake --version | head -1 | grep -q "3.23"; then
  cd /root
  if [ ! -f cmake-3.23.0.tar.gz ]; then
    wget -q https://cmake.org/files/v3.23/cmake-3.23.0.tar.gz
  fi
  tar -xzf cmake-3.23.0.tar.gz
  cd cmake-3.23.0
  ./bootstrap
  make -j$(nproc)
  make install
fi
export PATH="$PATH:/usr/local/bin"

echo ">>> (resume) Step 9: Build and install Ninja"
if [ ! -x /root/ninja/ninja ]; then
  cd /root
  [ -d ninja ] || git clone https://github.com/ninja-build/ninja.git -b v1.8.2
  cd ninja
  ./configure.py --bootstrap
fi
rm -f /root/depot_tools/ninja
ln -sf /root/ninja/ninja /root/depot_tools/ninja

echo ">>> (resume) Step 10: Build LLVM/Clang"
cd /root/chromium/src

# Apply all the patches to tools/clang/scripts/build.py that were in the main script.
sed -i "s#dirs.lib_dir, 'libxml2.a'#os.path.join(dirs.install_dir, 'lib64'), 'libxml2.a'#g" tools/clang/scripts/build.py
sed -i "s/ *'-DLLVM_ENABLE_LLD=ON',//" tools/clang/scripts/build.py
python3 -c "
import re
with open('tools/clang/scripts/build.py', 'r') as f:
    content = f.read()
content = re.sub(r'  if args\.with_ml_inlin.*?(?=\n  [a-z]|\n  #|\nif |\ndef )', '', content, flags=re.DOTALL)
with open('tools/clang/scripts/build.py', 'w') as f:
    f.write(content)
" 2>/dev/null || echo "ML inline model block not found or already removed"
sed -i "s/self\.lib_dir = os\.path\.join(self\.install_dir, 'lib')/self\.lib_dir = os\.path\.join(self\.build_dir, 'lib')/g" tools/clang/scripts/build.py
sed -i "s/cxxflags = \[\]/cxxflags = ['-lrt', '-lpthread']/g" tools/clang/scripts/build.py
sed -i "s/bootstrap_targets = 'X86'/bootstrap_targets = 'ARM;AArch64'/g" tools/clang/scripts/build.py

python3 - <<'PY'
import re
p = 'tools/clang/scripts/build.py'
with open(p) as f:
    src = f.read()
src = re.sub(r"\s*f?'-DLLVM_ENABLE_PIC=\{?pic_mode\}?',?", '', src)
if "-DLLVM_ENABLE_PIC=OFF" not in src:
    src = src.replace("bootstrap_args = [",
        "bootstrap_args = [\n      '-DLLVM_ENABLE_PIC=OFF',", 1)
if "-DCMAKE_POSITION_INDEPENDENT_CODE=ON" not in src:
    src = src.replace("cmake_args = base_cmake_args + [",
        "cmake_args = base_cmake_args + [\n      '-DLLVM_ENABLE_PIC=ON',\n      '-DCMAKE_POSITION_INDEPENDENT_CODE=ON',", 1)
with open(p, 'w') as f:
    f.write(src)
print("Applied PIC patches to build.py")
PY

python3 -c "
with open('tools/clang/scripts/build.py', 'r') as f:
    content = f.read()
for triple in ['i386-unknown-linux-gnu', 'armv7-unknown-linux-gnueabihf', 'x86_64-unknown-linux-gnu']:
    import re
    pattern = rf\"  runtimes_triples_args\['{triple}'\].*?(?=\n  runtimes_triples_args|\n  return|\n  #|\Z)\"
    content = re.sub(pattern, '', content, flags=re.DOTALL)
with open('tools/clang/scripts/build.py', 'w') as f:
    f.write(content)
" 2>/dev/null || echo "Triple removal: some triples may not exist"

export LD_LIBRARY_PATH="${LD_LIBRARY_PATH:-}:/lib64"

./tools/clang/scripts/build.py \
  --without-android \
  --without-fuchsia \
  --use-system-cmake \
  --host-cc /bin/clang \
  --host-cxx /bin/clang++ \
  --bootstrap || echo "LLVM build exited non-zero (expected: libclang-cpp.so link fails after libclang.so succeeds)"

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

echo ">>> (resume) Step 11: Set up build directory"
mkdir -p /root/chromium/src/out/Headless
cp /root/args.gn /root/chromium/src/out/Headless/args.gn

echo ">>> (resume) Step 12: Apply compatibility patches"
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

echo ">>> (resume) Step 13: Install Rust"
cd /root/chromium/src
# Chromium 149 commit date is 2026-04-13
CHROMIUM_COMMIT_YMD=$(cd /root/chromium/src && git log -n 1 --pretty=format:%cd --date=format:%Y-%m-%d)
echo "Chromium commit date: $CHROMIUM_COMMIT_YMD"
RUST_VERSION_FILE="third_party/rust-toolchain/VERSION"
if [ -f "$RUST_VERSION_FILE" ]; then
  echo "Chromium expects Rust toolchain: $(cat $RUST_VERSION_FILE | head -1)"
fi
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

echo ">>> (resume) Step 14: Fix GCC paths"
GCC_DIR=$(find /usr/lib/gcc/aarch64-amazon-linux/ -maxdepth 1 -type d 2>/dev/null | tail -1)
if [ -n "$GCC_DIR" ] && [ -d "$GCC_DIR" ]; then
  export LIBRARY_PATH="${GCC_DIR}:${LIBRARY_PATH:-}"
  ln -sf "${GCC_DIR}/crtbeginS.o" /usr/lib/crtbeginS.o
  ln -sf "${GCC_DIR}/crtendS.o" /usr/lib/crtendS.o
fi

echo ">>> (resume) Step 15: gn gen + autoninja"
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

echo ">>> (resume) Step 16: Strip and package"
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
