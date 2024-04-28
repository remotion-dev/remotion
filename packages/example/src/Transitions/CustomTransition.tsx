import {getBoundingBox, translatePath} from '@remotion/paths';
import {makeStar} from '@remotion/shapes';
import {
	TransitionPresentation,
	TransitionPresentationComponentProps,
	TransitionSeries,
	TransitionTiming,
} from '@remotion/transitions';
import React, {useMemo, useState} from 'react';
import {
	AbsoluteFill,
	SpringConfig,
	measureSpring,
	random,
	spring,
	useVideoConfig,
} from 'remotion';
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

const customTiming = ({
	pauseDuration,
}: {
	pauseDuration: number;
}): TransitionTiming => {
	const firstHalf: Partial<SpringConfig> = {};
	const secondPush: Partial<SpringConfig> = {
		damping: 200,
	};

	return {
		getDurationInFrames: ({fps}) => {
			return (
				measureSpring({fps, config: firstHalf}) +
				measureSpring({fps, config: secondPush}) +
				pauseDuration
			);
		},
		getProgress({fps, frame}) {
			const first = spring({fps, frame, config: firstHalf});
			const second = spring({
				fps,
				frame,
				config: secondPush,
				delay: pauseDuration + measureSpring({fps, config: firstHalf}),
			});

			return first / 2 + second / 2;
		},
	};
};

export const CustomTransition: React.FC = () => {
	const {width, height} = useVideoConfig();

	return (
		<TransitionSeries>
			<TransitionSeries.Sequence durationInFrames={80}>
				<Letter color="orange">A</Letter>
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition
				presentation={customTransition({shape: 'star', width, height})}
				timing={customTiming({pauseDuration: 10})}
			/>
			<TransitionSeries.Sequence durationInFrames={200}>
				<Letter color="pink">B</Letter>
			</TransitionSeries.Sequence>
		</TransitionSeries>
	);
};
