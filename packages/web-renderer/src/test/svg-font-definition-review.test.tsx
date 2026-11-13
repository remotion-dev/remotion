import {NoReactInternals} from 'remotion/no-react';
import {expect, test, vi} from 'vitest';
import {server} from 'vitest/browser';
import '../symbol-dispose';
import {renderStillOnWeb} from '../render-still-on-web';
import {
	svgDefinitionModes,
	svgDefinitionFont,
	svgDefinitionFontUrl,
	svgWildcardStyleModes,
	svgWildcardStyle,
} from './fixtures/svg-font-definition-review';
import {captureNativeReference, compareNativePixels} from './native-reference';
import {testCompositions} from './utils';

test('preserves wildcard style selectors', async () => {
	await testCompositions({
		cases: svgWildcardStyleModes.map((mode) => ({
			composition: svgWildcardStyle({mode, literal: false}),
			frame: 1,
		})),
		columns: 3,
		testId: 'svg-wildcard-style-selectors',
		scale: null,
	});
});

test.for(
	svgDefinitionModes.flatMap((mode) => [0, 1].map((frame) => ({mode, frame}))),
)(
	'fetches only instantiated definition $mode frame $frame',
	async ({mode, frame}, t) => {
		const data = await (await fetch(svgDefinitionFontUrl)).arrayBuffer();
		const dataUrl = await new Promise<string>((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = () => reject(reader.error);
			reader.readAsDataURL(new Blob([data], {type: 'font/woff2'}));
		});
		const composition = svgDefinitionFont({
			mode,
			fontUrl: svgDefinitionFontUrl,
		});
		const control = svgDefinitionFont({mode, fontUrl: dataUrl});
		const reference = await captureNativeReference(composition, frame, {
			omitBackground: false,
		});
		const nativeControl = await captureNativeReference(control, frame, {
			omitBackground: false,
		});
		const nativeComparison = await compareNativePixels(
			reference,
			nativeControl,
		);
		const used =
			mode === 'pattern' ||
			mode === 'mask' ||
			mode === 'clip-path' ||
			mode === 'pattern-chain' ||
			mode === 'root-mask' ||
			mode === 'root-clip-path' ||
			mode === 'filter-image' ||
			mode === 'direct' ||
			mode === 'use-target' ||
			mode === 'nested' ||
			mode === 'symbol' ||
			mode === 'hidden-defs' ||
			mode === 'hidden-source-group';
		const fetchFont = vi.spyOn(NoReactInternals, 'fetchFontData');
		if (used) fetchFont.mockResolvedValue(data);
		else
			fetchFont.mockRejectedValue(
				new Error('Unused definition font must not be requested'),
			);
		try {
			const options = {
				frame,
				inputProps: {},
				licenseKey: 'free-license',
				allowHtmlInCanvas: false,
			} as const;
			const serialized: string[] = [];
			const serialize = XMLSerializer.prototype.serializeToString;
			const serializer = vi
				.spyOn(XMLSerializer.prototype, 'serializeToString')
				.mockImplementation(function (this: XMLSerializer, node) {
					const markup = serialize.call(this, node);
					if (mode === 'filter-image') serialized.push(markup);
					return markup;
				});
			try {
				const actual = await (
					await renderStillOnWeb({...options, composition})
				).blob({format: 'png'});
				const actualSvg = serialized.at(-1) ?? null;
				expect(fetchFont).toHaveBeenCalledTimes(used ? 1 : 0);
				const expected = await (
					await renderStillOnWeb({...options, composition: control})
				).blob({format: 'png'});
				const comparison = await compareNativePixels(expected, actual);
				const evidence = comparison.evidence ?? nativeComparison.evidence;
				if (evidence && mode === 'filter-image') {
					for (const [name, blob] of [
						['renderer-url', actual],
						['renderer-data', expected],
					] as const) {
						let binary = '';
						for (const byte of new Uint8Array(await blob.arrayBuffer()))
							binary += String.fromCharCode(byte);
						await server.commands.writeFile(
							`${evidence}/${name}.png`,
							btoa(binary),
							'base64',
						);
					}

					await server.commands.writeFile(
						`${evidence}/serialized-svg.json`,
						JSON.stringify(
							{
								actualSvg,
								expectedSvg: serialized.at(-1) ?? null,
								nativeMismatchedPixels: nativeComparison.mismatchedPixels,
								rendererMismatchedPixels: comparison.mismatchedPixels,
							},
							null,
							2,
						),
					);
				}

				expect(nativeComparison.mismatchedPixels).toBe(0);
				expect(comparison.mismatchedPixels).toBe(0);
				if (!used || t.task.file.projectName === 'chromium')
					expect(
						(await compareNativePixels(reference, actual)).mismatchedPixels,
					).toBe(0);
			} finally {
				serializer.mockRestore();
			}
		} catch (error) {
			if (mode === 'root-mask') {
				const evidence = `src/test/__screenshots__/native-pixel-failures/${server.browser}/svg-root-mask-${frame}-${crypto.randomUUID()}`;
				for (const [name, blob] of [
					['native', reference],
					['native-control', nativeControl],
				] as const) {
					let binary = '';
					for (const byte of new Uint8Array(await blob.arrayBuffer()))
						binary += String.fromCharCode(byte);
					await server.commands.writeFile(
						`${evidence}/${name}.png`,
						btoa(binary),
						'base64',
					);
				}

				await server.commands.writeFile(
					`${evidence}/rejection.json`,
					JSON.stringify({
						mode,
						frame,
						browser: server.browser,
						platform: server.platform,
						runtime: server.version,
						userAgent: navigator.userAgent,
						devicePixelRatio: window.devicePixelRatio,
						error: error instanceof Error ? error.stack : String(error),
					}),
				);
			}

			throw error;
		} finally {
			fetchFont.mockRestore();
		}
	},
);
