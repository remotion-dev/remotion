export const captureControllerMessageType =
	'remotion-canvas-capture-controller';
export const capturePopupTargetMessageType =
	'remotion-canvas-capture-popup-target';

export type CaptureFormat = 'mp4' | 'webm';

export type CapturePopupTargetMessage = {
	readonly type: typeof capturePopupTargetMessageType;
	readonly tabId: number;
};

export const isCapturePopupTargetMessage = (
	message: unknown,
): message is CapturePopupTargetMessage => {
	return (
		typeof message === 'object' &&
		message !== null &&
		'type' in message &&
		message.type === capturePopupTargetMessageType &&
		'tabId' in message &&
		typeof message.tabId === 'number'
	);
};

export type CaptureControllerState = {
	readonly supported: boolean;
	readonly selecting: boolean;
	readonly hasTarget: boolean;
	readonly targetLabel: string | null;
	readonly encoderSupport:
		| 'unavailable'
		| 'checking'
		| 'supported'
		| 'unsupported';
	readonly outputSize: {readonly width: number; readonly height: number} | null;
	readonly recording: boolean;
	readonly finalizing: boolean;
	readonly scale: number;
	readonly format: CaptureFormat;
	readonly status: string;
	readonly error: boolean;
};

export type CaptureControllerRequest =
	| {
			readonly type: typeof captureControllerMessageType;
			readonly command: 'get-state';
	  }
	| {
			readonly type: typeof captureControllerMessageType;
			readonly command: 'set-options';
			readonly scale: number;
			readonly format: CaptureFormat;
	  }
	| {
			readonly type: typeof captureControllerMessageType;
			readonly command: 'select-area';
	  }
	| {
			readonly type: typeof captureControllerMessageType;
			readonly command: 'cancel-selection';
	  }
	| {
			readonly type: typeof captureControllerMessageType;
			readonly command: 'select-whole-page';
	  }
	| {
			readonly type: typeof captureControllerMessageType;
			readonly command: 'start-recording';
			readonly scale: number;
			readonly format: CaptureFormat;
	  }
	| {
			readonly type: typeof captureControllerMessageType;
			readonly command: 'stop-recording';
			readonly destination: 'convert' | 'download';
	  };

export const isCaptureControllerRequest = (
	message: unknown,
): message is CaptureControllerRequest => {
	return (
		typeof message === 'object' &&
		message !== null &&
		'type' in message &&
		message.type === captureControllerMessageType &&
		'command' in message &&
		typeof message.command === 'string'
	);
};
