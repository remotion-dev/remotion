import {Button} from '@remotion/design';
import {createElement} from 'react';
import {createRoot} from 'react-dom/client';
import {browser} from 'wxt/browser';
import {getCapturePreflight, PageCapture, type CaptureCrop} from './capture';
import {openCaptureInRemotion} from './handoff';
import {
	captureControllerMessageType,
	isCaptureControllerRequest,
	type CaptureControllerRequest,
	type CaptureControllerState,
	type CaptureFormat,
} from './messages';
import {
	canEncodeCapture,
	getScaledCanvasSize,
	isHtmlInCanvasAvailable,
} from './recorder';
import {
	dragSelectionRectangle,
	makeSelectionRectangle,
	type SelectionHandle,
	type SelectionRectangle,
} from './selection';

type ExtensionController = {
	readonly handleRequest: (
		request: CaptureControllerRequest,
	) => Promise<CaptureControllerState>;
};

type ExtensionWindow = Window & {
	__remotionCanvasCapture?: ExtensionController;
};

type SelectedTarget =
	| {readonly type: 'whole-page'}
	| {readonly type: 'page-crop'; readonly crop: CaptureCrop};

const defaultResolution = {width: 2560, height: 1440};
const maxZoom = 30;
const minimumCaptureArea = {width: 10, height: 10};

