# Chromium 157 shared-memory headless shell — macOS ARM64

This directory builds Chromium **157.0.8080.0** at commit
`ab28d45abdcf95062bcb97d82e8a01b662d7cbdf` for Apple Silicon. It applies the
Remotion **v3** shared-memory capture patch and enables proprietary H.264/AAC
codecs. It does not select or require a VideoToolbox encoder.

The recipe was validated on an EC2 `mac-m4.metal` host running macOS 26.6.2,
Command Line Tools 26.6, and the macOS 26.5 SDK (the version Chromium 157 pins
as `mac_sdk_official_version`). The deployment target is macOS 13.0, Chromium
157's default; Chromium no longer builds for macOS 12.

## Output contract

The build produces `../output/chromium-headless-shell-mac-arm64.zip`, matching
the other platform recipes, with the layout consumed directly by Remotion's
`BrowserFetcher`:

```text
chrome-headless-shell-mac-arm64/
├── chrome-headless-shell
├── Helpers/
├── icudtl.dat
├── *.dylib
└── *.pak
```

The upload-time name for Chromium 157 is
`chromium-headless-shell-mac-arm64-157.0.8080.0.zip`.

## Files

| File                              | Purpose                                                                                                    |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `launch-ec2.sh`                   | Allocates an EC2 M4 Mac Dedicated Host and instance                                                        |
| `setup-ec2.sh`                    | Checks the native macOS toolchain and starts the build                                                     |
| `build-chromium.sh`               | Fetches pinned inputs, patches, builds, signs, probes, and packages Chromium                               |
| `args.gn`                         | ARM64, codec, SDK, and headless build settings                                                             |
| `apply-clt-support.py`            | Makes Chromium 157 use Apple's Command Line Tools installation honestly                                    |
| `remotion-shared-memory-v3.patch` | Adds the private shared-memory CDP transport, the viewport fast path, and the v3 file-backed pool fallback |
| `probe-fast-path.py`              | Invokes `Page.remotionCreateFramePool` against a built browser                                             |

The v3 patch, rebased onto Chromium 157, has SHA-256
`eaa4a8d5cb88c27bf78c3eb4d935491ca0118e1d8302a748f497c61a5a147f6a`. It
supersedes v2 (`91dd0b5a…`) by adding the `backingDirectory`/`preferredBackend`
parameters and the `backend` result on `Page.remotionCreateFramePool`, which
lets hosts without POSIX shared memory (AWS Lambda) use file-backed pools.
The rebase changed no patch logic; only the two DevTools protocol method lists
(`protocol_config.json`, `inspector_protocol_config.json`) needed new context.
The build pins depot_tools at
`9b264039190fa270f3fc44779b4e26b43008ba41`, the last commit before the
157.0.8080.0 branch point.

Chromium 157 reformatted its Python tooling and now always runs
`build/config/apple/sdk_info.py --get_sdk_info --create_symlink_at` when
`use_system_xcode = true`, so `apply-clt-support.py` targets 157's
`sdk_info.py`/`find_sdk.py` and reports the Command Line Tools directories for
the platform and toolchain paths it symlinks. `headless_use_policy` was removed
from `args.gn` because Chromium 157 no longer declares it.

## Build on an existing Apple Silicon Mac

The host needs macOS 26, Command Line Tools 26.6, at least 250 GB of free disk,
and a build path without spaces. Run:

```bash
CHROMIUM_BUILD_JOBS=8 ./setup-ec2.sh
```

Downloaded source, dependencies, and object files are retained in `.build/` so
a retry or patch-only rebuild can reuse them. Set `REMOTION_BUILD_ROOT` to put
that cache elsewhere, or `REMOTION_OUTPUT_DIR` to override the repository's
top-level `output/` directory.

The build script:

1. Pins Chromium and depot_tools by commit.
2. Applies the Command Line Tools compatibility changes and the v3 patch.
3. Generates the `headless_shell` build with `proprietary_codecs = true` and
   `ffmpeg_branding = "Chrome"`.
