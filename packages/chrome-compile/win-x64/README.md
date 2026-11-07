# Chromium 158 headless_shell — Windows x64

Builds Chromium **158.0.8127.2** (commit `681cd621e82e606d7536eae8ea2576afb3c7d65c`) `headless_shell` for Windows x64 with proprietary codecs (H.264/AAC), PDF/printing support, and the Remotion v3 shared-memory capture patch applied.

For EC2 launches, set `SSH_CIDR` to the public IPv4 range allowed to connect (normally your address with `/32`).

## Overview

- **Target**: Windows 10 / Windows Server 2016 and newer, x86_64
- **Output**: `chromium-headless-shell-win64.zip` containing
  `chrome-headless-shell-win64/chrome-headless-shell.exe` (renamed from
  `headless_shell.exe` at packaging time to match Remotion's `BrowserFetcher`;
  see top-level `README.md` → "Output zip layout requirements")
- **Build environment**: Windows Server 2025, Visual Studio 2026 Build Tools
  18.11.2 (MSVC 14.51), Windows 11 SDK 10.0.28000 with Debugging Tools,
  Chromium's bundled clang-cl and Rust toolchain
- **Instance**: `c6i.16xlarge` (64 vCPU, 128 GiB RAM), 300 GiB gp3, eu-central-1

## Capture behavior on Windows

The v3 patch implements frame pools with POSIX shared memory and `mmap`, so its
pool backends are compiled only on macOS and Linux. The Windows binary still
contains the patched DevTools protocol: `Page.remotionCreateFramePool` answers
`Raw frames are only supported on macOS/Linux`, which Remotion's renderer
treats as "capability unavailable" and falls back to ordinary JPEG/PNG
screenshots. Remotion's Windows FFmpeg has no `remotionshm` device either, so
the renderer never requests a pool on Windows.

`probe-fast-path.py` therefore checks two things on Windows before packaging:
that the pool request fails with exactly that capability error, and that an
ordinary PNG `Page.captureScreenshot` of the emulated viewport succeeds. The
probe output is recorded in `artifacts/fast-path-probe.json`:

```json
{"supported":false,"method":"Page.remotionCreateFramePool","error":"Raw frames are only supported on macOS/Linux","fallbackCapture":"png","width":64,"height":64}
```

## Files

| File                 | Purpose                                                                                                   |
| -------------------- | --------------------------------------------------------------------------------------------------------- |
| `launch-ec2.sh`      | Launches a Windows Server 2025 instance whose user data enables OpenSSH with the generated RSA key pair   |
| `setup-ec2.ps1`      | Runs over SSH on the host; starts `build-chromium.ps1` as a scheduled task so it survives the SSH session |
| `build-chromium.ps1` | Installs the toolchain, fetches pinned depot_tools and Chromium, patches, builds, probes, and packages    |
| `args.gn`            | Windows GN args: official build, DCHECKs off, proprietary codecs, embedded resources                      |

The build also uses [`../mac-arm64/remotion-shared-memory-v3.patch`](../mac-arm64/remotion-shared-memory-v3.patch) and [`../mac-arm64/probe-fast-path.py`](../mac-arm64/probe-fast-path.py).

## Quick start

```bash
export SSH_CIDR="$(curl -fsS https://checkip.amazonaws.com)/32"
./launch-ec2.sh
```

The script writes the instance, security group, key, and IP to the ignored
`launch-state.env` file and prints the exact copy/build commands. Windows takes
several minutes to boot and run the user data before SSH accepts connections.

```bash
source launch-state.env
scp -i "$KEY_FILE" args.gn build-chromium.ps1 setup-ec2.ps1 \
  ../mac-arm64/remotion-shared-memory-v3.patch ../mac-arm64/probe-fast-path.py \
  "Administrator@$PUBLIC_IP:C:/chrome-build/"
ssh -i "$KEY_FILE" "Administrator@$PUBLIC_IP" \
  'powershell -NoProfile -ExecutionPolicy Bypass -File C:\chrome-build\setup-ec2.ps1'
```

Follow the build with
`ssh -i "$KEY_FILE" "Administrator@$PUBLIC_IP" 'Get-Content C:\chrome-build\build.log -Tail 20'`.
It prints `BUILD COMPLETE!` or `BUILD FAILED` at the end. A failed build can be
restarted with `setup-ec2.ps1`; completed steps (toolchain, depot_tools,
checkout, `gclient sync`) are skipped and Ninja reuses existing objects.

