import {type CaptureCrop, ElementCapture, getCapturePreflight} from './capture';
import {openCaptureInConvert} from './handoff';
import {
	isCaptureControllerRequest,
	type CaptureFormat,
	type CaptureControllerRequest,
	type CaptureControllerState,
} from './messages';
import {canEncodeCapture, isHtmlInCanvasAvailable} from './recorder';
import {
	findLowestElementContainingRectangle,
	makeSelectionRectangle,
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
	| {readonly type: 'page-crop'; readonly crop: CaptureCrop}
	| {
			readonly type: 'element-crop';
			readonly element: Element;
			readonly elementCrop: CaptureCrop;
			readonly pageCrop: CaptureCrop;
	  };

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

const describeElement = (element: Element) => {
	const id = element.id ? `#${element.id}` : '';
	const className =
		element.classList.length > 0
			? `.${[...element.classList].slice(0, 2).join('.')}`
			: '';
	return `${element.tagName.toLowerCase()}${id}${className}`;
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
			background: rgba(0,0,0,.08);
			cursor: crosshair;
			pointer-events: auto;
		}
		.selection-box {
			position: fixed;
			display: none;
			border: 2px solid #4d8dff;
			background: rgba(77,141,255,.16);
			box-shadow: 0 0 0 1px rgba(255,255,255,.65) inset;
		}
		.highlight {
			position: fixed;
			display: none;
			border: 2px solid #4d8dff;
			box-shadow: 0 0 0 1px rgba(255,255,255,.8), 0 0 0 99999px rgba(77,141,255,.035);
			pointer-events: none;
		}
	`;

	const selectionLayer = document.createElement('div');
	selectionLayer.className = 'selection-layer';
	const selectionBox = document.createElement('div');
	selectionBox.className = 'selection-box';
	selectionLayer.appendChild(selectionBox);
	const highlight = document.createElement('div');
	highlight.className = 'highlight';
	shadow.append(style, highlight, selectionLayer);

	let selectedTarget: SelectedTarget | null = null;
	let capture: ElementCapture | null = null;
	let finalizing = false;
	let selecting = false;
	let scale = Math.max(1, window.devicePixelRatio);
	let format: CaptureFormat = 'mp4';
	let includePageBackground = false;
	let encoderSupport: CaptureControllerState['encoderSupport'] = 'unavailable';
	let outputSize: CaptureControllerState['outputSize'] = null;
	let encoderSupportCheckId = 0;
	let encoderSupportKey: string | null = null;
	const supported = isHtmlInCanvasAvailable();
	let status = supported
		? 'Choose an area or the whole page.'
		: 'Enable chrome://flags/#canvas-draw-element, then reload.';
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

		if (selectedTarget.type === 'page-crop') {
			return `Page crop (${Math.round(selectedTarget.crop.width)}×${Math.round(selectedTarget.crop.height)})`;
		}

		if (includePageBackground) {
			return `Page crop with background (${Math.round(selectedTarget.pageCrop.width)}×${Math.round(selectedTarget.pageCrop.height)})`;
		}

		return `${describeElement(selectedTarget.element)} crop (${Math.round(selectedTarget.elementCrop.width)}×${Math.round(selectedTarget.elementCrop.height)})`;
	};

	const resolveCaptureTarget = () => {
		if (!selectedTarget) {
			return null;
		}

		if (selectedTarget.type === 'whole-page') {
			return {element: null, wholePage: true, crop: null};
		}

		if (selectedTarget.type === 'page-crop') {
			return {element: null, wholePage: true, crop: selectedTarget.crop};
		}

		if (includePageBackground) {
			return {
				element: null,
				wholePage: true,
				crop: selectedTarget.pageCrop,
			};
		}

		return {
			element: selectedTarget.element,
			wholePage: false,
			crop: selectedTarget.elementCrop,
		};
	};

	const refreshEncoderSupport = async () => {
		const checkId = ++encoderSupportCheckId;
		if (!supported || !selectedTarget || capture || finalizing || selecting) {
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
			const preflight = getCapturePreflight({
				element: target.element,
				wholePage: target.wholePage,
				scale,
				crop: target.crop,
			});
			if (checkId !== encoderSupportCheckId) {
				return;
			}

			const supportKey = `${format}:${preflight.outputSize.width}x${preflight.outputSize.height}`;
			outputSize = preflight.outputSize;
			if (
				encoderSupportKey === supportKey &&
				(encoderSupport === 'supported' || encoderSupport === 'unsupported')
			) {
				return;
			}

			encoderSupport = 'checking';
			setStatus(
				`Checking ${getFormatLabel(format)} support at ${outputSize.width}×${outputSize.height}…`,
			);
			const canEncode = await canEncodeCapture(format, outputSize);
			if (checkId !== encoderSupportCheckId) {
				return;
			}

			if (canEncode) {
				encoderSupport = 'supported';
				encoderSupportKey = supportKey;
				setStatus(
					`Ready to record ${getFormatLabel(format)} at ${outputSize.width}×${outputSize.height}.`,
				);
			} else {
				encoderSupport = 'unsupported';
				encoderSupportKey = supportKey;
				setStatus(
					`${getFormatLabel(format)} encoding is not supported at ${outputSize.width}×${outputSize.height} in this browser. Reduce the scale or select a smaller area.`,
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

	const updateHighlight = () => {
		if (capture || selecting) {
			highlight.style.display = 'none';
			return;
		}

		const target = resolveCaptureTarget();
		let rect: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'> | null = null;
		if (target?.wholePage && target.crop) {
			const pageRect = document.body.getBoundingClientRect();
			rect = {
				left: pageRect.left + target.crop.left,
				top: pageRect.top + target.crop.top,
				width: target.crop.width,
				height: target.crop.height,
			};
		} else if (target?.element?.isConnected) {
			const elementRect = target.element.getBoundingClientRect();
			rect = target.crop
				? {
						left: elementRect.left + target.crop.left,
						top: elementRect.top + target.crop.top,
						width: target.crop.width,
						height: target.crop.height,
					}
				: elementRect;
		}

		if (!rect) {
			highlight.style.display = 'none';
			return;
		}

		highlight.style.display = 'block';
		highlight.style.left = `${rect.left}px`;
		highlight.style.top = `${rect.top}px`;
		highlight.style.width = `${rect.width}px`;
		highlight.style.height = `${rect.height}px`;
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
		scale,
		format,
		includePageBackground,
		status,
		error: statusIsError,
	});

	const cancelSelection = () => {
		selectionStart = null;
		selecting = false;
		selectionLayer.style.display = 'none';
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

		const target = findLowestElementContainingRectangle({
			selection,
			excludedElement: host,
		});
		if (!target) {
			setStatus('No element encompasses that rectangle.', true);
			return;
		}

		const pageCrop = getCropRelativeTo(
			selection,
			document.body.getBoundingClientRect(),
		);
		if (target === document.body || target === document.documentElement) {
			selectedTarget = {type: 'page-crop', crop: pageCrop};
		} else {
			selectedTarget = {
				type: 'element-crop',
				element: target,
				elementCrop: getCropRelativeTo(
					selection,
					target.getBoundingClientRect(),
				),
				pageCrop,
			};
		}

		encoderSupportKey = null;
		refreshEncoderSupport().catch(() => undefined);
		updateHighlight();
	};

	selectionLayer.addEventListener('pointerdown', (event) => {
		selectionStart = {x: event.clientX, y: event.clientY};
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

	const setOptions = (
		nextScale: number,
		nextFormat: CaptureFormat,
		nextIncludePageBackground: boolean,
	) => {
		if (!Number.isFinite(nextScale) || nextScale <= 0) {
			encoderSupportCheckId++;
			encoderSupport = 'unsupported';
			encoderSupportKey = null;
			outputSize = null;
			setStatus('Scale must be a number greater than 0.', true);
			return false;
		}

		if (nextFormat !== 'mp4' && nextFormat !== 'webm') {
			encoderSupportCheckId++;
			encoderSupport = 'unsupported';
			encoderSupportKey = null;
			outputSize = null;
			setStatus('Choose MP4 or WebM as the recording format.', true);
			return false;
		}

		if (
			scale !== nextScale ||
			format !== nextFormat ||
			includePageBackground !== nextIncludePageBackground
		) {
			encoderSupportKey = null;
		}

		scale = nextScale;
		format = nextFormat;
		includePageBackground = nextIncludePageBackground;
		updateHighlight();
		return true;
	};

	const finishRecording = async (destination: 'convert' | 'download') => {
		if (!capture || finalizing) {
			return;
		}

		finalizing = true;
		const recordingFormat = format;
		setStatus(`Finalizing ${getContainerLabel(recordingFormat)}…`);
		const currentCapture = capture;
		try {
			const file = await currentCapture.stop();
			if (destination === 'convert') {
				setStatus('Opening recording in Remotion Convert…');
				await openCaptureInConvert(file);
				setStatus('Recording opened. Ready to record again.');
			} else {
				downloadFile(file);
				setStatus(
					`${getContainerLabel(recordingFormat)} downloaded. Ready to record again.`,
				);
			}
		} catch (error) {
			setStatus(error instanceof Error ? error.message : String(error), true);
		} finally {
			capture = null;
			finalizing = false;
			updateHighlight();
		}
	};

	return {
		handleRequest: async (request) => {
			if (request.command === 'get-state') {
				await refreshEncoderSupport();
				return getState();
			}

			if (request.command === 'set-options') {
				if (!capture && !finalizing) {
					if (
						setOptions(
							request.scale,
							request.format,
							request.includePageBackground,
						)
					) {
						await refreshEncoderSupport();
					}
				}

				return getState();
			}

			if (request.command === 'select-area') {
				if (!capture && !finalizing) {
					encoderSupportCheckId++;
					encoderSupportKey = null;
					selecting = true;
					selectionStart = null;
					selectionBox.style.display = 'none';
					selectionLayer.style.display = 'block';
					highlight.style.display = 'none';
					setStatus('Drag over the area to capture. Press Escape to cancel.');
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
				if (!capture && !finalizing) {
					if (selecting) {
						cancelSelection();
					}

					selectedTarget = {type: 'whole-page'};
					encoderSupportKey = null;
					updateHighlight();
					await refreshEncoderSupport();
				}

				return getState();
			}

			if (request.command === 'start-recording') {
				if (capture || finalizing || selecting) {
					return getState();
				}

				if (
					!setOptions(
						request.scale,
						request.format,
						request.includePageBackground,
					)
				) {
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

				if (!target.wholePage && !target.element?.isConnected) {
					selectedTarget = null;
					encoderSupport = 'unavailable';
					encoderSupportKey = null;
					outputSize = null;
					setStatus(
						'Select an element again; the previous target was removed.',
						true,
					);
					updateHighlight();
					return getState();
				}

				try {
					capture = new ElementCapture({
						element: target.element,
						wholePage: target.wholePage,
						scale,
						format,
						crop: target.crop,
					});
					await capture.start();
					setStatus(`Recording ${getFormatLabel(format)} at ${scale}× scale…`);
				} catch (error) {
					capture?.restore();
					capture = null;
					setStatus(
						error instanceof Error ? error.message : String(error),
						true,
					);
				}

				updateHighlight();
				return getState();
			}

			await finishRecording(request.destination);
			return getState();
		},
	};
};

if (!extensionWindow.__remotionCanvasCapture) {
	extensionWindow.__remotionCanvasCapture = createController();
}

chrome.runtime.onMessage.addListener((message) => {
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
