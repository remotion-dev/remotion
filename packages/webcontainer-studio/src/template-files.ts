import type {FileSystemTree} from '@webcontainer/api';

/**
 * The files for the Remotion blank template, prepared for mounting
 * into a WebContainer. Uses published npm versions instead of workspace:*.
 */
export const REMOTION_VERSION = '4.0.469';

export const templateFiles: FileSystemTree = {
	'package.json': {
		file: {
			contents: JSON.stringify(
				{
					name: 'remotion-webcontainer',
					version: '1.0.0',
					description: 'My Remotion video',
					scripts: {
						dev: 'remotion studio --log=verbose',
						build: 'remotion bundle',
					},
					dependencies: {
						'@remotion/cli': REMOTION_VERSION,
						react: '19.2.3',
						'react-dom': '19.2.3',
						remotion: REMOTION_VERSION,
					},
					devDependencies: {
						'@types/react': '19.2.7',
						typescript: '5.9.3',
					},
				},
				null,
				2,
			),
		},
	},
	'remotion.config.ts': {
		file: {
			contents: `import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
`,
		},
	},
	'tsconfig.json': {
		file: {
			contents: JSON.stringify(
				{
					compilerOptions: {
						target: 'ES2018',
						module: 'commonjs',
						jsx: 'react-jsx',
						strict: true,
						noEmit: true,
						lib: ['es2015'],
						esModuleInterop: true,
						skipLibCheck: true,
					},
					exclude: ['remotion.config.ts'],
				},
				null,
				2,
			),
		},
	},
	src: {
		directory: {
			'index.ts': {
				file: {
					contents: `import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

registerRoot(RemotionRoot);
`,
				},
			},
			'Root.tsx': {
				file: {
					contents: `import { Composition } from "remotion";
import { MyComposition } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MyComp"
        component={MyComposition}
        durationInFrames={60}
        fps={30}
        width={1280}
        height={720}
      />
    </>
  );
};
`,
				},
			},
			'Composition.tsx': {
				file: {
					contents: `export const MyComposition = () => {
  return null;
};
`,
				},
			},
		},
	},
};