export const startContent = () => {
	const extensionWindow = window as ExtensionWindow;

	const downloadFile = (file: File) => {
		const url = URL.createObjectURL(file);
		const anchor = document.createElement('a');
		anchor.href = url;
		anchor.download = file.name;
		document.body.appendChild(anchor);
		anchor.click();
		anchor.remove();
		URL.revokeObjectURL(url);
	};

	const getContainerLabel = (format: CaptureFormat) =>
		format === 'mp4' ? 'MP4' : 'WebM';

	const getFormatLabel = (format: CaptureFormat) =>
		format === 'mp4' ? 'H.264 MP4' : 'VP9 WebM';

	const getCropRelativeTo = (
		selection: SelectionRectangle,
		target: DOMRect,
	): CaptureCrop => ({
		left: selection.left - target.left,
		top: selection.top - target.top,
		width: Math.max(1, selection.width),
		height: Math.max(1, selection.height),
	});

	const createController = (): ExtensionController => {
		const host = document.createElement('div');
		host.dataset.remotionCanvasCapture = 'true';
		host.style.position = 'fixed';
		host.style.inset = '0';
		host.style.zIndex = '2147483647';
		host.style.pointerEvents = 'none';
		document.documentElement.appendChild(host);
		const shadow = host.attachShadow({mode: 'open'});

		const style = document.createElement('style');
		style.textContent = `
		:host { all: initial; }
		* { box-sizing: border-box; }
		.selection-layer {
			position: fixed;
			inset: 0;
			display: none;
			background: rgba(0, 0, 0, 0.65);
			cursor: crosshair;
			pointer-events: auto;
		}
		.selection-box {
			position: fixed;
			display: none;
			border: 1px solid #0b84f3;
			background: transparent;
			box-shadow: 0 0 0 100vmax rgba(0, 0, 0, 0.65);
		}
		.backdrop {
			position: fixed;
			inset: 0;
			display: none;
			background: rgba(0, 0, 0, 0.65);
			pointer-events: none;
		}
		.interaction-shield {
			position: fixed;
			inset: 0;
			display: none;
			pointer-events: auto;
		}
		.highlight {
			position: fixed;
			display: none;
			border: 1px solid #0b84f3;
			box-shadow: 0 0 0 100vmax rgba(0, 0, 0, 0.65);
			pointer-events: none;
		}
		.highlight.editable {
			cursor: move;
			pointer-events: auto;
			touch-action: none;
		}
		.selection-handle {
			position: absolute;
			display: none;
			width: 16px;
			height: 16px;
			background: transparent;
		}
		.highlight.editable .selection-handle { display: block; }
		.selection-handle[data-handle="nw"] { left: -8px; top: -8px; cursor: nwse-resize; z-index: 1; }
		.selection-handle[data-handle="ne"] { right: -8px; top: -8px; cursor: nesw-resize; z-index: 1; }
		.selection-handle[data-handle="se"] { right: -8px; bottom: -8px; cursor: nwse-resize; z-index: 1; }
		.selection-handle[data-handle="sw"] { left: -8px; bottom: -8px; cursor: nesw-resize; z-index: 1; }
		.selection-handle[data-handle="n"] { left: 8px; right: 8px; top: -8px; width: auto; cursor: ns-resize; }
		.selection-handle[data-handle="s"] { left: 8px; right: 8px; bottom: -8px; width: auto; cursor: ns-resize; }
		.selection-handle[data-handle="e"] { right: -8px; top: 8px; bottom: 8px; height: auto; cursor: ew-resize; }
		.selection-handle[data-handle="w"] { left: -8px; top: 8px; bottom: 8px; height: auto; cursor: ew-resize; }
		.capture-dimensions {
			position: fixed;
			display: none;
			align-items: center;
			gap: 4px;
			padding: 3px 6px;
			border-radius: 4px;
			background: #0b84f3;
			box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
			color: #fff;
			font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
			font-size: 11px;
			font-variant-numeric: tabular-nums;
			font-weight: 600;
			line-height: 16px;
			pointer-events: none;
			white-space: nowrap;
		}
		.capture-dimensions svg {
			width: 14px;
			height: 8px;
			flex: 0 0 14px;
			fill: none;
			stroke: currentColor;
			stroke-width: 1.25;
			stroke-linecap: round;
			stroke-linejoin: round;
		}
		.capture-dimensions-zoom {
			height: 18px;
			margin: -1px 0 -1px -5px;
			padding: 0 5px;
			border: 1px solid #fff;
			border-radius: 999px;
			background: #0b84f3;
			color: #fff;
			cursor: pointer;
			font: inherit;
			font-variant-numeric: inherit;
			font-weight: inherit;
			line-height: 16px;
		}
		.capture-dimensions-zoom:hover:not(:disabled),
		.capture-dimensions-zoom:focus-visible {
			background: #0877db;
		}
		.capture-dimensions-zoom:disabled {
			cursor: default;
			opacity: 0.65;
		}
		.capture-dimensions-zoom-control {
			position: relative;
			pointer-events: auto;
		}
		.capture-dimensions-zoom-control + svg {
			margin-left: -5px;
		}
		.capture-dimensions-zoom-popover {
			position: absolute;
			left: 50%;
			bottom: calc(100% + 7px);
			display: flex;
			align-items: center;
			width: min(180px, calc(100vw - 8px));
			height: 38px;
			padding: 0 10px;
			border: 2px solid #000;
			border-bottom-width: 4px;
			border-radius: 8px;
			background: #fff;
			box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
			transform: translateX(-50%);
		}
		.capture-dimensions-zoom-popover[hidden] {
			display: none;
		}
		.capture-dimensions-zoom-slider {
			width: 100%;
			accent-color: #0b84f3;
			cursor: pointer;
		}
		.capture-controls {
			--capture-controls-icon-color: #737373;

			position: fixed;
			left: 50%;
			bottom: 20px;
			display: none;
			align-items: center;
			gap: 6px;
			width: 224px;
			max-width: calc(100vw - 40px);
			padding: 8px;
			border: 2px solid #000;
			border-bottom-width: 4px;
			border-radius: 999px;
			background: #fff;
			box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
			color: #000;
			font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
			font-size: 13px;
			line-height: 1.4;
			pointer-events: auto;
			transform: translateX(-50%);
		}
		.capture-controls-encoding-error {
			position: absolute;
			left: 50%;
			bottom: calc(100% + 8px);
			display: none;
			max-width: calc(100vw - 16px);
			padding: 4px 8px;
			border-radius: 4px;
			background: #ff3232;
			box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
			color: #fff;
			font-size: 11px;
			font-weight: 600;
			line-height: 16px;
			pointer-events: none;
			transform: translateX(-50%);
			white-space: nowrap;
		}
		.capture-controls-header {
			display: flex;
			align-items: center;
			cursor: grab;
			padding: 0 6px;
			user-select: none;
		}
		.capture-controls-header.dragging {
			cursor: grabbing;
		}
		.capture-controls-grab {
			display: block;
			width: 24px;
			height: 24px;
			color: var(--capture-controls-icon-color);
			fill: currentColor;
		}
		.capture-controls-close {
			width: 32px;
			flex: 0 0 32px !important;
			border: 0 !important;
			background: transparent !important;
			color: var(--capture-controls-icon-color) !important;
			margin-left: auto;
			padding: 4px;
			transition: color 120ms ease;
		}
		.capture-controls-close:hover:not(:disabled) {
			color: #000 !important;
		}
		.capture-controls-close svg {
			display: block;
			width: 24px;
			height: 24px;
			fill: currentColor;
		}
		.capture-controls button {
			height: 38px;
			border: 2px solid #000;
			border-bottom-width: 4px;
			border-radius: 8px;
			background: #fff;
			color: #000;
			cursor: pointer;
			font: inherit;
			font-weight: 700;
		}
		.capture-controls-select {
			width: 32px;
			flex: 0 0 32px;
			border: 0 !important;
			background: transparent !important;
			color: var(--capture-controls-icon-color) !important;
			padding: 4px;
			transition: color 120ms ease;
		}
		.capture-controls-select:hover:not(:disabled) {
			color: #000 !important;
		}
		.capture-controls-select + .capture-controls-select {
			margin-left: -6px;
		}
		.capture-controls-select svg {
			display: block;
			width: 24px;
			height: 24px;
			fill: currentColor;
		}
		.capture-controls button:disabled {
			cursor: default;
			opacity: 0.5;
		}
		.capture-controls button.capture-controls-select:disabled,
		.capture-controls button.capture-controls-close:disabled {
			opacity: 1;
		}
		.capture-controls [data-tooltip] {
			position: relative;
		}
		.capture-controls [data-tooltip]::after {
			position: absolute;
			left: 50%;
			bottom: calc(100% + 6px);
			z-index: 1;
			max-width: calc(100vw - 16px);
			padding: 6px 8px;
			border: 1px solid #d9dde1;
			border-radius: 6px;
			background: #fff;
			box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.16);
			color: rgba(0, 0, 0, 0.9);
			content: attr(data-tooltip);
			font-size: 12px;
			font-weight: 400;
			line-height: 16px;
			opacity: 0;
			pointer-events: none;
			transform: translateX(-50%);
			transition:
				opacity 100ms ease,
				visibility 0s linear 100ms;
			visibility: hidden;
			white-space: nowrap;
		}
		.capture-controls [data-tooltip]:hover::after,
		.capture-controls [data-tooltip]:focus-visible::after,
		.capture-controls [data-tooltip]:focus-within::after {
			opacity: 1;
			transition-delay: 200ms;
			visibility: visible;
		}
		.capture-controls-primary {
			width: 40px;
			height: 38px;
			flex: 0 0 40px;
			margin-left: 6px;
			perspective: 300px;
		}
		.capture-controls-duration {
			width: 64px;
			flex: 0 0 64px;
			font-variant-numeric: tabular-nums;
			font-weight: 700;
			text-align: center;
		}
		.capture-controls-primary .contents {
			display: contents;
		}
		.capture-controls-primary .relative {
			position: relative;
		}
		.capture-controls-primary .inline-flex {
			display: inline-flex;
		}
		.capture-controls-primary .items-center {
			align-items: center;
		}
		.capture-controls-primary button {
			position: relative;
			display: grid;
			width: 40px;
			padding: 0;
			place-items: center;
			border-radius: 999px !important;
			background: #ff3232 !important;
			overflow: hidden;
		}
		.capture-controls-primary button:hover:not(:disabled) {
			background: #ff4b4b !important;
		}
		.capture-controls-record-icon {
			position: absolute;
			left: 50%;
			top: 50%;
			width: 13px;
			height: 13px;
			border-radius: 4.5px;
			background: #fff;
			transform: translate(-50%, -50%);
		}
	`;

		const selectionLayer = document.createElement('div');
		selectionLayer.className = 'selection-layer';
		const selectionBox = document.createElement('div');
		selectionBox.className = 'selection-box';
		selectionLayer.appendChild(selectionBox);
		const backdrop = document.createElement('div');
		backdrop.className = 'backdrop';
		const interactionShield = document.createElement('div');
		interactionShield.className = 'interaction-shield';
		const highlight = document.createElement('div');
		highlight.className = 'highlight';
		for (const handle of ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']) {
			const element = document.createElement('div');
			element.className = 'selection-handle';
			element.dataset.handle = handle;
			highlight.appendChild(element);
		}

		const dimensions = document.createElement('div');
		dimensions.className = 'capture-dimensions';
		const dimensionsSource = document.createElement('span');
		const dimensionsZoomControl = document.createElement('div');
		dimensionsZoomControl.className = 'capture-dimensions-zoom-control';
		const dimensionsZoom = document.createElement('button');
		dimensionsZoom.className = 'capture-dimensions-zoom';
		dimensionsZoom.type = 'button';
		dimensionsZoom.ariaLabel = 'Adjust output zoom';
		dimensionsZoom.setAttribute('aria-expanded', 'false');
		const dimensionsZoomPopover = document.createElement('div');
		dimensionsZoomPopover.id = 'remotion-canvas-capture-zoom';
		dimensionsZoomPopover.className = 'capture-dimensions-zoom-popover';
		dimensionsZoomPopover.hidden = true;
		dimensionsZoom.setAttribute('aria-controls', dimensionsZoomPopover.id);
		const dimensionsZoomSlider = document.createElement('input');
		dimensionsZoomSlider.className = 'capture-dimensions-zoom-slider';
		dimensionsZoomSlider.type = 'range';
		dimensionsZoomSlider.min = '0.1';
		dimensionsZoomSlider.max = String(maxZoom);
		dimensionsZoomSlider.step = '0.1';
		dimensionsZoomSlider.ariaLabel = 'Output zoom';
		dimensionsZoomPopover.appendChild(dimensionsZoomSlider);
		dimensionsZoomControl.append(dimensionsZoom, dimensionsZoomPopover);
		const dimensionsOutput = document.createElement('span');
		const dimensionsLine = document.createElementNS(
			'http://www.w3.org/2000/svg',
			'svg',
		);
		dimensionsLine.setAttribute('viewBox', '0 0 14 8');
		dimensionsLine.setAttribute('aria-hidden', 'true');
		dimensionsLine.innerHTML = '<path d="M1 4h12" />';
		const dimensionsArrow = document.createElementNS(
			'http://www.w3.org/2000/svg',
			'svg',
		);
		dimensionsArrow.setAttribute('viewBox', '0 0 14 8');
		dimensionsArrow.setAttribute('aria-hidden', 'true');
		dimensionsArrow.innerHTML = '<path d="M1 4h11m-3-3 3 3-3 3" />';
		dimensions.append(
			dimensionsSource,
			dimensionsLine,
			dimensionsZoomControl,
			dimensionsArrow,
			dimensionsOutput,
		);
		const controls = document.createElement('div');
		controls.className = 'capture-controls';
		const controlsEncodingError = document.createElement('div');
		controlsEncodingError.className = 'capture-controls-encoding-error';
		controlsEncodingError.setAttribute('role', 'status');
		controlsEncodingError.ariaLive = 'polite';
		controlsEncodingError.textContent = "Browser can't encode this resolution";
		const controlsHeader = document.createElement('div');
		controlsHeader.className = 'capture-controls-header';
		controlsHeader.dataset.tooltip = 'Drag to reposition';
		controlsHeader.innerHTML =
			'<svg class="capture-controls-grab" viewBox="0 0 640 640" aria-hidden="true"><path d="M288 128C288 92.7 259.3 64 224 64C188.7 64 160 92.7 160 128C160 163.3 188.7 192 224 192C259.3 192 288 163.3 288 128zM288 320C288 284.7 259.3 256 224 256C188.7 256 160 284.7 160 320C160 355.3 188.7 384 224 384C259.3 384 288 355.3 288 320zM160 512C160 547.3 188.7 576 224 576C259.3 576 288 547.3 288 512C288 476.7 259.3 448 224 448C188.7 448 160 476.7 160 512zM480 128C480 92.7 451.3 64 416 64C380.7 64 352 92.7 352 128C352 163.3 380.7 192 416 192C451.3 192 480 163.3 480 128zM352 320C352 355.3 380.7 384 416 384C451.3 384 480 355.3 480 320C480 284.7 451.3 256 416 256C380.7 256 352 284.7 352 320zM480 512C480 476.7 451.3 448 416 448C380.7 448 352 476.7 352 512C352 547.3 380.7 576 416 576C451.3 576 480 547.3 480 512z"/></svg>';
		const controlsSecondary = document.createElement('button');
		controlsSecondary.className = 'capture-controls-select';
		controlsSecondary.type = 'button';
		controlsSecondary.ariaLabel = 'Select area';
		controlsSecondary.dataset.tooltip = 'Select area';
		controlsSecondary.innerHTML =
			'<svg viewBox="0 0 640 640" aria-hidden="true"><path d="M192 80C192 71.2 184.8 64 176 64C167.2 64 160 71.2 160 80L160 160L80 160C71.2 160 64 167.2 64 176C64 184.8 71.2 192 80 192L160 192L160 432C160 458.5 181.5 480 208 480L400 480L400 448L208 448C199.2 448 192 440.8 192 432L192 80zM448 560C448 568.8 455.2 576 464 576C472.8 576 480 568.8 480 560L480 480L560 480C568.8 480 576 472.8 576 464C576 455.2 568.8 448 560 448L480 448L480 208C480 181.5 458.5 160 432 160L240 160L240 192L432 192C440.8 192 448 199.2 448 208L448 560z"/></svg>';
		const controlsWholePage = document.createElement('button');
		controlsWholePage.className = 'capture-controls-select';
		controlsWholePage.type = 'button';
		controlsWholePage.ariaLabel = 'Entire page';
		controlsWholePage.dataset.tooltip = 'Entire page';
		controlsWholePage.innerHTML =
			'<svg viewBox="0 0 640 640" aria-hidden="true"><path d="M224 160L224 224L544 224L544 192C544 174.3 529.7 160 512 160L224 160zM192 160L128 160C110.3 160 96 174.3 96 192L96 224L192 224L192 160zM96 256L96 448C96 465.7 110.3 480 128 480L512 480C529.7 480 544 465.7 544 448L544 256L96 256zM64 192C64 156.7 92.7 128 128 128L512 128C547.3 128 576 156.7 576 192L576 448C576 483.3 547.3 512 512 512L128 512C92.7 512 64 483.3 64 448L64 192z"/></svg>';
		const controlsDuration = document.createElement('span');
		controlsDuration.className = 'capture-controls-duration';
		controlsDuration.hidden = true;
		controlsDuration.textContent = '00:00';
		controlsDuration.ariaLabel = 'Recording duration 00:00';
		const controlsPrimary = document.createElement('div');
		controlsPrimary.className = 'capture-controls-primary';
		controlsPrimary.hidden = true;
		const controlsPrimaryRoot = createRoot(controlsPrimary);
		const renderControlsPrimary = (label: string, disabled: boolean) => {
			controlsPrimary.dataset.tooltip = label;
			controlsPrimaryRoot.render(
				createElement(
					Button,
					{
						'aria-label': label,
						className: 'capture-controls-primary-button',
						disabled,
					},
					createElement('span', {
						'aria-hidden': 'true',
						className: 'capture-controls-record-icon',
					}),
				),
			);
		};

		renderControlsPrimary('Record', true);
		const controlsNew = document.createElement('button');
		controlsNew.className = 'capture-controls-select';
		controlsNew.type = 'button';
		controlsNew.hidden = true;
		controlsNew.ariaLabel = 'Open in remotion.dev/new';
		controlsNew.dataset.tooltip = 'Open in remotion.dev/new';
		controlsNew.innerHTML =
			'<svg viewBox="-24 -24 560 560" aria-hidden="true"><path d="M80 48C53.5 48 32 69.5 32 96v320c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V176L352 48H80zm304 64.6L415.4 144H384v-31.4zM80 80h272v96h96v240c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V96c0-8.8 7.2-16 16-16zm160 144v64h-64v32h64v64h32v-64h64v-32h-64v-64h-32z"/></svg>';
		const controlsConvert = document.createElement('button');
		controlsConvert.className = 'capture-controls-select';
		controlsConvert.type = 'button';
		controlsConvert.hidden = true;
		controlsConvert.ariaLabel = 'Open in remotion.dev/convert';
		controlsConvert.dataset.tooltip = 'Open in remotion.dev/convert';
		controlsConvert.innerHTML =
			'<svg viewBox="-64 -64 640 640" aria-hidden="true"><path d="M304 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l153.4 0-260.7 260.7c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0L480 54.6 480 208c0 8.8 7.2 16 16 16s16-7.2 16-16l0-192c0-8.8-7.2-16-16-16L304 0zM80 96C35.8 96 0 131.8 0 176L0 432c0 44.2 35.8 80 80 80l256 0c44.2 0 80-35.8 80-80l0-96c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 96c0 26.5-21.5 48-48 48L80 480c-26.5 0-48-21.5-48-48l0-256c0-26.5 21.5-48 48-48l96 0c8.8 0 16-7.2 16-16s-7.2-16-16-16L80 96z"/></svg>';
		const controlsDownload = document.createElement('button');
		controlsDownload.className = 'capture-controls-select';
		controlsDownload.type = 'button';
		controlsDownload.hidden = true;
		controlsDownload.ariaLabel = 'Download recording';
		controlsDownload.dataset.tooltip = 'Download recording';
		controlsDownload.innerHTML =
			'<svg viewBox="-128 -64 640 640" aria-hidden="true"><path d="M0 496c0-8.8 7.2-16 16-16l352 0c8.8 0 16 7.2 16 16s-7.2 16-16 16L16 512c-8.8 0-16-7.2-16-16zM209 377c-9.4 9.4-24.6 9.4-33.9 0L31 233c-6.9-6.9-8.9-17.2-5.2-26.2S38.3 192 48 192l80 0 0-64 0 0 0-80c0-26.5 21.5-48 48-48l32 0c26.5 0 48 21.5 48 48l0 144 80 0c9.7 0 18.5 5.8 22.2 14.8s1.7 19.3-5.2 26.2L209 377zm15-249l0-80c0-8.8-7.2-16-16-16l-32 0c-8.8 0-16 7.2-16 16l0 80 0 0 0 80c0 8.8-7.2 16-16 16L67.3 224 192 348.7 316.7 224 240 224c-8.8 0-16-7.2-16-16l0-80z"/></svg>';
		const controlsClose = document.createElement('button');
		controlsClose.className = 'capture-controls-close';
		controlsClose.type = 'button';
		controlsClose.ariaLabel = 'Close capture controls';
		controlsClose.dataset.tooltip = 'Close';
		controlsClose.innerHTML =
			'<svg viewBox="46 46 548 548" aria-hidden="true"><path d="M135.5 169C126.1 159.6 126.1 144.4 135.5 135.1C144.9 125.8 160.1 125.7 169.4 135.1L320.4 286.1L471.4 135.1C480.8 125.7 496 125.7 505.3 135.1C514.6 144.5 514.7 159.7 505.3 169L354.3 320L505.3 471C514.7 480.4 514.7 495.6 505.3 504.9C495.9 514.2 480.7 514.3 471.4 504.9L320.4 353.9L169.4 504.9C160 514.3 144.8 514.3 135.5 504.9C126.2 495.5 126.1 480.3 135.5 471L286.5 320L135.5 169z"/></svg>';
		controls.append(
			controlsEncodingError,
			controlsHeader,
			controlsSecondary,
			controlsWholePage,
			controlsDuration,
			controlsPrimary,
			controlsNew,
			controlsConvert,
			controlsDownload,
			controlsClose,
		);
		shadow.append(
			style,
			interactionShield,
			backdrop,
			highlight,
			selectionLayer,
			dimensions,
			controls,
		);
		for (const eventType of [
			'pointerdown',
			'pointerup',
			'mousedown',
			'mouseup',
			'click',
		] as const) {
			shadow.addEventListener(eventType, (event) => event.stopPropagation());
		}

		let selectedTarget: SelectedTarget | null = null;
		let capture: PageCapture | null = null;
		let completedRecording: File | null = null;
		let finalizing = false;
		let selecting = false;
		let startingRecording = false;
		let scale = Math.max(1, window.devicePixelRatio);
		let useDefaultResolution = true;
		let format: CaptureFormat = 'mp4';
		let encoderSupport: CaptureControllerState['encoderSupport'] =
			'unavailable';
		let outputSize: CaptureControllerState['outputSize'] = null;
		let controlsDismissed = true;
		let controlsBusy = false;
		let controlsDrag: {
			readonly pointerId: number;
			readonly offsetX: number;
			readonly offsetY: number;
		} | null = null;
		let encoderSupportCheckId = 0;
		let encoderSupportKey: string | null = null;
		let recordingStartedAt: number | null = null;
		let recordingDurationInterval: number | null = null;
		const supported = isHtmlInCanvasAvailable();
		let status = supported
			? 'Choose an area or the whole page.'
			: 'Canvas capture is unavailable because the experimental HTML-in-canvas API is disabled. Open chrome://flags/#canvas-draw-element, set Canvas Draw Element to Enabled, then fully quit and reopen the browser.';
		let statusIsError = !supported;
		let selectionStart: {readonly x: number; readonly y: number} | null = null;
		let selectionDrag: {
			readonly pointerId: number;
			readonly startX: number;
			readonly startY: number;
			readonly rect: SelectionRectangle;
			readonly crop: CaptureCrop;
			readonly handle: SelectionHandle;
		} | null = null;

		const setStatus = (message: string, error = false) => {
			status = message;
			statusIsError = error;
		};

		const updateRecordingDuration = () => {
			if (recordingStartedAt === null) {
				return;
			}

			const elapsedSeconds = Math.floor(
				(performance.now() - recordingStartedAt) / 1000,
			);
			const minutes = Math.floor(elapsedSeconds / 60);
			const seconds = elapsedSeconds % 60;
			const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
			controlsDuration.textContent = formatted;
			controlsDuration.ariaLabel = `Recording duration ${formatted}`;
		};

		const getTargetLabel = () => {
			if (!selectedTarget) {
				return null;
			}

			if (selectedTarget.type === 'whole-page') {
				return 'Entire page';
			}

			return `Page crop (${Math.round(selectedTarget.crop.width)}×${Math.round(selectedTarget.crop.height)})`;
		};

		const resolveCaptureTarget = () => {
			if (!selectedTarget) {
				return null;
			}

			if (selectedTarget.type === 'whole-page') {
				const pageRect = document.body.getBoundingClientRect();
				return {
					crop: {
						left: -pageRect.left,
						top: -pageRect.top,
						width: window.innerWidth,
						height: window.innerHeight,
					},
				};
			}

			return {crop: selectedTarget.crop};
		};

		const getDefaultResolutionScale = (width: number, height: number) =>
			Math.min(
				defaultResolution.width / width,
				defaultResolution.height / height,
				maxZoom,
			);

		const refreshEncoderSupport = async () => {
			const checkId = ++encoderSupportCheckId;
			if (
				!supported ||
				!selectedTarget ||
				capture ||
				completedRecording ||
				finalizing ||
				selecting ||
				selectionDrag
			) {
				if (!selectedTarget) {
					encoderSupport = 'unavailable';
					encoderSupportKey = null;
					outputSize = null;
				}

				return;
			}

			const target = resolveCaptureTarget();
			if (!target) {
				encoderSupport = 'unavailable';
				encoderSupportKey = null;
				outputSize = null;
				return;
			}

			try {
				if (useDefaultResolution) {
					const source = getCapturePreflight({scale: 1, crop: target.crop});
					const selectedSize = target.crop ?? source.sourceSize;
					scale = getDefaultResolutionScale(
						selectedSize.width,
						selectedSize.height,
					);
				}

				const preflight = getCapturePreflight({
					scale,
					crop: target.crop,
				});
				if (checkId !== encoderSupportCheckId) {
					return;
				}

				const supportKey = `${preflight.outputSize.width}x${preflight.outputSize.height}`;
				outputSize = preflight.outputSize;
				if (
					encoderSupportKey === supportKey &&
					(encoderSupport === 'supported' || encoderSupport === 'unsupported')
				) {
					return;
				}

				encoderSupport = 'checking';
				setStatus(
					`Checking H.264 MP4 support at ${outputSize.width}×${outputSize.height}…`,
				);
				const canEncodeMp4 = await canEncodeCapture('mp4', outputSize);
				if (checkId !== encoderSupportCheckId) {
					return;
				}

				if (canEncodeMp4) {
					format = 'mp4';
					encoderSupport = 'supported';
					encoderSupportKey = supportKey;
					setStatus(
						`Ready to record ${getFormatLabel(format)} at ${outputSize.width}×${outputSize.height}.`,
					);
					return;
				}

				setStatus(
					`H.264 MP4 is unavailable at ${outputSize.width}×${outputSize.height}. Checking VP9 WebM…`,
				);
				const canEncodeWebm = await canEncodeCapture('webm', outputSize);
				if (checkId !== encoderSupportCheckId) {
					return;
				}

				if (canEncodeWebm) {
					format = 'webm';
					encoderSupport = 'supported';
					encoderSupportKey = supportKey;
					setStatus(
						`H.264 MP4 is unavailable at ${outputSize.width}×${outputSize.height}. Ready to record VP9 WebM instead.`,
					);
				} else {
					encoderSupport = 'unsupported';
					encoderSupportKey = supportKey;
					setStatus(
						`Neither H.264 MP4 nor VP9 WebM encoding is supported at ${outputSize.width}×${outputSize.height} in this browser. Choose a lower resolution or select a smaller area.`,
						true,
					);
				}
			} catch (error) {
				if (checkId !== encoderSupportCheckId) {
					return;
				}

				encoderSupport = 'unsupported';
				encoderSupportKey = null;
				outputSize = null;
				setStatus(error instanceof Error ? error.message : String(error), true);
			}
		};

		const updateDimensions = (
			rect: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'> | null,
		) => {
			if (!rect || rect.width < 1 || rect.height < 1) {
				dimensions.style.display = 'none';
				return;
			}

			const previewScale = useDefaultResolution
				? getDefaultResolutionScale(rect.width, rect.height)
				: scale;
			const scaled = getScaledCanvasSize(rect.width, rect.height, previewScale);
			dimensionsSource.textContent = `${Math.round(rect.width)}×${Math.round(rect.height)}`;
			dimensionsZoom.textContent = `${previewScale.toFixed(1)}×`;
			dimensionsZoomSlider.value = String(previewScale);
			dimensionsOutput.textContent = `${scaled.width}×${scaled.height}`;
			dimensions.style.display = 'flex';
			const badgeRect = dimensions.getBoundingClientRect();
			const left = Math.min(
				Math.max(4, rect.left + (rect.width - badgeRect.width) / 2),
				window.innerWidth - badgeRect.width - 4,
			);
			const below = rect.top + rect.height + 6;
			const top =
				below + badgeRect.height <= window.innerHeight - 4
					? below
					: Math.max(4, rect.top - badgeRect.height - 6);
			dimensions.style.left = `${left}px`;
			dimensions.style.top = `${top}px`;

			const zoomButtonRect = dimensionsZoom.getBoundingClientRect();
			const spaceAbove = zoomButtonRect.top;
			const spaceBelow = window.innerHeight - zoomButtonRect.bottom;
			const placeBelow =
				spaceAbove < 45 && (spaceBelow >= 45 || spaceBelow > spaceAbove);
			dimensionsZoomPopover.style.top = placeBelow
				? 'calc(100% + 7px)'
				: 'auto';
			dimensionsZoomPopover.style.bottom = placeBelow
				? 'auto'
				: 'calc(100% + 7px)';

			const popoverWidth = Math.min(180, window.innerWidth - 8);
			const popoverCenter = zoomButtonRect.left + zoomButtonRect.width / 2;
			const clampedPopoverCenter = Math.min(
				Math.max(4 + popoverWidth / 2, popoverCenter),
				window.innerWidth - 4 - popoverWidth / 2,
			);
			dimensionsZoomPopover.style.marginLeft = `${clampedPopoverCenter - popoverCenter}px`;
		};

		const updateHighlight = () => {
			if (selecting || controlsDismissed) {
				dimensionsZoomPopover.hidden = true;
				dimensionsZoom.setAttribute('aria-expanded', 'false');
				interactionShield.style.display = 'none';
				backdrop.style.display = 'none';
				highlight.style.display = 'none';
				dimensions.style.display = 'none';
				return;
			}

			interactionShield.style.display =
				capture || startingRecording ? 'none' : 'block';
			const target = resolveCaptureTarget();
			let rect: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'> | null =
				null;
			if (target?.crop) {
				const pageRect = document.body.getBoundingClientRect();
				rect = {
					left: pageRect.left + target.crop.left,
					top: pageRect.top + target.crop.top,
					width: target.crop.width,
					height: target.crop.height,
				};
			}

			if (!rect) {
				dimensionsZoomPopover.hidden = true;
				dimensionsZoom.setAttribute('aria-expanded', 'false');
				highlight.style.display = 'none';
				dimensions.style.display = 'none';
				backdrop.style.display = selectedTarget ? 'none' : 'block';
				return;
			}

			backdrop.style.display = 'none';
			highlight.style.display = 'block';
			highlight.classList.toggle(
				'editable',
				selectedTarget?.type === 'page-crop' &&
					!capture &&
					!startingRecording &&
					!completedRecording &&
					!finalizing,
			);
			highlight.style.left = `${rect.left}px`;
			highlight.style.top = `${rect.top}px`;
			highlight.style.width = `${rect.width}px`;
			highlight.style.height = `${rect.height}px`;
			updateDimensions(rect);
		};

		const getState = (): CaptureControllerState => ({
			supported,
			selecting,
			hasTarget: selectedTarget !== null,
			targetLabel: getTargetLabel(),
			encoderSupport,
			outputSize,
			recording: capture !== null,
			finalizing,
			hasCompletedRecording: completedRecording !== null,
			scale,
			format,
			status,
			error: statusIsError,
		});

		const updateControls = () => {
			const state = getState();
			const shouldShow =
				!state.selecting && !controlsDismissed && !state.finalizing;
			controls.style.display = shouldShow ? 'flex' : 'none';
			if (!shouldShow) {
				return;
			}

			controlsEncodingError.style.display =
				state.hasTarget && state.encoderSupport === 'unsupported'
					? 'block'
					: 'none';
			dimensionsZoom.disabled =
				controlsBusy ||
				state.recording ||
				state.hasCompletedRecording ||
				!state.supported;
			dimensionsZoomSlider.disabled = dimensionsZoom.disabled;
			controlsSecondary.disabled =
				controlsBusy || state.recording || state.hasCompletedRecording;
			controlsSecondary.hidden = state.recording || state.hasCompletedRecording;
			controlsWholePage.disabled =
				controlsBusy || state.recording || state.hasCompletedRecording;
			controlsWholePage.hidden = state.recording || state.hasCompletedRecording;
			controlsDuration.hidden = !state.recording;
			controlsPrimary.hidden = !state.hasTarget || state.hasCompletedRecording;
			controlsNew.hidden = !state.hasCompletedRecording;
			controlsNew.disabled = controlsBusy;
			controlsConvert.hidden = !state.hasCompletedRecording;
			controlsConvert.disabled = controlsBusy;
			controlsDownload.hidden = !state.hasCompletedRecording;
			controlsDownload.disabled = controlsBusy;
			if (state.recording) {
				updateRecordingDuration();
			}

			const primaryLabel = state.recording
				? 'Stop recording'
				: state.encoderSupport === 'checking'
					? 'Checking…'
					: 'Record';
			const primaryDisabled =
				controlsBusy ||
				(!state.recording &&
					(!state.hasTarget || state.encoderSupport !== 'supported'));
			renderControlsPrimary(primaryLabel, primaryDisabled);
			const closeLabel = state.hasCompletedRecording
				? 'Discard recording'
				: 'Close';
			controlsClose.ariaLabel = closeLabel;
			controlsClose.dataset.tooltip = closeLabel;
			controlsClose.disabled = controlsBusy;
		};

		const cancelSelection = () => {
			selectionStart = null;
			selecting = false;
			selectionLayer.style.display = 'none';
			selectionLayer.style.background = 'rgba(0, 0, 0, 0.65)';
			selectionBox.style.display = 'none';
			if (selectedTarget) {
				encoderSupportKey = null;
				refreshEncoderSupport().catch(() => undefined);
			} else {
				encoderSupportCheckId++;
				encoderSupport = 'unavailable';
				encoderSupportKey = null;
				outputSize = null;
				setStatus('Choose an area or the whole page.');
			}

			updateHighlight();
			updateControls();
		};

		highlight.addEventListener('pointerdown', (event) => {
			if (
				event.button !== 0 ||
				selectedTarget?.type !== 'page-crop' ||
				capture ||
				startingRecording ||
				completedRecording ||
				finalizing ||
				selectionDrag
			) {
				return;
			}

			const box = highlight.getBoundingClientRect();
			selectionDrag = {
				pointerId: event.pointerId,
				startX: event.clientX,
				startY: event.clientY,
				rect: makeSelectionRectangle(box.left, box.top, box.right, box.bottom),
				crop: selectedTarget.crop,
				handle:
					((event.target as HTMLElement).dataset.handle as
						| SelectionHandle
						| undefined) ?? 'move',
			};
			encoderSupportCheckId++;
			encoderSupport = 'checking';
			updateControls();
			highlight.setPointerCapture(event.pointerId);
			event.preventDefault();
		});

		const updateSelectionDrag = (event: PointerEvent) => {
			if (!selectionDrag || selectionDrag.pointerId !== event.pointerId) {
				return;
			}

			const rect = dragSelectionRectangle({
				rect: selectionDrag.rect,
				handle: selectionDrag.handle,
				deltaX: event.clientX - selectionDrag.startX,
				deltaY: event.clientY - selectionDrag.startY,
				viewportWidth: window.innerWidth,
				viewportHeight: window.innerHeight,
				minimumWidth: minimumCaptureArea.width,
				minimumHeight: minimumCaptureArea.height,
			});
			selectedTarget = {
				type: 'page-crop',
				crop: getCropRelativeTo(rect, document.body.getBoundingClientRect()),
			};
			updateHighlight();
		};

		highlight.addEventListener('pointermove', updateSelectionDrag);

		const finishSelectionDrag = (event: PointerEvent) => {
			if (!selectionDrag || selectionDrag.pointerId !== event.pointerId) {
				return;
			}

			if (event.type === 'pointercancel') {
				selectedTarget = {type: 'page-crop', crop: selectionDrag.crop};
			} else {
				updateSelectionDrag(event);
			}

			selectionDrag = null;
			highlight.releasePointerCapture(event.pointerId);
			encoderSupportKey = null;
			updateHighlight();
			refreshEncoderSupport()
				.then(updateControls)
				.catch(() => undefined);
		};

		highlight.addEventListener('pointerup', finishSelectionDrag);
		highlight.addEventListener('pointercancel', finishSelectionDrag);

		const finishSelection = (event: PointerEvent) => {
			if (!selectionStart) {
				return;
			}

			const selection = makeSelectionRectangle(
				selectionStart.x,
				selectionStart.y,
				Math.min(Math.max(0, event.clientX), window.innerWidth),
				Math.min(Math.max(0, event.clientY), window.innerHeight),
			);
			selectionStart = null;
			if (
				selection.width < minimumCaptureArea.width ||
				selection.height < minimumCaptureArea.height
			) {
				selectionLayer.style.background = 'rgba(0, 0, 0, 0.65)';
				selectionBox.style.display = 'none';
				dimensions.style.display = 'none';
				setStatus('Selection must be at least 10×10 pixels.', true);
				return;
			}

			selecting = false;
			selectionLayer.style.display = 'none';
			selectionBox.style.display = 'none';

			const crop = getCropRelativeTo(
				selection,
				document.body.getBoundingClientRect(),
			);
			selectedTarget = {type: 'page-crop', crop};
			controlsDismissed = false;

			encoderSupportKey = null;
			updateHighlight();
			updateControls();
			refreshEncoderSupport()
				.then(updateControls)
				.catch(() => undefined);
		};

		selectionLayer.addEventListener('pointerdown', (event) => {
			selectionStart = {x: event.clientX, y: event.clientY};
			setStatus(
				'Drag over an area of at least 10×10 pixels. Press Escape to cancel.',
			);
			selectionLayer.style.background = 'transparent';
			selectionBox.style.display = 'block';
			selectionLayer.setPointerCapture(event.pointerId);
		});

		selectionLayer.addEventListener('pointermove', (event) => {
			if (!selectionStart) {
				return;
			}

			const rect = makeSelectionRectangle(
				selectionStart.x,
				selectionStart.y,
				Math.min(Math.max(0, event.clientX), window.innerWidth),
				Math.min(Math.max(0, event.clientY), window.innerHeight),
			);
			selectionBox.style.left = `${rect.left}px`;
			selectionBox.style.top = `${rect.top}px`;
			selectionBox.style.width = `${rect.width}px`;
			selectionBox.style.height = `${rect.height}px`;
			updateDimensions(rect);
		});

		selectionLayer.addEventListener('pointerup', finishSelection);
		selectionLayer.addEventListener('pointercancel', cancelSelection);
		window.addEventListener('scroll', updateHighlight, true);
		window.addEventListener('resize', () => {
			updateHighlight();
			const supportCheck = refreshEncoderSupport();
			updateControls();
			supportCheck.then(updateControls).catch(() => undefined);
		});
		window.addEventListener('keydown', (event) => {
			if (event.key === 'Escape' && !dimensionsZoomPopover.hidden) {
				dimensionsZoomPopover.hidden = true;
				dimensionsZoom.setAttribute('aria-expanded', 'false');
				dimensionsZoom.focus();
				return;
			}

			if (event.key === 'Escape' && selecting) {
				cancelSelection();
			}
		});

		const setOptions = (nextScale: number) => {
			if (!Number.isFinite(nextScale) || nextScale <= 0) {
				encoderSupportCheckId++;
				encoderSupport = 'unsupported';
				encoderSupportKey = null;
				outputSize = null;
				setStatus('Scale must be a number greater than 0.', true);
				return false;
			}

			if (scale !== nextScale) {
				encoderSupportKey = null;
			}

			scale = nextScale;
			updateHighlight();
			return true;
		};

		dimensionsZoom.addEventListener('click', () => {
			const willOpen = dimensionsZoomPopover.hidden;
			dimensionsZoomPopover.hidden = !willOpen;
			dimensionsZoom.setAttribute('aria-expanded', String(willOpen));
			if (willOpen) {
				dimensionsZoomSlider.focus();
			}
		});
		dimensionsZoomSlider.addEventListener('input', () => {
			useDefaultResolution = false;
			if (!setOptions(Number(dimensionsZoomSlider.value))) {
				return;
			}

			encoderSupportCheckId++;
			encoderSupport = 'checking';
			encoderSupportKey = null;
			updateControls();
		});
		dimensionsZoomSlider.addEventListener('change', () => {
			refreshEncoderSupport()
				.then(updateControls)
				.catch((error) => {
					setStatus(
						error instanceof Error ? error.message : String(error),
						true,
					);
					updateControls();
				});
		});

		const finishRecording = async () => {
			if (!capture || finalizing) {
				return;
			}

			if (recordingDurationInterval !== null) {
				window.clearInterval(recordingDurationInterval);
				recordingDurationInterval = null;
			}

			recordingStartedAt = null;
			finalizing = true;
			const recordingFormat = format;
			setStatus(`Finalizing ${getContainerLabel(recordingFormat)}…`);
			const currentCapture = capture;
			try {
				completedRecording = await currentCapture.stop();
				setStatus(
					`${getContainerLabel(recordingFormat)} ready. Open it in Browser Studio, Convert, or download it.`,
				);
			} catch (error) {
				setStatus(error instanceof Error ? error.message : String(error), true);
			} finally {
				capture = null;
				finalizing = false;
				updateHighlight();
				updateControls();
			}
		};

		const handleCompletedRecording = async (
			destination: 'convert' | 'new' | 'download',
		) => {
			if (!completedRecording || finalizing) {
				return;
			}

			const file = completedRecording;
			finalizing = true;
			try {
				if (destination !== 'download') {
					setStatus(
						destination === 'new'
							? 'Opening recording in Remotion Browser Studio…'
							: 'Opening recording in Remotion Convert…',
					);
					await openCaptureInRemotion(file, destination);
					completedRecording = null;
					setStatus('Recording opened. Ready to record again.');
					return;
				}

				downloadFile(file);
				setStatus(`${getContainerLabel(format)} downloaded.`);
			} catch (error) {
				setStatus(error instanceof Error ? error.message : String(error), true);
			} finally {
				finalizing = false;
				updateControls();
			}
		};

		const handleRequest = async (request: CaptureControllerRequest) => {
			if (request.command === 'toggle-controls') {
				controlsDismissed = !controlsDismissed;
				updateControls();
				updateHighlight();
				return getState();
			}

			if (request.command === 'get-state') {
				await refreshEncoderSupport();
				updateControls();
				return getState();
			}

			if (request.command === 'set-options') {
				if (!capture && !completedRecording && !finalizing) {
					useDefaultResolution = false;
					if (setOptions(request.scale)) {
						await refreshEncoderSupport();
					}

					updateControls();
				}

				return getState();
			}

			if (request.command === 'select-area') {
				if (!capture && !completedRecording && !finalizing) {
					if (selectionDrag) {
						highlight.releasePointerCapture(selectionDrag.pointerId);
						selectionDrag = null;
					}

					encoderSupportCheckId++;
					encoderSupportKey = null;
					selecting = true;
					selectionStart = null;
					selectionBox.style.display = 'none';
					selectionLayer.style.background = 'rgba(0, 0, 0, 0.65)';
					selectionLayer.style.display = 'block';
					interactionShield.style.display = 'none';
					backdrop.style.display = 'none';
					highlight.style.display = 'none';
					dimensions.style.display = 'none';
					setStatus(
						'Drag over an area of at least 10×10 pixels. Press Escape to cancel.',
					);
					updateControls();
				}

				return getState();
			}

			if (request.command === 'cancel-selection') {
				if (selecting) {
					cancelSelection();
					await refreshEncoderSupport();
				}

				return getState();
			}

			if (request.command === 'select-whole-page') {
				if (!capture && !completedRecording && !finalizing) {
					if (selectionDrag) {
						highlight.releasePointerCapture(selectionDrag.pointerId);
						selectionDrag = null;
					}

					if (selecting) {
						cancelSelection();
					}

					selectedTarget = {type: 'whole-page'};
					controlsDismissed = false;
					encoderSupportKey = null;
					updateHighlight();
					await refreshEncoderSupport();
					updateControls();
				}

				return getState();
			}

			if (request.command === 'start-recording') {
				if (
					capture ||
					startingRecording ||
					completedRecording ||
					finalizing ||
					selecting ||
					selectionDrag
				) {
					return getState();
				}

				startingRecording = true;
				updateHighlight();
				try {
					if (!setOptions(request.scale)) {
						return getState();
					}

					await refreshEncoderSupport();
					if (encoderSupport !== 'supported') {
						return getState();
					}

					const target = resolveCaptureTarget();
					if (!target) {
						setStatus('Choose an area or the whole page first.', true);
						return getState();
					}

					try {
						capture = new PageCapture({
							scale,
							format,
							crop: target.crop,
						});
						await capture.start();
						recordingStartedAt = performance.now();
						updateRecordingDuration();
						recordingDurationInterval = window.setInterval(
							updateRecordingDuration,
							250,
						);
						setStatus(
							`Recording ${getFormatLabel(format)} at ${scale}× scale…`,
						);
					} catch (error) {
						capture?.restore();
						capture = null;
						setStatus(
							error instanceof Error ? error.message : String(error),
							true,
						);
					}

					return getState();
				} finally {
					startingRecording = false;
					updateHighlight();
					updateControls();
				}
			}

			if (request.command === 'stop-recording') {
				await finishRecording();
				return getState();
			}

			await handleCompletedRecording(
				request.command === 'open-in-convert'
					? 'convert'
					: request.command === 'open-in-new'
						? 'new'
						: 'download',
			);
			return getState();
		};

		controlsClose.addEventListener('click', () => {
			if (completedRecording) {
				completedRecording = null;
				setStatus('Recording discarded. Ready to record again.');
				updateHighlight();
				updateControls();
				refreshEncoderSupport()
					.then(updateControls)
					.catch((error) => {
						setStatus(
							error instanceof Error ? error.message : String(error),
							true,
						);
						updateControls();
					});
				return;
			}

			controlsDismissed = true;
			updateControls();
			updateHighlight();
		});
		controlsHeader.addEventListener('pointerdown', (event) => {
			if (event.target === controlsClose) {
				return;
			}

			const rect = controls.getBoundingClientRect();
			controlsDrag = {
				pointerId: event.pointerId,
				offsetX: event.clientX - rect.left,
				offsetY: event.clientY - rect.top,
			};
			controlsHeader.classList.add('dragging');
			controlsHeader.setPointerCapture(event.pointerId);
			event.preventDefault();
		});
		controlsHeader.addEventListener('pointermove', (event) => {
			if (!controlsDrag || controlsDrag.pointerId !== event.pointerId) {
				return;
			}

			const left = Math.min(
				Math.max(0, event.clientX - controlsDrag.offsetX),
				Math.max(0, window.innerWidth - controls.offsetWidth),
			);
			const top = Math.min(
				Math.max(0, event.clientY - controlsDrag.offsetY),
				Math.max(0, window.innerHeight - controls.offsetHeight),
			);
			controls.style.left = `${left}px`;
			controls.style.top = `${top}px`;
			controls.style.right = 'auto';
			controls.style.bottom = 'auto';
			controls.style.transform = 'none';
		});
		const finishControlsDrag = (event: PointerEvent) => {
			if (!controlsDrag || controlsDrag.pointerId !== event.pointerId) {
				return;
			}

			controlsDrag = null;
			controlsHeader.classList.remove('dragging');
			controlsHeader.releasePointerCapture(event.pointerId);
		};

		controlsHeader.addEventListener('pointerup', finishControlsDrag);
		controlsHeader.addEventListener('pointercancel', finishControlsDrag);
		controlsSecondary.addEventListener('click', () => {
			handleRequest({
				type: captureControllerMessageType,
				command: 'select-area',
			}).catch((error) => {
				setStatus(error instanceof Error ? error.message : String(error), true);
				updateControls();
			});
		});
		controlsWholePage.addEventListener('click', () => {
			handleRequest({
				type: captureControllerMessageType,
				command: 'select-whole-page',
			}).catch((error) => {
				setStatus(error instanceof Error ? error.message : String(error), true);
				updateControls();
			});
		});
		controlsPrimary.addEventListener('click', () => {
			const state = getState();
			controlsBusy = true;
			updateControls();
			const action = async () => {
				if (state.recording) {
					await handleRequest({
						type: captureControllerMessageType,
						command: 'stop-recording',
					});
					return;
				}

				await handleRequest({
					type: captureControllerMessageType,
					command: 'start-recording',
					scale,
				});
			};

			action()
				.catch((error) => {
					setStatus(
						error instanceof Error ? error.message : String(error),
						true,
					);
				})
				.finally(() => {
					controlsBusy = false;
					updateControls();
				});
		});
		controlsConvert.addEventListener('click', () => {
			controlsBusy = true;
			updateControls();
			handleRequest({
				type: captureControllerMessageType,
				command: 'open-in-convert',
			})
				.catch((error) => {
					setStatus(
						error instanceof Error ? error.message : String(error),
						true,
					);
				})
				.finally(() => {
					controlsBusy = false;
					updateControls();
				});
		});
		controlsNew.addEventListener('click', () => {
			controlsBusy = true;
			updateControls();
			handleRequest({
				type: captureControllerMessageType,
				command: 'open-in-new',
			})
				.catch((error) => {
					setStatus(
						error instanceof Error ? error.message : String(error),
						true,
					);
				})
				.finally(() => {
					controlsBusy = false;
					updateControls();
				});
		});
		controlsDownload.addEventListener('click', () => {
			controlsBusy = true;
			updateControls();
			handleRequest({
				type: captureControllerMessageType,
				command: 'download-recording',
			})
				.catch((error) => {
					setStatus(
						error instanceof Error ? error.message : String(error),
						true,
					);
				})
				.finally(() => {
					controlsBusy = false;
					updateControls();
				});
		});
		return {
			handleRequest,
		};
	};

	if (!extensionWindow.__remotionCanvasCapture) {
		extensionWindow.__remotionCanvasCapture = createController();
	}

	browser.runtime.onMessage.addListener((message) => {
		if (!isCaptureControllerRequest(message)) {
			return;
		}

		return extensionWindow.__remotionCanvasCapture
			?.handleRequest(message)
			.catch((error) => {
				return {
					message: error instanceof Error ? error.message : String(error),
				};
			});
	});
};
