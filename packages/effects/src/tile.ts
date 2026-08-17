import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertEffectParamsObject,
	assertOptionalBoolean,
} from './validate-effect-param.js';

const {createEffect} = Internals;

const DEFAULT_HORIZONTAL = true as const;
const DEFAULT_VERTICAL = true as const;

const tileSchema = {
	horizontal: {
		type: 'boolean',
		default: DEFAULT_HORIZONTAL,
		description: 'Horizontal',
	},
	vertical: {
		type: 'boolean',
		default: DEFAULT_VERTICAL,
		description: 'Vertical',
	},
} as const satisfies InteractivitySchema;

export type TileParams = {
	/** Whether to repeat the source horizontally. Defaults to `true`. */
	readonly horizontal?: boolean;
	/** Whether to repeat the source vertically. Defaults to `true`. */
	readonly vertical?: boolean;
};

type TileResolved = {
	readonly horizontal: boolean;
	readonly vertical: boolean;
};

type TileState = {
	readonly boundsCanvas: HTMLCanvasElement;
	readonly boundsContext: CanvasRenderingContext2D;
	readonly tileCanvas: HTMLCanvasElement;
	readonly tileContext: CanvasRenderingContext2D;
};

const resolve = (params: TileParams): TileResolved => ({
	horizontal: params.horizontal ?? DEFAULT_HORIZONTAL,
	vertical: params.vertical ?? DEFAULT_VERTICAL,
});

const validateTileParams = (params: TileParams): void => {
	assertEffectParamsObject(params, 'Tile');
	assertOptionalBoolean(params.horizontal, 'horizontal');
	assertOptionalBoolean(params.vertical, 'vertical');
};

export const tile = createEffect<TileParams, TileState>({
	type: 'dev.remotion.effects.tile',
	label: 'tile()',
	documentationLink: 'https://www.remotion.dev/docs/effects/tile',
	backend: '2d',
	calculateKey: (params) => {
		const r = resolve(params);
		return `tile-${r.horizontal}-${r.vertical}`;
	},
	setup: (target) => {
		const boundsCanvas = target.ownerDocument.createElement('canvas');
		const boundsContext = boundsCanvas.getContext('2d', {
			colorSpace: 'srgb',
			willReadFrequently: true,
		});
		if (!boundsContext) {
			throw new Error('Failed to acquire 2D context for tile effect.');
		}

		const tileCanvas = target.ownerDocument.createElement('canvas');
		const tileContext = tileCanvas.getContext('2d');
		if (!tileContext) {
			throw new Error('Failed to acquire 2D context for tile effect.');
		}

		return {boundsCanvas, boundsContext, tileCanvas, tileContext};
	},
	apply: ({source, target, width, height, params, state}) => {
		const context = target.getContext('2d');
		if (!context) {
			throw new Error(
				'Failed to acquire 2D context for tile effect. The canvas may have been assigned a different context type.',
			);
		}

		const r = resolve(params);
		context.clearRect(0, 0, width, height);

		if (!r.horizontal && !r.vertical) {
			context.drawImage(source, 0, 0, width, height);
			return;
		}

		if (
			state.boundsCanvas.width !== width ||
			state.boundsCanvas.height !== height
		) {
			state.boundsCanvas.width = width;
			state.boundsCanvas.height = height;
		}

		state.boundsContext.clearRect(0, 0, width, height);
		state.boundsContext.drawImage(source, 0, 0, width, height);
		const pixels = state.boundsContext.getImageData(0, 0, width, height).data;
		const rowHasVisiblePixel = (y: number) => {
			for (let x = 0; x < width; x++) {
				if (pixels[(y * width + x) * 4 + 3] !== 0) {
					return true;
				}
			}

			return false;
		};

		const columnHasVisiblePixel = (
			x: number,
			visibleTop: number,
			visibleBottom: number,
		) => {
			for (let y = visibleTop; y <= visibleBottom; y++) {
				if (pixels[(y * width + x) * 4 + 3] !== 0) {
					return true;
				}
			}

			return false;
		};

		let top = 0;
		while (top < height && !rowHasVisiblePixel(top)) {
			top++;
		}

		if (top === height) {
			context.clearRect(0, 0, width, height);
			return;
		}

		let bottom = height - 1;
		while (bottom > top && !rowHasVisiblePixel(bottom)) {
			bottom--;
		}

		let left = 0;
		while (left < width && !columnHasVisiblePixel(left, top, bottom)) {
			left++;
		}

		let right = width - 1;
		while (right > left && !columnHasVisiblePixel(right, top, bottom)) {
			right--;
		}

		const tileWidth = right - left + 1;
		const tileHeight = bottom - top + 1;
		state.tileCanvas.width = tileWidth;
		state.tileCanvas.height = tileHeight;
		state.tileContext.clearRect(0, 0, tileWidth, tileHeight);
		state.tileContext.drawImage(
			source,
			left,
			top,
			tileWidth,
			tileHeight,
			0,
			0,
			tileWidth,
			tileHeight,
		);

		context.clearRect(0, 0, width, height);
		const startX = r.horizontal
			? left - Math.ceil(left / tileWidth) * tileWidth
			: left;
		const startY = r.vertical
			? top - Math.ceil(top / tileHeight) * tileHeight
			: top;
		const endX = r.horizontal ? width : left + tileWidth;
		const endY = r.vertical ? height : top + tileHeight;

		for (let y = startY; y < endY; y += tileHeight) {
			for (let x = startX; x < endX; x += tileWidth) {
				context.drawImage(state.tileCanvas, x, y);
			}
		}
	},
	cleanup: () => undefined,
	schema: tileSchema,
	validateParams: validateTileParams,
});
