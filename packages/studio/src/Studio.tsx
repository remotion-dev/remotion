import React, {useLayoutEffect} from 'react';
import {createPortal} from 'react-dom';
import {Internals} from 'remotion';
import {Editor} from './components/Editor';
import {EditorContexts} from './components/EditorContexts';
import {ServerDisconnected} from './components/Notifications/ServerDisconnected';
import {FastRefreshProvider} from './FastRefreshProvider';
import {injectCSS} from './helpers/inject-css';
import {ResolveCompositionConfigInStudio} from './ResolveCompositionConfigInStudio';

const getServerDisconnectedDomElement = () => {
	return document.getElementById('server-disconnected-overlay');
};

const StudioInner: React.FC<{
	readonly rootComponent: React.FC;
	readonly readOnly: boolean;
}> = ({rootComponent, readOnly}) => {
	return (
		<Internals.CompositionManagerProvider
			onlyRenderComposition={null}
			currentCompositionMetadata={null}
			initialCompositions={[]}
			initialCanvasContent={null}
		>
			<Internals.RemotionRootContexts
				frameState={null}
				audioEnabled={window.remotion_audioEnabled}
				videoEnabled={window.remotion_videoEnabled}
				logLevel={window.remotion_logLevel}
				numberOfAudioTags={window.remotion_numberOfAudioTags}
				audioLatencyHint={window.remotion_audioLatencyHint ?? 'interactive'}
			>
				<ResolveCompositionConfigInStudio>
					<EditorContexts readOnlyStudio={readOnly}>
						<Editor readOnlyStudio={readOnly} Root={rootComponent} />
						{readOnly
							? null
							: createPortal(
									<ServerDisconnected />,
									getServerDisconnectedDomElement() as HTMLElement,
								)}
					</EditorContexts>
				</ResolveCompositionConfigInStudio>
			</Internals.RemotionRootContexts>
		</Internals.CompositionManagerProvider>
	);
};

export const Studio: React.FC<{
	readonly rootComponent: React.FC;
	readonly readOnly: boolean;
}> = ({rootComponent, readOnly}) => {
	useLayoutEffect(() => {
		injectCSS();
	}, []);

	return (
		<FastRefreshProvider>
			<StudioInner rootComponent={rootComponent} readOnly={readOnly} />
		</FastRefreshProvider>
	);
};
