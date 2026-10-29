# Should be run on an EC2 instance with Amazon Linux 2023, arm64, we used c7g.8xlarge with 220GB EBS volume
# Based on https://github.com/chromium-for-lambda/chromium-binaries
# Commit 832ecb3ba69986a9bf9d8c8b2ed6cb4590406fbb

# User data
sudo yum install -y tar zlib-devel bzip2 bzip2-devel readline-devel sqlite sqlite-devel xz xz-devel libffi-devel openssl openssl-devel "@Development Tools" cmake libstdc++-static lld nano git alsa-lib-devel atk-devel bc bluez-libs-devel bzip2-devel cairo-devel cups-devel dbus-devel dbus-glib-devel dbus-x11 expat-devel glibc-langpack-en gperf gtk3-devel httpd libatomic libcap-devel libjpeg-devel libXScrnSaver-devel libxkbcommon-x11-devel mod_ssl ncurses-devel ncurses-compat-libs nspr-devel nss-devel pam-devel pciutils-devel perl php php-cli pulseaudio-libs-devel ruby xorg-x11-server-Xvfb libcurl-devel libxml2-devel clang libdrm-devel libuuid-devel mesa-*
sudo ln -s /usr/lib/gcc/aarch64-amazon-linux /usr/lib/gcc/aarch64-unknown-linux-gnu
sudo ln -s /usr/include/c++/11/aarch64-amazon-linux /usr/include/c++/11/aarch64-unknown-linux-gnu
sudo ln -s /usr/libexec/gcc/aarch64-amazon-linux /usr/libexec/gcc/aarch64-unknown-linux-gnu

# Install python
export PYENV_ROOT=${HOME}/.pyenv
git clone --depth=1 https://github.com/pyenv/pyenv.git "${PYENV_ROOT}"
export PATH=$PATH:${PYENV_ROOT}/bin:${PYENV_ROOT}/shims
export PYTHON_VERSION=3.10.14
pyenv install ${PYTHON_VERSION}
pyenv global ${PYTHON_VERSION}
pip3 install httplib2 google.auth requests

export GITHUB_WORKSPACE=/home/ec2-user
echo "133.0.6943.141" > ${GITHUB_WORKSPACE}/chromium-version

# Clone source
git clone --depth=1 https://github.com/chromium/chromium.git --branch $(<${GITHUB_WORKSPACE}/chromium-version) --single-branch --quiet "${HOME}/src"
git clone https://chromium.googlesource.com/chromium/tools/depot_tools --quiet "${HOME}/depot_tools"

cd "${HOME}/src"
COMMIT_DATE="$(git log -n 1 --pretty=format:%ci)"
cd "${HOME}/depot_tools"
git checkout --quiet $(git rev-list -n 1 --before="$COMMIT_DATE" main)
export DEPOT_TOOLS_UPDATE=0
export PATH=$PATH:${HOME}/depot_tools

# sync source dependencies
cat > /tmp/disable-sysroots-download.patch << 'EOL'
diff --git a/DEPS b/DEPS
index e9abf60b1a..6a02d7fb28 100644
--- a/DEPS
+++ b/DEPS
@@ -570,84 +570,6 @@ deps = {
     ]

   },
