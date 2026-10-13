export type TimelineDomText = {
	readonly text: string;
	readonly x: number;
	readonly y: number;
	readonly height: number;
	readonly color: string;
	readonly fontFamily: string;
	readonly fontSize: number;
	readonly fontWeight: string;
	readonly fontStyle: string;
	readonly letterSpacing: number;
	readonly decoration: string;
};

export type TimelineDomVisual = {
	readonly checkerboard: {readonly size: number; readonly color: string} | null;
	readonly image: {
		readonly getResource: () => HTMLImageElement;
		readonly src: string;
		readonly width: number;
		readonly height: number;
		readonly fit: string;
		readonly position: string;
	} | null;
	readonly borders: readonly {width: number; color: string; style: string}[];
	readonly outline: {width: number; color: string; offset: number} | null;
	readonly shadow: string;
	readonly texts: readonly TimelineDomText[];
	readonly paths: readonly {
		path: string;
		matrix: readonly [number, number, number, number, number, number];
		fill: string;
		fillAlpha: number;
		stroke: string;
		strokeAlpha: number;
		strokeWidth: number;
		lineCap: string;
		lineJoin: string;
		fillRule: string;
		blur: number;
	}[];
	readonly selection: {
		x: number;
		y: number;
		width: number;
		height: number;
		color: string;
	} | null;
	readonly caret: {x: number; y: number; height: number; color: string} | null;
	readonly range: {progress: number; color: string} | null;
	readonly alphaMasks: readonly {
		left: number;
		right: number;
		start: number;
		end: number;
		startAlpha: number;
		endAlpha: number;
	}[];
	readonly scrollbar: {
		readonly thickness: number;
		readonly color: string;
		readonly getScroll: () => {left: number; width: number; totalWidth: number};
	} | null;
};

export type TimelineDomPaintEntry = {
	readonly element: HTMLElement;
	readonly background: string;
	readonly dom: TimelineDomVisual;
};

let textMeasurement: CanvasRenderingContext2D | null = null;

