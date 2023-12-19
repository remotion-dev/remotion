import React, {useEffect, useState} from 'react';
import {continueRender, delayRender, Internals} from 'remotion';
import {BACKGROUND} from '../../../../studio/src/helpers/colors';
import {noop} from '../../../../studio/src/helpers/noop';
import {TimelineZoomContext} from '../state/timeline-zoom';
import {HigherZIndex} from '../state/z-index';
import {EditorContent} from './EditorContent';
import {GlobalKeybindings} from './GlobalKeybindings';
import {Modals} from './Modals';
import {NoRegisterRoot} from './NoRegisterRoot';
import {NotificationCenter} from './Notifications/NotificationCenter';

const background: React.CSSProperties = {
	backgroundColor: BACKGROUND,
	display: 'flex',
	width: '100%',
	height: '100%',
	flexDirection: 'column',
	position: 'absolute',
};

export const Editor: React.FC = () => {
	const [Root, setRoot] = useState<React.FC | null>(() => Internals.getRoot());

	const [waitForRoot] = useState(() => {
		if (Root) {
			return 0;
		}

		return delayRender('Waiting for registerRoot()');
	});

	useEffect(() => {
		const listenToChanges = (e: BeforeUnloadEvent) => {
			if (window.remotion_unsavedProps) {
				e.returnValue = 'Are you sure you want to leave?';
			}
		};

		window.addEventListener('beforeunload', listenToChanges);

		return () => {
			window.removeEventListener('beforeunload', listenToChanges);
		};
	}, []);

	useEffect(() => {
		if (Root) {
			return;
		}

		const cleanup = Internals.waitForRoot((NewRoot) => {
			setRoot(() => NewRoot);
			continueRender(waitForRoot);
		});

		return () => {
			cleanup();
		};
	}, [Root, waitForRoot]);

	return (
		<HigherZIndex onEscape={noop} onOutsideClick={noop}>
			<TimelineZoomContext>
				<div style={background}>
					{Root === null ? null : <Root />}
					<Internals.CanUseRemotionHooksProvider>
						{Root === null ? <NoRegisterRoot /> : <EditorContent />}
						<GlobalKeybindings />
					</Internals.CanUseRemotionHooksProvider>
					<NotificationCenter />
				</div>
				<Modals />
			</TimelineZoomContext>
		</HigherZIndex>
	);
};
