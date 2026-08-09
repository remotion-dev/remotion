import {
	captureControllerMessageType,
	isCapturePopupTargetMessage,
	type CaptureControllerRequest,
	type CaptureControllerState,
	type CaptureFormat,
} from './messages';

const getElement = <T extends HTMLElement>(id: string) => {
	const element = document.getElementById(id);
	if (!element) {
		throw new Error(`Missing popup element: ${id}`);
	}

	return element as T;
};

const scaleInput = getElement<HTMLInputElement>('scale');
const formatInput = getElement<HTMLSelectElement>('format');
const selectAreaButton = getElement<HTMLButtonElement>('select-area');
const wholePageButton = getElement<HTMLButtonElement>('whole-page');
const backgroundInput = getElement<HTMLInputElement>('include-background');
const recordButton = getElement<HTMLButtonElement>('record');
const downloadButton = getElement<HTMLButtonElement>('download');
const target = getElement<HTMLDivElement>('target');
const status = getElement<HTMLDivElement>('status');
const getStateRequest: CaptureControllerRequest = {
	type: captureControllerMessageType,
	command: 'get-state',
};

let activeTabId: number | null = null;
let currentState: CaptureControllerState | null = null;
let busy = true;
let pollInFlight = false;

const disableControls = () => {
	scaleInput.disabled = true;
	formatInput.disabled = true;
	selectAreaButton.disabled = true;
	wholePageButton.disabled = true;
	backgroundInput.disabled = true;
	recordButton.disabled = true;
	downloadButton.hidden = true;
};

const renderConnecting = () => {
	currentState = null;
	busy = true;
	disableControls();
	target.textContent = 'Connecting…';
	status.textContent = 'Connecting to the selected tab…';
	status.classList.remove('error');
};

const renderDisconnected = (message: string) => {
	currentState = null;
	busy = false;
	disableControls();
	target.textContent = 'No capturable page';
	status.textContent = message;
	status.classList.add('error');
};

const render = (state: CaptureControllerState) => {
	currentState = state;
	const controlsDisabled = busy || state.finalizing;
	if (document.activeElement !== scaleInput) {
		scaleInput.value = String(state.scale);
	}

	formatInput.value = state.format;
	backgroundInput.checked = state.includePageBackground;
	scaleInput.disabled = controlsDisabled || state.recording;
	formatInput.disabled = controlsDisabled || state.recording;
	backgroundInput.disabled = controlsDisabled || state.recording;
	selectAreaButton.disabled = controlsDisabled || state.recording;
	selectAreaButton.textContent = state.selecting
		? 'Cancel selection'
		: 'Select area';
	wholePageButton.disabled = controlsDisabled || state.recording;
	recordButton.disabled =
		controlsDisabled ||
		!state.supported ||
		!state.hasTarget ||
		state.selecting ||
		(!state.recording && state.encoderSupport !== 'supported');
	recordButton.textContent = state.recording
		? 'Stop and open in Convert'
		: 'Record';
	recordButton.classList.toggle('recording', state.recording);
	recordButton.title =
		state.encoderSupport === 'unsupported' ? state.status : '';
	downloadButton.hidden = !state.recording;
	downloadButton.disabled = controlsDisabled;
	downloadButton.textContent = `Stop and download ${state.format === 'mp4' ? 'MP4' : 'WebM'}`;
	target.textContent = state.targetLabel
		? `${state.targetLabel}${state.outputSize ? ` · ${state.outputSize.width}×${state.outputSize.height} output` : ''}`
		: 'No target selected';
	status.textContent = state.status;
	status.classList.toggle('error', state.error);
};

const sendRequestToTab = async (
	tabId: number,
	request: CaptureControllerRequest,
) => {
	const response = (await chrome.tabs.sendMessage(tabId, request)) as
		| CaptureControllerState
		| {readonly message: string};
	if ('message' in response) {
		throw new Error(response.message);
	}

	return response;
};

