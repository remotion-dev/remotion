import {RemixBrowser} from '@remix-run/react';
import {startTransition} from 'react';
import {hydrateRoot} from 'react-dom/client';

const registerServiceWorker = () => {
	if ('serviceWorker' in navigator) {
		window.addEventListener('load', () => {
			navigator.serviceWorker
				.register('/convert/service-worker.js', {
					scope: '/convert', // "/convert", not "/convert/"
				})
				.then((registration) => {
					console.log(
						'Service worker registered, site is now available offline',
					);
					registration.update();
				})
				.catch((error) => {
					console.log('SW registration failed:', error);
				});
		});
	}
};

startTransition(() => {
	hydrateRoot(document, <RemixBrowser />);
	registerServiceWorker();
});
