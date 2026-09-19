# @remotion/studio-codemods

Codemods for editing Remotion projects without a filesystem dependency.

## Usage

```tsx
import {addSolid} from '@remotion/studio-codemods';

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

See the [documentation](https://www.remotion.dev/docs/studio-codemods).
