#!/bin/bash
# Continue the build from gn gen onward. Assumes:
#  - LLVM built, libclang.so copied
#  - Rust installed (nightly)
#  - Python 3.11 symlinked to /usr/local/bin/python3
#  - depot_tools set up
set -euo pipefail

export PATH="$PATH:/root/.cargo/bin:/root/depot_tools:/usr/local/bin"
export DEPOT_TOOLS_UPDATE=0
export DEPOT_TOOLS_BOOTSTRAP_PYTHON3=0
export LIBCLANG_PATH=/root/chromium/src/third_party/rust-toolchain/lib
export LD_LIBRARY_PATH="${LIBCLANG_PATH}:/lib64:${LD_LIBRARY_PATH:-}"

cd /root/chromium/src

# Fix GCC paths (idempotent).
GCC_DIR=$(find /usr/lib/gcc/aarch64-amazon-linux/ -maxdepth 1 -type d 2>/dev/null | tail -1)
if [ -n "$GCC_DIR" ] && [ -d "$GCC_DIR" ]; then
  export LIBRARY_PATH="${GCC_DIR}:${LIBRARY_PATH:-}"
  ln -sf "${GCC_DIR}/crtbeginS.o" /usr/lib/crtbeginS.o
  ln -sf "${GCC_DIR}/crtendS.o" /usr/lib/crtendS.o
fi

# Make sure Python 3.11 is still used.
VPYTHON3=$(find /root/.cache/vpython-root.0/store -name python3.11 -path "*/bin/python3.11" 2>/dev/null | head -1)
if [ -n "$VPYTHON3" ]; then
  ln -sf "$VPYTHON3" /usr/local/bin/python3
  ln -sf "$VPYTHON3" /usr/local/bin/python
fi
mkdir -p /root/depot_tools/.cipd_bin
ln -sf /usr/local/bin/python3 /root/depot_tools/.cipd_bin/python3
echo ".cipd_bin" > /root/depot_tools/python3_bin_reldir.txt

echo "============================================="
echo ">>> gn gen + autoninja"
echo "============================================="
mkdir -p out/Headless
cp /root/args.gn out/Headless/args.gn

gn gen out/Headless
autoninja -C out/Headless headless_shell

echo "============================================="
echo ">>> Strip + package"
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
rm -rf final
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
  fi
done

for libgcc in /lib64/libgcc_s-*.so.1 /usr/lib64/libgcc_s-*.so.1 /lib64/libgcc_s.so.1 /usr/lib64/libgcc_s.so.1; do
  if [ -f "$libgcc" ]; then
    cp "$libgcc" "final/${OUTPUT_DIR}/$(basename "$libgcc")"
    break
  fi
done

cd final
zip -r "${OUTPUT_DIR}.zip" "${OUTPUT_DIR}"
ls -lh "${OUTPUT_DIR}.zip"
echo ""
echo "========================================="
echo "BUILD COMPLETE!"
echo "Output: /root/chromium/src/final/${OUTPUT_DIR}.zip"
echo "========================================="
