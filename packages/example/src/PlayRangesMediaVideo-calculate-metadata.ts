import {CalculateMetadataFunction} from 'remotion';
import type {PlayRangeSection} from './PlayRangesMediaVideo-defaults';

const fps = 24;

export type PlayRangesMediaVideoProps = {
	url: string;
	playRanges: PlayRangeSection[];
};

export const calculateMetadataPlayRangesMedia: CalculateMetadataFunction<
	PlayRangesMediaVideoProps
> = ({props}) => {
	const durationInFrames = props.playRanges.reduce(
		(acc, s) => acc + (s.trimAfter - s.trimBefore),
		0,
	);

	return {
		fps,
		durationInFrames,
	};
};
