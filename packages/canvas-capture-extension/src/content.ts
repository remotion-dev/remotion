import {type CaptureCrop, ElementCapture} from './capture';
import {openCaptureInConvert} from './handoff';
import {isHtmlInCanvasAvailable} from './recorder';
import {
	findLowestElementContainingRectangle,
	makeSelectionRectangle,
	type SelectionRectangle,
} from './selection';

type ExtensionController = {
	readonly togglePanel: () => void;
};

type ExtensionWindow = Window & {
	__remotionCanvasCapture?: ExtensionController;
};

const extensionWindow = window as ExtensionWindow;

const createButton = (label: string) => {
	const button = document.createElement('button');
	button.type = 'button';
	button.textContent = label;
	return button;
};

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
		.panel {
			position: fixed;
			top: 16px;
			right: 16px;
			display: none;
			flex-direction: column;
			gap: 10px;
			width: 292px;
			padding: 14px;
			border: 1px solid rgba(255,255,255,.16);
			border-radius: 12px;
			background: #151515;
			box-shadow: 0 12px 40px rgba(0,0,0,.35);
			color: #f5f5f5;
			font: 13px/1.4 Inter, ui-sans-serif, system-ui, -apple-system, sans-serif;
			pointer-events: auto;
		}
		.header { display: flex; align-items: center; justify-content: space-between; }
		.title { font-size: 14px; font-weight: 650; }
		.close {
			width: 26px;
			height: 26px;
			padding: 0;
			border: 0;
			background: transparent;
			color: #aaa;
			font-size: 20px;
			cursor: pointer;
		}
		.row { display: flex; gap: 8px; }
		label { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
		input {
			width: 88px;
			padding: 7px 8px;
			border: 1px solid #454545;
			border-radius: 7px;
			background: #242424;
			color: white;
			font: inherit;
		}
		button {
			min-height: 34px;
			padding: 7px 10px;
			border: 1px solid #454545;
			border-radius: 7px;
			background: #292929;
			color: #f5f5f5;
			font: inherit;
			font-weight: 550;
			cursor: pointer;
		}
		button:hover:not(:disabled) { background: #363636; }
		button:disabled { cursor: default; opacity: .45; }
		.row button { flex: 1; }
		.record { border-color: #ff4d61; background: #db2339; }
		.record:hover:not(:disabled) { background: #ef3349; }
		.record.recording { background: #fafafa; border-color: #fafafa; color: #be1830; }
		.status { min-height: 18px; color: #aaa; overflow-wrap: anywhere; }
		.status.error { color: #ff7b8b; }
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

	const panel = document.createElement('div');
	panel.className = 'panel';
	panel.style.display = 'none';
	const header = document.createElement('div');
	header.className = 'header';
	const title = document.createElement('div');
	title.className = 'title';
	title.textContent = 'Remotion Canvas Capture';
	const closeButton = createButton('×');
	closeButton.className = 'close';
	closeButton.title = 'Close';
	header.append(title, closeButton);

	const scaleLabel = document.createElement('label');
	scaleLabel.textContent = 'Scale';
	const scaleInput = document.createElement('input');
	scaleInput.type = 'number';
	scaleInput.min = '0.1';
	scaleInput.step = '0.1';
	scaleInput.value = String(Math.max(1, window.devicePixelRatio));
	scaleLabel.appendChild(scaleInput);

	const targetRow = document.createElement('div');
	targetRow.className = 'row';
	const selectButton = createButton('Select area');
	const wholePageButton = createButton('Whole page');
	targetRow.append(selectButton, wholePageButton);

	const recordButton = createButton('Record');
	recordButton.className = 'record';
	const downloadButton = createButton('Stop and download WebM');
	downloadButton.style.display = 'none';
	const status = document.createElement('div');
	status.className = 'status';

	panel.append(
		header,
		scaleLabel,
		targetRow,
		recordButton,
		downloadButton,
		status,
	);

	const selectionLayer = document.createElement('div');
	selectionLayer.className = 'selection-layer';
	const selectionBox = document.createElement('div');
	selectionBox.className = 'selection-box';
	selectionLayer.appendChild(selectionBox);
	const highlight = document.createElement('div');
	highlight.className = 'highlight';
	shadow.append(style, panel, highlight, selectionLayer);

	let selectedElement: Element | null = null;
	let selectedCrop: CaptureCrop | null = null;
	let wholePage = false;
	let capture: ElementCapture | null = null;
	let finalizing = false;
	const isSupported = isHtmlInCanvasAvailable();
	let selectionStart: {readonly x: number; readonly y: number} | null = null;

	const setStatus = (message: string, error = false) => {
		status.textContent = message;
		status.classList.toggle('error', error);
	};

	const updateHighlight = () => {
		if (capture) {
			highlight.style.display = 'none';
			return;
		}

		let rect: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'> | null = null;
		if (wholePage && selectedCrop) {
			const pageRect = document.body.getBoundingClientRect();
			rect = {
				left: pageRect.left + selectedCrop.left,
				top: pageRect.top + selectedCrop.top,
				width: selectedCrop.width,
				height: selectedCrop.height,
			};
		} else if (selectedElement?.isConnected) {
			const elementRect = selectedElement.getBoundingClientRect();
			rect = selectedCrop
				? {
						left: elementRect.left + selectedCrop.left,
						top: elementRect.top + selectedCrop.top,
						width: selectedCrop.width,
						height: selectedCrop.height,
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

	const updateControls = () => {
		const isRecording = capture !== null;
		scaleInput.disabled = isRecording || finalizing;
		selectButton.disabled = isRecording || finalizing;
		wholePageButton.disabled = isRecording || finalizing;
		closeButton.disabled = finalizing;
		recordButton.disabled =
			!isSupported || finalizing || (!selectedElement && !wholePage);
		recordButton.textContent = isRecording
			? 'Stop and open in Convert'
			: 'Record';
		recordButton.classList.toggle('recording', isRecording);
		downloadButton.style.display = isRecording ? 'block' : 'none';
		downloadButton.disabled = finalizing;
		updateHighlight();
	};

	const selectWholePage = () => {
		selectedElement = null;
		selectedCrop = null;
		wholePage = true;
		setStatus('Target: whole page');
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
		selectionLayer.style.display = 'none';
		selectionBox.style.display = 'none';
		panel.style.display = 'flex';

		const target = findLowestElementContainingRectangle({
			selection,
			excludedElement: host,
		});
		if (!target) {
			setStatus('No element encompasses that rectangle.', true);
			return;
		}

		if (target === document.body || target === document.documentElement) {
			selectedElement = null;
			wholePage = true;
			selectedCrop = getCropRelativeTo(
				selection,
				document.body.getBoundingClientRect(),
			);
			setStatus(
				`Target: page crop (${Math.round(selectedCrop.width)}×${Math.round(selectedCrop.height)})`,
			);
			updateControls();
			return;
		}

		selectedElement = target;
		selectedCrop = getCropRelativeTo(selection, target.getBoundingClientRect());
		wholePage = false;
		setStatus(
			`Target: ${describeElement(target)} crop (${Math.round(selectedCrop.width)}×${Math.round(selectedCrop.height)})`,
		);
		updateControls();
	};

	selectButton.addEventListener('click', () => {
		panel.style.display = 'none';
		highlight.style.display = 'none';
		selectionLayer.style.display = 'block';
		setStatus('Drag over the area to capture.');
	});

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
	wholePageButton.addEventListener('click', selectWholePage);

	const finishRecording = async (destination: 'convert' | 'download') => {
		if (!capture) {
			return;
		}

		finalizing = true;
		setStatus('Finalizing WebM…');
		updateControls();
		const currentCapture = capture;
		try {
			const file = await currentCapture.stop();
			if (destination === 'convert') {
				setStatus('Opening recording in Remotion Convert…');
				await openCaptureInConvert(file);
				setStatus('Recording opened. Ready to record again.');
			} else {
				downloadFile(file);
				setStatus('WebM downloaded. Ready to record again.');
			}
		} catch (error) {
			setStatus(error instanceof Error ? error.message : String(error), true);
		} finally {
			capture = null;
			finalizing = false;
			updateControls();
		}
	};

	recordButton.addEventListener('click', () => {
		const toggle = async () => {
			if (capture) {
				await finishRecording('convert');
				return;
			}

			const scale = scaleInput.valueAsNumber;
			if (!Number.isFinite(scale) || scale <= 0) {
				setStatus('Scale must be a number greater than 0.', true);
				return;
			}

			if (!wholePage && (!selectedElement || !selectedElement.isConnected)) {
				selectedElement = null;
				setStatus(
					'Select an element again; the previous target was removed.',
					true,
				);
				updateControls();
				return;
			}

			try {
				capture = new ElementCapture({
					element: selectedElement,
					wholePage,
					scale,
					crop: selectedCrop,
				});
				await capture.start();
				setStatus(`Recording at ${scale}× scale…`);
			} catch (error) {
				capture?.restore();
				capture = null;
				setStatus(error instanceof Error ? error.message : String(error), true);
			}

			updateControls();
		};

		toggle().catch((error) => {
			setStatus(error instanceof Error ? error.message : String(error), true);
		});
	});

	downloadButton.addEventListener('click', () => {
		finishRecording('download').catch((error) => {
			setStatus(error instanceof Error ? error.message : String(error), true);
		});
	});

	closeButton.addEventListener('click', () => {
		panel.style.display = 'none';
		highlight.style.display = 'none';
	});

	window.addEventListener('scroll', updateHighlight, true);
	window.addEventListener('resize', updateHighlight);
	window.addEventListener('keydown', (event) => {
		if (event.key !== 'Escape' || selectionLayer.style.display === 'none') {
			return;
		}

		selectionStart = null;
		selectionLayer.style.display = 'none';
		selectionBox.style.display = 'none';
		panel.style.display = 'flex';
		updateHighlight();
	});

	if (!isSupported) {
		setStatus('Enable chrome://flags/#canvas-draw-element, then reload.', true);
	}

	updateControls();

	return {
		togglePanel: () => {
			const shouldOpen = panel.style.display === 'none';
			panel.style.display = shouldOpen ? 'flex' : 'none';
			if (!shouldOpen) {
				highlight.style.display = 'none';
			} else {
				updateHighlight();
			}
		},
	};
};

if (!extensionWindow.__remotionCanvasCapture) {
	extensionWindow.__remotionCanvasCapture = createController();
}

chrome.runtime.onMessage.addListener((message) => {
	if (
		typeof message === 'object' &&
		message !== null &&
		'type' in message &&
		message.type === 'remotion-canvas-capture-toggle'
	) {
		extensionWindow.__remotionCanvasCapture?.togglePanel();
	}
});
