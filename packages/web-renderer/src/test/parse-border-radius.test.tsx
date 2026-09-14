import {expect, test} from 'vitest';
import {parseBorderRadius} from '../drawing/border-radius';
import '../symbol-dispose';

test('should parse single pixel value', () => {
	const result = parseBorderRadius({
		borderRadius: '10px',
		width: 100,
		height: 200,
	});
	expect(result).toEqual({
		topLeft: {horizontal: 10, vertical: 10},
		topRight: {horizontal: 10, vertical: 10},
		bottomRight: {horizontal: 10, vertical: 10},
		bottomLeft: {horizontal: 10, vertical: 10},
	});
});

test('should parse zero value', () => {
	const result = parseBorderRadius({
		borderRadius: '0px',
		width: 100,
		height: 200,
	});
	expect(result).toEqual({
		topLeft: {horizontal: 0, vertical: 0},
		topRight: {horizontal: 0, vertical: 0},
		bottomRight: {horizontal: 0, vertical: 0},
		bottomLeft: {horizontal: 0, vertical: 0},
	});
});

test('should parse two values', () => {
	const result = parseBorderRadius({
		borderRadius: '10px 20px',
		width: 100,
		height: 200,
	});
	expect(result).toEqual({
		topLeft: {horizontal: 10, vertical: 10},
		topRight: {horizontal: 20, vertical: 20},
		bottomRight: {horizontal: 10, vertical: 10},
		bottomLeft: {horizontal: 20, vertical: 20},
	});
});

test('should parse three values', () => {
	const result = parseBorderRadius({
		borderRadius: '10px 20px 30px',
		width: 100,
		height: 200,
	});
	expect(result).toEqual({
		topLeft: {horizontal: 10, vertical: 10},
		topRight: {horizontal: 20, vertical: 20},
		bottomRight: {horizontal: 30, vertical: 30},
		bottomLeft: {horizontal: 20, vertical: 20},
	});
});

test('should parse four values', () => {
	const result = parseBorderRadius({
		borderRadius: '100% 10px 32px 8px',
		width: 100,
		height: 200,
	});
	expect(result).toEqual({
		topLeft: {horizontal: 90.9090909090909, vertical: 181.8181818181818}, // 100% of width, 100% of height (clamped)
		topRight: {horizontal: 9.09090909090909, vertical: 9.09090909090909},
		bottomRight: {horizontal: 29.09090909090909, vertical: 29.09090909090909},
		bottomLeft: {horizontal: 7.2727272727272725, vertical: 7.2727272727272725},
	});
});

test('should parse mixed percentages and pixels', () => {
	const result = parseBorderRadius({
		borderRadius: '10px 150% 30px',
		width: 100,
		height: 200,
	});
	expect(result).toEqual({
		topLeft: {horizontal: 5.555555555555555, vertical: 5.555555555555555},
		topRight: {horizontal: 83.33333333333334, vertical: 166.66666666666669}, // 150% of width, 150% of height (clamped)
		bottomRight: {horizontal: 16.666666666666668, vertical: 16.666666666666668},
		bottomLeft: {horizontal: 83.33333333333334, vertical: 166.66666666666669}, // 150% of width, 150% of height (clamped)
	});
});

test('should parse horizontal and vertical radii with slash', () => {
	const result = parseBorderRadius({
		borderRadius: '10px 5% / 20px 30px',
		width: 100,
		height: 200,
	});
	expect(result).toEqual({
		topLeft: {horizontal: 10, vertical: 20},
		topRight: {horizontal: 5, vertical: 30},
		bottomRight: {horizontal: 10, vertical: 20},
		bottomLeft: {horizontal: 5, vertical: 30},
	});
});

test('should resolve horizontal percentages using width', () => {
	const result = parseBorderRadius({
		borderRadius: '50%',
		width: 100,
		height: 200,
	});
	expect(result).toEqual({
		topLeft: {horizontal: 50, vertical: 100}, // 50% of width, 50% of height
		topRight: {horizontal: 50, vertical: 100},
		bottomRight: {horizontal: 50, vertical: 100},
		bottomLeft: {horizontal: 50, vertical: 100},
	});
});

