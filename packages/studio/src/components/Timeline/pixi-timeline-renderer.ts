import {
	Color,
	Container,
	FillGradient,
	FillPattern,
	Graphics,
	GraphicsPath,
	Matrix,
	RenderTexture,
	Sprite,
	Text,
	Texture,
	WebGLRenderer,
} from 'pixi.js';
import {Easing} from 'remotion';
import {drawTimelineDomVisual} from './draw-timeline-dom-visual';
import type {TimelineDomVisual} from './get-timeline-dom-paint-entries';

export type TimelineCanvasDraw = {
	readonly revision: unknown;
	readonly onScroll: boolean;
	readonly draw: (
		graphics: Graphics,
		width: number,
		height: number,
		resolveColor: (color: string) => string,
		TextClass: typeof Text,
		children: Container,
	) => void;
};

export type TimelineReorderPreview = {
	readonly move: (deltaX: number) => void;
	readonly destroy: () => void;
};

export type TimelineSceneTransition = {
	readonly captureNext: () => void;
	readonly advance: (elapsed: number) => boolean;
	readonly destroy: () => void;
};

type TimelineSnapshotRect = {
	readonly x: number;
	readonly y: number;
	readonly width: number;
	readonly height: number;
};

export type TimelinePaintNode = {
	readonly id: object;
	readonly x: number;
	readonly y: number;
	readonly width: number;
	readonly height: number;
	readonly opacity: number;
	readonly background: string;
	readonly drawing: TimelineCanvasDraw | null;
	readonly dom: TimelineDomVisual | null;
	readonly resolveColor: (color: string) => string;
	readonly radii: {
		readonly topLeft: number;
		readonly topRight: number;
		readonly bottomLeft: number;
		readonly bottomRight: number;
	};
	// Clip coordinates use the same timeline space as x and y.
	readonly clip: {
		readonly left: number;
		readonly top: number;
		readonly right: number;
		readonly bottom: number;
	} | null;
	readonly pathClips: readonly {
		readonly x: number;
		readonly y: number;
		readonly path: string;
	}[];
};

type Background =
	| {readonly type: 'solid'; readonly color: string}
	| {
			readonly type: 'gradient';
			readonly direction: 'top' | 'bottom' | 'left' | 'right' | '-45deg';
			readonly stops: readonly {
				readonly color: string;
				readonly position: number | null;
				readonly unit: '%' | 'px';
			}[];
	  };

// Commas inside CSS color and gradient functions do not separate layers.
const splitCssList = (value: string): string[] | null => {
	const parts: string[] = [];
	let depth = 0;
	let start = 0;
	for (let index = 0; index < value.length; index++) {
		const character = value[index];
		if (character === '(') {
			depth++;
		} else if (character === ')') {
			depth--;
		} else if (character === ',' && depth === 0) {
			parts.push(value.slice(start, index).trim());
			start = index + 1;
		}

		if (depth < 0) {
			return null;
		}
	}

	if (depth !== 0) {
		return null;
	}

	parts.push(value.slice(start).trim());
	return parts;
};

const parseBackgroundLayer = (value: string): Background | null => {
	if (value === 'none') {
		return {type: 'solid', color: '#00000000'};
	}

	const gradient = /^(repeating-)?linear-gradient\(([\s\S]*)\)$/.exec(value);
	if (gradient === null) {
		try {
			return {type: 'solid', color: new Color(value).toHexa()};
		} catch {
			return null;
		}
	}

	const parts = splitCssList(gradient[2]);
	if (parts === null) {
		return null;
	}

	let direction: Extract<Background, {type: 'gradient'}>['direction'] =
		'bottom';
	if (gradient[1]) {
		if (parts.shift() !== '-45deg') {
			return null;
		}

		direction = '-45deg';
	} else if (parts[0]?.startsWith('to ')) {
		const specifiedDirection = parts.shift()?.slice(3);
		if (
			specifiedDirection !== 'top' &&
			specifiedDirection !== 'bottom' &&
			specifiedDirection !== 'left' &&
			specifiedDirection !== 'right'
		) {
			return null;
		}

		direction = specifiedDirection;
	}

	const stops: Extract<Background, {type: 'gradient'}>['stops'][number][] = [];
	for (const part of parts) {
		const stop =
			/^(.*?)\s+(-?(?:\d*\.)?\d+)(%|px)?(?:\s+(-?(?:\d*\.)?\d+)(%|px)?)?$/.exec(
				part,
			);
		try {
			const color = new Color(stop?.[1] ?? part).toHexa();
			if (stop === null) {
				stops.push({color, position: null, unit: '%'});
				continue;
			}

			for (const index of stop[4] === undefined ? [2] : [2, 4]) {
				const position = Number(stop[index]);
				const unit = stop[index + 1];
				if (unit === undefined && position !== 0) {
					return null;
				}

				stops.push({color, position, unit: unit === '%' ? '%' : 'px'});
			}
		} catch {
			return null;
		}
	}

	if (stops.length < 2) {
		return null;
	}

	if (
		direction === '-45deg' &&
		(stops.some((stop, index) =>
			index === 0 && stop.position === null
				? false
				: stop.unit !== 'px' || stop.position === null,
		) ||
			(stops.at(-1)?.position ?? 0) <= (stops[0].position ?? 0))
	) {
		return null;
	}

	return {type: 'gradient', direction, stops};
};

