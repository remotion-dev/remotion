import type {ParserState} from './state/parser-state';
import type {AudioOrVideoSample} from './webcodec-sample-types';
import {workOnSeekRequest} from './work-on-seek-request';

export const emitAudioSample = async ({
	trackId,
	audioSample,
	state,
}: {
	trackId: number;
	audioSample: AudioOrVideoSample;
	state: ParserState;
}) => {
	await state.callbacks.onAudioSample(trackId, audioSample);
	await workOnSeekRequest({
		mode: state.mode,
		seekInfiniteLoop: state.seekInfiniteLoop,
		logLevel: state.logLevel,
		controller: state.controller,
		videoSection: state.videoSection,
		mp4HeaderSegment: state.mp4HeaderSegment,
		isoState: state.iso,
		iterator: state.iterator,
		structureState: state.structure,
		callbacks: state.callbacks,
		src: state.src,
		contentLength: state.contentLength,
		readerInterface: state.readerInterface,
		currentReader: state.currentReader,
		discardReadBytes: state.discardReadBytes,
		fields: state.fields,
	});
};

export const emitVideoSample = async ({
	trackId,
	videoSample,
	state,
}: {
	trackId: number;
	videoSample: AudioOrVideoSample;
	state: ParserState;
}) => {
	await state.callbacks.onVideoSample(trackId, videoSample);
	await workOnSeekRequest({
		logLevel: state.logLevel,
		controller: state.controller,
		videoSection: state.videoSection,
		mp4HeaderSegment: state.mp4HeaderSegment,
		isoState: state.iso,
		iterator: state.iterator,
		structureState: state.structure,
		callbacks: state.callbacks,
		src: state.src,
		contentLength: state.contentLength,
		readerInterface: state.readerInterface,
		mode: state.mode,
		seekInfiniteLoop: state.seekInfiniteLoop,
		currentReader: state.currentReader,
		discardReadBytes: state.discardReadBytes,
		fields: state.fields,
	});
};
