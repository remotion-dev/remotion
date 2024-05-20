import type {BufferIterator} from '../../read-and-increment-offset';
import type {InfoSegment} from './segments/info';
import {parseInfoSegment} from './segments/info';
import type {MainSegment} from './segments/main';
import {parseMainSegment} from './segments/main';
import {parseMuxingSegment, type MuxingAppSegment} from './segments/muxing';
import {parseSeekSegment, type SeekSegment} from './segments/seek';
import type {SeekHeadSegment} from './segments/seek-head';
import {parseSeekHeadSegment} from './segments/seek-head';
import {
	parseSeekPositionSegment,
	type SeekPositionSegment,
} from './segments/seek-position';
import type {TimestampScaleSegment} from './segments/timestamp-scale';
import {parseTimestampScaleSegment} from './segments/timestamp-scale';
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
	| VoidSegment
	| InfoSegment
	| TimestampScaleSegment
	| MuxingAppSegment;

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

	if (segmentId === '0x1549a966') {
		return parseInfoSegment(iterator);
	}

	if (segmentId === '0x2ad7b183') {
		return parseTimestampScaleSegment(iterator);
	}

	if (segmentId === '0x4d808c') {
		return parseMuxingSegment(iterator);
	}

	const length = iterator.getVint(8);
	const child = parseUnknownSegment(iterator, segmentId, length);
	return child;
};
