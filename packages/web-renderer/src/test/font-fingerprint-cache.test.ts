import {expect, test} from 'vitest';
import {fingerprintCssFontGroups} from '../drawing/fingerprint-css-font-groups';
import {getFontFingerprintCache} from '../drawing/font-fingerprint-cache';

// Count the actual constructor and readback calls made by the production
// fingerprint function. Controlled rasters make invalidation independent of
// platform font availability and antialiasing.
const fixture = () => {
	let constructors = 0;
	let readbacks = 0;
	let source = 1;
	let metricWidth = 10;
	let fail:
		| 'construct'
		| 'register'
		| 'read'
		| 'candidate read'
		| 'cleanup'
		| null = null;
	let duringConstruction: (() => void) | null = null;
	const canvases: {width: number; height: number}[] = [];
	const faces = new Set<FontFace>();
	class Face {
		family: string;
		status = 'loaded';
		loaded = Promise.resolve(this);
		weight = 'normal';
		value: number;
		constructor(family: string, bytes: ArrayBuffer) {
			constructors++;
			if (fail === 'construct') throw new Error('construct fault');
			this.family = family;
			this.value = new Uint8Array(bytes)[0]!;
			const callback = duringConstruction;
			duringConstruction = null;
			callback?.();
		}
	}

	const original = new Face('Review', new Uint8Array([1]).buffer);
	constructors = 0;
	faces.add(original as unknown as FontFace);
	const fonts = Object.assign(new EventTarget(), {
		status: 'loaded',
		ready: Promise.resolve(),
		check: (): boolean => true,
		[Symbol.iterator]: () => faces[Symbol.iterator](),
		add: (face: FontFace) => {
			faces.add(face);
			if (fail === 'register') throw new Error('register fault');
		},
		delete: (face: FontFace) => faces.delete(face),
	});
	const {style} = document.createElement('span');
	style.cssText =
		'font-family:Review;font-size:36px;font-style:normal;font-weight:400;font-stretch:normal;font-kerning:auto;font-variant-caps:normal;letter-spacing:normal;word-spacing:normal;direction:ltr;text-rendering:auto;writing-mode:horizontal-tb;text-transform:none';
	const sample = {text: 'Review font', lang: 'en', style};
	const samples = [sample];
	// Firefox makes native CSSFontFaceRule descriptors immutable. These rule
	// doubles deliberately preserve identity while changing descriptor values,
	// so CSS text/value invalidation is tested independently of rule replacement.
	const groups = ['AQ==', 'Ag=='].map((bytes, index) => {
		const values = new Map([
			['font-family', 'Review'],
			['src', `url(data:font/woff2;base64,${bytes})`],
		]);
		const rule = {
			style: {
				get fontFamily() {
					return values.get('font-family')!;
				},
				get fontWeight() {
					return values.get('font-weight') ?? '';
				},
				set fontWeight(value: string) {
					values.set('font-weight', value);
				},
				getPropertyValue: (property: string) => values.get(property) ?? '',
				setProperty: (property: string, value: string) => {
					values.set(property, value);
				},
			},
			get cssText() {
				return `@font-face{${[...values].map(([property, value]) => `${property}:${value};`).join('')}}`;
			},
		};

		return {
			name: String(index + 1),
			rules: [rule as unknown as CSSFontFaceRule],
		};
	});
	const owner = {
		fonts,
		documentElement: {lang: 'en', dir: 'ltr'},
		defaultView: {
			FontFace: Face,
			atob: (value: string) => window.atob(value),
			crypto,
			devicePixelRatio: 1,
		},
		createElement: () => {
			let width = 300;
			const canvas = {
				height: 150,
				get width() {
					return width;
				},
				set width(value: number) {
					width = value;
					if (value === 0 && fail === 'cleanup')
						throw new Error('cleanup fault');
				},
				getContext: () => {
					const context = {
						font: '',
						measureText: () => ({
							width: metricWidth,
							actualBoundingBoxRight: 10,
							actualBoundingBoxLeft: 0,
							actualBoundingBoxAscent: 10,
							actualBoundingBoxDescent: 0,
							fontBoundingBoxAscent: 10,
							fontBoundingBoxDescent: 0,
						}),
						fillText: () => undefined,
						getImageData: () => {
							readbacks++;
							if (fail === 'read') throw new Error('read fault');
							if (
								fail === 'candidate read' &&
								context.font.includes('Remotion private group')
							)
								throw new Error('candidate read fault');
							const alias = [...faces].find((face) =>
								context.font.includes(face.family),
							);
							return {
								data: new Uint8ClampedArray([
									context.font.includes('Remotion private group')
										? (alias as unknown as Face).value
										: source,
								]),
							};
						},
					};
					return context;
				},
			};
			canvases.push(canvas);
			return canvas;
		},
	};
	// Window.atob has a real-global receiver requirement in browsers. The fake
	// owner window must delegate to that global rather than change its receiver.
	expect(owner.defaultView.atob('AQ==')).toBe('\u0001');
	const run = () =>
		fingerprintCssFontGroups(owner as unknown as Document, samples, groups);
	const counts = () => ({constructors, readbacks});
	const clean = () => {
		expect([...faces]).toEqual([original]);
		expect(canvases.every((canvas) => !canvas.width && !canvas.height)).toBe(
			true,
		);
	};

	return {
		run,
		counts,
		clean,
		owner,
		original,
		faces,
		groups,
		sample,
		samples,
		setWidth: (value: number) => {
			metricWidth = value;
		},
		setSource: (value: number) => {
			source = value;
		},
		setFailure: (value: typeof fail) => {
			fail = value;
		},
		reenter: (callback: () => void) => {
			duringConstruction = callback;
		},
	};
};

