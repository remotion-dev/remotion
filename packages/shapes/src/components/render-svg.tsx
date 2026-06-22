import type {Instruction} from '@remotion/paths';
import React, {useCallback, useMemo, useRef} from 'react';
import {version} from 'react-dom';
import {
	HtmlInCanvas,
	Internals,
	Sequence,
	type EffectsProp,
	type HtmlInCanvasPixelDensity,
	type HtmlInCanvasProps,
	type InteractiveBaseProps,
	type SequenceControls,
} from 'remotion';
import {doesReactSupportTransformOriginProperty} from '../utils/does-react-support-canary';

type ShapeSequenceProps = InteractiveBaseProps & {
	readonly controls?: SequenceControls;
};

const HtmlInCanvasWithPrivateProps = HtmlInCanvas as React.ComponentType<
	HtmlInCanvasProps & {
		readonly controls?: SequenceControls;
		readonly ref?: React.Ref<HTMLCanvasElement>;
	}
>;

export type AllShapesProps = Omit<
	React.SVGProps<SVGPathElement>,
	'width' | 'height' | 'd' | 'hidden' | 'name'
> &
	ShapeSequenceProps & {
		readonly debug?: boolean;
		readonly effects?: EffectsProp;
		readonly pathStyle?: React.CSSProperties;
		readonly pixelDensity?: HtmlInCanvasPixelDensity;
		/**
		 * @deprecated For internal use only
		 */
		readonly stack?: string;
	};

export const RenderSvg = ({
	defaultName,
	documentationLink,
	width,
	height,
	path,
	style,
	pathStyle,
	transformOrigin,
	debug,
	effects = [],
	instructions,
	pixelDensity,
	durationInFrames,
	from,
	trimBefore,
	freeze,
	hidden,
	name,
	showInTimeline,
	controls,
	stack,
	...props
}: {
	readonly defaultName: string;
	readonly documentationLink: string;
	readonly width: number;
	readonly height: number;
	readonly path: string;
	readonly instructions: Instruction[];
	readonly transformOrigin: string;
} & AllShapesProps) => {
	const actualStyle = useMemo((): React.CSSProperties => {
		return {
			overflow: 'visible',
			...(style ?? {}),
		};
	}, [style]);

	const actualPathStyle = useMemo((): React.CSSProperties => {
		return {
			transformBox: 'fill-box',
			...(pathStyle ?? {}),
		};
	}, [pathStyle]);

	const outlineRef = useRef<Element | null>(null);
	const setSvgRef = useCallback((node: SVGSVGElement | null) => {
		outlineRef.current = node;
	}, []);

	const setCanvasRef = useCallback((canvas: HTMLCanvasElement | null) => {
		outlineRef.current = canvas;
	}, []);

	const memoizedEffectDefinitions =
		Internals.useMemoizedEffectDefinitions(effects);
	const videoConfig = Internals.useUnsafeVideoConfig();

	const reactSupportsTransformOrigin =
		doesReactSupportTransformOriginProperty(version);

	const svg = (
		<svg
			ref={effects.length === 0 || !videoConfig ? setSvgRef : undefined}
			width={width}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
			xmlns="http://www.w3.org/2000/svg"
			style={
				effects.length === 0 || !videoConfig
					? actualStyle
					: {overflow: 'visible'}
			}
		>
			<path
				{...(reactSupportsTransformOrigin
					? {
							transformOrigin,
						}
					: {
							'transform-origin': transformOrigin,
						})}
				d={path}
				style={actualPathStyle}
				{...props}
			/>
			{debug
				? instructions.map((i, index) => {
						if (i.type === 'C') {
							const prevInstruction =
								index === 0
									? instructions[instructions.length - 1]
									: instructions[index - 1];
							if (
								prevInstruction.type === 'V' ||
								prevInstruction.type === 'H' ||
								prevInstruction.type === 'a' ||
								prevInstruction.type === 'Z' ||
								prevInstruction.type === 't' ||
								prevInstruction.type === 'q' ||
								prevInstruction.type === 'l' ||
								prevInstruction.type === 'c' ||
								prevInstruction.type === 'm' ||
								prevInstruction.type === 'h' ||
								prevInstruction.type === 's' ||
								prevInstruction.type === 'v'
							) {
								return null;
							}

							const prevX = prevInstruction.x;
							const prevY = prevInstruction.y;
							return (
								// eslint-disable-next-line react/no-array-index-key
								<React.Fragment key={index}>
									<path
										d={`M ${prevX} ${prevY} ${i.cp1x} ${i.cp1y}`}
										strokeWidth={2}
										stroke="rgba(0, 0, 0, 0.4)"
									/>
									<path
										d={`M ${i.x} ${i.y} ${i.cp2x} ${i.cp2y}`}
										strokeWidth={2}
										stroke="rgba(0, 0, 0, 0.4)"
									/>
									<circle
										cx={i.cp1x}
										cy={i.cp1y}
										r={3}
										fill="white"
										strokeWidth={2}
										stroke="black"
									/>
									<circle
										cx={i.cp2x}
										cy={i.cp2y}
										r={3}
										strokeWidth={2}
										fill="white"
										stroke="black"
									/>
								</React.Fragment>
							);
						}

						return null;
					})
				: null}
		</svg>
	);

	const content =
		effects.length === 0 ? (
			svg
		) : (
			<HtmlInCanvasWithPrivateProps
				ref={setCanvasRef}
				width={Math.ceil(width)}
				height={Math.ceil(height)}
				effects={effects}
				pixelDensity={pixelDensity}
				showInTimeline={false}
				style={actualStyle}
				controls={controls}
			>
				{svg}
			</HtmlInCanvasWithPrivateProps>
		);

	const stackProps = stack === undefined ? null : ({stack} as const);

	if (!videoConfig) {
		return svg;
	}

	return (
		<Sequence
			layout="none"
			from={from}
			trimBefore={trimBefore}
			freeze={freeze}
			hidden={hidden}
			showInTimeline={showInTimeline}
			controls={controls}
			_remotionInternalEffects={memoizedEffectDefinitions}
			durationInFrames={durationInFrames}
			name={name ?? defaultName}
			outlineRef={outlineRef}
			_remotionInternalDocumentationLink={
				name === undefined ? documentationLink : undefined
			}
			{...stackProps}
		>
			{content}
		</Sequence>
	);
};
