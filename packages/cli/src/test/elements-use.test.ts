import {expect, test} from 'bun:test';
import {
	chmodSync,
	existsSync,
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
	staticFileRef,
} from '@remotion/studio-protocol';
import {VERSION} from 'remotion/version';

const cliEntry = path.join(__dirname, '..', '..', 'remotion-cli.js');
// Each test starts the CLI several times, which is slow on Windows.
const timeout = 60_000;

const lowerThird = createElementPayload({
	displayName: 'Lower Third',
	slug: 'lower-third',
	sourceCode: `import {Img, AbsoluteFill} from 'remotion';
import {noise2D} from '@remotion/noise';

export const LowerThird = ({logoSrc, title}: {logoSrc: string; title: string}) => (
	<AbsoluteFill style={{opacity: 0.5 + noise2D('logo', 0, 0) / 2}}>
		<Img src={logoSrc} />
		<h1>{title}</h1>
	</AbsoluteFill>
);
`,
	dependencies: [
		{name: '@remotion/noise', version: null},
		{name: 'lodash', version: '4.17.21'},
		{name: '@remotion/shapes', version: null},
	],
	dimensions: {width: 900, height: 260},
	durationInFrames: 72,
	assets: [{path: 'elements/logo.png', type: 'base64', data: 'iVBORw=='}],
	initialProps: {
		logoSrc: staticFileRef('elements/logo.png'),
		title: 'Hello world',
	},
});

const titleCard = createElementPayload({
	displayName: 'Title Card',
	slug: 'title-card',
	sourceCode: `export const TitleCard = () => <h1>Title</h1>;\n`,
	dependencies: [],
	dimensions: null,
	durationInFrames: 30,
});

const makeProject = () => {
	const remotionRoot = mkdtempSync(
		path.join(tmpdir(), 'remotion-elements-use-'),
	);
	mkdirSync(path.join(remotionRoot, 'src'));
	writeFileSync(
		path.join(remotionRoot, 'package.json'),
		JSON.stringify({
			name: 'my-video',
			private: true,
			dependencies: {
				'@remotion/cli': VERSION,
				'@remotion/shapes': VERSION,
				react: '19.0.0',
				'react-dom': '19.0.0',
				remotion: VERSION,
			},
		}),
	);
	writeFileSync(path.join(remotionRoot, 'bun.lock'), '');
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
import {Outro} from './Outro';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition id="Intro" component={Intro} durationInFrames={150} fps={30} width={1920} height={1080} />
			<Composition id="Outro" component={Outro} durationInFrames={150} fps={30} width={1920} height={1080} />
		</>
	);
};
`,
	);
	for (const name of ['Intro', 'Outro']) {
		writeFileSync(
			path.join(remotionRoot, 'src', `${name}.tsx`),
			`import React from 'react';
import {AbsoluteFill} from 'remotion';

