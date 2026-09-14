import type {AnnotationHandler, HighlightedCode} from 'codehike/code';
import {Pre} from 'codehike/code';
import {
	calculateTransitions,
	getStartingSnapshot,
} from 'codehike/utils/token-transitions';
import React, {useLayoutEffect, useMemo} from 'react';
import {
	AbsoluteFill,
	continueRender,
	delayRender,
	Easing,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {callout} from './annotations/Callout';
import {errorInline, errorMessage} from './annotations/Error';
import {tokenTransitions} from './annotations/InlineToken';
import {getTextDimensions} from './calculate-metadata/get-text-dimensions';
import {fontFamily, fontSize, lineHeight, tabSize} from './code-font';
import {applyStyle} from './code-utils';
import {PADDING_X, TOP_EXPLAINER_HEIGHT, TopExplainer} from './TopExplainer';

export function CodeTransition({
	previousCode,
	currentCode,
	nextCode,
	topExplainerContent,
}: {
	readonly previousCode: HighlightedCode | null;
	readonly currentCode: HighlightedCode;
	readonly nextCode: HighlightedCode | null;
	readonly topExplainerContent: React.ReactNode;
}) {
	const frame = useCurrentFrame();
	const {height, durationInFrames, width} = useVideoConfig();

	const previousRef = React.useRef<HTMLPreElement>(null);
	const currentRef = React.useRef<HTMLPreElement>(null);
	const nextRef = React.useRef<HTMLPreElement>(null);

	const [handle] = React.useState(() => delayRender());

	const prevCode: HighlightedCode = useMemo(() => {
		return previousCode || {...currentCode, tokens: [], annotations: []};
	}, [currentCode, previousCode]);

	const nexCode: HighlightedCode = useMemo(() => {
		return nextCode || {...currentCode, tokens: [], annotations: []};
	}, [currentCode, nextCode]);

	const code = useMemo(() => {
		return currentCode;
	}, [currentCode]);

	const progress = ({delay}: {delay: number}) => {
		return interpolate(frame, [delay, delay + 7], [0, 1], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
			easing: Easing.in(Easing.ease),
		});
	};

	const endProgress = interpolate(
		frame,
		[durationInFrames - 7, durationInFrames - 1],
		[0, 1],
		{
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
			easing: Easing.out(Easing.ease),
		},
	);

	useLayoutEffect(() => {
		const oldSnapshot = getStartingSnapshot(previousRef.current!);

		const transitionFromPrevious = calculateTransitions(
			currentRef.current!,
			oldSnapshot,
		);

		transitionFromPrevious.forEach(({element, keyframes, options}) => {
			if (endProgress === 0) {
				applyStyle({
					element,
					keyframes,
					progress: progress({delay: options.fill === 'both' ? 7 : 0}),
				});
			}
		});

		const transitionToNext = calculateTransitions(
			currentRef.current!,
			getStartingSnapshot(nextRef.current!),
		);

		transitionToNext.forEach(({element, keyframes, options}) => {
			if (options.fill === 'both' && endProgress > 0) {
				applyStyle({
					element,
					keyframes: {
						opacity: keyframes.opacity
							? (keyframes.opacity.slice().reverse() as [number, number])
							: undefined,
					},
					progress: endProgress,
				});
			}
		});
		continueRender(handle);
	});

	const handlers: AnnotationHandler[] = useMemo(() => {
		return [tokenTransitions, callout, errorInline, errorMessage];
	}, []);

	const oldDimensions = getTextDimensions(prevCode.code);
	const newDimensions = getTextDimensions(code.code);
	const interpolatedHeight = interpolate(
		progress({delay: 0}),
		[0, 1],
		[oldDimensions.height, newDimensions.height],
	);
	const paddingY =
		(height - interpolatedHeight) / 2 - (TOP_EXPLAINER_HEIGHT / 3) * 2;

	const style: React.CSSProperties = useMemo(() => {
		return {
			position: 'relative',
			fontSize,
			lineHeight,
			fontFamily,
			tabSize,
			marginTop: 0,
			marginBottom: 0,
		};
	}, []);

	const padX = width > 1044 ? PADDING_X * 2.5 : PADDING_X;

	return (
		<AbsoluteFill>
			<TopExplainer>{topExplainerContent}</TopExplainer>
			<div
				style={{
					flex: 1,
					position: 'relative',
				}}
			>
				<AbsoluteFill
					style={{
						paddingTop: paddingY,
						paddingLeft: padX,
						opacity: 0,
					}}
				>
					<Pre
						ref={previousRef}
						code={prevCode}
						handlers={handlers}
						style={style}
					/>
				</AbsoluteFill>
				<AbsoluteFill
					style={{
						paddingTop: paddingY,
						paddingLeft: padX,
					}}
				>
					<Pre ref={currentRef} code={code} handlers={handlers} style={style} />
				</AbsoluteFill>
				<AbsoluteFill
					style={{
						paddingTop: paddingY,
						paddingLeft: padX,
						opacity: 0,
					}}
				>
					<Pre ref={nextRef} code={nexCode} handlers={handlers} style={style} />
				</AbsoluteFill>
			</div>
		</AbsoluteFill>
	);
}
