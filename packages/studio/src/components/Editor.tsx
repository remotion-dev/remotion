import {PlayerInternals} from '@remotion/player';
import React, {useCallback, useEffect, useMemo} from 'react';
import type {CurrentScaleContextType} from 'remotion';
import {Internals} from 'remotion';
import {BACKGROUND} from '../helpers/colors';
import {noop} from '../helpers/noop';
import {drawRef} from '../state/canvas-ref';
import {TimelineZoomContext} from '../state/timeline-zoom';
import {HigherZIndex} from '../state/z-index';
import {EditorContent} from './EditorContent';
import {GlobalKeybindings} from './GlobalKeybindings';
import {Modals} from './Modals';
import {NotificationCenter} from './Notifications/NotificationCenter';
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
	const size = PlayerInternals.useElementSize(drawRef, {
		triggerOnWindowResize: false,
		shouldApplyCssTransforms: true,
	});
	useEffect(() => {
		if (readOnlyStudio) {
			return;
		}

		const listenToChanges = (e: BeforeUnloadEvent) => {
			if (window.remotion_unsavedProps) {
				e.returnValue = 'Are you sure you want to leave?';
			}
		};

		window.addEventListener('beforeunload', listenToChanges);

		return () => {
			window.removeEventListener('beforeunload', listenToChanges);
		};
	}, [readOnlyStudio]);

	const [canvasMounted, setCanvasMounted] = React.useState(false);

	const onMounted = useCallback(() => {
		setCanvasMounted(true);
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

	return (
		<HigherZIndex onEscape={noop} onOutsideClick={noop}>
			<TimelineZoomContext>
				<Internals.CurrentScaleContext.Provider value={value}>
					<div style={background}>
						{canvasMounted ? <MemoRoot /> : null}
						<Internals.CanUseRemotionHooksProvider>
							<EditorContent readOnlyStudio={readOnlyStudio}>
								<TopPanel
									drawRef={drawRef}
									bufferStateDelayInMilliseconds={
										BUFFER_STATE_DELAY_IN_MILLISECONDS
									}
									onMounted={onMounted}
									readOnlyStudio={readOnlyStudio}
								/>
							</EditorContent>
							<GlobalKeybindings />
						</Internals.CanUseRemotionHooksProvider>
					</div>
				</Internals.CurrentScaleContext.Provider>
				<Modals readOnlyStudio={readOnlyStudio} />
				<NotificationCenter />
			</TimelineZoomContext>
		</HigherZIndex>
	);
};
