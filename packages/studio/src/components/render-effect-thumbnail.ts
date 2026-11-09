import type {EffectCatalogItem} from '@remotion/studio-shared';
import {Internals} from 'remotion';
import {getEffectPickerConfig} from './effect-picker-config';
import type {EffectPreviewFactory} from './effect-preview-loaders';

const thumbnails = new WeakMap<
	HTMLCanvasElement,
	{
		source: HTMLCanvasElement;
		images: Map<string, HTMLCanvasElement>;
	}
>();
let renderQueue = Promise.resolve();

export const getCachedEffectThumbnail = (
	snapshot: HTMLCanvasElement | null,
	effectId: string,
): HTMLCanvasElement | null => {
	return snapshot === null
		? null
		: (thumbnails.get(snapshot)?.images.get(effectId) ?? null);
};

export const renderEffectThumbnail = ({
	snapshot,
	item,
	signal,
}: {
	readonly snapshot: HTMLCanvasElement;
	readonly item: EffectCatalogItem;
	readonly signal: AbortSignal;
}): Promise<HTMLCanvasElement | null> => {
	if (signal.aborted) {
		return Promise.resolve(null);
	}

	const cached = getCachedEffectThumbnail(snapshot, item.id);
	if (cached) {
		return Promise.resolve(cached);
	}

	const render = renderQueue.then(async () => {
		if (signal.aborted) {
			return null;
		}

		const queuedCached = getCachedEffectThumbnail(snapshot, item.id);
		if (queuedCached) {
			return queuedCached;
		}

		await new Promise<void>((resolve) => {
			requestAnimationFrame(() => setTimeout(resolve, 0));
		});
		if (signal.aborted) {
			return null;
		}

		const {effectPreviewLoaders} = await import('./effect-preview-loaders');
		const load = effectPreviewLoaders[item.effect.importPath];
		if (!load) {
			return null;
		}

		const module = await load();
		if (signal.aborted) {
			return null;
		}

		const factory = module[item.effect.name] as
			| EffectPreviewFactory
			| undefined;
		if (typeof factory !== 'function') {
			return null;
		}

		let cache = thumbnails.get(snapshot);
		if (!cache) {
			const source = document.createElement('canvas');
			const scale = Math.min(
				1,
				320 / Math.max(snapshot.width, snapshot.height),
			);
			source.width = Math.max(1, Math.round(snapshot.width * scale));
			source.height = Math.max(1, Math.round(snapshot.height * scale));
			const context = source.getContext('2d');
			if (!context) {
				return null;
			}

			context.drawImage(snapshot, 0, 0, source.width, source.height);
			cache = {source, images: new Map()};
			thumbnails.set(snapshot, cache);
		}

		const effect = factory(getEffectPickerConfig(item));
		const {width, height} = cache.source;
		const state = Internals.createEffectChainState(width, height);
		const output = document.createElement('canvas');
		output.width = width;
		output.height = height;
		let retained = false;
		try {
			const completed = await Internals.runEffectChain({
				state,
				source: cache.source,
				effects: [{...effect, memoized: true}],
				output,
				width,
				height,
			});
			if (!completed || signal.aborted) {
				return null;
			}

			cache.images.set(item.id, output);
			retained = true;
			return output;
		} finally {
			Internals.cleanupEffectChainState(state);
			if (!retained) {
				output.width = 0;
				output.height = 0;
			}
		}
	});

	// A failed or unsupported effect should not block the remaining cards.
	renderQueue = render.then(
		() => undefined,
		() => undefined,
	);
	return render.catch(() => null);
};
