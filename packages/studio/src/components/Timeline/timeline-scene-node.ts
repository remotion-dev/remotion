import type React from 'react';
import type {TimelineCanvasDraw} from './pixi-timeline-renderer';
import {
	captureTimelineScenePointer,
	releaseTimelineScenePointer,
	getTimelineSceneEditor,
} from './timeline-scene-events';

export type TimelineSceneRect = {
	x: number;
	y: number;
	width: number;
	height: number;
};
export type TimelineSceneStore = {
	canvas: HTMLCanvasElement | null;
	canvasRect: DOMRect | null;
	root: TimelineSceneNode;
	invalidate: () => void;
	repaint: () => void;
	subscribeLayout: (listener: () => void) => () => void;
	notifyLayout: () => void;
	focus: (node: TimelineSceneNode) => void;
	blur: (node: TimelineSceneNode) => void;
	click: (node: TimelineSceneNode) => void;
	select: (node: TimelineSceneNode) => void;
	setSelectionRange: (
		node: TimelineSceneNode,
		start: number,
		end: number,
	) => void;
};

// A retained scene handle. Geometry, scrolling and event ancestry live here;
// this object is never mounted in the document or measured by the browser.
export class TimelineSceneNode {
	readonly store: TimelineSceneStore;
	readonly tagName: string;
	props: Record<string, unknown> = {};
	style: React.CSSProperties;
	parent: TimelineSceneNode | null = null;
	children: TimelineSceneNode[] = [];
	text: string | null = null;
	order: string = '';
	rect: TimelineSceneRect = {x: 0, y: 0, width: 0, height: 0};
	contentWidth = 0;
	contentHeight = 0;
	clip: {left: number; top: number; right: number; bottom: number} | null =
		null;

	drawing: TimelineCanvasDraw | null = null;
	background: string | null = null;
	image: HTMLImageElement | null = null;
	hovered = false;
	focused = false;
	selectionStart: number | null = null;
	selectionEnd: number | null = null;
	readonly listeners = new Map<
		string,
		Set<{listener: EventListenerOrEventListenerObject; capture: boolean}>
	>();

	private horizontalScroll = 0;
	private verticalScroll = 0;
	private editedValue: string | null = null;
	private editedChecked: boolean | null = null;
	private inputStyle: React.CSSProperties = {};

	constructor(tagName: string, store: TimelineSceneStore) {
		this.tagName = tagName.toUpperCase();
		this.store = store;
		this.style = new Proxy(this.inputStyle, {
			set: (target, key, value) => {
				if (Reflect.get(target, key) !== value) {
					Reflect.set(target, key, value);
					if (key === 'transform' || key === 'opacity') this.store.repaint();
					else this.store.invalidate();
				}

				return true;
			},
		});
	}

	setProps(props: Record<string, unknown>) {
		const previous = this.props;
		const previousStyle = (previous.style ?? {}) as React.CSSProperties;
		if (previous.checked !== props.checked) this.editedChecked = null;
		this.props = props;
		if (previous.value !== props.value) this.editedValue = null;
		const next = (props.style ?? {}) as React.CSSProperties;
		let layoutChanged = [
			'className',
			'width',
			'height',
			'type',
			'value',
			'data-name',
		].some((key) => previous[key] !== props[key]);
		for (const key of Object.keys(previousStyle)) {
			if (!(key in next)) {
				Reflect.deleteProperty(this.inputStyle, key);
				if (key !== 'transform' && key !== 'opacity') layoutChanged = true;
			}
		}

		for (const key of Object.keys(next)) {
			if (Reflect.get(previousStyle, key) !== Reflect.get(next, key)) {
				Reflect.set(this.inputStyle, key, Reflect.get(next, key));
				if (key !== 'transform' && key !== 'opacity') layoutChanged = true;
			}
		}

		if (layoutChanged) this.store.invalidate();
		else this.store.repaint();
	}

	get parentElement() {
		return this.parent;
	}

	get parentNode() {
		return this.parent;
	}

	get ownerDocument() {
		return this.store.canvas?.ownerDocument ?? document;
	}

	get nodeType() {
		return this.text === null ? 1 : 3;
	}

	get nodeName() {
		return this.tagName;
	}

	get isConnected() {
		return this.parent !== null || this === this.store.root;
	}

	get clientWidth() {
		return this.rect.width;
	}

	get clientHeight() {
		return this.rect.height;
	}

	get offsetWidth() {
		return this.rect.width;
	}

	get offsetHeight() {
		return this.rect.height;
	}

