import type {OnTrackEntrySegment} from './boxes/webm/segments';
import type {CodecSegment} from './boxes/webm/segments/track-entry';
import {getTrackCodec} from './boxes/webm/traversal';
import {getTrackId} from './traversal';

export const makeParserState = () => {
	const trackEntries: Record<number, CodecSegment> = {};
	const onTrackEntrySegment: OnTrackEntrySegment = (trackEntry) => {
		const codec = getTrackCodec(trackEntry);
		if (!codec) {
			throw new Error('Expected codec');
		}

		const trackId = getTrackId(trackEntry);
		if (!trackId) {
			throw new Error('Expected track id');
		}

		trackEntries[trackId] = codec;
	};

	const emittedCodecIds: number[] = [];

	return {
		onTrackEntrySegment,
		isEmitted: (id: number) => emittedCodecIds.includes(id),
		addEmittedCodecId: (id: number) => {
			emittedCodecIds.push(id);
		},
		getTrackInfoByNumber: (id: number) => trackEntries[id],
	};
};

export type ParserState = ReturnType<typeof makeParserState>;
