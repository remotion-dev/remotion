# FFmpeg source build

This directory contains the FFmpeg build recipes, patches and binding generator used by the compositor.
See [the FFmpeg workflow](../README.md) for setup, downloads, CI and updating the compositor.

macOS and Linux builds include the private [`remotionshm`](REMOTION_SHM.md) input device.
The build scripts and tests run from this directory. `node ../download.mjs buildInputs` retrieves the pinned inputs and test videos first.

This build tooling is licensed under GPL-2.0-or-later. See [LICENSE](LICENSE).
