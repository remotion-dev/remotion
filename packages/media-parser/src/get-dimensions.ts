import type {MainSegment} from './boxes/webm/segments/main';
import {trakBoxContainsVideo} from './get-fps';
import type {AnySegment} from './parse-result';
import {getMoovBox, getStsdBox, getTkhdBox, getTraks} from './traversal';

export type Dimensions = {
	width: number;
	height: number;
};

export type ExpandedDimensions = Dimensions & {
	rotation: number;
	unrotatedWidth: number;
	unrotatedHeight: number;
};

const getDimensionsFromMatroska = (
	segments: MainSegment,
): ExpandedDimensions => {
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
		rotation: 0,
		unrotatedHeight: heightSegment.height,
		unrotatedWidth: widthSegment.width,
	};
};

export const getDimensions = (boxes: AnySegment[]): ExpandedDimensions => {
	const matroskaBox = boxes.find((b) => b.type === 'main-segment');
	if (matroskaBox && matroskaBox.type === 'main-segment') {
		return getDimensionsFromMatroska(matroskaBox);
	}

	const moovBox = getMoovBox(boxes);
	if (!moovBox) {
		throw new Error('Expected moov box');
	}

	const trakBox = getTraks(moovBox).filter((t) => trakBoxContainsVideo(t))[0];

	if (!trakBox) {
		throw new Error('Expected trak box');
	}

	const tkhdBox = getTkhdBox(trakBox);
	if (tkhdBox) {
		return {
			width: tkhdBox.width,
			height: tkhdBox.height,
			rotation: tkhdBox.rotation,
			unrotatedHeight: tkhdBox.unrotatedHeight,
			unrotatedWidth: tkhdBox.unrotatedWidth,
		};
	}

	const stsdBox = getStsdBox(trakBox);

	if (!stsdBox) {
		throw new Error('Expected stsd box');
	}

	const videoSamples = stsdBox.samples.filter((s) => s.type === 'video');
	if (videoSamples.length === 0) {
		throw new Error('Has no video stream');
	}

	const [firstSample] = videoSamples;
	if (firstSample.type !== 'video') {
		throw new Error('Expected video track');
	}

	return {
		width: firstSample.width,
		height: firstSample.height,
		rotation: 0,
		unrotatedHeight: firstSample.height,
		unrotatedWidth: firstSample.width,
	};
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
