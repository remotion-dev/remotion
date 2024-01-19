import React from 'react';
import {createPortal} from 'react-dom';
import {Internals} from 'remotion';
import {Editor} from './Editor';
import {EditorContexts} from './EditorContexts';
import {ServerDisconnected} from './Notifications/ServerDisconnected';

const getServerDisconnectedDomElement = () => {
	return document.getElementById('server-disconnected-overlay');
};

export const Studio: React.FC<{
	rootComponent: React.FC;
}> = ({rootComponent}) => {
	return (
		<Internals.RemotionRoot
			numberOfAudioTags={window.remotion_numberOfAudioTags}
		>
			<EditorContexts>
				<Editor Root={rootComponent} />
				{createPortal(
					<ServerDisconnected />,
					getServerDisconnectedDomElement() as HTMLElement,
				)}
			</EditorContexts>
		</Internals.RemotionRoot>
	);
};
