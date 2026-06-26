import React, {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react';
import type {SequenceControls} from '../CompositionManager.js';
import {addSequenceStackTraces} from '../enable-sequence-stack-traces.js';
import type {InteractiveBaseProps} from '../Interactive.js';
import {
	baseSchema,
	transformSchema,
	type InteractivitySchema,
} from '../interactivity-schema.js';
import {Sequence} from '../Sequence.js';
import {useDelayRender} from '../use-delay-render.js';
import {withInteractivitySchema} from '../with-interactivity-schema.js';
import type {EffectsProp} from './effect-types.js';
import {runEffectChain} from './run-effect-chain.js';
import {useEffectChainState} from './use-effect-chain-state.js';
import {
	useMemoizedEffectDefinitions,
	useMemoizedEffects,
} from './use-memoized-effects.js';

type MandatoryProps = {
	readonly width: number;
	readonly height: number;
};

type OptionalProps = {
	readonly color: string | undefined;
	readonly effects: EffectsProp;
	readonly className: string | undefined;
	readonly style: React.CSSProperties | undefined;
	readonly pixelDensity: number | undefined;
};

const resolveSolidPixelDensity = (pixelDensity: number | undefined): number => {
	if (pixelDensity === undefined) {
		return 1;
	}

	if (
		typeof pixelDensity !== 'number' ||
		!Number.isFinite(pixelDensity) ||
		pixelDensity <= 0
	) {
		throw new Error(
			`<Solid>: \`pixelDensity\` must be a positive finite number. Received: ${String(pixelDensity)}.`,
		);
	}

	return pixelDensity;
};

type InnerSolidProps = MandatoryProps &
	OptionalProps & {
		overrideId: string | null;
	};
export type SolidProps = MandatoryProps & Partial<OptionalProps>;

export const solidSchema = {
	...baseSchema,
	color: {
		type: 'color',
		default: 'transparent',
		description: 'Color',
	},
	width: {
		type: 'number',
		min: 1,
		step: 1,
		default: 1920,
		description: 'Width',
		hiddenFromList: false,
	},
	height: {
		type: 'number',
		min: 1,
		step: 1,
		default: 1080,
		description: 'Height',
		hiddenFromList: false,
	},
	pixelDensity: {
		type: 'number',
		min: 1,
		max: 3,
		step: 0.1,
		default: 1,
		description: 'Pixel density',
		hiddenFromList: false,
	},
	...transformSchema,
} as const satisfies InteractivitySchema;

const SolidInner: React.FC<
	InnerSolidProps & {
		readonly overrideId: string | null;
		readonly reference: React.Ref<HTMLCanvasElement>;
	}
> = ({
	color,
	width,
	height,
	effects = [],
	className,
	style,
	pixelDensity,
	overrideId,
	reference,
}) => {
	const {delayRender, continueRender, cancelRender} = useDelayRender();

	const resolvedPixelDensity = resolveSolidPixelDensity(pixelDensity);
	const canvasWidth = Math.ceil(width * resolvedPixelDensity);
	const canvasHeight = Math.ceil(height * resolvedPixelDensity);

	const [outputCanvas, setOutputCanvas] = useState<HTMLCanvasElement | null>(
		null,
	);

	const memoizedEffects = useMemoizedEffects({
		effects,
		overrideId: overrideId ?? null,
	});

	const sourceCanvas = useMemo(() => {
		if (typeof document === 'undefined') {
			return null;
		}

		const canvas = document.createElement('canvas');
		canvas.width = 1;
		canvas.height = 1;
		return canvas;
	}, []);

	const chainState = useEffectChainState();

	const canvasRef = useCallback(
		(canvas: HTMLCanvasElement | null) => {
			setOutputCanvas(canvas);

			if (typeof reference === 'function') {
				reference(canvas);
			} else if (reference) {
				reference.current = canvas;
			}
		},
		[reference],
	);

	// Fill source and run effect chain on every frame / color change.
	useEffect(() => {
		if (!outputCanvas || !sourceCanvas) {
			return;
		}

		const handle = delayRender('Solid effect chain');

		if (!chainState) {
			continueRender(handle);
			return () => {
				continueRender(handle);
			};
		}

		const ctx = sourceCanvas.getContext('2d', {colorSpace: 'srgb'});
		if (!ctx) {
			cancelRender(
				new Error('Failed to acquire 2D context for <Solid> source'),
			);
			return;
		}

		ctx.clearRect(0, 0, 1, 1);
		if (color !== undefined) {
			ctx.fillStyle = color;
			ctx.fillRect(0, 0, 1, 1);
		}

		runEffectChain({
			state: chainState.get(canvasWidth, canvasHeight)!,
			source: sourceCanvas,
			effects: memoizedEffects,
			output: outputCanvas,
			width: canvasWidth,
			height: canvasHeight,
		})
			.then((completed) => {
				if (completed) {
					continueRender(handle);
				}
			})
			.catch((err) => {
				cancelRender(err);
			});

		return () => {
			continueRender(handle);
		};
	}, [
		color,
		outputCanvas,
		sourceCanvas,
		chainState,
		canvasWidth,
		canvasHeight,
		delayRender,
		continueRender,
		cancelRender,
		memoizedEffects,
	]);

	const canvasStyle = useMemo(() => {
		return {
			width,
			height,
			...(style ?? {}),
		};
	}, [height, style, width]);

	return (
		<canvas
			ref={canvasRef}
			width={canvasWidth}
			height={canvasHeight}
			className={className}
			style={canvasStyle}
		/>
	);
};

const SolidOuter = forwardRef<
	HTMLCanvasElement,
	SolidProps & {
		readonly controls: SequenceControls | undefined;
	} & InteractiveBaseProps
>(
	(
		{
			effects = [],
			controls,
			color,
			height,
			width,
			className,
			durationInFrames,
			style,
			name,
			from,
			trimBefore,
			freeze,
			hidden,
			showInTimeline,
			pixelDensity,
			...props
		},
		ref,
	) => {
		props satisfies Record<string, never>;

		const memoizedEffectDefinitions = useMemoizedEffectDefinitions(effects);

		const actualRef = useRef<HTMLCanvasElement | null>(null);
		useImperativeHandle(ref, () => {
			return actualRef.current as HTMLCanvasElement;
		}, []);

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
				name={name ?? '<Solid>'}
				outlineRef={actualRef}
				_remotionInternalDocumentationLink="https://www.remotion.dev/docs/solid"
				// 'stack' is in props
				{...props}
			>
				<SolidInner
					reference={actualRef}
					overrideId={controls?.overrideId ?? null}
					color={color}
					height={height}
					width={width}
					className={className}
					style={style}
					effects={effects}
					pixelDensity={pixelDensity}
				/>
			</Sequence>
		);
	},
);

export const Solid = withInteractivitySchema({
	Component: SolidOuter,
	componentName: '<Solid>',
	componentIdentity: 'dev.remotion.remotion.Solid',
	schema: solidSchema,
	supportsEffects: true,
});

Solid.displayName = 'Solid';

addSequenceStackTraces(Solid);
