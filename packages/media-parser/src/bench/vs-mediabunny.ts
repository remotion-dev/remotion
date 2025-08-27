/* eslint-disable no-console */
import {EncodedPacketSink, Input, MP4, StreamSource} from 'mediabunny';
import {open} from 'node:fs/promises';
import {nodeReader} from '../node';
import {parseMedia} from '../parse-media';

const mediaParserBench = async () => {
	await parseMedia({
		src: '/Users/jonathanburger/Downloads/BigBuckBunny.mp4',
		reader: nodeReader,
		onVideoTrack: () => {
			return () => {};
		},
		acknowledgeRemotionLicense: true,
	});
};

const mediabunnyBench = async () => {
	const fileHandle = await open(
		'/Users/jonathanburger/Downloads/BigBuckBunny.mp4',
		'r',
	);

	const source = new StreamSource({
		read: async (start, end) => {
			const buffer = Buffer.alloc(end - start);
			await fileHandle.read(buffer, 0, end - start, start);
			return buffer;
		},
		getSize: async () => {
			const {size} = await fileHandle.stat();
			return size;
		},
	});

	const input = new Input({
		formats: [MP4],
		source,
	});

	const videoTrack = await input.getPrimaryVideoTrack();
	const sink = new EncodedPacketSink(videoTrack!);

	let currentPacket = await sink.getKeyPacket(0);
	while (currentPacket) {
		currentPacket = await sink.getNextPacket(currentPacket);
	}
};

console.time('mediabunny');
for (let i = 0; i < 10; i++) {
	await mediabunnyBench();
}

console.timeEnd('mediabunny');

console.time('remotion');
for (let i = 0; i < 10; i++) {
	await mediaParserBench();
}

console.timeEnd('remotion');