const runCommand = async (request: CaptureControllerRequest) => {
	const tabId = activeTabId;
	if (tabId === null) {
		renderDisconnected('No target tab is available.');
		return null;
	}

	busy = true;
	if (currentState) {
		render(currentState);
	}

	try {
		const nextState = await sendRequestToTab(tabId, request);
		if (activeTabId !== tabId) {
			return null;
		}

		busy = false;
		render(nextState);
		return nextState;
	} catch (error) {
		if (activeTabId === tabId) {
			renderDisconnected(
				error instanceof Error ? error.message : String(error),
			);
		}

		return null;
	}
};

const getOptions = () => ({
	scale: scaleInput.valueAsNumber,
	format: formatInput.value as CaptureFormat,
	includePageBackground: backgroundInput.checked,
});

const focusTargetPage = async () => {
	const tabId = activeTabId;
	if (tabId === null) {
		return;
	}

	const tab = await chrome.tabs.get(tabId);
	await chrome.tabs.update(tabId, {active: true});
	if (tab.windowId !== undefined) {
		await chrome.windows.update(tab.windowId, {focused: true});
	}
};

const focusRecorderWindow = async () => {
	const recorderWindow = await chrome.windows.getCurrent();
	if (recorderWindow.id !== undefined) {
		await chrome.windows.update(recorderWindow.id, {focused: true});
	}
};

selectAreaButton.addEventListener('click', () => {
	const command = currentState?.selecting ? 'cancel-selection' : 'select-area';
	runCommand({type: captureControllerMessageType, command})
		.then((state) => {
			if (state?.selecting) {
				return focusTargetPage();
			}
		})
		.catch(() => undefined);
});

wholePageButton.addEventListener('click', () => {
	runCommand({
		type: captureControllerMessageType,
		command: 'select-whole-page',
	}).catch(() => undefined);
});

const updateOptions = () => {
	const options = getOptions();
	runCommand({
		type: captureControllerMessageType,
		command: 'set-options',
		...options,
	}).catch(() => undefined);
};

scaleInput.addEventListener('change', updateOptions);
formatInput.addEventListener('change', updateOptions);
backgroundInput.addEventListener('change', updateOptions);

recordButton.addEventListener('click', () => {
	if (currentState?.recording) {
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
		...getOptions(),
	}).catch(() => undefined);
});

downloadButton.addEventListener('click', () => {
	runCommand({
		type: captureControllerMessageType,
		command: 'stop-recording',
		destination: 'download',
	}).catch(() => undefined);
});

const connectToTab = async (tabId: number) => {
	activeTabId = tabId;
	renderConnecting();
	try {
		let state: CaptureControllerState;
		try {
			state = await sendRequestToTab(tabId, getStateRequest);
		} catch {
			await chrome.scripting.executeScript({
				target: {tabId},
				files: ['content.js'],
			});
			state = await sendRequestToTab(tabId, getStateRequest);
		}

		if (activeTabId !== tabId) {
			return;
		}

		busy = false;
		render(state);
	} catch {
		if (activeTabId === tabId) {
			renderDisconnected(
				'This page cannot be captured. Open a regular webpage and click the extension icon again.',
			);
		}
	}
};

chrome.runtime.onMessage.addListener((message) => {
	if (!isCapturePopupTargetMessage(message)) {
		return;
	}

	return connectToTab(message.tabId);
});

setInterval(() => {
	const tabId = activeTabId;
	if (tabId === null || busy || pollInFlight || currentState === null) {
		return;
	}

	pollInFlight = true;
	sendRequestToTab(tabId, getStateRequest)
		.then((state) => {
			if (activeTabId === tabId && !busy) {
				const selectionFinished = currentState?.selecting && !state.selecting;
				render(state);
				if (selectionFinished) {
					focusRecorderWindow().catch(() => undefined);
				}
			}
		})
		.catch((error) => {
			if (activeTabId === tabId) {
				renderDisconnected(
					error instanceof Error ? error.message : String(error),
				);
			}
		})
		.finally(() => {
			pollInFlight = false;
		});
}, 500);

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
