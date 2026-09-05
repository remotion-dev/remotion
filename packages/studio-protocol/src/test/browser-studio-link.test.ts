import {expect, test} from 'bun:test';
import {StudioProtocolInternals} from '..';
import {createElementPayload} from '../element-payload';

const payload = createElementPayload({
	dependencies: [],
	dimensions: {height: 180, width: 320},
	displayName: 'Linked Element',
	durationInFrames: 60,
	installationMode: 'wrapped',
	slug: 'linked-element',
	sourceCode: 'export const LinkedElement = () => <div>Grüezi 👋</div>;',
});

test('round-trips a payload through the default Browser Studio URL', () => {
	const url = StudioProtocolInternals.makeBrowserStudioUrl({
		endpoint: null,
		payload,
	});
	const parsedUrl = new URL(url);

	expect(parsedUrl.origin).toBe('https://www.remotion.dev');
	expect(parsedUrl.pathname).toBe('/new');
	expect(url).not.toContain('Grüezi');
	expect(
		StudioProtocolInternals.parseBrowserStudioHash(parsedUrl.hash),
	).toEqual(payload);
});

test('preserves a configured Browser Studio endpoint', () => {
	const url = StudioProtocolInternals.makeBrowserStudioUrl({
		endpoint: 'https://studio.example.test/new?template=blank',
		payload,
	});
	const parsedUrl = new URL(url);

	expect(parsedUrl.origin).toBe('https://studio.example.test');
	expect(parsedUrl.pathname).toBe('/new');
	expect(parsedUrl.search).toBe('?template=blank');
	expect(
		StudioProtocolInternals.parseBrowserStudioHash(parsedUrl.hash),
	).toEqual(payload);
});

test('rejects malformed Browser Studio fragments and endpoints', () => {
	expect(StudioProtocolInternals.parseBrowserStudioHash('')).toBe(null);
	expect(
		StudioProtocolInternals.parseBrowserStudioHash(
			'#remotion-browser-studio=not%2Bbase64',
		),
	).toBe(null);
	expect(() =>
		StudioProtocolInternals.makeBrowserStudioUrl({
			endpoint: 'file:///tmp/studio.html',
			payload,
		}),
	).toThrow('Browser Studio endpoint must use HTTP or HTTPS');
});
