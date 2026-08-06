import {cancelRender, Internals, type LogLevel} from 'remotion';

const getUncachedMaxCacheSize = (logLevel: LogLevel) => {
	if (
		typeof window !== 'undefined' &&
		window.remotion_mediaCacheSizeInBytes !== undefined &&
		window.remotion_mediaCacheSizeInBytes !== null
	) {
		if (window.remotion_mediaCacheSizeInBytes < 240 * 1024 * 1024) {
			cancelRender(
				new Error(
					`The minimum value for the "mediaCacheSizeInBytes" prop is 240MB (${240 * 1024 * 1024}), got: ${window.remotion_mediaCacheSizeInBytes}`,
				),
			);
		}

		if (window.remotion_mediaCacheSizeInBytes > 20_000 * 1024 * 1024) {
			cancelRender(
				new Error(
					`The maximum value for the "mediaCacheSizeInBytes" prop is 20GB (${20000 * 1024 * 1024}), got: ${window.remotion_mediaCacheSizeInBytes}`,
				),
			);
		}

		Internals.Log.verbose(
			{logLevel, tag: '@remotion/media'},
			`Using cache size set using "mediaCacheSizeInBytes": ${(window.remotion_mediaCacheSizeInBytes / 1024 / 1024).toFixed(1)} MB`,
		);
		return window.remotion_mediaCacheSizeInBytes;
	}

	if (
		typeof window !== 'undefined' &&
		window.remotion_initialMemoryAvailable !== undefined &&
		window.remotion_initialMemoryAvailable !== null
	) {
		const value = window.remotion_initialMemoryAvailable / 2;
		if (value < 500 * 1024 * 1024) {
			Internals.Log.verbose(
				{logLevel, tag: '@remotion/media'},
				`Using cache size set based on minimum value of 500MB (which is more than half of the available system memory!)`,
			);
			return 500 * 1024 * 1024;
		}

		if (value > 20_000 * 1024 * 1024) {
			Internals.Log.verbose(
				{logLevel, tag: '@remotion/media'},
				`Using cache size set based on maximum value of 20GB (which is less than half of the available system memory)`,
			);
			return 20_000 * 1024 * 1024;
		}

		Internals.Log.verbose(
			{logLevel, tag: '@remotion/media'},
			`Using cache size set based on available memory (50% of available memory): ${(value / 1024 / 1024).toFixed(1)} MB`,
		);
		return value;
	}

	return 1000 * 1000 * 1000; // 1GB
};

let cachedMaxCacheSize: number | null = null;

export const getMaxVideoCacheSize = (logLevel: LogLevel) => {
	if (cachedMaxCacheSize !== null) {
		return cachedMaxCacheSize;
	}

	cachedMaxCacheSize = getUncachedMaxCacheSize(logLevel);
	return cachedMaxCacheSize;
};

const MIN_SOURCE_CACHE_SIZE = 8 * 1024 * 1024;
// mediabunny's own default for `UrlSource`. Never allocate more than this, so
// this is a ceiling on existing behaviour rather than a change to it.
const MAX_SOURCE_CACHE_SIZE = 64 * 1024 * 1024;

// Every distinct `src` gets its own mediabunny source, and every source keeps a
// byte cache that is invisible to `getTotalCacheStats()`. That cache is charged
// against nothing, so a composition with many distinct sources can hold
// (sources x 64 MiB) on top of the decoded-frame budget the user configured
// with `mediaCacheSizeInBytes`.
//
// Scaling it with the configured budget keeps the read caches proportional to
// how much memory the user said they have. At the 1 GB default this lands at
// 62.5 MiB, so the common case is effectively unchanged; the difference shows
// up when someone deliberately renders in a small memory envelope.
export const getMaxSourceCacheSize = (logLevel: LogLevel) => {
	const budget = getMaxVideoCacheSize(logLevel);

	return Math.min(
		MAX_SOURCE_CACHE_SIZE,
		Math.max(MIN_SOURCE_CACHE_SIZE, Math.floor(budget / 16)),
	);
};
