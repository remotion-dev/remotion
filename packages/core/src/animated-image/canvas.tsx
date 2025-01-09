import React, {useCallback, useImperativeHandle, useRef} from 'react';
import type {AnimatedImageFillMode} from './props';

const calcArgs = (
	fit: AnimatedImageFillMode,
	frameSize: {
		width: number;
		height: number;
	},
	canvasSize: {
		width: number;
		height: number;
	},
): [number, number, number, number, number, number, number, number] => {
	switch (fit) {
		case 'fill': {
			return [
				0,
				0,
				frameSize.width,
				frameSize.height,
				0,
				0,
				canvasSize.width,
				canvasSize.height,
			];
		}

		case 'contain': {
			const ratio = Math.min(
				canvasSize.width / frameSize.width,
				canvasSize.height / frameSize.height,
			);

			const centerX = (canvasSize.width - frameSize.width * ratio) / 2;
			const centerY = (canvasSize.height - frameSize.height * ratio) / 2;

			return [
				0,
				0,
				frameSize.width,
				frameSize.height,
				centerX,
				centerY,
				frameSize.width * ratio,
				frameSize.height * ratio,
			];
		}

		case 'cover': {
			const ratio = Math.max(
				canvasSize.width / frameSize.width,
				canvasSize.height / frameSize.height,
			);
			const centerX = (canvasSize.width - frameSize.width * ratio) / 2;
			const centerY = (canvasSize.height - frameSize.height * ratio) / 2;

			return [
				0,
				0,
				frameSize.width,
				frameSize.height,
				centerX,
				centerY,
				frameSize.width * ratio,
				frameSize.height * ratio,
			];
		}

		default:
			throw new Error('Unknown fit: ' + fit);
	}
};

type Props = {
	readonly width?: number;

	readonly height?: number;
	readonly fit: AnimatedImageFillMode;

	readonly className?: string;

	readonly style?: React.CSSProperties;
};

export type AnimatedImageCanvasRef = {
	readonly draw: (imageData: VideoFrame) => void;
	readonly getCanvas: () => HTMLCanvasElement | null;
	clear: () => void;
};

const CanvasRefForwardingFunction: React.ForwardRefRenderFunction<
	AnimatedImageCanvasRef,
	Props
> = ({width, height, fit, className, style}, ref) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const draw = useCallback(
		(imageData: VideoFrame) => {
			const canvas = canvasRef.current;
			const canvasWidth = width ?? imageData.displayWidth;
			const canvasHeight = height ?? imageData.displayHeight;

			if (!canvas) {
				throw new Error('Canvas ref is not set');
			}

			const ctx = canvasRef.current?.getContext('2d');
			if (!ctx) {
				throw new Error('Could not get 2d context');
			}

			canvas.width = canvasWidth;
			canvas.height = canvasHeight;

			ctx.drawImage(
				imageData,
				...calcArgs(
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
		},
		[fit, height, width],
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
