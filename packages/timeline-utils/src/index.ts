export type {
	AudioWaveformWorkerIncomingMessage,
	AudioWaveformWorkerOutgoingMessage,
	AudioWaveformWorkerRenderMessage,
} from './audio-waveform/audio-waveform-worker-types';
export {TARGET_SAMPLE_RATE} from './audio-waveform/constants';
export {drawBars, type WaveformVolume} from './audio-waveform/draw-peaks';
export {getVisibleWaveformVolume} from './audio-waveform/get-visible-waveform-volume';
export {loadWaveformPeaks} from './audio-waveform/load-waveform-peaks';
export {makeAudioWaveformWorker} from './audio-waveform/make-audio-waveform-worker';
export {sliceVisibleWaveformPeaks} from './audio-waveform/slice-visible-waveform-peaks';
export {sliceWaveformPeaks} from './audio-waveform/slice-waveform-peaks';
export {
	createWaveformPeakProcessor,
	emitWaveformProgress,
} from './audio-waveform/waveform-peak-processor';
export {clampTimestampsToDuration} from './clamp-timestamps-to-duration';
export {extractFrames} from './extract-frames';
export type {
	ExtractFramesProps,
	ExtractFramesTimestampsInSecondsFn,
} from './extract-frames';
export {
	addFrameToCache,
	aspectRatioCache,
	frameDatabase,
	getAspectRatioFromCache,
	getFrameDatabaseKeyPrefix,
	getTimestampFromFrameDatabaseKey,
	makeFrameDatabaseKey,
} from './frame-database';
export type {FrameDatabaseKey} from './frame-database';
export {drawRepeatingImageThumbnail} from './image-thumbnail/draw-repeating-image-thumbnail';
export {getScaledImageThumbnailDimensions} from './image-thumbnail/get-scaled-image-thumbnail-dimensions';
export {
	getLoopDisplaySegments,
	getLoopDisplayWidth,
	shouldTileLoopDisplay,
} from './loop-display';
export type {LoopDisplaySegment, TimelineLoopDisplay} from './loop-display';
export {
	WEBCODECS_TIMESCALE,
	calculateTimestampSlots,
	drawSlot,
	ensureSlots,
	fillFrameWhereItFits,
	fillWithCachedFrames,
	getDurationOfOneFrame,
} from './render-frame-strip';
export {renderFrameStripToCanvas} from './render-frame-strip-to-canvas';
export type {RenderFrameStripToCanvasOptions} from './render-frame-strip-to-canvas';
export {resizeVideoFrame} from './resize-video-frame';
