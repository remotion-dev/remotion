# Rust development

To participate in the development of the Rust parts of Remotion, you need to do additional steps. If you don't want to change the Rust code, you don't have to set anything up.

## Setup

These are instructions for macOS. Contributions for other platforms are appreciated.

First, install Cargo, if you don't have it, or upgrade to a version that supports `edition-2021`:

```
curl https://sh.rustup.rs -sSf | sh
```

Second, install components that allow for cross-compilation:

```sh
sh install_platforms.sh
```

Third, install linkers for cross compilation:

```sh
brew install MaterializeInc/crosstools/x86_64-unknown-linux-gnu
brew install MaterializeInc/crosstools/aarch64-unknown-linux-gnu
brew install messense/macos-cross-toolchains/x86_64-unknown-linux-musl
brew install messense/macos-cross-toolchains/aarch64-unknown-linux-musl
brew install mingw-w64
```

> This will take a few minutes.

## Building

To build the Rust parts for your operating system, run:

```
node build.mjs
```

To build the Rust binaries for all supported platforms, run:

```
node build.mjs --all
```

The resulting artifacts should be checked into Git.
