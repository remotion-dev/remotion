import {expect, test} from 'bun:test';
import {
	ALL_FORMATS,
	BlobSource,
	BufferSource,
	BufferTarget,
	EncodedPacket,
	EncodedVideoPacketSource,
	Input,
	Output,
	StreamTarget,
	type StreamTargetChunk,
	WebMOutputFormat,
} from 'mediabunny';
import {prepareAudio} from '../prepare-audio';

const getAudioFixture = async () => {
	const input = new Input({
		formats: ALL_FORMATS,
		source: new BlobSource(
			Bun.file(new URL('../../../example/public/opus.webm', import.meta.url)),
		),
	});
	const track = await input.getPrimaryAudioTrack();
	if (track === null) {
		throw new Error('Expected an audio track in the fixture');
	}

	return {input, track, start: await track.getFirstTimestamp()};
};

test('copies and rebases Opus audio to both outputs', async () => {
	const {input, start} = await getAudioFixture();
	const baseTarget = new BufferTarget();
	const foregroundTarget = new BufferTarget();
	const baseOutput = new Output({
		format: new WebMOutputFormat(),
		target: baseTarget,
	});
	const foregroundOutput = new Output({
		format: new WebMOutputFormat(),
		target: foregroundTarget,
	});
	const audio = await prepareAudio({
		input,
		baseOutput,
		foregroundOutput,
		destination: 'both',
		videoStartTimestamp: start,
		videoEndTimestamp: start + 0.25,
		audioQuality: null,
		forceTranscode: false,
	});

	await Promise.all([baseOutput.start(), foregroundOutput.start()]);
	await audio.prime();
	await audio.finishAudio();
	await Promise.all([baseOutput.finalize(), foregroundOutput.finalize()]);

	for (const buffer of [baseTarget.buffer, foregroundTarget.buffer]) {
		expect(buffer).not.toBeNull();
		const outputInput = new Input({
			formats: ALL_FORMATS,
			source: new BufferSource(buffer!),
		});
		const outputTrack = await outputInput.getPrimaryAudioTrack();
		expect(await outputTrack?.getCodec()).toBe('opus');
		expect(await outputTrack?.getFirstTimestamp()).toBe(0);
		outputInput.dispose();
	}

	input.dispose();
});

test('primes delayed audio so the muxer can emit queued video', async () => {
	const {input, start} = await getAudioFixture();
	let bytesWritten = 0;
	const baseOutput = new Output({
		format: new WebMOutputFormat(),
		target: new StreamTarget(
			new WritableStream<StreamTargetChunk>({
				write: (chunk) => {
					bytesWritten += chunk.data.byteLength;
				},
			}),
		),
	});
	const foregroundOutput = new Output({
		format: new WebMOutputFormat(),
		target: new BufferTarget(),
	});
	const videoSource = new EncodedVideoPacketSource('vp9');
	const decoderConfig: VideoDecoderConfig = {
		codec: 'vp09.00.10.08',
		codedWidth: 2,
		codedHeight: 2,
	};
	baseOutput.addVideoTrack(videoSource, {decoderConfig});
	const audio = await prepareAudio({
		input,
		baseOutput,
		foregroundOutput,
		destination: 'base',
		videoStartTimestamp: start - 1,
		videoEndTimestamp: start + 0.25,
		audioQuality: null,
		forceTranscode: false,
	});

	await baseOutput.start();
	await videoSource.add(
		new EncodedPacket(new Uint8Array([0]), 'key', 0, 0.04),
		{decoderConfig},
	);
	await Promise.resolve();
	const bytesBeforePrime = bytesWritten;
	await audio.prime();
	await Promise.resolve();

	expect(bytesWritten).toBeGreaterThan(bytesBeforePrime);
	await audio.cancel();
	await Promise.all([baseOutput.cancel(), foregroundOutput.cancel()]);
	input.dispose();
});

test('uses the transcoding path when packet copying is disabled', async () => {
	const {input, track, start} = await getAudioFixture();
	Object.defineProperty(track, 'canDecode', {
		value: () => Promise.resolve(false),
	});
	const baseOutput = new Output({
		format: new WebMOutputFormat(),
		target: new BufferTarget(),
	});
	const foregroundOutput = new Output({
		format: new WebMOutputFormat(),
		target: new BufferTarget(),
	});

	await expect(
		prepareAudio({
			input,
			baseOutput,
			foregroundOutput,
			destination: 'base',
			videoStartTimestamp: start,
			videoEndTimestamp: start + 0.25,
			audioQuality: null,
			forceTranscode: true,
		}),
	).rejects.toThrow('cannot be decoded');

	await Promise.all([baseOutput.cancel(), foregroundOutput.cancel()]);
	input.dispose();
});
