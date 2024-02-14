import {PlayerInternals} from '@remotion/player';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import type {CurrentScaleContextType} from 'remotion';
import {Internals} from 'remotion';
import {BACKGROUND} from '../helpers/colors';
import {noop} from '../helpers/noop';
import {TimelineZoomContext} from '../state/timeline-zoom';
import {HigherZIndex} from '../state/z-index';
import {EditorContent} from './EditorContent';
import {GlobalKeybindings} from './GlobalKeybindings';
import {Modals} from './Modals';
import {NotificationCenter} from './Notifications/NotificationCenter';

const background: React.CSSProperties = {
	backgroundColor: BACKGROUND,
	display: 'flex',
	width: '100%',
	height: '100%',
	flexDirection: 'column',
	position: 'absolute',
};

export const Editor: React.FC<{Root: React.FC; readOnlyStudio: boolean}> = ({
	Root,
	readOnlyStudio,
}) => {
	const drawRef = useRef<HTMLDivElement>(null);

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

	return (
		<HigherZIndex onEscape={noop} onOutsideClick={noop}>
			<TimelineZoomContext>
				<Internals.CurrentScaleContext.Provider value={value}>
					<div style={background}>
						{canvasMounted ? <Root /> : null}
						<Internals.CanUseRemotionHooksProvider>
							<EditorContent
								drawRef={drawRef}
								size={size}
								onMounted={onMounted}
								readOnlyStudio={readOnlyStudio}
							/>
							<GlobalKeybindings />
						</Internals.CanUseRemotionHooksProvider>
						<NotificationCenter />
					</div>
				</Internals.CurrentScaleContext.Provider>
				<Modals readOnlyStudio={readOnlyStudio} />
			</TimelineZoomContext>
		</HigherZIndex>
	);
};
