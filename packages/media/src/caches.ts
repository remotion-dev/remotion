import React from 'react';
import {cancelRender, Internals, type LogLevel} from 'remotion';
import {makeAudioManager} from './audio-extraction/audio-manager';
import {makeSinkManager} from './get-sink';
import {makeKeyframeManager} from './video-extraction/keyframe-manager';

// Frames can be out of order, but we don't expect them to be more than 0.2 seconds out of order
export const getSafeWindowOfMonotonicity = (fps: number) => (0.2 * 30) / fps;

export const makeMediaCache = () => {
	const sinkManager = makeSinkManager();
	const managerInstances: {
		keyframe: ReturnType<typeof makeKeyframeManager> | null;
		audio: ReturnType<typeof makeAudioManager> | null;
	} = {
		keyframe: null,
		audio: null,
	};
	const getCacheStats = () => {
		const {keyframe: currentKeyframeManager, audio: currentAudioManager} =
			managerInstances;

		if (currentKeyframeManager === null || currentAudioManager === null) {
			throw new Error('Media cache managers have not been initialized');
		}

		const keyframeManagerCacheStats = currentKeyframeManager.getCacheStats();
		const audioManagerCacheStats = currentAudioManager.getCacheStats();

		return {
			count: keyframeManagerCacheStats.count + audioManagerCacheStats.count,
			totalSize:
				keyframeManagerCacheStats.totalSize + audioManagerCacheStats.totalSize,
		};
	};

	const keyframeManagerInstance = makeKeyframeManager({
		getTotalCacheStats: getCacheStats,
	});
	const audioManagerInstance = makeAudioManager({
		getTotalCacheStats: getCacheStats,
	});
	managerInstances.keyframe = keyframeManagerInstance;
	managerInstances.audio = audioManagerInstance;
	let frameExtractionQueue = Promise.resolve<unknown>(undefined);
	let audioExtractionQueue = Promise.resolve<unknown>(undefined);
	let disposed = false;

	return {
		sinkManager,
		keyframeManager: keyframeManagerInstance,
		audioManager: audioManagerInstance,
		getTotalCacheStats: getCacheStats,
		isDisposed: () => disposed,
		queueFrameExtraction: <T>(extract: () => Promise<T>) => {
			const extraction = frameExtractionQueue.then(extract);
			frameExtractionQueue = extraction.catch(() => undefined);
			return extraction;
		},
		queueAudioExtraction: <T>(extract: () => Promise<T>) => {
			const extraction = audioExtractionQueue.then(extract);
			audioExtractionQueue = extraction.catch(() => undefined);
			return extraction;
		},
		dispose: (logLevel: LogLevel) => {
			if (disposed) {
				return;
			}

			disposed = true;
			try {
				keyframeManagerInstance.dispose(logLevel);
			} finally {
				try {
					audioManagerInstance.dispose();
				} finally {
					sinkManager.dispose();
				}
			}
		},
	};
};

export type MediaCache = ReturnType<typeof makeMediaCache>;

export const globalMediaCache = makeMediaCache();
export const {keyframeManager, audioManager, getTotalCacheStats} =
	globalMediaCache;

export const useRenderMediaCache = (logLevel: LogLevel): MediaCache => {
	const renderResourceManager = React.useContext(
		Internals.RenderResourceManagerContext,
	);

	if (renderResourceManager === null) {
		return globalMediaCache;
	}

	return renderResourceManager.getOrCreateResource({
		key: '@remotion/media/cache',
		create: () => {
			const resource = makeMediaCache();

			return {
				resource,
				dispose: () => resource.dispose(logLevel),
			};
		},
	});
};

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

export const useMaxMediaCacheSize = (logLevel: LogLevel) => {
	const context = React.useContext(Internals.MaxMediaCacheSizeContext);
	if (context === null) {
		return getMaxVideoCacheSize(logLevel);
	}

	return context;
};
