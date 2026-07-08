import {expect, test} from 'bun:test';
import type {ClientVideoRenderJob} from '../components/RenderQueue/client-side-render-types';
import {makeClientRetryPayload} from '../helpers/retry-payload';

const getClientVideoJob = (
	pageResponsiveness: ClientVideoRenderJob['pageResponsiveness'],
): ClientVideoRenderJob => ({
	type: 'client-video',
	id: 'client-render',
	startedAt: 0,
	compositionId: 'Comp',
	outName: 'out/video.mp4',
	inputProps: {},
	delayRenderTimeout: 30000,
	mediaCacheSizeInBytes: null,
	logLevel: 'info',
	licenseKey: null,
	scale: 1,
	allowHtmlInCanvas: false,
	container: 'mp4',
	videoCodec: 'h264',
	audioCodec: 'aac',
	startFrame: 0,
	endFrame: 29,
	audioBitrate: 'medium',
	videoBitrate: 'high',
	hardwareAcceleration: 'no-preference',
	keyframeIntervalInSeconds: 5,
	transparent: false,
	muted: false,
	pageResponsiveness,
	status: 'idle',
});

test('preserves page responsiveness when retrying a client render', () => {
	expect(
		makeClientRetryPayload(getClientVideoJob('high')).initialPageResponsiveness,
	).toBe('high');
	expect(
		makeClientRetryPayload(getClientVideoJob(42)).initialPageResponsiveness,
	).toBe(42);
});
