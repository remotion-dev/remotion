import type {EffectCatalogItem} from '@remotion/studio-shared';
import {Internals} from 'remotion';
import {getEffectPickerConfig} from './effect-picker-config';
import {
	effectPreviewLoaders,
	type EffectPreviewFactory,
} from './effect-preview-loaders';

const thumbnails = new WeakMap<
	HTMLCanvasElement,
	Map<string, HTMLCanvasElement>
>();
let renderQueue = Promise.resolve();

export const renderEffectThumbnail = ({
	snapshot,
	item,
	signal,
}: {
	readonly snapshot: HTMLCanvasElement;
	readonly item: EffectCatalogItem;
	readonly signal: AbortSignal;
}): Promise<HTMLCanvasElement | null> => {
	const render = renderQueue.then(async () => {
		if (signal.aborted) {
			return null;
		}

		const cached = thumbnails.get(snapshot)?.get(item.id);
		if (cached) {
			return cached;
		}

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

		const effect = factory(getEffectPickerConfig(item));
		const {width, height} = snapshot;
		const state = Internals.createEffectChainState(width, height);
		const output = document.createElement('canvas');
		output.width = width;
		output.height = height;
		try {
			// Pixel-based settings must match the canvas preview, so apply the
			// effect at the captured element's size before making the thumbnail.
			const completed = await Internals.runEffectChain({
				state,
				source: snapshot,
				effects: [{...effect, memoized: true}],
				output,
				width,
				height,
			});
			if (!completed || signal.aborted) {
				return null;
			}

			const thumbnail = document.createElement('canvas');
			const scale = Math.min(1, 320 / Math.max(width, height));
			thumbnail.width = Math.max(1, Math.round(width * scale));
			thumbnail.height = Math.max(1, Math.round(height * scale));
			const context = thumbnail.getContext('2d');
			if (!context) {
				return null;
			}

			context.drawImage(output, 0, 0, thumbnail.width, thumbnail.height);
			let cachedThumbnails = thumbnails.get(snapshot);
			if (!cachedThumbnails) {
				cachedThumbnails = new Map();
				thumbnails.set(snapshot, cachedThumbnails);
			}

			cachedThumbnails.set(item.id, thumbnail);
			return thumbnail;
		} finally {
			// Only the small 2D result is retained. The serial queue keeps card
			// rendering from exhausting the browser's WebGL context limit.
			Internals.cleanupEffectChainState(state);
			output.width = 0;
			output.height = 0;
		}
	});

	// A failed or unsupported effect should not block the remaining cards.
	renderQueue = render.then(
		() => undefined,
		() => undefined,
	);
	return render.catch(() => null);
};
