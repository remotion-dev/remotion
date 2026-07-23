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
import type {
	EffectsProp,
	InteractiveBaseProps,
	SequenceControls,
	InteractivitySchema,
} from 'remotion';
import {
	Internals,
	Interactive,
	Sequence,
	useCurrentFrame,
	useDelayRender,
	useVideoConfig,
} from 'remotion';
import type {
	RemotionRiveCanvasAlignment,
	RemotionRiveCanvasFit,
} from './map-enums.js';
import {mapToAlignment, mapToFit} from './map-enums.js';

const {
	runEffectChain,
	useEffectChainState,
	useMemoizedEffectDefinitions,
	useMemoizedEffects,
} = Internals;

type assetLoadCallback = (asset: FileAsset, bytes: Uint8Array) => boolean;
type onLoadCallback = (file: File) => void;

type RemotionRiveCanvasOwnProps = {
	readonly src: string;
	readonly fit?: RemotionRiveCanvasFit;
	readonly alignment?: RemotionRiveCanvasAlignment;
	readonly artboard?: string | number;
	readonly animation?: string | number;
	readonly onLoad?: onLoadCallback | null;
	readonly enableRiveAssetCdn?: boolean;
	readonly assetLoader?: assetLoadCallback;
	readonly className?: string;
	readonly style?: React.CSSProperties;
	readonly effects?: EffectsProp;
};

export type RemotionRiveCanvasProps = RemotionRiveCanvasOwnProps &
	InteractiveBaseProps;

export type RiveCanvasRef = {
	getAnimationInstance: () => LinearAnimationInstance | null;
	getArtboard: () => Artboard | null;
	getRenderer: () => CanvasRenderer | null;
	getCanvas: () => RiveCanvas | null;
};

const riveFitVariants: Record<RemotionRiveCanvasFit, InteractivitySchema> = {
	contain: {},
	cover: {},
	fill: {},
	'fit-height': {},
	'fit-width': {},
	none: {},
	'scale-down': {},
};

const riveAlignmentVariants: Record<
	RemotionRiveCanvasAlignment,
	InteractivitySchema
> = {
	center: {},
	'bottom-center': {},
	'bottom-left': {},
	'bottom-right': {},
	'center-left': {},
	'center-right': {},
	'top-center': {},
	'top-left': {},
	'top-right': {},
};

const riveCanvasSchema = {
	...Internals.baseSchema,
	fit: {
		type: 'enum',
		default: 'contain',
		description: 'Fit',
		variants: riveFitVariants,
	},
	alignment: {
		type: 'enum',
		default: 'center',
		description: 'Alignment',
		variants: riveAlignmentVariants,
	},
	...Internals.transformSchema,
	...Interactive.borderSchema,
} as const satisfies InteractivitySchema;

type RemotionRiveCanvasContentProps = Omit<
	RemotionRiveCanvasOwnProps,
	'effects'
> & {
	readonly fit: RemotionRiveCanvasFit;
	readonly alignment: RemotionRiveCanvasAlignment;
	readonly enableRiveAssetCdn: boolean;
	readonly effects: EffectsProp;
	readonly controls: SequenceControls | undefined;
};

const RemotionRiveCanvasContentForwardRefFunction: React.ForwardRefRenderFunction<
	RiveCanvasRef,
	RemotionRiveCanvasContentProps
