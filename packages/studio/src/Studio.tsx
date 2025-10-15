import React, {useLayoutEffect} from 'react';
import {createPortal} from 'react-dom';
import {Internals} from 'remotion';
import {Editor} from './components/Editor';
import {EditorContexts} from './components/EditorContexts';
import {ServerDisconnected} from './components/Notifications/ServerDisconnected';
import {injectCSS} from './helpers/inject-css';

const getServerDisconnectedDomElement = () => {
	return document.getElementById('server-disconnected-overlay');
};

export const Studio: React.FC<{
	readonly rootComponent: React.FC;
	readonly readOnly: boolean;
}> = ({rootComponent, readOnly}) => {
	useLayoutEffect(() => {
		injectCSS();
	}, []);

	return (
		<Internals.RemotionRoot
			audioEnabled={window.remotion_audioEnabled}
			videoEnabled={window.remotion_videoEnabled}
			logLevel={window.remotion_logLevel}
			numberOfAudioTags={window.remotion_numberOfAudioTags}
			onlyRenderComposition={null}
			currentCompositionMetadata={null}
			audioLatencyHint={window.remotion_audioLatencyHint ?? 'interactive'}
		>
			<EditorContexts readOnlyStudio={readOnly}>
				<Editor readOnlyStudio={readOnly} Root={rootComponent} />
				{readOnly
					? null
					: createPortal(
							<ServerDisconnected />,
							getServerDisconnectedDomElement() as HTMLElement,
						)}
			</EditorContexts>
		</Internals.RemotionRoot>
	);
};
