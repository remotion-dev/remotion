import type {AnySegment} from './parse-video';

export const getDimensions = (boxes: AnySegment[]): number[] => {
	const moovBox = boxes.find((b) => b.type === 'moov-box');
	if (!moovBox || moovBox.type !== 'moov-box') {
		throw new Error('Expected moov box');
	}

	const {children} = moovBox;
	if (!children) {
		throw new Error('Expected moov box children');
	}

	const trakBoxes = children.filter((b) => b.type === 'trak-box');
	const tracks = trakBoxes
		.map((t) => {
			if (t.type !== 'trak-box') {
				throw new Error('Expected trak box');
			}

			const mdiaBox = t.children.find(
				(c) => c.type === 'regular-box' && c.boxType === 'mdia',
			);
			if (!mdiaBox) {
				throw new Error('Expected mdia box');
			}

			if (mdiaBox.type !== 'regular-box') {
				throw new Error('Expected mdia box');
			}

			const minfBox = mdiaBox.children.find(
				(c) => c.type === 'regular-box' && c.boxType === 'minf',
			);
			if (!minfBox) {
				throw new Error('Expected minf box');
			}

			if (minfBox.type !== 'regular-box') {
				throw new Error('Expected minf box');
			}

			const stblBox = minfBox.children.find(
				(c) => c.type === 'regular-box' && c.boxType === 'stbl',
			);

			if (!stblBox) {
				throw new Error('Expected stbl box');
			}

			if (stblBox.type !== 'regular-box') {
				throw new Error('Expected stbl box');
			}

			const stsdBox = stblBox.children.find((c) => c.type === 'stsd-box');

			if (!stsdBox) {
				throw new Error('Expected stsd box');
			}

			if (stsdBox.type !== 'stsd-box') {
				throw new Error('Expected stsd box');
			}

			const videoSamples = stsdBox.samples.filter((s) => s.type === 'video');
			return videoSamples[0];
		})
		.filter(Boolean);

	if (tracks.length === 0) {
		throw new Error('Has no video stream');
	}

	const [firstTrack] = tracks;
	if (firstTrack.type !== 'video') {
		throw new Error('Expected video track');
	}

	return [firstTrack.width, firstTrack.height];
};