test('should resolve vertical percentages using height', () => {
	const result = parseBorderRadius({
		borderRadius: '10px / 25%',
		width: 100,
		height: 200,
	});
	expect(result).toEqual({
		topLeft: {horizontal: 10, vertical: 50},
		topRight: {horizontal: 10, vertical: 50},
		bottomRight: {horizontal: 10, vertical: 50},
		bottomLeft: {horizontal: 10, vertical: 50},
	});
});

test('should handle complex case with all four corners and slash', () => {
	const result = parseBorderRadius({
		borderRadius: '10px 20px 30px 40px / 15px 25px 35px 45px',
		width: 100,
		height: 200,
	});
	expect(result).toEqual({
		topLeft: {horizontal: 10, vertical: 15},
		topRight: {horizontal: 20, vertical: 25},
		bottomRight: {horizontal: 30, vertical: 35},
		bottomLeft: {horizontal: 40, vertical: 45},
	});
});

test('should handle percentage with slash notation', () => {
	const result = parseBorderRadius({
		borderRadius: '50% / 25%',
		width: 100,
		height: 200,
	});
	expect(result).toEqual({
		topLeft: {horizontal: 50, vertical: 50}, // 50% of width, 25% of height
		topRight: {horizontal: 50, vertical: 50},
		bottomRight: {horizontal: 50, vertical: 50},
		bottomLeft: {horizontal: 50, vertical: 50},
	});
});

test('should handle asymmetric shorthand expansion with slash', () => {
	const result = parseBorderRadius({
		borderRadius: '10px 20px / 30px',
		width: 100,
		height: 200,
	});
	expect(result).toEqual({
		topLeft: {horizontal: 10, vertical: 30},
		topRight: {horizontal: 20, vertical: 30},
		bottomRight: {horizontal: 10, vertical: 30},
		bottomLeft: {horizontal: 20, vertical: 30},
	});
});

test('should handle three values before and after slash', () => {
	const result = parseBorderRadius({
		borderRadius: '10px 20px 30px / 15px 25px 35px',
		width: 100,
		height: 200,
	});
	expect(result).toEqual({
		topLeft: {horizontal: 10, vertical: 15},
		topRight: {horizontal: 20, vertical: 25},
		bottomRight: {horizontal: 30, vertical: 35},
		bottomLeft: {horizontal: 20, vertical: 25},
	});
});

test('should handle percentages over 100%', () => {
	const result = parseBorderRadius({
		borderRadius: '150% 200%',
		width: 100,
		height: 200,
	});
	expect(result).toEqual({
		topLeft: {horizontal: 42.857142857142854, vertical: 85.71428571428571}, // 150% of width, 150% of height (clamped)
		topRight: {horizontal: 57.14285714285714, vertical: 114.28571428571428}, // 200% of width, 200% of height (clamped)
		bottomRight: {horizontal: 42.857142857142854, vertical: 85.71428571428571},
		bottomLeft: {horizontal: 57.14285714285714, vertical: 114.28571428571428},
	});
});

test('should handle mixed units with slash and percentages', () => {
	const result = parseBorderRadius({
		borderRadius: '50% 10px / 20% 30px',
		width: 100,
		height: 200,
	});
	expect(result).toEqual({
		topLeft: {horizontal: 50, vertical: 40},
		topRight: {horizontal: 10, vertical: 30},
		bottomRight: {horizontal: 50, vertical: 40},
		bottomLeft: {horizontal: 10, vertical: 30},
	});
});

test('should parse large percentage values that will need clamping', () => {
	const result = parseBorderRadius({
		borderRadius: '150%',
		width: 100,
		height: 100,
	});
	// Clamping now happens during parsing
	expect(result).toEqual({
		topLeft: {horizontal: 50, vertical: 50},
		topRight: {horizontal: 50, vertical: 50},
		bottomRight: {horizontal: 50, vertical: 50},
		bottomLeft: {horizontal: 50, vertical: 50},
	});
});

test('should proportionally clamp a large pixel radius on a wide box', () => {
	const result = parseBorderRadius({
		borderRadius: '999px',
		width: 200,
		height: 50,
	});
	expect(result).toEqual({
		topLeft: {horizontal: 25, vertical: 25},
		topRight: {horizontal: 25, vertical: 25},
		bottomRight: {horizontal: 25, vertical: 25},
		bottomLeft: {horizontal: 25, vertical: 25},
	});
});
