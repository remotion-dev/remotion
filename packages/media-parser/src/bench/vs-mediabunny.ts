import {BlobSource, EncodedPacketSink, Input, MP4} from 'mediabunny';
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
	const bigBuckBunny = Bun.file(
		'/Users/jonathanburger/Downloads/BigBuckBunny.mp4',
	);

	const input = new Input({
		formats: [MP4],
		source: new BlobSource(bigBuckBunny),
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
