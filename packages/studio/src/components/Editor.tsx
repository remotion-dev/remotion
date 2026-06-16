import {PlayerInternals} from '@remotion/player';
import React, {useCallback, useMemo, useState} from 'react';
import type {CurrentScaleContextType} from 'remotion';
import {Internals} from 'remotion';
import {BACKGROUND} from '../helpers/colors';
import {noop} from '../helpers/noop';
import {drawRef} from '../state/canvas-ref';
import {ScaleLockProvider} from '../state/scale-lock';
import {TimelineZoomContext} from '../state/timeline-zoom';
import {HigherZIndex} from '../state/z-index';
import {CANVAS_CAPTURE_ENABLED} from './canvas-capture-enabled';
import {EditorContent} from './EditorContent';
import {ForceSpecificCursor} from './ForceSpecificCursor';
import {GlobalKeybindings} from './GlobalKeybindings';
import {Modals} from './Modals';
import {NotificationCenter} from './Notifications/NotificationCenter';
import {RenderErrorContext} from './RenderErrorContext';
import {SequencePropsSubscriptionProvider} from './SequencePropsSubscriptionProvider';
import {StudioCanvasCapture} from './StudioCanvasCapture';
import {TopPanel} from './TopPanel';

const background: React.CSSProperties = {
	backgroundColor: BACKGROUND,
	display: 'flex',
	width: '100%',
	height: '100%',
	flexDirection: 'column',
	position: 'absolute',
};

const DEFAULT_BUFFER_STATE_DELAY_IN_MILLISECONDS = 300;

export const BUFFER_STATE_DELAY_IN_MILLISECONDS =
	typeof process.env.BUFFER_STATE_DELAY_IN_MILLISECONDS === 'undefined' ||
	process.env.BUFFER_STATE_DELAY_IN_MILLISECONDS === null
		? DEFAULT_BUFFER_STATE_DELAY_IN_MILLISECONDS
		: Number(process.env.BUFFER_STATE_DELAY_IN_MILLISECONDS);

export const Editor: React.FC<{
	readonly Root: React.FC;
	readonly readOnlyStudio: boolean;
}> = ({Root, readOnlyStudio}) => {
	const [drawElement, setDrawElement] = useState<HTMLDivElement | null>(null);
	const size = PlayerInternals.useElementSize(drawElement, {
		triggerOnWindowResize: false,
		shouldApplyCssTransforms: true,
	});

	const [canvasMounted, setCanvasMounted] = React.useState(false);

	const onMounted = useCallback(() => {
		setCanvasMounted(true);
	}, []);

	// Use a callback ref so the late-mounted canvas container triggers a render
	// and useElementSize() can observe it. See GitHub issue #8098.
	const setDrawRef = useCallback((node: HTMLDivElement | null) => {
		drawRef.current = node;
		setDrawElement(node);
	}, []);

	const value: CurrentScaleContextType | null = useMemo(() => {
		if (!size) {
			return null;
		}

		return {
			type: 'canvas-size',
			canvasSize: size,
		};
	}, [size]);

	const MemoRoot = useMemo(() => {
		return React.memo(Root);
	}, [Root]);

	const [renderError, setRenderError] = useState<Error | null>(null);

	const clearError = useCallback(() => {
		setRenderError(null);
	}, []);

	const compositionRenderErrorContextValue = useMemo(
		() => ({setError: setRenderError, clearError}),
		[clearError],
	);

	const renderErrorContextValue = useMemo(
		() => ({error: renderError}),
		[renderError],
	);

	const editor = (
		<HigherZIndex onEscape={noop} onOutsideClick={noop}>
			<TimelineZoomContext>
				<SequencePropsSubscriptionProvider>
					<Internals.CurrentScaleContext.Provider value={value}>
						<ForceSpecificCursor />
						<ScaleLockProvider>
							<div style={background}>
								<Internals.CompositionRenderErrorContext.Provider
									value={compositionRenderErrorContextValue}
								>
									{canvasMounted ? <MemoRoot /> : null}
								</Internals.CompositionRenderErrorContext.Provider>
								<Internals.CanUseRemotionHooksProvider>
									<RenderErrorContext.Provider value={renderErrorContextValue}>
										<EditorContent readOnlyStudio={readOnlyStudio}>
											<TopPanel
												drawRef={setDrawRef}
												bufferStateDelayInMilliseconds={
													BUFFER_STATE_DELAY_IN_MILLISECONDS
												}
												onMounted={onMounted}
												readOnlyStudio={readOnlyStudio}
											/>
										</EditorContent>
									</RenderErrorContext.Provider>
									<GlobalKeybindings />
								</Internals.CanUseRemotionHooksProvider>
							</div>
						</ScaleLockProvider>
					</Internals.CurrentScaleContext.Provider>
					<Modals readOnlyStudio={readOnlyStudio} />
					<NotificationCenter />
				</SequencePropsSubscriptionProvider>
			</TimelineZoomContext>
		</HigherZIndex>
	);

	return CANVAS_CAPTURE_ENABLED ? (
		<StudioCanvasCapture density={2}>{editor}</StudioCanvasCapture>
	) : (
		editor
	);
};
