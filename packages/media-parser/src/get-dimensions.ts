import type {MainSegment} from './boxes/webm/segments/main';
import type {AnySegment} from './parse-result';
import {getMoovBox} from './traversal';

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

	const trackEntrySegment = tracksSegment.children.find((b) => {
		if (b.type !== 'track-entry-segment') {
			return false;
		}

		return (
			b.children.find(
				(c) => c.type === 'codec-segment' && c.codec.startsWith('V_'),
			) !== undefined
		);
	});
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

	const moovBox = getMoovBox(boxes);
	if (!moovBox) {
		throw new Error('Expected moov box');
	}

	const {children} = moovBox;
	if (!children) {
		throw new Error('Expected moov box children');
	}

	const t = children.find((b) => b.type === 'trak-box');

	if (!t || t.type !== 'trak-box') {
		throw new Error('Expected trak box');
	}

	const mdiaBox = t.children.find(
		(c) => c.type === 'regular-box' && c.boxType === 'mdia',
	);
	const tkhdBox = t.children.find((c) => c.type === 'tkhd-box');
	if (tkhdBox && tkhdBox.type === 'tkhd-box') {
		return {
			width: tkhdBox.width,
			height: tkhdBox.height,
		};
	}

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
	if (videoSamples.length === 0) {
		throw new Error('Has no video stream');
	}

	const [firstTrack] = videoSamples;
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
