import {NoReactInternals} from 'remotion/no-react';
import {expect, test} from 'vitest';
import {
	certainNativeFontFamily,
	fontFamilyAliases,
} from '../font-family-matching';

// These are string/metadata policy tests. The separate native family controls
// establish which spelling each browser's FontFace constructor actually selects.
test.for([
	{input: 'SDK family', aliases: ['sdk family']},
	{input: '"SDK family"', aliases: ['"sdk family"', 'sdk family']},
	{
		input: String.raw`SDK\20 family`,
		aliases: [String.raw`sdk\20 family`, 'sdk family'],
	},
	{
		input: String.raw`"SDK\20 family"`,
		aliases: [String.raw`"sdk\20 family"`, 'sdk family'],
	},
	{
		input: String.raw`"SDK\,family"`,
		aliases: [String.raw`"sdk\,family"`, 'sdk,family'],
	},
	{input: ' SDK family ', aliases: [' sdk family ', 'sdk family']},
	{input: 'First, Second', aliases: ['first, second']},
])(
	'preserves literal and single CSS family aliases for $input',
	({input, aliases}) => {
		expect(fontFamilyAliases(input)).toEqual(aliases);
	},
);

test('untracked quoted or escaped getters cannot prove a loaded family identity', () => {
	for (const family of ['"SDK family"', String.raw`SDK\20 family`]) {
		expect(certainNativeFontFamily({family} as FontFace)).toBeNull();
	}

	expect(certainNativeFontFamily({family: 'SDK family'} as FontFace)).toBe(
		'sdk family',
	);
});

test('the existing SDK tracker credits only its exact unambiguous input and unchanged getter', () => {
	const initial = NoReactInternals.getPendingFontFaces();
	const ownerDocument = {} as Document;
	const face = {family: '"SDK family"'} as FontFace;
	const otherFace = {family: face.family} as FontFace;
	const load = NoReactInternals.startPendingFontFace({
		ownerDocument,
		fontFamily: 'SDK family',
		style: null,
		weight: null,
		stretch: null,
		unicodeRange: null,
	});
	try {
		expect(certainNativeFontFamily(face)).toBeNull();
		load.resolve(face);
		expect(certainNativeFontFamily(face)).toBe('sdk family');
		expect(certainNativeFontFamily(otherFace)).toBeNull();
		face.family = '"Changed family"';
		expect(NoReactInternals.getFontFaceFamilyInput(face)).toBeNull();
		expect(certainNativeFontFamily(face)).toBeNull();
	} finally {
		load.resolve(null);
	}

	expect(NoReactInternals.getPendingFontFaces()).toEqual(initial);
});

test('tagging an ambiguous SDK input does not turn a literal quoted family into a plain family', () => {
	const initial = NoReactInternals.getPendingFontFaces();
	const face = {family: '"SDK family"'} as FontFace;
	const load = NoReactInternals.startPendingFontFace({
		ownerDocument: {} as Document,
		fontFamily: '"SDK family"',
		style: null,
		weight: null,
		stretch: null,
		unicodeRange: null,
	});
	try {
		load.resolve(face);
		expect(NoReactInternals.getFontFaceFamilyInput(face)).toBe('"SDK family"');
		expect(certainNativeFontFamily(face)).toBeNull();
	} finally {
		load.resolve(null);
	}

	expect(NoReactInternals.getPendingFontFaces()).toEqual(initial);
});
