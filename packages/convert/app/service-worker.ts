// @ts-nocheck
const $FILES = [];
// ^ leave this - will get filled in during build
// --auto-generated-until-here

const CACHE_NAME = 'ABCDEF';
// ^ leave this - will get filled in during build

// Helper function to determine if a request is under /convert
function isConvertPath(url) {
	return url.pathname.startsWith('/convert');
}

self.addEventListener('install', (event) => {
	event.waitUntil(
		(async () => {
			const cache = await caches.open(CACHE_NAME);
			await cache.addAll($FILES);
			// @ts-expect-error no types
			await self.skipWaiting();
		})(),
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			// Clean up old caches
			const cacheNames = await caches.keys();
			await Promise.all(
				cacheNames
					.filter((name) => name !== CACHE_NAME)
					.map((name) => caches.delete(name)),
			);
			// Take control of all pages immediately
			// @ts-expect-error no types
			await self.clients.claim();
		})(),
	);
});

self.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url);

	if (!isConvertPath(url)) {
		return;
	}

	// Only handle same-origin requests
	if (!url.origin.includes(self.location.origin)) {
		return;
	}

	// If it is a file selected from the user's device, do not cache it
	if (url.protocol === 'file:') {
		return;
	}

	// Special handling for /convert paths
	if (isConvertPath(url)) {
		event.respondWith(
			(async () => {
				try {
					// Try to fetch the network request
					const response = await fetch(event.request);

					// Cache the new response
					const cache = await caches.open(CACHE_NAME);
					await cache.put(event.request, response.clone());

					return response;
				} catch (error) {
					// If network fails, try cache
					const cachedResponse = await caches.match(event.request);
					if (cachedResponse) {
						return cachedResponse;
					}

					// eslint-disable-next-line no-console
					console.log(error);
					return new Response('You are offline', {
						status: 408,
						headers: {'Content-Type': 'text/plain'},
					});
				}
			})(),
		);
		return;
	}

	// For all other requests, do a simple network-first strategy
	event.respondWith(
		(async () => {
			try {
				return await fetch(event.request);
			} catch {
				return caches.match(event.request);
			}
		})(),
	);
});
