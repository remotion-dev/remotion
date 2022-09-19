import type {ForwardedRef} from 'react';
import {forwardRef, useEffect, useLayoutEffect, useRef} from 'react';
import {createCanvasSingleton} from './react-tools';

const calcArgs = (
	fit: 'fill' | 'contain' | 'cover',
	frameSize: {
		width: number;
		height: number;
	},
	canvasSize: {
		width: number;
		height: number;
	}
): [number, number, number, number, number, number, number, number] => {
	switch (fit) {
		case 'fill':
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

		case 'contain': {
			const ratio = Math.min(
				canvasSize.width / frameSize.width,
				canvasSize.height / frameSize.height
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
				canvasSize.height / frameSize.height
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

const combine =
	(
		...refs: (
			| React.MutableRefObject<unknown>
			| Function
			| ForwardedRef<unknown>
		)[]
	) =>
	(value: unknown) => {
		refs.forEach((ref) => {
			if (typeof ref === 'function') {
				ref(value);
			} else if (ref !== null && ref !== undefined) {
				ref.current = value;
			}
		});
	};

const useCanvasSingleton = createCanvasSingleton(() => {
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');

	canvas.width = 0;
	canvas.height = 0;

	return ctx;
});

export const Canvas = forwardRef(
	(
		{
			index,
			frames,
			width,
			height,
			fit,
			className,
			style,
		}: {
			index: number;
			frames: ImageData[];
			width: number;
			height: number;
			fit: 'fill' | 'contain' | 'cover';
			// eslint-disable-next-line react/require-default-props
			className?: string;
			// eslint-disable-next-line react/require-default-props
			style?: React.CSSProperties;
		},
		ref
	) => {
		const canvasRef = useRef<HTMLCanvasElement>();
		const ctx = useRef<CanvasRenderingContext2D | null>();
		const tempCtx = useCanvasSingleton();

		useLayoutEffect(() => {
			if (canvasRef.current) {
				ctx.current = canvasRef.current.getContext('2d');
			}
		}, [canvasRef]);

		useLayoutEffect(() => {
			if (canvasRef.current) {
				canvasRef.current.width = width;
				canvasRef.current.height = height;
			}
		}, [canvasRef, width, height]);

		useEffect(() => {
			const imageData = frames[index];
			if (imageData && tempCtx) {
				if (
					tempCtx.canvas.width < imageData.width ||
					tempCtx.canvas.height < imageData.height
				) {
					tempCtx.canvas.width = imageData.width;
					tempCtx.canvas.height = imageData.height;
				}

				if (width > 0 && height > 0) {
					ctx.current?.clearRect(0, 0, width, height);
					tempCtx.clearRect(0, 0, tempCtx.canvas.width, tempCtx.canvas.height);
				}

				tempCtx.putImageData(imageData, 0, 0);
				ctx.current?.drawImage(
					tempCtx.canvas,
					...calcArgs(fit, imageData, {width, height})
				);
			}
		}, [index, frames, width, height, fit, tempCtx]);

		return (
			<canvas
				ref={combine(canvasRef, ref)}
				className={className}
				style={style}
			/>
		);
	}
);
