import {
	loadYoga,
	Align,
	Direction,
	Display,
	Edge,
	FlexDirection,
	Gutter,
	Justify,
	MeasureMode,
	PositionType,
	Wrap,
	type Node as YogaNode,
} from 'yoga-layout/load';
import {
	resolveTimelineSceneLength,
	splitTimelineSceneStyleValues,
} from './timeline-scene-length';
import type {TimelineSceneNode} from './timeline-scene-node';
import {
	getTimelineSceneStyle,
	getTimelineSceneTextStyle,
	measureTimelineSceneText,
} from './timeline-scene-paint';

let yogaPromise: ReturnType<typeof loadYoga> | null = null;
export const createTimelineSceneLayout = async () => {
	const yoga = await (yogaPromise ??= loadYoga());
	const config = yoga.Config.create();
	config.setUseWebDefaults(true);
	config.setPointScaleFactor(0);
	const nodes = new Map<TimelineSceneNode, YogaNode>();
	const defaults = yoga.Node.create(config);

	const dimension = (
		value: unknown,
		available: number,
	): number | 'auto' | `${number}%` | undefined => {
		if (typeof value === 'number')
			return Number.isFinite(value) ? value : undefined;
		if (typeof value !== 'string') return undefined;
		if (
			value === 'auto' ||
			value === 'max-content' ||
			value === 'min-content' ||
			value === 'fit-content'
		)
			return 'auto';
		if (/^-?[\d.]+%$/.test(value)) return value as `${number}%`;
		return (
			resolveTimelineSceneLength(value, available, {
				width: window.innerWidth,
				height: window.innerHeight,
			}) ?? undefined
		);
	};

	const physical = (value: unknown, available: number) => {
		const result = dimension(value, available);
		return typeof result === 'number'
			? result
			: result?.endsWith('%')
				? (parseFloat(result) * available) / 100
				: undefined;
	};

	const getContainingBlock = (
		scene: TimelineSceneNode,
		root: TimelineSceneNode,
	): TimelineSceneNode => {
		for (let ancestor = scene.parent; ancestor; ancestor = ancestor.parent) {
			const style = getTimelineSceneStyle(ancestor);
			if (
				ancestor === root ||
				(style.position !== undefined && style.position !== 'static') ||
				[style.transform, style.filter, style.perspective].some(
					(value) => value !== undefined && value !== 'none',
				)
			)
				return ancestor;
		}

		return root;
	};

	const coordinates = new Map<
		TimelineSceneNode,
		{x: number; y: number; width: number; height: number}
	>();
	const project = (root: TimelineSceneNode, width: number, height: number) => {
		const canvasBounds = root.store.canvasRect;
		const childClips = new Map<TimelineSceneNode, TimelineSceneNode['clip']>();
		const visit = (
			node: TimelineSceneNode,
			parentX: number,
			parentY: number,
			clip: TimelineSceneNode['clip'],
		) => {
			const layout = coordinates.get(node) ?? {x: 0, y: 0, width: 0, height: 0};
			let x = parentX + layout.x;
			let y = parentY + layout.y;
			let effectiveClip = clip;
			if (node.style.position === 'absolute') {
				const containingBlock = getContainingBlock(node, root);
				for (
					let ancestor = node.parent;
					ancestor && ancestor !== containingBlock;
					ancestor = ancestor.parent
				) {
					x += ancestor.scrollLeft;
					y += ancestor.scrollTop;
				}

				effectiveClip = childClips.get(containingBlock) ?? clip;
			}

			if (node.style.position === 'fixed') {
				x =
					(physical(node.style.left, width) ?? layout.x) -
					(canvasBounds?.left ?? 0);
				y =
					(physical(node.style.top, height) ?? layout.y) -
					(canvasBounds?.top ?? 0);
			}

			if (node.style.position === 'sticky')
				y = Math.max(y, Number(node.style.top ?? 0));
			const transform = String(node.style.transform ?? '');
			const translate =
				/translate(?:3d)?\(\s*(-?[\d.]+)(px|%)?\s*,\s*(-?[\d.]+)(px|%)?/.exec(
					transform,
				);
			if (translate) {
				x +=
					Number(translate[1]) *
					(translate[2] === '%' ? layout.width / 100 : 1);
				y +=
					Number(translate[3]) *
					(translate[4] === '%' ? layout.height / 100 : 1);
			}

			const translateX = /translateX\(\s*(-?[\d.]+)(px|%)?/.exec(transform);
			const translateY = /translateY\(\s*(-?[\d.]+)(px|%)?/.exec(transform);
			if (translateX)
				x +=
					Number(translateX[1]) *
					(translateX[2] === '%' ? layout.width / 100 : 1);
			if (translateY)
				y +=
					Number(translateY[1]) *
					(translateY[2] === '%' ? layout.height / 100 : 1);
			node.rect = {x, y, width: layout.width, height: layout.height};
			node.clip = effectiveClip;
			const clipX = /hidden|auto|scroll|clip/.test(
				String(node.style.overflowX ?? node.style.overflow ?? ''),
			);
			const clipY = /hidden|auto|scroll|clip/.test(
				String(node.style.overflowY ?? node.style.overflow ?? ''),
			);
			const nextClip = {
				left: clipX
					? Math.max(effectiveClip?.left ?? 0, x)
					: (effectiveClip?.left ?? 0),
				right: clipX
					? Math.min(effectiveClip?.right ?? width, x + layout.width)
					: (effectiveClip?.right ?? width),
				top: clipY
					? Math.max(effectiveClip?.top ?? 0, y)
					: (effectiveClip?.top ?? 0),
				bottom: clipY
					? Math.min(effectiveClip?.bottom ?? height, y + layout.height)
					: (effectiveClip?.bottom ?? height),
			};
			childClips.set(node, nextClip);
			for (const child of node.children)
				visit(child, x - node.scrollLeft, y - node.scrollTop, nextClip);
		};

		visit(root, 0, 0, {left: 0, top: 0, right: width, bottom: height});
	};

	return {
		project,
		layout: (root: TimelineSceneNode, width: number, height: number) => {
			const present = new Set<TimelineSceneNode>();
			// Detach first so changed parentage and keyed order never retain Yoga nodes.
			for (const node of nodes.values())
				while (node.getChildCount()) node.removeChild(node.getChild(0));
			const build = (scene: TimelineSceneNode): YogaNode => {
				present.add(scene);
				let node = nodes.get(scene);
				if (!node) {
					node = yoga.Node.create(config);
					nodes.set(scene, node);
				}

				node.copyStyle(defaults);
				node.unsetMeasureFunc();
				const style = getTimelineSceneStyle(scene);
				const parentWidth = scene.parent?.rect.width || width;
				const parentHeight = scene.parent?.rect.height || height;
				node.setDisplay(
					style.display === 'none' ||
						/^(STYLE|SCRIPT|DEFS|FILTER)$/.test(scene.tagName)
						? Display.None
						: Display.Flex,
				);
				const flexContainer =
					style.display === 'flex' || style.display === 'inline-flex';
				const parentStyle = scene.parent
					? getTimelineSceneStyle(scene.parent)
					: null;
				const flexItem =
					parentStyle?.display === 'flex' ||
					parentStyle?.display === 'inline-flex';
				const inlineChildren = scene.children.filter((child) => {
					const childStyle = getTimelineSceneStyle(child);
					return (
						childStyle.display !== 'none' &&
						childStyle.position !== 'absolute' &&
						childStyle.position !== 'fixed' &&
						!/^(STYLE|SCRIPT)$/.test(child.tagName)
					);
				});
				const inlineFlow =
					!flexContainer &&
					inlineChildren.length > 0 &&
					inlineChildren.every((child) => {
						const {display} = getTimelineSceneStyle(child);
						return (
							display?.startsWith('inline') ||
							(display === undefined &&
								/^(#TEXT|SPAN|A|LABEL|BUTTON|INPUT|SVG|IMG|BR)$/.test(
									child.tagName,
								))
						);
					});
				node.setFlexDirection(
					flexContainer
						? style.flexDirection === 'row-reverse'
							? FlexDirection.RowReverse
							: style.flexDirection === 'column-reverse'
								? FlexDirection.ColumnReverse
								: style.flexDirection === 'column'
									? FlexDirection.Column
									: FlexDirection.Row
						: inlineFlow
							? FlexDirection.Row
							: FlexDirection.Column,
				);

				node.setPositionType(
					style.position === 'absolute' || style.position === 'fixed'
						? PositionType.Absolute
						: style.position === 'relative' || style.position === 'sticky'
							? PositionType.Relative
							: PositionType.Static,
				);
				if (scene === root) node.setPositionType(PositionType.Relative);
				node.setAlwaysFormsContainingBlock(
					[style.transform, style.filter, style.perspective].some(
						(value) => value !== undefined && value !== 'none',
					),
				);
				const flex = flexItem ? style.flex : undefined;
				node.setFlexGrow(0);
				node.setFlexShrink(flexItem ? 1 : 0);
				node.setFlexBasis('auto');
				if (typeof flex === 'number') {
					node.setFlexGrow(flex);
					node.setFlexBasis(0);
				} else if (flex === 'none') node.setFlexShrink(0);
				else if (flex === 'auto') node.setFlexGrow(1);
				else if (typeof flex === 'string' && flex !== 'initial') {
					const parts = splitTimelineSceneStyleValues(flex);
					node.setFlexGrow(parseFloat(parts[0]) || 0);
					node.setFlexShrink(
						parts[1] === undefined ? 1 : parseFloat(parts[1]) || 0,
					);
					node.setFlexBasis(
						dimension(
							parts[2] ?? 0,
							parentStyle?.flexDirection?.startsWith('column')
								? parentHeight
								: parentWidth,
						),
					);
				}

				if (flexItem && style.flexGrow !== undefined)
					node.setFlexGrow(Number(style.flexGrow));
				if (flexItem && style.flexBasis !== undefined)
					node.setFlexBasis(
						dimension(
							style.flexBasis,
							parentStyle?.flexDirection?.startsWith('column')
								? parentHeight
								: parentWidth,
						),
					);
				if (flexItem && style.flexShrink !== undefined)
					node.setFlexShrink(Number(style.flexShrink));

				const aligns: Record<string, Align> = {
					'flex-start': Align.FlexStart,
					'flex-end': Align.FlexEnd,
					center: Align.Center,
					stretch: Align.Stretch,
					baseline: Align.Baseline,
					auto: Align.Auto,
				};
				node.setAlignItems(
					flexContainer
						? (aligns[String(style.alignItems)] ?? Align.Stretch)
						: inlineFlow
							? Align.Center
							: Align.Stretch,
				);
				node.setAlignSelf(
					flexItem
						? (aligns[String(style.alignSelf)] ?? Align.Auto)
						: Align.Auto,
				);
				const justifies: Record<string, Justify> = {
					'flex-start': Justify.FlexStart,
					'flex-end': Justify.FlexEnd,
					center: Justify.Center,
					'space-between': Justify.SpaceBetween,
					'space-around': Justify.SpaceAround,
					'space-evenly': Justify.SpaceEvenly,
				};
				node.setJustifyContent(
					flexContainer
						? (justifies[String(style.justifyContent)] ?? Justify.FlexStart)
						: inlineFlow &&
							  (style.textAlign === 'center' ||
									(scene.tagName === 'BUTTON' && style.textAlign === undefined))
							? Justify.Center
							: inlineFlow &&
								  (style.textAlign === 'right' || style.textAlign === 'end')
								? Justify.FlexEnd
								: Justify.FlexStart,
				);
				node.setFlexWrap(
					(flexContainer && style.flexWrap === 'wrap') ||
						(inlineFlow &&
							getTimelineSceneTextStyle(scene).whiteSpace !== 'nowrap')
						? Wrap.Wrap
						: Wrap.NoWrap,
				);
				node.setWidth(
					dimension(
						style.width ??
							(scene.tagName === 'SVG' ? scene.props.width : undefined),
						parentWidth,
					),
				);
				node.setHeight(
					dimension(
						style.height ??
							(scene.tagName === 'SVG' ? scene.props.height : undefined),
						parentHeight,
					),
				);
				if (
					scene.props['data-name'] !== undefined &&
					scene.classList.contains('remotion-timeline-sequence-name-measure') &&
					style.width === undefined
				) {
					node.setWidth(
						measureTimelineSceneText(String(scene.props['data-name']), scene),
					);
				}

				if (style.width === 'max-content')
					node.setWidth(measureTimelineSceneText(scene.textContent, scene));

				for (const [key, setter, available] of [
					['minWidth', node.setMinWidth.bind(node), parentWidth],
					['maxWidth', node.setMaxWidth.bind(node), parentWidth],
					['minHeight', node.setMinHeight.bind(node), parentHeight],
					['maxHeight', node.setMaxHeight.bind(node), parentHeight],
				] as const) {
					const value = dimension(style[key], available);
					if (value !== 'auto') setter(value);
				}

				if (style.aspectRatio !== undefined)
					node.setAspectRatio(Number(style.aspectRatio));
				else if (scene.tagName === 'SVG') {
					const box = String(scene.props.viewBox ?? '')
						.split(/[\s,]+/)
						.map(Number);
					if (box[2] > 0 && box[3] > 0) node.setAspectRatio(box[2] / box[3]);
				}

				node.setGap(
					Gutter.Row,
					dimension(style.rowGap ?? style.gap, parentHeight) as
						| number
						| `${number}%`
						| undefined,
				);
				node.setGap(
					Gutter.Column,
					dimension(style.columnGap ?? style.gap, parentWidth) as
						| number
						| `${number}%`
						| undefined,
				);
				for (const [name, edge, available] of [
					['Top', Edge.Top, parentHeight],
					['Right', Edge.Right, parentWidth],
					['Bottom', Edge.Bottom, parentHeight],
					['Left', Edge.Left, parentWidth],
				] as const) {
					const side = name.toLowerCase() as
						| 'top'
						| 'right'
						| 'bottom'
						| 'left';
					const pos = dimension(style[side] ?? style.inset, available);
					if (pos !== 'auto') node.setPosition(edge, pos);
					const margin = style[`margin${name}`] ?? style.margin;
					const padding = style[`padding${name}`] ?? style.padding;
					const pick = (value: unknown) => {
						if (
							typeof value !== 'string' ||
							!value.includes(' ') ||
							value.startsWith('calc(')
						)
							return value;
						const parts = splitTimelineSceneStyleValues(value);
						const index =
							name === 'Top'
								? 0
								: name === 'Right'
									? 1
									: name === 'Bottom'
										? 2
										: 3;
						return parts[index] ?? parts[index % 2] ?? parts[0];
					};

					node.setMargin(edge, dimension(pick(margin), available));
					const pad = dimension(pick(padding), available);
					if (pad !== 'auto') node.setPadding(edge, pad);
					const border =
						style[`border${name}Width`] ??
						pick(style.borderWidth) ??
						style[`border${name}`] ??
						style.border;
					node.setBorder(
						edge,
						style[`border${name}Style`] === 'none' ||
							style.borderStyle === 'none'
							? 0
							: typeof border === 'number'
								? border
								: parseFloat(String(border)) || 0,
					);
				}

				scene.children.sort((a, b) => a.order.localeCompare(b.order));
				if (
					scene.text !== null ||
					/^(INPUT|TEXTAREA|IMG|SVG)$/.test(scene.tagName)
				) {
					node.setMeasureFunc(
						(available, mode, availableHeight, heightMode) => {
							if (scene.tagName === 'SVG' || scene.tagName === 'IMG') {
								const box = String(scene.props.viewBox ?? '')
									.split(/[\s,]+/)
									.map(Number);
								const naturalWidth =
									scene.tagName === 'SVG'
										? Number(scene.props.width ?? box[2] ?? 16)
										: (scene.image?.naturalWidth ?? 20);
								const naturalHeight =
									scene.tagName === 'SVG'
										? Number(scene.props.height ?? box[3] ?? 16)
										: (scene.image?.naturalHeight ?? 20);
								const ratio = naturalWidth / Math.max(1, naturalHeight);
								const measuredWidth =
									mode === MeasureMode.Exactly
										? available
										: heightMode === MeasureMode.Exactly
											? availableHeight * ratio
											: mode === MeasureMode.AtMost
												? Math.min(available, naturalWidth)
												: naturalWidth;
								return {
									width: measuredWidth,
									height:
										heightMode === MeasureMode.Exactly
											? availableHeight
											: measuredWidth / ratio,
								};
							}

							if (scene.tagName === 'INPUT' && scene.props.type === 'range')
								return {
									width:
										mode === MeasureMode.Exactly
											? available
											: Math.min(
													mode === MeasureMode.AtMost ? available : Infinity,
													129,
												),
									height: 16,
								};
							const font = getTimelineSceneTextStyle(scene);
							const rawText = scene.text ?? scene.value;
							const text = /^(pre|pre-wrap|break-spaces)$/.test(font.whiteSpace)
								? rawText
								: rawText.replace(/\s+/g, ' ');
							const natural = Math.max(
								0,
								...text
									.split('\n')
									.map((line) => measureTimelineSceneText(line, scene)),
							);
							const lineHeight =
								font.lineHeight === 'normal'
									? font.fontSize * 1.2
									: parseFloat(font.lineHeight) *
										(/^[\d.]+$/.test(font.lineHeight)
											? font.fontSize
											: font.lineHeight.endsWith('%')
												? font.fontSize / 100
												: 1);
							const wrap =
								!/^(nowrap|pre)$/.test(font.whiteSpace) &&
								scene.tagName !== 'INPUT' &&
								mode !== MeasureMode.Undefined &&
								available > 0;
							let lines = 0;
							for (const paragraph of text.split('\n')) {
								let line = '';
								lines++;
								if (!wrap) continue;
								for (const word of paragraph.split(/(\s+)/)) {
									if (
										line &&
										measureTimelineSceneText(line + word, scene) > available
									) {
										lines++;
										line = word.trimStart();
									} else line += word;
								}
							}

							return {
								width:
									mode === MeasureMode.Exactly
										? available
										: mode === MeasureMode.AtMost
											? Math.min(available, natural)
											: natural,
								height: Math.max(1, lines) * lineHeight,
							};
						},
					);
				} else
					for (const child of scene.children)
						node.insertChild(build(child), node.getChildCount());
				return node;
			};

			const tree = build(root);
			tree.setWidth(width);
			tree.setHeight(height);
			tree.calculateLayout(width, height, Direction.LTR);
			// Yoga includes a flex item's minimum in its starting basis, unlike
			// CSS's zero-basis proportional split. Freeze bounded shares first,
			// then use those shares as bases so split panels and flex spacers agree.
			const resolvedDimensions = new Map<
				TimelineSceneNode,
				Map<string, number>
			>();
			for (let pass = 0; pass < 4; pass++) {
				let changed = false;
				for (const scene of present) {
					const node = nodes.get(scene)!;
					const style = getTimelineSceneStyle(scene);
					const parent = scene.parent ? nodes.get(scene.parent) : null;
					if (parent) {
						for (const [key, setter, reference] of [
							['width', node.setWidth.bind(node), parent.getComputedWidth()],
							[
								'left',
								(value: number) => node.setPosition(Edge.Left, value),
								parent.getComputedWidth(),
							],
							[
								'right',
								(value: number) => node.setPosition(Edge.Right, value),
								parent.getComputedWidth(),
							],
							[
								'top',
								(value: number) => node.setPosition(Edge.Top, value),
								parent.getComputedHeight(),
							],
							[
								'bottom',
								(value: number) => node.setPosition(Edge.Bottom, value),
								parent.getComputedHeight(),
							],
							[
								'paddingLeft',
								(value: number) => node.setPadding(Edge.Left, value),
								parent.getComputedWidth(),
							],
							[
								'paddingRight',
								(value: number) => node.setPadding(Edge.Right, value),
								parent.getComputedWidth(),
							],
							[
								'paddingTop',
								(value: number) => node.setPadding(Edge.Top, value),
								parent.getComputedWidth(),
							],
							[
								'paddingBottom',
								(value: number) => node.setPadding(Edge.Bottom, value),
								parent.getComputedWidth(),
							],
							[
								'minWidth',
								node.setMinWidth.bind(node),
								parent.getComputedWidth(),
							],
							[
								'maxWidth',
								node.setMaxWidth.bind(node),
								parent.getComputedWidth(),
							],
							['height', node.setHeight.bind(node), parent.getComputedHeight()],
							[
								'minHeight',
								node.setMinHeight.bind(node),
								parent.getComputedHeight(),
							],
							[
								'maxHeight',
								node.setMaxHeight.bind(node),
								parent.getComputedHeight(),
							],
						] as const) {
							const value = style[key];
							if (
								typeof value === 'string' &&
								/^(calc|min|max|clamp)\(/.test(value)
							) {
								const result = dimension(value, reference);
								if (typeof result !== 'number') continue;
								const resolved =
									resolvedDimensions.get(scene) ?? new Map<string, number>();
								if (resolved.get(key) === result) continue;
								setter(result);
								resolved.set(key, result);
								resolvedDimensions.set(scene, resolved);
								changed = true;
							}
						}
					}

					if (parent && scene.parent) {
						const parentStyle = getTimelineSceneStyle(scene.parent);
						const basis =
							style.flexBasis ??
							(typeof style.flex === 'string'
								? splitTimelineSceneStyleValues(style.flex)[2]
								: null);
						if (
							(parentStyle.display === 'flex' ||
								parentStyle.display === 'inline-flex') &&
							typeof basis === 'string' &&
							/^(calc|min|max|clamp)\(/.test(basis)
						) {
							const parentRow =
								!parentStyle.flexDirection?.startsWith('column');
							const reference =
								(parentRow
									? parent.getComputedWidth()
									: parent.getComputedHeight()) -
								parent.getComputedPadding(parentRow ? Edge.Left : Edge.Top) -
								parent.getComputedPadding(
									parentRow ? Edge.Right : Edge.Bottom,
								) -
								parent.getComputedBorder(parentRow ? Edge.Left : Edge.Top) -
								parent.getComputedBorder(parentRow ? Edge.Right : Edge.Bottom);
							const resolved = physical(basis, reference);
							if (
								resolved !== undefined &&
								Math.abs(node.getFlexBasis().value - resolved) > 0.001
							) {
								node.setFlexBasis(resolved);
								changed = true;
							}
						}
					}

					if (style.display !== 'flex' && style.display !== 'inline-flex')
						continue;
					const row =
						style.flexDirection !== 'column' &&
						style.flexDirection !== 'column-reverse';
					const start = row ? Edge.Left : Edge.Top;
					const end = row ? Edge.Right : Edge.Bottom;
					const mainSize =
						(row ? node.getComputedWidth() : node.getComputedHeight()) -
						node.getComputedPadding(start) -
						node.getComputedPadding(end) -
						node.getComputedBorder(start) -
						node.getComputedBorder(end);
					const children = scene.children.filter((child) => {
						const childStyle = getTimelineSceneStyle(child);
						return (
							nodes.has(child) &&
							childStyle.display !== 'none' &&
							childStyle.position !== 'absolute' &&
							childStyle.position !== 'fixed' &&
							!/^(STYLE|SCRIPT)$/.test(child.tagName)
						);
					});
					let remaining =
						mainSize -
						Math.max(0, children.length - 1) *
							(physical(
								(row ? style.columnGap : style.rowGap) ?? style.gap,
								mainSize,
							) ?? 0);
					const shares: {
						node: YogaNode;
						grow: number;
						min: number;
						max: number;
						size: number | null;
					}[] = [];
					for (const child of children) {
						const childNode = nodes.get(child)!;
						const childStyle = getTimelineSceneStyle(child);
						const flexParts =
							typeof childStyle.flex === 'string'
								? splitTimelineSceneStyleValues(childStyle.flex)
								: null;
						const grow =
							childStyle.flexGrow ??
							(typeof childStyle.flex === 'number'
								? childStyle.flex
								: flexParts
									? parseFloat(flexParts[0])
									: 0);
						const basis =
							childStyle.flexBasis ??
							(typeof childStyle.flex === 'number'
								? 0
								: flexParts &&
									  flexParts[0] !== 'auto' &&
									  flexParts[0] !== 'none'
									? (flexParts[2] ?? 0)
									: 'auto');
						remaining -=
							childNode.getComputedMargin(start) +
							childNode.getComputedMargin(end);
						if (
							Number(grow) > 0 &&
							(basis === 0 ||
								basis === '0%' ||
								basis === '0' ||
								basis === '0px')
						) {
							shares.push({
								node: childNode,
								grow: Number(grow),
								min:
									physical(
										row ? childStyle.minWidth : childStyle.minHeight,
										mainSize,
									) ?? 0,
								max:
									physical(
										row ? childStyle.maxWidth : childStyle.maxHeight,
										mainSize,
									) ?? Infinity,
								size: null,
							});
						} else
							remaining -= row
								? childNode.getComputedWidth()
								: childNode.getComputedHeight();
					}

					let unfrozen = shares.filter((share) => share.size === null);
					while (unfrozen.length > 0) {
						const total = unfrozen.reduce((sum, share) => sum + share.grow, 0);
						let frozen = false;
						const availableShareSpace = Math.max(0, remaining);
						for (const share of unfrozen) {
							const proposed = (availableShareSpace * share.grow) / total;
							const bounded = Math.max(
								share.min,
								Math.min(share.max, proposed),
							);
							if (bounded !== proposed) {
								share.size = bounded;
								remaining -= bounded;
								frozen = true;
							}
						}

						if (!frozen) {
							for (const share of unfrozen)
								share.size = (Math.max(0, remaining) * share.grow) / total;
							break;
						}

						unfrozen = shares.filter((share) => share.size === null);
					}

					for (const share of shares) {
						if (Math.abs(share.node.getFlexBasis().value - share.size!) < 0.001)
							continue;
						share.node.setFlexBasis(share.size!);
						changed = true;
					}
				}

				if (!changed) break;
				tree.calculateLayout(width, height, Direction.LTR);
			}

			for (const [scene, node] of nodes) {
				if (!present.has(scene)) {
					node.free();
					nodes.delete(scene);
					coordinates.delete(scene);
					continue;
				}

				const rect = node.getComputedLayout();
				coordinates.set(scene, {
					x: rect.left,
					y: rect.top,
					width: rect.width,
					height: rect.height,
				});
			}

			const absoluteChildren = new Map<
				TimelineSceneNode,
				TimelineSceneNode[]
			>();
			const unscrolledOrigins = new Map<
				TimelineSceneNode,
				{x: number; y: number}
			>();
			for (const scene of present) {
				const rect = coordinates.get(scene)!;
				const parent = scene.parent
					? unscrolledOrigins.get(scene.parent)
					: null;
				unscrolledOrigins.set(scene, {
					x: (parent?.x ?? 0) + rect.x,
					y: (parent?.y ?? 0) + rect.y,
				});
				if (scene.style.position === 'absolute') {
					const containingBlock = getContainingBlock(scene, root);
					const children = absoluteChildren.get(containingBlock) ?? [];
					children.push(scene);
					absoluteChildren.set(containingBlock, children);
				}
			}

			// Flow overflow propagates to clipping ancestors. Absolute overlays
			// belong to their containing block, bypassing static scrollers between
			// that block and the overlay (notably the pinned ruler/playhead).
			for (const scene of [...present].reverse()) {
				let contentWidth = 0;
				let contentHeight = 0;
				const origin = unscrolledOrigins.get(scene)!;
				for (const child of [
					...scene.children.filter(
						(entry) => entry.style.position !== 'absolute',
					),
					...(absoluteChildren.get(scene) ?? []),
				]) {
					const rect = coordinates.get(child);
					const style = getTimelineSceneStyle(child);
					if (!rect || style.display === 'none' || style.position === 'fixed')
						continue;
					const horizontalClipping = /^(hidden|auto|scroll|clip)$/.test(
						String(style.overflowX ?? style.overflow ?? ''),
					);
					const verticalClipping = /^(hidden|auto|scroll|clip)$/.test(
						String(style.overflowY ?? style.overflow ?? ''),
					);
					const childNode = nodes.get(child)!;
					const childOrigin = unscrolledOrigins.get(child)!;
					contentWidth = Math.max(
						contentWidth,
						childOrigin.x -
							origin.x +
							(horizontalClipping
								? rect.width
								: Math.max(rect.width, child.contentWidth)) +
							childNode.getComputedMargin(Edge.Right),
					);
					contentHeight = Math.max(
						contentHeight,
						childOrigin.y -
							origin.y +
							(verticalClipping
								? rect.height
								: Math.max(rect.height, child.contentHeight)) +
							childNode.getComputedMargin(Edge.Bottom),
					);
				}

				scene.contentWidth = contentWidth;
				scene.contentHeight = contentHeight;
			}

			project(root, width, height);
			let scrollClamped = false;
			for (const scene of present) {
				const left = Math.min(
					scene.scrollLeft,
					scene.scrollWidth - scene.clientWidth,
				);
				const top = Math.min(
					scene.scrollTop,
					scene.scrollHeight - scene.clientHeight,
				);
				if (left !== scene.scrollLeft || top !== scene.scrollTop) {
					scene.scrollLeft = left;
					scene.scrollTop = top;
					scrollClamped = true;
				}
			}

			if (scrollClamped) project(root, width, height);
		},
		destroy: () => {
			for (const node of nodes.values())
				while (node.getChildCount()) node.removeChild(node.getChild(0));
			for (const node of nodes.values()) node.free();
			nodes.clear();
			defaults.free();
			config.free();
		},
	};
};
