#!/usr/bin/env python3
"""Carefully patch Chromium's tools/clang/scripts/build.py for arm64 builds.

Safe to re-run (idempotent).
"""
import os
import re
import sys

PATH = 'tools/clang/scripts/build.py'

with open(PATH) as f:
    src = f.read()

orig = src

# -- 1. libxml2 path: lib -> lib64 on AL2023 aarch64 ------------------------
src = src.replace(
    "dirs.lib_dir, 'libxml2.a'",
    "os.path.join(dirs.install_dir, 'lib64'), 'libxml2.a'",
)

# -- 2. Drop -DLLVM_ENABLE_LLD=ON (we have no prebuilt lld) -----------------
src = re.sub(r"\s*'-DLLVM_ENABLE_LLD=ON',", '', src)

# -- 3. Remove the with_ml_inline_model block (handles build dep complications)
src = re.sub(
    r"  if args\.with_ml_inlin.*?(?=\n  [a-z]|\n  #|\nif |\ndef )",
    '',
    src,
    flags=re.DOTALL,
)

# -- 4. lib_dir: install_dir/lib -> build_dir/lib ---------------------------
src = src.replace(
    "self.lib_dir = os.path.join(self.install_dir, 'lib')",
    "self.lib_dir = os.path.join(self.build_dir, 'lib')",
)

# -- 5. cxxflags = [] -> ['-lrt','-lpthread'] -------------------------------
src = re.sub(r"cxxflags = \[\]", "cxxflags = ['-lrt', '-lpthread']", src)

# -- 6. bootstrap_targets from X86 to ARM/AArch64 ---------------------------
src = re.sub(r"bootstrap_targets = 'X86'", "bootstrap_targets = 'ARM;AArch64'", src)

# -- 7. PIC patches: need shared libclang.so for bindgen --------------------
# Drop the blanket -DLLVM_ENABLE_PIC={pic_mode} in base_cmake_args.
src = re.sub(r"\s*f'-DLLVM_ENABLE_PIC=\{pic_mode\}',?\n", '\n', src)

# Force PIC OFF in bootstrap_args (only once).
if "-DLLVM_ENABLE_PIC=OFF" not in src:
    src = src.replace(
        "bootstrap_args = [",
        "bootstrap_args = [\n      '-DLLVM_ENABLE_PIC=OFF',",
        1,
    )

# Force PIC ON in final cmake_args (only once).
if "-DCMAKE_POSITION_INDEPENDENT_CODE=ON" not in src:
    src = src.replace(
        "cmake_args = base_cmake_args + [",
        "cmake_args = base_cmake_args + [\n      '-DLLVM_ENABLE_PIC=ON',\n      '-DCMAKE_POSITION_INDEPENDENT_CODE=ON',",
        1,
    )

# -- 8. Runtime triples: keep only aarch64-unknown-linux-gnu ----------------
# The i386/x86_64/armv7/riscv64 entries all reference sysroot_* variables that
# don't exist on this host. Remove each multi-line dict block cleanly by using
# a brace-matched replacement.
def remove_triple_block(src: str, triple: str) -> str:
    """Remove a single `runtimes_triples_args['<triple>'] = { ... }` block
    by balanced-brace matching, preserving indentation/newlines."""
    start_re = re.compile(
        r"^[ \t]*runtimes_triples_args\[\s*'"
        + re.escape(triple)
        + r"'\s*\]\s*=\s*\{",
        re.MULTILINE,
    )
    m = start_re.search(src)
    if not m:
        return src
    # Find matching closing brace.
    depth = 0
    i = m.end() - 1  # pointing at the opening '{'
    while i < len(src):
        ch = src[i]
        if ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                end = i + 1
                # Also swallow a trailing newline.
                if end < len(src) and src[end] == '\n':
                    end += 1
                return src[: m.start()] + src[end:]
        i += 1
    return src  # unbalanced — leave alone


for t in [
    'i386-unknown-linux-gnu',
    'x86_64-unknown-linux-gnu',
    'armv7-unknown-linux-gnueabihf',
    'riscv64-unknown-linux-gnu',
]:
    src = remove_triple_block(src, t)

# -- 9. Verify the result parses as Python ---------------------------------
try:
    compile(src, PATH, 'exec')
except SyntaxError as e:
    print(f"ERROR: patched {PATH} has SyntaxError at line {e.lineno}: {e.msg}",
          file=sys.stderr)
    sys.exit(1)

if src != orig:
    with open(PATH, 'w') as f:
        f.write(src)
    print(f"Patched {PATH}")
else:
    print(f"{PATH} already patched (no changes)")
