import {expect, test} from 'bun:test';
import {
	getFontFaceFamilyInput,
	getPendingFontFaces,
	startPendingFontFace,
} from '../font-face-registry';

test('pending font operations preserve document identity and clear only their own state', async () => {
	const ownerDocument = {} as Document;
	const otherDocument = {} as Document;
	const metadata = {
		ownerDocument,
		fontFamily: 'Pending face',
		style: null,
		weight: '700',
		stretch: null,
		unicodeRange: 'U+20-7E',
	};
	const first = startPendingFontFace(metadata);
	const second = startPendingFontFace(metadata);
	const other = startPendingFontFace({
		...metadata,
		ownerDocument: otherDocument,
	});
	const records = getPendingFontFaces();
	try {
		expect(records).toHaveLength(3);
		expect(records[0].completion).not.toBe(records[1].completion);
		expect(records.map((record) => record.ownerDocument)).toEqual([
			ownerDocument,
			ownerDocument,
			otherDocument,
		]);
		getPendingFontFaces().splice(0);
		expect(getPendingFontFaces()).toHaveLength(3);
		first.resolve(null);
		await records[0].completion;
		expect(getPendingFontFaces()).toEqual(records.slice(1));
		second.resolve(null);
		await records[1].completion;
		expect(getPendingFontFaces()).toEqual(records.slice(2));
	} finally {
		first.resolve(null);
		second.resolve(null);
		other.resolve(null);
	}

	expect(getPendingFontFaces()).toHaveLength(0);
});

test('pending rejection keeps error identity, clears metadata and permits a fresh retry', async () => {
	const metadata = {
		ownerDocument: {} as Document,
		fontFamily: 'Retry face',
		style: 'italic',
		weight: null,
		stretch: '75% 100%',
		unicodeRange: null,
	};
	const first = startPendingFontFace(metadata);
	const record = getPendingFontFaces()[0];
	const error = new Error('Incumbent font load failed');
	first.reject(error);
	expect(getPendingFontFaces()).toHaveLength(0);
	await expect(record.completion).rejects.toBe(error);
	const retry = startPendingFontFace(metadata);
	const next = getPendingFontFaces()[0];
	expect(next.completion).not.toBe(record.completion);
	retry.resolve(null);
	await next.completion;
	expect(getPendingFontFaces()).toHaveLength(0);
});

test('unobserved SDK rejection is handled without requiring a web capture', async () => {
	const load = startPendingFontFace({
		ownerDocument: {} as Document,
		fontFamily: 'No capture',
		style: null,
		weight: null,
		stretch: null,
		unicodeRange: null,
	});
	load.reject(new Error('No subscriber'));
	await Promise.resolve();
	await Promise.resolve();
	expect(getPendingFontFaces()).toHaveLength(0);
});

test('successful SDK completion preserves raw family input for the actual face only while its getter agrees', async () => {
	const face = {family: '"SDK family"'} as FontFace;
	const otherFace = {family: '"SDK family"'} as FontFace;
	const load = startPendingFontFace({
		ownerDocument: {} as Document,
		fontFamily: 'SDK family',
		style: null,
		weight: null,
		stretch: null,
		unicodeRange: null,
	});
	const record = getPendingFontFaces()[0];
	expect(getFontFaceFamilyInput(face)).toBeNull();
	load.resolve(face);
	await record.completion;
	expect(getFontFaceFamilyInput(face)).toBe('SDK family');
	expect(getFontFaceFamilyInput(otherFace)).toBeNull();
	face.family = 'Different family';
	expect(getFontFaceFamilyInput(face)).toBeNull();
	expect(getPendingFontFaces()).toHaveLength(0);
});

test('metadata-only completion leaves an unrelated native face untagged', async () => {
	const face = {family: 'Metadata only'} as FontFace;
	const load = startPendingFontFace({
		ownerDocument: {} as Document,
		fontFamily: face.family,
		style: null,
		weight: null,
		stretch: null,
		unicodeRange: null,
	});
	const record = getPendingFontFaces()[0];
	load.resolve(null);
	await record.completion;
	expect(getFontFaceFamilyInput(face)).toBeNull();
	expect(getPendingFontFaces()).toHaveLength(0);
});
