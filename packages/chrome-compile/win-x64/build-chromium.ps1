# =============================================================================
# build-chromium.ps1 - Build Chromium 158.0.8127.2 headless_shell (Windows x64)
#
# Runs on the Windows build host as SYSTEM through the scheduled task that
# setup-ec2.ps1 registers. Installs the Visual Studio 2026 Build Tools and the
# Windows 11 SDK, fetches pinned depot_tools and Chromium, applies the Remotion
# shared-memory capture patch, builds headless_shell and packages
# output\chromium-headless-shell-win64.zip.
# =============================================================================
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$ChromiumVersion = '158.0.8127.2'
$ChromiumCommit = '681cd621e82e606d7536eae8ea2576afb3c7d65c'
$DepotToolsCommit = '3218cfc968b246bf2498fd13f707851a0b1cd408'
# Visual Studio 2026 Build Tools 18.11.2 (fixed-version bootstrapper) and the
# standalone Windows 11 SDK 10.0.28000 installer, which adds the Debugging Tools
# that the Visual Studio installer leaves out but vs_toolchain.py requires.
$VsBuildToolsUrl = 'https://download.visualstudio.microsoft.com/download/pr/9a3f23c2-cc94-49a0-88c0-f9f19f2ac9df/f1d6aa62ea7c6339fde1cfb4fdea891587bd27238d6f7e387301f0fb66f9068a/vs_BuildTools.exe'
$VsBuildToolsSha256 = 'F1D6AA62EA7C6339FDE1CFB4FDEA891587BD27238D6F7E387301F0FB66F9068A'
$WinSdkSetupUrl = 'https://download.visualstudio.microsoft.com/download/pr/8d861047-d6bf-46c3-895e-2ceca5bd8fee/Win11Sdk/Aug2026Servicing28000/winsdksetup.exe'
$WinSdkSetupSha256 = 'B534D37A1F3140C8BE1298ED88855B8CBDDC35D2626C4D0AFD39F186A4B578E3'
$DepotToolsUrl = 'https://storage.googleapis.com/chrome-infra/depot_tools.zip'
# depot_tools no longer bundles Git on Windows; MinGit is Git for Windows'
# minimal, portable distribution.
$MinGitUrl = 'https://github.com/git-for-windows/git/releases/download/v2.56.0.windows.4/MinGit-2.56.0.4-64-bit.zip'
$MinGitSha256 = 'E3BF78351FE777FBA47DDEE5950082F8A98BB0F02604FDC7BA3EE2CB68FFA877'
# MinGit carries Git for Windows' system config, which routes LFS-tracked files
# (third_party/litert) through git-lfs, but not the git-lfs binary itself.
$GitLfsUrl = 'https://github.com/git-lfs/git-lfs/releases/download/v3.8.1/git-lfs-windows-amd64-v3.8.1.zip'
$GitLfsSha256 = '5BB771C12B3DACC535E912D0270A010C209D4DA2E63819C5918E3547C2DEFED9'

$Root = 'C:\chrome-build'
$VsInstallPath = 'C:\Program Files\Microsoft Visual Studio\18\BuildTools'
$WinSdkDir = 'C:\Program Files (x86)\Windows Kits\10'
$SdkVersion = '10.0.28000.0'
$DepotTools = "$Root\depot_tools"
# depot_tools' bootstrap only recognizes Git installations under a directory
# named "git" (like C:\Program Files\Git), so MinGit is unpacked to $Root\git.
$MinGit = "$Root\git"
$Git = "$MinGit\cmd\git.exe"
$Src = "$Root\src"
$Out = "$Src\out\Headless"
$Artifacts = "$Root\artifacts"
$OutputDir = "$Root\output"
$Package = 'chrome-headless-shell-win64'
$Archive = 'chromium-headless-shell-win64.zip'

"========================================="
"Building Chromium $ChromiumVersion headless_shell (Windows x64)"
"Started at $([DateTime]::UtcNow.ToString('o'))"
"========================================="

function Step([string]$Number, [string]$Title) {
  ""
  ">>> Step ${Number}: $Title"
}

