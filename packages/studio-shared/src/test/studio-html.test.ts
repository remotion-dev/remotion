import {expect, test} from 'bun:test';
import {studioHtml} from '../studio-html';

const makeHtml = ({
	bundleScriptType,
	importMap,
	publicPath,
	staticHash,
	publicFolderExists,
}: {
	bundleScriptType?: 'module';
	importMap: Record<string, string> | null;
	publicPath: string;
	staticHash: string;
	publicFolderExists: string;
}) => {
	return studioHtml({
		importMap,
		publicPath,
		staticHash,
		editorName: null,
		inputProps: null,
		remotionRoot: '/project',
		studioServerCommand: null,
		renderQueue: null,
		numberOfAudioTags: 0,
		audioLatencyHint: 'playback',
		experimentalKeepAudioContextAlive: true,
		sampleRate: 48000,
		publicFiles: [
			{
				name: 'image.png',
				lastModified: 0,
				sizeInBytes: 100,
				src: `${staticHash}/image.png`,
			},
		],
		publicFolderExists,
		fileSystemPlatform: null,
		includeFavicon: true,
		title: 'Remotion Bundle',
		renderDefaults: undefined,
		gitSource: null,
		projectName: 'test',
		installedDependencies: null,
		packageManager: 'unknown',
		logLevel: 'info',
		mode: 'bundle',
		bundleScriptType,
	});
};

test('makes relative bundles resolve public assets from the document URL', () => {
	const html = makeHtml({
		importMap: null,
		publicPath: './',
		staticHash: './public',
		publicFolderExists: './public',
	});

	expect(html).toContain('href="./favicon.ico"');
	expect(html).toContain('src="./bundle.js"');
	expect(html).toContain(
		'window.remotion_experimentalKeepAudioContextAlive = true;',
	);
	expect(html).toContain(
		'window.remotion_staticBase = new URL("./public", window.location.href).pathname;',
	);
	expect(html).toContain(
		'src: new URL(file.src, window.location.href).pathname',
	);
	expect(html).toContain(
		'window.remotion_publicFolderExists = new URL("./public", window.location.href).pathname;',
	);

	expect(
		new URL('./public/image.png', 'https://example.com/sites/alpha/index.html')
			.pathname,
	).toBe('/sites/alpha/public/image.png');
});

test('preserves explicitly absolute bundle paths', () => {
	const html = makeHtml({
		importMap: null,
		publicPath: '/sites/alpha/',
		staticHash: '/sites/alpha/public',
		publicFolderExists: '/sites/alpha/public',
	});

	expect(html).toContain('href="/sites/alpha/favicon.ico"');
	expect(html).toContain('src="/sites/alpha/bundle.js"');
	expect(html).toContain('window.remotion_staticBase = "/sites/alpha/public";');
	expect(html).toContain(
		'window.remotion_publicFolderExists = "/sites/alpha/public";',
	);
	expect(html).not.toContain('.map((file)');
});

test('marks an explicitly requested module bundle', () => {
	const html = makeHtml({
		bundleScriptType: 'module',
		importMap: null,
		publicPath: './',
		staticHash: './public',
		publicFolderExists: './public',
	});

	expect(html).toContain('<script type="module" src="./bundle.js"></script>');
});

test('places an escaped import map before the bundle script', () => {
	const html = makeHtml({
		bundleScriptType: 'module',
		importMap: {
			'@huggingface/transformers':
				'https://example.com/transformers.mjs?</script>',
		},
		publicPath: './',
		staticHash: './public',
		publicFolderExists: './public',
	});
	const importMap =
		'<script type="importmap">{"imports":{"@huggingface/transformers":"https://example.com/transformers.mjs?\\u003c/script>"}}</script>';
	const bundleScript = '<script type="module" src="./bundle.js"></script>';

	expect(html).toContain(importMap);
	expect(html.indexOf(importMap)).toBeLessThan(html.indexOf(bundleScript));
});
