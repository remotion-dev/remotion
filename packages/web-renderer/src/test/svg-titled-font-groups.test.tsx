import {expect, test} from 'vitest';
import {server} from 'vitest/browser';
import {getSvgFontSnapshot} from '../drawing/turn-svg-into-drawable';
import {svgExternalFontReady} from './fixtures/svg-external-font-selection';
import '../symbol-dispose';
import {
	svgTitledFontGroup,
	svgTitledFontGroupModes,
} from './fixtures/svg-titled-font-groups';
import {svgUseFontData} from './fixtures/svg-use-data-font';
import {createFontFailureRecorder} from './font-failure-recorder';
import {testCompositions} from './utils';

test('preserves titled font groups', async () => {
	await testCompositions({
		cases: svgTitledFontGroupModes.map((mode) => ({
			composition: svgTitledFontGroup(mode, false, false),
			frame: 1,
		})),
		columns: 3,
		testId: 'svg-titled-font-groups',
		scale: null,
	});
});

test('collects only the preferred titled CSS font face', async (t) => {
	const failure = createFontFailureRecorder(t);
	const urls = await svgUseFontData;
	await svgExternalFontReady;
	const family = 'SVG review preferred face';
	const unrelatedFamily = 'SVG review unrelated face';
	const unrelated = document.createElement('style');
	unrelated.textContent = `@font-face{font-family:"${unrelatedFamily}";src:url("${urls[1]}")}`;
	const preferred = document.createElement('style');
	preferred.title = 'A';
	preferred.textContent = '/* Preferred font stylesheet set. */';
	document.head.appendChild(preferred);
	document.head.appendChild(unrelated);
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.innerHTML = `<style title="A">@font-face{font-family:"${family}";src:url("${urls[0]}")}</style><style title="B">@font-face{font-family:"${family}";src:url("${urls[1]}")}</style><text style="font-family:&quot;${family}&quot;;font-size:36px">Review font</text>`;
	document.body.appendChild(svg);
	const fontEvents: string[] = [];
	const onFontEvent = (event: Event) => fontEvents.push(event.type);
	try {
		await document.fonts.load(`36px "${family}"`);
		await document.fonts.load(`36px "${unrelatedFamily}"`);
		const beforeMarkup = svg.outerHTML;
		const beforeRules = Array.from(svg.querySelectorAll('style'), (style) =>
			Array.from(style.sheet!.cssRules, (rule) => rule.cssText),
		);
		const bounds = () => {
			const {x, y, width, height} = svg.getBBox();
			return {x, y, width, height};
		};

		await document.fonts.ready;
		const beforeBounds = bounds();
		for (let index = 0; index < 2; index++)
			await new Promise<void>((resolve) =>
				requestAnimationFrame(() => resolve()),
			);
		const beforeFonts = Array.from(document.fonts);
		const beforeStatuses = beforeFonts.map((face) => face.status);
		const beforePromises = beforeFonts.map((face) => face.loaded);
		const beforeReady = document.fonts.ready;
		for (const type of ['loading', 'loadingdone', 'loadingerror'])
			document.fonts.addEventListener(type, onFontEvent);
		const immediateStates: {
			identitiesStable: boolean;
			promisesStable: boolean;
			readyStable: boolean;
			setStatus: FontFaceSet['status'];
			statuses: FontFace['status'][];
		}[] = [];
		const recordImmediateState = () => {
			const fonts = Array.from(document.fonts);
			immediateStates.push({
				identitiesStable:
					fonts.length === beforeFonts.length &&
					fonts.every((face, index) => face === beforeFonts[index]),
				promisesStable:
					fonts.length === beforePromises.length &&
					fonts.every((face, index) => face.loaded === beforePromises[index]),
				readyStable: document.fonts.ready === beforeReady,
				setStatus: document.fonts.status,
				statuses: fonts.map((face) => face.status),
			});
		};

		// Exercise a genuinely cold registration failure before warming candidate data.
		const [active, inactive] = Array.from(
			svg.querySelectorAll('style'),
			(style) => style.sheet!,
		);

		const addFont = document.fonts.add;
		const registrationAttempts: {family: string; sourceFace: boolean}[] = [];
		let injectedCount = 0;
		document.fonts.add = (font) => {
			const result = addFont.call(document.fonts, font);
			const sourceFace = beforeFonts.includes(font);
			registrationAttempts.push({family: font.family, sourceFace});
			if (!sourceFace) {
				injectedCount++;
				throw new DOMException(
					'Owned font registration rejected',
					'SecurityError',
				);
			}

			return result;
		};

		try {
			expect(() => getSvgFontSnapshot(svg)).toThrow(
				'Owned font registration rejected',
			);
		} finally {
			document.fonts.add = addFont;
			await failure.record(
				`validation/svg-titled-font-groups/${server.browser}/registration-fault.json`,
				JSON.stringify({registrationAttempts, injectedCount}),
			);
		}

		expect(injectedCount).toBeGreaterThan(0);
		expect(registrationAttempts.every(({sourceFace}) => !sourceFace)).toBe(
			true,
		);
		recordImmediateState();
		const failedProbeState = immediateStates.at(-1)!;
		expect(failedProbeState.identitiesStable).toBe(true);
		expect(failedProbeState.promisesStable).toBe(true);
		expect(failedProbeState.readyStable).toBe(true);
		expect(failedProbeState.setStatus).toBe('loaded');
		expect(failedProbeState.statuses).toEqual(beforeStatuses);
		expect(svg.outerHTML).toBe(beforeMarkup);
		expect(
			document.querySelector('[data-remotion-font-sheet-probe]'),
		).toBeNull();
		expect(Array.from(active.cssRules, (rule) => rule.cssText)).toEqual(
			beforeRules[0],
		);

		const snapshot = getSvgFontSnapshot(svg);
		recordImmediateState();
		for (let repeat = 0; repeat < 4; repeat++) {
			const repeated = getSvgFontSnapshot(svg);
			recordImmediateState();
			expect(repeated.cssFontRules).toBe(snapshot.cssFontRules);
		}

		await failure.record(
			'validation/svg-titled-font-groups/' +
				server.browser +
				'/immediate-font-state.json',
			JSON.stringify({beforeStatuses, immediateStates}, null, 2),
		);
		for (const state of immediateStates) {
			expect(state.identitiesStable).toBe(true);
			expect(state.promisesStable).toBe(true);
			expect(state.readyStable).toBe(true);
			expect(state.setStatus).toBe('loaded');
			expect(state.statuses).toEqual(beforeStatuses);
		}

		expect(svg.outerHTML).toBe(beforeMarkup);
		expect(
			Array.from(svg.querySelectorAll('style'), (style) =>
				Array.from(style.sheet!.cssRules, (rule) => rule.cssText),
			),
		).toEqual(beforeRules);
		const afterBounds = bounds();
		expect(Array.from(document.fonts)).toEqual(beforeFonts);
		for (const [index, face] of Array.from(document.fonts).entries()) {
			expect(face).toBe(beforeFonts[index]);
		}

		const afterStatuses = beforeFonts.map((face) => face.status);

		expect(afterStatuses).toEqual(beforeStatuses);
		expect(afterBounds).toEqual(beforeBounds);
		expect(
			document.querySelector('[data-remotion-font-sheet-probe]'),
		).toBeNull();
		const sheets = [...svg.querySelectorAll('style')].map((style) => ({
			title: style.getAttribute('title'),
			cssomTitle: style.sheet?.title ?? null,
			disabled: style.sheet?.disabled ?? null,
			media: style.sheet?.media.mediaText ?? null,
		}));
		await failure.record(
			`validation/svg-titled-font-groups/${server.browser}/titled-state.json`,
			JSON.stringify(
				{
					sheets,
					selectedSupported: 'selectedStyleSheetSet' in document,
					preferredSupported: 'preferredStyleSheetSet' in document,
					globalTitledSheets: Array.from(document.styleSheets)
						.filter((sheet) => sheet.title)
						.map((sheet) => ({
							title: sheet.title,
							disabled: sheet.disabled,
							media: sheet.media.mediaText,
						})),
					preferred: Reflect.get(document, 'preferredStyleSheetSet') ?? null,
					selected: Reflect.get(document, 'selectedStyleSheetSet') ?? null,
					last: Reflect.get(document, 'lastStyleSheetSet') ?? null,
					fonts: Array.from(document.fonts)
						.filter((face) => face.family.includes(family))
						.map((face) => ({family: face.family, status: face.status})),
					collectedFontIndices: urls.flatMap((url, index) =>
						snapshot.cssFontRules.includes(url) ? [index] : [],
					),
				},
				null,
				2,
			),
		);
		expect(snapshot.cssFontRules).toContain(urls[0]);
		expect(snapshot.cssFontRules).not.toContain(urls[1]);

		for (let index = 0; index < 2; index++)
			await new Promise<void>((resolve) =>
				requestAnimationFrame(() => resolve()),
			);
		expect(fontEvents).toEqual([]);
		expect(Array.from(document.fonts)).toEqual(beforeFonts);
		expect(document.fonts.ready).toBe(beforeReady);
		await failure.record(
			'validation/svg-titled-font-groups/' +
				server.browser +
				'/production-collector-state.json',
			JSON.stringify({beforeStatuses, immediateStates, fontEvents}, null, 2),
		);
		for (const type of ['loading', 'loadingdone', 'loadingerror'])
			document.fonts.removeEventListener(type, onFontEvent);
		active.disabled = true;
		(inactive.ownerNode as SVGStyleElement).setAttribute('title', 'A');
		inactive.disabled = false;
		const switched = getSvgFontSnapshot(svg);
		expect(switched.cssFontRules).toContain(urls[1]);
		expect(switched.cssFontRules).not.toContain(urls[0]);
	} finally {
		for (const type of ['loading', 'loadingdone', 'loadingerror'])
			document.fonts.removeEventListener(type, onFontEvent);
		svg.remove();
		preferred.remove();
		unrelated.remove();
	}
});
