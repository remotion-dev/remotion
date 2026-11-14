import {expect, test} from 'vitest';
import {server} from 'vitest/browser';
import {svgUseFontData} from './fixtures/svg-use-data-font';
import {createFontFailureRecorder} from './font-failure-recorder';
import {fingerprintCssFontGroups} from './font-group-fingerprint';

for (const preferredTitle of ['A', 'B'] as const) {
	test.for([
		'unicode-composite',
		'persistent-order',
		'persistent-after',
		'style-weight',
		'family-fallback',
		'title-only',
		'no-operation',
		'unsupported-feature',
		'unsupported-feature-no-operation',
		'ambiguous',
	] as const)(
		'preserves pristine original fonts for ' +
			preferredTitle +
			' complete groups: %s',
		async (mode, t) => {
			const noOperation =
				mode === 'no-operation' || mode === 'unsupported-feature-no-operation';
			const unsupportedFeature =
				mode === 'unsupported-feature' ||
				mode === 'unsupported-feature-no-operation';
			const failure = createFontFailureRecorder(t);
			const urls = await svgUseFontData;
			const frame = document.createElement('iframe');
			frame.dataset.testid = 'font-group-' + crypto.randomUUID();
			frame.style.cssText =
				'position:fixed;left:0;top:0;width:900px;height:160px;border:0;z-index:2147483647;background:white';
			document.body.append(frame);
			const ownerDocument = frame.contentDocument!;
			const ownerWindow = ownerDocument.defaultView!;
			const preferred = ownerDocument.createElement('style');
			preferred.title = preferredTitle;
			preferred.textContent = '/* Independent preferred set. */';
			ownerDocument.head.append(preferred);
			const family = 'Complete font group ' + crypto.randomUUID();
			const secondaryFamily = 'Fallback font group ' + crypto.randomUUID();
			const unrelatedFamily = 'Pristine unused original ' + crypto.randomUUID();
			const face = (
				index: number,
				range: string | null,
				declarations: string | null,
			) =>
				'@font-face{font-family:"' +
				family +
				'";src:url("' +
				urls[index] +
				'")' +
				(range ? ';unicode-range:' + range : '') +
				(declarations ?? '') +
				'}';
			const persistent = ownerDocument.createElement('style');
			persistent.textContent = face(
				0,
				mode === 'unicode-composite' || mode === 'family-fallback'
					? 'U+0030-0039'
					: null,
				null,
			);
			if (mode === 'title-only')
				persistent.textContent = face(0, null, null).replace(
					JSON.stringify(family),
					JSON.stringify(secondaryFamily),
				);
			persistent.textContent += face(1, null, null).replace(
				JSON.stringify(family),
				JSON.stringify(unrelatedFamily),
			);
			ownerDocument.head.append(persistent);
			const svg = ownerDocument.createElementNS(
				'http://www.w3.org/2000/svg',
				'svg',
			);
			svg.setAttribute('width', '900');
			svg.setAttribute('height', '160');
			const secondaryFace = (index: number) =>
				face(index, null, null).replace(
					JSON.stringify(family),
					JSON.stringify(secondaryFamily),
				);
			const rulesA =
				mode === 'unicode-composite'
					? face(0, 'U+0000-002F,U+003A-004D', null) +
						face(1, 'U+004E-10FFFF', null)
					: mode === 'style-weight'
						? face(0, null, ';font-style:normal;font-weight:400') +
							face(1, null, ';font-style:italic;font-weight:700')
						: mode === 'family-fallback'
							? secondaryFace(1)
							: face(
									mode === 'ambiguous' || mode === 'title-only' ? 0 : 1,
									null,
									null,
								);
			const rulesB =
				mode === 'unicode-composite'
					? face(1, 'U+0000-002F,U+003A-004D', null) +
						face(0, 'U+004E-10FFFF', null)
					: mode === 'style-weight'
						? face(1, null, ';font-style:normal;font-weight:400') +
							face(0, null, ';font-style:italic;font-weight:700')
						: mode === 'family-fallback' || mode === 'title-only'
							? secondaryFace(0)
							: face(0, null, null);
			const sampleFamilies = (
				JSON.stringify(family) +
				',' +
				(mode === 'family-fallback'
					? JSON.stringify(secondaryFamily) + ','
					: '') +
				'serif'
			).replaceAll('"', '&quot;');
			svg.innerHTML =
				'<style title="A">' +
				rulesA +
				'</style><style title="B">' +
				rulesB +
				'</style><text x="20" y="75" style="font-family:' +
				sampleFamilies +
				';font-size:36px;' +
				(unsupportedFeature
					? 'font-feature-settings:&quot;liga&quot; 0;'
					: '') +
				'">Review 123 AV fi</text>' +
				(mode === 'style-weight'
					? '<text x="20" y="125" style="font-family:' +
						sampleFamilies +
						';font-size:36px;font-style:italic;font-weight:700">Italic AV fi 123</text>'
					: '');

			ownerDocument.body.style.margin = '0';
			ownerDocument.body.append(svg);
			if (mode === 'persistent-after') ownerDocument.body.append(persistent);
			const sampleTexts = Array.from(svg.querySelectorAll('text'));
			const events: {
				phase: string;
				type: string;
				source: boolean;
				faces: {
					family: string;
					privateAlias: boolean;
					status: FontFace['status'];
				}[];
			}[] = [];
			let eventPhase = 'setup';
			const onEvent = (event: Event) =>
				events.push({
					phase: eventPhase,
					type: event.type,
					source: event.currentTarget === ownerDocument.fonts,
					faces:
						'fontfaces' in event
							? Array.from(event.fontfaces as FontFace[], (font) => ({
									family: font.family,
									privateAlias: font.family.startsWith(
										'Remotion private group ',
									),
									status: font.status,
								}))
							: [],
				});
			const sourceCanvas = ownerDocument.createElement('canvas');
			sourceCanvas.width = 900;
			sourceCanvas.height = 160;
			const originalRaster = () => {
				const context = sourceCanvas.getContext('2d', {
					willReadFrequently: true,
				})!;
				context.clearRect(0, 0, 900, 160);
				const metrics = sampleTexts.map((text, index) => {
					const style = ownerWindow.getComputedStyle(text);
					context.font =
						style.fontStyle +
						' ' +
						style.fontWeight +
						' ' +
						style.fontSize +
						' ' +
						style.fontFamily;
					const measured = context.measureText(text.textContent!);
					context.fillText(text.textContent!, 20, 60 + index * 60);
					return [
						measured.width,
						measured.actualBoundingBoxLeft,
						measured.actualBoundingBoxRight,
						measured.actualBoundingBoxAscent,
						measured.actualBoundingBoxDescent,
					];
				});
				return {
					pixels: context.getImageData(0, 0, 900, 160).data,
					metrics,
					base64: sourceCanvas.toDataURL('image/png').split(',')[1],
				};
			};

			try {
				for (const text of sampleTexts) {
					const style = ownerWindow.getComputedStyle(text);
					await ownerDocument.fonts.load(
						style.fontStyle +
							' ' +
							style.fontWeight +
							' ' +
							style.fontSize +
							' ' +
							style.fontFamily,
						text.textContent!,
					);
				}

				await ownerDocument.fonts.load(
					'36px ' + JSON.stringify(unrelatedFamily),
				);
				await ownerDocument.fonts.ready;
				await document.fonts.ready;
				svg.getBBox();
				for (let index = 0; index < 2; index++)
					await new Promise<void>((resolve) =>
						ownerWindow.requestAnimationFrame(() => resolve()),
					);
				const originalBefore = originalRaster();

				const sets = [ownerDocument.fonts, document.fonts];
				const originals = sets.map((set) => Array.from(set));
				const promises = originals.map((faces) =>
					faces.map((font) => font.loaded),
				);
				const readyPromises = sets.map((set) => set.ready);
				const capture = () =>
					sets.map((set, setIndex) => {
						const fonts = Array.from(set);
						return {
							identitiesStable:
								fonts.length === originals[setIndex].length &&
								fonts.every(
									(font, index) => font === originals[setIndex][index],
								),
							promisesStable:
								fonts.length === promises[setIndex].length &&
								fonts.every(
									(font, index) => font.loaded === promises[setIndex][index],
								),
							families: fonts.map((font) => font.family),
							statuses: fonts.map((font) => font.status),
							setStatus: set.status,
							readyPromiseStable: set.ready === readyPromises[setIndex],
						};
					});
				const before = capture();
				const unusedOriginal = originals[0].find(
					(font) => font.family.replace(/^["']|["']$/g, '') === unrelatedFamily,
				)!;
				const unusedOriginalBefore = unusedOriginal.status;

				const beforeMarkup = svg.outerHTML;
				const styles = svg.querySelectorAll('style');
				const rules = (sheet: CSSStyleSheet) =>
					Array.from(sheet.cssRules).filter(
						(rule): rule is CSSFontFaceRule =>
							rule instanceof ownerWindow.CSSFontFaceRule,
					);
				const persistentRules = rules(persistent.sheet!);
				const groupRules = (sheet: CSSStyleSheet) =>
					mode === 'persistent-after'
						? [...rules(sheet), ...persistentRules]
						: [...persistentRules, ...rules(sheet)];
				const beforeRules = [persistent, ...styles].map((style) =>
					Array.from(style.sheet!.cssRules, (rule) => rule.cssText),
				);

				for (const set of sets)
					for (const type of ['loading', 'loadingdone', 'loadingerror'])
						set.addEventListener(type, onEvent);
				eventPhase = 'operation';
				const result = noOperation
					? {matches: [], reason: 'No operation control.'}
					: fingerprintCssFontGroups(
							ownerDocument,
							sampleTexts.map((text) => ({
								text: text.textContent!,
								style: ownerWindow.getComputedStyle(text),
								lang: 'en',
							})),
							[
								{
									name: 'A',
									rules: groupRules(styles[0].sheet!),
								},
								{
									name: 'B',
									rules: groupRules(styles[1].sheet!),
								},
							],
						);
				const immediate = capture();
				eventPhase = 'settling';
				for (let index = 0; index < 2; index++)
					await new Promise<void>((resolve) =>
						ownerWindow.requestAnimationFrame(() => resolve()),
					);
				const settled = capture();
				const filename =
					'validation/svg-title-font-group-pristine/' +
					server.browser +
					'/' +
					preferredTitle +
					'-' +
					mode;
				const operationReport = () =>
					JSON.stringify(
						{
							preferredTitle,
							mode,
							result,
							before,
							immediate,
							settled,
							unusedOriginalFamily: unrelatedFamily,
							unusedOriginalBefore,
							unusedOriginalCurrent: unusedOriginal.status,
							noNativeScreenshot: true,
							current: capture(),
							events,
						},
						null,
						2,
					);

				await failure.record(filename + '-operation.json', operationReport());
				await failure.record(
					filename + '-before.png',
					originalBefore.base64,
					'base64',
				);
				// This cohort observes pristine original fonts without any native screenshot.
				expect(
					originalBefore.pixels.some(
						(value, index) => index % 4 === 3 && value > 0,
					),
				).toBe(true);
				expect(unusedOriginalBefore).toBe('loaded');
				expect(unusedOriginal.status).toBe('loaded');
				expect(immediate).toEqual(before);
				expect(settled).toEqual(before);
				expect(capture()).toEqual(before);
				expect(events).toEqual([]);
				expect(svg.outerHTML).toBe(beforeMarkup);
				expect(
					[persistent, ...styles].map((style) =>
						Array.from(style.sheet!.cssRules, (rule) => rule.cssText),
					),
				).toEqual(beforeRules);
				if (noOperation)
					expect(result).toEqual({
						matches: [],
						reason: 'No operation control.',
					});
				else if (mode === 'unsupported-feature') {
					expect(result.matches).toEqual([]);
					expect(result.reason).toContain('font-feature-settings');
				} else if (mode === 'ambiguous' || mode === 'persistent-after') {
					expect(result.matches).toEqual(['A', 'B']);
					expect(result.reason).toContain('ambiguous');
				} else
					expect(result).toEqual({matches: [preferredTitle], reason: null});
				const operationEvents = [...events];
				const originalAfter = originalRaster();
				const afterOriginalRaster = capture();
				let differentPixels = 0;
				for (let index = 0; index < originalBefore.pixels.length; index += 4) {
					if (
						[0, 1, 2, 3].some(
							(channel) =>
								originalBefore.pixels[index + channel] !==
								originalAfter.pixels[index + channel],
						)
					)
						differentPixels++;
				}

				await failure.record(
					filename + '-after.png',
					originalAfter.base64,
					'base64',
				);
				await failure.record(
					filename + '.json',
					JSON.stringify(
						{
							preferredTitle,
							mode,
							result,
							before,
							immediate,
							settled,
							afterOriginalRaster,
							operationEvents,
							events,
							unusedOriginalBefore,
							unusedOriginalAfter: unusedOriginal.status,
							originalRasterMismatchedPixels: differentPixels,
							beforeMetrics: originalBefore.metrics,
							afterMetrics: originalAfter.metrics,
							noNativeScreenshot: true,
						},
						null,
						2,
					),
				);
				expect(afterOriginalRaster).toEqual(before);
				expect(events).toEqual([]);
				expect(unusedOriginal.status).toBe('loaded');
				expect(differentPixels).toBe(0);
				expect(originalAfter.metrics).toEqual(originalBefore.metrics);
				expect(svg.outerHTML).toBe(beforeMarkup);
			} finally {
				for (const set of [ownerDocument.fonts, document.fonts])
					for (const type of ['loading', 'loadingdone', 'loadingerror'])
						set.removeEventListener(type, onEvent);
				sourceCanvas.width = 0;
				sourceCanvas.height = 0;
				frame.remove();
			}
		},
	);
}
