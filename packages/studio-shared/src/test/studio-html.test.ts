import {expect, test} from 'bun:test';
import {studioHtml} from '../studio-html';

const makeHtml = ({
	publicPath,
	staticHash,
	publicFolderExists,
}: {
	publicPath: string;
	staticHash: string;
	publicFolderExists: string;
}) => {
	return studioHtml({
		publicPath,
		staticHash,
		editorName: null,
		inputProps: null,
		remotionRoot: '/project',
		studioServerCommand: null,
		renderQueue: null,
		numberOfAudioTags: 0,
		audioLatencyHint: 'playback',
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
	});
};

test('makes relative bundles resolve public assets from the document URL', () => {
	const html = makeHtml({
		publicPath: './',
		staticHash: './public',
		publicFolderExists: './public',
	});

	expect(html).toContain('href="./favicon.ico"');
	expect(html).toContain('src="./bundle.js"');
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