	get offsetLeft() {
		return this.rect.x - (this.parent?.rect.x ?? 0);
	}

	get offsetTop() {
		return this.rect.y - (this.parent?.rect.y ?? 0);
	}

	get scrollWidth() {
		return Math.max(this.clientWidth, this.contentWidth);
	}

	get scrollHeight() {
		return Math.max(this.clientHeight, this.contentHeight);
	}

	get scrollLeft() {
		return this.horizontalScroll;
	}

	set scrollLeft(value: number) {
		const next = Math.max(
			0,
			Math.min(this.scrollWidth - this.clientWidth, value),
		);
		if (next === this.horizontalScroll) return;
		this.horizontalScroll = next;
		this.store.invalidate();
		this.dispatchEvent(new Event('scroll'));
	}

	get scrollTop() {
		return this.verticalScroll;
	}

	set scrollTop(value: number) {
		const next = Math.max(
			0,
			Math.min(this.scrollHeight - this.clientHeight, value),
		);
		if (next === this.verticalScroll) return;
		this.verticalScroll = next;
		this.store.invalidate();
		this.dispatchEvent(new Event('scroll'));
	}

	get value() {
		return (
			this.editedValue ??
			String(this.props.value ?? this.props.defaultValue ?? '')
		);
	}

	set value(value: string) {
		this.editedValue = value;
		this.store.repaint();
	}

	get checked() {
		return (
			this.editedChecked ??
			Boolean(this.props.checked ?? this.props.defaultChecked)
		);
	}

	set checked(value: boolean) {
		this.editedChecked = value;
		this.store.repaint();
	}

	get disabled() {
		return Boolean(this.props.disabled);
	}

	get tabIndex() {
		return Number(
			this.props.tabIndex ??
				(/^(BUTTON|INPUT|SELECT|TEXTAREA)$/.test(this.tagName) ? 0 : -1),
		);
	}

	get type() {
		return String(this.props.type ?? '');
	}

	get textContent(): string {
		return (
			this.text ?? this.children.map((child) => child.textContent).join('')
		);
	}

