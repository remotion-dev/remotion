echo "Linux ARM glibc"
export CARGO_TARGET_AARCH64_UNKNOWN_LINUX_GNU_LINKER=aarch64-unknown-linux-gnu-gcc
cargo build --release --target=aarch64-unknown-linux-gnu

echo "Linux ARM musl"
export CARGO_TARGET_AARCH64_UNKNOWN_LINUX_MUSL_LINKER=aarch64-unknown-linux-gnu-gcc
cargo build --release --target=aarch64-unknown-linux-musl

echo "Linux x64 glibc"
export CARGO_TARGET_X86_64_UNKNOWN_LINUX_GNU_LINKER=x86_64-unknown-linux-gnu-gcc
cargo build --release --target=x86_64-unknown-linux-gnu

echo "Linux x64 musl"
export CARGO_TARGET_X86_64_UNKNOWN_LINUX_MUSL_LINKER=x86_64-unknown-linux-musl-gcc
cargo build --release --target=x86_64-unknown-linux-musl

echo "macOS ARM"
cargo build --release --target=aarch64-apple-darwin

echo "macOS x64"
cargo build --release --target=x86_64-apple-darwin

echo "Windows x64"
cargo build --release --target=x86_64-pc-windows-gnu
