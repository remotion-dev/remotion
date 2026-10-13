import type {TimelineSceneNode} from './timeline-scene-node';
import {
	getTimelineSceneNodeOrder,
	getTimelineSceneStyle,
	getTimelineSceneTextStyle,
} from './timeline-scene-paint';

type NativeEditor = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

type SceneEventController = {
	readonly root: TimelineSceneNode;
	readonly focusedNode: TimelineSceneNode | null;
	hitTest: (clientX: number, clientY: number) => TimelineSceneNode[];
	focus: (node: TimelineSceneNode, options: FocusOptions | null) => void;
	blur: (node: TimelineSceneNode) => void;
	click: (node: TimelineSceneNode) => void;
	refresh: () => void;
	dispose: () => void;
	getEditor: (node: TimelineSceneNode) => NativeEditor | null;
	capturePointer: (node: TimelineSceneNode, pointerId: number) => void;
	releasePointer: (node: TimelineSceneNode, pointerId: number) => void;
};

const controllers = new Set<SceneEventController>();

const getController = (node: TimelineSceneNode) => {
	return [...controllers].find(({root}) => root.contains(node)) ?? null;
};

export const sceneNodesFromPoint = (clientX: number, clientY: number) => {
	return [...controllers]
		.reverse()
		.flatMap((controller) => controller.hitTest(clientX, clientY));
};

export const getFocusedTimelineSceneNode = (): TimelineSceneNode | null => {
	for (const controller of controllers) {
		const {focusedNode, root} = controller;
		if (focusedNode === null) continue;
		const {canvas} = root.store;
		const activeElement = canvas?.ownerDocument.activeElement;
		if (
			activeElement === canvas ||
			activeElement === controller.getEditor(focusedNode)
		)
			return focusedNode;
	}

	return null;
};

export const focusTimelineSceneNode = (
	node: TimelineSceneNode,
	options: FocusOptions | null,
) => getController(node)?.focus(node, options);

export const blurTimelineSceneNode = (node: TimelineSceneNode) =>
	getController(node)?.blur(node);

export const clickTimelineSceneNode = (node: TimelineSceneNode) =>
	getController(node)?.click(node);

export const getTimelineSceneEditor = (node: TimelineSceneNode) =>
	getController(node)?.getEditor(node) ?? null;

export const selectTimelineSceneNode = (node: TimelineSceneNode) => {
	const editor = getTimelineSceneEditor(node);
	if (
		editor instanceof HTMLInputElement ||
		editor instanceof HTMLTextAreaElement
	) {
		editor.select();
	}
};

export const setTimelineSceneSelectionRange = (
	node: TimelineSceneNode,
	start: number | null,
	end: number | null,
	direction: 'forward' | 'backward' | 'none' | null,
) => {
	const editor = getTimelineSceneEditor(node);
	if (
		editor instanceof HTMLInputElement ||
		editor instanceof HTMLTextAreaElement
	) {
		editor.setSelectionRange(start, end, direction ?? undefined);
	}
};

export const captureTimelineScenePointer = (
	node: TimelineSceneNode,
	pointerId: number,
) => getController(node)?.capturePointer(node, pointerId);

export const releaseTimelineScenePointer = (
	node: TimelineSceneNode,
	pointerId: number,
) => getController(node)?.releasePointer(node, pointerId);

const eventProps: Record<string, string> = {
	pointerdown: 'onPointerDown',
	pointermove: 'onPointerMove',
	pointerup: 'onPointerUp',
	pointercancel: 'onPointerCancel',
	pointerover: 'onPointerOver',
	pointerout: 'onPointerOut',
	pointerenter: 'onPointerEnter',
	pointerleave: 'onPointerLeave',
	gotpointercapture: 'onGotPointerCapture',
	lostpointercapture: 'onLostPointerCapture',
	mousedown: 'onMouseDown',
	mousemove: 'onMouseMove',
	mouseup: 'onMouseUp',
	mouseover: 'onMouseOver',
	mouseout: 'onMouseOut',
	mouseenter: 'onMouseEnter',
	mouseleave: 'onMouseLeave',
	click: 'onClick',
	dblclick: 'onDoubleClick',
	contextmenu: 'onContextMenu',
	wheel: 'onWheel',
	keydown: 'onKeyDown',
	keyup: 'onKeyUp',
	keypress: 'onKeyPress',
	focus: 'onFocus',
	blur: 'onBlur',
	input: 'onInput',
	change: 'onChange',
	compositionstart: 'onCompositionStart',
	compositionupdate: 'onCompositionUpdate',
	compositionend: 'onCompositionEnd',
	dragenter: 'onDragEnter',
	dragleave: 'onDragLeave',
	dragover: 'onDragOver',
	drop: 'onDrop',
	touchstart: 'onTouchStart',
	touchmove: 'onTouchMove',
	touchend: 'onTouchEnd',
	touchcancel: 'onTouchCancel',
	scroll: 'onScroll',
};

