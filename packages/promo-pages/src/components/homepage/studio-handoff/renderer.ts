import {getStudioHandoffFrame, type StudioHandoffLayout} from './animation';
import {drawCodex} from './draw-codex';
import {drawEditor} from './draw-editor';
import {drawStudio, studioAssetUrls} from './draw-studio';
import {roundedRect} from './primitives';

export const STUDIO_HANDOFF_WIDTH = 1874;
export const STUDIO_HANDOFF_HEIGHT = 1020;
export {STUDIO_HANDOFF_DURATION} from './animation';

export type StudioHandoffAssets = Record<string, HTMLImageElement>;

let assetPromises: Promise<readonly [string, HTMLImageElement]>[] | null = null;

export const loadStudioHandoffAssets = (
	onAssetLoad: ((key: string, image: HTMLImageElement) => void) | null,
): Promise<StudioHandoffAssets> => {
	assetPromises ??= Object.entries({
		...studioAssetUrls,
		endcard: 'https://remotion.media/homepage/studio-endcard-25914e3e08ad.jpg',
	}).map(([key, url]) => {
		return new Promise<readonly [string, HTMLImageElement]>(
			(resolve, reject) => {
				const img = new Image();
				img.crossOrigin = 'anonymous';
				img.onload = () => {
					if (key !== 'endcard') {
						resolve([key, img]);
						return;
					}

					const canvas = document.createElement('canvas');
					canvas.width = img.naturalWidth;
					canvas.height = img.naturalHeight;
					const ctx = canvas.getContext('2d');
					if (!ctx) {
						reject(new Error('Could not center the endcard presenter'));
						return;
					}

					// Center the presenter in the left 60% without moving the social panel.
					const videoWidth = canvas.width * 0.6;
					const presenterCenter = canvas.width * 0.34;
					const cropWidth = (videoWidth - presenterCenter) * 2;
					const cropHeight = canvas.height * (cropWidth / videoWidth);
					ctx.drawImage(img, 0, 0);
					ctx.drawImage(
						img,
						presenterCenter - cropWidth / 2,
						(canvas.height - cropHeight) / 2,
						cropWidth,
						cropHeight,
						0,
						0,
						videoWidth,
						canvas.height,
					);
					const centered = new Image();
					centered.onload = () => resolve([key, centered]);
					centered.onerror = () =>
						reject(new Error('Could not load the centered endcard'));
					centered.src = canvas.toDataURL();
				};

				img.onerror = () => reject(new Error(`Could not load ${url}`));
				img.src = url;
			},
		);
	});
	return Promise.all(
		assetPromises.map((promise) =>
			promise.then(([key, image]) => {
				onAssetLoad?.(key, image);
				return [key, image] as const;
			}),
		),
	)
		.then((entries) => Object.fromEntries(entries))
		.catch((error) => {
			assetPromises = null;
			throw error;
		});
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
	layout: StudioHandoffLayout | null,
) => {
	const ctx = canvas.getContext('2d');
	if (!ctx || canvas.width === 0 || canvas.height === 0) {
		return;
	}

	const {responsivenessProgress, studioLeft, editorLeft, codexLeft} =
		layout ?? getStudioHandoffFrame(time).layout;
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
