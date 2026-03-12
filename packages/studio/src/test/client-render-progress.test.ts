import {expect, test} from 'bun:test';
import {
	formatEtaString,
	getClientRenderProgressMessage,
} from '../components/RenderQueue/client-render-progress';

test('formats ETA strings like server-side renders', () => {
	expect(formatEtaString(5_000)).toBe('5s');
	expect(formatEtaString(65_000)).toBe('1m 5s');
	expect(formatEtaString(3_725_000)).toBe('1h 2m 5s');
});

test('formats client render progress message while rendering', () => {
	expect(
		getClientRenderProgressMessage({
			encodedFrames: 10,
			totalFrames: 30,
			doneIn: null,
			renderEstimatedTime: 65_000,
			progress: 0.55,
		}),
	).toBe('Rendering 10/30, time remaining: 1m 5s');
});

test('formats client render progress message while encoding', () => {
	expect(
		getClientRenderProgressMessage({
			encodedFrames: 24,
			totalFrames: 30,
			doneIn: null,
			renderEstimatedTime: 0,
			progress: 0.94,
		}),
	).toBe('Encoded 24/30');
});

test('returns getting composition before frame totals are known', () => {
	expect(
		getClientRenderProgressMessage({
			encodedFrames: 0,
			totalFrames: 0,
			doneIn: null,
			renderEstimatedTime: 0,
			progress: 0,
		}),
	).toBe('Getting composition');
});
