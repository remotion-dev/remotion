import {getAvailableModels} from './models';

const legacyModelUrlPrefixes = getAvailableModels().map(
	({modelId}) => `https://huggingface.co/${modelId}/resolve/main/`,
);

export const clearStaleModels = async (): Promise<void> => {
	if (typeof caches === 'undefined') {
		return;
	}

	const {env} = await import('@huggingface/transformers');
	let cache: Cache;
	let requests: readonly Request[];
	try {
		cache = await caches.open(env.cacheKey);
		requests = await cache.keys();
	} catch {
		return;
	}

	await Promise.all(
		requests.map((request) => {
			if (
				legacyModelUrlPrefixes.some((prefix) => request.url.startsWith(prefix))
			) {
				return cache.delete(request);
			}

			return Promise.resolve(false);
		}),
	);
};
