export type RequestFrameRequest = {
	src: string;
	timestamp: number;
	type: 'request-frame-request';
};

export type RequestFrameResponse = {
	frame: VideoFrame;
	type: 'request-frame-response';
};

export type WorkerRequestPayload = RequestFrameRequest;
export type WorkerResponsePayload = RequestFrameResponse;
