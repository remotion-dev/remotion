import {translatePath} from '@remotion/paths';
import {makePie} from '@remotion/shapes';
import React, {useMemo, useState} from 'react';
import {AbsoluteFill, random} from 'remotion';
import type {
	TransitionPresentation,
	TransitionPresentationComponentProps,
} from '../types.js';

export type ClockWipeProps = {
	width: number;
	height: number;
	outerEnterStyle?: React.CSSProperties;
	outerExitStyle?: React.CSSProperties;
	innerEnterStyle?: React.CSSProperties;
	innerExitStyle?: React.CSSProperties;
};

const ClockWipePresentation: React.FC<
	TransitionPresentationComponentProps<ClockWipeProps>
> = ({children, presentationDirection, presentationProgress, passedProps}) => {
	const finishedRadius =
		Math.sqrt(passedProps.width ** 2 + passedProps.height ** 2) / 2;

	const {path} = makePie({
		radius: finishedRadius,
		progress: presentationProgress,
	});

	const translatedPath = translatePath(
		path,
		-(finishedRadius * 2 - passedProps.width) / 2,
		-(finishedRadius * 2 - passedProps.height) / 2,
	);

	const [clipId] = useState(() => String(random(null)));
	const style: React.CSSProperties = useMemo(() => {
		return {
			width: '100%',
			height: '100%',
			clipPath:
				presentationDirection === 'exiting' ? undefined : `url(#${clipId})`,
			...(presentationDirection === 'entering'
				? passedProps.innerEnterStyle
				: passedProps.innerExitStyle),
		};
	}, [
		clipId,
		passedProps.innerEnterStyle,
		passedProps.innerExitStyle,
		presentationDirection,
	]);

	const outerStyle = useMemo(() => {
		return presentationDirection === 'entering'
			? passedProps.outerEnterStyle
			: passedProps.outerExitStyle;
	}, [
		passedProps.outerEnterStyle,
		passedProps.outerExitStyle,
		presentationDirection,
	]);

	return (
		<AbsoluteFill style={outerStyle}>
			<AbsoluteFill style={style}>{children}</AbsoluteFill>
			{presentationDirection === 'exiting' ? null : (
				<AbsoluteFill>
					<svg>
						<defs>
							<clipPath id={clipId}>
								<path d={translatedPath} fill="black" />
							</clipPath>
						</defs>
					</svg>
				</AbsoluteFill>
			)}
		</AbsoluteFill>
	);
};

/*
 * @description Creates a clock wipe transition that uses a circular wipe to reveal the underlying scene as the current scene exits.
 * @see [Documentation](https://www.remotion.dev/docs/transitions/presentations/clock-wipe)
 */
export const clockWipe = (
	props: ClockWipeProps,
): TransitionPresentation<ClockWipeProps> => {
	return {component: ClockWipePresentation, props: props ?? {}};
};
