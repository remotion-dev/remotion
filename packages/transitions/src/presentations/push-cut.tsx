import {useMemo} from 'react';
import type {CSSProperties} from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import type {
	TransitionPresentation,
	TransitionPresentationComponentProps,
} from '../types.js';

export type PushCutProps = {
	cutProgress?: number;
	outgoingScale?: number;
	incomingStartScale?: number;
	incomingEndScale?: number;
	transformOrigin?: CSSProperties['transformOrigin'];
	flashColor?: string;
	flashOpacity?: number;
	flashFrames?: number;
	outerEnterStyle?: CSSProperties;
	outerExitStyle?: CSSProperties;
	innerEnterStyle?: CSSProperties;
	innerExitStyle?: CSSProperties;
};

const clamp = {
	extrapolateLeft: 'clamp',
	extrapolateRight: 'clamp',
} as const;

const validateFiniteNumber = (name: string, value: number) => {
	if (!Number.isFinite(value)) {
		throw new TypeError(
			`${name} passed to pushCut() must be finite, received ${value}`,
		);
	}
};

const validateProps = (props: PushCutProps) => {
	const cutProgress = props.cutProgress ?? 5 / 11;
	const outgoingScale = props.outgoingScale ?? 1.04;
	const incomingStartScale = props.incomingStartScale ?? 1.04;
	const incomingEndScale = props.incomingEndScale ?? 1.07;
	const flashOpacity = props.flashOpacity ?? 0.2;
	const flashFrames = props.flashFrames ?? 2;

	validateFiniteNumber('cutProgress', cutProgress);
	if (cutProgress <= 0 || cutProgress >= 1) {
		throw new TypeError(
			`cutProgress passed to pushCut() must be greater than 0 and less than 1, received ${cutProgress}`,
		);
	}

	for (const [name, value] of [
		['outgoingScale', outgoingScale],
		['incomingStartScale', incomingStartScale],
		['incomingEndScale', incomingEndScale],
	] as const) {
		validateFiniteNumber(name, value);
		if (value <= 0) {
			throw new TypeError(
				`${name} passed to pushCut() must be greater than 0, received ${value}`,
			);
		}
	}

	validateFiniteNumber('flashOpacity', flashOpacity);
	if (flashOpacity < 0 || flashOpacity > 1) {
		throw new TypeError(
			`flashOpacity passed to pushCut() must be between 0 and 1, received ${flashOpacity}`,
		);
	}

	validateFiniteNumber('flashFrames', flashFrames);
	if (flashFrames < 0) {
		throw new TypeError(
			`flashFrames passed to pushCut() must be greater than or equal to 0, received ${flashFrames}`,
		);
	}
};

const PushCutPresentation: React.FC<
	TransitionPresentationComponentProps<PushCutProps>
> = ({
	children,
	presentationDirection,
	presentationDurationInFrames,
	presentationProgress,
	passedProps,
}) => {
	const {
		cutProgress = 5 / 11,
		outgoingScale = 1.04,
		incomingStartScale = 1.04,
		incomingEndScale = 1.07,
		transformOrigin = '50% 50%',
		flashColor = '#f5f2ed',
		flashOpacity: peakFlashOpacity = 0.2,
		flashFrames = 2,
		outerEnterStyle,
		outerExitStyle,
		innerEnterStyle,
		innerExitStyle,
	} = passedProps;

	const isEntering = presentationDirection === 'entering';

	const outgoingProgress = interpolate(
		presentationProgress,
		[0, cutProgress],
		[0, 1],
		{
			...clamp,
			easing: Easing.in(Easing.quad),
		},
	);
	const incomingProgress = interpolate(
		presentationProgress,
		[cutProgress, 1],
		[0, 1],
		{
			...clamp,
			easing: Easing.out(Easing.quad),
		},
	);

	const scale = isEntering
		? interpolate(
				incomingProgress,
				[0, 1],
				[incomingStartScale, incomingEndScale],
			)
		: interpolate(outgoingProgress, [0, 1], [1, outgoingScale]);

	const oneFrame = 1 / Math.max(1, presentationDurationInFrames);
	const flashTail = flashFrames / Math.max(1, presentationDurationInFrames);
	const flashOpacity = isEntering
		? interpolate(
				presentationProgress,
				[cutProgress, cutProgress + flashTail],
				[peakFlashOpacity, 0],
				clamp,
			)
		: interpolate(
				presentationProgress,
				[cutProgress - oneFrame, cutProgress],
				[0, peakFlashOpacity],
				clamp,
			);

	const outerStyle = useMemo<CSSProperties>(() => {
		return {
			opacity: isEntering && presentationProgress < cutProgress ? 0 : 1,
			overflow: 'hidden',
			...(isEntering ? outerEnterStyle : outerExitStyle),
		};
	}, [
		cutProgress,
		isEntering,
		outerEnterStyle,
		outerExitStyle,
		presentationProgress,
	]);

	const innerStyle = useMemo<CSSProperties>(() => {
		return {
			transform: `scale(${scale})`,
			transformOrigin,
			willChange: 'transform',
			...(isEntering ? innerEnterStyle : innerExitStyle),
		};
	}, [innerEnterStyle, innerExitStyle, isEntering, scale, transformOrigin]);

	return (
		<AbsoluteFill style={outerStyle}>
			<AbsoluteFill style={innerStyle}>{children}</AbsoluteFill>
			{flashOpacity > 0 ? (
				<AbsoluteFill
					style={{
						backgroundColor: flashColor,
						opacity: flashOpacity,
						pointerEvents: 'none',
					}}
				/>
			) : null}
		</AbsoluteFill>
	);
};

/*
 * Created by Tom Vaillant: https://github.com/tomvaillant
 * @description A hard editorial cut with a short punch-in on both scenes and a brief flash at the edit point.
 * @see [Documentation](https://www.remotion.dev/docs/transitions/presentations/push-cut)
 */
export const pushCut = (
	props?: PushCutProps,
): TransitionPresentation<PushCutProps> => {
	const passedProps = props ?? {};
	validateProps(passedProps);

	return {
		component: PushCutPresentation,
		props: passedProps,
	};
};
