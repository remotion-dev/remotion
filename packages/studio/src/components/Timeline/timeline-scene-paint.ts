import type React from 'react';
import {FOCUS_BOX_SHADOW} from '../../helpers/colors';
import type {TimelinePaintNode} from './pixi-timeline-renderer';
import {resolveTimelineSceneLength} from './timeline-scene-length';
import type {TimelineSceneNode} from './timeline-scene-node';
import type {
	TimelineSceneText,
	TimelineSceneVisual,
} from './timeline-scene-visual';

type Matrix = readonly [number, number, number, number, number, number];
let textMeasurement: CanvasRenderingContext2D | null = null;
const scrollbarIdentities = new WeakMap<TimelineSceneNode, object>();

// Known Studio classes describe visual state explicitly in the scene. Layout
// consumes this too, so hover-revealed actions occupy exactly their painted width.
export const getTimelineSceneStyle = (
	node: TimelineSceneNode,
): React.CSSProperties => {
	const style = {...node.style};
	const classes = String(node.props.className ?? '').split(/\s+/);
	if (
		classes.includes('remotion-splitter-vertical') ||
		classes.includes('remotion-splitter-horizontal')
	) {
		style.background = style.background ?? 'var(--remotion-studio-black)';
		style.cursor = classes.includes('remotion-splitter-vertical')
			? 'col-resize'
			: 'row-resize';
	}

	if (classes.includes('__remotion-timeline-slider')) {
		Object.assign(
			style,
			{
				height: 6,
				width: 129,
				borderRadius: 3,
				backgroundColor: 'rgba(255,255,255,.1)',
				accentColor: '#ffffff',
			},
			node.style,
		);
	}

	if (classes.includes('__remotion_thumb')) {
		Object.assign(
			style,
			{
				background: 'transparent',
				border: 0,
				height: '100%',
				width: '100%',
				left: 0,
				top: 0,
				margin: 0,
				outline: 'none',
				padding: 0,
				position: 'absolute',
				zIndex: 2,
			},
			node.style,
		);
	}

	if (
		node.tagName === 'SPAN' &&
		node.parent?.hovered &&
		node.parent.classList.contains('__remotion_input_dragger') &&
		node.parent.children.find((child) => child.tagName !== '#TEXT') === node
	) {
		style.color = 'var(--remotion-studio-blue-hovered)';
	}

	if (classes.includes('__remotion-hoverable')) {
		const value = (name: string) =>
			Reflect.get(node.style, name) as string | undefined;
		style.backgroundColor =
			(node.hovered ? value('--remotion-studio-hoverable-hover-bg') : null) ??
			value('--remotion-studio-hoverable-bg') ??
			style.backgroundColor;
		style.color =
			(node.hovered
				? value('--remotion-studio-hoverable-hover-color')
				: null) ??
			value('--remotion-studio-hoverable-color') ??
			style.color;
	}

	if (classes.includes('__remotion-input-hover')) {
		Reflect.set(
			style,
			'--remotion-studio-input-hover-border',
			node.hovered
				? 'var(--remotion-studio-white-alpha-05)'
				: 'var(--remotion-studio-black-alpha-60)',
		);
		Reflect.set(
			style,
			'--remotion-studio-input-hover-icon',
			node.hovered
				? 'var(--remotion-studio-white)'
				: (Reflect.get(node.style, '--remotion-studio-input-idle-icon') ??
						'var(--remotion-studio-light-text)'),
		);
	}

	if (
		classes.includes('__remotion-hover-group-reveal') ||
		classes.includes('__remotion-hover-group-reveal-keep-space')
	) {
		let group = node.parent;
		while (
			group &&
			!String(group.props.className ?? '')
				.split(/\s+/)
				.includes('__remotion-hover-group')
		)
			group = group.parent;
		const expanded = (entry: TimelineSceneNode): boolean =>
			entry.props['aria-expanded'] === true ||
			entry.props['aria-expanded'] === 'true' ||
			entry.children.some(expanded);
		const focusWithin = (entry: TimelineSceneNode): boolean =>
			entry.focused || entry.children.some(focusWithin);
		if (
			group &&
			!group.hovered &&
			!expanded(group) &&
			!(
				classes.includes('__remotion-hover-group-reveal-keep-space') &&
				focusWithin(group)
			)
		) {
			style.opacity = 0;
			style.pointerEvents = 'none';
			if (classes.includes('__remotion-hover-group-reveal')) {
				style.width = 0;
				style.overflow = 'hidden';
			}
		}
	}

	if (
		node.focused &&
		/^(BUTTON|INPUT|TEXTAREA|A)$/.test(node.tagName) &&
		!classes.includes('__remotion_color_swatch')
	) {
		style.boxShadow = style.boxShadow ?? FOCUS_BOX_SHADOW;
		style.outline = 'none';
	}

	return style;
};