// DOM supplies layout and semantics; these descriptors contain native GPU
// primitives, never a rasterized copy of the DOM.
export const getTimelineDomPaintEntries = (
	root: HTMLElement,
	styles: Map<Element, CSSStyleDeclaration>,
	rects: Map<Element, DOMRect>,
): TimelineDomPaintEntry[] => {
	const entries: TimelineDomPaintEntry[] = [];
	const pending: Element[] = [root];
	const getStyle = (element: Element) => {
		const cached = styles.get(element);
		if (cached) {
			return cached;
		}

		const style = getComputedStyle(element);
		styles.set(element, style);
		return style;
	};

	while (pending.length > 0) {
		const element = pending.pop()!;
		if (
			element.hasAttribute('data-timeline-pixi') ||
			element.hasAttribute('data-timeline-canvas-content') ||
			/^(CANVAS|STYLE|SCRIPT|VIDEO)$/.test(element.tagName)
		) {
			continue;
		}

		const style = getStyle(element);
		if (style.display === 'none' || style.visibility === 'hidden') {
			continue;
		}

		const svg = element instanceof SVGSVGElement;
		if (!svg) {
			pending.push(...Array.from(element.children).reverse());
		}

		const rect = rects.get(element) ?? element.getBoundingClientRect();
		rects.set(element, rect);
		if (rect.width <= 0 || rect.height <= 0) {
			continue;
		}

		// Color swatches use four diagonal CSS layers to make an 8px tile.
		// Paint the same checker as native squares beneath the swatch's fill.
		const checkerColor = element.classList.contains('__remotion_color_swatch')
			? style.backgroundImage.match(
					/^linear-gradient\(45deg,\s*(.+?)\s+25%/,
				)?.[1]
			: null;
		const checkerSize = parseFloat(style.backgroundSize);
		const checkerboard =
			checkerColor && checkerSize > 0
				? {size: checkerSize, color: checkerColor}
				: null;
		const image =
			element instanceof HTMLImageElement &&
			element.complete &&
			element.naturalWidth > 0 &&
			element.naturalHeight > 0
				? {
						getResource: () => element,
						src: element.currentSrc,
						width: element.naturalWidth,
						height: element.naturalHeight,
						fit: style.objectFit,
						position: style.objectPosition,
					}
				: null;
		const texts: TimelineDomText[] = [];
		const paths: TimelineDomVisual['paths'][number][] = [];
		const alphaMasks: TimelineDomVisual['alphaMasks'][number][] = [];
		for (
			let ancestor: Element | null = element;
			ancestor && !ancestor.hasAttribute('data-timeline-layout');
			ancestor = ancestor.parentElement
		) {
			const mask = getStyle(ancestor).maskImage.match(
				/^linear-gradient\(to right,\s*(black|transparent|rgba?\([^)]+\))(?:\s+(calc\([^)]+\)|[\d.]+(?:px|%)))?,\s*(black|transparent|rgba?\([^)]+\))(?:\s+(calc\([^)]+\)|[\d.]+(?:px|%)))?\)$/,
			);
			if (!mask) continue;
			const bounds = rects.get(ancestor) ?? ancestor.getBoundingClientRect();
			rects.set(ancestor, bounds);
			const offset = (value: string | undefined, fallback: number) => {
				if (!value) return fallback;
				const calc = value.match(/^calc\(100% - ([\d.]+)px\)$/);
				if (calc) return bounds.width - Number(calc[1]);
				return (
					parseFloat(value) * (value.endsWith('%') ? bounds.width / 100 : 1)
				);
			};

			const alpha = (color: string) =>
				color === 'transparent'
					? 0
					: Number(
							color.match(/^rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)$/)?.[1] ?? 1,
						);
			const left = bounds.left - rect.left;
			alphaMasks.push({
				left,
				right: left + bounds.width,
				start: left + offset(mask[2], 0),
				end: left + offset(mask[4], bounds.width),
				startAlpha: alpha(mask[1]),
				endAlpha: alpha(mask[3]),
			});
		}

		const borders = ['Top', 'Right', 'Bottom', 'Left'].map((side) => ({
			width:
				parseFloat(
					style.getPropertyValue(`border-${side.toLowerCase()}-width`),
				) || 0,
			color: style.getPropertyValue(`border-${side.toLowerCase()}-color`),
			style: style.getPropertyValue(`border-${side.toLowerCase()}-style`),
		}));
		let selection: TimelineDomVisual['selection'] = null;
		let caret: TimelineDomVisual['caret'] = null;
		let range: TimelineDomVisual['range'] = null;
		const scrollbar: TimelineDomVisual['scrollbar'] =
			element instanceof HTMLElement &&
			/auto|scroll/.test(style.overflowX) &&
			element.scrollWidth > element.clientWidth
				? {
						thickness: Math.max(
							6,
							element.offsetHeight -
								element.clientHeight -
								borders[0].width -
								borders[2].width,
						),
						color:
							getComputedStyle(element, '::-webkit-scrollbar-thumb')
								.backgroundColor ||
							(element.matches(':hover') ? 'rgba(0,0,0,.6)' : 'transparent'),
						getScroll: () => ({
							left: element.scrollLeft,
							width: element.clientWidth,
							totalWidth: element.scrollWidth,
						}),
					}
				: null;
		const font = {
			color: style.color,
			fontFamily: style.fontFamily,
			fontSize: parseFloat(style.fontSize),
			fontWeight: style.fontWeight,
			fontStyle: style.fontStyle,
			letterSpacing: parseFloat(style.letterSpacing) || 0,
			decoration: style.textDecorationLine,
		};
		const getMeasure = () => {
			textMeasurement ??= document.createElement('canvas').getContext('2d');
			if (!textMeasurement) {
				throw new Error('Unable to measure timeline text');
			}

			textMeasurement.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
			textMeasurement.letterSpacing = style.letterSpacing;
			return textMeasurement;
		};

		if (svg) {
			for (const shape of element.querySelectorAll(
				'path,rect,circle,ellipse,line,polygon,polyline',
			)) {
				if (!(shape instanceof SVGGraphicsElement) || shape.closest('defs')) {
					continue;
				}

				const computed = getStyle(shape);
				const matrix = shape.getScreenCTM();
				if (
					!matrix ||
					computed.display === 'none' ||
					computed.visibility === 'hidden'
				) {
					continue;
				}

				const number = (name: string) =>
					parseFloat(shape.getAttribute(name) ?? '0') || 0;
				let path = shape.getAttribute('d') ?? '';
				if (shape instanceof SVGRectElement) {
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
				} else if (
					shape instanceof SVGCircleElement ||
					shape instanceof SVGEllipseElement
				) {
					const cx = number('cx');
					const cy = number('cy');
					const rx =
						shape instanceof SVGCircleElement ? number('r') : number('rx');
					const ry =
						shape instanceof SVGCircleElement ? number('r') : number('ry');
					path = `M${cx - rx},${cy}a${rx},${ry} 0 1 0 ${rx * 2},0a${rx},${ry} 0 1 0 ${-rx * 2},0Z`;
				} else if (shape instanceof SVGLineElement) {
					path = `M${number('x1')},${number('y1')}L${number('x2')},${number('y2')}`;
				} else if (
					shape instanceof SVGPolygonElement ||
					shape instanceof SVGPolylineElement
				) {
					const points =
						shape
							.getAttribute('points')
							?.match(/-?(?:\d*\.)?\d+(?:e[+-]?\d+)?/gi) ?? [];
					path =
						points
							.map(
								(point, index) =>
									`${index === 0 ? 'M' : index % 2 === 0 ? 'L' : ','}${point}`,
							)
							.join('') + (shape instanceof SVGPolygonElement ? 'Z' : '');
				}

				let alpha = 1;
				for (
					let ancestor: Element | null = shape;
					ancestor && ancestor !== element;
					ancestor = ancestor.parentElement
				) {
					alpha *= Number(getStyle(ancestor).opacity);
				}

				paths.push({
					path,
					matrix: [
						matrix.a,
						matrix.b,
						matrix.c,
						matrix.d,
						matrix.e - rect.left,
						matrix.f - rect.top,
					],
					fill: computed.fill,
					fillAlpha: Number(computed.fillOpacity) * alpha,
					stroke: computed.stroke,
					strokeAlpha: Number(computed.strokeOpacity) * alpha,
					strokeWidth: parseFloat(computed.strokeWidth),
					lineCap: computed.strokeLinecap,
					lineJoin: computed.strokeLinejoin,
					fillRule: computed.fillRule,
					blur: parseFloat(
						computed.filter.match(/blur\(([^)]+)\)/)?.[1] ?? '0',
					),
				});
			}

			const shadowPaths: TimelineDomVisual['paths'][number][] = [];
			for (const shadow of style.filter.matchAll(
				/drop-shadow\((rgba?\([^)]+\))\s+(-?[\d.]+)px\s+(-?[\d.]+)px(?:\s+([\d.]+)px)?\)/g,
			)) {
				for (const path of paths) {
					shadowPaths.push({
						...path,
						matrix: [
							path.matrix[0],
							path.matrix[1],
							path.matrix[2],
							path.matrix[3],
							path.matrix[4] + Number(shadow[2]),
							path.matrix[5] + Number(shadow[3]),
						],
						fill: path.fill === 'none' ? 'none' : shadow[1],
						stroke: path.stroke === 'none' ? 'none' : shadow[1],
						blur: Number(shadow[4] ?? 0),
					});
				}
			}

			paths.unshift(...shadowPaths);
		} else if (
			element instanceof HTMLInputElement ||
			element instanceof HTMLTextAreaElement
		) {
			if (element instanceof HTMLInputElement && element.type === 'range') {
				const min = Number(element.min || 0);
				const max = Number(element.max || 100);
				range = {
					progress: Math.max(
						0,
						Math.min(1, (Number(element.value) - min) / (max - min)),
					),
					color: style.accentColor === 'auto' ? '#ffffff' : style.accentColor,
				};
			} else if (
				!(element instanceof HTMLInputElement) ||
				!['checkbox', 'radio', 'hidden'].includes(element.type)
			) {
				const measure = getMeasure();
				const text = element.value || element.placeholder;
				const availableWidth =
					rect.width -
					borders[1].width -
					borders[3].width -
					parseFloat(style.paddingLeft) -
					parseFloat(style.paddingRight);
				const alignedOffset =
					style.textAlign === 'right' || style.textAlign === 'end'
						? availableWidth - measure.measureText(text).width
						: style.textAlign === 'center'
							? (availableWidth - measure.measureText(text).width) / 2
							: 0;
				const left =
					borders[3].width +
					parseFloat(style.paddingLeft) +
					Math.max(0, alignedOffset) -
					element.scrollLeft;
				const height = parseFloat(style.lineHeight) || font.fontSize * 1.2;
				const y = (rect.height - height) / 2;
				texts.push({...font, text, x: left, y, height});
				if (
					document.activeElement === element &&
					element.selectionStart !== null
				) {
					const start = measure.measureText(
						text.slice(0, element.selectionStart),
					).width;
					const end = measure.measureText(
						text.slice(0, element.selectionEnd ?? element.selectionStart),
					).width;
					const selected = getComputedStyle(element, '::selection');
					if (end > start) {
						texts.pop();
						const selectionEnd = element.selectionEnd ?? element.selectionStart;
						texts.push(
							{
								...font,
								text: text.slice(0, element.selectionStart),
								x: left,
								y,
								height,
							},
							{
								...font,
								text: text.slice(element.selectionStart, selectionEnd),
								x: left + start,
								y,
								height,
								color: selected.color || font.color,
							},
							{
								...font,
								text: text.slice(selectionEnd),
								x: left + end,
								y,
								height,
							},
						);
						selection = {
							x: left + start,
							y,
							width: end - start,
							height,
							color:
								selected.backgroundColor === 'rgba(0, 0, 0, 0)'
									? '#80b8ff'
									: selected.backgroundColor,
						};
					} else {
						caret = {x: left + start, y, height, color: style.caretColor};
					}
				}
			}
		} else {
			for (const child of element.childNodes) {
				if (child.nodeType !== Node.TEXT_NODE || !child.textContent?.trim()) {
					continue;
				}

				const textRange = document.createRange();
				textRange.selectNodeContents(child);
				const boxes = Array.from(textRange.getClientRects());
				const text = /^(pre|pre-wrap|break-spaces)$/.test(style.whiteSpace)
					? child.textContent
					: child.textContent.replace(/\s+/g, ' ');
				if (boxes.length === 1) {
					const box = boxes[0];
					let visible = text;
					if (
						style.textOverflow === 'ellipsis' &&
						box.right > rect.right - parseFloat(style.paddingRight)
					) {
						const measure = getMeasure();
						const width =
							rect.right - parseFloat(style.paddingRight) - box.left;
						let low = 0;
						let high = text.length;
						while (low < high) {
							const middle = Math.ceil((low + high) / 2);
							if (
								measure.measureText(text.slice(0, middle) + '…').width <= width
							)
								low = middle;
							else high = middle - 1;
						}

						visible = text.slice(0, low) + '…';
					}

					texts.push({
						...font,
						text: visible,
						x: box.left - rect.left,
						y: box.top - rect.top,
						height: box.height,
					});
				} else {
					// Wrapped text is uncommon in timeline rows; measure individual
					// characters only here to recover the browser's exact line breaks.
					const startIndex = texts.length;
					for (let index = 0; index < child.textContent.length; index++) {
						textRange.setStart(child, index);
						textRange.setEnd(child, index + 1);
						const box = textRange.getBoundingClientRect();
						if (box.width === 0) continue;
						const run = texts.length > startIndex ? texts.at(-1) : null;
						if (run && Math.abs(run.y - (box.top - rect.top)) < 0.5) {
							texts[texts.length - 1] = {
								...run,
								text: run.text + child.textContent[index],
							};
						} else {
							texts.push({
								...font,
								text: child.textContent[index],
								x: box.left - rect.left,
								y: box.top - rect.top,
								height: box.height,
							});
						}
					}
				}
			}
		}

		const outlineWidth =
			style.outlineStyle === 'none' ? 0 : parseFloat(style.outlineWidth);
		const background = element.hasAttribute('data-timeline-canvas-background')
			? 'transparent'
			: [
					checkerboard || style.backgroundImage === 'none'
						? ''
						: style.backgroundImage,
					style.backgroundColor,
				]
					.filter(Boolean)
					.join(', ');
		if (
			texts.length === 0 &&
			paths.length === 0 &&
			!checkerboard &&
			!image &&
			!range &&
			!scrollbar &&
			!selection &&
			!caret &&
			borders.every(
				(border) => border.width === 0 || border.style === 'none',
			) &&
			outlineWidth === 0 &&
			style.boxShadow === 'none' &&
			/^(transparent|rgba\(0, 0, 0, 0\))$/.test(background)
		) {
			continue;
		}

		entries.push({
			element: element as HTMLElement,
			background,
			dom: {
				checkerboard,
				image,
				borders,
				outline:
					outlineWidth > 0
						? {
								width: outlineWidth,
								color: style.outlineColor,
								offset: parseFloat(style.outlineOffset),
							}
						: null,
				shadow: style.boxShadow,
				texts,
				paths,
				selection,
				caret,
				range,
				alphaMasks,
				scrollbar,
			},
		});
	}

	return entries;
};
