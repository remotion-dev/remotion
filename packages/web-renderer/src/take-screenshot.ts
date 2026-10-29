import type {LogLevel} from 'remotion';
import {HtmlInCanvas, Internals} from 'remotion';
import {compose} from './compose';
import {
	canApplyCssTransforms,
	preserves3DChildren,
} from './drawing/calculate-transforms';
import {makeDOMMatrix} from './drawing/make-dom-matrix';
import {containsUrlMaskImage} from './drawing/mask-image';
import type {HtmlInCanvasContext} from './html-in-canvas';
import {
	containsLayoutSubtreeCanvas,
	drawWithHtmlInCanvas,
} from './html-in-canvas';
import type {InternalState} from './internal-state';

export type HtmlInCanvasLayerOutcome =
	| {native: true}
	| {native: false; reason: string; shouldWarn: boolean};

const containsPreserve3DDepth = (element: HTMLElement | SVGElement) => {
	const styles = new WeakMap<Element, CSSStyleDeclaration>();
	const readStyle = (node: Element) => {
		if (!styles.has(node)) styles.set(node, getComputedStyle(node));
		return styles.get(node)!;
	};

	for (const node of [element, ...element.querySelectorAll('*')]) {
		if (!(node instanceof HTMLElement || node instanceof SVGElement)) continue;
		const style = readStyle(node);
		if (
			!style.transform ||
			style.transform === 'none' ||
			!canApplyCssTransforms({element: node, computedStyle: style}) ||
			makeDOMMatrix(style.transform).is2D
		)
			continue;
		let visible = true;
		for (
			let ancestor: Element | null = node;
			ancestor;
			ancestor = ancestor.parentElement
		) {
			if (readStyle(ancestor).display === 'none') {
				visible = false;
				break;
			}

			if (ancestor === element) break;
		}

		if (!visible) continue;
		const parent = node.parentElement;
		if (
			preserves3DChildren(style) ||
			(parent &&
				element.contains(parent) &&
				preserves3DChildren(readStyle(parent)))
		)
			return true;
	}

	return false;
};

export const createLayer = async ({
	element,
	onlyOwnPlane = false,
	scale,
	logLevel,
	internalState,
	onlyBackgroundClipText,
	cutout,
	htmlInCanvasContext,
	onHtmlInCanvasLayerOutcome,
	waitForPageResponsiveness,
}: {
	element: HTMLElement | SVGElement;
	onlyOwnPlane?: boolean;
	scale: number;
	logLevel: LogLevel;
	internalState: InternalState;
	onlyBackgroundClipText: boolean;
	cutout: DOMRect;
	htmlInCanvasContext?: HtmlInCanvasContext | null;
	onHtmlInCanvasLayerOutcome?: (outcome: HtmlInCanvasLayerOutcome) => void;
	waitForPageResponsiveness: (() => Promise<void>) | null;
}) => {
	const scaledWidth = Math.ceil(cutout.width * scale);
	const scaledHeight = Math.ceil(cutout.height * scale);

	if (
		!onlyBackgroundClipText &&
		element instanceof HTMLElement &&
		htmlInCanvasContext &&
		onHtmlInCanvasLayerOutcome
	) {
		if (containsPreserve3DDepth(element)) {
			onHtmlInCanvasLayerOutcome({
				native: false,
				reason:
					'The composition contains a 3D transform in a preserve-3d context. The built-in DOM composer is used to preserve perspective and plane depth.',
				shouldWarn: true,
			});
		} else if (containsUrlMaskImage(element)) {
			onHtmlInCanvasLayerOutcome({
				native: false,
				reason:
					'URL masks are loaded by the built-in DOM composer to guarantee deterministic rendering.',
				shouldWarn: false,
			});
		} else if (
			containsLayoutSubtreeCanvas(element) &&
			!HtmlInCanvas.isNestingSupported()
		) {
			onHtmlInCanvasLayerOutcome({
				native: false,
				reason:
					'The composition contains an <HtmlInCanvas> element. Nested HTML-in-canvas capture requires Chrome 157 or newer, so the built-in DOM composer is used.',
				shouldWarn: false,
			});
		} else {
			try {
				const offCtx = await drawWithHtmlInCanvas({
					htmlInCanvasContext,
					element,
					scaledWidth,
					scaledHeight,
					signal: internalState.maskImageLoaderState.signal,
				});
				onHtmlInCanvasLayerOutcome({native: true});
				return offCtx;
			} catch (err) {
				if (internalState.maskImageLoaderState.signal?.aborted) {
					throw err;
				}

				const detail = err instanceof Error ? err.message : JSON.stringify(err);
				onHtmlInCanvasLayerOutcome({
					native: false,
					reason: `drawElementImage failed (${detail}); falling back to the built-in DOM composer.`,
					shouldWarn: true,
				});
				Internals.Log.verbose(
					{logLevel, tag: '@remotion/web-renderer'},
					'HTML-in-canvas capture failed, falling back to software compose',
					err,
				);
			}
		}
	}

	const canvas = new OffscreenCanvas(scaledWidth, scaledHeight);
	const context = canvas.getContext('2d');

	if (!context) {
		throw new Error('Could not get context');
	}

	await compose({
		element,
		onlyOwnPlane,
		context,
		logLevel,
		parentRect: cutout,
		internalState,
		onlyBackgroundClipText,
		scale,
		waitForPageResponsiveness,
	});

	return context;
};