// The same explicit style inheritance is used for Yoga's text measurement and
// the GPU labels. No browser layout or hidden elements participate in either.
export const getTimelineSceneTextStyle = (node: TimelineSceneNode) => {
	const inherited = (property: keyof React.CSSProperties, fallback: string) => {
		for (
			let current: TimelineSceneNode | null = node;
			current;
			current = current.parent
		) {
			const value = getTimelineSceneStyle(current)[property];
			if (value !== undefined && value !== null && value !== 'inherit')
				return String(value);
		}

		return fallback;
	};

	return {
		color: inherited('color', '#ffffff'),
		fontFamily: inherited('fontFamily', 'Arial, Helvetica, sans-serif'),
		fontSize: parseFloat(inherited('fontSize', '16')) || 16,
		fontWeight: inherited('fontWeight', 'normal'),
		fontStyle: inherited('fontStyle', 'normal'),
		letterSpacing: parseFloat(inherited('letterSpacing', '0')) || 0,
		decoration: inherited(
			'textDecorationLine',
			inherited('textDecoration', 'none'),
		),
		lineHeight: inherited('lineHeight', '1.5'),
		whiteSpace: inherited('whiteSpace', 'normal'),
		textAlign: inherited('textAlign', 'left'),
	};
};

export const measureTimelineSceneText = (
	text: string,
	node: TimelineSceneNode,
): number => {
	textMeasurement ??= document.createElement('canvas').getContext('2d');
	if (!textMeasurement) throw new Error('Unable to measure timeline text');
	const font = getTimelineSceneTextStyle(node);
	textMeasurement.font = `${font.fontStyle} ${font.fontWeight} ${font.fontSize}px ${font.fontFamily}`;
	textMeasurement.letterSpacing = `${font.letterSpacing}px`;
	return textMeasurement.measureText(text).width;
};

const multiply = (a: Matrix, b: Matrix): Matrix => [
	a[0] * b[0] + a[2] * b[1],
	a[1] * b[0] + a[3] * b[1],
	a[0] * b[2] + a[2] * b[3],
	a[1] * b[2] + a[3] * b[3],
	a[0] * b[4] + a[2] * b[5] + a[4],
	a[1] * b[4] + a[3] * b[5] + a[5],
];

const svgTransform = (transform: unknown): Matrix => {
	let matrix: Matrix = [1, 0, 0, 1, 0, 0];
	for (const match of String(transform ?? '').matchAll(
		/(matrix|translate|scale|scaleX|scaleY|rotate|skewX|skewY)\(([^)]+)\)/g,
	)) {
		const values =
			match[2].match(/[-+]?(?:\d*\.)?\d+(?:e[-+]?\d+)?/gi)?.map(Number) ?? [];
		const [a = 0, b = 0, c = 0] = values;
		let next: Matrix = [1, 0, 0, 1, 0, 0];
		if (match[1] === 'matrix' && values.length === 6)
			next = values as unknown as Matrix;
		if (match[1] === 'translate') next = [1, 0, 0, 1, a, b];
		if (match[1] === 'scale') next = [a, 0, 0, values[1] ?? a, 0, 0];
		if (match[1] === 'scaleX') next = [a, 0, 0, 1, 0, 0];
		if (match[1] === 'scaleY') next = [1, 0, 0, a, 0, 0];
		if (match[1] === 'rotate') {
			const cos = Math.cos((a * Math.PI) / 180);
			const sin = Math.sin((a * Math.PI) / 180);
			next = [
				cos,
				sin,
				-sin,
				cos,
				b - cos * b + sin * c,
				c - sin * b - cos * c,
			];
		}

		if (match[1] === 'skewX')
			next = [1, 0, Math.tan((a * Math.PI) / 180), 1, 0, 0];
		if (match[1] === 'skewY')
			next = [1, Math.tan((a * Math.PI) / 180), 0, 1, 0, 0];
		matrix = multiply(matrix, next);
	}

	return matrix;
};

const length = (value: unknown, reference: number): number =>
	typeof value === 'number'
		? value
		: (resolveTimelineSceneLength(String(value ?? '0'), reference, {
				width: window.innerWidth,
				height: window.innerHeight,
			}) ?? 0);

