import type {DownloadBehavior} from 'remotion/no-react';
import {rendersPrefix} from './constants';
import type {FunctionErrorInfo} from './write-error-to-storage';

// How a renderer function hands its chunk back to the launch function:
// - 'response-streaming': streamed over the function's response
// - 'storage': written to the bucket and polled by the launch function.
//   Used where response streaming is unavailable.
export type RendererFunctionTransport = 'response-streaming' | 'storage';

export type StorageRendererArtifactMetadata = {
	filename: string;
	frame: number;
	binary: boolean;
	downloadBehavior: DownloadBehavior | null;
};

type StorageRendererStatusBase = {
	schema: 1;
	chunk: number;
	attempt: number;
	functionInvoked: boolean;
	renderedFrames: number;
	encodedFrames: number;
	uploadedFrames: number;
	uploadedSizeInBytes: number;
	startedAt: number;
};

export type StorageRendererStatus =
	| (StorageRendererStatusBase & {
			state: 'running';
	  })
	| (StorageRendererStatusBase & {
			state: 'completed';
			functionInvoked: true;
			completedAt: number;
			videoKey: string | null;
			audioKey: string | null;
			artifacts: Array<{
				key: string;
				metadata: StorageRendererArtifactMetadata;
			}>;
	  })
	| (StorageRendererStatusBase & {
			state: 'failed';
			failedAt: number;
			errorInfo: FunctionErrorInfo;
			shouldRetry: boolean;
	  });

export const rendererTransportPrefix = (renderId: string) =>
	`${rendersPrefix(renderId)}/transport`;

export const rendererTransportAttemptPrefix = ({
	renderId,
	chunk,
	attempt,
}: {
	renderId: string;
	chunk: number;
	attempt: number;
}) => `${rendererTransportPrefix(renderId)}/chunks/${chunk}/attempt-${attempt}`;

export const rendererTransportStatusKey = (options: {
	renderId: string;
	chunk: number;
	attempt: number;
}) => `${rendererTransportAttemptPrefix(options)}/status.json`;

export const rendererTransportVideoKey = (options: {
	renderId: string;
	chunk: number;
	attempt: number;
}) => `${rendererTransportAttemptPrefix(options)}/video`;

export const rendererTransportAudioKey = (options: {
	renderId: string;
	chunk: number;
	attempt: number;
}) => `${rendererTransportAttemptPrefix(options)}/audio`;

export const rendererTransportArtifactKey = (
	options: {
		renderId: string;
		chunk: number;
		attempt: number;
	},
	artifactIndex: number,
) => `${rendererTransportAttemptPrefix(options)}/artifacts/${artifactIndex}`;

const isNumber = (value: unknown): value is number =>
	typeof value === 'number' && Number.isFinite(value);

export const parseStorageRendererStatus = ({
	value,
	expectedChunk,
	expectedAttempt,
}: {
	value: unknown;
	expectedChunk: number;
	expectedAttempt: number;
}): StorageRendererStatus => {
	if (typeof value !== 'object' || value === null) {
		throw new Error('Renderer storage status must be an object');
	}

	const status = value as Record<string, unknown>;
	if (status.schema !== 1) {
		throw new Error(
			`Unsupported renderer storage status schema: ${String(status.schema)}`,
		);
	}

	if (status.chunk !== expectedChunk || status.attempt !== expectedAttempt) {
		throw new Error(
			`Renderer storage status identifies chunk ${String(status.chunk)}, attempt ${String(status.attempt)}; expected chunk ${expectedChunk}, attempt ${expectedAttempt}`,
		);
	}

	if (
		typeof status.functionInvoked !== 'boolean' ||
		!isNumber(status.renderedFrames) ||
		!isNumber(status.encodedFrames) ||
		!isNumber(status.uploadedFrames) ||
		!isNumber(status.uploadedSizeInBytes) ||
		!isNumber(status.startedAt)
	) {
		throw new Error('Renderer storage status has invalid progress fields');
	}

	if (status.state === 'running') {
		return status as StorageRendererStatus;
	}

	if (status.state === 'completed') {
		if (
			status.functionInvoked !== true ||
			!isNumber(status.completedAt) ||
			!(typeof status.videoKey === 'string' || status.videoKey === null) ||
			!(typeof status.audioKey === 'string' || status.audioKey === null) ||
			!Array.isArray(status.artifacts)
		) {
			throw new Error('Renderer storage completed status is invalid');
		}

		for (const artifact of status.artifacts) {
			const candidate = artifact as {
				key?: unknown;
				metadata?: Record<string, unknown>;
			};
			if (
				typeof artifact !== 'object' ||
				artifact === null ||
				typeof candidate.key !== 'string' ||
				typeof candidate.metadata !== 'object' ||
				candidate.metadata === null ||
				typeof candidate.metadata.filename !== 'string' ||
				!isNumber(candidate.metadata.frame) ||
				typeof candidate.metadata.binary !== 'boolean' ||
				!(
					candidate.metadata.downloadBehavior === null ||
					typeof candidate.metadata.downloadBehavior === 'object'
				)
			) {
				throw new Error(
					'Renderer storage completed status has an invalid artifact',
				);
			}
		}

		return status as StorageRendererStatus;
	}

	if (status.state === 'failed') {
		if (
			!isNumber(status.failedAt) ||
			typeof status.shouldRetry !== 'boolean' ||
			typeof status.errorInfo !== 'object' ||
			status.errorInfo === null
		) {
			throw new Error('Renderer storage failed status is invalid');
		}

		return status as StorageRendererStatus;
	}

	throw new Error(
		`Unknown renderer storage status state: ${String(status.state)}`,
	);
};
