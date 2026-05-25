import React, {useCallback, useImperativeHandle, useMemo, useRef} from 'react';
import {calculateImageFit} from '../calculate-image-fit.js';
import type {EffectDefinitionAndStack} from '../effects/effect-types.js';
import {runEffectChain} from '../effects/run-effect-chain.js';
import {useEffectChainState} from '../effects/use-effect-chain-state.js';
import type {AnimatedImageFillMode} from './props';

type Props = {
	readonly width?: number;

	readonly height?: number;
	readonly fit: AnimatedImageFillMode;

	readonly className?: string;

	readonly style?: React.CSSProperties;
	readonly effects: EffectDefinitionAndStack<unknown>[];
};

export type AnimatedImageCanvasRef = {
	readonly draw: (imageData: VideoFrame) => Promise<boolean>;
	readonly getCanvas: () => HTMLCanvasElement | null;
	clear: () => void;
};

const CanvasRefForwardingFunction: React.ForwardRefRenderFunction<
	AnimatedImageCanvasRef,
	Props
> = ({width, height, fit, className, style, effects}, ref) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const chainState = useEffectChainState();

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
			});
		},
		[chainState, effects, fit, height, sourceCanvas, width],
	);

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

				ctx.clearRect(
					0,
					0,
					canvasRef.current!.width,
					canvasRef.current!.height,
				);
			},
		};
	}, [draw]);

	return <canvas ref={canvasRef} className={className} style={style} />;
};

export const Canvas = React.forwardRef(CanvasRefForwardingFunction);
