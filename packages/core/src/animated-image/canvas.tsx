import React, {
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
} from 'react';
import {calculateImageFit} from '../calculate-image-fit.js';
import type {
	EffectDefinitionAndStack,
	EffectsOutputSize,
} from '../effects/effect-types.js';
import {runEffectChain} from '../effects/run-effect-chain.js';
import {useEffectChainState} from '../effects/use-effect-chain-state.js';
import type {AnimatedImageCanvasProps, AnimatedImageFillMode} from './props';

type Props = {
	readonly width?: number;

	readonly height?: number;
	readonly fit: AnimatedImageFillMode;

	readonly className?: string;

	readonly style?: React.CSSProperties;
	readonly effects: EffectDefinitionAndStack<unknown>[];
	readonly effectsOutputSize: EffectsOutputSize | null;
} & AnimatedImageCanvasProps;

export type AnimatedImageCanvasRef = {
	readonly draw: (imageData: VideoFrame) => Promise<boolean>;
	readonly getCanvas: () => HTMLCanvasElement | null;
	clear: () => void;
};

const CanvasRefForwardingFunction: React.ForwardRefRenderFunction<
	AnimatedImageCanvasRef,
	Props
> = (
	{width, height, fit, className, style, effects, effectsOutputSize, ...props},
	ref,
) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const chainState = useEffectChainState(effectsOutputSize);
	// Several composition frames can resolve to the same decoded image frame.
	// Remember what the output canvas currently shows so the effect chain is
	// not rerun while the decoded frame and all inputs are unchanged.
	const lastDrawRef = useRef<{
		canvas: HTMLCanvasElement;
		chainState: typeof chainState;
		imageData: VideoFrame;
		effects: EffectDefinitionAndStack<unknown>[];
		fit: AnimatedImageFillMode;
		canvasWidth: number;
		canvasHeight: number;
	} | null>(null);
	const drawCountRef = useRef(0);

	const sourceCanvas = useMemo(() => {
		if (typeof document === 'undefined') {
			return null;
		}

		return document.createElement('canvas');
	}, []);

	const draw = useCallback(
		(imageData: VideoFrame) => {
			const canvas = canvasRef.current;
			const canvasWidth = width ?? imageData.displayWidth;
			const canvasHeight = height ?? imageData.displayHeight;

			if (!canvas) {
				throw new Error('Canvas ref is not set');
			}

			if (!sourceCanvas) {
				throw new Error('Source canvas is not available');
			}

			const lastDraw = lastDrawRef.current;
			if (
				lastDraw &&
				lastDraw.canvas === canvas &&
				lastDraw.chainState === chainState &&
				lastDraw.imageData === imageData &&
				lastDraw.effects === effects &&
				lastDraw.fit === fit &&
				lastDraw.canvasWidth === canvasWidth &&
				lastDraw.canvasHeight === canvasHeight
			) {
				return Promise.resolve(true);
			}

			lastDrawRef.current = null;
			const drawId = ++drawCountRef.current;

			sourceCanvas.width = canvasWidth;
			sourceCanvas.height = canvasHeight;

			const sourceCtx = sourceCanvas.getContext('2d');
			if (!sourceCtx) {
				throw new Error('Could not get 2d context for source canvas');
			}

			sourceCtx.drawImage(
				imageData,
				...calculateImageFit(
					fit,
					{
						height: imageData.displayHeight,
						width: imageData.displayWidth,
					},
					{
						width: canvasWidth,
						height: canvasHeight,
					},
				),
			);

			canvas.width = canvasWidth;
			canvas.height = canvasHeight;

			return runEffectChain({
				state: chainState.get(canvasWidth, canvasHeight)!,
				source: sourceCanvas,
				effects,
				output: canvas,
				width: canvasWidth,
				height: canvasHeight,
			}).then((completed) => {
				// A later draw() may have started before this one settled.
				if (completed && drawCountRef.current === drawId) {
					lastDrawRef.current = {
						canvas,
						chainState,
						imageData,
						effects,
						fit,
						canvasWidth,
						canvasHeight,
					};
				}

				return completed;
			});
		},
		[chainState, effects, fit, height, sourceCanvas, width],
	);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}

		// The browser restores a lost 2D context with a blank bitmap. A draw
		// that is still in flight must not record its result either.
		const invalidate = () => {
			lastDrawRef.current = null;
			drawCountRef.current++;
		};

		canvas.addEventListener('contextrestored', invalidate);
		return () => {
			canvas.removeEventListener('contextrestored', invalidate);
		};
	}, []);

	useImperativeHandle(ref, () => {
		return {
			draw,
			getCanvas: () => {
				if (!canvasRef.current) {
					throw new Error('Canvas ref is not set');
				}

				return canvasRef.current;
			},
			clear: () => {
				const ctx = canvasRef.current?.getContext('2d');
				if (!ctx) {
					throw new Error('Could not get 2d context');
				}

				lastDrawRef.current = null;
				drawCountRef.current++;
				ctx.clearRect(
					0,
					0,
					canvasRef.current!.width,
					canvasRef.current!.height,
				);
			},
		};
	}, [draw]);

	return (
		<canvas ref={canvasRef} className={className} style={style} {...props} />
	);
};

export const Canvas = React.forwardRef(CanvasRefForwardingFunction);