const parseBackground = (background: string): Background[] | null => {
	const layers = splitCssList(background.trim());
	if (layers === null) {
		return null;
	}

	const result: Background[] = [];
	for (const layer of layers) {
		const parsed = parseBackgroundLayer(layer);
		if (parsed === null) {
			return null;
		}

		result.push(parsed);
	}

	return result;
};

type PaintedNode = {
	readonly container: Container;
	readonly content: Container;
	readonly graphics: Graphics;
	readonly drawingChildren: Container;
	readonly domGraphics: Graphics;
	readonly domChildren: Container;
	domMask: Sprite | null;
	readonly clip: Graphics;
	readonly pathClips: {
		readonly container: Container;
		readonly mask: Graphics;
		path: string | null;
	}[];
	backgroundKey: string;
	domKey: string;
	scrollRevision: number | null;
	hasDrawing: boolean;
	drawingRevision: unknown;
	resolveColor: ((color: string) => string) | null;
	readonly resolvedColors: Map<string, string>;
	clipKey: string;
	readonly fills: (FillGradient | FillPattern)[];
};

const destroyPaintedNode = (painted: PaintedNode) => {
	painted.container.destroy({
		children: true,
		texture: true,
		textureSource: true,
	});
	for (const fill of painted.fills) {
		fill.destroy();
	}
};

