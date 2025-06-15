# @remotion/paths
 
Utilities for working with SVG paths
 
[![NPM Downloads](https://img.shields.io/npm/dm/@remotion/paths.svg?style=flat&color=black&label=Downloads)](https://npmcharts.com/compare/@remotion/paths?minimal=true)
 
## Installation
 
```bash
npm install @remotion/paths --save-exact
```
 
When installing a Remotion package, make sure to align the version of all `remotion` and `@remotion/*` packages to the same version.
Remove the `^` character from the version number to use the exact version.
 
## Usage

See the [documentation](https://www.remotion.dev/paths) for more information.

### cutPath()

Cuts an SVG path at a specified length, returning the portion from the start to that length.

```js
import {cutPath} from '@remotion/paths';

const path = 'M 0 0 L 100 0 L 100 100';
const cutAtLength = cutPath(path, 50);
console.log(cutAtLength); // 'M 0 0 L 50 0'
```

**Parameters:**
- `d` (string): The SVG path data string
- `length` (number): The length at which to cut the path

**Returns:** A string representing the cut path from the start to the specified length.
