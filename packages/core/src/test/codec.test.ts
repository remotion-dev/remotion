import {
	CodecOrUndefined,
	getFinalOutputCodec,
	getOutputCodecOrUndefined,
	setCodec,
} from '../config/codec';

// getFinalOutputCodec

test('Codec tests valid codec input', () => {
	const validCodecInput: CodecOrUndefined[] = ['h264', 'h265', 'vp8', 'vp9'];
	validCodecInput.forEach((entry) =>
		expect(
			getFinalOutputCodec({codec: entry, emitWarning: false, fileExtension: ''})
		).toEqual(entry)
	);
});

test('Codec tests undefined codec input with known extension', () => {
	expect(
		getFinalOutputCodec({
			codec: undefined,
			emitWarning: false,
			fileExtension: 'webm',
		})
	).toEqual('vp8');
	expect(
		getFinalOutputCodec({
			codec: undefined,
			emitWarning: false,
			fileExtension: 'hevc',
		})
	).toEqual('h265');
});

test('Codec tests undefined codec input with unknown extension', () => {
	const unknownExtensions = ['', 'abc'];
	unknownExtensions.forEach((entry) => {
		expect(
			getFinalOutputCodec({
				codec: undefined,
				emitWarning: false,
				fileExtension: entry,
			})
		).toEqual('h264');
	});
});

// setCodec

test('Codec tests setOutputFormat', () => {
	const validCodecInputs: CodecOrUndefined[] = [
		'h264',
		'h265',
		'vp8',
		'vp9',
		undefined,
	];
	validCodecInputs.forEach((entry) => {
		setCodec(entry);
		expect(getOutputCodecOrUndefined()).toEqual(entry);
	});
});