export const createPixiTimelineRenderer = async (
	canvas: HTMLCanvasElement,
): Promise<{
	render: (
		nodes: readonly TimelinePaintNode[],
		viewport: {
			readonly width: number;
			readonly height: number;
			readonly left: number;
			readonly top: number;
			readonly resolution: number;
			readonly scrollRevision: number;
		},
	) => void;
	createPreview: (rect: TimelineSnapshotRect) => TimelineReorderPreview | null;
	createSceneTransition: (
		panels: readonly (TimelineSnapshotRect & {
			readonly background: string;
			readonly slideDistance: number;
		})[],
		direction: 'forward' | 'backward',
	) => TimelineSceneTransition;
	destroy: () => void;
}> => {
	const renderer = new WebGLRenderer();
	try {
		await renderer.init({
			canvas,
			width: 1,
			height: 1,
			backgroundAlpha: 0,
			antialias: true,
			autoDensity: true,
			gcActive: false,
		});
	} catch (error) {
		renderer.scheduler?.destroy();
		renderer.events?.destroy();
		try {
			renderer.destroy({removeView: false});
		} catch {
			// Initialization can reject before every renderer system is ready.
		}

		throw error;
	}

	// This renderer only paints after timeline invalidations. Pixi's scheduler
	// and pointer event system otherwise keep the shared system ticker running.
	renderer.scheduler.destroy();
	renderer.events.destroy();
	const stage = new Container({eventMode: 'none', interactiveChildren: false});
	const scene = new Container({eventMode: 'none', interactiveChildren: false});
	const overlays = new Container({
		eventMode: 'none',
		interactiveChildren: false,
	});
	scene.addChild(stage, overlays);
	const paintedNodes = new Map<object, PaintedNode>();
	const transitions = new Set<() => void>();
	let preview: Sprite | null = null;
	let destroyed = false;
	const captureRegion = (rect: TimelineSnapshotRect) => {
		const texture = RenderTexture.create({
			width: rect.width,
			height: rect.height,
			resolution: renderer.resolution,
			antialias: true,
		});
		const overlaysVisible = overlays.visible;
		overlays.visible = false;
		try {
			// Capture only the live timeline, excluding drag/transition overlays.
			renderer.render({
				container: scene,
				target: texture,
				transform: new Matrix().translate(-rect.x, -rect.y),
				clear: true,
				clearColor: [0, 0, 0, 0],
			});
		} catch (error) {
			texture.destroy(true);
			throw error;
		} finally {
			overlays.visible = overlaysVisible;
		}

		return texture;
	};

	return {
		createSceneTransition: (panels, direction) => {
			const ease = Easing.bezier(0.42, 0, 0.58, 1);
			const sign = direction === 'forward' ? 1 : -1;
			const captured = panels.map((panel) => {
				const container = new Container();
				container.position.set(panel.x, panel.y);
				const mask = new Graphics()
					.rect(0, 0, panel.width, panel.height)
					.fill(0xffffff);
				const background = new Graphics()
					.rect(0, 0, panel.width, panel.height)
					.fill({
						color: panel.background,
						alpha: 1,
					});
				const old = new Sprite(captureRegion(panel));
				container.addChild(background, old, mask);
				container.mask = mask;
				overlays.addChild(container);
				return {panel, container, old, next: null as Sprite | null};
			});
			let finished = false;
			const finish = () => {
				if (finished) return;
				finished = true;
				for (const entry of captured) {
					entry.old.destroy({texture: true, textureSource: true});
					entry.next?.destroy({texture: true, textureSource: true});
					entry.container.destroy({children: true, context: true});
				}

				transitions.delete(finish);
			};

			transitions.add(finish);
			return {
				captureNext: () => {
					if (finished) return;
					for (const entry of captured) {
						const next = new Sprite(captureRegion(entry.panel));
						next.alpha = 0;
						entry.container.addChild(next);
						entry.next = next;
					}
				},
				advance: (elapsed) => {
					if (finished || elapsed >= 150) return false;
					const progress = ease(Math.max(0, Math.min(1, (elapsed % 75) / 75)));
					for (const entry of captured) {
						entry.old.alpha = elapsed < 75 ? 1 - progress : 0;
						entry.old.x = -sign * entry.panel.slideDistance * progress;
						if (entry.next) {
							entry.next.alpha = elapsed < 75 ? 0 : progress;
							entry.next.x = sign * entry.panel.slideDistance * (1 - progress);
						}
					}

					return true;
				},
				destroy: finish,
			};
		},
		createPreview: (rect) => {
			if (destroyed || rect.width <= 0 || rect.height <= 0) {
				return null;
			}

			preview?.destroy({texture: true, textureSource: true});
			const texture = captureRegion(rect);
			const sprite = new Sprite(texture);
			sprite.position.set(rect.x, rect.y);
			sprite.alpha = 0.8;
			overlays.addChild(sprite);
			preview = sprite;
			return {
				move: (deltaX) => {
					if (!sprite.destroyed) sprite.x = rect.x + deltaX;
				},
				destroy: () => {
					if (!sprite.destroyed) {
						sprite.destroy({texture: true, textureSource: true});
					}

					if (preview === sprite) preview = null;
				},
			};
		},
		render: (nodes, viewport) => {
			if (destroyed) {
				return;
			}

			const width = Math.max(1, viewport.width);
			const height = Math.max(1, viewport.height);
			if (
				renderer.screen.width !== width ||
				renderer.screen.height !== height ||
				renderer.resolution !== viewport.resolution
			) {
				renderer.resize(width, height, viewport.resolution);
			}

			stage.position.set(-viewport.left, -viewport.top);
			const present = new Set<object>();
			let childIndex = 0;
			for (const node of nodes) {
				present.add(node.id);
				let painted = paintedNodes.get(node.id);
				if (painted === undefined) {
					const container = new Container();
					const content = new Container();
					const graphics = new Graphics();
					const drawingChildren = new Container();
					const domGraphics = new Graphics();
					const domChildren = new Container();
					const clipGraphics = new Graphics();
					clipGraphics.visible = false;
					content.addChild(graphics, drawingChildren, domGraphics, domChildren);
					container.addChild(content, clipGraphics);
					stage.addChild(container);
					painted = {
						container,
						content,
						graphics,
						drawingChildren,
						domGraphics,
						domChildren,
						domMask: null,
						clip: clipGraphics,
						pathClips: [],
						backgroundKey: '',
						domKey: '',
						scrollRevision: null,
						hasDrawing: false,
						drawingRevision: null,
						resolveColor: null,
						resolvedColors: new Map(),
						clipKey: '',
						fills: [],
					};
					paintedNodes.set(node.id, painted);
				}

				if (stage.children[childIndex] !== painted.container) {
					stage.setChildIndex(painted.container, childIndex);
				}

				childIndex++;
				painted.container.position.set(node.x, node.y);
				painted.container.alpha = node.opacity;
				painted.container.visible =
					node.width > 0 &&
					node.height > 0 &&
					node.opacity > 0 &&
					node.x < viewport.left + width &&
					node.x + node.width > viewport.left &&
					node.y < viewport.top + height &&
					node.y + node.height > viewport.top;
				if (!painted.container.visible) {
					continue;
				}

				const backgroundKey = JSON.stringify([
					node.background,
					node.width,
					node.height,
					node.radii,
					node.drawing === null ? null : viewport.resolution,
				]);
				const colorsChanged =
					node.drawing !== null &&
					painted.resolveColor !== node.resolveColor &&
					[...painted.resolvedColors].some(
						([color, resolved]) => node.resolveColor(color) !== resolved,
					);
				painted.resolveColor = node.resolveColor;
				if (
					painted.backgroundKey !== backgroundKey ||
					painted.hasDrawing !== (node.drawing !== null) ||
					painted.drawingRevision !== node.drawing?.revision ||
					colorsChanged ||
					(node.drawing?.onScroll &&
						painted.scrollRevision !== viewport.scrollRevision)
				) {
					if (
						painted.drawingRevision !== node.drawing?.revision ||
						painted.hasDrawing !== (node.drawing !== null)
					) {
						for (const child of painted.drawingChildren.removeChildren()) {
							child.destroy({
								children: true,
								texture: true,
								textureSource: true,
							});
						}
					}

					painted.backgroundKey = backgroundKey;
					painted.scrollRevision = viewport.scrollRevision;
					painted.hasDrawing = node.drawing !== null;
					painted.drawingRevision = node.drawing?.revision;
					painted.resolvedColors.clear();
					painted.graphics.clear();
					for (const fill of painted.fills) {
						fill.destroy();
					}

					painted.fills.length = 0;
					if (node.drawing !== null) {
						node.drawing.draw(
							painted.graphics,
							node.width,
							node.height,
							(color) => {
								const resolved = node.resolveColor(color);
								painted.resolvedColors.set(color, resolved);
								return resolved;
							},
							Text,
							painted.drawingChildren,
						);
					} else {
						const backgrounds = parseBackground(node.background);
						if (backgrounds === null) {
							throw new Error(
								`Unsupported timeline background: ${node.background}`,
							);
						}

						let topLeft = Math.max(0, node.radii.topLeft);
						let topRight = Math.max(0, node.radii.topRight);
						let bottomLeft = Math.max(0, node.radii.bottomLeft);
						let bottomRight = Math.max(0, node.radii.bottomRight);
						// CSS scales all corners together when neighboring radii overlap.
						const radiusScale = Math.min(
							1,
							node.width / (topLeft + topRight),
							node.width / (bottomLeft + bottomRight),
							node.height / (topLeft + bottomLeft),
							node.height / (topRight + bottomRight),
						);
						topLeft *= radiusScale;
						topRight *= radiusScale;
						bottomLeft *= radiusScale;
						bottomRight *= radiusScale;
						const shape = new GraphicsPath()
							.moveTo(topLeft, 0)
							.lineTo(node.width - topRight, 0)
							.arcTo(node.width, 0, node.width, topRight, topRight)
							.lineTo(node.width, node.height - bottomRight)
							.arcTo(
								node.width,
								node.height,
								node.width - bottomRight,
								node.height,
								bottomRight,
							)
							.lineTo(bottomLeft, node.height)
							.arcTo(0, node.height, 0, node.height - bottomLeft, bottomLeft)
							.lineTo(0, topLeft)
							.arcTo(0, 0, topLeft, 0, topLeft)
							.closePath();

						// CSS paints the first background layer above subsequent layers.
						for (const background of backgrounds.reverse()) {
							if (background.type === 'solid') {
								painted.graphics.path(shape).fill(background.color);
							} else if (background.direction === '-45deg') {
								const first = background.stops[0].position ?? 0;
								const period = (background.stops.at(-1)?.position ?? 0) - first;
								const tile = document.createElement('canvas');
								tile.width = 64;
								tile.height = 64;
								const context = tile.getContext('2d');
								if (context === null) {
									throw new Error('Unable to create timeline stripe texture');
								}

								const gradient = context.createLinearGradient(0, 0, 64, 64);
								for (let repeat = 0; repeat < 2; repeat++) {
									for (const stop of background.stops) {
										gradient.addColorStop(
											(repeat +
												Math.max(
													0,
													Math.min(1, ((stop.position ?? 0) - first) / period),
												)) /
												2,
											stop.color,
										);
									}
								}

								context.fillStyle = gradient;
								context.fillRect(0, 0, 64, 64);
								const tileSize = period * Math.SQRT2;
								const pattern = new FillPattern({
									texture: Texture.from(tile),
									repetition: 'repeat',
									textureSpace: 'global',
								});
								pattern.setTransform(
									new Matrix(
										-tileSize / 64,
										0,
										0,
										-tileSize / 64,
										node.width - first / Math.SQRT2,
										node.height - first / Math.SQRT2,
									),
								);
								painted.fills.push(pattern);
								painted.graphics.path(shape).fill(pattern);
							} else {
								const horizontal =
									background.direction === 'left' ||
									background.direction === 'right';
								const length = horizontal ? node.width : node.height;
								const offsets = background.stops.map((stop) =>
									stop.position === null
										? null
										: stop.position / (stop.unit === '%' ? 100 : length),
								);
								offsets[0] ??= 0;
								offsets[offsets.length - 1] ??= 1;
								let previous = offsets[0] ?? 0;
								for (let index = 1; index < offsets.length; index++) {
									if (offsets[index] !== null) {
										offsets[index] = Math.max(
											previous,
											offsets[index] ?? previous,
										);
										previous = offsets[index] ?? previous;
									}
								}

								for (let index = 1; index < offsets.length - 1; index++) {
									if (offsets[index] !== null) {
										continue;
									}

									let nextExplicitIndex = index + 1;
									while (offsets[nextExplicitIndex] === null) {
										nextExplicitIndex++;
									}

									const from = offsets[index - 1] ?? 0;
									const to = offsets[nextExplicitIndex] ?? 1;
									for (
										let interpolated = index;
										interpolated < nextExplicitIndex;
										interpolated++
									) {
										offsets[interpolated] =
											from +
											((to - from) * (interpolated - index + 1)) /
												(nextExplicitIndex - index + 1);
									}

									index = nextExplicitIndex;
								}

								// Clamp outside the actual stop range instead of stretching the
								// small texture over a long clip's constant-color remainder.
								// This preserves the 2px trim highlight even at maximum zoom.
								const firstOffset = offsets[0] ?? 0;
								const lastOffset = offsets.at(-1) ?? 1;
								// Include the colors on both sides of hard stops in the edge
								// texels, so clamping does not extend the preceding color.
								const padding = Math.max(
									(lastOffset - firstOffset) / 254,
									1 / (length * viewport.resolution * 256),
								);
								const start = firstOffset - padding;
								const end = lastOffset + padding;
								const reverse =
									background.direction === 'top' ||
									background.direction === 'left';
								const gradientStart = reverse ? 1 - end : start;
								const gradientEnd = reverse ? 1 - start : end;
								const gradientFill = new FillGradient({
									start: {
										x: horizontal ? gradientStart : 0,
										y: horizontal ? 0 : gradientStart,
									},
									end: {
										x: horizontal ? gradientEnd : 0,
										y: horizontal ? 0 : gradientEnd,
									},
									colorStops: background.stops.map((stop, index) => ({
										offset: ((offsets[index] ?? 0) - start) / (end - start),
										color: stop.color,
									})),
									textureSize: 256,
									textureSpace: 'local',
								});
								if (reverse) {
									gradientFill.colorStops = gradientFill.colorStops
										.map((stop) => ({
											offset: 1 - stop.offset,
											color: stop.color,
										}))
										.reverse();
								}

								painted.fills.push(gradientFill);
								painted.graphics.path(shape).fill(gradientFill);
							}
						}
					}
				}

				const domKey = JSON.stringify([
					node.dom,
					node.width,
					node.height,
					node.radii,
					viewport.resolution,
					node.dom?.scrollbar ? viewport.scrollRevision : null,
				]);
				if (painted.domKey !== domKey) {
					painted.domKey = domKey;
					painted.content.mask = null;
					painted.domMask?.destroy({texture: true, textureSource: true});
					painted.domMask = null;
					painted.domGraphics.clear();
					for (const child of painted.domChildren.removeChildren()) {
						child.destroy({children: true, texture: true, textureSource: true});
					}

					if (node.dom) {
						drawTimelineDomVisual({
							graphics: painted.domGraphics,
							children: painted.domChildren,
							visual: node.dom,
							width: node.width,
							height: node.height,
							radius: Math.max(...Object.values(node.radii)),
							resolution: viewport.resolution,
						});
						if (node.dom.alphaMasks.length > 0) {
							const textureWidth = Math.min(
								4096,
								Math.max(2, Math.ceil(node.width * viewport.resolution)),
							);
							const maskCanvas = document.createElement('canvas');
							maskCanvas.width = textureWidth;
							maskCanvas.height = 1;
							const context = maskCanvas.getContext('2d');
							if (!context)
								throw new Error('Unable to create timeline alpha mask');
							const pixels = context.createImageData(textureWidth, 1);
							let opaque = true;
							for (let index = 0; index < textureWidth; index++) {
								const x = ((index + 0.5) / textureWidth) * node.width;
								let alpha = 1;
								for (const mask of node.dom.alphaMasks) {
									const progress = Math.max(
										0,
										Math.min(
											1,
											(x - mask.start) /
												Math.max(Number.EPSILON, mask.end - mask.start),
										),
									);
									alpha *=
										x < mask.left || x > mask.right
											? 0
											: mask.startAlpha +
												(mask.endAlpha - mask.startAlpha) * progress;
								}

								pixels.data[index * 4] = 255;
								pixels.data[index * 4 + 1] = 255;
								pixels.data[index * 4 + 2] = 255;
								pixels.data[index * 4 + 3] = Math.round(alpha * 255);
								if (alpha < 1) opaque = false;
							}

							if (!opaque) {
								context.putImageData(pixels, 0, 0);
								const mask = new Sprite(Texture.from(maskCanvas));
								mask.width = node.width;
								mask.height = node.height;
								painted.content.addChild(mask);
								painted.content.mask = mask;
								painted.domMask = mask;
							}
						}
					}
				}

				const {clip} = node;
				const clipKey =
					clip === null
						? 'none'
						: JSON.stringify([
								clip.left - node.x,
								clip.top - node.y,
								clip.right - clip.left,
								clip.bottom - clip.top,
							]);
				if (painted.clipKey !== clipKey) {
					painted.clipKey = clipKey;
					painted.clip.clear();
					painted.container.mask = null;
					painted.clip.visible = clip !== null;
					if (clip !== null) {
						painted.clip
							.rect(
								clip.left - node.x,
								clip.top - node.y,
								Math.max(0, clip.right - clip.left),
								Math.max(0, clip.bottom - clip.top),
							)
							.fill(0xffffff);
						painted.container.mask = painted.clip;
					}
				}

				// Each ancestor path is an intersection, so put its mask on a nested
				// container instead of adding every contour to one unioned shape.
				while (painted.pathClips.length > node.pathClips.length) {
					const removed = painted.pathClips.pop();
					const parent =
						painted.pathClips.at(-1)?.container ?? painted.container;
					parent.addChild(painted.content);
					removed?.container.destroy({children: true});
				}

				while (painted.pathClips.length < node.pathClips.length) {
					const parent =
						painted.pathClips.at(-1)?.container ?? painted.container;
					const container = new Container();
					const mask = new Graphics();
					parent.addChild(container);
					container.addChild(mask, painted.content);
					container.mask = mask;
					painted.pathClips.push({container, mask, path: null});
				}

				for (let index = 0; index < node.pathClips.length; index++) {
					const pathClip = node.pathClips[index];
					const retained = painted.pathClips[index];
					if (retained.path !== pathClip.path) {
						retained.path = pathClip.path;
						retained.mask
							.clear()
							.path(new GraphicsPath(pathClip.path))
							.fill(0xffffff);
					}

					retained.mask.position.set(pathClip.x - node.x, pathClip.y - node.y);
				}
			}

			for (const [id, painted] of paintedNodes) {
				if (!present.has(id)) {
					destroyPaintedNode(painted);
					paintedNodes.delete(id);
				}
			}

			renderer.render(scene);
		},
		destroy: () => {
			if (destroyed) {
				return;
			}

			destroyed = true;
			for (const finish of transitions) finish();
			for (const painted of paintedNodes.values()) {
				destroyPaintedNode(painted);
			}

			paintedNodes.clear();
			preview?.destroy({texture: true, textureSource: true});
			preview = null;
			scene.destroy({children: true});
			renderer.destroy({removeView: false});
		},
	};
};
