# @remotion/codemods

Codemods for editing Remotion projects without a filesystem dependency.

## Usage

```tsx
import {addSolid} from '@remotion/codemods';

const result = addSolid({
  project: {
    rootDir: '/',
    files: {
      'src/Root.tsx': rootSource,
      'src/Video.tsx': videoSource,
    },
  },
  compositionFile: 'src/Root.tsx',
  compositionId: 'MyComposition',
  width: 1920,
  height: 1080,
});

console.log(result.project.files);
console.log(result.changes);
```

Mounted JSX elements can be deleted using the same node paths that Remotion
Canvas and Studio use:

```tsx
import {deleteJsxNodes} from '@remotion/codemods';

const removed = await deleteJsxNodes({
	project: result.project,
	nodes: [result.insertedNode],
});
```

See the [documentation](https://www.remotion.dev/docs/codemods).
