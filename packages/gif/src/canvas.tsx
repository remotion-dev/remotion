import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from 'react';

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

const makeCanvas = () => {
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');

	canvas.width = 0;
	canvas.height = 0;

	return ctx;
};

type Props = {
	index: number;
	frames: ImageData[];
	width: number;
	height: number;
	fit: 'fill' | 'contain' | 'cover';
	className?: string;
	style?: React.CSSProperties;
};

export const Canvas = forwardRef(
	({index, frames, width, height, fit, className, style}: Props, ref) => {
		const canvasRef = useRef<HTMLCanvasElement>(null);
		const [tempCtx] = useState(() => {
			return makeCanvas();
		});

		useImperativeHandle(ref, () => {
			return canvasRef.current as HTMLCanvasElement;
		});

		useEffect(() => {
			const imageData = frames[index];
			const ctx = canvasRef.current?.getContext('2d');
			if (imageData && tempCtx && ctx) {
				if (
					tempCtx.canvas.width < imageData.width ||
					tempCtx.canvas.height < imageData.height
				) {
					tempCtx.canvas.width = imageData.width;
					tempCtx.canvas.height = imageData.height;
				}

				if (width > 0 && height > 0) {
					ctx.clearRect(0, 0, width, height);
					tempCtx.clearRect(0, 0, tempCtx.canvas.width, tempCtx.canvas.height);
				}

				tempCtx.putImageData(imageData, 0, 0);
				ctx.drawImage(
					tempCtx.canvas,
					...calcArgs(fit, imageData, {width, height})
				);
			}
		}, [index, frames, width, height, fit, tempCtx]);

		return (
			<canvas
				ref={canvasRef}
				className={className}
				style={style}
				width={width}
				height={height}
			/>
		);
	}
);
