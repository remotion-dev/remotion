import { Sandbox } from "@vercel/sandbox";

const GLIBC_DIR = "/tmp/glibc235";
const LIBC6_DEB_URL =
  "https://launchpadlibrarian.net/612471225/libc6_2.35-0ubuntu3.1_amd64.deb";

/**
 * Remotion does not officially support glibc 2.34, but it can be patched.
 *
 * Vercel Sandbox runs Amazon Linux 2023 which ships glibc 2.34,
 * but the compositor binary requires glibc 2.35.
 * We download Ubuntu 22.04's libc6 package and use patchelf to
 * point the compositor at the bundled glibc.
 *
 * Only the `remotion` binary needs patching — ffmpeg/ffprobe work fine on glibc 2.34.
 */
export async function patchCompositor({
  sandbox,
}: {
  sandbox: Sandbox;
}): Promise<void> {
  const script = `
set -euo pipefail

echo "[patch-compositor] Listing node_modules/@remotion/:"
ls -la node_modules/@remotion/ 2>&1 || echo "(directory does not exist)"

echo "[patch-compositor] Checking .pnpm store for compositor packages:"
ls -la node_modules/.pnpm/@remotion+compositor-linux* 2>&1 || echo "(none found in .pnpm)"

echo "[patch-compositor] Checking for compositor directories..."
for dir in node_modules/@remotion/compositor-linux-x64-gnu; do
  if [ -e "$dir" ]; then
    echo "[patch-compositor] Found: $dir ($(stat -c '%F' "$dir" 2>/dev/null || file "$dir"))"
    if [ -L "$dir" ]; then
      echo "[patch-compositor] Symlink target: $(readlink -f "$dir")"
    fi
    echo "[patch-compositor] Contents:"
    find -L "$dir" -type f 2>&1 || true
  else
    echo "[patch-compositor] Not found: $dir"
  fi
done

COMPOSITOR_BIN=""
# Search with -L to follow pnpm symlinks
for dir in node_modules/@remotion/compositor-linux-x64-gnu; do
  if [ -e "$dir" ]; then
    COMPOSITOR_BIN="$(find -L "$dir" -name remotion -type f | head -1)"
    [ -n "$COMPOSITOR_BIN" ] && break
  fi
done

# Fallback: search the pnpm store directly
if [ -z "$COMPOSITOR_BIN" ]; then
  echo "[patch-compositor] Trying pnpm store fallback..."
  COMPOSITOR_BIN="$(find -L node_modules/.pnpm -path '*compositor-linux-x64*' -name remotion -type f 2>/dev/null | head -1)"
fi

if [ -z "$COMPOSITOR_BIN" ]; then
  echo "[patch-compositor] ERROR: Compositor binary not found"
  exit 1
fi

echo "[patch-compositor] Found compositor binary: $COMPOSITOR_BIN"

# Download and extract glibc 2.35 from Ubuntu 22.04
echo "[patch-compositor] Downloading glibc 2.35..."
mkdir -p ${GLIBC_DIR}
cd /tmp
curl -fsSL -o libc6.deb "${LIBC6_DEB_URL}"
ar x libc6.deb
zstd -d data.tar.zst -o data.tar
tar xf data.tar -C ${GLIBC_DIR} --strip-components=1
rm -f libc6.deb data.tar data.tar.zst control.tar.zst debian-binary

cd -

# Patch the compositor binary
echo "[patch-compositor] Patching binary with patchelf..."
patchelf \\
  --set-interpreter ${GLIBC_DIR}/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2 \\
  --force-rpath \\
  --set-rpath ${GLIBC_DIR}/lib/x86_64-linux-gnu:\\$ORIGIN \\
  "$COMPOSITOR_BIN"

echo "[patch-compositor] Compositor patched successfully"
`;

  const cmd = await sandbox.runCommand({
    cmd: "bash",
    args: ["-c", script],
    detached: true,
  });

  for await (const _log of cmd.logs()) {
    console.log(_log.data);
  }

  const result = await cmd.wait();
  if (result.exitCode !== 0) {
    throw new Error(
      `Failed to patch compositor: ${await result.stderr()} ${await result.stdout()}`,
    );
  }
}
