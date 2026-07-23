/* eslint-disable react/require-default-props */
import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
	type RefObject,
} from 'react';
import type {EffectDefinitionAndStack} from 'remotion';
import {Internals, useDelayRender} from 'remotion';
import type {GifFillMode} from './props';
import {useElementSize} from './use-element-size';

const {runEffectChain, useEffectChainState} = Internals;

const calcArgs = (
	fit: GifFillMode,
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

const makeCanvas = () => {
	if (typeof document === 'undefined') {
		return null;
	}

	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');

	canvas.width = 0;
	canvas.height = 0;

	return ctx;
};

type Props = {
	readonly index: number;
	readonly frames: ImageData[];
	readonly width?: number;
	readonly height?: number;
	readonly fit: GifFillMode;
	readonly className?: string;
	readonly style?: React.CSSProperties;
	readonly effects: EffectDefinitionAndStack<unknown>[];
	readonly refForOutline?: RefObject<HTMLElement | null>;
};

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
			effects,
			refForOutline,
		}: Props,
		ref,
	) => {
		const canvasRef = useRef<HTMLCanvasElement>(null);
		const [tempCtx] = useState(() => {
			return makeCanvas();
		});

		const sourceCanvas = useMemo(() => {
			if (typeof document === 'undefined') {
				return null;
			}

			return document.createElement('canvas');
		}, []);

		const effectOutputCanvas = useMemo(() => {
			if (typeof document === 'undefined') {
				return null;
			}

			return document.createElement('canvas');
		}, []);

		const chainState = useEffectChainState();
		const {delayRender, continueRender, cancelRender} = useDelayRender();

		const size = useElementSize(canvasRef);

		useImperativeHandle(ref, () => {
			return canvasRef.current as HTMLCanvasElement;
		}, []);
		const canvasCallbackRef = useCallback(
			(canvas: HTMLCanvasElement | null) => {
				canvasRef.current = canvas;
				if (refForOutline) {
					refForOutline.current = canvas;
				}
			},
			[refForOutline],
		);

		useEffect(() => {
			if (!size) {
				return;
			}

			const imageData = frames[index];
			const outputCanvas = canvasRef.current;
			const outputCtx = outputCanvas?.getContext('2d');
			if (!imageData || !tempCtx || !outputCtx || !outputCanvas) {
				return;
			}

			if (
				tempCtx.canvas.width < imageData.width ||
				tempCtx.canvas.height < imageData.height
			) {
				tempCtx.canvas.width = imageData.width;
				tempCtx.canvas.height = imageData.height;
			}

			const layoutWidth = width ?? size.width;
			const layoutHeight = height ?? size.height;

			if (layoutWidth <= 0 || layoutHeight <= 0) {
				return;
			}

			if (size.width > 0 && size.height > 0) {
				outputCtx.clearRect(0, 0, size.width, size.height);
				tempCtx.clearRect(0, 0, tempCtx.canvas.width, tempCtx.canvas.height);
			}

			tempCtx.putImageData(imageData, 0, 0);

			const frameSize = {
				width: imageData.width,
				height: imageData.height,
			};
			const layoutSize = {
				width: layoutWidth,
				height: layoutHeight,
			};

			if (effects.length === 0) {
				outputCtx.drawImage(
					tempCtx.canvas,
					...calcArgs(fit, frameSize, layoutSize),
				);
				return;
			}

			if (!sourceCanvas || !effectOutputCanvas) {
				return;
			}

			// Effects run at the GIF's intrinsic pixel dimensions; fit is applied
			// when compositing onto the layout-sized output canvas.
			if (
				sourceCanvas.width !== frameSize.width ||
				sourceCanvas.height !== frameSize.height
			) {
				sourceCanvas.width = frameSize.width;
				sourceCanvas.height = frameSize.height;
			}

			if (
				effectOutputCanvas.width !== frameSize.width ||
				effectOutputCanvas.height !== frameSize.height
			) {
				effectOutputCanvas.width = frameSize.width;
				effectOutputCanvas.height = frameSize.height;
			}

			const sourceCtx = sourceCanvas.getContext('2d');
			if (!sourceCtx) {
				return;
			}

			sourceCtx.clearRect(0, 0, frameSize.width, frameSize.height);
			sourceCtx.putImageData(imageData, 0, 0);

			const state = chainState.get(frameSize.width, frameSize.height);
			if (!state) {
				return;
			}

			if (
				outputCanvas.width !== layoutWidth ||
				outputCanvas.height !== layoutHeight
			) {
				outputCanvas.width = layoutWidth;
				outputCanvas.height = layoutHeight;
			}

			const effectChainHandle = delayRender('Rendering <Gif/> effect chain');

			let cancelled = false;

			runEffectChain({
				state,
				source: sourceCanvas,
				effects,
				output: effectOutputCanvas,
				width: frameSize.width,
				height: frameSize.height,
			})
				.then((completed: boolean) => {
					if (cancelled || !completed) {
						return;
					}

					outputCtx.clearRect(0, 0, layoutWidth, layoutHeight);
					outputCtx.drawImage(
						effectOutputCanvas,
						...calcArgs(fit, frameSize, layoutSize),
					);
					continueRender(effectChainHandle);
				})
				.catch((err: unknown) => {
					cancelRender(err);
				});

			return () => {
				cancelled = true;
				continueRender(effectChainHandle);
			};
		}, [
			index,
			frames,
			fit,
			tempCtx,
			size,
			width,
			height,
			effects,
			sourceCanvas,
			effectOutputCanvas,
			chainState,
			delayRender,
			continueRender,
			cancelRender,
		]);

		return (
			<canvas
				ref={canvasCallbackRef}
				className={className}
				style={style}
				width={width ?? size?.width}
				height={height ?? size?.height}
			/>
		);
	},
);
