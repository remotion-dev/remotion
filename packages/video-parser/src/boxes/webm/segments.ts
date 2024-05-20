import type {BufferIterator} from '../../read-and-increment-offset';
import type {MainSegment} from './segments/main';
import {parseMainSegment} from './segments/main';
import {parseSeekSegment, type SeekSegment} from './segments/seek';
import type {SeekHeadSegment} from './segments/seek-head';
import {parseSeekHeadSegment} from './segments/seek-head';
import {
	parseSeekPositionSegment,
	type SeekPositionSegment,
} from './segments/seek-position';
import type {UnknownSegment} from './segments/unknown';
import {parseUnknownSegment} from './segments/unknown';
import type {VoidSegment} from './segments/void';
import {parseVoidSegment} from './segments/void';

export type MatroskaSegment =
	| MainSegment
	| UnknownSegment
	| SeekHeadSegment
	| SeekSegment
	| SeekPositionSegment
	| VoidSegment;

export const expectSegment = (iterator: BufferIterator) => {
	const segmentId = iterator.getMatroskaSegmentId();

	if (segmentId === '0x18538067') {
		return parseMainSegment(iterator);
	}

	if (segmentId === '0x114d9b74') {
		return parseSeekHeadSegment(iterator);
	}

	if (segmentId === '0x4dbb') {
		return parseSeekSegment(iterator);
	}

	if (segmentId === '0x53ac') {
		return parseSeekPositionSegment(iterator);
	}

	if (segmentId === '0xec') {
		return parseVoidSegment(iterator);
	}

	const length = iterator.getVint(8);
	const child = parseUnknownSegment(iterator, segmentId, length);
	return child;
};
