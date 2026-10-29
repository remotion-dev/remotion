#!/usr/bin/env python3
"""Apply prototype-only CLT support to a Chromium 157 checkout.

Run after gclient sync, then set REMOTION_ALLOW_COMMAND_LINE_TOOLS=1 for
gn gen and the build. Full-Xcode detection is unchanged. This patch does not
install or change any system developer tools.
"""

import pathlib
import re
import sys

root = pathlib.Path(sys.argv[1]).resolve()
changes = {
    "build/config/apple/sdk_info.py": [
        (
            "    lines = (\n"
            "        subprocess.check_output(['xcodebuild', '-version'])\n",
            '''    # Remotion prototype: detect Apple's installed CLT honestly rather than
    # pretending that a full Xcode application is installed.
    if os.environ.get('REMOTION_ALLOW_COMMAND_LINE_TOOLS') == '1':
        active_developer_dir = subprocess.check_output(
            ['xcode-select', '-print-path'], text=True
        ).strip()
        if os.path.basename(active_developer_dir) == 'CommandLineTools':
            receipt = plistlib.loads(
                subprocess.check_output(
                    [
                        'pkgutil',
                        '--pkg-info-plist=com.apple.pkg.CLTools_Executables',
                    ]
                )
            )
            clt_version = receipt['pkg-version']
            settings['xcode_version'] = FormatVersion(clt_version)
            settings['xcode_version_int'] = int(settings['xcode_version'], 10)
            settings['xcode_version_verbatim'] = clt_version
            settings['xcode_build'] = 'CLT_' + clt_version.replace('.', '_')
            return

    lines = (
        subprocess.check_output(['xcodebuild', '-version'])
''',
        ),
        # CLT does not expose a separate Xcode PlatformPath or Toolchains
        # directory. Chromium's SDK info probe requests and symlinks both.
        (
            '''    settings['sdk_platform_path'] = (
        subprocess.check_output(
            ['xcrun', '-sdk', platform, '--show-sdk-platform-path']
        )
        .decode('UTF-8')
        .strip()
    )
''',
            '''    active_developer_dir = (
        subprocess.check_output(['xcode-select', '-print-path'])
        .decode('UTF-8')
        .strip()
    )
    using_command_line_tools = (
        os.environ.get('REMOTION_ALLOW_COMMAND_LINE_TOOLS') == '1'
        and os.path.basename(active_developer_dir) == 'CommandLineTools'
    )
    if using_command_line_tools:
        settings['sdk_platform_path'] = active_developer_dir
    else:
        settings['sdk_platform_path'] = (
            subprocess.check_output(
                ['xcrun', '-sdk', platform, '--show-sdk-platform-path']
            )
            .decode('UTF-8')
            .strip()
        )
''',
        ),
        (
            '''    settings['toolchains_path'] = os.path.join(
        subprocess.check_output(['xcode-select', '-print-path'])
        .decode('UTF-8')
        .strip(),
        'Toolchains/XcodeDefault.xctoolchain',
    )
''',
            '''    settings['toolchains_path'] = (
        active_developer_dir
        if using_command_line_tools
        else os.path.join(
            active_developer_dir, 'Toolchains/XcodeDefault.xctoolchain'
        )
    )
''',
        ),
    ],
    "build/mac/find_sdk.py": [
        (
            "    if not os.path.isdir(sdk_dir):\n",
            '''    # Remotion prototype: CLT ships the SDK under SDKs, not Platforms.
    using_command_line_tools = (
        os.environ.get('REMOTION_ALLOW_COMMAND_LINE_TOOLS') == '1'
        and os.path.basename(dev_dir) == 'CommandLineTools'
    )
    if using_command_line_tools:
        sdk_dir = os.path.join(dev_dir, 'SDKs')

    if not os.path.isdir(sdk_dir):
''',
        ),
        (
            "        bin_path = 'Toolchains/XcodeDefault.xctoolchain/usr/bin/'\n",
            '''        bin_path = (
            'usr/bin/'
            if using_command_line_tools
            else 'Toolchains/XcodeDefault.xctoolchain/usr/bin/'
        )
''',
        ),
    ],
}

for relative, replacements in changes.items():
    path = root / relative
    source = path.read_text()
    for original, replacement in replacements:
        if replacement in source:
            continue
        if source.count(original) != 1:
            raise RuntimeError(f"Expected exact Chromium 157 source in {path}")
        source = source.replace(original, replacement, 1)
    path.write_text(source)

# Xcode 26 moved the offline Metal compiler into a separately downloaded
# component. ANGLE already compiles its internal shaders from source at runtime
# when build-time compilation is unsupported; use that path.
path = root / "third_party/angle/src/libANGLE/renderer/metal/metal_backend.gni"
source = path.read_text()
replacement = (
    "# Remotion CLT prototype: use ANGLE's existing runtime shader source path.\n"
    "metal_internal_shader_compilation_supported = false\n"
)
if replacement not in source:
    assignment = re.compile(
        r"^metal_internal_shader_compilation_supported =\n(?:[ \t]+\S.*\n)+",
        re.M)
    if len(assignment.findall(source)) != 1:
        raise RuntimeError(f"Unexpected ANGLE revision in {path}")
    path.write_text(assignment.sub(replacement, source, count=1))

print("Applied prototype CLT support. Set REMOTION_ALLOW_COMMAND_LINE_TOOLS=1.")
