import {registerMp3Encoder} from '@mediabunny/mp3-encoder';
import {RemixBrowser} from '@remix-run/react';
import {startTransition} from 'react';
import {hydrateRoot} from 'react-dom/client';

registerMp3Encoder();

const registerServiceWorker = () => {
	if ('serviceWorker' in navigator) {
		window.addEventListener('load', () => {
			navigator.serviceWorker
				.register('/convert-service-worker.js', {})
				.then((registration) => {
					// eslint-disable-next-line no-console
					console.log(
						'Service worker registered, site is now available offline',
					);
					registration.update();
				})
				.catch((error) => {
					// eslint-disable-next-line no-console
					console.log('SW registration failed:', error);
				});
		});
	}
};

startTransition(() => {
	hydrateRoot(document, <RemixBrowser />);
	registerServiceWorker();
});
