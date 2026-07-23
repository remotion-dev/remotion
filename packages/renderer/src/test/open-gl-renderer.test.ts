import {expect, test} from 'bun:test';
import {getOpenGlRenderer} from '../open-browser';

test('uses the Chrome default in v4', () => {
	expect(getOpenGlRenderer(undefined, false)).toEqual([]);
});

test('uses ANGLE with automatic SwiftShader fallback in v5', () => {
	expect(getOpenGlRenderer(undefined, true)).toEqual([
		'--use-gl=angle',
		'--enable-unsafe-swiftshader',
	]);
});

test('keeps null as an explicit opt-out in v5', () => {
	expect(getOpenGlRenderer(null, true)).toEqual([]);
});

test('enables automatic SwiftShader fallback for ANGLE in v5', () => {
	expect(getOpenGlRenderer('angle', true)).toEqual([
		'--use-gl=angle',
		'--enable-unsafe-swiftshader',
	]);
	expect(getOpenGlRenderer('angle', false)).toEqual(['--use-gl=angle']);
});

test('does not change explicitly selected software rendering', () => {
	expect(getOpenGlRenderer('swangle', true)).toEqual([
		'--use-gl=angle',
		'--use-angle=swiftshader',
	]);
});
