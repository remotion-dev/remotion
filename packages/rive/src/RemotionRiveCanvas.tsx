import type {
	Artboard,
	CanvasRenderer,
	File,
	FileAsset,
	LinearAnimationInstance,
	RiveCanvas,
} from '@rive-app/canvas-advanced';
import riveCanvas from '@rive-app/canvas-advanced';
import React, {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	continueRender,
	delayRender,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import type {
	RemotionRiveCanvasAlignment,
	RemotionRiveCanvasFit,
} from './map-enums.js';
import {mapToAlignment, mapToFit} from './map-enums.js';

type assetLoadCallback = (asset: FileAsset, bytes: Uint8Array) => boolean;
type onLoadCallback = (file: File) => void;

interface RiveProps {
	readonly src: string;
	readonly fit?: RemotionRiveCanvasFit;
	readonly alignment?: RemotionRiveCanvasAlignment;
	readonly artboard?: string | number;
	readonly animation?: string | number;
	readonly onLoad?: onLoadCallback | null;
	readonly enableRiveAssetCdn?: boolean;
	readonly assetLoader?: assetLoadCallback;
}

export type RiveCanvasRef = {
	getAnimationInstance: () => LinearAnimationInstance | null;
	getArtboard: () => Artboard | null;
	getRenderer: () => CanvasRenderer | null;
	getCanvas: () => RiveCanvas | null;
};

const RemotionRiveCanvasForwardRefFunction: React.ForwardRefRenderFunction<
	RiveCanvasRef,
	RiveProps
> = (
	{
		src,
		fit = 'contain',
		alignment = 'center',
		artboard: artboardName,
		animation: animationIndex,
		onLoad = null,
		assetLoader,
		enableRiveAssetCdn = true,
	},
	ref,
) => {
	const {width, fps, height} = useVideoConfig();
	const frame = useCurrentFrame();
	const canvas = useRef<HTMLCanvasElement>(null);
	const [riveCanvasInstance, setRiveCanvas] = useState<RiveCanvas | null>(null);
	const [err, setError] = useState<Error | null>(null);
	const [handle] = useState(() => delayRender());
	const lastFrame = useRef<number>(0);

	if (err) {
		throw err;
	}

	const [rive, setRive] = useState<{
		animation: LinearAnimationInstance;
		renderer: CanvasRenderer;
		artboard: Artboard;
		file: File;
	} | null>(null);

	useImperativeHandle(ref, () => {
		return {
			getAnimationInstance() {
				return rive?.animation ?? null;
			},
			getArtboard() {
				return rive?.artboard ?? null;
			},
			getRenderer() {
				return rive?.renderer ?? null;
			},
			getCanvas() {
				return riveCanvasInstance ?? null;
			},
		};
	}, [rive, riveCanvasInstance]);

	useEffect(() => {
		riveCanvas({
			locateFile: () =>
				'https://unpkg.com/@rive-app/canvas-advanced@2.19.3/rive.wasm',
		})
			.then((riveInstance) => {
				setRiveCanvas(riveInstance);
				continueRender(handle);
			})
			.catch((newErr) => {
				setError(newErr);
			});
	}, [handle]);

	useEffect(() => {
		if (!riveCanvasInstance) {
			return;
		}

		const renderer = riveCanvasInstance.makeRenderer(
			canvas.current as HTMLCanvasElement,
		);

		fetch(new Request(src))
			.then((f) => f.arrayBuffer())
			.then((b) => {
				riveCanvasInstance
					.load(
						new Uint8Array(b),
						assetLoader
							? new riveCanvasInstance.CustomFileAssetLoader({
									loadContents: assetLoader,
								})
							: undefined,
						enableRiveAssetCdn,
					)
					.then((file) => {
						const artboard =
							typeof artboardName === 'string'
								? file.artboardByName(artboardName)
								: typeof artboardName === 'number'
									? file.artboardByIndex(artboardName)
									: file.defaultArtboard();
						const animation = new riveCanvasInstance.LinearAnimationInstance(
							typeof animationIndex === 'number'
								? artboard.animationByIndex(animationIndex)
								: typeof animationIndex === 'string'
									? artboard.animationByName(animationIndex)
									: artboard.animationByIndex(0),
							artboard,
						);
						setRive({
							animation,
							artboard,
							renderer,
							file,
						});
					});
			})
			.catch((newErr) => {
				setError(newErr);
			});
	}, [
		animationIndex,
		artboardName,
		riveCanvasInstance,
		src,
		onLoad,
		assetLoader,
		enableRiveAssetCdn,
	]);

	useEffect(() => {
		if (onLoad && rive) {
			onLoad(rive.file);
		}
	}, [onLoad, rive]);

	React.useEffect(() => {
		if (!riveCanvasInstance) {
			return;
		}

		riveCanvasInstance.requestAnimationFrame(() => {
			if (!rive || !canvas.current) {
				return;
			}

			const diff = frame - lastFrame.current;

			rive.renderer.clear();

			if (rive.animation) {
				rive.animation.advance(diff / fps);
				rive.animation.apply(1);
			}

			rive.artboard.advance(diff / fps);

			rive.renderer.save();
			rive.renderer.align(
				mapToFit(fit, riveCanvasInstance),
				mapToAlignment(alignment, riveCanvasInstance.Alignment),
				{
					minX: 0,
					minY: 0,
					maxX: canvas.current.width,
					maxY: canvas.current.height,
				},
				rive.artboard.bounds,
			);

			rive.artboard.draw(rive.renderer);
			rive.renderer.restore();

			lastFrame.current = frame;
		});
	}, [frame, fps, rive, riveCanvasInstance, fit, alignment]);

	const style: React.CSSProperties = useMemo(
		() => ({
			height,
			width,
		}),
		[height, width],
	);

	return <canvas ref={canvas} width={width} height={height} style={style} />;
};

export const RemotionRiveCanvas = forwardRef(
	RemotionRiveCanvasForwardRefFunction,
);
