import {describe, expect, test} from 'vitest';
import {parseLinearGradient} from '../drawing/parse-linear-gradient';
import '../symbol-dispose';

describe('parseLinearGradient', () => {
	test('should parse simple gradient with named colors', () => {
		const result = parseLinearGradient('linear-gradient(to right, red, blue)');
		expect(result).not.toBeNull();
		expect(result!.angle).toBe(90);
		expect(result!.colorStops).toHaveLength(2);
		expect(result!.colorStops[0].color).toBe('red');
		expect(result!.colorStops[0].position).toBe(0);
		expect(result!.colorStops[1].color).toBe('blue');
		expect(result!.colorStops[1].position).toBe(1);
	});

	test('should parse gradient with rgb() colors (browser format)', () => {
		const result = parseLinearGradient(
			'linear-gradient(to right, rgb(255, 0, 0), rgb(0, 0, 255))',
		);
		expect(result).not.toBeNull();
		expect(result!.angle).toBe(90);
		expect(result!.colorStops).toHaveLength(2);
		expect(result!.colorStops[0].color).toBe('rgb(255, 0, 0)');
		expect(result!.colorStops[1].color).toBe('rgb(0, 0, 255)');
	});

	test('should parse gradient with rgba() colors', () => {
		const result = parseLinearGradient(
			'linear-gradient(135deg, rgba(255, 0, 0, 0.5), rgba(0, 0, 255, 0.8))',
		);
		expect(result).not.toBeNull();
		expect(result!.angle).toBe(135);
		expect(result!.colorStops).toHaveLength(2);
		expect(result!.colorStops[0].color).toBe('rgba(255, 0, 0, 0.5)');
		expect(result!.colorStops[1].color).toBe('rgba(0, 0, 255, 0.8)');
	});

	test('should parse gradient without direction (defaults to 180deg)', () => {
		const result = parseLinearGradient(
			'linear-gradient(rgb(255, 255, 0), rgb(128, 0, 128))',
		);
		expect(result).not.toBeNull();
		expect(result!.angle).toBe(180);
		expect(result!.colorStops).toHaveLength(2);
	});

	test('should parse gradient with angle in degrees', () => {
		const result = parseLinearGradient(
			'linear-gradient(45deg, rgb(0, 128, 0), rgb(255, 165, 0))',
		);
		expect(result).not.toBeNull();
		expect(result!.angle).toBe(45);
		expect(result!.colorStops).toHaveLength(2);
	});

	test('should parse gradient with multiple color stops', () => {
		const result = parseLinearGradient(
			'linear-gradient(to right, rgb(255, 0, 0), rgb(255, 255, 0), rgb(0, 128, 0), rgb(0, 0, 255))',
		);
		expect(result).not.toBeNull();
		expect(result!.colorStops).toHaveLength(4);
		expect(result!.colorStops[0].position).toBe(0);
		expect(result!.colorStops[1].position).toBeCloseTo(0.333, 2);
		expect(result!.colorStops[2].position).toBeCloseTo(0.667, 2);
		expect(result!.colorStops[3].position).toBe(1);
	});

	test('should parse gradient with explicit positions', () => {
		const result = parseLinearGradient(
			'linear-gradient(to right, red 0%, yellow 50%, blue 100%)',
		);
		expect(result).not.toBeNull();
		expect(result!.colorStops).toHaveLength(3);
		expect(result!.colorStops[0].position).toBe(0);
		expect(result!.colorStops[1].position).toBe(0.5);
		expect(result!.colorStops[2].position).toBe(1);
	});

	test('should parse "to bottom" direction', () => {
		const result = parseLinearGradient('linear-gradient(to bottom, red, blue)');
		expect(result).not.toBeNull();
		expect(result!.angle).toBe(180);
	});

	test('should parse "to top" direction', () => {
		const result = parseLinearGradient('linear-gradient(to top, red, blue)');
		expect(result).not.toBeNull();
		expect(result!.angle).toBe(0);
	});

	test('should parse "to left" direction', () => {
		const result = parseLinearGradient('linear-gradient(to left, red, blue)');
		expect(result).not.toBeNull();
		expect(result!.angle).toBe(270);
	});

	test('should parse "to bottom right" direction', () => {
		const result = parseLinearGradient(
			'linear-gradient(to bottom right, red, blue)',
		);
		expect(result).not.toBeNull();
		expect(result!.angle).toBe(135);
	});

	test('should parse hex colors', () => {
		const result = parseLinearGradient(
			'linear-gradient(90deg, #ff0000, #0000ff)',
		);
		expect(result).not.toBeNull();
		expect(result!.colorStops[0].color).toBe('#ff0000');
		expect(result!.colorStops[1].color).toBe('#0000ff');
	});

	test('should return null for invalid input', () => {
		expect(parseLinearGradient('none')).toBeNull();
		expect(parseLinearGradient('')).toBeNull();
		expect(parseLinearGradient('radial-gradient(red, blue)')).toBeNull();
	});
});
