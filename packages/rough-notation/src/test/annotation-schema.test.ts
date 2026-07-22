import {expect, test} from 'bun:test';
import {Internals, type InteractivitySchema} from 'remotion';
import {
	annotationSchemas,
	boxSchema,
	bracketSchema,
	circleSchema,
	crossedOffSchema,
	highlightSchema,
	strikeThroughSchema,
	underlineSchema,
} from '../Annotation';

const keys = (schema: InteractivitySchema) => Object.keys(schema);

test('named annotation schemas do not expose a type selector', () => {
	for (const schema of annotationSchemas) {
		expect(keys(schema)).not.toContain('type');
		expect(keys(schema)).toContain('disabled');
	}
});

test('underline exposes only effective padding', () => {
	expect(keys(underlineSchema)).toContain('padding.top');
	expect(keys(underlineSchema)).not.toContain('padding.left');
	expect(keys(underlineSchema)).not.toContain('padding.right');
	expect(keys(underlineSchema)).not.toContain('padding.bottom');
});

test('padding is only exposed by annotations that use it', () => {
	for (const schema of [
		boxSchema,
		bracketSchema,
		circleSchema,
		highlightSchema,
	]) {
		expect(keys(schema)).toContain('padding.left');
		expect(keys(schema)).toContain('padding.right');
		expect(keys(schema)).toContain('padding.top');
		expect(keys(schema)).toContain('padding.bottom');
	}

	for (const schema of [strikeThroughSchema, crossedOffSchema]) {
		expect(keys(schema)).not.toContain('padding.left');
		expect(keys(schema)).not.toContain('padding.top');
	}
});

test('component-specific controls are isolated to their schemas', () => {
	expect(keys(highlightSchema)).not.toContain('strokeWidth');
	expect(keys(circleSchema)).toContain('curveFitting');
	expect(keys(circleSchema)).toContain('curveTightness');
	expect(keys(circleSchema)).toContain('curveStepCount');
	expect(keys(bracketSchema)).not.toContain('curveFitting');
	expect(keys(bracketSchema)).toContain('bracketLeft');
	expect(keys(bracketSchema)).toContain('bracketRight');
	expect(keys(boxSchema)).not.toContain('bracketRight');
});

test('all named annotations expose text, font, and seed controls', () => {
	for (const schema of annotationSchemas) {
		expect(keys(schema)).toContain('children');
		expect(keys(schema)).toContain('style.fontFamily');
		expect(keys(schema)).toContain('style.fontSize');
		expect(keys(schema)).toContain('style.fontWeight');
		expect(keys(schema)).toContain('style.fontStyle');
		expect(keys(schema)).toContain('style.letterSpacing');
		expect(schema.seed).not.toHaveProperty('keyframable', false);
	}
});

test('all named annotation schemas can be flattened', () => {
	for (const schema of annotationSchemas) {
		expect(() => Internals.getFlatSchemaWithAllKeys(schema)).not.toThrow();
	}
});
