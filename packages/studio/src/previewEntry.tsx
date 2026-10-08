import React from 'react';
import ReactDOM from 'react-dom/client';
import {Internals} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {NoRegisterRoot} from './components/NoRegisterRoot';
import {initializeStudioPreview} from './initialize-studio-preview';
import {Studio} from './Studio';

initializeStudioPreview();

let root: ReturnType<typeof ReactDOM.createRoot> | null = null;

const getRootForElement = () => {
	if (root) {
		return root;
	}

	root = ReactDOM.createRoot(Internals.getPreviewDomElement() as HTMLElement);
	return root;
};

const renderToDOM = (content: React.ReactElement) => {
	if (!ReactDOM.createRoot) {
		if (NoReactInternals.ENABLE_V5_BREAKING_CHANGES) {
			throw new Error(
				'Remotion 5.0 does only support React 18+. However, ReactDOM.createRoot() is undefined.',
			);
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(ReactDOM as unknown as {render: any}).render(
			content,
			Internals.getPreviewDomElement(),
		);
		return;
	}

	getRootForElement().render(content);
};

renderToDOM(<NoRegisterRoot />);

Internals.waitForRoot((NewRoot) => {
	renderToDOM(
		<Studio
			readOnly={window.remotion_isReadOnlyStudio}
			rootComponent={NewRoot}
		/>,
	);
});
