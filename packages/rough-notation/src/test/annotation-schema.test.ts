import {expect, test} from 'bun:test';
import {Internals} from 'remotion';
import {annotationInteractiveSchema} from '../Annotation';

const activeKeysForType = (type: string) => {
	return Object.keys(
		Internals.flattenActiveSchema(annotationInteractiveSchema, (key) => {
			return key === 'type' ? type : undefined;
		}),
	);
};

test('annotation schema exposes bracket-specific props only for bracket annotations', () => {
	expect(activeKeysForType('highlight')).not.toContain('brackets');
	expect(activeKeysForType('box')).not.toContain('brackets');
	expect(activeKeysForType('bracket')).toContain('brackets');
});

test('annotation schema exposes box-specific props only for circle annotations', () => {
	expect(activeKeysForType('highlight')).not.toContain('box');
	expect(activeKeysForType('bracket')).not.toContain('box');
	expect(activeKeysForType('circle')).toContain('box');
});

test('annotation schema exposes roughness as a shared Studio control', () => {
	expect(activeKeysForType('highlight')).toContain('roughness');
	expect(activeKeysForType('bracket')).toContain('roughness');
	expect(activeKeysForType('circle')).toContain('roughness');
});

test('annotation schema exposes text editing and font controls', () => {
	const highlightKeys = activeKeysForType('highlight');
	expect(highlightKeys).toContain('children');
	expect(highlightKeys).toContain('style.fontFamily');
	expect(highlightKeys).toContain('style.fontSize');
	expect(highlightKeys).toContain('style.fontWeight');
	expect(highlightKeys).toContain('style.fontStyle');
	expect(highlightKeys).toContain('style.letterSpacing');
});

test('annotation schema can be flattened without duplicate keys', () => {
	expect(() =>
		Internals.getFlatSchemaWithAllKeys(annotationInteractiveSchema),
	).not.toThrow();
});
