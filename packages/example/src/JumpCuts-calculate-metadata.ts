import {CalculateMetadataFunction} from 'remotion';
import type {Section} from './JumpCuts-sections';

type Props = {
	sections: Section[];
};

const fps = 30;

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

export type {Props};
