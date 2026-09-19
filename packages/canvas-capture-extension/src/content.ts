import {browser} from 'wxt/browser';
import {getCapturePreflight, PageCapture, type CaptureCrop} from './capture';
import {openCaptureInConvert} from './handoff';
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
import {makeSelectionRectangle, type SelectionRectangle} from './selection';

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

const resolutionOptions = [
	{label: 'HD', width: 1280, height: 720},
	{label: '2K', width: 2560, height: 1440},
	{label: '4K', width: 3840, height: 2160},
	{label: '6K', width: 5760, height: 3240},
	{label: '8K', width: 7680, height: 4320},
] as const;

type Resolution = (typeof resolutionOptions)[number]['label'];

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
			margin-left: -5px;
			padding: 0 5px;
			border: 1px solid #fff;
			border-radius: 999px;
			background: #0b84f3;
			line-height: 16px;
		}
		.capture-dimensions-zoom + svg {
			margin-left: -5px;
		}
		.capture-controls {
			position: fixed;
			left: 50%;
			bottom: 20px;
			display: none;
			align-items: center;
			gap: 6px;
			width: fit-content;
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
			width: 20px;
			height: 20px;
			fill: currentColor;
			opacity: 0.55;
		}
		.capture-controls-logo {
			display: block;
			width: 25px;
			height: 26px;
			margin-left: -5px;
		}
		.capture-controls-close {
			width: 40px;
			flex: 0 0 40px !important;
			border: 0 !important;
			background: transparent !important;
			color: #555b61 !important;
			opacity: 0.55;
			padding: 7px;
			transition: opacity 120ms ease;
		}
		.capture-controls-close:hover:not(:disabled) {
			opacity: 1;
		}
		.capture-controls-close svg {
			display: block;
			width: 24px;
			height: 24px;
			fill: currentColor;
		}
		.capture-controls-resolution {
			display: flex;
			align-items: center;
			gap: 4px;
			margin: 0 8px;
		}
		.capture-controls-resolution button {
			min-width: 42px;
			padding: 0 6px;
		}
		.capture-controls-resolution button[aria-pressed="true"] {
			background: #0b84f3;
			color: #fff;
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
			opacity: 0.55;
			padding: 4px;
			transition: opacity 120ms ease;
		}
		.capture-controls-select:hover:not(:disabled) {
			opacity: 1;
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
		.capture-controls [data-tooltip]:focus-visible::after {
			opacity: 1;
			transition-delay: 200ms;
			visibility: visible;
		}
		.capture-controls-primary {
			display: grid;
			width: 40px;
			flex: 0 0 40px;
			margin-left: 6px;
			place-items: center;
			border-radius: 999px !important;
			background: #ff3232 !important;
		}
		.capture-controls-primary:hover:not(:disabled) {
			background: #ff4b4b !important;
		}
		.capture-controls-record-icon {
			width: 13px;
			height: 13px;
			border-radius: 4.5px;
			background: #fff;
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
		const dimensions = document.createElement('div');
		dimensions.className = 'capture-dimensions';
		const dimensionsSource = document.createElement('span');
		const dimensionsZoom = document.createElement('span');
		dimensionsZoom.className = 'capture-dimensions-zoom';
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
			dimensionsZoom,
			dimensionsArrow,
			dimensionsOutput,
		);
		const controls = document.createElement('div');
		controls.className = 'capture-controls';
		const controlsHeader = document.createElement('div');
		controlsHeader.className = 'capture-controls-header';
		controlsHeader.dataset.tooltip = 'Drag to reposition';
		controlsHeader.innerHTML =
			'<svg class="capture-controls-grab" viewBox="0 0 640 640" aria-hidden="true"><path d="M288 128C288 92.7 259.3 64 224 64C188.7 64 160 92.7 160 128C160 163.3 188.7 192 224 192C259.3 192 288 163.3 288 128zM288 320C288 284.7 259.3 256 224 256C188.7 256 160 284.7 160 320C160 355.3 188.7 384 224 384C259.3 384 288 355.3 288 320zM160 512C160 547.3 188.7 576 224 576C259.3 576 288 547.3 288 512C288 476.7 259.3 448 224 448C188.7 448 160 476.7 160 512zM480 128C480 92.7 451.3 64 416 64C380.7 64 352 92.7 352 128C352 163.3 380.7 192 416 192C451.3 192 480 163.3 480 128zM352 320C352 355.3 380.7 384 416 384C451.3 384 480 355.3 480 320C480 284.7 451.3 256 416 256C380.7 256 352 284.7 352 320zM480 512C480 476.7 451.3 448 416 448C380.7 448 352 476.7 352 512C352 547.3 380.7 576 416 576C451.3 576 480 547.3 480 512z"/></svg>';
		const controlsLogo = document.createElement('img');
		controlsLogo.className = 'capture-controls-logo';
		controlsLogo.src =
			'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAASbSURBVHgB7d1/TttIFAfw98a2RDeBDTfIDZaeoHCCZU9QeoKlf1ZQbaIG9U/aExROQDkB6QlwT4B7ArKEqFId+3UmhP5QJQr2vLE9fp8/ClVVQHzz5s1MMhMAIYQQQgghhBBCCCGEEEIIIRxCqFBvQL00vNohVE8QaAMI+4t/QEr05wkCxgTZJyQVh1k3ngxwAp6rJBATxJfo+l8k2DV/fcB/jQExBsg/RCoaT148SsAzzgPpHFxv6A8nQNSH8mJdRWP9tU6vX66OwQNOA1mEQXQGD6uK+0FM9J9jzOm4yeE4C2Tl9ed+kGdnlirjbstwIhUMmzasOQukM5qe6w8b4N5YEb2dvlx7Dw3gJJDOwdWOnjW9gyotqiYfzvbWjqDGFLhA+BSqZoZK/aDQfexi8QCpKfYK6Q0u9VojvIS6qWnFsFdIGgXbUEffK+ZdT084oCYcDFnqCdQZ0U6azS/+OJj+BzXAPmSZMdvJVNcGPYzpqfJWlVNl1gpZLgT70BT6Z626WniHLIJNaCC9xzbQ66azKnoLayCIVO/+cbfNVO8sLPfenGENhBpaId8sZmJ0/mj0/y44whbIyk25299ErIACdeiqr7AFEs3TKvat2Ji+4iIUtkAI0KtAjEWz1wtJYMTXQxT8BT7SC0nOUPgCIeiDrxhDYRyywLsh6yc6FI6ewhKI67l7VUxPsT0lZglEP6/txXT3PsyUuPtqugmWsARCqkH7VxYQwomtbRamCsE+tEtPb0qegAU8FYLtqpCljc7o+hBK4qkQxD+hlWi3bD/hqRDyYw+rCN1PSk2FeSrEk03FgjbLVAlXD2lzIEbhF3bwrNQJWx0IIRZ+Yo5r66TlFVJ8lunmlYvtU/gBKYHUjATCwpzyKkYC4YAggdSJyvNTKCgEYRdiMt1fLXw4iKdCzLHm1sqHUIJUiE2IR7O91SMoQXqILYtXzqelqsPg2jpJoHXSfyYv1hMoialC6BO0Cj6f7a0Xnur+SIaskpBgONvvvgFLeJ4Pac2Qtbg1YgAWcb3qJAHvYTzbX9sBy1gCUTl4fo0SxtE83QIGLIGkYWalwdXTTRiTwTrLg47tFG5nNCXwDh1zDFM/4ptlebZ9omdTb7nDMDiPI3wAb+BzPZtycs6QcR2ifOgjE10ZWzbXGb/DFoiiPIEGQ3MBWjB/7Pp2Orbd3iDLxnnYzM1k0y9cDVG/fG9g1Dm4uvh29WsT6B1bzOlZlXc2cl+t0ZTGbnrFMErTx1VfoMk8ppjGTtXfJncH0yvCYP7Mxta5DayBZEH6PsjC0mcmOJggdAUP63alLPt9Wd3R9LxOJ3LrGsQt/mkQwan+LVQeSN2DuMUeSJjN36RR9LSqi8yaEsQtJ/f2mgMshHAGjqC5tF9XpnkwcO3KcnF3szX3Zcp6MxNzPNafjeXu93tafXW1nSt1aGn4mphKIMh1jwrGs72uF8/BOH+7ipXXl/0gCwb6Wz90fTJB1P0gh49g1g7ZPG7acHQflb3Dzk0wahtB/b2cFt8ccjFDD+GEzBu3UPZRESZBGMU+vnmLEEIIIYQQQgghhBBCCCFEG30F6Cu5JpPbnzQAAAAASUVORK5CYII=';
		controlsLogo.alt = 'Remotion';
		const controlsSecondary = document.createElement('button');
		controlsSecondary.className = 'capture-controls-select';
		controlsSecondary.type = 'button';
		controlsSecondary.ariaLabel = 'Select an area';
		controlsSecondary.dataset.tooltip = 'Select an area';
		controlsSecondary.innerHTML =
			'<svg viewBox="0 0 640 640" aria-hidden="true"><path d="M192 80C192 71.2 184.8 64 176 64C167.2 64 160 71.2 160 80L160 160L80 160C71.2 160 64 167.2 64 176C64 184.8 71.2 192 80 192L160 192L160 432C160 458.5 181.5 480 208 480L400 480L400 448L208 448C199.2 448 192 440.8 192 432L192 80zM448 560C448 568.8 455.2 576 464 576C472.8 576 480 568.8 480 560L480 480L560 480C568.8 480 576 472.8 576 464C576 455.2 568.8 448 560 448L480 448L480 208C480 181.5 458.5 160 432 160L240 160L240 192L432 192C440.8 192 448 199.2 448 208L448 560z"/></svg>';
		const controlsWholePage = document.createElement('button');
		controlsWholePage.className = 'capture-controls-select';
		controlsWholePage.type = 'button';
		controlsWholePage.ariaLabel = 'Select the whole page';
		controlsWholePage.dataset.tooltip = 'Select the whole page';
		controlsWholePage.innerHTML =
			'<svg viewBox="0 0 640 640" aria-hidden="true"><path d="M224 160L224 224L544 224L544 192C544 174.3 529.7 160 512 160L224 160zM192 160L128 160C110.3 160 96 174.3 96 192L96 224L192 224L192 160zM96 256L96 448C96 465.7 110.3 480 128 480L512 480C529.7 480 544 465.7 544 448L544 256L96 256zM64 192C64 156.7 92.7 128 128 128L512 128C547.3 128 576 156.7 576 192L576 448C576 483.3 547.3 512 512 512L128 512C92.7 512 64 483.3 64 448L64 192z"/></svg>';
		const controlsResolution = document.createElement('div');
		controlsResolution.className = 'capture-controls-resolution';
		controlsResolution.setAttribute('role', 'group');
		controlsResolution.ariaLabel = 'Output resolution';
		const resolutionButtons = resolutionOptions.map((option) => {
			const button = document.createElement('button');
			button.type = 'button';
			button.textContent = option.label;
			button.dataset.tooltip = `Up to ${option.width}×${option.height}`;
			controlsResolution.appendChild(button);
			return {button, option};
		});
		const controlsPrimary = document.createElement('button');
		controlsPrimary.className = 'capture-controls-primary';
		controlsPrimary.type = 'button';
		controlsPrimary.innerHTML =
			'<span class="capture-controls-record-icon" aria-hidden="true"></span>';
		const controlsClose = document.createElement('button');
		controlsClose.className = 'capture-controls-close';
		controlsClose.type = 'button';
		controlsClose.ariaLabel = 'Close capture controls';
		controlsClose.dataset.tooltip = 'Close';
		controlsClose.innerHTML =
			'<svg viewBox="0 0 640 640" aria-hidden="true"><path d="M135.5 169C126.1 159.6 126.1 144.4 135.5 135.1C144.9 125.8 160.1 125.7 169.4 135.1L320.4 286.1L471.4 135.1C480.8 125.7 496 125.7 505.3 135.1C514.6 144.5 514.7 159.7 505.3 169L354.3 320L505.3 471C514.7 480.4 514.7 495.6 505.3 504.9C495.9 514.2 480.7 514.3 471.4 504.9L320.4 353.9L169.4 504.9C160 514.3 144.8 514.3 135.5 504.9C126.2 495.5 126.1 480.3 135.5 471L286.5 320L135.5 169z"/></svg>';
		controls.append(
			controlsHeader,
			controlsLogo,
			controlsSecondary,
			controlsWholePage,
			controlsResolution,
			controlsPrimary,
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

		let selectedTarget: SelectedTarget | null = null;
		let capture: PageCapture | null = null;
		let completedRecording: File | null = null;
		let finalizing = false;
		let selecting = false;
		let startingRecording = false;
		let scale = Math.max(1, window.devicePixelRatio);
		let resolution: Resolution | null = '2K';
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
		const supported = isHtmlInCanvasAvailable();
		let status = supported
			? 'Choose an area or the whole page.'
			: 'Canvas capture is unavailable because the experimental HTML-in-canvas API is disabled. Open chrome://flags/#canvas-draw-element, set Canvas Draw Element to Enabled, then fully quit and reopen the browser.';
		let statusIsError = !supported;
		let selectionStart: {readonly x: number; readonly y: number} | null = null;

		const setStatus = (message: string, error = false) => {
			status = message;
			statusIsError = error;
		};

		const getTargetLabel = () => {
			if (!selectedTarget) {
				return null;
			}

			if (selectedTarget.type === 'whole-page') {
				return 'Whole page';
			}

			return `Page crop (${Math.round(selectedTarget.crop.width)}×${Math.round(selectedTarget.crop.height)})`;
		};

		const resolveCaptureTarget = () => {
			if (!selectedTarget) {
				return null;
			}

			if (selectedTarget.type === 'whole-page') {
				return {crop: null};
			}

			return {crop: selectedTarget.crop};
		};

		const getResolutionScale = (
			width: number,
			height: number,
			selectedResolution: Resolution,
		) => {
			const option = resolutionOptions.find(
				(candidate) => candidate.label === selectedResolution,
			);
			if (!option) {
				throw new Error('Unknown capture resolution.');
			}

			return Math.min(option.width / width, option.height / height);
		};

		const refreshEncoderSupport = async () => {
			const checkId = ++encoderSupportCheckId;
			if (
				!supported ||
				!selectedTarget ||
				capture ||
				completedRecording ||
				finalizing ||
				selecting
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
				if (resolution) {
					const source = getCapturePreflight({scale: 1, crop: target.crop});
					const selectedSize = target.crop ?? source.sourceSize;
					scale = getResolutionScale(
						selectedSize.width,
						selectedSize.height,
						resolution,
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

			const previewScale = resolution
				? getResolutionScale(rect.width, rect.height, resolution)
				: scale;
			const scaled = getScaledCanvasSize(rect.width, rect.height, previewScale);
			dimensionsSource.textContent = `${Math.round(rect.width)}×${Math.round(rect.height)}`;
			dimensionsZoom.textContent = `${previewScale.toFixed(1)}×`;
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
		};

		const updateHighlight = () => {
			if (selecting || controlsDismissed) {
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
				highlight.style.display = 'none';
				dimensions.style.display = 'none';
				backdrop.style.display = selectedTarget ? 'none' : 'block';
				return;
			}

			backdrop.style.display = 'none';
			highlight.style.display = 'block';
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

			resolutionButtons.forEach(({button, option}) => {
				button.setAttribute(
					'aria-pressed',
					String(resolution === option.label),
				);
				button.disabled =
					controlsBusy ||
					state.recording ||
					state.hasCompletedRecording ||
					!state.supported;
			});
			controlsSecondary.disabled =
				controlsBusy || state.recording || state.hasCompletedRecording;
			controlsWholePage.disabled =
				controlsBusy || state.recording || state.hasCompletedRecording;
			const primaryLabel = state.hasCompletedRecording
				? 'Open in Convert'
				: state.recording
					? 'Stop recording'
					: state.encoderSupport === 'checking'
						? 'Checking…'
						: 'Record';
			controlsPrimary.ariaLabel = primaryLabel;
			controlsPrimary.dataset.tooltip = primaryLabel;
			controlsPrimary.disabled =
				controlsBusy ||
				(!state.recording &&
					!state.hasCompletedRecording &&
					(!state.hasTarget || state.encoderSupport !== 'supported'));
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

		const finishSelection = (event: PointerEvent) => {
			if (!selectionStart) {
				return;
			}

			const selection = makeSelectionRectangle(
				selectionStart.x,
				selectionStart.y,
				event.clientX,
				event.clientY,
			);
			selectionStart = null;
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
				event.clientX,
				event.clientY,
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
			refreshEncoderSupport().catch(() => undefined);
		});
		window.addEventListener('keydown', (event) => {
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

		const finishRecording = async () => {
			if (!capture || finalizing) {
				return;
			}

			finalizing = true;
			const recordingFormat = format;
			setStatus(`Finalizing ${getContainerLabel(recordingFormat)}…`);
			const currentCapture = capture;
			try {
				completedRecording = await currentCapture.stop();
				setStatus(
					`${getContainerLabel(recordingFormat)} ready. Open it in Convert or download it.`,
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

		const consumeCompletedRecording = async (
			destination: 'convert' | 'download',
		) => {
			if (!completedRecording || finalizing) {
				return;
			}

			const file = completedRecording;
			finalizing = true;
			try {
				if (destination === 'convert') {
					setStatus('Opening recording in Remotion Convert…');
					await openCaptureInConvert(file);
					completedRecording = null;
					setStatus('Recording opened. Ready to record again.');
					return;
				}

				downloadFile(file);
				completedRecording = null;
				setStatus(
					`${getContainerLabel(format)} downloaded. Ready to record again.`,
				);
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
					resolution = null;
					if (setOptions(request.scale)) {
						await refreshEncoderSupport();
					}

					updateControls();
				}

				return getState();
			}

			if (request.command === 'select-area') {
				if (!capture && !completedRecording && !finalizing) {
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
					setStatus('Drag over the area to capture. Press Escape to cancel.');
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
					selecting
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

			await consumeCompletedRecording(
				request.command === 'open-in-convert' ? 'convert' : 'download',
			);
			return getState();
		};

		controlsClose.addEventListener('click', () => {
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
				if (state.hasCompletedRecording) {
					await handleRequest({
						type: captureControllerMessageType,
						command: 'open-in-convert',
					});
					return;
				}

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
		resolutionButtons.forEach(({button, option}) => {
			button.addEventListener('click', () => {
				resolution = option.label;
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