-  'src/build/linux/debian_bullseye_amd64-sysroot': {
-    'bucket': 'chrome-linux-sysroot',
-    'condition': 'checkout_linux and checkout_x64 and non_git_source',
-    'dep_type': 'gcs',
-    'objects': [
-      {
-        'generation': 1714590045814759,
-        'object_name': 'dec7a3a0fc5b83b909cba1b6d119077e0429a138eadef6bf5a0f2e03b1904631',
-        'sha256sum': 'dec7a3a0fc5b83b909cba1b6d119077e0429a138eadef6bf5a0f2e03b1904631',
-        'size_bytes': 129948576,
-      },
-    ],
-  },
-  'src/build/linux/debian_bullseye_arm64-sysroot': {
-    'bucket': 'chrome-linux-sysroot',
-    'condition': 'checkout_linux and checkout_arm64 and non_git_source',
-    'dep_type': 'gcs',
-    'objects': [
-      {
-        'generation': 1714589974958986,
-        'object_name': '308e23faba3174bd01accfe358467b8a40fad4db4c49ef629da30219f65a275f',
-        'sha256sum': '308e23faba3174bd01accfe358467b8a40fad4db4c49ef629da30219f65a275f',
-        'size_bytes': 108470444,
-      },
-    ],
-  },
-  'src/build/linux/debian_bullseye_armhf-sysroot': {
-    'bucket': 'chrome-linux-sysroot',
-    'condition': 'checkout_linux and checkout_arm and non_git_source',
-    'dep_type': 'gcs',
-    'objects': [
-      {
-        'generation': 1714589870087834,
-        'object_name': 'fe81e7114b97440262bce004caf02c1514732e2fa7f99693b2836932ad1c4626',
-        'sha256sum': 'fe81e7114b97440262bce004caf02c1514732e2fa7f99693b2836932ad1c4626',
-        'size_bytes': 99265992,
-      },
-    ],
-  },
-  'src/build/linux/debian_bullseye_i386-sysroot': {
-    'bucket': 'chrome-linux-sysroot',
-    'condition': 'checkout_linux and (checkout_x86 or checkout_x64) and non_git_source',
-    'dep_type': 'gcs',
-    'objects': [
-      {
-        'generation': 1714589989387491,
-        'object_name': 'b53933120bb08ffc38140a817e3f0f99782254a6bf9622271574fa004e8783a4',
-        'sha256sum': 'b53933120bb08ffc38140a817e3f0f99782254a6bf9622271574fa004e8783a4',
-        'size_bytes': 122047968,
-      },
-    ],
-  },
-  'src/build/linux/debian_bullseye_mips64el-sysroot': {
-    'bucket': 'chrome-linux-sysroot',
-    'condition': 'checkout_linux and checkout_mips64 and non_git_source',
-    'dep_type': 'gcs',
-    'objects': [
-      {
-        'generation': 1714590006168779,
-        'object_name': '783cb79f26736c69e8125788d95ffb65a28172349009d75188838a004280a92b',
-        'sha256sum': '783cb79f26736c69e8125788d95ffb65a28172349009d75188838a004280a92b',
-        'size_bytes': 103362108,
-      },
-    ],
-  },
-  'src/build/linux/debian_bullseye_mipsel-sysroot': {
-    'bucket': 'chrome-linux-sysroot',
-    'condition': 'checkout_linux and checkout_mips and non_git_source',
-    'dep_type': 'gcs',
-    'objects': [
-      {
-        'generation': 1714589936675352,
-        'object_name': 'fcf8c3931476dd097c58f2f5d44621c7090b135e85ab56885aa4b44f4bd6cdb5',
-        'sha256sum': 'fcf8c3931476dd097c58f2f5d44621c7090b135e85ab56885aa4b44f4bd6cdb5',
-        'size_bytes': 96161964,
-      },
-    ],
-  },
   'src/buildtools/win-format': {
     'bucket': 'chromium-clang-format',
     'condition': 'host_os == "win" and non_git_source',
EOL
cd $GITHUB_WORKSPACE/src
git apply /tmp/disable-sysroots-download.patch
rm /tmp/disable-sysroots-download.patch

cat > /tmp/disable-reclient-dep.diff << 'EOL'
diff --git a/DEPS b/DEPS
index faa0c930d8..89dc4b9d20 100644
--- a/DEPS
+++ b/DEPS
@@ -747,16 +747,6 @@ deps = {
     'dep_type': 'cipd',
     'condition': 'host_os == "win"',
   },
-  'src/buildtools/reclient': {
-    'packages': [
-      {
-        'package': Var('reclient_package') + '${{platform}}',
-        'version': Var('reclient_version'),
-      }
-    ],
-    'condition': 'non_git_source',
-    'dep_type': 'cipd',
-  },

   # We don't know target_cpu at deps time. At least until there's a universal
   # binary of httpd-php, pull both intel and arm versions in DEPS and then pick
EOL
cd $GITHUB_WORKSPACE/src
git apply /tmp/disable-reclient-dep.diff
rm /tmp/disable-reclient-dep.diff

cat > $GITHUB_WORKSPACE/.gclient << 'EOL'
solutions = [
  {
    "name": "src",
    "url": "https://chromium.googlesource.com/chromium/src.git",
    "managed": False,
    "custom_vars": {
      "checkout_nacl": False,
      "checkout_configuration": "small",
      "checkout_js_coverage_modules": False,
      "checkout_fuchsia_boot_images": "",
      "generate_location_tags": False,
      "checkout_telemetry_dependencies": False
    },
  }
]
EOL

cd $GITHUB_WORKSPACE/src
gclient sync -D --force --reset --no-history

# Install clang

cat > /tmp/disable-sysroots-aarch64.patch << 'EOL'
diff --git a/tools/clang/scripts/build.py b/tools/clang/scripts/build.py
index 61661ff43d..c011a42b5a 100755
--- a/tools/clang/scripts/build.py
+++ b/tools/clang/scripts/build.py
@@ -766,12 +766,6 @@ def main():
     ninja_dir = os.path.join(THIRD_PARTY_DIR, 'ninja')
     os.environ['PATH'] = ninja_dir + os.pathsep + os.environ.get('PATH', '')

-  if sys.platform.startswith('linux'):
-    sysroot_amd64 = DownloadDebianSysroot('amd64', args.skip_checkout)
-    sysroot_i386 = DownloadDebianSysroot('i386', args.skip_checkout)
-    sysroot_arm = DownloadDebianSysroot('arm', args.skip_checkout)
-    sysroot_arm64 = DownloadDebianSysroot('arm64', args.skip_checkout)
-
   if args.skip_build:
     return 0

@@ -786,7 +780,7 @@ def main():
   cxxflags = []
   ldflags = []

-  targets = 'AArch64;ARM;LoongArch;Mips;PowerPC;RISCV;SystemZ;WebAssembly;X86'
+  targets = 'AArch64'
   projects = 'clang;lld'
   if not args.no_tools:
     projects += ';clang-tools-extra'
@@ -870,14 +864,6 @@ def main():
     if sys.platform.startswith('linux'):
       base_cmake_args += [ '-DLLVM_STATIC_LINK_CXX_STDLIB=ON' ]

-  if sys.platform.startswith('linux'):
-    # Add the sysroot to base_cmake_args.
-    if platform.machine() == 'aarch64':
-      base_cmake_args.append('-DCMAKE_SYSROOT=' + sysroot_arm64)
-    else:
-      # amd64 is the default toolchain.
-      base_cmake_args.append('-DCMAKE_SYSROOT=' + sysroot_amd64)
-
   if sys.platform == 'win32':
     AddGitForWindowsToPath()

@@ -961,7 +947,7 @@ def main():
       # COMPILER_RT_BUILD_BUILTINS).
       runtimes.append('compiler-rt')

-    bootstrap_targets = 'X86'
+    bootstrap_targets = 'AArch64'
     if sys.platform == 'darwin':
       # Need ARM and AArch64 for building the ios clang_rt.
       bootstrap_targets += ';ARM;AArch64'
@@ -1183,45 +1169,8 @@ def main():
   runtimes_triples_args = {}

   if sys.platform.startswith('linux'):
-    runtimes_triples_args['i386-unknown-linux-gnu'] = {
-        "args": [
-            'CMAKE_SYSROOT=%s' % sysroot_i386,
-            # TODO(crbug.com/40242553): pass proper flags to i386 tests so they compile correctly
-            'LLVM_INCLUDE_TESTS=OFF',
-        ],
-        "profile":
-        True,
-        "sanitizers":
-        True,
-    }
-    runtimes_triples_args['x86_64-unknown-linux-gnu'] = {
-        "args": [
-            'CMAKE_SYSROOT=%s' % sysroot_amd64,
-        ],
-        "profile": True,
-        "sanitizers": True,
-    }
-    # Using "armv7a-unknown-linux-gnueabhihf" confuses the compiler-rt
-    # builtins build, since compiler-rt/cmake/builtin-config-ix.cmake
-    # doesn't include "armv7a" in its `ARM32` list.
-    # TODO(thakis): It seems to work for everything else though, see try
-    # results on
-    # https://chromium-review.googlesource.com/c/chromium/src/+/3702739/4
-    # Maybe it should work for builtins too?
-    runtimes_triples_args['armv7-unknown-linux-gnueabihf'] = {
-        "args": [
-            'CMAKE_SYSROOT=%s' % sysroot_arm,
-            # Can't run tests on x86 host.
-            'LLVM_INCLUDE_TESTS=OFF',
-        ],
-        "profile":
-        True,
-        "sanitizers":
-        True,
-    }
     runtimes_triples_args['aarch64-unknown-linux-gnu'] = {
         "args": [
-            'CMAKE_SYSROOT=%s' % sysroot_arm64,
             # Can't run tests on x86 host.
             'LLVM_INCLUDE_TESTS=OFF',
         ],
EOL

cd $GITHUB_WORKSPACE/src
git apply /tmp/disable-sysroots-aarch64.patch
rm /tmp/disable-sysroots-aarch64.patch
./tools/clang/scripts/build.py --without-android --without-fuchsia --use-system-cmake --host-cc /bin/clang --host-cxx /bin/clang++ --with-ml-inliner-model=''

# Install rust
cat > /tmp/dont-use-sysroot.patch << 'EOL'
diff --git a/tools/rust/build_rust.py b/tools/rust/build_rust.py
index 7b40eb462a..145131e648 100755
--- a/tools/rust/build_rust.py
+++ b/tools/rust/build_rust.py
@@ -689,11 +689,6 @@ def main():
             return 1

     debian_sysroot = None
-    if sys.platform.startswith('linux') and not args.sync_for_gnrt:
-        # Fetch sysroot we build rustc against. This ensures a minimum supported
-        # host (not Chromium target). Since the rustc linux package is for
-        # x86_64 only, that is the sole needed sysroot.
-        debian_sysroot = DownloadDebianSysroot('amd64', args.skip_checkout)

     # Require zlib compression.
     if sys.platform == 'win32':
EOL


cd $GITHUB_WORKSPACE/src
git apply /tmp/dont-use-sysroot.patch
rm /tmp/dont-use-sysroot.patch

cat > /tmp/bindgen-without-sysroot.patch << 'EOL'
diff --git a/tools/rust/build_bindgen.py b/tools/rust/build_bindgen.py
index b2c4b6814e..4c7476c417 100755
--- a/tools/rust/build_bindgen.py
+++ b/tools/rust/build_bindgen.py
@@ -185,15 +185,6 @@ def main():
     env['LD'] = linker
     env['RUSTFLAGS'] += f' -Clinker={linker}'

-    if sys.platform.startswith('linux'):
-        # We use these flags to avoid linking with the system libstdc++.
-        sysroot = DownloadDebianSysroot('amd64')
-        sysroot_flag = f'--sysroot={sysroot}'
-        env['CFLAGS'] += f' {sysroot_flag}'
-        env['CXXFLAGS'] += f' {sysroot_flag}'
-        env['LDFLAGS'] += f' {sysroot_flag}'
-        env['RUSTFLAGS'] += f' -Clink-arg={sysroot_flag}'
-
     if ncursesw_dir:
         env['CFLAGS'] += f' -I{ncursesw_dir}/include'
         env['CXXFLAGS'] += f' -I{ncursesw_dir}/include'
EOL


cd $GITHUB_WORKSPACE/src
git apply /tmp/bindgen-without-sysroot.patch
rm /tmp/bindgen-without-sysroot.patch

cat > /tmp/patch-build-process-arm64-al2023.patch << 'EOL'
diff --git a/tools/rust/build_rust.py b/tools/rust/build_rust.py
index d8ce592e52..7b7bf23155 100755
--- a/tools/rust/build_rust.py
+++ b/tools/rust/build_rust.py
@@ -521,6 +521,7 @@ def BuildLLVMLibraries(skip_build):
             '--with-ml-inliner-model=',
             # Not using this in Rust yet, see also crbug.com/1476464.
             '--without-zstd',
+            '--use-system-cmake', '--host-cc=/bin/clang', '--host-cxx=/bin/clang++', '--skip-checkout'
         ]
         if sys.platform.startswith('linux'):
             build_cmd.append('--without-android')
EOL

cd $GITHUB_WORKSPACE/src
git apply /tmp/patch-build-process-arm64-al2023.patch
rm /tmp/patch-build-process-arm64-al2023.patch


cat > /tmp/use-aarch64.patch << 'EOL'
diff --git a/tools/rust/build_rust.py b/tools/rust/build_rust.py
index f86a288b2d..d1b04cab81 100755
--- a/tools/rust/build_rust.py
+++ b/tools/rust/build_rust.py
@@ -504,7 +504,7 @@ def RustTargetTriple():
     elif sys.platform == 'win32':
         return 'x86_64-pc-windows-msvc'
     else:
-        return 'x86_64-unknown-linux-gnu'
+        return 'aarch64-unknown-linux-gnu'


 # Build the LLVM libraries and install them .
EOL

cd $GITHUB_WORKSPACE/src
git apply /tmp/use-aarch64.patch
rm /tmp/use-aarch64.patch

cat > /tmp/use-system-openssl.patch << 'EOL'
diff --git a/tools/rust/build_rust.py b/tools/rust/build_rust.py
index 7b40eb462a..2265ecddcf 100755
--- a/tools/rust/build_rust.py
+++ b/tools/rust/build_rust.py
@@ -707,13 +707,6 @@ def main():
     else:
         libxml2_dirs = None

-    # TODO(crbug.com/40205621): OpenSSL is somehow already present on the
-    # Windows builder, but we should change to using a package from 3pp when it
-    # is available.
-    if (sys.platform != 'win32' and not args.sync_for_gnrt):
-        # Building cargo depends on OpenSSL.
-        AddOpenSSLToEnv()
-
     xpy = XPy(zlib_path, libxml2_dirs, debian_sysroot, args.verbose)

     if args.dump_env:
EOL

cd $GITHUB_WORKSPACE/src
git apply /tmp/use-system-openssl.patch
rm /tmp/use-system-openssl.patch

git config --global user.email "hi@remotion.dev"
git config --global user.name "Chromium for Lambda / Remotion"

./tools/rust/build_rust.py --skip-test
./tools/rust/build_bindgen.py

# Install node
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 20.11.0
cd $HOME/src/third_party/node/linux && \
    rm -rf node-linux-x64 && \
    ln -s $HOME/.nvm/versions/node/v20.11.0 node-linux-x64

# Compile

cat > /tmp/fix-disable-speech-service.patch << 'EOL'
diff --git a/chrome/test/BUILD.gn b/chrome/test/BUILD.gn
index 7a945c6bac..96794f1a1f 100644
--- a/chrome/test/BUILD.gn
+++ b/chrome/test/BUILD.gn
@@ -7902,7 +7902,6 @@ test("unit_tests") {
       "//chrome/browser/webauthn:test_support",
       "//chrome/browser/webauthn/proto",
       "//chrome/common/read_anything:mojo_bindings",
-      "//chrome/services/speech:unit_tests",
       "//components/app_constants",
       "//components/color",
       "//components/commerce/core:account_checker_test_support",
EOL

cd $GITHUB_WORKSPACE/src
git apply /tmp/fix-disable-speech-service.patch
rm /tmp/fix-disable-speech-service.patch

cat > /tmp/args.gn << 'EOL'
import("//build/args/headless.gn")

is_debug = false
dcheck_always_on = false
symbol_level = 0
blink_symbol_level=0
v8_symbol_level=0
is_official_build = true
disable_histogram_support = true
enable_media_remoting = true
chrome_pgo_phase = 0
enable_background_mode = false
use_sysroot = false
use_qt = false
use_dbus = true
use_bluez = true
enable_ppapi = false
enable_printing = true
enable_oop_printing = false
build_dawn_tests = false
dawn_enable_spirv_validation = false
enable_media_remoting_rpc = false
enable_gwp_asan = false
enable_gwp_asan_malloc = false
enable_gwp_asan_partitionalloc = false
enable_browser_speech_service = false
enable_reporting = false
enable_screen_ai_browsertests = false
enable_speech_service = false
enable_trace_logging = false
disable_fieldtrial_testing_config = true
is_chrome_for_testing = true
enable_hangout_services_extension = false
enable_mdns = false
enable_remoting = false
enable_reporting = false
enable_service_discovery = false
enable_widevine = true
media_use_ffmpeg = true
media_use_libvpx = true
proprietary_codecs = true
ffmpeg_branding = "Chrome"
EOL

cd $GITHUB_WORKSPACE/src
mkdir out/Default
cp /tmp/args.gn out/Default/args.gn

gn gen out/Default
autoninja -C out/Default headless_shell chrome

# Package
cd $GITHUB_WORKSPACE/src
export VERSION=$(sed --regexp-extended 's~[^0-9]+~~g' chrome/VERSION | tr '\n' '.' | sed 's~[.]$~~')

cd $GITHUB_WORKSPACE
mkdir -p "${HOME}/build/system"
cp /usr/lib64/libdbus-1.so.3 "${HOME}/build/system"
cp /usr/lib64/liblzma.so.5 "${HOME}/build/system"
cp /usr/lib64/libnss3.so "${HOME}/build/system"
cp /usr/lib64/libsmime3.so "${HOME}/build/system"
cp /usr/lib64/libsoftokn3.so "${HOME}/build/system"
cp /usr/lib64/libsystemd.so.0 "${HOME}/build/system"

cd $GITHUB_WORKSPACE
cp /usr/lib64/libnssutil3.so "${HOME}/build/system"
cp /usr/lib64/libexpat.so.1 "${HOME}/build/system"
cp /usr/lib64/libfreebl3.so "${HOME}/build/system"
cp /usr/lib64/libfreeblpriv3.so "${HOME}/build/system"
cp /usr/lib64/libnspr4.so "${HOME}/build/system"
cp /usr/lib64/libplc4.so "${HOME}/build/system"
cp /usr/lib64/libplds4.so "${HOME}/build/system"

cd $GITHUB_WORKSPACE/src
mkdir -p "${HOME}/build/chrome"
strip -o "${HOME}/build/chrome/chrome" out/Default/chrome
strip -o "${HOME}/build/chrome/chrome_crashpad_handler" out/Default/chrome_crashpad_handler
strip -o "${HOME}/build/chrome/libEGL.so" out/Default/libEGL.so
strip -o "${HOME}/build/chrome/libGLESv2.so" out/Default/libGLESv2.so
strip -o "${HOME}/build/chrome/libvulkan.so.1" out/Default/libvulkan.so.1
strip -o "${HOME}/build/chrome/libvk_swiftshader.so" out/Default/libvk_swiftshader.so
cp out/Default/chrome-wrapper "${HOME}/build/chrome"
cp -r out/Default/MEIPreload "${HOME}/build/chrome"
cp out/Default/chrome_100_percent.pak "${HOME}/build/chrome"
cp out/Default/chrome_200_percent.pak "${HOME}/build/chrome"
cp -r out/Default/locales "${HOME}/build/chrome"
cp -r out/Default/resources "${HOME}/build/chrome"
cp out/Default/resources.pak "${HOME}/build/chrome"
cp out/Default/product_logo_48.png "${HOME}/build/chrome"
cp out/Default/vk_swiftshader_icd.json "${HOME}/build/chrome"
cp out/Default/xdg-mime "${HOME}/build/chrome"
cp out/Default/xdg-settings "${HOME}/build/chrome"

cd $GITHUB_WORKSPACE/src
mkdir -p "${HOME}/build/headless_shell"
strip -o "${HOME}/build/headless_shell/headless_shell" out/Default/headless_shell
strip -o "${HOME}/build/headless_shell/libEGL.so" out/Default/libEGL.so
strip -o "${HOME}/build/headless_shell/libGLESv2.so" out/Default/libGLESv2.so
strip -o "${HOME}/build/headless_shell/libvulkan.so.1" out/Default/libvulkan.so.1
strip -o "${HOME}/build/headless_shell/libvk_swiftshader.so" out/Default/libvk_swiftshader.so
cp out/Default/vk_swiftshader_icd.json "${HOME}/build/headless_shell"
cp out/Default/headless_lib_data.pak "${HOME}/build/headless_shell"
cp out/Default/headless_lib_strings.pak "${HOME}/build/headless_shell"

cd $GITHUB_WORKSPACE/build
zip -r "system-${VERSION}-${RUNNER_LABEL/,/-}.zip" system
zip -r "chrome-${VERSION}-${RUNNER_LABEL/,/-}.zip" chrome
zip -r "headless_shell-${VERSION}-${RUNNER_LABEL/,/-}.zip" headless_shell
