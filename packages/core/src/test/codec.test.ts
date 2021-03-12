import {
	getFinalOutputCodec,
	getOutputCodecOrUndefined,
	setCodec,
	setOutputFormat,
} from '../config/codec';

// getFinalOutputCodec

test('Codec tests valid codec input', () => {
	expect(
		getFinalOutputCodec({codec: 'h264', emitWarning: true, fileExtension: ''})
	).toEqual('h264');
	expect(
		getFinalOutputCodec({codec: 'h265', emitWarning: true, fileExtension: ''})
	).toEqual('h265');
	expect(
		getFinalOutputCodec({codec: 'vp8', emitWarning: true, fileExtension: ''})
	).toEqual('vp8');
	expect(
		getFinalOutputCodec({codec: 'vp9', emitWarning: true, fileExtension: ''})
	).toEqual('vp9');
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
	expect(getOutputCodecOrUndefined()).toEqual(undefined);
	setCodec('h264');
	expect(getOutputCodecOrUndefined()).toEqual('h264');
	setCodec('h265');
	expect(getOutputCodecOrUndefined()).toEqual('h265');
	setCodec('vp8');
	expect(getOutputCodecOrUndefined()).toEqual('vp8');
	setCodec('vp9');
	expect(getOutputCodecOrUndefined()).toEqual('vp9');
	setCodec(undefined);
	expect(getOutputCodecOrUndefined()).toEqual(undefined);
});
