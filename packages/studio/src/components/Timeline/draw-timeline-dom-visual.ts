import {
	BlurFilter,
	type Container,
	Graphics,
	GraphicsPath,
	ImageSource,
	Sprite,
	Text,
	Texture,
} from 'pixi.js';
import type {TimelineDomVisual} from './get-timeline-dom-paint-entries';

export const drawTimelineDomVisual = ({
	graphics,
	children,
	visual,
	width,
	height,
	radius,
	resolution,
}: {
	readonly graphics: Graphics;
	readonly children: Container;
	readonly visual: TimelineDomVisual;
	readonly width: number;
	readonly height: number;
	readonly radius: number;
	readonly resolution: number;
}) => {
	if (visual.checkerboard) {
		const size = visual.checkerboard.size / 2;
		for (let y = 0; y < height; y += size) {
			for (let x = 0; x < width; x += size) {
				if ((Math.round(x / size) + Math.round(y / size)) % 2 === 0) {
					graphics
						.rect(x, y, Math.min(size, width - x), Math.min(size, height - y))
						.fill(visual.checkerboard.color);
				}
			}
		}
	}

	if (visual.image) {
		const {image} = visual;
		const contain = Math.min(width / image.width, height / image.height);
		const scale =
			image.fit === 'contain'
				? contain
				: image.fit === 'cover'
					? Math.max(width / image.width, height / image.height)
					: image.fit === 'scale-down'
						? Math.min(1, contain)
						: 1;
		const imageWidth = image.fit === 'fill' ? width : image.width * scale;
		const imageHeight = image.fit === 'fill' ? height : image.height * scale;
		const position = image.position.split(/\s+/);
		const [x, y] = [width - imageWidth, height - imageHeight].map(
			(remaining, index) =>
				parseFloat(position[index]) *
				(position[index].endsWith('%') ? remaining / 100 : 1),
		);
		const sprite = new Sprite(
			new Texture({source: new ImageSource({resource: image.getResource()})}),
		);
		sprite.position.set(x, y);
		sprite.width = imageWidth;
		sprite.height = imageHeight;
		const mask = new Graphics()
			.roundRect(0, 0, width, height, radius)
			.fill(0xffffff);
		sprite.mask = mask;
		children.addChild(sprite, mask);
	}

	const {borders, outline} = visual;
	const uniformBorder = borders.every(
		(border) =>
			border.width === borders[0].width &&
			border.color === borders[0].color &&
			border.style === borders[0].style,
	);
	if (uniformBorder && borders[0].width > 0 && borders[0].style !== 'none') {
		const border = borders[0];
		graphics
			.roundRect(
				border.width / 2,
				border.width / 2,
				Math.max(0, width - border.width),
				Math.max(0, height - border.width),
				Math.max(0, radius - border.width / 2),
			)
			.stroke({width: border.width, color: border.color});
	} else {
		for (let side = 0; side < 4; side++) {
			const border = borders[side];
			if (
				border.width <= 0 ||
				border.style === 'none' ||
				border.style === 'hidden'
			)
				continue;
			const points =
				side === 0
					? [
							0,
							0,
							width,
							0,
							width - borders[1].width,
							border.width,
							borders[3].width,
							border.width,
						]
					: side === 1
						? [
								width,
								0,
								width,
								height,
								width - border.width,
								height - borders[2].width,
								width - border.width,
								borders[0].width,
							]
						: side === 2
							? [
									0,
									height,
									width,
									height,
									width - borders[1].width,
									height - border.width,
									borders[3].width,
									height - border.width,
								]
							: [
									0,
									0,
									border.width,
									borders[0].width,
									border.width,
									height - borders[2].width,
									0,
									height,
								];
			graphics.poly(points).fill(border.color);
		}
	}

	if (outline) {
		const offset = outline.offset + outline.width / 2;
		graphics
			.roundRect(
				-offset,
				-offset,
				width + offset * 2,
				height + offset * 2,
				Math.max(0, radius + offset),
			)
			.stroke({width: outline.width, color: outline.color});
	}

	// Studio's selection rings use inset shadows. Soft outer shadows remain
	// vector rings with decreasing alpha, so they do not need DOM rasterization.
	const shadowPattern =
		/(rgba?\([^)]+\)|#[\da-f]+)\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+(-?[\d.]+)px(?:\s+(-?[\d.]+)px)?(\s+inset)?/gi;
	const insetOffsets = new Set<string>();
	for (const shadow of visual.shadow.matchAll(shadowPattern)) {
		const color = shadow[1];
		const x = Number(shadow[2]);
		const y = Number(shadow[3]);
		const blur = Number(shadow[4]);
		const spread = Number(shadow[5] ?? 0);
		const inset = Boolean(shadow[6]);
		if (inset) {
			if (blur === 0 && spread === 0) {
				// FOCUS_BOX_SHADOW uses four one-pixel offset inset shadows.
				// Their exposed edges form the same rounded inner ring.
				const focusThickness = Math.max(Math.abs(x), Math.abs(y));
				const key = `${color}:${focusThickness}`;
				if (focusThickness > 0 && !insetOffsets.has(key)) {
					insetOffsets.add(key);
					graphics
						.roundRect(
							focusThickness / 2,
							focusThickness / 2,
							Math.max(0, width - focusThickness),
							Math.max(0, height - focusThickness),
							Math.max(0, radius - focusThickness / 2),
						)
						.stroke({width: focusThickness, color});
				}

				continue;
			}

			const thickness = Math.max(0, spread + blur / 2);
			if (thickness > 0)
				graphics
					.roundRect(
						x + thickness / 2,
						y + thickness / 2,
						Math.max(0, width - thickness),
						Math.max(0, height - thickness),
						Math.max(0, radius - thickness / 2),
					)
					.stroke({width: thickness, color});
		} else {
			const rings = blur > 0 ? 6 : 1;
			for (let ring = rings; ring > 0; ring--) {
				const offset = spread + (blur * ring) / rings / 2;
				graphics
					.roundRect(
						x - offset,
						y - offset,
						width + offset * 2,
						height + offset * 2,
						Math.max(0, radius + offset),
					)
					.stroke({width: Math.max(1, blur / rings), color, alpha: 1 / rings});
			}
		}
	}

	for (const path of visual.paths) {
		const target = new Graphics();
		target.setTransform(...path.matrix).path(new GraphicsPath(path.path, true));
		if (path.fill !== 'none' && path.fillAlpha > 0)
			target.fill({color: path.fill, alpha: path.fillAlpha});
		if (path.stroke !== 'none' && path.strokeWidth > 0 && path.strokeAlpha > 0)
			target.stroke({
				color: path.stroke,
				alpha: path.strokeAlpha,
				width: path.strokeWidth,
				cap:
					path.lineCap === 'round'
						? 'round'
						: path.lineCap === 'square'
							? 'square'
							: 'butt',
				join:
					path.lineJoin === 'round'
						? 'round'
						: path.lineJoin === 'bevel'
							? 'bevel'
							: 'miter',
			});
		target.resetTransform();
		if (path.blur > 0) {
			const filter = new BlurFilter({strength: path.blur, quality: 3});
			target.filters = [filter];
			target.on('destroyed', () => filter.destroy());
		}

		children.addChild(target);
	}

	if (visual.range) {
		const thumbRadius = 7;
		graphics
			.circle(
				thumbRadius +
					Math.max(0, width - thumbRadius * 2) * visual.range.progress,
				height / 2,
				thumbRadius,
			)
			.fill(visual.range.color);
	}

	if (visual.selection) {
		const {selection} = visual;
		graphics
			.rect(selection.x, selection.y, selection.width, selection.height)
			.fill(selection.color);
	}

	for (const run of visual.texts) {
		const text = new Text({
			text: run.text,
			resolution,
			style: {
				fontFamily: run.fontFamily
					.split(',')
					.map((family) => family.trim().replace(/^['"]|['"]$/g, '')),
				fontSize: run.fontSize,
				fontWeight: run.fontWeight as 'normal',
				fontStyle: run.fontStyle as 'normal',
				letterSpacing: run.letterSpacing,
				fill: run.color,
				padding: 1,
			},
		});
		text.position.set(run.x, run.y + (run.height - text.height) / 2);
		children.addChild(text);
		if (run.decoration.includes('underline'))
			graphics
				.moveTo(run.x, run.y + run.height - 1)
				.lineTo(run.x + text.width, run.y + run.height - 1)
				.stroke({color: run.color, width: 1});
		if (run.decoration.includes('line-through'))
			graphics
				.moveTo(run.x, run.y + run.height / 2)
				.lineTo(run.x + text.width, run.y + run.height / 2)
				.stroke({color: run.color, width: 1});
	}

	if (visual.caret) {
		const {caret} = visual;
		graphics.rect(caret.x, caret.y, 1, caret.height).fill(caret.color);
	}

	if (visual.scrollbar) {
		const {
			left,
			width: visibleWidth,
			totalWidth,
		} = visual.scrollbar.getScroll();
		const thumbWidth = Math.max(20, (visibleWidth * visibleWidth) / totalWidth);
		const x =
			(left / (totalWidth - visibleWidth)) * (visibleWidth - thumbWidth);
		graphics
			.rect(
				x,
				height - visual.scrollbar.thickness,
				thumbWidth,
				visual.scrollbar.thickness,
			)
			.fill(visual.scrollbar.color);
	}
};
