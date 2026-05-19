import React, {useMemo} from 'react';
import {OffthreadVideo, useCurrentFrame} from 'remotion';
import type {Section} from './JumpCuts-sections';

type Props = {
	sections: Section[];
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
			src={`https://remotion.media/BigBuckBunny.mp4#t=0,`}
			acceptableTimeShiftInSeconds={
				cut.firstFrameOfSection ? 0.000001 : undefined
			}
		/>
	);
};
