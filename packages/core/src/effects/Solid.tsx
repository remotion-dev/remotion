import React, {
	forwardRef,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';
import type {SequenceControls} from '../CompositionManager.js';
import {addSequenceStackTraces} from '../enable-sequence-stack-traces.js';
import {
	sequenceVisualStyleSchema,
	type SequenceSchema,
} from '../sequence-field-schema.js';
import type {SequenceProps} from '../Sequence.js';
import {Sequence} from '../Sequence.js';
import {useDelayRender} from '../use-delay-render.js';
import {wrapInSchema} from '../wrap-in-schema.js';
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
	readonly _experimentalEffects: EffectsProp;
	readonly className: string | undefined;
	readonly style: React.CSSProperties | undefined;
};

type InnerSolidProps = MandatoryProps &
	OptionalProps & {
		overrideId: string | null;
	};
export type SolidProps = MandatoryProps & Partial<OptionalProps>;

const solidSchema = {
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
	},
	height: {
		type: 'number',
		min: 1,
		step: 1,
		default: 1080,
		description: 'Height',
	},
	...sequenceVisualStyleSchema,
} as const satisfies SequenceSchema;

const SolidInner: React.FC<
	InnerSolidProps & {
		readonly overrideId: string | null;
		readonly ref?: React.Ref<HTMLCanvasElement>;
	}
> = ({
	color,
	width,
	height,
	_experimentalEffects: experimentalEffects = [],
	className,
	style,
	overrideId,
	ref,
}) => {
	const {delayRender, continueRender, cancelRender} = useDelayRender();

	const [outputCanvas, setOutputCanvas] = useState<HTMLCanvasElement | null>(
		null,
	);

	const memoizedEffects = useMemoizedEffects({
		effects: experimentalEffects,
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

			if (typeof ref === 'function') {
				ref(canvas);
			} else if (ref) {
				ref.current = canvas;
			}
		},
		[ref],
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
			state: chainState.get(width, height)!,
			source: sourceCanvas,
			effects: memoizedEffects,
			output: outputCanvas,
			width,
			height,
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
		width,
		height,
		delayRender,
		continueRender,
		cancelRender,
		memoizedEffects,
	]);

	return (
		<canvas
			ref={canvasRef}
			width={width}
			height={height}
			className={className}
			style={style}
		/>
	);
};

const SolidOuter = forwardRef<
	HTMLCanvasElement,
	SolidProps & {
		readonly _experimentalControls: SequenceControls | undefined;
	} & Pick<
			SequenceProps,
			'durationInFrames' | 'name' | 'from' | 'showInTimeline' | 'hidden'
		>
>(
	(
		{
			_experimentalEffects = [],
			_experimentalControls: controls,
			color,
			height,
			width,
			className,
			durationInFrames,
			style,
			name,
			from,
			hidden,
			showInTimeline,
			...props
		},
		ref,
	) => {
		props satisfies Record<string, never>;

		const memoizedEffectDefinitions =
			useMemoizedEffectDefinitions(_experimentalEffects);

		return (
			<Sequence
				layout="none"
				from={from}
				hidden={hidden}
				showInTimeline={showInTimeline}
				_experimentalControls={controls}
				_experimentalEffects={memoizedEffectDefinitions}
				durationInFrames={durationInFrames}
				name={name ?? '<Solid>'}
				// 'stack' is in props
				{...props}
			>
				<SolidInner
					ref={ref}
					overrideId={controls?.overrideId ?? null}
					color={color}
					height={height}
					width={width}
					className={className}
					style={style}
					_experimentalEffects={_experimentalEffects}
				/>
			</Sequence>
		);
	},
);

export const Solid = wrapInSchema(SolidOuter, solidSchema);

Solid.displayName = 'Solid';

addSequenceStackTraces(Solid);
