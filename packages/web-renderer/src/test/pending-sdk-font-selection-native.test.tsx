import {loadFont} from '@remotion/fonts';
import {NoReactInternals} from 'remotion/no-react';
import {expect, test, vi} from 'vitest';
import {server} from 'vitest/browser';
import {getFontReadinessQuery} from '../font-readiness';
import {getPendingFontFacesForSamples} from '../get-pending-font-faces-for-samples';
import {
	pendingSdkBangers,
	pendingSdkRoboto,
	pendingSdkFontSelectionScene,
} from './fixtures/pending-sdk-font-selection';
import {captureNativeReference, compareNativePixels} from './native-reference';

const modes = [
	'needed700',
	'unused700',
	'range-weight-fallback',
	'same-descriptor-range',
] as const;
test.for(modes)(
	'matches prospective SDK font selection to native %s',
	async (mode) => {
		const family = `SDK selection ${crypto.randomUUID()}`;
		const literal = family + ' literal';
		const opposite = family + ' opposite';
		const queryWeight =
			mode === 'unused700' || mode === 'same-descriptor-range' ? '400' : '700';
		const pendingWeight = mode === 'same-descriptor-range' ? '400' : '700';
		const range =
			mode === 'range-weight-fallback' || mode === 'same-descriptor-range'
				? 'U+42'
				: undefined;
		const text = range ? 'A' : 'Review font';
		const relevant = mode === 'needed700' || mode === 'range-weight-fallback';
		const initial = new Set(document.fonts);
		const initialStates = new Map(
			[...initial].map((face) => [
				face,
				{loaded: face.loaded, status: face.status},
			]),
		);
		const normalize = (value: string) => value.replace(/^(['"])(.*)\1$/, '$2');
		const ids = new WeakMap<object, number>();
		let nextId = 0;
		const identity = (value: object) => {
			if (!ids.has(value)) ids.set(value, ++nextId);
			return ids.get(value)!;
		};

		const faces = () =>
			[...document.fonts]
				.filter((face) => normalize(face.family).startsWith(family))
				.map((face) => ({
					id: identity(face),
					loadedPromise: identity(face.loaded),
					family: face.family,
					weight: face.weight,
					style: face.style,
					stretch: face.stretch,
					range: face.unicodeRange,
					status: face.status,
				}));
		const ActualFontFace = window.FontFace;
		const constructorDescriptor = Object.getOwnPropertyDescriptor(
			window,
			'FontFace',
		)!;
		const owned = new Set<FontFace>();
		let activeSdkCall: {tag: string; family: string} | null = null;
		const constructors: {
			face: FontFace;
			family: string;
			call: string | null;
			bytes: number | null;
		}[] = [];
		class ObservedFontFace extends ActualFontFace {
			constructor(...args: ConstructorParameters<typeof ActualFontFace>) {
				super(...args);
				const call =
					activeSdkCall?.family === args[0] ? activeSdkCall.tag : null;
				constructors.push({
					face: this,
					family: args[0],
					call,
					bytes: typeof args[1] === 'string' ? null : args[1].byteLength,
				});
				if (call !== null) owned.add(this);
			}
		}
		const loadOwned = async (
			tag: string,
			options: Parameters<typeof loadFont>[0],
		) => {
			activeSdkCall = {tag, family: options.family};
			try {
				await loadFont(options);
			} finally {
				activeSdkCall = null;
			}
		};

		const membership = () => ({
			nativeSize: document.fonts.size,
			iterationSize: [...document.fonts].length,
			members: [...document.fonts].map((face) => ({
				id: identity(face),
				loadedPromise: identity(face.loaded),
				family: face.family,
				weight: face.weight,
				style: face.style,
				stretch: face.stretch,
				range: face.unicodeRange,
				status: face.status,
				initial: initial.has(face),
				fixtureOwned: owned.has(face),
				constructorCall:
					constructors.find((entry) => entry.face === face)?.call ?? null,
			})),
		});
		const initialMembership = membership();
		const domEvents: Record<string, unknown>[] = [];
		const deletions: Record<string, unknown>[] = [];
		let cleanup: {
			initialPreserved: boolean;
			initialSizeRestored: boolean;
			pendingClean: boolean;
			ownedGone: boolean;
			constructorRestored: boolean;
			initialPromisesPreserved: boolean;
			initialStatusesPreserved: boolean;
			initialNativeSizeRestored: boolean;
		} | null = null;
		const reads: Record<string, unknown>[] = [];
		const phases: Record<string, unknown>[] = [];
		const metrics: Record<string, number> = {};
		let source: FontFace | null = null;
		let sourcePromise: Promise<FontFace> | null = null;
		let matchesBefore: number | null = null;
		let release!: () => void;
		const permission = new Promise<void>((resolve) => {
			release = resolve;
		});
		const fetchFont = NoReactInternals.fetchFontData;
		let operation: Promise<void> | null = null;
		let fetchSpy: ReturnType<typeof vi.spyOn> | null = null;
		const pending = () =>
			NoReactInternals.getPendingFontFaces()
				.filter((font) => font.fontFamily === family)
				.map((font) => ({
					family: font.fontFamily,
					weight: font.weight,
					style: font.style,
					stretch: font.stretch,
					range: font.unicodeRange,
					owner: font.ownerDocument === document,
				}));
		const phase = (name: string) =>
			phases.push({
				name,
				membership: membership(),
				faces: faces(),
				pending: pending(),
				nativeStatus: document.fonts.status,
				sourceStillOwned: source !== null && document.fonts.has(source),
				sourcePromisePreserved:
					source !== null && source.loaded === sourcePromise,
				registered: NoReactInternals.getRegisteredFontFaces()
					.filter((face) => face.fontFamily.startsWith(family))
					.map((face) => ({
						family: face.fontFamily,
						weight: face.weight,
						style: face.style,
						stretch: face.stretch,
						range: face.unicodeRange,
						bytes: face.fontData.byteLength,
					})),
			});
		const native = async (kind: string, name: string) => {
			let observedElement: SVGTextElement | null = null;
			const scene = pendingSdkFontSelectionScene(name, queryWeight, text, {
				onRead: (element) => {
					observedElement = element;
					domEvents.push({
						kind,
						event: 'mounted',
						node: identity(element),
						connected: element.isConnected,
						membership: membership(),
					});
					const style = getComputedStyle(element);
					const sample = {
						fontFamily: style.fontFamily,
						fontWeight: style.fontWeight,
						fontStyle: style.fontStyle,
						fontStretch: style.fontStretch,
						fontSize: style.fontSize,
					};
					reads.push({
						kind,
						owner: element.ownerDocument === document,
						text: element.textContent,
						style: sample,
						query: getFontReadinessQuery(sample),
						nativeReady: document.fonts.check(
							getFontReadinessQuery(sample),
							text,
						),
						svg: element.ownerSVGElement!.outerHTML,
						faces: faces(),
						nativeStatus: document.fonts.status,
					});
				},
				onBeforeUnmount: (element) =>
					domEvents.push({
						kind,
						event: 'layout-cleanup',
						node: identity(element),
						connected: element.isConnected,
						membership: membership(),
					}),
			});
			const blob = await captureNativeReference(scene, 0, {
				omitBackground: false,
			});
			domEvents.push({
				kind,
				event: 'after-native-reference-removal',
				node: observedElement === null ? null : identity(observedElement),
				connected:
					observedElement === null
						? null
						: (observedElement as SVGTextElement).isConnected,
				membership: membership(),
			});
			let binary = '';
			for (const byte of new Uint8Array(await blob.arrayBuffer()))
				binary += String.fromCharCode(byte);
			await server.commands.writeFile(
				`validation/pending-sdk-selection-permanent/${server.browser}/${mode}-${kind}.png`,
				btoa(binary),
				'base64',
			);
			return blob;
		};

		try {
			Object.defineProperty(window, 'FontFace', {
				...constructorDescriptor,
				value: ObservedFontFace,
			});
			await loadOwned('current400', {
				family,
				url: pendingSdkRoboto,
				weight: '400',
			});
			await loadOwned('literal400', {
				family: literal,
				url: pendingSdkRoboto,
				weight: '400',
			});
			// This is the independent loaded positive control, not generic fallback.
			await loadOwned('opposite', {
				family: opposite,
				url: pendingSdkBangers,
				weight: pendingWeight,
			});
			await document.fonts.ready;
			source = [...document.fonts].find(
				(face) => normalize(face.family) === family,
			)!;
			sourcePromise = source.loaded;
			phase('loaded-controls-before-pending');
			const oppositeFaces = [...document.fonts].filter(
				(face) => normalize(face.family) === opposite,
			);
			expect(oppositeFaces).toHaveLength(1);
			expect(oppositeFaces[0].status).toBe('loaded');
			expect(oppositeFaces[0].weight).toBe(pendingWeight);
			const before = await native('before', family);
			const beforeRepeat = await native('before-repeat', family);
			const literalNative = await native('literal-A', literal);
			const oppositeNative = await native('literal-B', opposite);
			metrics.beforeRepeat = (
				await compareNativePixels(before, beforeRepeat)
			).mismatchedPixels;
			metrics.beforeLiteralA = (
				await compareNativePixels(before, literalNative)
			).mismatchedPixels;
			metrics.beforeLiteralB = (
				await compareNativePixels(before, oppositeNative)
			).mismatchedPixels;
			expect(metrics.beforeRepeat).toBe(0);
			expect(metrics.beforeLiteralA).toBe(0);
			expect(metrics.beforeLiteralB).toBeGreaterThan(0);
			const url = pendingSdkBangers + `?pending-native=${family}`;
			fetchSpy = vi
				.spyOn(NoReactInternals, 'fetchFontData')
				.mockImplementation(async (requested) => {
					if (requested === url) await permission;
					return fetchFont(requested);
				});
			operation = loadOwned('pending-source', {
				family,
				url,
				weight: pendingWeight,
				unicodeRange: range,
			});
			matchesBefore = getPendingFontFacesForSamples(document, [
				{
					text,
					style: {
						fontFamily: JSON.stringify(family),
						fontSize: '36px',
						fontWeight: queryWeight,
						fontStyle: 'normal',
						fontStretch: '100%',
					},
				},
			]).length;
			phase('held-before-release');
			expect(matchesBefore).toBe(relevant ? 1 : 0);
			release();
			await operation;
			await document.fonts.ready;
			phase('loaded-after-pending');
			const after = await native('after', family);
			const afterRepeat = await native('after-repeat', family);
			metrics.afterRepeat = (
				await compareNativePixels(after, afterRepeat)
			).mismatchedPixels;
			metrics.beforeAfter = (
				await compareNativePixels(before, after)
			).mismatchedPixels;
			metrics.afterLiteralB = (
				await compareNativePixels(after, oppositeNative)
			).mismatchedPixels;
			if (mode === 'range-weight-fallback')
				metrics.afterFallback = (
					await compareNativePixels(
						after,
						await native('fallback', 'monospace'),
					)
				).mismatchedPixels;
			expect(metrics.afterRepeat).toBe(0);
			expect(metrics.beforeAfter > 0).toBe(relevant);
			if (mode === 'needed700') expect(metrics.afterLiteralB).toBe(0);
			if (mode === 'range-weight-fallback')
				expect(metrics.afterFallback).toBe(0);
			expect(document.fonts.has(source)).toBe(true);
			expect(source.status).toBe('loaded');
			expect(source.loaded).toBe(sourcePromise);
			expect(
				getPendingFontFacesForSamples(document, [
					{
						text,
						style: {
							fontFamily: JSON.stringify(family),
							fontSize: '36px',
							fontWeight: queryWeight,
							fontStyle: 'normal',
							fontStretch: '100%',
						},
					},
				]),
			).toEqual([]);
		} finally {
			release();
			await operation?.catch(() => undefined);
			phase('before-cleanup');
			try {
				// Snapshot the proven owned identities; never sweep new host/private faces.
				for (const face of [...owned]) {
					if (!document.fonts.has(face)) continue;
					deletions.push({
						phase: 'owned-snapshot',
						id: identity(face),
						family: face.family,
						returned: document.fonts.delete(face),
						stillPresent: document.fonts.has(face),
					});
				}

				phase('after-owned-snapshot');
			} finally {
				fetchSpy?.mockRestore();
				Object.defineProperty(window, 'FontFace', constructorDescriptor);
			}

			cleanup = {
				initialPreserved: [...initial].every((face) =>
					document.fonts.has(face),
				),
				initialSizeRestored: initial.size === document.fonts.size,
				initialNativeSizeRestored:
					initialMembership.nativeSize === document.fonts.size,
				initialPromisesPreserved: [...initialStates].every(
					([face, state]) => face.loaded === state.loaded,
				),
				initialStatusesPreserved: [...initialStates].every(
					([face, state]) => face.status === state.status,
				),
				pendingClean: pending().length === 0,
				ownedGone: [...owned].every((face) => !document.fonts.has(face)),
				constructorRestored: window.FontFace === ActualFontFace,
			};
			await server.commands.writeFile(
				`validation/pending-sdk-selection-permanent/${server.browser}/${mode}.json`,
				JSON.stringify(
					{
						mode,
						family,
						queryWeight,
						pendingWeight,
						range: range ?? null,
						text,
						relevant,
						matchesBefore,
						reads,
						phases,
						metrics,
						initialMembership,
						constructors: constructors.map((entry) => ({
							id: identity(entry.face),
							family: entry.family,
							call: entry.call,
							bytes: entry.bytes,
							loadedPromise: identity(entry.face.loaded),
							status: entry.face.status,
							fixtureOwned: owned.has(entry.face),
						})),
						domEvents,
						deletions,
						cleanup,
					},
					null,
					2,
				),
			);
		}

		expect(cleanup).not.toBeNull();
		for (const value of Object.values(cleanup!)) expect(value).toBe(true);
	},
);
