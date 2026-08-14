import type {DownloadBehavior} from 'remotion/no-react';
import {rendersPrefix} from './constants';
import type {FunctionErrorInfo} from './write-error-to-storage';

export type RendererFunctionTransport = 'response-streaming' | 's3';

export type S3RendererArtifactMetadata = {
	filename: string;
	frame: number;
	binary: boolean;
	downloadBehavior: DownloadBehavior | null;
};

type S3RendererStatusBase = {
	schema: 1;
	chunk: number;
	attempt: number;
	lambdaInvoked: boolean;
	renderedFrames: number;
	encodedFrames: number;
	startedAt: number;
};

export type S3RendererStatus =
	| (S3RendererStatusBase & {
			state: 'running';
	  })
	| (S3RendererStatusBase & {
			state: 'completed';
			lambdaInvoked: true;
			completedAt: number;
			videoKey: string | null;
			audioKey: string | null;
			artifacts: Array<{
				key: string;
				metadata: S3RendererArtifactMetadata;
			}>;
	  })
	| (S3RendererStatusBase & {
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

export const parseS3RendererStatus = ({
	value,
	expectedChunk,
	expectedAttempt,
}: {
	value: unknown;
	expectedChunk: number;
	expectedAttempt: number;
}): S3RendererStatus => {
	if (typeof value !== 'object' || value === null) {
		throw new Error('Renderer S3 status must be an object');
	}

	const status = value as Record<string, unknown>;
	if (status.schema !== 1) {
		throw new Error(
			`Unsupported renderer S3 status schema: ${String(status.schema)}`,
		);
	}

	if (status.chunk !== expectedChunk || status.attempt !== expectedAttempt) {
		throw new Error(
			`Renderer S3 status identifies chunk ${String(status.chunk)}, attempt ${String(status.attempt)}; expected chunk ${expectedChunk}, attempt ${expectedAttempt}`,
		);
	}

	if (
		typeof status.lambdaInvoked !== 'boolean' ||
		!isNumber(status.renderedFrames) ||
		!isNumber(status.encodedFrames) ||
		!isNumber(status.startedAt)
	) {
		throw new Error('Renderer S3 status has invalid progress fields');
	}

	if (status.state === 'running') {
		return status as S3RendererStatus;
	}

	if (status.state === 'completed') {
		if (
			status.lambdaInvoked !== true ||
			!isNumber(status.completedAt) ||
			!(typeof status.videoKey === 'string' || status.videoKey === null) ||
			!(typeof status.audioKey === 'string' || status.audioKey === null) ||
			!Array.isArray(status.artifacts)
		) {
			throw new Error('Renderer S3 completed status is invalid');
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
				throw new Error('Renderer S3 completed status has an invalid artifact');
			}
		}

		return status as S3RendererStatus;
	}

	if (status.state === 'failed') {
		if (
			!isNumber(status.failedAt) ||
			typeof status.shouldRetry !== 'boolean' ||
			typeof status.errorInfo !== 'object' ||
			status.errorInfo === null
		) {
			throw new Error('Renderer S3 failed status is invalid');
		}

		return status as S3RendererStatus;
	}

	throw new Error(`Unknown renderer S3 status state: ${String(status.state)}`);
};
