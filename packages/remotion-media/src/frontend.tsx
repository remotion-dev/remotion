/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import {createRoot, hydrateRoot} from 'react-dom/client';
import {App} from './App';
import './index.css';

function start() {
	const rootElement = document.getElementById('root')!;
	if (rootElement.hasChildNodes()) {
		hydrateRoot(rootElement, <App />);
		return;
	}

	createRoot(rootElement).render(<App />);
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', start);
} else {
	start();
}
