import {browser} from 'wxt/browser';
import {type CaptureCrop, getCapturePreflight, PageCapture} from './capture';
import {openCaptureInConvert} from './handoff';
import {
	isCaptureControllerRequest,
	type CaptureFormat,
	type CaptureControllerRequest,
	type CaptureControllerState,
} from './messages';
import {canEncodeCapture, isHtmlInCanvasAvailable} from './recorder';
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
			background: transparent;
			cursor: crosshair;
			pointer-events: auto;
		}
		.selection-box {
			position: fixed;
			display: none;
			border: 1px solid #0b84f3;
			background: transparent;
		}
		.highlight {
			position: fixed;
			display: none;
			border: 1px solid #0b84f3;
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
		let capture: PageCapture | null = null;
		let completedRecording: File | null = null;
		let finalizing = false;
		let selecting = false;
		let scale = Math.max(1, window.devicePixelRatio);
		let format: CaptureFormat = 'mp4';
		let encoderSupport: CaptureControllerState['encoderSupport'] =
			'unavailable';
		let outputSize: CaptureControllerState['outputSize'] = null;
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
						`Neither H.264 MP4 nor VP9 WebM encoding is supported at ${outputSize.width}×${outputSize.height} in this browser. Reduce the scale or select a smaller area.`,
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
			hasCompletedRecording: completedRecording !== null,
			scale,
			format,
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

			const crop = getCropRelativeTo(
				selection,
				document.body.getBoundingClientRect(),
			);
			selectedTarget = {type: 'page-crop', crop};

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
			}
		};

		return {
			handleRequest: async (request) => {
				if (request.command === 'get-state') {
					await refreshEncoderSupport();
					return getState();
				}

				if (request.command === 'set-options') {
					if (!capture && !completedRecording && !finalizing) {
						if (setOptions(request.scale)) {
							await refreshEncoderSupport();
						}
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
					if (!capture && !completedRecording && !finalizing) {
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
					if (capture || completedRecording || finalizing || selecting) {
						return getState();
					}

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

					updateHighlight();
					return getState();
				}

				if (request.command === 'stop-recording') {
					await finishRecording();
					return getState();
				}

				await consumeCompletedRecording(
					request.command === 'open-in-convert' ? 'convert' : 'download',
				);
				return getState();
			},
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
