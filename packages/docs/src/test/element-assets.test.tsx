import {expect, test} from 'bun:test';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {createBlankTemplateProject} from '@remotion/browser-studio';
import {Player} from '@remotion/player';
import {
	staticFileRef,
	StudioProtocolInternals,
} from '@remotion/studio-protocol';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
// Exercise the real installer without exposing its internal operations as public API.
// eslint-disable-next-line no-restricted-imports
import {createBrowserStudioOperations} from '../../../browser-studio/src/browser-studio-operations';
import {audioOscilloscopeAudio} from '../../elements/audio/oscilloscope/initial-props';
import type {ElementDefinition} from '../components/Elements/element-definitions';
import {createElementPayloadFromDefinition} from '../components/Elements/element-drag-data';
import {getElementDefinition} from '../components/Elements/element-utils';
import {ElementPreviewComposition} from '../components/Elements/ElementPreviewComposition';

test.each(['oscilloscope', 'embedded-image'] as const)(
	'previews and installs gallery assets: %s',
	async (example) => {
		const oscilloscope: ElementDefinition =
			getElementDefinition('audio/oscilloscope');
		const image = {
			path: 'elements/image/logo.svg',
			type: 'base64',
			data: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>').toString(
				'base64',
			),
		} as const;
		const imagePreviewUrl = `data:image/svg+xml;base64,${image.data}`;
		const definition: ElementDefinition =
			example === 'oscilloscope'
				? {
						...oscilloscope,
						initialProps: {...oscilloscope.initialProps, lineColor: '#123456'},
					}
				: {
						...oscilloscope,
						slug: 'image',
						component: ({
							images,
							label,
						}: {
							images: {src: string}[];
							label: string;
						}) => <img src={images[0].src} alt={label} />,
						dependencies: [],
						installationMode: 'wrapped',
						assets: [image],
						initialProps: {
							images: [{src: imagePreviewUrl}],
							label: 'Preview logo',
						},
						installationProps: {images: [{src: staticFileRef(image.path)}]},
					};
		const sourceCode =
			example === 'oscilloscope'
				? readFileSync(
						path.join(
							__dirname,
							'../../elements/audio/oscilloscope/audio-oscilloscope.tsx',
						),
						'utf8',
					)
				: 'export const ImageElement = ({images, label}: {images: {src: string}[]; label: string}) => <img src={images[0].src} alt={label} />;';

		if (example === 'embedded-image') {
			const markup = renderToStaticMarkup(
				<Player
					acknowledgeRemotionLicense
					component={ElementPreviewComposition}
					inputProps={{definition}}
					compositionWidth={definition.width}
					compositionHeight={definition.height}
					durationInFrames={definition.durationInFrames}
					fps={definition.fps}
				/>,
			);
			expect(markup).toContain(
				`<img src="${imagePreviewUrl}" alt="Preview logo"`,
			);
		} else {
			expect(definition.initialProps?.audioSrc).toBe(
				audioOscilloscopeAudio.url,
			);
		}

		const payload = createElementPayloadFromDefinition({
			definition,
			sourceCode,
		});
		const parsed = StudioProtocolInternals.parseStudioElementPayload(
			JSON.parse(JSON.stringify(payload)),
		);
		expect(parsed).not.toBeNull();
		if (!parsed) {
			throw new Error('Expected a valid gallery installation payload');
		}

		const element = {
			...parsed.element,
			durationInFrames: parsed.durationInFrames,
			installationMode: parsed.element.installationMode ?? null,
		};
		const initialProject = createBlankTemplateProject();
		let project = initialProject;
		const operations = createBrowserStudioOperations({
			dependencyVersions: {remotion: '4.0.999'},
			getStaticFiles: null,
			getProject: () => project,
			initialElement: null,
			onProjectChange: (nextProject) => {
				project = nextProject;
			},
			resolveDependencies: null,
		});
		const preflight = await operations.prepareElementInstall({
			installationName: null,
			destination: {
				type: 'current-composition',
				compositionFile: '/project/src/Composition.tsx',
				compositionId: 'MyComp',
			},
			element,
		});
		if (!preflight.success) {
			throw new Error(preflight.reason);
		}

		const fetchedUrls: string[] = [];
		const originalFetch = globalThis.fetch;
		globalThis.fetch = Object.assign(
			(url: Parameters<typeof fetch>[0]) => {
				fetchedUrls.push(String(url));
				return Promise.resolve(new Response(new Uint8Array([1, 2, 3])));
			},
			{preconnect: originalFetch.preconnect},
		);
		try {
			const installed = await operations.insertElement({
				installationName: null,
				compositionFile: '/project/src/Composition.tsx',
				compositionId: 'MyComp',
				element,
				expectedFileState: preflight.plan.expectedFileState,
				from: 0,
				overwriteExisting: false,
				position: null,
				undoRedoNavigation: null,
				newComposition: null,
			});
			if (!installed.success) {
				throw new Error(
					installed.type === 'error'
						? installed.reason
						: 'Unexpected file conflict',
				);
			}
		} finally {
			globalThis.fetch = originalFetch;
		}

		const caller = project.files['/project/src/Composition.tsx'];
		expect(project.files[`/project/${preflight.plan.filePath}`]).toBe(
			sourceCode,
		);
		if (example === 'oscilloscope') {
			expect(fetchedUrls).toEqual([audioOscilloscopeAudio.url]);
			expect(project.publicFiles?.[audioOscilloscopeAudio.path]).toEqual(
				new Uint8Array([1, 2, 3]),
			);
			expect(caller).toContain(`staticFile("${audioOscilloscopeAudio.path}")`);
			expect(caller).toContain('lineColor="#123456"');
		} else {
			expect(fetchedUrls).toEqual([]);
			expect(project.publicFiles?.[image.path]).toEqual(
				new Uint8Array(Buffer.from(image.data, 'base64')),
			);
			expect(caller).toContain(`staticFile("${image.path}")`);
			expect(caller).toContain('label="Preview logo"');
		}

		expect((await operations.undo()).success).toBe(true);
		expect(project.files['/project/src/Composition.tsx']).toBe(
			initialProject.files['/project/src/Composition.tsx'],
		);
		expect((await operations.redo()).success).toBe(true);
		expect(project.files['/project/src/Composition.tsx']).toBe(caller);
	},
);