test('reuses only candidate data and reads fresh source pixels on every call', () => {
	const f = fixture();
	expect(f.run()).toEqual({matches: ['1'], reason: null});
	expect(f.counts()).toEqual({constructors: 2, readbacks: 3});
	f.clean();
	expect(f.run()).toEqual({matches: ['1'], reason: null});
	expect(f.counts()).toEqual({constructors: 2, readbacks: 4});
	// Preferred-title activity can change without an observable CSSOM/font-set
	// change. The unchanged candidate data must still select the new source.
	f.setSource(2);
	expect(f.run()).toEqual({matches: ['2'], reason: null});
	expect(f.counts()).toEqual({constructors: 2, readbacks: 5});
	f.clean();
});

test.for([
	'CSS source',
	'CSS descriptor',
	'rule identity',
	'group order',
	'group name',
	'text',
	'language',
	'shaping',
	'document language',
	'document direction',
	'pixel ratio',
	'face identity',
	'face membership',
	'face order',
	'face descriptor',
	'face status',
	'face promise',
	'raster dimensions',
	'ready promise',
	'font event',
])('invalidates cached candidate data for %s', (change) => {
	const f = fixture();
	expect(f.run().reason).toBeNull();
	switch (change) {
		case 'CSS source':
			f.groups[1]!.rules[0]!.style.setProperty(
				'src',
				'url(data:font/woff2;base64,Aw==)',
			);
			break;
		case 'CSS descriptor':
			f.groups[0]!.rules[0]!.style.fontWeight = '500';
			break;
		case 'rule identity': {
			const sheet = new CSSStyleSheet();
			sheet.replaceSync(f.groups[0]!.rules[0]!.cssText);
			f.groups[0]!.rules[0] = sheet.cssRules[0] as CSSFontFaceRule;
			break;
		}

		case 'group order':
			f.groups.reverse();
			break;
		case 'group name':
			f.groups[0]!.name = 'renamed';
			break;
		case 'text':
			f.sample.text += '!';
			break;
		case 'language':
			f.sample.lang = 'ar';
			break;
		case 'shaping':
			f.sample.style.letterSpacing = '1px';
			break;
		case 'document language':
			f.owner.documentElement.lang = 'fr';
			break;
		case 'document direction':
			f.owner.documentElement.dir = 'rtl';
			break;
		case 'pixel ratio':
			f.owner.defaultView.devicePixelRatio = 2;
			break;
		case 'face identity':
			f.faces.clear();
			f.faces.add({...f.original} as unknown as FontFace);
			break;
		case 'face membership':
			f.faces.add({...f.original} as unknown as FontFace);
			break;
		case 'face order': {
			const second = {...f.original} as unknown as FontFace;
			f.faces.add(second);
			f.run();
			f.faces.delete(f.original as unknown as FontFace);
			f.faces.add(f.original as unknown as FontFace);
			break;
		}

		case 'face descriptor':
			f.original.weight = '500';
			break;
		case 'face status':
			f.original.status = 'unloaded';
			break;
		case 'face promise':
			f.original.loaded = Promise.resolve(f.original);
			break;
		case 'ready promise':
			f.owner.fonts.ready = Promise.resolve();
			break;
		case 'raster dimensions':
			f.setWidth(100);
			break;
		case 'font event':
			f.owner.fonts.dispatchEvent(new Event('loadingdone'));
			break;
		default:
			throw new Error(change);
	}

	const before = f.counts();
	expect(f.run().reason).toBeNull();
	expect(f.counts()).toEqual({
		constructors: before.constructors + 2,
		readbacks: before.readbacks + 3,
	});
});

