import React from 'react';
import ReactDOM from 'react-dom/client';
import {Internals} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {NoRegisterRoot} from './components/NoRegisterRoot';
import {startErrorOverlay} from './error-overlay/entry-basic';
import {enableHotMiddleware} from './hot-middleware-client/client';
import {Studio} from './Studio';

Internals.CSSUtils.injectCSS(
	Internals.CSSUtils.makeDefaultPreviewCSS(null, '#1f2428'),
);

declare global {
	interface Window {
		__remotionOverlayStarted: boolean;
	}
}

if (!window.__remotionOverlayStarted) {
	window.__remotionOverlayStarted = true;
	try {
		startErrorOverlay();
		enableHotMiddleware();
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error('Failed to initialize error overlay', err);
	}
}

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
			readOnly={false}
			rootComponent={NewRoot}
			visualModeEnabled={Boolean(process.env.EXPERIMENTAL_VISUAL_MODE_ENABLED)}
		/>,
	);
});
