import {expect, test} from 'vitest';
import {fingerprintCssFontGroups} from '../drawing/fingerprint-css-font-groups';
import {renderFramesOnWeb, renderStillOnWeb} from '../render-still-on-web';
import {svgTitledFontCache} from './fixtures/svg-titled-font-groups';
import {svgUseFontData} from './fixtures/svg-use-data-font';
import {createFontFailureRecorder} from './font-failure-recorder';
import {
	captureNativeReference,
	compareNativePixels,
	countNativePixels,
} from './native-reference';
import '../symbol-dispose';

test('warm candidate data avoids native FontFace construction and candidate readbacks', async (t) => {
	const failure = createFontFailureRecorder(t);
	const urls = await svgUseFontData;
	const frame = document.createElement('iframe');
	document.body.appendChild(frame);
	const owner = frame.contentDocument!;
	const win = owner.defaultView!;
	const nativeFace = win.FontFace;
	const nativeRead = win.CanvasRenderingContext2D.prototype.getImageData;
	let constructors = 0;
	let readbacks = 0;
	const fontEvents: string[] = [];
	const onFontEvent = (event: Event) => fontEvents.push(event.type);
	const initialFontEvents: string[] = [];
	const onInitialFontEvent = (event: Event) =>
		initialFontEvents.push(event.type);
	for (const type of ['loading', 'loadingdone', 'loadingerror'])
		owner.fonts.addEventListener(type, onInitialFontEvent);
	try {
		const style = owner.createElement('style');
		style.textContent = `@font-face{font-family:Review;src:url("${urls[0]}")}`;
		owner.head.appendChild(style);
		const text = owner.createElement('span');
		text.style.cssText =
			'font:36px Review;writing-mode:horizontal-tb;text-transform:none';
		text.textContent = 'Review font';
		owner.body.appendChild(text);
		const sourceLoad = owner.fonts.load('36px Review');
		const loadingStatus = owner.fonts.status;
		await sourceLoad;
		await owner.fonts.ready;
		await failure.record(
			`validation/font-fingerprint-cache/${t.task.file.projectName}/initial-font-readiness.json`,
			JSON.stringify({
				stage: 'loaded',
				loadingStatus,
				initialFontEvents,
				status: owner.fonts.status,
			}),
		);
		// Some native font sets report loading and become ready without firing
		// loadingdone. Qualify actual ready/status/event stability across native
		// frames instead of depending on an event that may never arrive.
		const checkpoints: {
			events: number;
			status: FontFaceSetLoadStatus;
			readyStable: boolean;
		}[] = [];
		let previous: {
			events: number;
			ready: Promise<FontFaceSet>;
			status: FontFaceSetLoadStatus;
		} | null = null;
		let settled = false;
		for (let checkpoint = 0; checkpoint < 4; checkpoint++) {
			await owner.fonts.ready;
			await new Promise<void>((resolve) =>
				win.requestAnimationFrame(() => resolve()),
			);
			await Promise.resolve();
			const current = {
				events: initialFontEvents.length,
				ready: owner.fonts.ready,
				status: owner.fonts.status,
			};
			checkpoints.push({
				events: current.events,
				status: current.status,
				readyStable: previous?.ready === current.ready,
			});
			if (
				previous &&
				previous.events === current.events &&
				previous.ready === current.ready &&
				previous.status === 'loaded' &&
				current.status === 'loaded'
			) {
				settled = true;
				break;
			}

			previous = current;
		}

		await failure.record(
			`validation/font-fingerprint-cache/${t.task.file.projectName}/initial-font-readiness.json`,
			JSON.stringify({loadingStatus, initialFontEvents, checkpoints, settled}),
		);
		expect(settled).toBe(true);
		for (const type of ['loading', 'loadingdone', 'loadingerror'])
			owner.fonts.addEventListener(type, onFontEvent);
		const alternate = new win.CSSStyleSheet();
		alternate.replaceSync(
			`@font-face{font-family:Review;src:url("${urls[1]}")}`,
		);
		const groups = [style.sheet!, alternate].map((sheet, index) => ({
			name: String(index),
			rules: Array.from(sheet.cssRules) as CSSFontFaceRule[],
		}));
		const sample = {
			text: text.textContent,
			style: win.getComputedStyle(text),
			lang: 'en',
		};
		const originals = Array.from(owner.fonts);
		const promises = originals.map((face) => face.loaded);
		const {ready} = owner.fonts;
		win.FontFace = new Proxy(nativeFace, {
			construct(target, args) {
				constructors++;
				return Reflect.construct(target, args);
			},
		});
		win.CanvasRenderingContext2D.prototype.getImageData = function (...args) {
			readbacks++;
			return nativeRead.apply(this, args);
		};

		expect(fingerprintCssFontGroups(owner, [sample], groups)).toEqual({
			matches: ['0'],
			reason: null,
		});
		expect({constructors, readbacks}).toEqual({constructors: 2, readbacks: 3});
		for (let repeat = 0; repeat < 4; repeat++) {
			await new Promise<void>((resolve) =>
				win.requestAnimationFrame(() => resolve()),
			);
			await Promise.resolve();
			expect(fingerprintCssFontGroups(owner, [sample], groups)).toEqual({
				matches: ['0'],
				reason: null,
			});
			await failure.record(
				`validation/font-fingerprint-cache/${t.task.file.projectName}/direct-counts.json`,
				JSON.stringify({repeat, constructors, readbacks, fontEvents}),
			);
			expect({constructors, readbacks}).toEqual({
				constructors: 2,
				readbacks: 4 + repeat,
			});
		}

		expect(Array.from(owner.fonts)).toEqual(originals);
		expect(Array.from(owner.fonts, (face) => face.loaded)).toEqual(promises);
		expect(owner.fonts.ready).toBe(ready);
		expect(owner.fonts.status).toBe('loaded');
		expect(fontEvents).toEqual([]);
	} finally {
		for (const type of ['loading', 'loadingdone', 'loadingerror'])
			owner.fonts.removeEventListener(type, onInitialFontEvent);
		for (const type of ['loading', 'loadingdone', 'loadingerror'])
			owner.fonts.removeEventListener(type, onFontEvent);
		win.FontFace = nativeFace;
		win.CanvasRenderingContext2D.prototype.getImageData = nativeRead;
		frame.remove();
	}
});

