import {useMemo} from 'react';
import type {CSSProperties} from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import type {HtmlInCanvasShader} from '../html-in-canvas-presentation';
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

const pushCutCanvas: HtmlInCanvasShader<PushCutProps> = (canvas) => {
	const context = canvas.getContext('2d');
	if (!context) {
		throw new Error('Failed to create push cut canvas context');
	}

	let originElement: HTMLDivElement | null = null;
	let previousOrigin: PushCutProps['transformOrigin'];
	let previousWidth = 0;
	let previousHeight = 0;
	let previousPixelRatio = 0;
	let originX = 0;
	let originY = 0;

	return {
		clear: () => context.reset(),
		cleanup: () => {
			context.reset();
			originElement?.remove();
		},
		draw: ({
			prevImage,
			nextImage,
			width,
			height,
			time,
			pixelRatio,
			presentationDurationInFrames,
			passedProps,
		}) => {
			context.reset();
			const {
				cutProgress = 5 / 11,
				outgoingScale = 1.04,
				incomingStartScale = 1.04,
				incomingEndScale = 1.07,
				transformOrigin,
				flashColor = '#f5f2ed',
				flashOpacity: peakFlashOpacity = 0.2,
				flashFrames = 2,
			} = passedProps;

			if (transformOrigin === undefined) {
				originX = width / 2;
				originY = height / 2;
			} else if (
				transformOrigin !== previousOrigin ||
				width !== previousWidth ||
				height !== previousHeight ||
				pixelRatio !== previousPixelRatio
			) {
				if (!originElement) {
					originElement = document.createElement('div');
					originElement.style.cssText =
						'position:fixed;left:0;top:0;visibility:hidden;pointer-events:none;contain:strict;';
					document.body.appendChild(originElement);
				}

				originElement.style.width = `${width / pixelRatio}px`;
				originElement.style.height = `${height / pixelRatio}px`;
				originElement.style.transformOrigin = '';
				originElement.style.transformOrigin =
					typeof transformOrigin === 'number'
						? `${transformOrigin}px`
						: transformOrigin;
				const [x, y] =
					getComputedStyle(originElement).transformOrigin.split(' ');
				originX = parseFloat(x) * pixelRatio;
				originY = parseFloat(y) * pixelRatio;
			}

			previousOrigin = transformOrigin;
			previousWidth = width;
			previousHeight = height;
			previousPixelRatio = pixelRatio;

			const outgoingProgress = interpolate(time, [0, cutProgress], [0, 1], {
				...clamp,
				easing: Easing.in(Easing.quad),
			});
			const incomingProgress = interpolate(time, [cutProgress, 1], [0, 1], {
				...clamp,
				easing: Easing.out(Easing.quad),
			});
			const duration = Math.max(1, presentationDurationInFrames);
			const outgoingFlash = interpolate(
				time,
				[cutProgress - 1 / duration, cutProgress],
				[0, peakFlashOpacity],
				clamp,
			);
			const incomingFlash =
				flashFrames === 0
					? 0
					: interpolate(
							time,
							[cutProgress, cutProgress + flashFrames / duration],
							[peakFlashOpacity, 0],
							clamp,
						);

			for (const [image, visible, scale, flash] of [
				[
					nextImage,
					true,
					interpolate(outgoingProgress, [0, 1], [1, outgoingScale]),
					outgoingFlash,
				],
				[
					prevImage,
					time >= cutProgress,
					interpolate(
						incomingProgress,
						[0, 1],
						[incomingStartScale, incomingEndScale],
					),
					incomingFlash,
				],
			] as const) {
				if (!image || !visible) {
					continue;
				}

				context.save();
				context.translate(originX, originY);
				context.scale(scale, scale);
				context.drawImage(image, -originX, -originY, width, height);
				context.restore();
				context.fillStyle = flashColor;
				context.globalAlpha = flash;
				context.fillRect(0, 0, width, height);
				context.globalAlpha = 1;
			}
		},
	};
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
		? flashFrames === 0
			? 0
			: interpolate(
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
		<AbsoluteFill showInTimeline={false} style={outerStyle}>
			<AbsoluteFill showInTimeline={false} style={innerStyle}>
				{children}
			</AbsoluteFill>
			{flashOpacity > 0 ? (
				<AbsoluteFill
					showInTimeline={false}
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
		...(props?.outerEnterStyle ||
		props?.outerExitStyle ||
		props?.innerEnterStyle ||
		props?.innerExitStyle
			? {}
			: {canvas: pushCutCanvas}),
	};
};
