import {makeCancelSignal} from '@remotion/renderer';
import type {ApiHandler} from '../api-types';
import type {AddRenderRequest} from '../render-queue/job';
import {addJob} from '../render-queue/queue';

export const handleAddRender: ApiHandler<AddRenderRequest, undefined> = ({
	input,
	entryPoint,
	remotionRoot,
}): Promise<undefined> => {
	const id = String(Math.random()).replace('0.', '');

	if (input.type === 'video') {
		addJob({
			entryPoint,
			remotionRoot,
			job: {
				cleanup: [],
				codec: input.codec,
				audioCodec: input.audioCodec,
				compositionId: input.compositionId,
				deletedOutputLocation: false,
				type: 'video',
				status: 'idle',
				id,
				imageFormat: input.imageFormat,
				outName: input.outName,
				jpegQuality: input.jpegQuality,
				scale: input.scale,
				startedAt: Date.now(),
				verbose: input.verbose,
				cancelToken: makeCancelSignal(),
				concurrency: input.concurrency,
				crf: input.crf,
				endFrame: input.endFrame,
				startFrame: input.startFrame,
				muted: input.muted,
				enforceAudioTrack: input.enforceAudioTrack,
				proResProfile: input.proResProfile,
				x264Preset: input.x264Preset,
				pixelFormat: input.pixelFormat,
				audioBitrate: input.audioBitrate,
				videoBitrate: input.videoBitrate,
				everyNthFrame: input.everyNthFrame,
				numberOfGifLoops: input.numberOfGifLoops,
				delayRenderTimeout: input.delayRenderTimeout,
				disallowParallelEncoding: input.disallowParallelEncoding,
				chromiumOptions: input.chromiumOptions,
				envVariables: input.envVariables,
				serializedInputPropsWithCustomSchema:
					input.serializedInputPropsWithCustomSchema,
				offthreadVideoCacheSizeInBytes: input.offthreadVideoCacheSizeInBytes,
			},
		});
	}

	if (input.type === 'still') {
		addJob({
			job: {
				compositionId: input.compositionId,
				id: String(Math.random()).replace('0.', ''),
				startedAt: Date.now(),
				type: 'still',
				outName: input.outName,
				status: 'idle',
				imageFormat: input.imageFormat,
				jpegQuality: input.jpegQuality,
				frame: input.frame,
				scale: input.scale,
				cleanup: [],
				deletedOutputLocation: false,
				verbose: input.verbose,
				cancelToken: makeCancelSignal(),
				chromiumOptions: input.chromiumOptions,
				delayRenderTimeout: input.delayRenderTimeout,
				envVariables: input.envVariables,
				serializedInputPropsWithCustomSchema:
					input.serializedInputPropsWithCustomSchema,
				offthreadVideoCacheSizeInBytes: input.offthreadVideoCacheSizeInBytes,
			},
			entryPoint,
			remotionRoot,
		});
	}

	return Promise.resolve(undefined);
};
