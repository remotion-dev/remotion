import React, {
	forwardRef,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';
import {calculateImageFit} from '../calculate-image-fit.js';
import type {SequenceControls} from '../CompositionManager.js';
import type {EffectsProp} from '../effects/effect-types.js';
import {runEffectChain} from '../effects/run-effect-chain.js';
import {useEffectChainState} from '../effects/use-effect-chain-state.js';
import {
	useMemoizedEffectDefinitions,
	useMemoizedEffects,
} from '../effects/use-memoized-effects.js';
import {addSequenceStackTraces} from '../enable-sequence-stack-traces.js';
import {truncateSrcForLabel} from '../Img.js';
import {usePreload} from '../prefetch.js';
import {
	hiddenField,
	sequenceVisualStyleSchema,
	type SequenceSchema,
} from '../sequence-field-schema.js';
import {Sequence} from '../Sequence.js';
import {useDelayRender} from '../use-delay-render.js';
import {wrapInSchema} from '../wrap-in-schema.js';
import type {CanvasImageProps} from './props.js';

const canvasImageSchema = {
	width: {
		type: 'number',
		min: 1,
		step: 1,
		default: undefined,
		description: 'Width',
	},
	height: {
		type: 'number',
		min: 1,
		step: 1,
		default: undefined,
		description: 'Height',
	},
	fit: {
		type: 'enum',
		default: 'fill',
		description: 'Fit',
		variants: {
			fill: {},
			contain: {},
			cover: {},
		},
	},
	...sequenceVisualStyleSchema,
	hidden: hiddenField,
} as const satisfies SequenceSchema;

type LoadedImage = {
	readonly element: HTMLImageElement;
	readonly width: number;
	readonly height: number;
};

const makeAbortError = () => {
	if (typeof DOMException !== 'undefined') {
		return new DOMException('Image loading was aborted', 'AbortError');
	}

	const error = new Error('Image loading was aborted');
	error.name = 'AbortError';
	return error;
};

const loadImage = ({
	src,
	signal,
}: {
	readonly src: string;
	readonly signal: AbortSignal;
}): Promise<LoadedImage> => {
	return new Promise((resolve, reject) => {
		const image = new Image();
		let settled = false;

		const cleanup = () => {
			image.onload = null;
			image.onerror = null;
			signal.removeEventListener('abort', onAbort);
		};

		const settle = (callback: () => void) => {
			if (settled) {
				return;
			}

			settled = true;
			cleanup();
			callback();
		};

		const onAbort = () => {
			settle(() => reject(makeAbortError()));
		};

		image.onload = () => {
			Promise.resolve(image.decode?.())
				.catch(() => undefined)
				.then(() => {
					const imageWidth = image.naturalWidth || image.width;
					const imageHeight = image.naturalHeight || image.height;
					if (imageWidth <= 0 || imageHeight <= 0) {
						settle(() =>
							reject(
								new Error(
									`Could not determine dimensions for <CanvasImage> with src="${truncateSrcForLabel(
										src,
									)}"`,
								),
							),
						);
						return;
					}

					settle(() =>
						resolve({element: image, width: imageWidth, height: imageHeight}),
					);
				});
		};

		image.onerror = () => {
			settle(() =>
				reject(
					new Error(
						`Could not load <CanvasImage> with src="${truncateSrcForLabel(src)}"`,
					),
				),
			);
		};

		signal.addEventListener('abort', onAbort, {once: true});
		if (signal.aborted) {
			onAbort();
			return;
		}

		image.crossOrigin = 'anonymous';
		image.src = src;
	});
};

type CanvasImageContentProps = Pick<
	CanvasImageProps,
	'className' | 'fit' | 'height' | 'id' | 'onError' | 'src' | 'style' | 'width'
> & {
	readonly effects: EffectsProp;
	readonly controls: SequenceControls | undefined;
};

const CanvasImageContent = forwardRef<
	HTMLCanvasElement,
	CanvasImageContentProps
>(
	(
		{
			src,
			width,
			height,
			fit = 'fill',
			effects,
			controls,
			onError,
			className,
			style,
			id,
		},
		ref,
	) => {
		const {delayRender, continueRender, cancelRender} = useDelayRender();
		const [outputCanvas, setOutputCanvas] = useState<HTMLCanvasElement | null>(
			null,
		);
		const actualSrc = usePreload(src);
		const chainState = useEffectChainState();
		const memoizedEffects = useMemoizedEffects({
			effects,
			overrideId: controls?.overrideId ?? null,
		});

		const sourceCanvas = useMemo(() => {
			if (typeof document === 'undefined') {
				return null;
			}

			return document.createElement('canvas');
		}, []);

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

		useEffect(() => {
			if (!outputCanvas || !sourceCanvas) {
				return;
			}

			const handle = delayRender(
				`Rendering <CanvasImage> with src="${truncateSrcForLabel(actualSrc)}"`,
			);
			const controller = new AbortController();
			let cancelled = false;
			let continued = false;
			const continueRenderOnce = () => {
				if (continued) {
					return;
				}

				continued = true;
				continueRender(handle);
			};

			loadImage({src: actualSrc, signal: controller.signal})
				.then(async (image) => {
					if (cancelled) {
						return;
					}

					const canvasWidth = width ?? image.width;
					const canvasHeight = height ?? image.height;
					const sourceContext = sourceCanvas.getContext('2d', {
						colorSpace: 'srgb',
					});

					if (!sourceContext) {
						throw new Error(
							'Could not get 2D context for <CanvasImage> source canvas',
						);
					}

					sourceCanvas.width = canvasWidth;
					sourceCanvas.height = canvasHeight;
					outputCanvas.width = canvasWidth;
					outputCanvas.height = canvasHeight;

					sourceContext.clearRect(0, 0, canvasWidth, canvasHeight);
					sourceContext.drawImage(
						image.element,
						...calculateImageFit(
							fit,
							{width: image.width, height: image.height},
							{width: canvasWidth, height: canvasHeight},
						),
					);

					return runEffectChain({
						state: chainState.get(canvasWidth, canvasHeight)!,
						source: sourceCanvas,
						effects: memoizedEffects,
						output: outputCanvas,
						width: canvasWidth,
						height: canvasHeight,
					});
				})
				.then((completed) => {
					if (completed && !cancelled) {
						continueRenderOnce();
					}
				})
				.catch((err) => {
					if ((err as Error).name === 'AbortError') {
						continueRenderOnce();
						return;
					}

					if (onError) {
						onError(err as Error);
						continueRenderOnce();
					} else {
						cancelRender(err);
					}
				});

			return () => {
				cancelled = true;
				controller.abort();
				continueRenderOnce();
			};
		}, [
			actualSrc,
			cancelRender,
			chainState,
			continueRender,
			delayRender,
			fit,
			height,
			memoizedEffects,
			onError,
			outputCanvas,
			sourceCanvas,
			width,
		]);

		return (
			<canvas
				ref={canvasRef}
				width={width}
				height={height}
				className={className}
				style={style}
				id={id}
			/>
		);
	},
);

CanvasImageContent.displayName = 'CanvasImageContent';

const CanvasImageInner = forwardRef<
	HTMLCanvasElement,
	CanvasImageProps & {
		readonly _experimentalControls?: SequenceControls | undefined;
	}
>(
	(
		{
			src,
			width,
			height,
			fit,
			effects = [],
			className,
			style,
			id,
			onError,
			durationInFrames,
			from,
			hidden,
			name,
			showInTimeline,
			stack,
			_experimentalControls: controls,
		},
		ref,
	) => {
		if (!src) {
			throw new Error('No "src" prop was passed to <CanvasImage>.');
		}

		const memoizedEffectDefinitions = useMemoizedEffectDefinitions(effects);

		return (
			<Sequence
				layout="none"
				from={from ?? 0}
				durationInFrames={durationInFrames ?? Infinity}
				hidden={hidden}
				showInTimeline={showInTimeline ?? true}
				name={name ?? '<CanvasImage>'}
				_experimentalControls={controls}
				_remotionInternalEffects={memoizedEffectDefinitions}
				_remotionInternalIsMedia={{type: 'image', src}}
				_remotionInternalStack={stack}
			>
				<CanvasImageContent
					ref={ref}
					src={src}
					width={width}
					height={height}
					fit={fit}
					effects={effects}
					controls={controls}
					className={className}
					style={style}
					id={id}
					onError={onError}
				/>
			</Sequence>
		);
	},
);

/*
 * @description Renders a static image to a `<canvas>` and applies Remotion effects.
 * @see [Documentation](https://www.remotion.dev/docs/canvasimage)
 */
export const CanvasImage = wrapInSchema(CanvasImageInner, canvasImageSchema);

CanvasImage.displayName = 'CanvasImage';

addSequenceStackTraces(CanvasImage);
