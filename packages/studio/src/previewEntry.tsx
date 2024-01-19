import React from 'react';
import type {render} from 'react-dom';
import ReactDOM from 'react-dom/client';
import {Internals} from 'remotion';
import '../styles/styles.css';
import {NoRegisterRoot} from './components/NoRegisterRoot';
import {Studio} from './components/Studio';
import {openEventSource} from './helpers/event-source';

Internals.CSSUtils.injectCSS(
	Internals.CSSUtils.makeDefaultCSS(null, '#1f2428'),
);

const renderToDOM = (content: React.ReactElement) => {
	if (ReactDOM.createRoot) {
		ReactDOM.createRoot(Internals.getPreviewDomElement() as HTMLElement).render(
			content,
		);
	} else {
		(ReactDOM as unknown as {render: typeof render}).render(
			content,
			Internals.getPreviewDomElement(),
		);
	}
};

renderToDOM(<NoRegisterRoot />);

Internals.waitForRoot((NewRoot) => {
	renderToDOM(<Studio rootComponent={NewRoot} />);
});

openEventSource();
