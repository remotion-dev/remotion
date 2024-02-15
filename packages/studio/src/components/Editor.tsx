import React, {useCallback, useEffect} from 'react';
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

const DEFAULT_BUFFER_STATE_DELAY_IN_MILLISECONDS = 300;

export const BUFFER_STATE_DELAY_IN_MILLISECONDS =
	typeof process.env.BUFFER_STATE_DELAY_IN_MILLISECONDS === 'undefined'
		? DEFAULT_BUFFER_STATE_DELAY_IN_MILLISECONDS
		: Number(process.env.BUFFER_STATE_DELAY_IN_MILLISECONDS);

export const Editor: React.FC<{Root: React.FC; readOnlyStudio: boolean}> = ({
	Root,
	readOnlyStudio,
}) => {
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

	return (
		<HigherZIndex onEscape={noop} onOutsideClick={noop}>
			<TimelineZoomContext>
				<div style={background}>
					{canvasMounted ? <Root /> : null}
					<Internals.CanUseRemotionHooksProvider>
						<EditorContent
							bufferStateDelayInMilliseconds={
								BUFFER_STATE_DELAY_IN_MILLISECONDS
							}
							onMounted={onMounted}
							readOnlyStudio={readOnlyStudio}
						/>
						<GlobalKeybindings />
					</Internals.CanUseRemotionHooksProvider>
					<NotificationCenter />
				</div>
				<Modals readOnlyStudio={readOnlyStudio} />
			</TimelineZoomContext>
		</HigherZIndex>
	);
};
