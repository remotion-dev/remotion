import React, {useContext, useEffect, useState} from 'react';
import {continueRender, delayRender, Internals} from 'remotion';
import {BACKGROUND} from '../helpers/colors';
import {noop} from '../helpers/noop';
import {ModalsContext} from '../state/modals';
import {TimelineZoomContext} from '../state/timeline-zoom';
import {HigherZIndex} from '../state/z-index';
import {EditorContent} from './EditorContent';
import {FramePersistor} from './FramePersistor';
import {GlobalKeybindings} from './GlobalKeybindings';
import {KeyboardShortcuts} from './KeyboardShortcutsModal';
import NewComposition from './NewComposition/NewComposition';
import {NoRegisterRoot} from './NoRegisterRoot';
import {NotificationCenter} from './Notifications/NotificationCenter';
import QuickSwitcher from './QuickSwitcher/QuickSwitcher';
import {UpdateModal} from './UpdateModal/UpdateModal';
import {ZoomPersistor} from './ZoomPersistor';

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

	const {selectedModal: modalContextType} = useContext(ModalsContext);

	const [waitForRoot] = useState(() => {
		if (Root) {
			return 0;
		}

		return delayRender('Waiting for registerRoot()');
	});

	useEffect(() => {
		if (Root) {
			return;
		}

		const cleanup = Internals.waitForRoot((NewRoot) => {
			setRoot(() => NewRoot);
			continueRender(waitForRoot);
		});

		return () => cleanup();
	}, [Root, waitForRoot]);

	return (
		<HigherZIndex onEscape={noop} onOutsideClick={noop}>
			<TimelineZoomContext>
				<div style={background}>
					{Root === null ? null : <Root />}
					<Internals.CanUseRemotionHooksProvider>
						<FramePersistor />
						<ZoomPersistor />
						{Root === null ? <NoRegisterRoot /> : <EditorContent />}
						<GlobalKeybindings />
					</Internals.CanUseRemotionHooksProvider>
					<NotificationCenter />

					{modalContextType && modalContextType.type === 'quick-switcher' && (
						// Quick switcher here because requires timeline zoom ctx
						<QuickSwitcher />
					)}
				</div>
			</TimelineZoomContext>

			{modalContextType && modalContextType.type === 'new-comp' && (
				<NewComposition initialCompType={modalContextType.compType} />
			)}

			{modalContextType && modalContextType.type === 'update' && (
				<UpdateModal info={modalContextType.info} />
			)}
			{modalContextType && modalContextType.type === 'shortcuts' && (
				<KeyboardShortcuts />
			)}
		</HigherZIndex>
	);
};
