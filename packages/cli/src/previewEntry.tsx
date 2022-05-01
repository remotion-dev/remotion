import React from 'react';
import type {render} from 'react-dom';
import ReactDOM from 'react-dom/client';
import {Internals} from 'remotion';
import '../styles/styles.css';
import {Editor} from './editor/components/Editor';

Internals.CSSUtils.injectCSS(
	Internals.CSSUtils.makeDefaultCSS(null, '#1f2428')
);

const content = (
	<React.StrictMode>
		<Internals.RemotionRoot>
			<Editor />
		</Internals.RemotionRoot>
	</React.StrictMode>
);

if (ReactDOM.createRoot) {
	ReactDOM.createRoot(Internals.getPreviewDomElement() as HTMLElement).render(
		content
	);
} else {
	(ReactDOM as unknown as {render: typeof render}).render(
		<Internals.RemotionRoot>
			<Editor />
		</Internals.RemotionRoot>,
		Internals.getPreviewDomElement()
	);
}