4. Compiles the changed screenshot handler first, then the complete browser.
5. Packages every GN runtime dependency, ad-hoc signs Mach-O files when needed,
   and emits a SHA-256 manifest.
6. Starts the packaged browser and, for both the `auto` (POSIX shm) and the
   forced `file` backend, creates a pool, captures one raw frame through the
   `viewport-redraw` path, releases it, and destroys the pool; the build fails
   if any step fails or a pool file is left behind.
7. Omits host-specific zip metadata and uses the expected folder and binary
   names.

## Launch an EC2 M4 Mac

EC2 Mac instances run on Dedicated Hosts with a **24-hour minimum host
allocation**. Terminating the instance early does not remove that minimum. The
launch script defaults to the same Frankfurt availability zone, AMI, instance
type, and 250 GiB encrypted gp3 volume used for the validated build.

Set the one public address that may use SSH, then launch:

```bash
export SSH_CIDR="$(curl -fsS https://checkip.amazonaws.com)/32"
./launch-ec2.sh
```

The script writes the host, instance, security group, key, and IP to the ignored
`launch-state.env` file and prints the exact copy/build commands. Override
`AWS_REGION`, `AVAILABILITY_ZONE`, `AMI_ID`, `VPC_ID`, or `SUBNET_ID` when your
account or region differs. The default AMI is deliberately pinned for build
reproducibility; select a compatible macOS 26 ARM64 AMI when it is no longer
available.

Copy the resulting zip, manifest, checksum, build log, and probe report before
terminating the instance. The launch instructions place the mac directory at
`~/remotion-chromium-mac-arm64`, so its homogenized output directory is
`~/output`:

```bash
source launch-state.env
mkdir -p artifacts ../output
scp -i "$KEY_FILE" \
  "ec2-user@$PUBLIC_IP:output/chromium-headless-shell-mac-arm64.zip" \
  ../output/
scp -i "$KEY_FILE" \
  "ec2-user@$PUBLIC_IP:remotion-chromium-mac-arm64/artifacts/manifest.json" \
  "ec2-user@$PUBLIC_IP:remotion-chromium-mac-arm64/artifacts/SHA256SUMS" \
  "ec2-user@$PUBLIC_IP:remotion-chromium-mac-arm64/artifacts/build-v3.log" \
  "ec2-user@$PUBLIC_IP:remotion-chromium-mac-arm64/artifacts/fast-path-probe.json" \
  ./artifacts/

aws ec2 terminate-instances --region "$REGION" --instance-ids "$INSTANCE_ID"
aws ec2 wait instance-terminated --region "$REGION" --instance-ids "$INSTANCE_ID"
aws ec2 release-hosts --region "$REGION" --host-ids "$HOST_ID"
```

If `release-hosts` reports that the host is still within its minimum allocation,
retry it after 24 hours from allocation. Remove the temporary security group and
key pair after the host is released.

## Verify before publishing

The build already runs the capability probe. Repeat the artifact checks after
copying it locally:

```bash
(cd ../output && shasum -a 256 -c ../mac-arm64/artifacts/SHA256SUMS)
unzip -tq ../output/chromium-headless-shell-mac-arm64.zip
verification_dir="$(mktemp -d)"
unzip -q ../output/chromium-headless-shell-mac-arm64.zip \
  -d "$verification_dir"
codesign --verify --strict \
  "$verification_dir/chrome-headless-shell-mac-arm64/chrome-headless-shell"
python3 probe-fast-path.py \
  "$verification_dir/chrome-headless-shell-mac-arm64/chrome-headless-shell"
```

The probe prints:

```json
{"supported":true,"method":"Page.remotionCreateFramePool","slotCount":1,"slotCapacity":16448,"capturePath":"viewport-redraw","autoBackend":"posix-shm","fileBackend":"file"}
```

Runtime consumers must still probe the command before using the fast path.
Unpatched Chrome responds with a CDP "method not found" error; that result must
select the ordinary screenshot path so custom vanilla Chrome executables remain
supported.
