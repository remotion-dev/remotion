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

test('annotation schema exposes bracket flags only for bracket annotations', () => {
	expect(activeKeysForType('highlight')).not.toContain('bracketRight');
	expect(activeKeysForType('box')).not.toContain('bracketRight');
	expect(activeKeysForType('bracket')).toContain('bracketLeft');
	expect(activeKeysForType('bracket')).toContain('bracketRight');
	expect(activeKeysForType('bracket')).toContain('bracketTop');
	expect(activeKeysForType('bracket')).toContain('bracketBottom');
});

test('annotation schema exposes box-specific props only for circle annotations', () => {
	expect(activeKeysForType('highlight')).not.toContain('box');
	expect(activeKeysForType('bracket')).not.toContain('box');
	expect(activeKeysForType('circle')).toContain('box');
});

test('annotation schema exposes roughness as a shared Studio control', () => {
	expect(activeKeysForType('none')).toContain('roughness');
	expect(activeKeysForType('highlight')).toContain('roughness');
	expect(activeKeysForType('bracket')).toContain('roughness');
	expect(activeKeysForType('circle')).toContain('roughness');
});

test('annotation schema allows keyframing the seed', () => {
	expect(annotationInteractiveSchema.seed).not.toHaveProperty(
		'keyframable',
		false,
	);
});

test('annotation schema exposes rough.js controls as top-level Studio controls', () => {
	const highlightKeys = activeKeysForType('highlight');
	expect(highlightKeys).toContain('maxRandomnessOffset');
	expect(highlightKeys).toContain('bowing');
	expect(highlightKeys).toContain('curveFitting');
	expect(highlightKeys).toContain('curveTightness');
	expect(highlightKeys).toContain('curveStepCount');
	expect(highlightKeys).toContain('fillWeight');
	expect(highlightKeys).toContain('hachureAngle');
	expect(highlightKeys).toContain('hachureGap');
	expect(highlightKeys).toContain('dashOffset');
	expect(highlightKeys).toContain('dashGap');
	expect(highlightKeys).toContain('zigzagOffset');
	expect(highlightKeys).toContain('disableMultiStroke');
	expect(highlightKeys).toContain('disableMultiStrokeFill');
	expect(highlightKeys).toContain('preserveVertices');
	expect(highlightKeys).toContain('fillShapeRoughnessGain');
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

test('annotation schema supports none to disable annotations', () => {
	expect(activeKeysForType('none')).toContain('type');
	expect(
		(annotationInteractiveSchema.type as {variants: Record<string, unknown>})
			.variants,
	).toHaveProperty('none');
});

test('annotation schema can be flattened without duplicate keys', () => {
	expect(() =>
		Internals.getFlatSchemaWithAllKeys(annotationInteractiveSchema),
	).not.toThrow();
});
