import {NoReactInternals} from 'remotion/no-react';
import {expect, test} from 'vitest';
import {getPendingFontFacesForSamples} from '../get-pending-font-faces-for-samples';

// These tests exercise metadata selection, not native CSS descriptor selection.
// A pending fetch has no native FontFace for FontFaceSet.check to inspect.
test('pending metadata matches actual document and family before native descriptor proof', () => {
	const owner = {} as Document;
	const other = {} as Document;
	const metadata = {
		ownerDocument: owner,
		fontFamily: 'A, face',
		style: null,
		weight: null,
		stretch: null,
		unicodeRange: 'U+41-5A',
	};
	const loads = [
		NoReactInternals.startPendingFontFace(metadata),
		NoReactInternals.startPendingFontFace({...metadata, ownerDocument: other}),
		NoReactInternals.startPendingFontFace({
			...metadata,
			fontFamily: 'Other family',
		}),
		NoReactInternals.startPendingFontFace({
			...metadata,
			unicodeRange: 'U+61-7A',
		}),
	];
	const records = NoReactInternals.getPendingFontFaces();
	try {
		const samples = [
			{
				style: {fontFamily: '"A, face", monospace'} as CSSStyleDeclaration,
				text: 'A',
			},
		];
		expect(getPendingFontFacesForSamples(owner, samples)).toEqual([
			records[0],
			records[3],
		]);
		expect(getPendingFontFacesForSamples(other, samples)).toEqual([records[1]]);
		expect(getPendingFontFacesForSamples(owner, [])).toEqual([]);
	} finally {
		for (const load of loads) load.resolve(null);
	}
});

test('pending descriptor alternatives remain relevant without loaded selection proof', () => {
	const owner = {} as Document;
	const loads = ['400', '700', '100 900'].map((weight) =>
		NoReactInternals.startPendingFontFace({
			ownerDocument: owner,
			fontFamily: 'Pending weight',
			style: 'italic',
			weight,
			stretch: '75%',
			unicodeRange: null,
		}),
	);
	try {
		const samples = [
			{
				style: {
					fontFamily: '"Pending weight"',
					fontWeight: '700',
					fontStyle: 'normal',
					fontStretch: '100%',
				} as CSSStyleDeclaration,
				text: 'Review',
			},
		];
		expect(getPendingFontFacesForSamples(owner, samples)).toEqual(
			NoReactInternals.getPendingFontFaces(),
		);
	} finally {
		for (const load of loads) load.resolve(null);
	}
});

test('unknown Unicode descriptors conservatively await the actual load outcome', () => {
	const owner = {} as Document;
	const loads = ['broken', 'U+110000', 'U+5A-41', 'U+1F6??'].map(
		(unicodeRange) =>
			NoReactInternals.startPendingFontFace({
				ownerDocument: owner,
				fontFamily: 'Unicode pending',
				style: null,
				weight: null,
				stretch: null,
				unicodeRange,
			}),
	);
	try {
		const samples = [
			{
				style: {fontFamily: '"Unicode pending"'} as CSSStyleDeclaration,
				text: '😀',
			},
		];
		expect(getPendingFontFacesForSamples(owner, samples)).toHaveLength(4);
	} finally {
		for (const load of loads) load.resolve(null);
	}
});

test.for(
	[
		'"SDK family"',
		String.raw`SDK\20 family`,
		String.raw`"SDK\20 family"`,
		String.raw`"SDK\,family"`,
	].flatMap((input) =>
		['raw CSS', 'literal CSS'].map((usage) => ({
			input,
			usage,
			cssFamily: usage === 'raw CSS' ? input : JSON.stringify(input),
		})),
	),
)(
	'keeps pending $input relevant to its $usage spelling',
	({input, cssFamily}) => {
		const initial = NoReactInternals.getPendingFontFaces();
		const owner = {} as Document;
		const load = NoReactInternals.startPendingFontFace({
			ownerDocument: owner,
			fontFamily: input,
			style: null,
			weight: null,
			stretch: null,
			unicodeRange: null,
		});
		const record = NoReactInternals.getPendingFontFaces().find(
			(face) => face.ownerDocument === owner,
		);
		try {
			expect(
				getPendingFontFacesForSamples(owner, [
					{
						style: {fontFamily: cssFamily} as CSSStyleDeclaration,
						text: 'Review',
					},
				]),
			).toEqual([record]);
		} finally {
			load.resolve(null);
		}

		expect(NoReactInternals.getPendingFontFaces()).toEqual(initial);
	},
);

test.for([
	{name: 'unknown quoted getter', input: null, mutated: false, blocks: true},
	{
		name: 'known literal quoted input',
		input: '"SDK family"',
		mutated: false,
		blocks: true,
	},
	{
		name: 'known plain input',
		input: 'SDK family',
		mutated: false,
		blocks: false,
	},
	{name: 'changed getter', input: 'SDK family', mutated: true, blocks: true},
])(
	'requires valid loaded-family proof for $name before dismissing pending weight 700',
	({input, mutated, blocks}) => {
		const initial = NoReactInternals.getPendingFontFaces();
		const face = {
			family: '"SDK family"',
			weight: '400',
			style: 'normal',
			stretch: '100%',
			unicodeRange: 'U+0-10FFFF',
			status: 'loaded',
		} as FontFace;
		const owner = {fonts: [face]} as unknown as Document;
		const known =
			input === null
				? null
				: NoReactInternals.startPendingFontFace({
						ownerDocument: owner,
						fontFamily: input,
						style: null,
						weight: null,
						stretch: null,
						unicodeRange: null,
					});
		const pending = NoReactInternals.startPendingFontFace({
			ownerDocument: owner,
			fontFamily: 'SDK family',
			style: 'normal',
			weight: '700',
			stretch: '100%',
			unicodeRange: null,
		});
		try {
			known?.resolve(face);
			if (mutated) face.family = '"Different family"';
			const record = NoReactInternals.getPendingFontFaces().find(
				(font) => font.ownerDocument === owner,
			);
			expect(
				getPendingFontFacesForSamples(owner, [
					{
						style: {
							fontFamily: '"SDK family"',
							fontWeight: '400',
							fontStyle: 'normal',
							fontStretch: '100%',
						} as CSSStyleDeclaration,
						text: 'Review',
					},
				]),
			).toEqual(blocks ? [record] : []);
		} finally {
			known?.resolve(null);
			pending.resolve(null);
		}

		expect(NoReactInternals.getPendingFontFaces()).toEqual(initial);
	},
);