// Convert explicit scene layout into retained Pixi paint records. SVG children
// are vector data; all other children already have their Yoga layout boxes.
export const getTimelineScenePaintNodes = (
	root: TimelineSceneNode,
	resolveColor: (color: string) => string,
): TimelinePaintNode[] => {
	const entries: {node: TimelineSceneNode; paint: TimelinePaintNode}[] = [];
	const pending: TimelineSceneNode[] = [root];
	while (pending.length > 0) {
		const node = pending.pop()!;
		const {rect} = node;
		const style = getTimelineSceneStyle(node);
		if (
			style.display === 'none' ||
			style.visibility === 'hidden' ||
			/^(STYLE|SCRIPT|VIDEO|CANVAS)$/.test(node.tagName)
		)
			continue;
		if (node.tagName !== 'SVG' && !node.drawing)
			pending.push(
				...node.children
					.toSorted((a, b) => a.order.localeCompare(b.order))
					.reverse(),
			);
		if (rect.width <= 0 || rect.height <= 0) continue;
		const font = getTimelineSceneTextStyle(node);
		const resolveVariables = (value: string) => {
			let result = value;
			for (
				let iteration = 0;
				iteration < 12 && result.includes('var(');
				iteration++
			) {
				const next = result.replace(
					/var\((--[^,)]+)(?:,\s*([^()]*))?\)/g,
					(original, name: string, fallback: string | undefined) => {
						for (
							let ancestor: TimelineSceneNode | null = node;
							ancestor;
							ancestor = ancestor.parent
						) {
							const local = Reflect.get(
								getTimelineSceneStyle(ancestor),
								name.trim(),
							);
							if (local !== undefined) return String(local);
						}

						return resolveColor(original) || fallback || original;
					},
				);
				if (next === result) break;
				result = next;
			}

			return resolveColor(result);
		};

		const color = resolveVariables(font.color);
		const resolve = (value: unknown, fallback: string) =>
			resolveVariables(String(value ?? fallback)).replace(
				/currentColor/gi,
				color,
			);
		const texts: TimelineSceneText[] = [];
		const paths: TimelineSceneVisual['paths'][number][] = [];
		const alphaMasks: TimelineSceneVisual['alphaMasks'][number][] = [];
		const pathClips: TimelinePaintNode['pathClips'][number][] = [];
		let opacity = 1;
		let {clip} = node;
		for (
			let ancestor: TimelineSceneNode | null = node;
			ancestor;
			ancestor = ancestor.parent
		) {
			opacity *= Number(getTimelineSceneStyle(ancestor).opacity ?? 1);
			const ancestorClip = ancestor.style.clipPath;
			if (ancestorClip) {
				const path = ancestorClip.match(
					/^path\((?:evenodd,\s*)?["']([\s\S]*)["']\)$/,
				)?.[1];
				const polygon = ancestorClip.match(/^polygon\((.*)\)$/)?.[1];
				const inset = ancestorClip.match(/^inset\(([^)]+)\)$/)?.[1];
				if (path)
					pathClips.push({x: ancestor.rect.x, y: ancestor.rect.y, path});
				if (polygon)
					pathClips.push({
						x: ancestor.rect.x,
						y: ancestor.rect.y,
						path:
							polygon
								.replace(/^(?:evenodd|nonzero),\s*/, '')
								.split(',')
								.map((point, index) => {
									const [x, y] = point.trim().split(/\s+/);
									return `${index === 0 ? 'M' : 'L'}${length(x, ancestor!.rect.width)},${length(y, ancestor!.rect.height)}`;
								})
								.join(' ') + 'Z',
					});
				if (inset) {
					const values = inset.split('round')[0].trim().split(/\s+/);
					const [top, right = top, bottom = top, left = right] = values;
					const next = {
						left: ancestor.rect.x + length(left, ancestor.rect.width),
						top: ancestor.rect.y + length(top, ancestor.rect.height),
						right:
							ancestor.rect.x +
							ancestor.rect.width -
							length(right, ancestor.rect.width),
						bottom:
							ancestor.rect.y +
							ancestor.rect.height -
							length(bottom, ancestor.rect.height),
					};
					clip = clip
						? {
								left: Math.max(clip.left, next.left),
								top: Math.max(clip.top, next.top),
								right: Math.min(clip.right, next.right),
								bottom: Math.min(clip.bottom, next.bottom),
							}
						: next;
				}
			}

			const mask = resolve(
				ancestor.style.maskImage ?? ancestor.style.WebkitMaskImage,
				'',
			).match(
				/^linear-gradient\(to right,\s*(black|transparent|rgba?\([^)]+\))(?:\s+(calc\([^)]+\)|[\d.]+(?:px|%)))?,\s*(black|transparent|rgba?\([^)]+\))(?:\s+(calc\([^)]+\)|[\d.]+(?:px|%)))?\)$/,
			);
			if (mask) {
				const alpha = (value: string) =>
					value === 'transparent'
						? 0
						: Number(
								value.match(/^rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)$/)?.[1] ??
									value.match(/\/\s*([\d.]+)\)$/)?.[1] ??
									1,
							);
				const left = ancestor.rect.x - rect.x;
				alphaMasks.push({
					left,
					right: left + ancestor.rect.width,
					start: left + (mask[2] ? length(mask[2], ancestor.rect.width) : 0),
					end:
						left +
						(mask[4]
							? length(mask[4], ancestor.rect.width)
							: ancestor.rect.width),
					startAlpha: alpha(mask[1]),
					endAlpha: alpha(mask[3]),
				});
			}
		}

		if (opacity <= 0) continue;
		if (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA') {
			clip = {
				left: Math.max(clip?.left ?? rect.x, rect.x),
				top: Math.max(clip?.top ?? rect.y, rect.y),
				right: Math.min(
					clip?.right ?? rect.x + rect.width,
					rect.x + rect.width,
				),
				bottom: Math.min(
					clip?.bottom ?? rect.y + rect.height,
					rect.y + rect.height,
				),
			};
		}

		const border = (
			side: 'Top' | 'Right' | 'Bottom' | 'Left',
			index: number,
		) => {
			const all = String(style[`border${side}`] ?? style.border ?? '');
			const parts =
				resolve(all, '').match(/rgba?\([^)]+\)|hsla?\([^)]+\)|[^\s]+/g) ?? [];
			const borderStyle = String(
				style[`border${side}Style`] ??
					style.borderStyle ??
					parts.find((part) =>
						/^(none|hidden|solid|dashed|dotted|double)$/.test(part),
					) ??
					(all && all !== '0' ? 'solid' : 'none'),
			);
			const widths = String(style.borderWidth ?? '').split(/\s+/);
			const width = length(
				style[`border${side}Width`] ??
					(widths.length > 1
						? (widths[index] ?? widths[index % 2])
						: style.borderWidth) ??
					parts.find((part) => /^\d/.test(part)),
				rect.width,
			);
			return {
				width: borderStyle === 'none' ? 0 : width,
				style: borderStyle,
				color: resolve(
					style[`border${side}Color`] ??
						style.borderColor ??
						parts.find(
							(part) =>
								!/^(\d|none|hidden|solid|dashed|dotted|double)/.test(part),
						),
					color,
				),
			};
		};

		const borders = [
			border('Top', 0),
			border('Right', 1),
			border('Bottom', 2),
			border('Left', 3),
		];
		const padding = String(style.padding ?? '0').split(/\s+/);
		const [
			paddingTop,
			paddingRight = paddingTop,
			paddingBottom = paddingTop,
			paddingLeft = paddingRight,
		] = padding;
		const insetLeft =
			borders[3].width + length(style.paddingLeft ?? paddingLeft, rect.width);
		const insetRight =
			borders[1].width + length(style.paddingRight ?? paddingRight, rect.width);
		const insetTop =
			borders[0].width + length(style.paddingTop ?? paddingTop, rect.width);
		const insetBottom =
			borders[2].width +
			length(style.paddingBottom ?? paddingBottom, rect.width);
		const lineHeight =
			font.lineHeight === 'normal'
				? font.fontSize * 1.2
				: length(font.lineHeight, font.fontSize) *
					(/^[\d.]+$/.test(font.lineHeight) ? font.fontSize : 1);
		let selection: TimelineSceneVisual['selection'] = null;
		let caret: TimelineSceneVisual['caret'] = null;
		let range: TimelineSceneVisual['range'] = null;
		const addText = ({
			text,
			width,
			x,
			y,
			height,
			ellipsis,
		}: {
			text: string;
			width: number;
			x: number;
			y: number;
			height: number;
			ellipsis: boolean;
		}) => {
			let visible = text;
			if (ellipsis && measureTimelineSceneText(text, node) > width) {
				let low = 0;
				let high = text.length;
				while (low < high) {
					const middle = Math.ceil((low + high) / 2);
					if (
						measureTimelineSceneText(text.slice(0, middle) + '…', node) <= width
					)
						low = middle;
					else high = middle - 1;
				}

				visible = text.slice(0, low) + '…';
			}

			const measured = measureTimelineSceneText(visible, node);
			const align = /^(right|end)$/.test(font.textAlign)
				? width - measured
				: font.textAlign === 'center'
					? (width - measured) / 2
					: 0;
			texts.push({
				...font,
				color,
				text: visible,
				x: x + Math.max(0, align),
				y,
				height,
			});
		};

		if (node.tagName === '#TEXT' && node.text !== null) {
			const text = /^(pre|pre-wrap|break-spaces)$/.test(font.whiteSpace)
				? node.text
				: node.text.replace(/\s+/g, ' ');
			const ellipsis = node.parent?.style.textOverflow === 'ellipsis';
			const available = Math.max(
				0,
				Math.min(
					rect.width,
					ellipsis && node.parent
						? node.parent.rect.x +
								node.parent.rect.width -
								rect.x -
								length(node.parent.style.paddingRight, node.parent.rect.width)
						: rect.width,
				),
			);
			let y = 0;
			for (const paragraph of /^(pre|pre-wrap|break-spaces)$/.test(
				font.whiteSpace,
			)
				? text.split('\n')
				: [text]) {
				if (/^(nowrap|pre)$/.test(font.whiteSpace) || ellipsis) {
					addText({
						text: paragraph,
						width: available,
						x: 0,
						y,
						height: lineHeight,
						ellipsis,
					});
					y += lineHeight;
				} else {
					let line = '';
					for (const word of paragraph.split(/(\s+)/)) {
						if (
							line &&
							measureTimelineSceneText(line + word, node) > available
						) {
							addText({
								text: line.trimEnd(),
								width: available,
								x: 0,
								y,
								height: lineHeight,
								ellipsis: false,
							});
							y += lineHeight;
							line = word.trimStart();
						} else line += word;
					}

					if (line)
						addText({
							text: line,
							width: available,
							x: 0,
							y,
							height: lineHeight,
							ellipsis: false,
						});
					y += lineHeight;
				}
			}
		} else if (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA') {
			if (node.props.type === 'range') {
				const min = Number(node.props.min ?? 0);
				const max = Number(node.props.max ?? 100);
				range = {
					progress: Math.max(
						0,
						Math.min(
							1,
							(Number(node.value) - min) / Math.max(Number.EPSILON, max - min),
						),
					),
					color: resolve(
						style.accentColor === 'auto' ? null : style.accentColor,
						'#ffffff',
					),
				};
			} else if (
				!['checkbox', 'radio', 'hidden'].includes(String(node.props.type))
			) {
				const text = node.value || String(node.props.placeholder ?? '');
				const available = Math.max(0, rect.width - insetLeft - insetRight);
				addText({
					text,
					width: available,
					x: insetLeft - node.scrollLeft,
					y: insetTop + (rect.height - insetTop - insetBottom - lineHeight) / 2,
					height: lineHeight,
					ellipsis: false,
				});
				if (node.focused && node.selectionStart !== null) {
					const run = texts.pop()!;
					const selectionEnd = node.selectionEnd ?? node.selectionStart;
					const start = measureTimelineSceneText(
						text.slice(0, node.selectionStart),
						node,
					);
					const end = measureTimelineSceneText(
						text.slice(0, selectionEnd),
						node,
					);
					if (end > start) {
						texts.push(
							{...run, text: text.slice(0, node.selectionStart)},
							{
								...run,
								text: text.slice(node.selectionStart, selectionEnd),
								x: run.x + start,
								color: node.classList.contains('__remotion_input_dragger_input')
									? color
									: '#000000',
							},
							{...run, text: text.slice(selectionEnd), x: run.x + end},
						);
						selection = {
							x: run.x + start,
							y: run.y,
							width: end - start,
							height: lineHeight,
							color: node.classList.contains('__remotion_input_dragger_input')
								? '#4E4E4E'
								: 'rgba(255,255,255,.72)',
						};
					} else {
						texts.push(run);
						caret = {
							x: run.x + start,
							y: run.y,
							height: lineHeight,
							color: resolve(style.caretColor, color),
						};
					}
				}
			}
		} else if (node.tagName === 'SVG') {
			const viewBox = String(
				node.props.viewBox ?? `0 0 ${rect.width} ${rect.height}`,
			)
				.trim()
				.split(/[\s,]+/)
				.map(Number);
			const [vx, vy, vw, vh] = viewBox;
			const preserve = String(
				node.props.preserveAspectRatio ?? 'xMidYMid meet',
			);
			const sx = rect.width / vw;
			const sy = rect.height / vh;
			const scale = preserve.includes('slice')
				? Math.max(sx, sy)
				: Math.min(sx, sy);
			const scaleX = preserve === 'none' ? sx : scale;
			const scaleY = preserve === 'none' ? sy : scale;
			const alignX = preserve.includes('xMin')
				? 0
				: preserve.includes('xMax')
					? 1
					: 0.5;
			const alignY = preserve.includes('YMin')
				? 0
				: preserve.includes('YMax')
					? 1
					: 0.5;
			let initial: Matrix = [
				scaleX,
				0,
				0,
				scaleY,
				(rect.width - vw * scaleX) * alignX - vx * scaleX,
				(rect.height - vh * scaleY) * alignY - vy * scaleY,
			];
			for (
				let ancestor: TimelineSceneNode | null = node;
				ancestor;
				ancestor = ancestor.parent
			) {
				const transform = String(ancestor.style.transform ?? '')
					.match(/(?:rotate|scale|scaleX|scaleY)\([^)]+\)/g)
					?.join(' ');
				if (!transform) continue;
				const origin = String(
					ancestor.style.transformOrigin ?? '50% 50%',
				).split(/\s+/);
				const x =
					ancestor.rect.x - rect.x + length(origin[0], ancestor.rect.width);
				const y =
					ancestor.rect.y -
					rect.y +
					length(origin[1] ?? origin[0], ancestor.rect.height);
				initial = multiply(
					[1, 0, 0, 1, x, y],
					multiply(
						svgTransform(transform),
						multiply([1, 0, 0, 1, -x, -y], initial),
					),
				);
			}

			const svgPending = [{shape: node, matrix: initial, alpha: 1}];
			while (svgPending.length > 0) {
				const {
					shape,
					matrix: parentMatrix,
					alpha: parentAlpha,
				} = svgPending.pop()!;
				if (
					shape.tagName === 'DEFS' ||
					shape.style.display === 'none' ||
					shape.style.visibility === 'hidden'
				)
					continue;
				const matrix = multiply(
					parentMatrix,
					svgTransform(
						shape.props.transform ??
							(shape === node ? '' : shape.style.transform),
					),
				);
				const alpha =
					parentAlpha *
					(shape === node
						? 1
						: Number(shape.style.opacity ?? shape.props.opacity ?? 1));
				svgPending.push(
					...shape.children
						.toReversed()
						.map((child) => ({shape: child, matrix, alpha})),
				);
				const number = (name: string) =>
					length(
						shape.props[name],
						name === 'y' || name === 'height' || name === 'cy' || name === 'ry'
							? vh
							: vw,
					);
				let path = String(shape.props.d ?? '');
				if (shape.tagName === 'RECT') {
					const x = number('x');
					const y = number('y');
					const width = number('width');
					const height = number('height');
					const rx = Math.min(width / 2, number('rx') || number('ry'));
					const ry = Math.min(height / 2, number('ry') || number('rx'));
					path =
						rx > 0 && ry > 0
							? `M${x + rx},${y}H${x + width - rx}A${rx},${ry} 0 0 1 ${x + width},${y + ry}V${y + height - ry}A${rx},${ry} 0 0 1 ${x + width - rx},${y + height}H${x + rx}A${rx},${ry} 0 0 1 ${x},${y + height - ry}V${y + ry}A${rx},${ry} 0 0 1 ${x + rx},${y}Z`
							: `M${x},${y}h${width}v${height}h${-width}Z`;
				} else if (shape.tagName === 'CIRCLE' || shape.tagName === 'ELLIPSE') {
					const cx = number('cx');
					const cy = number('cy');
					const rx = shape.tagName === 'CIRCLE' ? number('r') : number('rx');
					const ry = shape.tagName === 'CIRCLE' ? number('r') : number('ry');
					path = `M${cx - rx},${cy}a${rx},${ry} 0 1 0 ${rx * 2},0a${rx},${ry} 0 1 0 ${-rx * 2},0Z`;
				} else if (shape.tagName === 'LINE')
					path = `M${number('x1')},${number('y1')}L${number('x2')},${number('y2')}`;
				else if (shape.tagName === 'POLYGON' || shape.tagName === 'POLYLINE') {
					const points =
						String(shape.props.points ?? '').match(
							/-?(?:\d*\.)?\d+(?:e[+-]?\d+)?/gi,
						) ?? [];
					path =
						points
							.map(
								(point, index) =>
									`${index === 0 ? 'M' : index % 2 === 0 ? 'L' : ','}${point}`,
							)
							.join('') + (shape.tagName === 'POLYGON' ? 'Z' : '');
				}

				if (!path) continue;
				const attribute = (
					name: keyof React.CSSProperties,
					fallback: string,
				) => {
					for (
						let ancestor: TimelineSceneNode | null = shape;
						ancestor;
						ancestor = ancestor.parent
					) {
						const value = ancestor.style[name] ?? ancestor.props[name];
						if (value !== undefined && value !== null) return String(value);
						if (ancestor === node) break;
					}

					return fallback;
				};

				paths.push({
					path,
					matrix,
					fill: resolve(attribute('fill', '#000000'), '#000000'),
					fillAlpha: Number(attribute('fillOpacity', '1')) * alpha,
					stroke: resolve(attribute('stroke', 'none'), 'none'),
					strokeAlpha: Number(attribute('strokeOpacity', '1')) * alpha,
					strokeWidth: parseFloat(attribute('strokeWidth', '1')),
					lineCap: attribute('strokeLinecap', 'butt'),
					lineJoin: attribute('strokeLinejoin', 'miter'),
					fillRule: attribute('fillRule', 'nonzero'),
					blur: parseFloat(
						attribute('filter', '').match(/blur\(([^)]+)\)/)?.[1] ?? '0',
					),
				});
			}

			const shadows: TimelineSceneVisual['paths'][number][] = [];
			for (const dropShadow of resolve(style.filter, '').matchAll(
				/drop-shadow\(((?:[^()]|(?:rgba?|hsla?)\([^)]*\))*)\)/gi,
			)) {
				const shadowColor =
					dropShadow[1].match(
						/(?:rgba?|hsla?)\([^)]+\)|#[\da-f]+|\b(?:black|white|transparent)\b/i,
					)?.[0] ?? color;
				const [x = 0, y = 0, blur = 0] = dropShadow[1]
					.replace(shadowColor, '')
					.trim()
					.split(/\s+/)
					.map(parseFloat);
				for (const path of paths)
					shadows.push({
						...path,
						matrix: [
							path.matrix[0],
							path.matrix[1],
							path.matrix[2],
							path.matrix[3],
							path.matrix[4] + x,
							path.matrix[5] + y,
						],
						fill: path.fill === 'none' ? 'none' : shadowColor,
						stroke: path.stroke === 'none' ? 'none' : shadowColor,
						blur,
					});
			}

			paths.unshift(...shadows);
		}

		const scrollbars: TimelineSceneVisual['scrollbars'][number][] = [];
		for (const vertical of [false, true]) {
			const overflow =
				(vertical ? style.overflowY : style.overflowX) ?? style.overflow;
			if (!/^(auto|scroll)$/.test(String(overflow))) continue;
			const extent = vertical ? node.scrollHeight : node.scrollWidth;
			const visible = vertical ? node.clientHeight : node.clientWidth;
			if (extent <= visible) continue;
			scrollbars.push({
				vertical,
				thickness: 6,
				color: node.hovered ? 'rgba(0,0,0,.6)' : 'transparent',
				getScroll: () => ({
					left: vertical ? node.scrollTop : node.scrollLeft,
					width: vertical ? node.clientHeight : node.clientWidth,
					totalWidth: vertical ? node.scrollHeight : node.scrollWidth,
				}),
			});
		}

		const image =
			node.image?.complete && node.image.naturalWidth > 0
				? {
						getResource: () => node.image!,
						src: node.image.src,
						width: node.image.naturalWidth,
						height: node.image.naturalHeight,
						fit: String(style.objectFit ?? 'fill'),
						position: String(style.objectPosition ?? '50% 50%'),
					}
				: null;
		const checkerColor = String(node.props.className ?? '').includes(
			'__remotion_color_swatch',
		)
			? resolve(style.backgroundImage, '').match(
					/^linear-gradient\(45deg,\s*(.+?)\s+25%/,
				)?.[1]
			: null;
		const checkerSize = length(style.backgroundSize, rect.width);
		const checkerboard =
			checkerColor && checkerSize > 0
				? {size: checkerSize, color: checkerColor}
				: null;
		const outlineParts =
			resolve(style.outline, '').match(
				/rgba?\([^)]+\)|hsla?\([^)]+\)|[^\s]+/g,
			) ?? [];
		const outlineWidth =
			style.outlineStyle === 'none' || style.outline === 'none'
				? 0
				: length(
						style.outlineWidth ?? outlineParts.find((part) => /^\d/.test(part)),
						rect.width,
					);
		const rawBackground =
			node.background ??
			style.background ??
			[
				checkerboard
					? ''
					: style.backgroundImage === 'none'
						? ''
						: style.backgroundImage,
				style.backgroundColor,
			]
				.filter(Boolean)
				.join(', ');
		const background = resolve(rawBackground || 'transparent', 'transparent');
		const shadow = resolve(style.boxShadow, 'none');
		if (
			clip &&
			clip.left <= rect.x &&
			clip.top <= rect.y &&
			clip.right >= rect.x + rect.width &&
			clip.bottom >= rect.y + rect.height &&
			shadow === 'none' &&
			outlineWidth === 0 &&
			!['SVG', 'INPUT', 'TEXTAREA'].includes(node.tagName)
		)
			clip = null;
		const visual: TimelineSceneVisual = {
			checkerboard,
			image,
			borders,
			outline:
				outlineWidth > 0
					? {
							width: outlineWidth,
							color: resolve(
								style.outlineColor ??
									outlineParts.find(
										(part) => !/^(\d|none|solid|dotted|dashed)/.test(part),
									),
								color,
							),
							offset: length(style.outlineOffset, rect.width),
						}
					: null,
			shadow,
			texts,
			paths,
			selection,
			caret,
			range,
			alphaMasks,
			scrollbars,
		};
		const radii = String(style.borderRadius ?? 0).split(/\s+/);
		const [tl, tr = tl, br = tl, bl = tr] = radii;
		if (
			node.drawing ||
			texts.length ||
			paths.length ||
			checkerboard ||
			image ||
			range ||
			scrollbars.length ||
			selection ||
			caret ||
			borders.some((edge) => edge.width > 0) ||
			outlineWidth > 0 ||
			shadow !== 'none' ||
			!/^(transparent|rgba\(0,\s*0,\s*0,\s*0\))$/.test(background)
		) {
			entries.push({
				node,
				paint: {
					id: node,
					x: rect.x,
					y: rect.y,
					width: rect.width,
					height: rect.height,
					opacity,
					background,
					drawing: node.drawing,
					visual,
					resolveColor,
					radii: {
						topLeft: length(
							style.borderTopLeftRadius ?? tl,
							Math.min(rect.width, rect.height),
						),
						topRight: length(
							style.borderTopRightRadius ?? tr,
							Math.min(rect.width, rect.height),
						),
						bottomLeft: length(
							style.borderBottomLeftRadius ?? bl,
							Math.min(rect.width, rect.height),
						),
						bottomRight: length(
							style.borderBottomRightRadius ?? br,
							Math.min(rect.width, rect.height),
						),
					},
					clip,
					pathClips,
				},
			});
		}
	}

	const order = new Map(
		getTimelineSceneNodeOrder(root).map((node, index) => [node, index]),
	);
	entries.sort((a, b) => order.get(a.node)! - order.get(b.node)!);
	const paints = entries.map((entry) => entry.paint);
	const scrollbarPaints: TimelinePaintNode[] = [];
	for (const [index, {node, paint}] of entries.entries()) {
		if (!paint.visual?.scrollbars.length) continue;
		let id = scrollbarIdentities.get(node);
		if (!id) {
			id = {};
			scrollbarIdentities.set(node, id);
		}

		const {visual} = paint;
		scrollbarPaints.push({
			...paint,
			id,
			background: 'transparent',
			drawing: null,
			visual: {
				...visual,
				checkerboard: null,
				image: null,
				borders: [],
				outline: null,
				shadow: 'none',
				texts: [],
				paths: [],
				selection: null,
				caret: null,
				range: null,
			},
		});
		paints[index] = {...paint, visual: {...visual, scrollbars: []}};
	}

	// Scrollbars overlay scrolled children, rather than being covered by them.
	return [...paints, ...scrollbarPaints];
};

