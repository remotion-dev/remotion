type PaintOrderPart = {
	readonly element: HTMLElement;
	readonly phase: number;
	readonly zIndex: number;
};

type ElementPaintOrder = {
	readonly context: readonly PaintOrderPart[];
	readonly flow: readonly PaintOrderPart[];
	readonly paint: readonly PaintOrderPart[];
};

// Match CSS painting order within each stacking context. A large z-index in an
// isolated clip must not escape that clip and cover a later sibling context.
export const sortTimelinePaintEntries = <T extends {element: HTMLElement}>(
	entries: readonly T[],
	root: HTMLElement,
	styles: Map<Element, CSSStyleDeclaration>,
): T[] => {
	const orders = new Map<HTMLElement, ElementPaintOrder>();
	const getStyle = (element: HTMLElement) => {
		const cached = styles.get(element);
		if (cached) {
			return cached;
		}

		const style = getComputedStyle(element);
		styles.set(element, style);
		return style;
	};

	const getOrder = (element: HTMLElement): ElementPaintOrder => {
		const cached = orders.get(element);
		if (cached) {
			return cached;
		}

		const parent = element.parentElement;
		if (element === root || parent === null) {
			const rootOrder = {context: [], flow: [], paint: []};
			orders.set(element, rootOrder);
			return rootOrder;
		}

		const parentOrder = getOrder(parent);
		const style = getStyle(element);
		const positioned = style.position !== 'static';
		const flexOrGridItem = /^(inline-)?(flex|grid)$/.test(
			getStyle(parent).display,
		);
		const zIndexApplies = positioned || flexOrGridItem;
		const zIndex = zIndexApplies ? Number.parseInt(style.zIndex, 10) || 0 : 0;
		const stackingContext =
			(zIndexApplies && style.zIndex !== 'auto') ||
			style.position === 'fixed' ||
			style.position === 'sticky' ||
			Number(style.opacity) < 1 ||
			style.isolation === 'isolate' ||
			style.transform !== 'none' ||
			style.translate !== 'none' ||
			style.rotate !== 'none' ||
			style.scale !== 'none' ||
			style.perspective !== 'none' ||
			style.filter !== 'none' ||
			style.backdropFilter !== 'none' ||
			style.mixBlendMode !== 'normal' ||
			style.clipPath !== 'none' ||
			style.maskImage !== 'none' ||
			/\b(layout|paint|strict|content)\b/.test(style.contain) ||
			/\b(transform|translate|rotate|scale|opacity|filter|perspective|clip-path|mask|mask-image)\b/.test(
				style.willChange,
			);

		let order: ElementPaintOrder;
		if (stackingContext) {
			const context = [
				...parentOrder.context,
				{element, phase: zIndex < 0 ? 1 : zIndex > 0 ? 6 : 5, zIndex},
			];
			// The context's own background is below all of its descendants,
			// including descendants with a negative z-index.
			order = {context, flow: context, paint: context};
		} else if (positioned) {
			const flow = [...parentOrder.context, {element, phase: 5, zIndex: 0}];
			// Positioned auto boxes group their normal-flow contents, but their
			// positioned descendants still belong to the parent stacking context.
			order = {context: parentOrder.context, flow, paint: flow};
		} else {
			const floating = style.cssFloat !== 'none';
			const inline = style.display.startsWith('inline');
			const paint = [
				...parentOrder.flow,
				{
					element,
					phase: floating ? 3 : inline || flexOrGridItem ? 4 : 2,
					zIndex: 0,
				},
			];
			order = {
				context: parentOrder.context,
				flow:
					floating || flexOrGridItem || (inline && style.display !== 'inline')
						? paint
						: parentOrder.flow,
				paint,
			};
		}

		orders.set(element, order);
		return order;
	};

	const sorted = [...entries];
	for (const {element} of sorted) {
		getOrder(element);
	}

	return sorted.sort((a, b) => {
		const left = orders.get(a.element)!.paint;
		const right = orders.get(b.element)!.paint;
		for (let index = 0; index < Math.min(left.length, right.length); index++) {
			const leftPart = left[index];
			const rightPart = right[index];
			if (leftPart.element === rightPart.element) {
				continue;
			}

			const layer =
				leftPart.phase - rightPart.phase || leftPart.zIndex - rightPart.zIndex;
			if (layer !== 0) {
				return layer;
			}

			return leftPart.element.compareDocumentPosition(rightPart.element) &
				Node.DOCUMENT_POSITION_FOLLOWING
				? -1
				: 1;
		}

		return left.length - right.length;
	});
};