Copy the result and terminate the instance:

```bash
mkdir -p artifacts ../output
scp -i "$KEY_FILE" "Administrator@$PUBLIC_IP:C:/chrome-build/output/chromium-headless-shell-win64.zip" ../output/
scp -i "$KEY_FILE" "Administrator@$PUBLIC_IP:C:/chrome-build/artifacts/{manifest.json,SHA256SUMS,fast-path-probe.json,browser-version.txt}" artifacts/
scp -i "$KEY_FILE" "Administrator@$PUBLIC_IP:C:/chrome-build/build.log" artifacts/
aws ec2 terminate-instances --region "$REGION" --instance-ids "$INSTANCE_ID"
aws ec2 wait instance-terminated --region "$REGION" --instance-ids "$INSTANCE_ID"
aws ec2 delete-security-group --region "$REGION" --group-id "$SECURITY_GROUP_ID"
aws ec2 delete-key-pair --region "$REGION" --key-name "$KEY_NAME"
```

## Build steps

`build-chromium.ps1` runs as SYSTEM and:

1. Installs the Visual Studio 2026 Build Tools (`Microsoft.VisualStudio.Workload.VCTools`, `VC.ATLMFC`, `Windows11SDK.28000`) from the pinned 18.11.2 bootstrapper, then adds the Windows SDK Debugging Tools with the standalone `winsdksetup.exe`, which `vs_toolchain.py` requires for `dbghelp.dll`. Chromium 158 requires Visual Studio 2026 and SDK 10.0.28000; `DEPOT_TOOLS_WIN_TOOLCHAIN=0` makes it use this local installation.
2. Unpacks MinGit 2.56.0.4 to `C:\chrome-build\git` (depot_tools no longer bundles Git on Windows and only recognizes installations under a directory named `git`) and adds git-lfs 3.8.1 next to it (MinGit's system config routes LFS-tracked files such as `third_party/litert` through `git-lfs`, which MinGit does not ship), then unpacks `depot_tools.zip`, bootstraps it, and pins it to commit `3218cfc968b246bf2498fd13f707851a0b1cd408`, the last depot_tools commit before the Chromium tag.
3. Clones the `158.0.8127.2` tag with `--depth 1`, verifies the commit, and runs `gclient sync` / `gclient runhooks` with `target_os = ["win"]` and the same small checkout configuration as the macOS recipe.
4. Applies the shared-memory capture patch and generates `out\Headless` from `args.gn`. The resolved GN args must contain `is_debug = false`, `dcheck_always_on = false`, `is_official_build = true`, and `proprietary_codecs = true`.
5. Compiles the patched `page_handler.cc` objects first so a patch error fails within minutes, then builds `headless_shell`.
6. Packages the executable and its runtime dependencies (`gn desc ... runtime_deps`) into `chrome-headless-shell-win64\`, skipping PDBs and generated DevTools frontend sources, writes `manifest.json` (settings, toolchain versions, per-file SHA-256), runs the Windows probe, and zips with forward-slash paths.

## Build configuration

`args.gn` imports `//build/args/headless.gn` and sets `is_official_build = true`
(ThinLTO), `dcheck_always_on = false`, `symbol_level = 0`, `chrome_pgo_phase = 0`
and `enable_resource_allowlist_generation = false`. Resources are embedded
(`headless_use_embedded_resources = true`, `icu_use_data_file = false`), so the
package contains no `.pak` or `icudtl.dat` files. Desktop Windows builds link
the CRT statically, so no Visual C++ runtime DLLs are shipped.

## Testing

```powershell
Expand-Archive chromium-headless-shell-win64.zip -DestinationPath .
.\chrome-headless-shell-win64\chrome-headless-shell.exe --headless --dump-dom https://example.com
```

## Version

- **Chromium**: 158.0.8127.2 (commit `681cd621e82e606d7536eae8ea2576afb3c7d65c`)
- **depot_tools**: `3218cfc968b246bf2498fd13f707851a0b1cd408`
- **Visual Studio**: 2026 Build Tools 18.11.2, MSVC 14.51.36231
- **Windows SDK**: 10.0.28000.0
- **LLVM**: Chromium's bundled `llvmorg-24-init-14453-ge063be79`
- **Rust**: Chromium's bundled toolchain (`8a9dd7abdf013ec10cfeaaa3685feba18ef1c90c`)