	get dataset() {
		return Object.fromEntries(
			Object.entries(this.props)
				.filter(([key]) => key.startsWith('data-'))
				.map(([key, value]) => [
					key
						.slice(5)
						.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase()),
					String(value),
				]),
		);
	}

	get className() {
		return String(this.props.className ?? '');
	}

	get classList() {
		return {
			contains: (name: string) => this.className.split(/\s+/).includes(name),
		};
	}

	getAttribute(name: string) {
		const value = this.props[name];
		return value === null || value === undefined ? null : String(value);
	}

	hasAttribute(name: string) {
		return this.props[name] !== null && this.props[name] !== undefined;
	}

	setAttribute(name: string, value: string) {
		this.props = {...this.props, [name]: value};
		this.store.invalidate();
	}

	removeAttribute(name: string) {
		const props = {...this.props};
		delete props[name];
		this.props = props;
		this.store.invalidate();
	}

	getBoundingClientRect(): DOMRect {
		const origin = this.store.canvasRect;
		return new DOMRect(
			(origin?.left ?? 0) + this.rect.x,
			(origin?.top ?? 0) + this.rect.y,
			this.rect.width,
			this.rect.height,
		);
	}

	contains(node: unknown): boolean {
		if (!(node instanceof TimelineSceneNode)) return false;
		for (
			let current: TimelineSceneNode | null = node;
			current;
			current = current.parent
		) {
			if (current === this) return true;
		}

		return false;
	}

	matches(selector: string): boolean {
		return selector.split(',').some((part) => {
			const value = part.trim();
			if (value === '*') return true;
			if (value === ':hover') return this.hovered;
			if (value === ':focus' || value === ':focus-visible') return this.focused;
			const attribute = /^\[([^=\]]+)(?:=["']?([^"'\]]*)["']?)?\]$/.exec(value);
			if (attribute)
				return (
					this.hasAttribute(attribute[1]) &&
					(attribute[2] === undefined ||
						this.getAttribute(attribute[1]) === attribute[2])
				);
			if (value.startsWith('.')) return this.classList.contains(value.slice(1));
			return this.tagName.toLowerCase() === value;
		});
	}

	closest(selector: string): TimelineSceneNode | null {
		for (let node: TimelineSceneNode | null = this; node; node = node.parent)
			if (node.matches(selector)) return node;
		return null;
	}

	querySelectorAll(selector: string): TimelineSceneNode[] {
		return this.children.flatMap((child) => [
			...(child.matches(selector) ? [child] : []),
			...child.querySelectorAll(selector),
		]);
	}

	querySelector(selector: string) {
		return this.querySelectorAll(selector)[0] ?? null;
	}

	addEventListener(
		type: string,
		listener: EventListenerOrEventListenerObject | null,
		options: boolean | AddEventListenerOptions = false,
	) {
		if (!listener) return;
		const entries = this.listeners.get(type) ?? new Set();
		entries.add({
			listener,
			capture:
				typeof options === 'boolean' ? options : Boolean(options.capture),
		});
		this.listeners.set(type, entries);
	}

	removeEventListener(
		type: string,
		listener: EventListenerOrEventListenerObject | null,
	) {
		for (const entry of this.listeners.get(type) ?? [])
			if (entry.listener === listener) this.listeners.get(type)?.delete(entry);
	}

	dispatchEvent(event: Event) {
		for (const {listener} of this.listeners.get(event.type) ?? []) {
			if (typeof listener === 'function') listener.call(this, event);
			else listener.handleEvent(event);
		}

		return !event.defaultPrevented;
	}

	setCustomValidity(message: string) {
		getTimelineSceneEditor(this)?.setCustomValidity(message);
	}

	reportValidity() {
		return getTimelineSceneEditor(this)?.reportValidity() ?? true;
	}

	focus() {
		this.store.focus(this);
	}

	blur() {
		this.store.blur(this);
	}

	click() {
		this.store.click(this);
	}

	select() {
		this.store.select(this);
	}

	setSelectionRange(start: number, end: number) {
		this.store.setSelectionRange(this, start, end);
	}

	setPointerCapture(id: number) {
		captureTimelineScenePointer(this, id);
	}

	releasePointerCapture(id: number) {
		releaseTimelineScenePointer(this, id);
	}

	hasPointerCapture(id: number) {
		return this.store.canvas?.hasPointerCapture(id) ?? false;
	}

	scrollIntoView(options: ScrollIntoViewOptions | boolean | null) {
		const block =
			typeof options === 'boolean'
				? options
					? 'start'
					: 'end'
				: (options?.block ?? 'start');
		const inline =
			typeof options === 'boolean' ? 'nearest' : (options?.inline ?? 'nearest');
		let {x} = this.rect;
		let {y} = this.rect;
		for (
			let ancestor = this.parent;
			ancestor !== null;
			ancestor = ancestor.parent
		) {
			for (const axis of ['x', 'y'] as const) {
				const horizontal = axis === 'x';
				const overflow = horizontal
					? ancestor.style.overflowX
					: ancestor.style.overflowY;
				if (
					!['auto', 'scroll', 'hidden'].includes(
						String(overflow ?? ancestor.style.overflow),
					)
				)
					continue;
				const start = horizontal ? x : y;
				const end = start + (horizontal ? this.rect.width : this.rect.height);
				const viewportStart = horizontal ? ancestor.rect.x : ancestor.rect.y;
				const viewportEnd =
					viewportStart +
					(horizontal ? ancestor.clientWidth : ancestor.clientHeight);
				const alignment = horizontal ? inline : block;
				let delta = 0;
				if (alignment === 'start') delta = start - viewportStart;
				else if (alignment === 'end') delta = end - viewportEnd;
				else if (alignment === 'center')
					delta = (start + end - viewportStart - viewportEnd) / 2;
				else if (!(start < viewportStart && end > viewportEnd)) {
					if (start < viewportStart) delta = start - viewportStart;
					else if (end > viewportEnd) delta = end - viewportEnd;
				}

				if (horizontal) {
					const previous = ancestor.scrollLeft;
					ancestor.scrollLeft += delta;
					x -= ancestor.scrollLeft - previous;
				} else {
					const previous = ancestor.scrollTop;
					ancestor.scrollTop += delta;
					y -= ancestor.scrollTop - previous;
				}
			}
		}
	}

	scrollTo(options: ScrollToOptions) {
		if (options.left !== undefined) this.scrollLeft = options.left;
		if (options.top !== undefined) this.scrollTop = options.top;
	}

	scroll(options: ScrollToOptions) {
		this.scrollTo(options);
	}

	scrollBy(options: ScrollToOptions) {
		this.scrollTo({
			left: this.scrollLeft + (options.left ?? 0),
			top: this.scrollTop + (options.top ?? 0),
		});
	}
}

export const isTimelineSceneNode = (
	value: unknown,
): value is TimelineSceneNode => value instanceof TimelineSceneNode;
