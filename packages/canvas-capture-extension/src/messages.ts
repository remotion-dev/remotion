export const captureControllerMessageType =
	'remotion-canvas-capture-controller';

export type CaptureFormat = 'mp4' | 'webm';

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
	readonly hasCompletedRecording: boolean;
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
	  }
	| {
			readonly type: typeof captureControllerMessageType;
			readonly command: 'stop-recording';
	  }
	| {
			readonly type: typeof captureControllerMessageType;
			readonly command: 'open-in-convert';
	  }
	| {
			readonly type: typeof captureControllerMessageType;
			readonly command: 'download-recording';
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