# Native commands: merge stderr into the log as plain text and fail on a
# non-zero exit code. Without this, PowerShell 5.1 turns git's stderr progress
# into terminating errors when the output is redirected.
function Run([string]$Command, [string[]]$Arguments = @()) {
  $ErrorActionPreference = 'Continue'
  & $Command @Arguments 2>&1 | ForEach-Object { "$_" }
  $code = $LASTEXITCODE
  $ErrorActionPreference = 'Stop'
  if ($code -ne 0) {
    throw "Command failed with exit code ${code}: $Command $($Arguments -join ' ')"
  }
}

function Download([string]$Url, [string]$Destination, [string]$Sha256) {
  if (-not (Test-Path $Destination)) {
    "Downloading $Url"
    Invoke-WebRequest -Uri $Url -OutFile "$Destination.tmp" -UseBasicParsing
    Move-Item "$Destination.tmp" $Destination
  }
  if ($Sha256) {
    $actual = (Get-FileHash -Algorithm SHA256 $Destination).Hash
    if ($actual -ne $Sha256) {
      throw "SHA-256 mismatch for ${Destination}: $actual"
    }
  }
}

function RunInstaller([string]$Path, [string[]]$Arguments) {
  $process = Start-Process -FilePath $Path -ArgumentList $Arguments -Wait -PassThru -NoNewWindow
  # 3010 means a reboot is pending, which the build does not need.
  if ($process.ExitCode -notin 0, 3010) {
    throw "$Path exited with code $($process.ExitCode)"
  }
  "$([System.IO.Path]::GetFileName($Path)) exited with code $($process.ExitCode)"
}