export const getTimelineSceneNodeOrder = (
	root: TimelineSceneNode,
): TimelineSceneNode[] => {
	const nodes: TimelineSceneNode[] = [];
	const sequence = new Map<TimelineSceneNode, number>();
	const pending = [root];
	while (pending.length > 0) {
		const node = pending.pop()!;
		sequence.set(node, nodes.length);
		nodes.push(node);
		pending.push(
			...node.children
				.toSorted((a, b) => a.order.localeCompare(b.order))
				.reverse(),
		);
	}

	// Preserve nested CSS stacking contexts, including a trim handle whose
	// positive z-index must stay within its owning scene/row.
	type Part = {node: TimelineSceneNode; phase: number; zIndex: number};
	type Order = {context: Part[]; flow: Part[]; paint: Part[]};
	const orders = new Map<TimelineSceneNode, Order>();
	const getOrder = (node: TimelineSceneNode): Order => {
		const cached = orders.get(node);
		if (cached) return cached;
		if (!node.parent) {
			const rootOrder = {context: [], flow: [], paint: []};
			orders.set(node, rootOrder);
			return rootOrder;
		}

		const parent = getOrder(node.parent);
		const style = getTimelineSceneStyle(node);
		const positioned =
			style.position !== undefined && style.position !== 'static';
		const flex = /^(inline-)?(flex|grid)$/.test(
			String(node.parent.style.display),
		);
		const zIndex =
			positioned || flex ? parseInt(String(style.zIndex), 10) || 0 : 0;
		const context =
			((positioned || flex) &&
				style.zIndex !== undefined &&
				style.zIndex !== 'auto') ||
			style.position === 'fixed' ||
			style.position === 'sticky' ||
			Number(style.opacity ?? 1) < 1 ||
			style.isolation === 'isolate' ||
			[style.transform, style.filter, style.clipPath, style.maskImage].some(
				(value) => value !== undefined && value !== 'none',
			);
		let order: Order;
		if (context) {
			const parts = [
				...parent.context,
				{node, phase: zIndex < 0 ? 1 : zIndex > 0 ? 6 : 5, zIndex},
			];
			order = {context: parts, flow: parts, paint: parts};
		} else if (positioned) {
			const flow = [...parent.context, {node, phase: 5, zIndex: 0}];
			order = {context: parent.context, flow, paint: flow};
		} else {
			const inline =
				node.tagName === '#TEXT' || String(style.display).startsWith('inline');
			const paint = [
				...parent.flow,
				{node, phase: inline || flex ? 4 : 2, zIndex: 0},
			];
			order = {
				context: parent.context,
				flow:
					flex || (inline && style.display !== 'inline') ? paint : parent.flow,
				paint,
			};
		}

		orders.set(node, order);
		return order;
	};

	return nodes.sort((a, b) => {
		const left = getOrder(a).paint;
		const right = getOrder(b).paint;
		for (let index = 0; index < Math.min(left.length, right.length); index++) {
			if (left[index].node === right[index].node) continue;
			return (
				left[index].phase - right[index].phase ||
				left[index].zIndex - right[index].zIndex ||
				(sequence.get(left[index].node) ?? 0) -
					(sequence.get(right[index].node) ?? 0)
			);
		}

		return left.length - right.length;
	});
};
