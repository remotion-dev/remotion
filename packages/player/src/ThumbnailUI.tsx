import React, {
	forwardRef,
	Suspense,
	useCallback,
	useImperativeHandle,
	useMemo,
	useRef,
} from 'react';
import {Internals} from 'remotion';
import {
	calculateCanvasTransformation,
	calculateContainerStyle,
	calculateOuter,
	calculateOuterStyle,
} from './calculate-scale.js';
import {ErrorBoundary} from './error-boundary.js';
import {PLAYER_CSS_CLASSNAME} from './player-css-classname.js';
import type {ThumbnailMethods} from './player-methods.js';
import type {ErrorFallback, RenderLoading} from './PlayerUI.js';
import {useThumbnail} from './use-thumbnail.js';
import {IS_NODE} from './utils/is-node.js';
import {useElementSize} from './utils/use-element-size.js';

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
		inputProps: Record<string, unknown>;
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
		return calculateOuterStyle({config, style, canvasSize});
	}, [canvasSize, config, style]);

	const outer: React.CSSProperties = useMemo(() => {
		return calculateOuter({config, layout, scale});
	}, [config, layout, scale]);

	const containerStyle: React.CSSProperties = useMemo(() => {
		return calculateContainerStyle({
			canvasSize,
			config,
			layout,
			scale,
		});
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

	const loadingMarkup = useMemo(() => {
		return renderLoading
			? renderLoading({
					height: outerStyle.height as number,
					width: outerStyle.width as number,
			  })
			: null;
	}, [outerStyle.height, outerStyle.width, renderLoading]);

	if (!config) {
		return null;
	}

	const content = (
		<div style={outer}>
			<div style={containerStyle} className={PLAYER_CSS_CLASSNAME}>
				{VideoComponent ? (
					<ErrorBoundary onError={onError} errorFallback={errorFallback}>
						<VideoComponent
							{...(video?.defaultProps ?? {})}
							{...(inputProps ?? {})}
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

	return (
		<div ref={container} style={outerStyle} className={className}>
			<Suspense fallback={loadingMarkup}>{content}</Suspense>
		</div>
	);
};

export default forwardRef(ThumbnailUI);
