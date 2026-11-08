import {afterEach, beforeEach, expect, test} from 'bun:test';
import {getAudioData} from '../get-audio-data';

// Bun has no Web Audio API. Like a browser, the fake AudioContext decodes
// into a buffer at the sample rate the context was created with.
class FakeAudioContext {
	sampleRate: number;

	constructor(options?: {sampleRate?: number}) {
		this.sampleRate = options?.sampleRate ?? 44100;
	}

	decodeAudioData() {
		const {sampleRate} = this;
		return Promise.resolve({
			sampleRate,
			numberOfChannels: 1,
			duration: 1,
			getChannelData: () => new Float32Array(sampleRate),
		});
	}
}

const originalGlobals = {
	AudioContext: globalThis.AudioContext,
	document: globalThis.document,
	fetch: globalThis.fetch,
	window: globalThis.window,
};

let fetchedUrls: string[] = [];

beforeEach(() => {
	fetchedUrls = [];
	Object.assign(globalThis, {
		AudioContext: FakeAudioContext,
		document: {},
		window: {origin: 'http://localhost:3000'},
		fetch: (url: string) => {
			fetchedUrls.push(url);
			return Promise.resolve(new Response(new ArrayBuffer(8)));
		},
	});
});

afterEach(() => {
	Object.assign(globalThis, originalGlobals);
});

test('getAudioData() caches results per sample rate', async () => {
	const src = 'http://localhost:3000/sample-rate-cache.wav';

	const at16k = await getAudioData(src, {sampleRate: 16000});
	expect(at16k.sampleRate).toBe(16000);
	expect(at16k.channelWaveforms[0].length).toBe(16000);

	const at48k = await getAudioData(src, {sampleRate: 48000});
	expect(at48k.sampleRate).toBe(48000);
	expect(at48k.channelWaveforms[0].length).toBe(48000);

	// Omitting sampleRate uses the 48000 default and shares its cache entry
	expect(await getAudioData(src)).toBe(at48k);
	expect(await getAudioData(src, {sampleRate: 16000})).toBe(at16k);

	expect(fetchedUrls).toEqual([src, src]);
});
