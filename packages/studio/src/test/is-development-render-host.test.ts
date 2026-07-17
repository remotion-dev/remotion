import {expect, test} from 'bun:test';
import {
	getClientRenderBillingHint,
	isDevelopmentRenderHost,
} from '../helpers/is-development-render-host';

test('treats localhost-style hosts as development renders', () => {
	expect(isDevelopmentRenderHost('localhost')).toBe(true);
	expect(isDevelopmentRenderHost('LOCALHOST')).toBe(true);
	expect(isDevelopmentRenderHost('127.0.0.1')).toBe(true);
	expect(isDevelopmentRenderHost('::1')).toBe(true);
	expect(isDevelopmentRenderHost('[::1]')).toBe(true);
	expect(isDevelopmentRenderHost('app.localhost')).toBe(true);
});

test('treats public hosts as production renders', () => {
	expect(isDevelopmentRenderHost('example.com')).toBe(false);
	expect(isDevelopmentRenderHost('studio.remotion.dev')).toBe(false);
	expect(isDevelopmentRenderHost('192.168.1.10')).toBe(false);
});

test('billing hint distinguishes development and production', () => {
	expect(getClientRenderBillingHint('localhost')).toBe(
		'This is a development render (localhost) and will not be charged.',
	);
	expect(getClientRenderBillingHint('example.com')).toBe(
		'This is considered a production render and may count toward usage.',
	);
});
