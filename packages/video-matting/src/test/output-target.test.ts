import {afterEach, describe, expect, test} from 'bun:test';
import {WebMOutputFormat, type StreamTargetChunk} from 'mediabunny';
import {createVideoLayerOutput} from '../create-video-layer-output';
import type {VideoLayerOutputOptions} from '../output-target';

const originalNavigator = globalThis.navigator;

type FakeFile = {
	bytes: Uint8Array<ArrayBuffer>;
	position: number;
	closed: boolean;
	seekPositions: number[];
};

const makeFakeOpfs = () => {
	const files = new Map<string, FakeFile>();
	const removedNames: string[] = [];
	const directory = {
		getFileHandle: (name: string) => {
			if (!files.has(name)) {
				files.set(name, {
					bytes: new Uint8Array(),
					position: 0,
					closed: false,
					seekPositions: [],
				});
			}

			const file = files.get(name)!;
			return Promise.resolve({
				createWritable: () =>
					Promise.resolve({
						seek: (position: number) => {
							file.position = position;
							file.seekPositions.push(position);
						},
						write: (chunk: StreamTargetChunk) => {
							const end = file.position + chunk.data.byteLength;
							if (end > file.bytes.byteLength) {
								const resized = new Uint8Array(end);
								resized.set(file.bytes);
								file.bytes = resized;
							}

							file.bytes.set(chunk.data, file.position);
							file.position = end;
						},
						close: () => {
							file.closed = true;
						},
						abort: () => undefined,
					} as unknown as FileSystemWritableFileStream),
				getFile: () => Promise.resolve(new File([file.bytes], name)),
			} as FileSystemFileHandle);
		},
		removeEntry: (name: string) => {
			removedNames.push(name);
			files.delete(name);
			return Promise.resolve();
		},
	} as unknown as FileSystemDirectoryHandle;

	return {directory, files, removedNames};
};

afterEach(() => {
	Object.defineProperty(globalThis, 'navigator', {
		configurable: true,
		enumerable: true,
		value: originalNavigator,
		writable: true,
	});
});

describe('video layer output targets', () => {
	test('returns an in-memory WebM Blob', async () => {
		const created = await createVideoLayerOutput({
			format: new WebMOutputFormat(),
			options: {outputTarget: 'arraybuffer'},
		});

		await created.output.start();
		const result = await created.finalize();
		const blob = await result.getBlob();

		expect(blob.type).toBe('application/webm');
		expect(blob.size).toBeGreaterThan(0);
	});

	test('writes to and closes a caller-provided stream', async () => {
		let bytesWritten = 0;
		let closed = false;
		const created = await createVideoLayerOutput({
			format: new WebMOutputFormat(),
			options: {
				outputWritable: new WritableStream<StreamTargetChunk>({
					write: (chunk) => {
						bytesWritten += chunk.data.byteLength;
					},
					close: () => {
						closed = true;
					},
				}),
			},
		});

		await created.output.start();
		const result = await created.finalize();

		expect(bytesWritten).toBeGreaterThan(0);
		expect(closed).toBe(true);
		await expect(result.getBlob()).rejects.toThrow(
			'getBlob() is unavailable when outputWritable is used',
		);
	});

	test('uses OPFS by default and removes the file on disposal', async () => {
		const {directory, files, removedNames} = makeFakeOpfs();
		Object.defineProperty(globalThis, 'navigator', {
			configurable: true,
			value: {storage: {getDirectory: () => Promise.resolve(directory)}},
		});
		const created = await createVideoLayerOutput({
			format: new WebMOutputFormat(),
			options: undefined,
		});

		await created.output.start();
		const result = await created.finalize();
		const blob = await result.getBlob();
		const [filename, file] = [...files.entries()][0];

		expect(file.closed).toBe(true);
		expect(file.seekPositions.length).toBeGreaterThan(0);
		expect(blob.size).toBeGreaterThan(0);
		await result.dispose();
		expect(files.size).toBe(0);
		expect(removedNames.at(-1)).toBe(filename);
	});
});

const acceptOutputOptions = (_options: VideoLayerOutputOptions) => undefined;

acceptOutputOptions({outputTarget: 'arraybuffer'});
acceptOutputOptions({outputWritable: new WritableStream<StreamTargetChunk>()});
// @ts-expect-error outputTarget and outputWritable are mutually exclusive.
acceptOutputOptions({
	outputTarget: 'web-fs',
	outputWritable: new WritableStream<StreamTargetChunk>(),
});
