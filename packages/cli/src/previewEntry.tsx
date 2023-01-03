import type {render} from 'react-dom';
import {createPortal} from 'react-dom';
import ReactDOM from 'react-dom/client';
// eslint-disable-next-line no-restricted-imports
import {Internals} from 'remotion';
import '../styles/styles.css';
import {Editor} from './editor/components/Editor';
import {EditorContexts} from './editor/components/EditorContexts';
import {ServerDisconnected} from './editor/components/Notifications/ServerDisconnected';
import {openEventSource} from './event-source';

Internals.CSSUtils.injectCSS(
	Internals.CSSUtils.makeDefaultCSS(null, '#1f2428')
);

const getServerDisconnectedDomElement = () => {
	return document.getElementById('server-disconnected-overlay');
};

const content = (
	<Internals.RemotionRoot numberOfAudioTags={window.remotion_numberOfAudioTags}>
		<EditorContexts>
			<Editor />
			{createPortal(
				<ServerDisconnected />,
				getServerDisconnectedDomElement() as HTMLElement
			)}
		</EditorContexts>
	</Internals.RemotionRoot>
);

if (ReactDOM.createRoot) {
	ReactDOM.createRoot(Internals.getPreviewDomElement() as HTMLElement).render(
		content
	);
} else {
	(ReactDOM as unknown as {render: typeof render}).render(
		content,
		Internals.getPreviewDomElement()
	);
}

openEventSource();
