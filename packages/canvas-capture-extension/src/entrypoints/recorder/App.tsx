import {useCallback, useEffect, useRef, useState} from 'react';
import {browser} from 'wxt/browser';
import {
	captureControllerMessageType,
	isCapturePopupTargetMessage,
	type CaptureControllerRequest,
	type CaptureControllerState,
	type CaptureFormat,
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
	const [scaleInput, setScaleInput] = useState('1');

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
			setScaleInput(String(state.scale));
		}
	}, [state]);

	useEffect(() => {
		const onMessage = (message: unknown) => {
			if (!isCapturePopupTargetMessage(message)) {
				return;
			}

			connectToTab(message.tabId).catch(() => undefined);
		};

		browser.runtime.onMessage.addListener(onMessage);
		return () => browser.runtime.onMessage.removeListener(onMessage);
	}, [connectToTab]);

	useEffect(() => {
		const initialTabId = Number(
			new URL(window.location.href).searchParams.get('tabId'),
		);
		if (Number.isInteger(initialTabId) && initialTabId >= 0) {
			connectToTab(initialTabId).catch(() => undefined);
		} else {
			renderDisconnected(
				'No target tab was provided. Click the extension icon on the page you want to capture.',
			);
		}
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

					const selectionFinished =
						currentState.current?.selecting && !nextState.selecting;
					applyState(nextState);
					if (selectionFinished) {
						browser.windows
							.getCurrent()
							.then((recorderWindow) => {
								if (recorderWindow.id !== undefined) {
									return browser.windows.update(recorderWindow.id, {
										focused: true,
									});
								}
							})
							.catch(() => undefined);
					}
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

	const updateOptions = (format: CaptureFormat, scale: number) => {
		runCommand({
			type: captureControllerMessageType,
			command: 'set-options',
			format,
			scale,
		}).catch(() => undefined);
	};

	return (
		<main className="app-shell">
			<header className="header">
				<img className="logo" src="/logo.svg" alt="" />
				<div>
					<h1>Canvas Capture</h1>
					<p>High-resolution recording for the web</p>
				</div>
			</header>

			<section className="panel settings-panel">
				<div className="field">
					<label htmlFor="format">Format</label>
					<select
						id="format"
						disabled={controlsDisabled || state?.recording}
						value={state?.format ?? 'mp4'}
						onChange={(event) =>
							updateOptions(
								event.currentTarget.value as CaptureFormat,
								state?.scale ?? 1,
							)
						}
					>
						<option value="mp4">MP4 · H.264</option>
						<option value="webm">WebM · VP9</option>
					</select>
				</div>

				<div className="field">
					<label htmlFor="scale">Scale</label>
					<div className="scale-control">
						<input
							id="scale"
							type="number"
							min="0.1"
							step="0.1"
							disabled={controlsDisabled || state?.recording}
							value={scaleInput}
							onChange={(event) => setScaleInput(event.currentTarget.value)}
							onBlur={() =>
								updateOptions(state?.format ?? 'mp4', Number(scaleInput))
							}
							onKeyDown={(event) => {
								if (event.key === 'Enter') {
									event.currentTarget.blur();
								}
							}}
						/>
						<span>×</span>
					</div>
				</div>
			</section>

			<section className="capture-section">
				<div className="section-label">Capture target</div>
				<div className="button-row">
					<button
						className="secondary-button"
						type="button"
						disabled={controlsDisabled || state?.recording}
						onClick={() => {
							const command = state?.selecting
								? 'cancel-selection'
								: 'select-area';
							runCommand({type: captureControllerMessageType, command})
								.then((nextState) => {
									if (!nextState?.selecting) {
										return;
									}

									const tabId = activeTabId.current;
									if (tabId === null) {
										return;
									}

									browser.tabs
										.get(tabId)
										.then(async (tab) => {
											await browser.tabs.update(tabId, {active: true});
											if (tab.windowId !== undefined) {
												await browser.windows.update(tab.windowId, {
													focused: true,
												});
											}
										})
										.catch(() => undefined);
								})
								.catch(() => undefined);
						}}
					>
						<span className="selection-icon" aria-hidden="true" />
						{state?.selecting ? 'Cancel selection' : 'Select area'}
					</button>
					<button
						className="secondary-button"
						type="button"
						disabled={controlsDisabled || state?.recording}
						onClick={() =>
							runCommand({
								type: captureControllerMessageType,
								command: 'select-whole-page',
							}).catch(() => undefined)
						}
					>
						<span className="page-icon" aria-hidden="true" />
						Whole page
					</button>
				</div>
				<div className={`target-card${state?.hasTarget ? ' selected' : ''}`}>
					<span className="target-dot" />
					<span>{targetLabel}</span>
				</div>
			</section>

			<div className="actions">
				<button
					className={`record-button${state?.recording ? ' recording' : ''}`}
					type="button"
					disabled={recordDisabled}
					title={state?.encoderSupport === 'unsupported' ? state.status : ''}
					onClick={() => {
						if (state?.recording) {
							runCommand({
								type: captureControllerMessageType,
								command: 'stop-recording',
								destination: 'convert',
							}).catch(() => undefined);
							return;
						}

						runCommand({
							type: captureControllerMessageType,
							command: 'start-recording',
							format: state?.format ?? 'mp4',
							scale: state?.scale ?? 1,
						}).catch(() => undefined);
					}}
				>
					<span className="record-icon" aria-hidden="true" />
					{state?.recording ? 'Stop & open in Convert' : 'Start recording'}
				</button>
				{state?.recording ? (
					<button
						className="download-button"
						type="button"
						disabled={controlsDisabled}
						onClick={() =>
							runCommand({
								type: captureControllerMessageType,
								command: 'stop-recording',
								destination: 'download',
							}).catch(() => undefined)
						}
					>
						Download {state.format === 'mp4' ? 'MP4' : 'WebM'}
					</button>
				) : null}
			</div>

			<footer className={`status${statusIsError ? ' error' : ''}`}>
				<span className="status-dot" />
				<span>{status}</span>
			</footer>
		</main>
	);
};
