import type {StandardLonghandProperties} from 'csstype';
import React, {
	forwardRef,
	Suspense,
	useCallback,
	useImperativeHandle,
	useMemo,
	useRef,
} from 'react';
import {Internals} from 'remotion';
import {calculateCanvasTransformation} from './calculate-scale';
import {ErrorBoundary} from './error-boundary';
import {PLAYER_CSS_CLASSNAME} from './player-css-classname';
import type {ThumbnailMethods} from './player-methods';
import type {ErrorFallback, RenderLoading} from './PlayerUI';
import {useThumbnail} from './use-thumbnail';
import {calculatePlayerSize} from './utils/calculate-player-size';
import {IS_NODE} from './utils/is-node';
import {useElementSize} from './utils/use-element-size';

const reactVersion = React.version.split('.')[0];
if (reactVersion === '0') {
	throw new Error(
		`Version ${reactVersion} of "react" is not supported by Remotion`
	);
}

const doesReactVersionSupportSuspense = parseInt(reactVersion, 10) >= 18;

const ThumbnailUI: React.ForwardRefRenderFunction<
	ThumbnailMethods,
	{
		inputProps: unknown;
		style?: React.CSSProperties;
		errorFallback: ErrorFallback;
		renderLoading: RenderLoading | undefined;
		className: string | undefined;
	}
> = ({style, inputProps, errorFallback, renderLoading, className}, ref) => {
	const config = Internals.useUnsafeVideoConfig();
	const video = Internals.useVideo();
	const container = useRef<HTMLDivElement>(null);
	const canvasSize = useElementSize(container, {
		triggerOnWindowResize: false,
		shouldApplyCssTransforms: false,
	});

	const layout = useMemo(() => {
		if (!config || !canvasSize) {
			return null;
		}

		return calculateCanvasTransformation({
			canvasSize,
			compositionHeight: config.height,
			compositionWidth: config.width,
			previewSize: 'auto',
		});
	}, [canvasSize, config]);
	const scale = layout?.scale ?? 1;

	const thumbnail = useThumbnail();

	useImperativeHandle(
		ref,
		() => {
			const methods: ThumbnailMethods = {
				getContainerNode: () => container.current,
				getScale: () => scale,
			};
			return Object.assign(thumbnail.emitter, methods);
		},
		[scale, thumbnail.emitter]
	);

	const VideoComponent = video ? video.component : null;

	const outerStyle: React.CSSProperties = useMemo(() => {
		if (!config) {
			return {};
		}

		return {
			position: 'relative',
			overflow: 'hidden',
			...calculatePlayerSize({
				compositionHeight: config.height,
				compositionWidth: config.width,
				currentSize: canvasSize,
				height: style?.height as StandardLonghandProperties['width'],
				width: style?.width as StandardLonghandProperties['height'],
			}),
			...style,
		};
	}, [canvasSize, config, style]);

	const outer: React.CSSProperties = useMemo(() => {
		if (!layout || !config) {
			return {};
		}

		const {centerX, centerY} = layout;

		return {
			width: config.width * scale,
			height: config.height * scale,
			display: 'flex',
			flexDirection: 'column',
			position: 'absolute',
			left: centerX,
			top: centerY,
			overflow: 'hidden',
		};
	}, [config, layout, scale]);

	const containerStyle: React.CSSProperties = useMemo(() => {
		if (!config || !canvasSize || !layout) {
			return {};
		}

		return {
			position: 'absolute',
			width: config.width,
			height: config.height,
			display: 'flex',
			transform: `scale(${scale})`,
			marginLeft: layout.xCorrection,
			marginTop: layout.yCorrection,
			overflow: 'hidden',
		};
	}, [canvasSize, config, layout, scale]);

	const onError = useCallback(
		(error: Error) => {
			// Pay attention to `this context`
			thumbnail.emitter.dispatchError(error);
		},
		[thumbnail.emitter]
	);

	const rootRef = useRef<ThumbnailMethods>(null);
	useImperativeHandle(ref, () => rootRef.current as ThumbnailMethods, []);

	if (!config) {
		return null;
	}

	const content = (
		<div style={outer}>
			<div style={containerStyle} className={PLAYER_CSS_CLASSNAME}>
				{VideoComponent ? (
					<ErrorBoundary onError={onError} errorFallback={errorFallback}>
						<VideoComponent
							{...((video?.defaultProps as unknown as {}) ?? {})}
							{...((inputProps as unknown as {}) ?? {})}
						/>
					</ErrorBoundary>
				) : null}
			</div>
		</div>
	);

	if (IS_NODE && !doesReactVersionSupportSuspense) {
		return (
			<div ref={container} style={outerStyle} className={className}>
				{content}
			</div>
		);
	}

	const loadingMarkup = renderLoading
		? renderLoading({
				height: outerStyle.height as number,
				width: outerStyle.width as number,
		  })
		: null;

	return (
		<div ref={container} style={outerStyle} className={className}>
			<Suspense fallback={loadingMarkup}>{content}</Suspense>
		</div>
	);
};

export default forwardRef(ThumbnailUI);
