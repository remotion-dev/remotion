import {
	CanvasSource,
	Graphics,
	GraphicsPath,
	Texture,
	TilingSprite,
} from 'pixi.js';
import React, {useEffect, useMemo, useRef} from 'react';
import {BLACK_ALPHA_30} from '../../helpers/colors';
import {getStudioPixelRatio} from '../../helpers/studio-pixel-ratio';
import {getTimelineLayerHeight} from '../../helpers/timeline-layout';
import type {TimelineCanvasDraw} from './TimelineCanvas';
import {
	useTimelineCanvasDrawing,
	useTimelineCanvasInvalidation,
} from './TimelineCanvas';

const HEIGHT = getTimelineLayerHeight('image');

const containerStyle: React.CSSProperties = {
	height: HEIGHT,
	width: '100%',
	display: 'flex',
	borderTopLeftRadius: 2,
	borderBottomLeftRadius: 2,
};

export const TimelineImageInfo: React.FC<{
	readonly src: string;
	readonly offsetInPixels: number;
}> = ({src, offsetInPixels}) => {
	const ref = useRef<HTMLDivElement>(null);
	const image = useRef<HTMLImageElement | null>(null);
	const bitmap = useRef<HTMLCanvasElement | null>(null);
	const revision = useRef(0);
	const invalidate = useTimelineCanvasInvalidation();
	useEffect(() => {
		const loadedImage = new Image();
		loadedImage.crossOrigin = 'anonymous';
		loadedImage.decoding = 'async';
		image.current = null;
		bitmap.current = null;
		revision.current++;
		invalidate();
		loadedImage.onload = () => {
			image.current = loadedImage;
			revision.current++;
			invalidate();
		};

		loadedImage.src = src;

		return () => {
			loadedImage.onload = null;
		};
	}, [invalidate, src]);

	const drawing = useMemo<TimelineCanvasDraw>(
		() => ({
			onScroll: false,
			get revision() {
				return `${src}:${offsetInPixels}:${revision.current}`;
			},
			// The shared renderer provides vector and child containers separately.
			// eslint-disable-next-line max-params
			draw: (graphics, width, height, resolveColor, _Text, children) => {
				for (const child of children.removeChildren()) {
					child.destroy({children: true, texture: true, textureSource: true});
				}

				const radius = Math.min(2, width / 2, height / 2);
				const shape = new GraphicsPath()
					.moveTo(radius, 0)
					.lineTo(width, 0)
					.lineTo(width, height)
					.lineTo(radius, height)
					.arcTo(0, height, 0, height - radius, radius)
					.lineTo(0, radius)
					.arcTo(0, 0, radius, 0, radius)
					.closePath();
				graphics.path(shape).fill(resolveColor(BLACK_ALPHA_30));
				const {current} = image;
				if (
					current === null ||
					current.naturalWidth === 0 ||
					current.naturalHeight === 0
				) {
					return;
				}

				// Keep the decoded source on the CPU; upload only the strip-sized tile.
				// Reuse it across crop offsets and rebuild when display density changes.
				const bitmapHeight = Math.max(
					1,
					Math.min(
						current.naturalHeight,
						Math.ceil(height * getStudioPixelRatio()),
					),
				);
				if (bitmap.current === null || bitmap.current.height !== bitmapHeight) {
					const canvas = document.createElement('canvas');
					canvas.height = bitmapHeight;
					canvas.width = Math.max(
						1,
						Math.ceil(
							(current.naturalWidth / current.naturalHeight) * bitmapHeight,
						),
					);
					const context = canvas.getContext('2d');
					if (!context) {
						throw new Error('Unable to create timeline image thumbnail');
					}

					context.imageSmoothingQuality = 'high';
					context.drawImage(current, 0, 0, canvas.width, canvas.height);
					bitmap.current = canvas;
				}

				const tile = bitmap.current;
				const sprite = new TilingSprite({
					texture: new Texture({
						source: new CanvasSource({
							resource: tile,
							width: tile.width,
							height: tile.height,
							resolution: 1,
						}),
					}),
					width,
					height,
					tilePosition: {x: -offsetInPixels, y: 0},
					tileScale: {
						x:
							(height * current.naturalWidth) /
							current.naturalHeight /
							tile.width,
						y: height / tile.height,
					},
				});
				const mask = new Graphics().path(shape).fill(0xffffff);
				sprite.mask = mask;
				children.addChild(sprite, mask);
			},
		}),
		[offsetInPixels, src],
	);
	useTimelineCanvasDrawing(ref, drawing);

	return <div ref={ref} style={containerStyle} />;
};
