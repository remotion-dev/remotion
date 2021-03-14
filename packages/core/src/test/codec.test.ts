import {
	CodecOrUndefined,
	getFinalOutputCodec,
	getOutputCodecOrUndefined,
	setCodec,
	setOutputFormat,
} from '../config/codec';

// getFinalOutputCodec

test('Codec tests valid codec input', () => {
	const values: CodecOrUndefined[] = ['h264', 'h265', 'vp8', 'vp9'];
	values.forEach((entry) =>
		expect(
			getFinalOutputCodec({codec: entry, emitWarning: true, fileExtension: ''})
		).toEqual(entry)
	);
});

test('Codec tests undefined codec input with known extension', () => {
	expect(
		getFinalOutputCodec({
			codec: undefined,
			emitWarning: true,
			fileExtension: 'webm',
		})
	).toEqual('vp8');
	expect(
		getFinalOutputCodec({
			codec: undefined,
			emitWarning: true,
			fileExtension: 'hevc',
		})
	).toEqual('h265');
});

test('Codec tests undefined codec input with unknown extension', () => {
	expect(
		getFinalOutputCodec({
			codec: undefined,
			emitWarning: true,
			fileExtension: '',
		})
	).toEqual('h264');
	expect(
		getFinalOutputCodec({
			codec: undefined,
			emitWarning: true,
			fileExtension: 'abc',
		})
	).toEqual('h264');
});

// setOutputFormat

test('Codec tests setOutputFormat', () => {
	expect(getOutputCodecOrUndefined()).toEqual(undefined);
	setOutputFormat('mp4');
	expect(getOutputCodecOrUndefined()).toEqual('h264');
	setOutputFormat('png-sequence');
	expect(getOutputCodecOrUndefined()).toEqual(undefined);
});

// setCodec

test('Codec tests setOutputFormat', () => {
	const values: CodecOrUndefined[] = ['h264', 'h265', 'vp8', 'vp9', undefined];
	values.forEach((entry) => {
		setCodec(entry);
		expect(getOutputCodecOrUndefined()).toEqual(entry);
	});
});
