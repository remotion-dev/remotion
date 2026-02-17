import React, {useMemo} from 'react';
import {
	CalculateMetadataFunction,
	OffthreadVideo,
	useCurrentFrame,
} from 'remotion';

const fps = 30;

type Section = {
	trimBefore: number;
	trimAfter: number;
};

export const SAMPLE_SECTIONS: Section[] = [
	{trimBefore: 0, trimAfter: 5 * fps},
	{
		trimBefore: 5.2 * fps,
		trimAfter: 10 * fps,
	},
	{
		trimBefore: 13 * fps,
		trimAfter: 18 * fps,
	},
];

type Props = {
	sections: Section[];
};

export const calculateMetadataJumpCuts: CalculateMetadataFunction<Props> = ({
	props,
}) => {
	const durationInFrames = props.sections.reduce((acc, section) => {
		return acc + section.trimAfter - section.trimBefore;
	}, 0);

	return {
		fps,
		durationInFrames,
	};
};

export const JumpCuts: React.FC<Props> = ({sections}) => {
	const frame = useCurrentFrame();

	const cut = useMemo(() => {
		let summedUpDurations = 0;
		for (const section of sections) {
			summedUpDurations += section.trimAfter - section.trimBefore;
			if (summedUpDurations > frame) {
				const trimBefore = section.trimAfter - summedUpDurations;
				const offset = section.trimBefore - frame - trimBefore;

				return {
					trimBefore,
					firstFrameOfSection: offset === 0,
				};
			}
		}

		return null;
	}, [frame, sections]);

	if (cut === null) {
		return null;
	}

	return (
		<OffthreadVideo
			pauseWhenBuffering
			trimBefore={cut.trimBefore}
			// Remotion will automatically add a time fragment to the end of the video URL
			// based on `trimBefore` and `trimAfter`. Opt out of this by adding one yourself.
			// https://www.remotion.dev/docs/media-fragments
			src={`https://remotion.media/BigBuckBunny.mp4#t=0,`}
			// Force Remotion to seek when it jumps even just a tiny bit
			acceptableTimeShiftInSeconds={
				cut.firstFrameOfSection ? 0.000001 : undefined
			}
		/>
	);
};