test('reuses candidate rasters through public batch SVG captures across frames', async (t) => {
	const failure = createFontFailureRecorder(t);
	const composition = svgTitledFontCache(false, false);
	const literal = svgTitledFontCache(true, false);
	const fallback = svgTitledFontCache(true, true);
	// Native capture and independent controls finish before instrumentation;
	// comparison readbacks cannot be counted as fingerprint work.
	const native = await captureNativeReference(composition, 0, {
		omitBackground: false,
	});
	const nativeLiteral = await captureNativeReference(literal, 0, {
		omitBackground: false,
	});
	expect(
		(await compareNativePixels(native, nativeLiteral)).mismatchedPixels,
	).toBe(0);
	const options = {
		licenseKey: 'free-license',
		inputProps: {},
		allowHtmlInCanvas: false,
	} as const;
	const expected = await (
		await renderStillOnWeb({...options, composition: literal, frame: 0})
	).blob({format: 'png'});
	const fallbackImage = await (
		await renderStillOnWeb({...options, composition: fallback, frame: 0})
	).blob({format: 'png'});
	expect(
		(await countNativePixels(expected, fallbackImage)).mismatchedPixels,
	).toBeGreaterThan(0);
	const nativeFace = window.FontFace;
	const nativeRead = CanvasRenderingContext2D.prototype.getImageData;
	const nativeComputedStyle = window.getComputedStyle;
	const originalFonts = Array.from(document.fonts);
	const sourceTransitions: {
		frame: number;
		status: FontFaceSetLoadStatus;
		calls: number;
	}[] = [];
	let constructors = 0;
	const reads: {frame: number; candidate: boolean; constructors: number}[] = [];
	const canvases = new Set<HTMLCanvasElement>();
	const states: {
		faces: FontFace[];
		promises: Promise<FontFace>[];
		ready: Promise<FontFaceSet>;
		status: FontFaceSetLoadStatus;
		markup: string;
		sheets: {title: string | null; collected: boolean; disabled: boolean}[];
	}[] = [];
	window.FontFace = new Proxy(nativeFace, {
		construct(target, args) {
			if (String(args[0]).startsWith('Remotion private group ')) constructors++;
			return Reflect.construct(target, args);
		},
	});
	window.getComputedStyle = function (element, pseudo) {
		const style = nativeComputedStyle.call(window, element, pseudo);
		const host = element.closest('[data-svg-font-cache-frame]');
		if (host && element instanceof SVGTextElement) {
			const frame = Number(host.getAttribute('data-svg-font-cache-frame'));
			const {status} = document.fonts;
			const previous = sourceTransitions.at(-1);
			if (previous?.frame === frame && previous.status === status)
				previous.calls++;
			else sourceTransitions.push({frame, status, calls: 1});
		}

		return style;
	};

	CanvasRenderingContext2D.prototype.getImageData = function (...args) {
		const host = document.querySelector('[data-svg-font-cache-frame]');
		if (host) {
			canvases.add(this.canvas);
			const candidate = this.font.includes('Remotion private group ');
			// Every 2D readback during capture must come from this fingerprint.
			reads.push({
				frame: Number(host.getAttribute('data-svg-font-cache-frame')),
				candidate,
				constructors,
			});
			if (!candidate) {
				const faces = Array.from(document.fonts);
				states.push({
					faces,
					promises: faces.map((face) => face.loaded),
					ready: document.fonts.ready,
					status: document.fonts.status,
					markup: host.innerHTML,
					sheets: Array.from(host.querySelectorAll('svg style'), (style) => {
						const sheet = (style as SVGStyleElement).sheet!;
						return {
							title: style.getAttribute('title'),
							collected:
								Array.from(document.styleSheets).includes(sheet) &&
								!sheet.disabled,
							disabled: sheet.disabled,
						};
					}),
				});
			}
		}

		return nativeRead.apply(this, args);
	};

	let results: Awaited<ReturnType<typeof renderFramesOnWeb>>;
	try {
		results = await renderFramesOnWeb({
			...options,
			composition,
			frames: [0, 1, 2],
		});
	} finally {
		window.FontFace = nativeFace;
		window.getComputedStyle = nativeComputedStyle;
		CanvasRenderingContext2D.prototype.getImageData = nativeRead;
	}

	await failure.record(
		`validation/font-fingerprint-cache/${t.task.file.projectName}/public-batch-counts.json`,
		JSON.stringify(
			{
				constructors,
				reads,
				sourceTransitions,
				sourceStates: states.map((state) => ({
					status: state.status,
					sheets: state.sheets,
					identitiesStable: state.faces.every(
						(face, index) => face === states[0]!.faces[index],
					),
					promisesStable: state.promises.every(
						(promise, index) => promise === states[0]!.promises[index],
					),
					readyStable: state.ready === states[0]!.ready,
					markupStable: state.markup === states[0]!.markup,
				})),
				canvasDimensions: [...canvases].map((canvas) => ({
					width: canvas.width,
					height: canvas.height,
				})),
			},
			null,
			2,
		),
	);
	expect(states).toHaveLength(3);
	// Some engines expose inactive alternate sheets as disabled. Derive the
	// cold model from that read-only source capability, independently of counts.
	expect(states[0]!.sheets.map(({title}) => title)).toEqual(['A', 'B']);
	expect(states[0]!.sheets[0]!.collected).toBe(true);
	const faceCount = states[0]!.sheets.filter((sheet) => sheet.collected).length;
	expect(faceCount).toBeGreaterThan(0);
	expect(faceCount).toBeLessThanOrEqual(2);
	expect(constructors).toBe(faceCount);
	expect(Array.from(document.fonts)).toEqual(originalFonts);
	expect(reads).toEqual([
		{frame: 0, candidate: false, constructors: 0},
		{frame: 0, candidate: true, constructors: 0},
		...Array.from({length: faceCount}, (_, index) => ({
			frame: 0,
			candidate: true,
			constructors: index + 1,
		})),
		{frame: 1, candidate: false, constructors: faceCount},
		{frame: 2, candidate: false, constructors: faceCount},
	]);
	for (const state of states) {
		expect(state.faces).toEqual(states[0]!.faces);
		expect(state.promises).toEqual(states[0]!.promises);
		expect(state.ready).toBe(states[0]!.ready);
		expect(state.status).toBe('loaded');
		expect(state.markup).toBe(states[0]!.markup);
		expect(state.sheets).toEqual(states[0]!.sheets);
		expect(
			state.faces.every(
				(face) => !face.family.includes('Remotion private group '),
			),
		).toBe(true);
	}

	// Capture all count assertions before encoding/comparing any output pixels.
	expect(canvases.size).toBe(4 + faceCount);
	for (const canvas of canvases) {
		expect(canvas.width).toBe(0);
		expect(canvas.height).toBe(0);
	}

	for (const result of results!) {
		const actual = await result.blob({format: 'png'});
		await failure.png('batch-actual.png', actual);
		await failure.png('literal.png', expected);
		await failure.png('native.png', native);
		expect((await compareNativePixels(expected, actual)).mismatchedPixels).toBe(
			0,
		);
		if (t.task.file.projectName === 'chromium')
			expect((await compareNativePixels(native, actual)).mismatchedPixels).toBe(
				0,
			);
	}
});
