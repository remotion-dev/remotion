import type {Options, ParseMediaFields} from '../options';
import type {Structure} from '../parse-result';
import type {TracksState} from '../state/has-tracks-section';
import type {OnVideoSample} from '../webcodec-sample-types';
import {needsToIterateOverSamples} from './need-samples-for-fields';

export const maySkipVideoData = ({
	tracksState,
	videoSampleCallbacks,
	audioSampleCallbacks,
	fields,
	structure,
}: {
	tracksState: TracksState;
	videoSampleCallbacks: Record<number, OnVideoSample>;
	audioSampleCallbacks: Record<number, OnVideoSample>;
	structure: Structure | null;
	fields: Options<ParseMediaFields>;
}) => {
	return (
		tracksState.hasAllTracks() &&
		Object.values(videoSampleCallbacks).length === 0 &&
		Object.values(audioSampleCallbacks).length === 0 &&
		structure &&
		!needsToIterateOverSamples({
			fields,
			structure,
		})
	);
};
