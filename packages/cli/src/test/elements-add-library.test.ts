import {expect, test} from 'bun:test';
import {
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {
	createElementPayload,
	ELEMENT_PAYLOAD_MIME_TYPE,
	serializeElementPayloadForHtml,
} from '@remotion/studio-protocol';
import {VERSION} from 'remotion/version';

const cliEntry = path.join(__dirname, '..', '..', 'remotion-cli.js');
// Each test starts the CLI several times, which is slow on Windows.
const timeout = 60_000;

const titleCard = createElementPayload({
	displayName: 'Title Card',
	slug: 'title-card',
	sourceCode: `export const TitleCard = () => <h1>Title</h1>;\n`,
	dependencies: [],
	dimensions: null,
	durationInFrames: 30,
});

const existingConfig = `// Shared settings
import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat("jpeg");
Config.addElementLibrary({
	url: 'https://example.com/elements',
	displayName: 'Example',
});

// Keep last
Config.setOverwriteOutput(true);
`;

const makeProject = (configFile: string | null) => {
	const remotionRoot = mkdtempSync(
		path.join(tmpdir(), 'remotion-elements-add-library-'),
	);
	mkdirSync(path.join(remotionRoot, 'src'));
	writeFileSync(
		path.join(remotionRoot, 'package.json'),
		JSON.stringify({
			name: 'my-video',
			private: true,
			dependencies: {
				'@remotion/cli': VERSION,
				react: '19.0.0',
				'react-dom': '19.0.0',
				remotion: VERSION,
			},
		}),
	);
	writeFileSync(path.join(remotionRoot, 'bun.lock'), '');
	writeFileSync(
		path.join(remotionRoot, 'tsconfig.json'),
		JSON.stringify({compilerOptions: {jsx: 'react-jsx'}}),
	);
	if (configFile !== null) {
		writeFileSync(path.join(remotionRoot, 'remotion.config.ts'), configFile);
	}

	writeFileSync(
		path.join(remotionRoot, 'src', 'index.ts'),
		`import {registerRoot} from 'remotion';
import {RemotionRoot} from './Root';

registerRoot(RemotionRoot);
`,
	);
	writeFileSync(
		path.join(remotionRoot, 'src', 'Root.tsx'),
		`import React from 'react';
import {Composition} from 'remotion';
import {Intro} from './Intro';

export const RemotionRoot: React.FC = () => {
	return (
		<Composition id="Intro" component={Intro} durationInFrames={150} fps={30} width={1920} height={1080} />
	);
};
`,
	);
	writeFileSync(
		path.join(remotionRoot, 'src', 'Intro.tsx'),
		`import React from 'react';
import {AbsoluteFill} from 'remotion';

export const Intro: React.FC = () => {
	return <AbsoluteFill style={{backgroundColor: 'white'}} />;
};
`,
	);

	const run = async (args: string[]) => {
		const child = Bun.spawn(['node', cliEntry, 'elements', ...args], {
			cwd: remotionRoot,
			env: {...process.env, CI: 'true'},
			stdin: 'ignore',
			stdout: 'pipe',
			stderr: 'pipe',
		});
		const [stdout, stderr, exitCode] = await Promise.all([
			new Response(child.stdout).text(),
			new Response(child.stderr).text(),
			child.exited,
		]);
		return {
			exitCode,
			// eslint-disable-next-line no-control-regex
			output: `${stdout}${stderr}`.replace(/\u001b\[[0-9;]*m/g, ''),
		};
	};

	return {
		run,
		readConfig: () =>
			readFileSync(path.join(remotionRoot, 'remotion.config.ts'), 'utf-8'),
		readSource: (file: string) =>
			readFileSync(path.join(remotionRoot, 'src', file), 'utf-8'),
		cleanup: () => rmSync(remotionRoot, {recursive: true, force: true}),
	};
};

const serveLibrary = () => {
	const server = Bun.serve({
		port: 0,
		fetch: (request) => {
			const {pathname} = new URL(request.url);
			const html = (head: string) =>
				new Response(
					`<!doctype html><html><head>${head}</head><body></body></html>`,
					{headers: {'content-type': 'text/html; charset=utf-8'}},
				);
			if (pathname === '/studio-supply') {
				return html(
					'<title>Gallery — Studio Supply</title><meta property="og:site_name" content="Studio Supply">',
				);
			}

			if (pathname === '/studio-supply/elements/title-card') {
				return html(
					`<script type="${ELEMENT_PAYLOAD_MIME_TYPE}">${serializeElementPayloadForHtml(titleCard)}</script>`,
				);
			}

			if (pathname === '/unnamed') {
				return html('<title>Unnamed</title>');
			}

			if (pathname === '/catalog.json') {
				return Response.json({
					template: '<meta property="og:site_name" content="Example">',
				});
			}

			return new Response('Not found', {status: 404});
		},
	});
	return {
		origin: `http://localhost:${server.port}`,
		stop: () => server.stop(true),
	};
};

test(
	'adds a library to an existing config and installs an Element from it',
	async () => {
		const project = makeProject(existingConfig);
		const library = serveLibrary();
		try {
			const libraryUrl = `${library.origin}/studio-supply`;
			const added = await project.run(['add-library', libraryUrl]);
			expect(added.output).toContain(
				`Added Studio Supply (${libraryUrl}) to remotion.config.ts.`,
			);
			expect(added.exitCode).toBe(0);
			expect(project.readConfig()).toBe(
				existingConfig +
					`Config.addElementLibrary({
    'url': '${libraryUrl}',
    'displayName': 'Studio Supply'
});
`,
			);

			const again = await project.run([
				'add-library',
				libraryUrl.replace('localhost', 'LOCALHOST'),
			]);
			expect(again.exitCode).toBe(0);
			expect(again.output).toContain(
				`${libraryUrl} is already added to remotion.config.ts. No files were changed.`,
			);
			const existing = await project.run([
				'add-library',
				'https://EXAMPLE.com/elements',
			]);
			expect(existing.exitCode).toBe(0);
			expect(existing.output).toContain(
				'https://example.com/elements is already added to remotion.config.ts.',
			);
			expect(project.readConfig()).toContain(
				'Config.setVideoImageFormat("jpeg");\nConfig.addElementLibrary({\n\turl: \'https://example.com/elements\',',
			);

			const installed = await project.run([
				'use',
				`${libraryUrl}/elements/title-card`,
				'--yes',
			]);
			expect(installed.output).toContain(
				'Installed Title Card into the composition "Intro".',
			);
			expect(installed.exitCode).toBe(0);
			expect(project.readSource('title-card.element.tsx')).toBe(
				titleCard.element.sourceCode,
			);
			expect(project.readSource('Intro.tsx')).toContain('<TitleCard />');
		} finally {
			library.stop();
			project.cleanup();
		}
	},
	timeout,
);

test(
	'creates the first library call, validates the URL and accepts any page',
	async () => {
		const initialConfig = `import {Config as RemotionConfig} from '@remotion/cli/config';

RemotionConfig.setVideoImageFormat('jpeg');
`;
		const project = makeProject(initialConfig);
		const library = serveLibrary();
		try {
			const invalid = await project.run(['add-library', 'not a url']);
			expect(invalid.exitCode).toBe(1);
			expect(invalid.output).toContain(
				'"not a url" is not a valid http:// or https:// URL.',
			);
			const ftp = await project.run(['add-library', 'ftp://example.com']);
			expect(ftp.exitCode).toBe(1);
			expect(ftp.output).toContain(
				'"ftp://example.com" is not a valid http:// or https:// URL.',
			);

			const notFound = await project.run([
				'add-library',
				`${library.origin}/missing`,
			]);
			expect(notFound.exitCode).toBe(1);
			expect(notFound.output).toContain(
				`Could not fetch ${library.origin}/missing: The server responded with HTTP 404.`,
			);

			expect(project.readConfig()).toBe(initialConfig);

			const unnamed = await project.run([
				'add-library',
				`${library.origin}/unnamed`,
			]);
			expect(unnamed.output).toContain(
				`Added ${library.origin}/unnamed to remotion.config.ts.`,
			);
			expect(unnamed.exitCode).toBe(0);

			const json = await project.run([
				'add-library',
				`${library.origin}/catalog.json`,
			]);
			expect(json.output).toContain(
				`Added ${library.origin}/catalog.json to remotion.config.ts.`,
			);
			expect(json.exitCode).toBe(0);

			const twoNames = await project.run([
				'add-library',
				`${library.origin}/studio-supply`,
				'--display-name',
				'A',
				'--display-name',
				'B',
			]);
			expect(twoNames.exitCode).toBe(1);
			expect(twoNames.output).toContain(
				'--display-name must be passed once and must not be empty.',
			);

			const renamed = await project.run([
				'add-library',
				`${library.origin}/studio-supply`,
				'--display-name',
				' My Supply ',
			]);
			expect(renamed.exitCode).toBe(0);
			expect(project.readConfig()).toBe(
				initialConfig +
					`RemotionConfig.addElementLibrary({
    'url': '${library.origin}/unnamed'
});
RemotionConfig.addElementLibrary({
    'url': '${library.origin}/catalog.json'
});
RemotionConfig.addElementLibrary({
    'url': '${library.origin}/studio-supply',
    'displayName': 'My Supply'
});
`,
			);
		} finally {
			library.stop();
			project.cleanup();
		}
	},
	timeout,
);

test(
	'fails without a config file',
	async () => {
		const project = makeProject(null);
		const library = serveLibrary();
		try {
			const result = await project.run([
				'add-library',
				`${library.origin}/studio-supply`,
			]);
			expect(result.exitCode).toBe(1);
			expect(result.output).toContain(
				'Create a remotion.config.ts file to add an Element Library: https://www.remotion.dev/docs/config',
			);
		} finally {
			library.stop();
			project.cleanup();
		}
	},
	timeout,
);