export const ${name}: React.FC = () => {
	return <AbsoluteFill style={{backgroundColor: 'white'}} />;
};
`,
		);
	}

	// The package manager is an external process. A fake `bun` records the call.
	const binDir = path.join(remotionRoot, 'fake-bin');
	mkdirSync(binDir);
	const packageManagerLog = path.join(remotionRoot, 'package-manager.log');
	writeFileSync(
		path.join(binDir, 'bun'),
		`#!/bin/sh\necho "$@" >> "${packageManagerLog}"\n`,
	);
	chmodSync(path.join(binDir, 'bun'), 0o755);
	// On Windows, the package manager runs through cmd.exe, which looks in the
	// working directory before PATH.
	writeFileSync(
		path.join(remotionRoot, 'bun.cmd'),
		['@echo off', `echo %*>> "${packageManagerLog}"`].join('\r\n'),
	);
	// Windows names the variable `Path`. Replace it instead of adding a second one.
	const env: Record<string, string | undefined> = Object.fromEntries(
		Object.entries(process.env).filter(([key]) => key.toUpperCase() !== 'PATH'),
	);
	env.PATH = `${binDir}${path.delimiter}${process.env.PATH}`;
	env.CI = 'true';

	const run = async (args: string[]) => {
		const child = Bun.spawn(['node', cliEntry, 'elements', 'use', ...args], {
			cwd: remotionRoot,
			env,
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
		remotionRoot,
		run,
		readSource: (file: string) =>
			readFileSync(path.join(remotionRoot, 'src', file), 'utf-8'),
		packageManagerCalls: () =>
			existsSync(packageManagerLog)
				? readFileSync(packageManagerLog, 'utf-8')
						.trim()
						.split(/\r?\n/)
						.map((line) => line.trim())
				: [],
		cleanup: () => rmSync(remotionRoot, {recursive: true, force: true}),
	};
};

const serveLibrary = () => {
	const scriptTag = (payload: unknown) =>
		`<script type="${ELEMENT_PAYLOAD_MIME_TYPE}">${serializeElementPayloadForHtml(payload as typeof lowerThird)}</script>`;
	const server = Bun.serve({
		port: 0,
		fetch: (request) => {
			const {pathname} = new URL(request.url);
			const html = (body: string) =>
				new Response(
					`<!doctype html><html><head>${body}</head><body></body></html>`,
					{
						headers: {'content-type': 'text/html'},
					},
				);
			if (pathname === '/elements/lower-third') {
				return html(`<title>Lower Third</title>${scriptTag(lowerThird)}`);
			}

			if (pathname === '/elements/old-spa') {
				return new Response(null, {
					status: 301,
					headers: {location: '/elements/spa'},
				});
			}

			if (pathname === '/elements/spa') {
				return html(
					`<link rel="alternate" type="${ELEMENT_PAYLOAD_MIME_TYPE}" href="../payloads/title-card.json">`,
				);
			}

			if (pathname === '/payloads/title-card.json') {
				return Response.json(titleCard);
			}

			if (pathname === '/gallery') {
				return html(scriptTag(lowerThird) + scriptTag(titleCard));
			}

			if (pathname === '/about') {
				return html('<title>About</title>');
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
	'installs an Element embedded in a page into the chosen composition',
	async () => {
		const project = makeProject();
		const library = serveLibrary();
		try {
			const pageUrl = `${library.origin}/elements/lower-third`;

			const withoutComposition = await project.run([pageUrl, '--yes']);
			expect(withoutComposition.exitCode).toBe(1);
			expect(withoutComposition.output).toContain(
				'Pass the composition to add the Element to with --composition <id>. Available compositions:\n  Intro\n  Outro',
			);

			const withoutConfirmation = await project.run([
				pageUrl,
				'--composition',
				'Outro',
			]);
			expect(withoutConfirmation.exitCode).toBe(1);
			expect(withoutConfirmation.output).toContain(`Source      ${pageUrl}`);
			expect(withoutConfirmation.output).toContain(
				'Element     Lower Third (lower-third)',
			);
			expect(withoutConfirmation.output).toContain(
				'Creates     src/lower-third.element.tsx',
			);
			expect(withoutConfirmation.output).toContain(
				'Changes     src/Outro.tsx (composition "Outro")',
			);
			expect(withoutConfirmation.output).toContain(
				'Installs    @remotion/noise, lodash@4.17.21, @remotion/shapes (already installed)',
			);
			expect(withoutConfirmation.output).toContain(
				'Assets      public/elements/logo.png',
			);
			expect(withoutConfirmation.output).toContain('Pass --yes');
			expect(
				existsSync(
					path.join(project.remotionRoot, 'src', 'lower-third.element.tsx'),
				),
			).toBe(false);
			expect(project.packageManagerCalls()).toEqual([]);

			const installed = await project.run([
				pageUrl,
				'--composition',
				'Outro',
				'--yes',
			]);
			expect(installed.output).toContain(
				'Installed Lower Third into the composition "Outro".',
			);
			expect(installed.exitCode).toBe(0);
			expect(project.readSource('lower-third.element.tsx')).toBe(
				lowerThird.element.sourceCode,
			);
			const outro = project.readSource('Outro.tsx');
			expect(outro).toContain(
				"import {LowerThird} from './lower-third.element';",
			);
			expect(outro).toContain('name="Lower Third"');
			expect(outro).toContain('durationInFrames={72}');
			expect(outro).toContain("translate: '510px 410px'");
			expect(outro).toContain(
				`<LowerThird logoSrc={staticFile('elements/logo.png')} title="Hello world" />`,
			);
			expect(project.readSource('Intro.tsx')).not.toContain('LowerThird');
			expect(
				readFileSync(
					path.join(project.remotionRoot, 'public', 'elements', 'logo.png'),
				),
			).toEqual(Buffer.from('iVBORw==', 'base64'));
			expect(project.packageManagerCalls()).toEqual([
				'i --ignore-scripts @remotion/noise@' + VERSION + ' lodash@4.17.21',
			]);

			writeFileSync(
				path.join(project.remotionRoot, 'src', 'lower-third.element.tsx'),
				'export const LowerThird = () => null;\n',
			);
			const conflict = await project.run([
				pageUrl,
				'--composition',
				'Intro',
				'--yes',
			]);
			expect(conflict.exitCode).toBe(1);
			expect(conflict.output).toContain(
				'src/lower-third.element.tsx already exists with different contents. Pass --overwrite to replace it.',
			);
			expect(project.readSource('Intro.tsx')).not.toContain('LowerThird');
		} finally {
			library.stop();
			project.cleanup();
		}
	},
	timeout,
);

test(
	'follows linked payloads and asks to choose between several Elements',
	async () => {
		const project = makeProject();
		const library = serveLibrary();
		try {
			const linked = await project.run([
				`${library.origin}/elements/old-spa`,
				'--composition',
				'Intro',
				'--yes',
			]);
			expect(linked.output).toContain(
				'Installed Title Card into the composition "Intro".',
			);
			expect(linked.output).toContain('Installs    No packages');
			expect(linked.exitCode).toBe(0);
			expect(project.readSource('title-card.element.tsx')).toBe(
				titleCard.element.sourceCode,
			);
			expect(project.readSource('Intro.tsx')).toContain('<TitleCard />');

			const gallery = await project.run([`${library.origin}/gallery`, '--yes']);
			expect(gallery.exitCode).toBe(1);
			expect(gallery.output).toContain(
				'contains 2 Elements. Choose one with --element <slug>:\n  lower-third\n  title-card',
			);

			const unknownSlug = await project.run([
				`${library.origin}/gallery`,
				'--element',
				'nope',
			]);
			expect(unknownSlug.exitCode).toBe(1);
			expect(unknownSlug.output).toContain(
				'does not contain an Element with the slug "nope". Available Elements:\n  lower-third\n  title-card',
			);

			const noPayload = await project.run([`${library.origin}/about`]);
			expect(noPayload.exitCode).toBe(1);
			expect(noPayload.output).toContain(
				`No Element found on ${library.origin}/about. The Element library must embed the Element payload in the page's HTML: https://www.remotion.dev/docs/studio-protocol/serialize-element-payload-for-html`,
			);

			const notFound = await project.run([`${library.origin}/missing`]);
			expect(notFound.exitCode).toBe(1);
			expect(notFound.output).toContain(
				`Could not fetch ${library.origin}/missing: The server responded with HTTP 404.`,
			);

			const unknownComposition = await project.run([
				`${library.origin}/elements/spa`,
				'--composition',
				'Nope',
			]);
			expect(unknownComposition.exitCode).toBe(1);
			expect(unknownComposition.output).toContain(
				'Could not find a composition with the ID "Nope". Available compositions:\n  Intro\n  Outro',
			);
		} finally {
			library.stop();
			project.cleanup();
		}
	},
	timeout,
);
