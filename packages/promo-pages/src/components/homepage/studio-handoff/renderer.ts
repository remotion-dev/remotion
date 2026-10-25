import {drawCodex} from './draw-codex';
import {drawEditor} from './draw-editor';
import {drawStudio, studioAssetUrls} from './draw-studio';
import {roundedRect} from './primitives';

export const STUDIO_HANDOFF_WIDTH = 1874;
export const STUDIO_HANDOFF_HEIGHT = 1020;
export const STUDIO_HANDOFF_DURATION = 12;

export type StudioHandoffAssets = Record<string, HTMLImageElement>;

let assetsPromise: Promise<StudioHandoffAssets> | null = null;

export const loadStudioHandoffAssets = (): Promise<StudioHandoffAssets> => {
	if (assetsPromise) {
		return assetsPromise;
	}

	assetsPromise = Promise.all(
		Object.entries({
			...studioAssetUrls,
			endcard:
				'https://remotion.media/homepage/studio-endcard-25914e3e08ad.jpg',
		}).map(([key, url]) => {
			return new Promise<readonly [string, HTMLImageElement]>(
				(resolve, reject) => {
					const img = new Image();
					img.crossOrigin = 'anonymous';
					img.onload = () => resolve([key, img]);
					img.onerror = () => reject(new Error(`Could not load ${url}`));
					img.src = url;
				},
			);
		}),
	)
		.then((entries) => Object.fromEntries(entries))
		.catch((error) => {
			assetsPromise = null;
			throw error;
		});
	return assetsPromise;
};

// The same cubic-bezier(0.42, 0, 0.58, 1) as the original window slides.
// Invert its x coordinate before evaluating y, without a Remotion dependency.
export const handoffEasing = (progress: number) => {
	if (progress <= 0) {
		return 0;
	}

	if (progress >= 1) {
		return 1;
	}

	let lower = 0;
	let upper = 1;
	let t = progress;
	for (let i = 0; i < 20; i++) {
		const x =
			3 * (1 - t) ** 2 * t * 0.42 + 3 * (1 - t) * t ** 2 * 0.58 + t ** 3;
		if (x < progress) {
			lower = t;
		} else {
			upper = t;
		}

		t = (lower + upper) / 2;
	}

	return 3 * (1 - t) * t ** 2 + t ** 3;
};

const frames = new WeakMap<
	HTMLCanvasElement,
	{
		assets: StudioHandoffAssets;
		width: number;
		height: number;
		key: string;
	}
>();

export const drawStudioHandoff = (
	canvas: HTMLCanvasElement,
	time: number,
	assets: StudioHandoffAssets,
) => {
	const ctx = canvas.getContext('2d');
	if (!ctx || canvas.width === 0 || canvas.height === 0) {
		return;
	}

	const seconds =
		((time % STUDIO_HANDOFF_DURATION) + STUDIO_HANDOFF_DURATION) %
		STUDIO_HANDOFF_DURATION;
	const expand = handoffEasing((seconds - 2) / 2);
	const agent = handoffEasing((seconds - 5.5) / 2);
	const reset = handoffEasing((seconds - 9) / 2);
	const responsivenessProgress = 1 - expand + agent;
	const studioLeft = 6 + 673 * (agent - reset);
	const editorLeft = 679 + 679 * (expand - reset);
	const codexLeft = -667 + 673 * (agent - reset);
	const studioWidth = 1340 - 673 * responsivenessProgress;
	// Holds make up half the loop. Keep the already drawn frame until geometry,
	// assets or output resolution changes, without allocating panel-sized textures.
	const key = `${responsivenessProgress}:${studioLeft}:${editorLeft}`;
	const previous = frames.get(canvas);
	if (
		previous?.key === key &&
		previous.assets === assets &&
		previous.width === canvas.width &&
		previous.height === canvas.height
	) {
		return;
	}

	ctx.resetTransform();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.save();
	ctx.scale(
		canvas.width / STUDIO_HANDOFF_WIDTH,
		canvas.height / STUDIO_HANDOFF_HEIGHT,
	);
	// Fit the whole device border horizontally; the bottom remains cropped.
	const deviceWidth = 1390;
	const deviceScale = STUDIO_HANDOFF_WIDTH / deviceWidth;
	ctx.scale(deviceScale, deviceScale);
	roundedRect(ctx, 0.5, 0.5, deviceWidth - 1, 797, 30, '#101114', '#35373d');
	ctx.translate(19, 19);
	roundedRect(ctx, 0, 0, 1352, 760, 12, null);
	ctx.clip();
	ctx.save();
	ctx.translate(editorLeft, 6);
	drawEditor(ctx);
	ctx.restore();
	ctx.save();
	ctx.translate(codexLeft, 6);
	drawCodex(ctx, assets);
	ctx.restore();
	ctx.save();
	ctx.translate(studioLeft, 6);
	roundedRect(ctx, 0, 0, studioWidth, 748, 6, null);
	ctx.clip();
	drawStudio(ctx, {width: studioWidth, responsivenessProgress, assets});
	roundedRect(
		ctx,
		0.5,
		0.5,
		studioWidth - 1,
		747,
		6,
		null,
		'#454545',
		667 / 720,
	);
	ctx.restore();
	ctx.restore();
	frames.set(canvas, {assets, width: canvas.width, height: canvas.height, key});
};