const getAncestors = (node: TimelineSceneNode | null) => {
	const nodes: TimelineSceneNode[] = [];
	for (let current = node; current !== null; current = current.parent) {
		nodes.push(current);
	}

	return nodes;
};

const isDisabled = (node: TimelineSceneNode) =>
	node.props.disabled === true ||
	node.props['aria-disabled'] === true ||
	node.props['aria-disabled'] === 'true';

const isFocusable = (node: TimelineSceneNode) => {
	if (
		getAncestors(node).some(isDisabled) ||
		(node.tagName === 'INPUT' && node.props.type === 'hidden')
	) {
		return false;
	}

	return (
		typeof node.props.tabIndex === 'number' ||
		['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(node.tagName) ||
		(node.tagName === 'A' && typeof node.props.href === 'string')
	);
};

const isNativeEditor = (node: TimelineSceneNode) => {
	return (
		node.tagName === 'TEXTAREA' ||
		node.tagName === 'SELECT' ||
		(node.tagName === 'INPUT' &&
			![
				'range',
				'checkbox',
				'radio',
				'button',
				'submit',
				'reset',
				'hidden',
			].includes(String(node.props.type ?? 'text')))
	);
};

export const attachTimelineSceneEvents = ({
	canvas,
	root,
	invalidate,
}: {
	canvas: HTMLCanvasElement;
	root: TimelineSceneNode;
	invalidate: () => void;
}): SceneEventController => {
	let focusedNode: TimelineSceneNode | null = null;
	let blurRevision = 0;
	let hoverPath: TimelineSceneNode[] = [];
	let dragTarget: TimelineSceneNode | null = null;
	let editor: {node: TimelineSceneNode; element: NativeEditor} | null = null;
	let disposed = false;
	let rangeDrag: {node: TimelineSceneNode; pointerId: number} | null = null;
	let scrollbarDrag: {
		node: TimelineSceneNode;
		pointerId: number;
		axis: 'x' | 'y';
		offset: number;
	} | null = null;
	let pointerDownTarget: TimelineSceneNode | null = null;
	let suppressClick = false;
	let spacePressedNode: TimelineSceneNode | null = null;
	let paintOrder: TimelineSceneNode[] | null = null;
	const capturedPointers = new Map<number, TimelineSceneNode>();
	const autofocusNodes = new WeakSet<TimelineSceneNode>();
	const disposers: (() => void)[] = [];
	const previousTabIndex = canvas.getAttribute('tabindex');
	const previousTouchAction = canvas.style.touchAction;
	canvas.tabIndex = 0;
	canvas.style.touchAction = 'none';

	const getPaintOrder = () => {
		paintOrder ??= getTimelineSceneNodeOrder(root);
		return paintOrder;
	};

	const isVisible = (node: TimelineSceneNode) => {
		const {rect} = node;
		let left = Math.max(0, rect.x);
		let top = Math.max(0, rect.y);
		let right = Math.min(canvas.clientWidth, rect.x + rect.width);
		let bottom = Math.min(canvas.clientHeight, rect.y + rect.height);
		for (const ancestor of getAncestors(node)) {
			const style = getTimelineSceneStyle(ancestor);
			if (style.display === 'none' || style.visibility === 'hidden') {
				return false;
			}

			if (ancestor.clip !== null) {
				left = Math.max(left, ancestor.clip.left);
				top = Math.max(top, ancestor.clip.top);
				right = Math.min(right, ancestor.clip.right);
				bottom = Math.min(bottom, ancestor.clip.bottom);
			}
		}

		return right > left && bottom > top;
	};

	const hitTest = (clientX: number, clientY: number) => {
		const bounds = canvas.getBoundingClientRect();
		const x = clientX - bounds.left;
		const y = clientY - bounds.top;
		if (
			!Number.isFinite(x) ||
			!Number.isFinite(y) ||
			x < 0 ||
			y < 0 ||
			x >= bounds.width ||
			y >= bounds.height
		) {
			return [];
		}

		return getPaintOrder()
			.toReversed()
			.filter((node) => {
				if (node.text !== null || !isVisible(node)) return false;
				const {rect} = node;
				if (
					x < rect.x ||
					y < rect.y ||
					x >= rect.x + rect.width ||
					y >= rect.y + rect.height
				) {
					return false;
				}

				let acceptsPointer: boolean | null = null;
				for (const ancestor of getAncestors(node)) {
					const style = getTimelineSceneStyle(ancestor);
					if (acceptsPointer === null && style.pointerEvents !== undefined) {
						acceptsPointer = style.pointerEvents !== 'none';
					}

					const {clip} = ancestor;
					if (
						clip !== null &&
						(x < clip.left ||
							y < clip.top ||
							x >= clip.right ||
							y >= clip.bottom)
					) {
						return false;
					}
				}

				return acceptsPointer !== false;
			});
	};

	const dispatch = ({
		type,
		target,
		nativeEvent,
		relatedTarget,
		bubbles,
		nativeTarget,
	}: {
		type: string;
		target: TimelineSceneNode;
		nativeEvent: Event;
		relatedTarget: TimelineSceneNode | null;
		bubbles: boolean;
		nativeTarget: NativeEditor | null;
	}) => {
		let propagationStopped = false;
		let immediateStopped = false;
		let currentTarget: TimelineSceneNode = target;
		let phase: number = Event.CAPTURING_PHASE;
		const event = new Proxy(nativeEvent, {
			get: (source, key) => {
				if (key === 'target') return nativeTarget ?? target;
				if (key === 'currentTarget') {
					return currentTarget === target
						? (nativeTarget ?? currentTarget)
						: currentTarget;
				}

				if (key === 'nativeEvent') return nativeEvent;
				if (key === 'type') return type;
				if (key === 'relatedTarget') return relatedTarget;
				if (key === 'eventPhase') return phase;
				if (key === 'persist') return () => undefined;
				if (key === 'isPropagationStopped') return () => propagationStopped;
				if (key === 'isDefaultPrevented') return () => source.defaultPrevented;
				if (key === 'stopPropagation') {
					return () => {
						propagationStopped = true;
						source.stopPropagation();
					};
				}

				if (key === 'stopImmediatePropagation') {
					return () => {
						immediateStopped = true;
						propagationStopped = true;
						source.stopImmediatePropagation();
					};
				}

				const value = Reflect.get(source, key, source);
				return typeof value === 'function' ? value.bind(source) : value;
			},
		});
		const path = bubbles ? getAncestors(target) : [target];
		const invoke = (node: TimelineSceneNode, capture: boolean) => {
			currentTarget = node;
			phase =
				node === target
					? Event.AT_TARGET
					: capture
						? Event.CAPTURING_PHASE
						: Event.BUBBLING_PHASE;
			const prop = eventProps[type];
			const handler =
				prop === undefined
					? null
					: node.props[`${prop}${capture ? 'Capture' : ''}`];
			if (typeof handler === 'function') {
				handler(event);
			}

			for (const entry of [...(node.listeners.get(type) ?? [])]) {
				if (immediateStopped) break;
				if (entry.capture !== capture) continue;
				if (typeof entry.listener === 'function') {
					entry.listener.call(node, event);
				} else {
					entry.listener.handleEvent(event);
				}
			}
		};

		for (const node of [...path].reverse()) {
			invoke(node, true);
			if (propagationStopped) break;
		}

		if (!propagationStopped) {
			for (const node of path) {
				invoke(node, false);
				if (propagationStopped) break;
			}
		}

		return nativeEvent.defaultPrevented;
	};

	const send = (type: string, target: TimelineSceneNode, nativeEvent: Event) =>
		dispatch({
			type,
			target,
			nativeEvent,
			relatedTarget: null,
			bubbles: true,
			nativeTarget: null,
		});

	const positionEditor = () => {
		if (editor === null) return;
		const {node, element} = editor;
		const bounds = canvas.getBoundingClientRect();
		let left = Math.max(0, -node.rect.x);
		let top = Math.max(0, -node.rect.y);
		let right = Math.max(0, node.rect.x + node.rect.width - bounds.width);
		let bottom = Math.max(0, node.rect.y + node.rect.height - bounds.height);
		for (const ancestor of getAncestors(node)) {
			if (ancestor.clip === null) continue;
			left = Math.max(left, ancestor.clip.left - node.rect.x);
			top = Math.max(top, ancestor.clip.top - node.rect.y);
			right = Math.max(
				right,
				node.rect.x + node.rect.width - ancestor.clip.right,
			);
			bottom = Math.max(
				bottom,
				node.rect.y + node.rect.height - ancestor.clip.bottom,
			);
		}

		Object.assign(element.style, {
			position: 'fixed',
			left: `${bounds.left + node.rect.x}px`,
			top: `${bounds.top + node.rect.y}px`,
			width: `${node.rect.width}px`,
			height: `${node.rect.height}px`,
			margin: '0',
			boxSizing: 'border-box',
			zIndex: '2',
			pointerEvents: 'auto',
			clipPath: `inset(${top}px ${right}px ${bottom}px ${left}px)`,
		});
	};

	const blur = (node: TimelineSceneNode) => {
		if (focusedNode !== node) return;
		blurRevision++;
		const oldEditor = editor?.node === node ? editor : null;
		focusedNode = null;
		node.focused = false;
		if (oldEditor !== null) node.value = oldEditor.element.value;
		dispatch({
			type: 'blur',
			target: node,
			nativeEvent: new FocusEvent('blur'),
			relatedTarget: null,
			bubbles: true,
			nativeTarget: oldEditor?.element ?? null,
		});
		// Blur handlers use their scene ref to validate the still-mounted input.
		// Preserve invalid drafts, as a normal input does when reportValidity focuses it.
		if (
			!disposed &&
			oldEditor !== null &&
			editor === oldEditor &&
			!oldEditor.element.checkValidity() &&
			root.contains(node)
		) {
			focusedNode = node;
			node.focused = true;
			oldEditor.element.focus({preventScroll: true});
			invalidate();
			return;
		}

		if (editor === oldEditor) editor = null;
		oldEditor?.element.remove();
		invalidate();
	};

	const focus = (node: TimelineSceneNode, options: FocusOptions | null) => {
		if (disposed || getAncestors(node).some(isDisabled)) return;
		if (focusedNode === node) {
			editor?.element.focus(options ?? undefined);
			return;
		}

		if (focusedNode !== null) blur(focusedNode);
		if (focusedNode !== null) return;
		focusedNode = node;
		node.focused = true;
		if (isNativeEditor(node)) {
			const element = document.createElement(
				node.tagName.toLowerCase(),
			) as NativeEditor;
			const textStyle = getTimelineSceneTextStyle(node);
			Object.assign(element.style, textStyle, {
				fontSize: `${textStyle.fontSize}px`,
				letterSpacing: `${textStyle.letterSpacing}px`,
			});
			for (const [key, value] of Object.entries(node.style)) {
				if (value === undefined || value === null) continue;
				try {
					(element.style as unknown as Record<string, string>)[key] =
						typeof value === 'number' &&
						![
							'opacity',
							'zIndex',
							'fontWeight',
							'lineHeight',
							'flex',
							'flexGrow',
							'flexShrink',
						].includes(key)
							? `${value}px`
							: String(value);
				} catch {
					// An unsupported CSS property does not prevent text editing.
				}
			}

			for (const key of [
				'type',
				'placeholder',
				'min',
				'max',
				'step',
				'maxLength',
				'minLength',
				'inputMode',
				'name',
				'autocomplete',
				'spellcheck',
				'aria-label',
			]) {
				const value = node.props[key];
				if (value !== undefined && value !== null)
					element.setAttribute(key, String(value));
			}

			if (element instanceof HTMLSelectElement) {
				for (const child of node.children) {
					const option = document.createElement('option');
					option.value = String(child.props.value ?? child.textContent);
					option.textContent = child.textContent;
					option.disabled = child.props.disabled === true;
					element.appendChild(option);
				}
			} else {
				element.readOnly = node.props.readOnly === true;
			}

			element.value = node.value;
			element.className = 'css-reset';
			element.dataset.timelineEditor = 'true';
			editor = {node, element};
			positionEditor();
			let lastChangeValue = element.value;
			const onEdit = (event: Event) => {
				node.value = element.value;
				if (
					element instanceof HTMLInputElement ||
					element instanceof HTMLTextAreaElement
				) {
					node.selectionStart = element.selectionStart;
					node.selectionEnd = element.selectionEnd;
				}

				if (event.type !== 'change') {
					dispatch({
						type: event.type,
						target: node,
						nativeEvent: event,
						relatedTarget: null,
						bubbles: true,
						nativeTarget: element,
					});
				}

				if (
					(event.type === 'input' || event.type === 'change') &&
					element.value !== lastChangeValue
				) {
					lastChangeValue = element.value;
					dispatch({
						type: 'change',
						target: node,
						nativeEvent: event,
						relatedTarget: null,
						bubbles: true,
						nativeTarget: element,
					});
				}

				node.value = element.value;
				invalidate();
			};

			for (const type of [
				'input',
				'change',
				'compositionstart',
				'compositionupdate',
				'compositionend',
			])
				element.addEventListener(type, onEdit);
			element.addEventListener('keydown', (event) =>
				onKey(event as KeyboardEvent, node, element),
			);
			element.addEventListener('keyup', (event) =>
				onKey(event as KeyboardEvent, node, element),
			);
			element.addEventListener('blur', () => {
				if (editor?.element === element) blur(node);
			});
			document.body.appendChild(element);
			element.focus(options ?? undefined);
		} else {
			canvas.focus(options ?? undefined);
		}

		dispatch({
			type: 'focus',
			target: node,
			nativeEvent: new FocusEvent('focus'),
			relatedTarget: null,
			bubbles: true,
			nativeTarget: editor?.element ?? null,
		});
		invalidate();
	};

	const setRangeValue = (
		node: TimelineSceneNode,
		value: number,
		event: Event,
	) => {
		const min = Number(node.props.min ?? 0);
		const max = Math.max(min, Number(node.props.max ?? 100));
		const step = node.props.step === 'any' ? 0 : Number(node.props.step ?? 1);
		const stepped =
			step > 0 ? min + Math.round((value - min) / step) * step : value;
		const next = String(
			Math.min(max, Math.max(min, Number(stepped.toPrecision(12)))),
		);
		if (next === node.value) return;
		node.value = next;
		send('input', node, event);
		send('change', node, event);
		invalidate();
	};

	const click = (
		node: TimelineSceneNode,
		event: MouseEvent = new MouseEvent('click', {
			bubbles: true,
			cancelable: true,
		}),
	) => {
		if (disposed || getAncestors(node).some(isDisabled)) return;
		const toggles =
			node.tagName === 'INPUT' &&
			['checkbox', 'radio'].includes(String(node.props.type));
		const previousChecked = node.checked;
		if (toggles) node.checked = node.props.type === 'radio' || !previousChecked;
		const prevented = send('click', node, event);
		if (toggles) {
			if (prevented) node.checked = previousChecked;
			else {
				send('input', node, event);
				send('change', node, event);
			}
		}

		invalidate();
	};

	const moveFocus = (backwards: boolean) => {
		const nodes = getPaintOrder().filter(
			(node) => isFocusable(node) && node.tabIndex >= 0 && isVisible(node),
		);
		nodes.sort(
			(a, b) =>
				(a.tabIndex > 0 ? a.tabIndex : Infinity) -
				(b.tabIndex > 0 ? b.tabIndex : Infinity),
		);
		const index = focusedNode === null ? -1 : nodes.indexOf(focusedNode);
		const next =
			nodes[index + (backwards ? -1 : 1)] ??
			(index === -1 && backwards ? nodes[nodes.length - 1] : null);
		if (next !== null && next !== undefined) {
			focus(next, {preventScroll: true});
			return true;
		}

		if (focusedNode !== null) blur(focusedNode);
		if (focusedNode !== null) return true;
		canvas.focus({preventScroll: true});
		return false;
	};

	const onKey = (
		event: KeyboardEvent,
		node: TimelineSceneNode,
		nativeTarget: NativeEditor | null,
	) => {
		const previousBlurRevision = blurRevision;
		const prevented = dispatch({
			type: event.type,
			target: node,
			nativeEvent: event,
			relatedTarget: null,
			bubbles: true,
			nativeTarget,
		});
		if (prevented) return;
		if (event.type === 'keydown' && event.key === 'Tab') {
			if (moveFocus(event.shiftKey)) event.preventDefault();
			return;
		}

		if (nativeTarget !== null) {
			if (
				event.type === 'keydown' &&
				event.key === 'Enter' &&
				node.tagName !== 'TEXTAREA' &&
				!event.isComposing
			) {
				event.preventDefault();
				event.stopPropagation();
				if (previousBlurRevision === blurRevision) blur(node);
				if (focusedNode === null) canvas.focus({preventScroll: true});
			}

			return;
		}

		if (
			node.tagName === 'INPUT' &&
			node.props.type === 'range' &&
			event.type === 'keydown'
		) {
			const min = Number(node.props.min ?? 0);
			const max = Number(node.props.max ?? 100);
			const step =
				node.props.step === 'any'
					? (max - min) / 100
					: Number(node.props.step ?? 1);
			const values: Record<string, number> = {
				ArrowLeft: Number(node.value) - step,
				ArrowDown: Number(node.value) - step,
				ArrowRight: Number(node.value) + step,
				ArrowUp: Number(node.value) + step,
				PageDown: Number(node.value) - (max - min) / 10,
				PageUp: Number(node.value) + (max - min) / 10,
				Home: min,
				End: max,
			};
			if (event.key in values) {
				event.preventDefault();
				event.stopPropagation();
				setRangeValue(node, values[event.key], event);
			}

			return;
		}

		if (isDisabled(node) || !['BUTTON', 'A', 'INPUT'].includes(node.tagName))
			return;
		if (event.key === 'Enter' && event.type === 'keydown') {
			event.preventDefault();
			event.stopPropagation();
			click(node);
		} else if (event.key === ' ' && event.type === 'keydown') {
			event.preventDefault();
			event.stopPropagation();
			spacePressedNode = node;
		} else if (
			event.key === ' ' &&
			event.type === 'keyup' &&
			spacePressedNode === node
		) {
			event.preventDefault();
			event.stopPropagation();
			spacePressedNode = null;
			click(node);
		}
	};

	const updateHover = (
		target: TimelineSceneNode | null,
		nativeEvent: Event,
	) => {
		const next = getAncestors(target);
		if (next[0] === hoverPath[0]) return;
		const oldTarget = hoverPath[0] ?? null;
		for (const node of hoverPath) {
			if (next.includes(node)) continue;
			node.hovered = false;
			for (const type of ['pointerleave', 'mouseleave'])
				dispatch({
					type,
					target: node,
					nativeEvent,
					relatedTarget: target,
					bubbles: false,
					nativeTarget: null,
				});
		}

		for (const node of [...next].reverse()) {
			if (hoverPath.includes(node)) continue;
			node.hovered = true;
			for (const type of ['pointerenter', 'mouseenter'])
				dispatch({
					type,
					target: node,
					nativeEvent,
					relatedTarget: oldTarget,
					bubbles: false,
					nativeTarget: null,
				});
		}

		if (oldTarget !== null) {
			for (const type of ['pointerout', 'mouseout'])
				dispatch({
					type,
					target: oldTarget,
					nativeEvent,
					relatedTarget: target,
					bubbles: true,
					nativeTarget: null,
				});
		}

		if (target !== null) {
			for (const type of ['pointerover', 'mouseover'])
				dispatch({
					type,
					target,
					nativeEvent,
					relatedTarget: oldTarget,
					bubbles: true,
					nativeTarget: null,
				});
		}

		hoverPath = next;
		canvas.style.cursor = String(
			next.find((node) => node.style.cursor !== undefined)?.style.cursor ??
				'default',
		);
		invalidate();
	};

	const updateDragTarget = (
		target: TimelineSceneNode | null,
		nativeEvent: Event,
	) => {
		if (dragTarget === target) return;
		const previous = dragTarget;
		dragTarget = target;
		if (previous !== null)
			dispatch({
				type: 'dragleave',
				target: previous,
				nativeEvent,
				relatedTarget: target,
				bubbles: true,
				nativeTarget: null,
			});
		if (target !== null)
			dispatch({
				type: 'dragenter',
				target,
				nativeEvent,
				relatedTarget: previous,
				bubbles: true,
				nativeTarget: null,
			});
	};

	const capturePointer = (node: TimelineSceneNode, pointerId: number) => {
		capturedPointers.set(pointerId, node);
		try {
			canvas.setPointerCapture(pointerId);
		} catch {
			capturedPointers.delete(pointerId);
		}
	};

	const releasePointer = (node: TimelineSceneNode, pointerId: number) => {
		if (capturedPointers.get(pointerId) !== node) return;
		if (canvas.hasPointerCapture(pointerId))
			canvas.releasePointerCapture(pointerId);
		capturedPointers.delete(pointerId);
	};

	const updateRange = (node: TimelineSceneNode, event: PointerEvent) => {
		const bounds = canvas.getBoundingClientRect();
		const ratio = Math.min(
			1,
			Math.max(
				0,
				(event.clientX - bounds.left - node.rect.x) /
					Math.max(1, node.rect.width),
			),
		);
		const min = Number(node.props.min ?? 0);
		const max = Number(node.props.max ?? 100);
		setRangeValue(node, min + ratio * (max - min), event);
	};

	const getScrollbar = (clientX: number, clientY: number) => {
		const bounds = canvas.getBoundingClientRect();
		const x = clientX - bounds.left;
		const y = clientY - bounds.top;
		for (const node of hitTest(clientX, clientY)) {
			const style = getTimelineSceneStyle(node);
			for (const axis of ['y', 'x'] as const) {
				const visible = axis === 'x' ? node.clientWidth : node.clientHeight;
				const total = axis === 'x' ? node.scrollWidth : node.scrollHeight;
				const overflow = axis === 'x' ? style.overflowX : style.overflowY;
				if (
					!['auto', 'scroll'].includes(String(overflow ?? style.overflow)) ||
					total <= visible
				)
					continue;
				if (
					axis === 'x'
						? y < node.rect.y + node.rect.height - 6
						: x < node.rect.x + node.rect.width - 6
				)
					continue;
				const thumb = Math.max(20, (visible * visible) / total);
				const coordinate = axis === 'x' ? x - node.rect.x : y - node.rect.y;
				const scroll = axis === 'x' ? node.scrollLeft : node.scrollTop;
				const position = (scroll / (total - visible)) * (visible - thumb);
				return {
					node,
					axis,
					offset:
						coordinate >= position && coordinate <= position + thumb
							? coordinate - position
							: thumb / 2,
				};
			}
		}

		return null;
	};

	const updateScrollbar = (event: PointerEvent) => {
		if (scrollbarDrag === null) return;
		const {node, axis, offset} = scrollbarDrag;
		const bounds = canvas.getBoundingClientRect();
		const visible = axis === 'x' ? node.clientWidth : node.clientHeight;
		const total = axis === 'x' ? node.scrollWidth : node.scrollHeight;
		const thumb = Math.max(20, (visible * visible) / total);
		const coordinate =
			axis === 'x'
				? event.clientX - bounds.left - node.rect.x
				: event.clientY - bounds.top - node.rect.y;
		const scroll =
			((coordinate - offset) / Math.max(1, visible - thumb)) *
			(total - visible);
		if (axis === 'x') node.scrollLeft = scroll;
		else node.scrollTop = scroll;
		event.preventDefault();
		invalidate();
	};

	const onCanvasEvent = (event: Event) => {
		if (event instanceof KeyboardEvent) {
			onKey(event, focusedNode ?? root, null);
			return;
		}

		const touchEvent = event as TouchEvent;
		const point =
			touchEvent.changedTouches?.[0] ??
			touchEvent.touches?.[0] ??
			(event as MouseEvent);
		const pointer = event as PointerEvent;
		const target =
			capturedPointers.get(pointer.pointerId) ??
			hitTest(point.clientX, point.clientY)[0] ??
			root;
		if (event.type === 'dragenter' || event.type === 'dragover') {
			updateDragTarget(target, event);
			if (event.type === 'dragenter') return;
		}

		if (event.type === 'dragleave') {
			updateDragTarget(null, event);
			return;
		}

		if (event.type === 'pointerdown' && pointer.button === 0) {
			pointerDownTarget = target;
			suppressClick = false;
			const scrollbar = getScrollbar(pointer.clientX, pointer.clientY);
			if (scrollbar !== null) {
				suppressClick = true;
				scrollbarDrag = {...scrollbar, pointerId: pointer.pointerId};
				if (focusedNode !== null) blur(focusedNode);
				if (focusedNode === null) canvas.focus({preventScroll: true});
				capturePointer(scrollbar.node, pointer.pointerId);
				updateScrollbar(pointer);
				return;
			}
		}

		if (
			scrollbarDrag !== null &&
			scrollbarDrag.pointerId === pointer.pointerId
		) {
			if (event.type === 'pointermove') updateScrollbar(pointer);
			if (
				event.type === 'pointerup' ||
				event.type === 'pointercancel' ||
				event.type === 'lostpointercapture'
			) {
				releasePointer(scrollbarDrag.node, pointer.pointerId);
				scrollbarDrag = null;
			}

			return;
		}

		if (event.type === 'pointerleave') {
			if (!canvas.hasPointerCapture(pointer.pointerId))
				updateHover(null, event);
			return;
		}

		if (event.type === 'pointermove' || event.type === 'pointerdown')
			updateHover(target, event);
		if (event.type === 'click') {
			if (!suppressClick) {
				const clickTarget =
					pointerDownTarget === null
						? target
						: (getAncestors(target).find((node) =>
								node.contains(pointerDownTarget),
							) ?? root);
				click(clickTarget, event as MouseEvent);
			}

			pointerDownTarget = null;
			suppressClick = false;
			return;
		}

		if (event.type === 'pointercancel') suppressClick = true;
		if (
			['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'dblclick'].includes(
				event.type,
			) &&
			getAncestors(target).some(isDisabled)
		)
			return;

		const prevented = send(event.type, target, event);
		if (event.type === 'drop') updateDragTarget(null, event);
		if (event.type === 'lostpointercapture') {
			capturedPointers.delete(pointer.pointerId);
			if (rangeDrag?.pointerId === pointer.pointerId) rangeDrag = null;
		}

		if (event.type === 'pointerdown' && pointer.button === 0 && !prevented) {
			const focusTarget = getAncestors(target).find(isFocusable);
			if (focusTarget !== undefined) {
				focus(focusTarget, {preventScroll: true});
				if (isNativeEditor(focusTarget)) event.preventDefault();
			} else {
				if (focusedNode !== null) blur(focusedNode);
				if (focusedNode === null) canvas.focus({preventScroll: true});
			}

			if (
				target.tagName === 'INPUT' &&
				target.props.type === 'range' &&
				!isDisabled(target)
			) {
				rangeDrag = {node: target, pointerId: pointer.pointerId};
				capturePointer(target, pointer.pointerId);
				updateRange(target, pointer);
			}
		}

		if (rangeDrag !== null && rangeDrag.pointerId === pointer.pointerId) {
			if (event.type === 'pointermove') updateRange(rangeDrag.node, pointer);
			if (event.type === 'pointerup' || event.type === 'pointercancel') {
				releasePointer(rangeDrag.node, pointer.pointerId);
				rangeDrag = null;
			}
		}

		if (event.type === 'wheel' && !prevented) {
			const wheel = event as WheelEvent;
			if (wheel.ctrlKey || wheel.metaKey) return;
			const scale =
				wheel.deltaMode === WheelEvent.DOM_DELTA_LINE
					? 16
					: wheel.deltaMode === WheelEvent.DOM_DELTA_PAGE
						? canvas.clientHeight
						: 1;
			let x =
				(wheel.shiftKey && wheel.deltaX === 0 ? wheel.deltaY : wheel.deltaX) *
				scale;
			let y = (wheel.shiftKey && wheel.deltaX === 0 ? 0 : wheel.deltaY) * scale;
			for (const node of getAncestors(target)) {
				const style = getTimelineSceneStyle(node);
				const previousX = node.scrollLeft;
				const previousY = node.scrollTop;
				if (
					x !== 0 &&
					['auto', 'scroll'].includes(String(style.overflowX ?? style.overflow))
				)
					node.scrollLeft += x;
				if (
					y !== 0 &&
					['auto', 'scroll'].includes(String(style.overflowY ?? style.overflow))
				)
					node.scrollTop += y;
				if (previousX !== node.scrollLeft) x = 0;
				if (previousY !== node.scrollTop) y = 0;
				if (previousX !== node.scrollLeft || previousY !== node.scrollTop) {
					event.preventDefault();
					invalidate();
				}
			}
		}
	};

	for (const type of [
		'pointerdown',
		'pointermove',
		'pointerup',
		'pointercancel',
		'pointerleave',
		'gotpointercapture',
		'lostpointercapture',
		'mousedown',
		'mousemove',
		'mouseup',
		'click',
		'dblclick',
		'contextmenu',
		'wheel',
		'keydown',
		'keyup',
		'keypress',
		'dragenter',
		'dragleave',
		'dragover',
		'drop',
		'touchstart',
		'touchmove',
		'touchend',
		'touchcancel',
		'gesturestart',
		'gesturechange',
		'gestureend',
		'gesturecancel',
	]) {
		canvas.addEventListener(type, onCanvasEvent, {passive: false});
		disposers.push(() => canvas.removeEventListener(type, onCanvasEvent));
	}

	const onCanvasBlur = (event: FocusEvent) => {
		if (editor?.element === event.relatedTarget) return;
		if (focusedNode !== null) blur(focusedNode);
	};

	canvas.addEventListener('blur', onCanvasBlur);
	disposers.push(() => canvas.removeEventListener('blur', onCanvasBlur));

	const controller: SceneEventController = {
		root,
		get focusedNode() {
			return focusedNode;
		},
		hitTest,
		focus,
		blur,
		click,
		capturePointer,
		releasePointer,
		getEditor: (node) => (editor?.node === node ? editor.element : null),
		refresh: () => {
			if (disposed) return;
			paintOrder = null;
			if (focusedNode !== null && !root.contains(focusedNode))
				blur(focusedNode);
			positionEditor();
			for (const node of getPaintOrder()) {
				if (
					node.props.autoFocus === true &&
					!autofocusNodes.has(node) &&
					isVisible(node)
				) {
					autofocusNodes.add(node);
					focus(node, {preventScroll: true});
				}
			}
		},
		dispose: () => {
			if (disposed) return;
			disposed = true;
			if (focusedNode !== null) blur(focusedNode);
			for (const [pointerId, node] of capturedPointers)
				releasePointer(node, pointerId);
			for (const node of hoverPath) node.hovered = false;
			for (const dispose of disposers) dispose();
			controllers.delete(controller);
			canvas.style.touchAction = previousTouchAction;
			if (previousTabIndex === null) canvas.removeAttribute('tabindex');
			else canvas.setAttribute('tabindex', previousTabIndex);
		},
	};
	controllers.add(controller);
	return controller;
};
