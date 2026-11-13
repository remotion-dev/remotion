import {loadFont} from '@remotion/fonts';
import {NoReactInternals} from 'remotion/no-react';
import {expect, test, vi} from 'vitest';
import {getPendingFontFacesForSamples} from '../get-pending-font-faces-for-samples';
import {
	pendingSdkBangers,
	pendingSdkRoboto,
} from './fixtures/pending-sdk-font-selection';

const modes = [
	'needed700',
	'unused700',
	'range-weight-fallback',
	'same-descriptor-range',
] as const;

test.for(modes)(
	'matches pending SDK faces to native font selection: %s',
	async (mode) => {
		const family = `SDK selection ${crypto.randomUUID()}`;
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
		const initial = new Map(
			[...document.fonts].map((face) => [
				face,
				{loaded: face.loaded, status: face.status},
			]),
		);
		const normalize = (value: string) => value.replace(/^(['"])(.*)\1$/, '$2');
		const nativeWidth = (name: string) => {
			const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			const element = document.createElementNS(
				'http://www.w3.org/2000/svg',
				'text',
			);
			Object.assign(element.style, {
				fontFamily: `${JSON.stringify(name)},monospace`,
				fontSize: '36px',
				fontWeight: queryWeight,
			});
			element.textContent = text;
			svg.append(element);
			document.body.append(svg);
			try {
				return element.getComputedTextLength();
			} finally {
				svg.remove();
			}
		};

		const samples = [
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
		];
		let release!: () => void;
		const permission = new Promise<void>((resolve) => {
			release = resolve;
		});
		const fetchFont = NoReactInternals.fetchFontData;
		const url = pendingSdkBangers + `?pending-native=${family}`;
		const fetchSpy = vi
			.spyOn(NoReactInternals, 'fetchFontData')
			.mockImplementation(async (requested) => {
				if (requested === url) await permission;
				return fetchFont(requested);
			});
		let operation: Promise<void> | null = null;
		try {
			await loadFont({family, url: pendingSdkRoboto, weight: '400'});
			await loadFont({
				family: opposite,
				url: pendingSdkBangers,
				weight: pendingWeight,
			});
			await document.fonts.ready;
			const source = [...document.fonts].find(
				(face) => normalize(face.family) === family,
			)!;
			const sourcePromise = source.loaded;
			const before = nativeWidth(family);
			const alternate = nativeWidth(opposite);
			expect(before).not.toBe(alternate);
			operation = loadFont({
				family,
				url,
				weight: pendingWeight,
				unicodeRange: range,
			});
			expect(getPendingFontFacesForSamples(document, samples)).toHaveLength(
				relevant ? 1 : 0,
			);
			release();
			await operation;
			await document.fonts.ready;
			const after = nativeWidth(family);
			expect(after !== before).toBe(relevant);
			if (mode === 'needed700') expect(after).toBe(alternate);
			if (mode === 'range-weight-fallback')
				expect(after).toBe(nativeWidth('monospace'));
			expect(document.fonts.has(source)).toBe(true);
			expect(source.status).toBe('loaded');
			expect(source.loaded).toBe(sourcePromise);
			expect(getPendingFontFacesForSamples(document, samples)).toEqual([]);
		} finally {
			release();
			await operation?.catch(() => undefined);
			fetchSpy.mockRestore();
			for (const face of [...document.fonts]) {
				if (
					!initial.has(face) &&
					[family, opposite].includes(normalize(face.family))
				)
					document.fonts.delete(face);
			}
		}

		for (const [face, state] of initial) {
			expect(document.fonts.has(face)).toBe(true);
			expect(face.loaded).toBe(state.loaded);
			expect(face.status).toBe(state.status);
		}

		expect(document.fonts.size).toBe(initial.size);
	},
);
