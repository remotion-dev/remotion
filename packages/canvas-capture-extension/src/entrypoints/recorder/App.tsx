import {Button, Slider} from '@remotion/design';
import {useCallback, useEffect, useRef, useState} from 'react';
import {browser} from 'wxt/browser';
import {
	captureControllerMessageType,
	type CaptureControllerRequest,
	type CaptureControllerState,
} from '../../messages';

const getStateRequest: CaptureControllerRequest = {
	type: captureControllerMessageType,
	command: 'get-state',
};

const sendRequestToTab = async (
	tabId: number,
	request: CaptureControllerRequest,
) => {
	const response = (await browser.tabs.sendMessage(tabId, request)) as
		| CaptureControllerState
		| {readonly message: string};
	if ('message' in response) {
		throw new Error(response.message);
	}

	return response;
};

export const App: React.FC = () => {
	const activeTabId = useRef<number | null>(null);
	const currentState = useRef<CaptureControllerState | null>(null);
	const busyRef = useRef(true);
	const pollInFlight = useRef(false);
	const [state, setState] = useState<CaptureControllerState | null>(null);
	const [busy, setBusy] = useState(true);
	const [connectionMessage, setConnectionMessage] = useState(
		'Connecting to the selected tab…',
	);
	const [scaleInput, setScaleInput] = useState(1);

	const applyState = useCallback((nextState: CaptureControllerState) => {
		currentState.current = nextState;
		setState(nextState);
		setConnectionMessage('');
	}, []);

	const setBusyState = useCallback((nextBusy: boolean) => {
		busyRef.current = nextBusy;
		setBusy(nextBusy);
	}, []);

	const renderConnecting = useCallback(() => {
		currentState.current = null;
		setState(null);
		setBusyState(true);
		setConnectionMessage('Connecting to the selected tab…');
	}, [setBusyState]);

	const renderDisconnected = useCallback(
		(message: string) => {
			currentState.current = null;
			setState(null);
			setBusyState(false);
			setConnectionMessage(message);
		},
		[setBusyState],
	);

	const connectToTab = useCallback(
		async (tabId: number) => {
			activeTabId.current = tabId;
			renderConnecting();
			try {
				let nextState: CaptureControllerState;
				try {
					nextState = await sendRequestToTab(tabId, getStateRequest);
				} catch {
					await browser.scripting.executeScript({
						target: {tabId},
						files: ['/capture.js'],
					});
					nextState = await sendRequestToTab(tabId, getStateRequest);
				}

				if (activeTabId.current !== tabId) {
					return;
				}

				setBusyState(false);
				applyState(nextState);
			} catch {
				if (activeTabId.current === tabId) {
					renderDisconnected(
						'This page cannot be captured. Open a regular webpage and click the extension icon again.',
					);
				}
			}
		},
		[applyState, renderConnecting, renderDisconnected, setBusyState],
	);

	const runCommand = useCallback(
		async (request: CaptureControllerRequest) => {
			const tabId = activeTabId.current;
			if (tabId === null) {
				renderDisconnected('No target tab is available.');
				return null;
			}

			setBusyState(true);
			try {
				const nextState = await sendRequestToTab(tabId, request);
				if (activeTabId.current !== tabId) {
					return null;
				}

				setBusyState(false);
				applyState(nextState);
				return nextState;
			} catch (error) {
				if (activeTabId.current === tabId) {
					renderDisconnected(
						error instanceof Error ? error.message : String(error),
					);
				}

				return null;
			}
		},
		[applyState, renderDisconnected, setBusyState],
	);

	useEffect(() => {
		if (state && document.activeElement?.id !== 'scale') {
			setScaleInput(state.scale);
		}
	}, [state]);

	useEffect(() => {
		browser.tabs
			.query({active: true, currentWindow: true})
			.then(([tab]) => {
				if (tab?.id === undefined) {
					renderDisconnected('No active tab is available.');
					return;
				}

				return connectToTab(tab.id);
			})
			.catch((error) => {
				renderDisconnected(
					error instanceof Error ? error.message : String(error),
				);
			});
	}, [connectToTab, renderDisconnected]);

	useEffect(() => {
		const interval = window.setInterval(() => {
			const tabId = activeTabId.current;
			if (
				tabId === null ||
				busyRef.current ||
				pollInFlight.current ||
				currentState.current === null
			) {
				return;
			}

			pollInFlight.current = true;
			sendRequestToTab(tabId, getStateRequest)
				.then((nextState) => {
					if (activeTabId.current !== tabId || busyRef.current) {
						return;
					}

					applyState(nextState);
				})
				.catch((error) => {
					if (activeTabId.current === tabId) {
						renderDisconnected(
							error instanceof Error ? error.message : String(error),
						);
					}
				})
				.finally(() => {
					pollInFlight.current = false;
				});
		}, 500);

		return () => window.clearInterval(interval);
	}, [applyState, renderDisconnected]);

	const controlsDisabled = busy || !state || state.finalizing;
	const setupDisabled = controlsDisabled || state?.hasCompletedRecording;
	const targetLabel = state?.targetLabel
		? `${state.targetLabel}${
				state.outputSize
					? ` · ${state.outputSize.width}×${state.outputSize.height} output`
					: ''
			}`
		: 'No target selected';
	const status = state?.status ?? connectionMessage;
	const statusIsError = state?.error ?? !busy;
	const recordDisabled =
		controlsDisabled ||
		!state?.supported ||
		!state.hasTarget ||
		state.selecting ||
		(!state.recording && state.encoderSupport !== 'supported');

	const updateOptions = (scale: number) => {
		runCommand({
			type: captureControllerMessageType,
			command: 'set-options',
			scale,
		}).catch(() => undefined);
	};

	return (
		<main className="app-shell">
			<header className="header">
				<img className="logo" src="/logo.svg" alt="" />
				<h1>Canvas Capture</h1>
			</header>

			<section className="capture-section">
				<div className="section-label">Capture target</div>
				<div className="button-row">
					<Button
						className="secondary-button"
						disabled={setupDisabled || state?.recording}
						onClick={() => {
							const command = state?.selecting
								? 'cancel-selection'
								: 'select-area';
							runCommand({type: captureControllerMessageType, command})
								.then((nextState) => {
									if (!nextState?.selecting) {
										return;
									}

									window.close();
								})
								.catch(() => undefined);
						}}
					>
						{state?.selecting ? 'Cancel selection' : 'Select area'}
					</Button>
					<Button
						className="secondary-button"
						disabled={setupDisabled || state?.recording}
						onClick={() =>
							runCommand({
								type: captureControllerMessageType,
								command: 'select-whole-page',
							}).catch(() => undefined)
						}
					>
						Whole page
					</Button>
				</div>
			</section>

			<section className="settings-panel">
				<div className="field">
					<label>Format</label>
					<div className="format-value">
						{state?.format === 'webm' ? 'WebM · VP9' : 'MP4 · H.264'}
					</div>
				</div>

				<div className="field">
					<label htmlFor="scale">Scale</label>
					<div className="scale-control">
						<Slider
							id="scale"
							min="0.1"
							max="4"
							step="0.1"
							disabled={setupDisabled || state?.recording}
							value={scaleInput}
							onChange={setScaleInput}
							onPointerUp={(event) =>
								updateOptions(Number(event.currentTarget.value))
							}
							onKeyUp={(event) =>
								updateOptions(Number(event.currentTarget.value))
							}
						/>
						<output htmlFor="scale">{Number(scaleInput.toFixed(1))}×</output>
					</div>
				</div>
			</section>

			<div className="actions">
				{state?.hasCompletedRecording ? (
					<div className="completed-recording">
						<div className="completed-title">Recording ready</div>
						<div className="completed-actions">
							<Button
								className="convert-button"
								disabled={controlsDisabled}
								onClick={() =>
									runCommand({
										type: captureControllerMessageType,
										command: 'open-in-convert',
									}).catch(() => undefined)
								}
							>
								Open in Convert
							</Button>
							<Button
								className="download-button"
								disabled={controlsDisabled}
								onClick={() =>
									runCommand({
										type: captureControllerMessageType,
										command: 'download-recording',
									}).catch(() => undefined)
								}
							>
								Download {state.format === 'mp4' ? 'MP4' : 'WebM'}
							</Button>
						</div>
					</div>
				) : (
					<Button
						className={`record-button${state?.recording ? ' recording' : ''}`}
						disabled={recordDisabled}
						title={state?.encoderSupport === 'unsupported' ? state.status : ''}
						onClick={() => {
							if (state?.recording) {
								runCommand({
									type: captureControllerMessageType,
									command: 'stop-recording',
								}).catch(() => undefined);
								return;
							}

							runCommand({
								type: captureControllerMessageType,
								command: 'start-recording',
								scale: state?.scale ?? 1,
							}).catch(() => undefined);
						}}
					>
						{state?.recording ? 'Stop recording' : 'Start recording'}
					</Button>
				)}
				<div className={`target-summary${state?.hasTarget ? ' selected' : ''}`}>
					{targetLabel}
				</div>
			</div>

			<footer className={`status${statusIsError ? ' error' : ''}`}>
				<span className="status-dot" />
				<span>{status}</span>
			</footer>
		</main>
	);
};