> = (
	{
		src,
		fit,
		alignment,
		artboard: artboardName,
		animation: animationIndex,
		onLoad = null,
		assetLoader,
		enableRiveAssetCdn,
		className,
		style,
		effects,
		controls,
	},
	ref,
) => {
	const {width, fps, height} = useVideoConfig();
	const frame = useCurrentFrame();
	const canvas = useRef<HTMLCanvasElement>(null);
	const [riveCanvasInstance, setRiveCanvas] = useState<RiveCanvas | null>(null);
	const [err, setError] = useState<Error | null>(null);
	const {delayRender, continueRender} = useDelayRender();
	const [handle] = useState(() => delayRender());
	const lastFrame = useRef<number>(0);

	// Rive draws to this offscreen-style canvas; the effect chain then
	// composites from here onto the visible output canvas.
	const sourceCanvas = useMemo(() => {
		if (typeof document === 'undefined') {
			return null;
		}

		return document.createElement('canvas');
	}, []);

	const chainState = useEffectChainState();

	const memoizedEffects = useMemoizedEffects({
		effects,
		overrideId: controls?.overrideId ?? null,
	});

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
				'https://unpkg.com/@rive-app/canvas-advanced@2.31.5/rive.wasm',
		})
			.then((riveInstance) => {
				setRiveCanvas(riveInstance);
				continueRender(handle);
			})
			.catch((newErr) => {
				setError(newErr);
			});
	}, [handle, continueRender]);

	useEffect(() => {
		if (!riveCanvasInstance || !sourceCanvas) {
			return;
		}

		sourceCanvas.width = width;
		sourceCanvas.height = height;

		const renderer = riveCanvasInstance.makeRenderer(sourceCanvas);

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
		sourceCanvas,
		width,
		height,
	]);

	useEffect(() => {
		if (onLoad && rive) {
			onLoad(rive.file);
		}
	}, [onLoad, rive]);

	React.useEffect(() => {
		if (!riveCanvasInstance || !rive) {
			return;
		}

		const outputCanvas = canvas.current;
		if (!outputCanvas || !sourceCanvas) {
			return;
		}

		// Keep source/output dimensions in sync with the video config.
		if (sourceCanvas.width !== width || sourceCanvas.height !== height) {
			sourceCanvas.width = width;
			sourceCanvas.height = height;
		}

		if (outputCanvas.width !== width || outputCanvas.height !== height) {
			outputCanvas.width = width;
			outputCanvas.height = height;
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
				maxX: sourceCanvas.width,
				maxY: sourceCanvas.height,
			},
			rive.artboard.bounds,
		);

		rive.artboard.draw(rive.renderer);
		rive.renderer.restore();

		// Flush the renderer's queued draw calls so `sourceCanvas` actually
		// contains the pixels we just drew before `runEffectChain` reads from
		// it. We don't use `riveCanvasInstance.requestAnimationFrame` (which
		// would flush implicitly at the end of its own callback) because the
		// effect chain needs the flushed pixels synchronously, and waiting
		// for a Rive-scheduled frame would mean the very first paint after
		// mount (and after every prop change) would composite an empty /
		// stale source canvas to the output.
		riveCanvasInstance.resolveAnimationFrame();

		lastFrame.current = frame;

		const state = chainState.get(width, height);
		if (!state) {
			return;
		}

		const effectChainHandle = delayRender(
			`Rendering frame at ${frame} of <RemotionRiveCanvas src="${src}"/>`,
		);

		let cancelled = false;

		runEffectChain({
			state,
			source: sourceCanvas,
			effects: memoizedEffects,
			output: outputCanvas,
			width,
			height,
		})
			.then(() => {
				if (!cancelled) {
					continueRender(effectChainHandle);
				}
			})
			.catch((newErr) => {
				setError(newErr);
			});

		return () => {
			cancelled = true;
			continueRender(effectChainHandle);
		};
	}, [
		frame,
		fps,
		rive,
		riveCanvasInstance,
		fit,
		alignment,
		width,
		height,
		sourceCanvas,
		memoizedEffects,
		chainState,
		delayRender,
		continueRender,
		src,
	]);

	const canvasStyle: React.CSSProperties = useMemo(
		() => ({
			height,
			width,
			...style,
		}),
		[height, style, width],
	);

	return (
		<canvas
			ref={canvas}
			width={width}
			height={height}
			className={className}
			style={canvasStyle}
		/>
	);
};

const RemotionRiveCanvasContent = forwardRef(
	RemotionRiveCanvasContentForwardRefFunction,
);

const RemotionRiveCanvasInnerForwardRefFunction: React.ForwardRefRenderFunction<
	RiveCanvasRef,
	RemotionRiveCanvasProps & {
		readonly controls?: SequenceControls | undefined;
	}
> = (
	{
		src,
		fit = 'contain',
		alignment = 'center',
		artboard,
		animation,
		onLoad = null,
		assetLoader,
		enableRiveAssetCdn = true,
		className,
		style,
		effects = [],
		controls,
		durationInFrames,
		name,
		from,
		trimBefore,
		freeze,
		showInTimeline,
		hidden,
		...props
	},
	ref,
) => {
	props satisfies Record<string, never>;

	const memoizedEffectDefinitions = useMemoizedEffectDefinitions(effects);

	return (
		<Sequence
			layout="none"
			from={from}
			trimBefore={trimBefore}
			freeze={freeze}
			hidden={hidden}
			showInTimeline={showInTimeline}
			name={name ?? '<RemotionRiveCanvas>'}
			_remotionInternalDocumentationLink={
				name === undefined
					? 'https://www.remotion.dev/docs/rive/remotionrivecanvas'
					: undefined
			}
			durationInFrames={durationInFrames}
			controls={controls}
			_remotionInternalEffects={memoizedEffectDefinitions}
			// 'stack' is in props
			{...props}
		>
			<RemotionRiveCanvasContent
				ref={ref}
				src={src}
				fit={fit}
				alignment={alignment}
				artboard={artboard}
				animation={animation}
				onLoad={onLoad}
				assetLoader={assetLoader}
				enableRiveAssetCdn={enableRiveAssetCdn}
				className={className}
				style={style}
				effects={effects}
				controls={controls}
			/>
		</Sequence>
	);
};

const RemotionRiveCanvasInner = forwardRef(
	RemotionRiveCanvasInnerForwardRefFunction,
);

export const RemotionRiveCanvas = Interactive.withSchema({
	Component: RemotionRiveCanvasInner as unknown as React.ComponentType<
		RemotionRiveCanvasProps & {
			readonly controls: SequenceControls | undefined;
		}
	>,
	componentName: '<RemotionRiveCanvas>',
	componentIdentity: 'dev.remotion.rive.RemotionRiveCanvas',
	schema: riveCanvasSchema,
	supportsEffects: true,
}) as React.ForwardRefExoticComponent<
	RemotionRiveCanvasProps & React.RefAttributes<RiveCanvasRef>
>;

(RemotionRiveCanvas as unknown as {displayName: string}).displayName =
	'RemotionRiveCanvas';
