import React, {
	forwardRef,
	Suspense,
	useCallback,
	useImperativeHandle,
	useMemo,
	useRef,
} from 'react';
import type {CurrentScaleContextType} from 'remotion';
import {Internals} from 'remotion';
import {
	calculateCanvasTransformation,
	calculateContainerStyle,
	calculateOuter,
	calculateOuterStyle,
} from './calculate-scale.js';
import {ErrorBoundary} from './error-boundary.js';
import {playerCssClassname} from './player-css-classname.js';
import type {ThumbnailMethods} from './player-methods.js';
import type {ErrorFallback, RenderLoading} from './PlayerUI.js';
import {useBufferStateEmitter} from './use-buffer-state-emitter.js';
import {useThumbnail} from './use-thumbnail.js';
import {IS_NODE} from './utils/is-node.js';
import {useElementSize} from './utils/use-element-size.js';

const reactVersion = React.version.split('.')[0];
if (reactVersion === '0') {
	throw new Error(
		`Version ${reactVersion} of "react" is not supported by Remotion`,
	);
}

const doesReactVersionSupportSuspense = parseInt(reactVersion, 10) >= 18;

const ThumbnailUI: React.ForwardRefRenderFunction<
	ThumbnailMethods,
	{
		readonly inputProps: Record<string, unknown>;
		readonly style?: React.CSSProperties;
		readonly errorFallback: ErrorFallback;
		readonly renderLoading: RenderLoading | undefined;
		readonly className: string | undefined;
		readonly overflowVisible: boolean;
		readonly overrideInternalClassName: string | undefined;
		readonly noSuspense: boolean;
	}
> = (
	{
		style,
		inputProps,
		errorFallback,
		renderLoading,
		className,
		overflowVisible,
		noSuspense,
		overrideInternalClassName,
	},
	ref,
) => {
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

	useBufferStateEmitter(thumbnail.emitter);

	useImperativeHandle(ref, () => {
		const methods: ThumbnailMethods = {
			getContainerNode: () => container.current,
			getScale: () => scale,
		};
		return Object.assign(thumbnail.emitter, methods);
	}, [scale, thumbnail.emitter]);

	const VideoComponent = video ? video.component : null;

	const outerStyle: React.CSSProperties = useMemo(() => {
		return calculateOuterStyle({
			config,
			style,
			canvasSize,
			overflowVisible,
			layout,
		});
	}, [canvasSize, config, layout, overflowVisible, style]);

	const outer: React.CSSProperties = useMemo(() => {
		return calculateOuter({config, layout, scale, overflowVisible});
	}, [config, layout, overflowVisible, scale]);

	const containerStyle: React.CSSProperties = useMemo(() => {
		return calculateContainerStyle({
			canvasSize,
			config,
			layout,
			scale,
			overflowVisible,
		});
	}, [canvasSize, config, layout, overflowVisible, scale]);

	const onError = useCallback(
		(error: Error) => {
			// Pay attention to `this context`
			thumbnail.emitter.dispatchError(error);
		},
		[thumbnail.emitter],
	);

	const loadingMarkup = useMemo(() => {
		return renderLoading
			? renderLoading({
					height: outerStyle.height as number,
					width: outerStyle.width as number,
					isBuffering: false,
				})
			: null;
	}, [outerStyle.height, outerStyle.width, renderLoading]);

	const currentScaleContext: CurrentScaleContextType = useMemo(() => {
		return {
			type: 'scale',
			scale,
		};
	}, [scale]);

	if (!config) {
		return null;
	}

	const content = (
		<div style={outer}>
			<div
				style={containerStyle}
				className={playerCssClassname(overrideInternalClassName)}
			>
				{VideoComponent ? (
					<ErrorBoundary onError={onError} errorFallback={errorFallback}>
						<Internals.CurrentScaleContext.Provider value={currentScaleContext}>
							<VideoComponent
								{...(video?.props ?? {})}
								{...(inputProps ?? {})}
							/>
						</Internals.CurrentScaleContext.Provider>
					</ErrorBoundary>
				) : null}
			</div>
		</div>
	);

	if (noSuspense || (IS_NODE && !doesReactVersionSupportSuspense)) {
		return (
			<div ref={container} style={outerStyle} className={className}>
				{content}
			</div>
		);
	}

	return (
		<div ref={container} style={outerStyle} className={className}>
			<Suspense fallback={loadingMarkup}>{content}</Suspense>
		</div>
	);
};

export default forwardRef(ThumbnailUI);
