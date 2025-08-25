import {translatePath} from '@remotion/paths';
import {makeCircle} from '@remotion/shapes';
import React, {useMemo, useState} from 'react';
import {AbsoluteFill, random} from 'remotion';
import type {
	TransitionPresentation,
	TransitionPresentationComponentProps,
} from '../types.js';

export type IrisProps = {
	width: number;
	height: number;
	outerEnterStyle?: React.CSSProperties;
	outerExitStyle?: React.CSSProperties;
	innerEnterStyle?: React.CSSProperties;
	innerExitStyle?: React.CSSProperties;
};

const IrisPresentation: React.FC<
	TransitionPresentationComponentProps<IrisProps>
> = ({children, presentationDirection, presentationProgress, passedProps}) => {
	// Calculate the radius needed to cover the entire viewport
	const maxRadius =
		Math.sqrt(passedProps.width ** 2 + passedProps.height ** 2) / 2;

	// For iris, we want to start small and grow large (entering)
	// or start large and shrink small (exiting)
	const minRadius = 0;
	const currentRadius =
		presentationDirection === 'entering'
			? minRadius + (maxRadius - minRadius) * presentationProgress
			: maxRadius - (maxRadius - minRadius) * presentationProgress;

	const {path} = makeCircle({
		radius: currentRadius,
	});

	// Center the circle in the viewport
	const translatedPath = translatePath(
		path,
		passedProps.width / 2 - currentRadius,
		passedProps.height / 2 - currentRadius,
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
 * @description Creates an iris transition that uses a circular mask starting from the center to reveal the underlying scene.
 * @see [Documentation](https://www.remotion.dev/docs/transitions/presentations/iris)
 */
export const iris = (props: IrisProps): TransitionPresentation<IrisProps> => {
	return {component: IrisPresentation, props: props ?? {}};
};
