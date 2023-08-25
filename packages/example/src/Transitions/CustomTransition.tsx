import {getBoundingBox, translatePath} from '@remotion/paths';
import {makeStar} from '@remotion/shapes';
import {
	springTiming,
	TransitionPresentation,
	TransitionPresentationComponentProps,
	TransitionSeries,
} from '@remotion/transitions';
import React, {useMemo, useState} from 'react';
import {AbsoluteFill, random, useVideoConfig} from 'remotion';
import {Letter} from './BasicTransition';

type CustomPresentationProps = {
	shape: 'star' | 'circle';
	width: number;
	height: number;
};

const SlidePresentation: React.FC<
	TransitionPresentationComponentProps<CustomPresentationProps>
> = ({children, presentationDirection, presentationProgress, passedProps}) => {
	const finishedRadius =
		Math.sqrt(passedProps.width ** 2 + passedProps.height ** 2) / 2;
	const innerRadius = finishedRadius * presentationProgress;
	const outerRadius = finishedRadius * 2 * presentationProgress;

	const {path} = makeStar({
		innerRadius,
		outerRadius,
		points: 5,
	});

	const boundingBox = getBoundingBox(path);

	const translatedPath = translatePath(
		path,
		passedProps.width / 2 - boundingBox.width / 2,
		passedProps.height / 2 - boundingBox.height / 2,
	);

	const [clipId] = useState(() => String(random(null)));

	const style: React.CSSProperties = useMemo(() => {
		return {
			width: '100%',
			height: '100%',
			justifyContent: 'center',
			alignItems: 'center',
			clipPath:
				presentationDirection === 'exiting' ? undefined : `url(#${clipId})`,
		};
	}, [clipId, presentationDirection]);

	return (
		<AbsoluteFill>
			<AbsoluteFill style={style}>{children}</AbsoluteFill>
			<AbsoluteFill>
				<svg>
					<defs>
						<clipPath id={clipId}>
							<path d={translatedPath} fill="black" />
						</clipPath>
					</defs>
				</svg>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

const customTransition = (
	props: CustomPresentationProps,
): TransitionPresentation<CustomPresentationProps> => {
	return {component: SlidePresentation, props};
};

export const CustomTransition: React.FC = () => {
	const {width, height} = useVideoConfig();

	return (
		<TransitionSeries>
			<TransitionSeries.Sequence durationInFrames={70}>
				<Letter color="orange">A</Letter>
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition
				presentation={customTransition({shape: 'star', width, height})}
				timing={springTiming({
					durationInFrames: 45,
					config: {
						damping: 200,
					},
					durationRestThreshold: 0.0001,
				})}
			/>
			<TransitionSeries.Sequence durationInFrames={60}>
				<Letter color="pink">B</Letter>
			</TransitionSeries.Sequence>
		</TransitionSeries>
	);
};
