import type {MainSegment} from './boxes/webm/segments/main';
import type {AnySegment} from './parse-result';

export type Dimensions = {
	width: number;
	height: number;
};

const getDimensionsFromMatroska = (segments: MainSegment): Dimensions => {
	const tracksSegment = segments.children.find(
		(b) => b.type === 'tracks-segment',
	);
	if (!tracksSegment || tracksSegment.type !== 'tracks-segment') {
		throw new Error('No tracks segment');
	}

	// TODO: What if there are multiple video tracks, or audio track is first?
	const trackEntrySegment = tracksSegment.children.find(
		(b) => b.type === 'track-entry-segment',
	);
	if (!trackEntrySegment || trackEntrySegment.type !== 'track-entry-segment') {
		throw new Error('No track entry segment');
	}

	const videoSegment = trackEntrySegment.children.find(
		(b) => b.type === 'video-segment',
	);
	if (!videoSegment || videoSegment.type !== 'video-segment') {
		throw new Error('No video segment');
	}

	const widthSegment = videoSegment.children.find(
		(b) => b.type === 'width-segment',
	);
	if (!widthSegment || widthSegment.type !== 'width-segment') {
		throw new Error('No width segment');
	}

	const heightSegment = videoSegment.children.find(
		(b) => b.type === 'height-segment',
	);
	if (!heightSegment || heightSegment.type !== 'height-segment') {
		throw new Error('No height segment');
	}

	return {
		width: widthSegment.width,
		height: heightSegment.height,
	};
};

export const getDimensions = (boxes: AnySegment[]): Dimensions => {
	const matroskaBox = boxes.find((b) => b.type === 'main-segment');
	if (matroskaBox && matroskaBox.type === 'main-segment') {
		return getDimensionsFromMatroska(matroskaBox);
	}

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

	return {width: firstTrack.width, height: firstTrack.height};
};

// TODO: An audio track should return 'hasDimensions' = true on an audio file
// and stop parsing
export const hasDimensions = (boxes: AnySegment[]): boolean => {
	try {
		return getDimensions(boxes) !== null;
	} catch (err) {
		return false;
	}
};
