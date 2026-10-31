# @remotion/codemods

Codemods for Remotion projects

[![NPM Downloads](https://img.shields.io/npm/dm/@remotion/codemods.svg?style=flat&color=black&label=Downloads)](https://npmcharts.com/compare/@remotion/codemods?minimal=true)

## Installation

```bash
npm install @remotion/codemods --save-exact
```

When installing a Remotion package, make sure to align the version of all `remotion` and `@remotion/*` packages to the same version.
Remove the `^` character from the version number to use the exact version.

## Usage

See the [documentation](https://www.remotion.dev/docs/codemods) for more information.

### OpenTimelineIO import

Use `generateOpenTimelineComposition()` to convert supported OTIO JSON into deterministic, editable Remotion TSX, or `addOpenTimelineComposition()` to create and register it through the codemod project API. Import results include diagnostics, asset information, and retained annotations; errors prevent source generation.

See [OpenTimelineIO support](./OPEN_TIMELINE_SUPPORT.md) for API examples, asset resolution, and the supported and unsupported feature matrix.