test.for([
	'construct',
	'register',
	'read',
	'candidate read',
	'cleanup',
] as const)('never caches a %s failure', (failure) => {
	const f = fixture();
	f.setFailure(failure);
	expect(f.run).toThrow(`${failure} fault`);
	f.setFailure(null);
	const before = f.counts();
	expect(f.run().reason).toBeNull();
	expect(f.counts()).toEqual({
		constructors: before.constructors + 2,
		readbacks: before.readbacks + 3,
	});
	// A failed cleanup leaves its discarded canvas owned by the fixture;
	// successful calls must nevertheless release every new resource.
	if (failure !== 'cleanup') f.clean();
});

test('invalidates sample order and never caches unresolved or ambiguous data', () => {
	const f = fixture();
	f.samples.push({...f.sample, text: 'Other sample'});
	expect(f.run().reason).toBeNull();
	expect(f.counts()).toEqual({constructors: 2, readbacks: 6});
	f.samples.reverse();
	expect(f.run().reason).toBeNull();
	expect(f.counts()).toEqual({constructors: 4, readbacks: 12});
	f.setSource(3);
	for (let repeat = 0; repeat < 2; repeat++) {
		expect(f.run().reason).toBe('Font group is unresolved or ambiguous.');
		expect(f.counts()).toEqual({
			constructors: 6 + repeat * 2,
			readbacks: 18 + repeat * 6,
		});
	}

	f.setSource(1);
	f.groups[1]!.rules[0]!.style.setProperty(
		'src',
		'url(data:font/woff2;base64,AQ==)',
	);
	for (let repeat = 0; repeat < 2; repeat++) {
		expect(f.run()).toEqual({
			matches: ['1', '2'],
			reason: 'Font group is unresolved or ambiguous.',
		});
		expect(f.counts()).toEqual({
			constructors: 10 + repeat * 2,
			readbacks: 30 + repeat * 6,
		});
	}

	f.clean();
});

test('selects loaded source queries while unrelated fonts are loading', () => {
	const f = fixture();
	f.owner.fonts.status = 'loading';
	const {ready} = f.owner.fonts;
	expect(f.run()).toEqual({matches: ['1'], reason: null});
	expect(f.owner.fonts.status).toBe('loading');
	expect(f.owner.fonts.ready).toBe(ready);
	f.clean();
	const before = f.counts();
	f.owner.fonts.status = 'loaded';
	expect(f.run()).toEqual({matches: ['1'], reason: null});
	expect(f.counts()).toEqual({
		constructors: before.constructors + 2,
		readbacks: before.readbacks + 3,
	});
	f.clean();
});

test('does not probe an unloaded source query while other fonts are loading', () => {
	const f = fixture();
	f.owner.fonts.status = 'loading';
	f.owner.fonts.check = () => false;
	expect(f.run().reason).toContain('Source font query is not loaded');
	expect(f.counts()).toEqual({constructors: 0, readbacks: 0});
	f.clean();
});

test('does not cache changing source font state', () => {
	const f = fixture();
	f.reenter(() => {
		f.original.weight = '500';
	});
	expect(f.run().reason).toBe('Original font state changed at construction.');
	const before = f.counts();
	expect(f.run().reason).toBeNull();
	expect(f.counts()).toEqual({
		constructors: before.constructors + 2,
		readbacks: before.readbacks + 3,
	});
	f.clean();
});

test('keeps reentrant calls and owner documents isolated', async () => {
	const f = fixture();
	const other = fixture();
	f.reenter(() => {
		expect(other.run().reason).toBeNull();
		expect(f.run().reason).toBeNull();
	});
	expect(f.run().reason).toBeNull();
	const before = f.counts();
	const results = await Promise.all([
		Promise.resolve().then(f.run),
		Promise.resolve().then(f.run),
	]);
	expect(results.map((result) => result.reason)).toEqual([null, null]);
	expect(f.counts()).toEqual({
		constructors: before.constructors,
		readbacks: before.readbacks + 2,
	});
	expect(other.counts()).toEqual({constructors: 2, readbacks: 3});
	f.clean();
	other.clean();
});

test('bounds retained data by entry count and raster bytes', () => {
	const owner = fixture().owner as unknown as Document;
	const cache = getFontFingerprintCache(owner);
	const raster = {
		width: 1,
		height: 1,
		metrics: [1],
		pixels: new Uint8ClampedArray(4),
	};
	for (let index = 0; index < 17; index++) cache.put([index], [[raster]]);
	expect(cache.get([0])).toBeNull();
	expect(cache.get([1])).toEqual([[raster]]);
	const large = {...raster, pixels: new Uint8ClampedArray(17 * 1024 * 1024)};
	cache.put(['large 1'], [[large]]);
	cache.put(['large 2'], [[large]]);
	expect(cache.get(['large 1'])).toBeNull();
	expect(cache.get(['large 2'])).toEqual([[large]]);
	cache.put(
		['oversized'],
		[[{...large, pixels: new Uint8ClampedArray(33 * 1024 * 1024)}]],
	);
	expect(cache.get(['oversized'])).toBeNull();
});
