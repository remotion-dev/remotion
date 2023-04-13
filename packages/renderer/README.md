# Rust development

To participate in the development of the Rust parts of Remotion, you need to do additional steps. If you don't want to change the Rust code, you don't have to set anything up.

## Setup

These are instructions for macOS. Contributions for other platforms are appreciated.

First, install Cargo, if you don't have it, or upgrade to a version that supports `edition-2021`:

```
curl https://sh.rustup.rs -sSf | sh
```

> This will take a few minutes.

## Building

To build the Rust parts for your operating system, run:

```
node build.mjs
```

## Building for all platforms

These instructions currently are for macOS. Contributions for other platforms are appreciated.

To build the Rust binaries for all supported platforms, you need to install some dependencies:

```sh
node install-toolchains.mjs
```

You can then build all binaries with:

```
pnpm build-all
```

The resulting artifacts should be checked into Git.