try {
New-Item -ItemType Directory -Force -Path $Root, $Artifacts, $OutputDir, "$Root\downloads", "$Root\tmp", "$Root\cache\cipd", "$Root\cache\vpython" | Out-Null
$env:TEMP = "$Root\tmp"
$env:TMP = "$Root\tmp"
$env:CIPD_CACHE_DIR = "$Root\cache\cipd"
$env:VPYTHON_VIRTUALENV_ROOT = "$Root\cache\vpython"
$env:DEPOT_TOOLS_WIN_TOOLCHAIN = '0'
$env:vs2026_install = $VsInstallPath
$env:PATH = "$DepotTools;$MinGit\cmd;$env:PATH"

try {
  Add-MpPreference -ExclusionPath $Root
  'Excluded the build root from Windows Defender real-time scanning.'
} catch {
  "Could not add a Windows Defender exclusion: $_"
}

# =============================================================================
Step 1 'Install Visual Studio 2026 Build Tools and the Windows 11 SDK'
# =============================================================================
if (-not (Test-Path "$VsInstallPath\VC\Tools\MSVC")) {
  Download $VsBuildToolsUrl "$Root\downloads\vs_BuildTools.exe" $VsBuildToolsSha256
  RunInstaller "$Root\downloads\vs_BuildTools.exe" @(
    '--quiet', '--wait', '--norestart', '--nocache',
    '--installPath', "`"$VsInstallPath`"",
    '--add', 'Microsoft.VisualStudio.Workload.VCTools',
    '--add', 'Microsoft.VisualStudio.Component.VC.ATLMFC',
    '--add', 'Microsoft.VisualStudio.Component.Windows11SDK.28000',
    '--includeRecommended'
  )
} else {
  'Visual Studio Build Tools already installed.'
}
if (-not (Test-Path "$WinSdkDir\Debuggers\x64\dbghelp.dll")) {
  Download $WinSdkSetupUrl "$Root\downloads\winsdksetup.exe" $WinSdkSetupSha256
  RunInstaller "$Root\downloads\winsdksetup.exe" @('/features', 'OptionId.WindowsDesktopDebuggers', '/quiet', '/norestart')
} else {
  'Windows SDK Debugging Tools already installed.'
}
foreach ($required in "$VsInstallPath\VC\Tools\MSVC", "$WinSdkDir\Include\$SdkVersion\um\windows.h", "$WinSdkDir\Debuggers\x64\dbghelp.dll") {
  if (-not (Test-Path $required)) {
    throw "Toolchain is incomplete: $required is missing"
  }
}
Get-ChildItem "$VsInstallPath\VC\Tools\MSVC" | Select-Object -ExpandProperty Name | Set-Content "$Artifacts\msvc-toolset.txt"
"MSVC toolset: $(Get-Content "$Artifacts\msvc-toolset.txt")"
Set-Content "$Artifacts\windows-sdk.txt" $SdkVersion
(Get-CimInstance Win32_OperatingSystem | Select-Object Caption, Version, OSArchitecture | Format-List | Out-String).Trim() | Set-Content "$Artifacts\host-windows.txt"
Get-Content "$Artifacts\host-windows.txt"

# =============================================================================
Step 2 'Install Git and pinned depot_tools'
# =============================================================================
if (-not (Test-Path $Git)) {
  Download $MinGitUrl "$Root\downloads\mingit.zip" $MinGitSha256
  New-Item -ItemType Directory -Force -Path $MinGit | Out-Null
  Run 'tar.exe' @('-xf', "$Root\downloads\mingit.zip", '-C', $MinGit)
}
if (-not (Test-Path "$MinGit\cmd\git-lfs.exe")) {
  Download $GitLfsUrl "$Root\downloads\git-lfs.zip" $GitLfsSha256
  New-Item -ItemType Directory -Force -Path "$Root\downloads\git-lfs" | Out-Null
  Run 'tar.exe' @('-xf', "$Root\downloads\git-lfs.zip", '-C', "$Root\downloads\git-lfs")
  Copy-Item (Get-ChildItem -Recurse "$Root\downloads\git-lfs" -Filter git-lfs.exe | Select-Object -First 1).FullName "$MinGit\cmd\git-lfs.exe"
}
Run $Git @('--version')
Run $Git @('lfs', 'version')
if (-not (Test-Path "$DepotTools\.git")) {
  Download $DepotToolsUrl "$Root\downloads\depot_tools.zip" $null
  # depot_tools.zip is a git checkout; tar.exe keeps the .git directory intact.
  New-Item -ItemType Directory -Force -Path $DepotTools | Out-Null
  Run 'tar.exe' @('-xf', "$Root\downloads\depot_tools.zip", '-C', $DepotTools)
}
# The first gclient run bootstraps depot_tools' own Git and Python.
Run "$DepotTools\gclient.bat" @('--version')
Run $Git @('-C', $DepotTools, 'fetch', '--quiet', 'origin', $DepotToolsCommit)
Run $Git @('-C', $DepotTools, 'checkout', '--quiet', '--detach', $DepotToolsCommit)
$env:DEPOT_TOOLS_UPDATE = '0'
# Re-run the bootstrap for the pinned commit's tool manifest.
Run "$DepotTools\gclient.bat" @('--version')
$depotHead = (& $Git -C $DepotTools rev-parse HEAD).Trim()
if ($depotHead -ne $DepotToolsCommit) {
  throw "depot_tools is at $depotHead, expected $DepotToolsCommit"
}
Run "$DepotTools\python3.bat" @('--version')

Run $Git @('config', '--global', 'core.longpaths', 'true')
Run $Git @('config', '--global', 'core.autocrlf', 'false')
Run $Git @('config', '--global', 'core.filemode', 'false')
Run $Git @('config', '--global', 'core.preloadindex', 'true')
Run $Git @('config', '--global', 'core.fscache', 'true')
Run $Git @('config', '--global', 'http.postBuffer', '1048576000')
# googlesource can take over a minute to prepare the depth-1 pack before it
# sends any data; abort only if the transfer stalls for ten minutes.
Run $Git @('config', '--global', 'http.lowSpeedLimit', '1024')
Run $Git @('config', '--global', 'http.lowSpeedTime', '600')
Run $Git @('config', '--global', 'user.email', 'build@localhost')
Run $Git @('config', '--global', 'user.name', 'Build')

# =============================================================================
Step 3 "Clone Chromium $ChromiumVersion"
# =============================================================================
@'
solutions = [{
  "name": "src",
  "url": "https://chromium.googlesource.com/chromium/src.git",
  "managed": False,
  "deps_file": "DEPS",
  "custom_deps": {},
  "custom_vars": {
    "checkout_configuration": "small",
    "checkout_android": False,
    "checkout_fuchsia": False,
    "checkout_ios": False,
    "checkout_js_coverage_modules": False,
    "checkout_pgo_profiles": False,
    "checkout_telemetry_dependencies": False,
    "checkout_wpr_archives": False,
    "skip_wpr_archives_download": True,
    "checkout_instrumented_libraries": False,
    "download_remoteexec_cfg": False,
    "download_reclient": False,
  },
}]
target_os = ["win"]
'@ | Set-Content -Encoding ascii "$Root\.gclient"

if (-not (Test-Path "$Src\.git")) {
  $cloned = $false
  foreach ($attempt in 1..4) {
    try {
      Run $Git @('-c', 'protocol.version=2', 'clone', '--branch', $ChromiumVersion, '--depth', '1', '--no-tags', '--progress', 'https://chromium.googlesource.com/chromium/src.git', $Src)
      $cloned = $true
      break
    } catch {
      "Clone attempt $attempt failed: $_"
      if (Test-Path $Src) { Remove-Item -Recurse -Force $Src }
      Start-Sleep -Seconds (15 * $attempt)
    }
  }
  if (-not $cloned) { throw 'Could not clone Chromium' }
}
$srcHead = (& $Git -C $Src rev-parse HEAD).Trim()
if ($srcHead -ne $ChromiumCommit) {
  throw "Chromium is at $srcHead, expected $ChromiumCommit"
}
"Chromium commit: $srcHead"

# =============================================================================
Step 4 'gclient sync and runhooks'
# =============================================================================
Set-Location $Src
if (-not (Test-Path "$Root\dependencies-ready")) {
  Run "$DepotTools\gclient.bat" @('sync', '-D', '--no-history', '--shallow', '--force', '--reset', '--jobs', '16')
  Run "$DepotTools\gclient.bat" @('runhooks')
  New-Item -ItemType File -Path "$Root\dependencies-ready" | Out-Null
}
Get-Content "$Src\third_party\rust-toolchain\VERSION" | Set-Content "$Artifacts\rust-version.txt"
"Rust toolchain: $(Get-Content "$Artifacts\rust-version.txt")"
Run "$Src\third_party\llvm-build\Release+Asserts\bin\clang-cl.exe" @('--version')
(& "$Src\third_party\llvm-build\Release+Asserts\bin\clang-cl.exe" --version) | Set-Content "$Artifacts\clang-version.txt"

# =============================================================================
Step 5 'Apply the shared-memory capture patch'
# =============================================================================
$patch = "$Root\remotion-shared-memory-v3.patch"
$ErrorActionPreference = 'Continue'
& $Git -C $Src apply --reverse --check $patch 2>&1 | Out-Null
$alreadyApplied = ($LASTEXITCODE -eq 0)
$ErrorActionPreference = 'Stop'
if ($alreadyApplied) {
  'Patch is already applied.'
} else {
  Run $Git @('-C', $Src, 'apply', '--check', $patch)
  Run $Git @('-C', $Src, 'apply', $patch)
  'Applied the shared-memory capture patch.'
}
Copy-Item $patch "$Artifacts\remotion-shared-memory-v3.patch"

# =============================================================================
Step 6 'gn gen'
# =============================================================================
New-Item -ItemType Directory -Force -Path $Out | Out-Null
Copy-Item "$Root\args.gn" "$Out\args.gn"
Copy-Item "$Root\args.gn" "$Artifacts\args.gn"
Run "$DepotTools\gn.bat" @('gen', 'out\Headless')
Run "$DepotTools\gn.bat" @('args', 'out\Headless', '--list', '--short', '--overrides-only')
(& "$DepotTools\gn.bat" args out\Headless --list --short --overrides-only) | Set-Content "$Artifacts\gn-args-resolved.txt"
foreach ($expected in 'is_debug = false', 'dcheck_always_on = false', 'is_official_build = true', 'proprietary_codecs = true') {
  if (-not ((& "$DepotTools\gn.bat" args out\Headless --list --short) -contains $expected)) {
    throw "Resolved GN args do not contain '$expected'"
  }
}

# Compile the patched capture source first so a patch error surfaces within
# minutes instead of after the full browser compile.
$captureTargets = (& "$DepotTools\gn.bat" outputs out\Headless content/browser/devtools/protocol/page_handler.cc) |
  Where-Object { $_ -match '^obj/.*\.obj$' }
if (-not $captureTargets) { throw 'gn outputs returned no object targets for page_handler.cc' }
$captureTargets | Set-Content "$Artifacts\capture-object-targets.txt"
"Capture object targets: $($captureTargets -join ', ')"
$captureBuild = @('-C', 'out\Headless') + $captureTargets
Run "$DepotTools\autoninja.bat" $captureBuild

# =============================================================================
Step 7 'Build headless_shell'
# =============================================================================
Run "$DepotTools\autoninja.bat" @('-C', 'out\Headless', 'headless_shell')
Run "$Out\headless_shell.exe" @('--version')
(& "$Out\headless_shell.exe" --version) | Set-Content "$Artifacts\browser-version.txt"
(& "$DepotTools\gn.bat" desc out\Headless //headless:headless_shell runtime_deps) | Set-Content "$Artifacts\runtime-deps.txt"

# =============================================================================
Step 8 'Package chrome-headless-shell-win64'
# =============================================================================
# Required layout for Remotion's BrowserFetcher on win64:
#   chrome-headless-shell-win64/chrome-headless-shell.exe
# (See ../README.md -> "Output zip layout requirements".)
@'
import hashlib
import json
import os
import shutil
import sys
import zipfile
from pathlib import Path

out, artifacts, output_dir, package_name, archive_name, version, commit, depot_tools = sys.argv[1:9]
out = Path(out)
artifacts = Path(artifacts)
package = artifacts / package_name
if package.exists():
    shutil.rmtree(package)
package.mkdir()
deps = set()
for line in (artifacts / "runtime-deps.txt").read_text().splitlines():
    line = line.strip().replace("\\", "/")
    if line.startswith("./"):
        line = line[2:]
    if line:
        deps.add(line)
deps.update(["headless_shell.exe", "LICENSE.headless_shell", "vk_swiftshader_icd.json"])
deps.update(p.name for p in out.glob("*.dll"))
skipped = []
for name in sorted(deps):
    path = out / name
    if not path.exists():
        if name == "LICENSE.headless_shell":
            continue
        raise SystemExit(f"Missing runtime dependency: {name}")
    try:
        relative = path.resolve().relative_to(out.resolve())
    except ValueError:
        raise SystemExit(f"Dependency outside the build output: {name}")
    # Generated DevTools frontend sources and intermediate objects are listed
    # as data for test/debug targets; the embedded resources already contain
    # everything headless_shell serves at runtime.
    if relative.parts[0] in {"gen", "obj", "pyproto"}:
        skipped.append(str(relative))
        continue
    # The Vulkan validation layer and mock ICD are debugging tools that ANGLE
    # lists as data; Remotion never loads them.
    if relative.parts[0] == "angledata" or relative.name.startswith(("VkLayer_", "VkICD_mock_icd")):
        skipped.append(str(relative))
        continue
    if path.is_file() and path.suffix.lower() in {".pdb", ".lib", ".exp", ".ilk", ".stamp"}:
        skipped.append(str(relative))
        continue
    if path.is_file() and path.name.endswith(".exe.manifest"):
        skipped.append(str(relative))
        continue
    # Chromium's Ninja target is headless_shell; Remotion expects
    # chrome-headless-shell.exe like Chrome for Testing's archives.
    dest_relative = Path("chrome-headless-shell.exe") if relative == Path("headless_shell.exe") else relative
    dest = package / dest_relative
    dest.parent.mkdir(parents=True, exist_ok=True)
    if path.is_dir():
        shutil.copytree(path, dest, dirs_exist_ok=True)
    else:
        shutil.copy2(path, dest)
files = {}
for path in sorted(package.rglob("*")):
    if path.is_file():
        files[path.relative_to(package).as_posix()] = {
            "bytes": path.stat().st_size,
            "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
        }
if "chrome-headless-shell.exe" not in files:
    raise SystemExit("chrome-headless-shell.exe missing from the package")
manifest = {
    "chromium_version": version,
    "chromium_commit": commit,
    "depot_tools_commit": depot_tools,
    "target_os": "win",
    "target_cpu": "x64",
    "proprietary_codecs": True,
    "ffmpeg_branding": "Chrome",
    "is_official_build": True,
    "dcheck_always_on": False,
    "shared_memory_capture": "unsupported on Windows; Page.remotionCreateFramePool reports the capability error",
    "skipped_runtime_deps": skipped,
    "metadata": {
        name: (artifacts / name).read_text(encoding="utf-8", errors="replace").strip()
        for name in ["msvc-toolset.txt", "windows-sdk.txt", "host-windows.txt", "clang-version.txt",
                     "rust-version.txt", "args.gn", "gn-args-resolved.txt", "browser-version.txt",
                     "capture-object-targets.txt"]
        if (artifacts / name).exists()
    },
    "files": files,
}
(artifacts / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", newline="\n")
archive = Path(output_dir) / archive_name
if archive.exists():
    archive.unlink()
with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED) as z:
    for path in sorted(package.rglob("*")):
        if path.is_file():
            info = zipfile.ZipInfo.from_file(path, (Path(package_name) / path.relative_to(package)).as_posix())
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = (0o755 if path.suffix.lower() in {".exe", ".dll"} else 0o644) << 16
            with path.open("rb") as f:
                z.writestr(info, f.read())
with zipfile.ZipFile(archive) as z:
    bad = z.testzip()
    if bad:
        raise SystemExit(f"Corrupt zip member: {bad}")
    tops = sorted({n.split("/")[0] for n in z.namelist()})
    if tops != [package_name]:
        raise SystemExit(f"Unexpected top-level folders: {tops}")
digest = hashlib.sha256(archive.read_bytes()).hexdigest()
(artifacts / "SHA256SUMS").write_text(f"{digest}  {archive_name}\n", newline="\n")
print(f"Packaged {len(files)} files, skipped {skipped}")
print(f"{archive}: {archive.stat().st_size} bytes, SHA-256 {digest}")
'@ | Set-Content -Encoding ascii "$Root\package.py"
Run "$DepotTools\python3.bat" @("$Root\package.py", $Out, $Artifacts, $OutputDir, $Package, $Archive, $ChromiumVersion, $ChromiumCommit, $DepotToolsCommit)

# =============================================================================
Step 9 'Probe the capture behavior of the packaged browser'
# =============================================================================
# On Windows the patch has no pool backend: the probe checks that
# Page.remotionCreateFramePool fails with the capability error Remotion's
# renderer falls back on, and that ordinary PNG capture works.
$ErrorActionPreference = 'Continue'
$probeOutput = & "$DepotTools\python3.bat" "$Root\probe-fast-path.py" "$Artifacts\$Package\chrome-headless-shell.exe" 2>&1 | ForEach-Object { "$_" }
$probeExit = $LASTEXITCODE
$probeOutput
[System.IO.File]::WriteAllText("$Artifacts\fast-path-probe.json", ($probeOutput -join "`n") + "`n")
$ErrorActionPreference = 'Stop'
if ($probeExit -ne 0) { throw "Capture probe failed with exit code $probeExit" }

Set-Location $Root
""
"========================================="
"BUILD COMPLETE!"
"Output: $OutputDir\$Archive"
Get-Content "$Artifacts\SHA256SUMS"
"Finished at $([DateTime]::UtcNow.ToString('o'))"
"========================================="
} catch {
  ""
  "BUILD FAILED at $([DateTime]::UtcNow.ToString('o')): $_"
  $_.ScriptStackTrace
  exit 1
}
