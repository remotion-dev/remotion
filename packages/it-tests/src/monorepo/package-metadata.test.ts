import {expect, test} from 'bun:test';
import {Pkgs, getAllPackages, updatePackageJson} from './get-all-packages';

const descriptions: Record<Pkgs, string | null> = {
	player: 'React component for embedding a Remotion preview into your app',
	cloudrun: 'Render Remotion videos on Google Cloud Run',
	renderer: 'Render Remotion videos using Node.js or Bun',
	cli: 'Control Remotion features using the `npx remotion` command',
	core: 'Make videos programmatically',
	lambda: 'Render Remotion videos on AWS Lambda',
	bundler: 'Bundle Remotion compositions using Webpack',
	'studio-server': 'Run a Remotion Studio with a server backend',
	'install-whisper-cpp': 'Helpers for installing and using Whisper.cpp',
	'google-fonts': 'Use Google Fonts in Remotion',
	'media-utils': 'Utilities for working with media files',
	lottie: 'Include Lottie animations in Remotion',
	'layout-utils': 'Utilities for working with layouts',
	noise: 'Noise generation functions',
	'motion-blur': 'Motion blur effect for Remotion',
	preload: 'Preloads assets for use in Remotion',
	shapes: 'Generate SVG shapes',
	'zod-types': 'Zod types for Remotion',
	gif: 'Embed GIFs in a Remotion video',
	'eslint-plugin': 'Rules for writing Remotion code',
	'eslint-config': 'Default configuration for Remotion templates',
	'compositor-linux-x64-gnu': 'Linux x64 binary for the Remotion Rust code',
	'compositor-linux-x64-musl': 'Linux x64 binary for the Remotion Rust code',
	'compositor-darwin-x64': 'MacOS x64 binary for the Remotion Rust code',
	'compositor-darwin-arm64':
		'MacOS Apple Silicon binary for the Remotion Rust code',
	'compositor-win32-x64': 'Windows x64 binary for the Remotion Rust code',
	'compositor-linux-arm64-gnu': 'Linux ARM64 binary for the Remotion Rust code',
	'compositor-linux-arm64-musl':
		'Linux ARM64 binary for the Remotion Rust code',
	'babel-loader': 'Babel loader for Remotion',
	fonts: 'Helpers for loading local fonts into Remotion',
	transitions: 'Library for creating transitions in Remotion',
	'enable-scss': 'Enable SCSS support in Remotion',
	'create-video': 'Create a new Remotion project',
	'studio-shared':
		'Internal package for shared objects between the Studio backend and frontend',
	tailwind: 'Enable TailwindCSS support in Remotion',
	streaming: 'Utilities for streaming data between programs',
	'video-parser': 'A JavaScript parser for .mp4, .mov, .webm and .mkv files',
	rive: 'Embed Rive animations in a Remotion video',
	paths: 'Utilities for working with SVG paths',
	studio: 'APIs for interacting with the Remotion Studio',
	skia: 'Include React Native Skia components in a Remotion video',
	three: 'Include React Three Fiber components in a Remotion video',
	'astro-example': null,
	'lambda-go-example': null,
	'compositor-win32-x64-msvc': null,
	'animation-utils': 'Helpers for animating CSS properties',
	'test-utils': null,
	'example-without-zod': null,
	'lambda-go': null,
	example: null,
	'lambda-php': null,
	bugs: null,
	docs: null,
	'it-tests': null,
	'lambda-python': null,
	'player-example': null,
	'ai-improvements': null,
	'discord-poster': null,
	'cli-autocomplete': null,
};

test('All packages should have a repository field', () => {
	const dirs = getAllPackages();

	expect(dirs.length).toBeGreaterThan(0);

	for (const {pkg, path} of dirs) {
		updatePackageJson(path, (data) => {
			return {
				...data,
				repository: {
					url: `https://github.com/remotion-dev/remotion/tree/main/packages/${pkg}`,
				},
			};
		});
	}
});

test('All packages should have a description field', () => {
	const dirs = getAllPackages();

	expect(dirs.length).toBeGreaterThan(0);

	for (const {pkg, path} of dirs) {
		const description = descriptions[pkg as Pkgs];
		if (description === undefined) {
			throw new Error(`No description for ${pkg}`);
		}
		if (description) {
			updatePackageJson(path, (data) => {
				return {
					...data,
					description,
				};
			});
		}
	}
});
