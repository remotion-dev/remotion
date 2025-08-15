import type {MediaParserController} from './controller/media-parser-controller';
import type {PrefetchCache} from './fetch';
import type {AllOptions, ParseMediaFields} from './fields';
import type {BufferIterator} from './iterator/buffer-iterator';
import type {MediaParserLogLevel} from './log';
import {Log} from './log';
import type {ParseMediaMode, ParseMediaSrc} from './options';
import type {MediaParserReaderInterface} from './readers/reader';
import {seekBackwards} from './seek-backwards';
import {seekForward} from './seek-forwards';
import type {CurrentReader} from './state/current-reader';
import type {IsoBaseMediaState} from './state/iso-base-media/iso-state';
import type {SeekInfiniteLoop} from './state/seek-infinite-loop';
import type {MediaSectionState} from './state/video-section';
import {isByteInMediaSection} from './state/video-section';

export const performSeek = async ({
	seekTo,
	userInitiated,
	controller,
	mediaSection,
	iterator,
	seekInfiniteLoop,
	logLevel,
	mode,
	contentLength,
	currentReader,
	readerInterface,
	src,
	discardReadBytes,
	fields,
	prefetchCache,
	isoState,
}: {
	seekTo: number;
	userInitiated: boolean;
	controller: MediaParserController;
	mediaSection: MediaSectionState;
	iterator: BufferIterator;
	logLevel: MediaParserLogLevel;
	mode: ParseMediaMode;
	contentLength: number;
	seekInfiniteLoop: SeekInfiniteLoop;
	currentReader: CurrentReader;
	readerInterface: MediaParserReaderInterface;
	fields: Partial<AllOptions<ParseMediaFields>>;
	src: ParseMediaSrc;
	discardReadBytes: (force: boolean) => Promise<void>;
	prefetchCache: PrefetchCache;
	isoState: IsoBaseMediaState;
}): Promise<void> => {
	const byteInMediaSection = isByteInMediaSection({
		position: seekTo,
		mediaSections: mediaSection.getMediaSections(),
	});
	if (byteInMediaSection !== 'in-section' && userInitiated) {
		const sections = mediaSection.getMediaSections();
		const sectionStrings = sections.map((section) => {
			return `start: ${section.start}, end: ${section.size + section.start}`;
		});
		throw new Error(
			`Cannot seek to a byte that is not in the video section. Seeking to: ${seekTo}, sections: ${sectionStrings.join(
				' | ',
			)}`,
		);
	}

	seekInfiniteLoop.registerSeek(seekTo);

	if (seekTo <= iterator.counter.getOffset() && mode === 'download') {
		throw new Error(
			`Seeking backwards is not supported in parseAndDownloadMedia() mode. Current position: ${iterator.counter.getOffset()}, seekTo: ${seekTo}`,
		);
	}

	if (seekTo > contentLength) {
		throw new Error(
			`Cannot seek beyond the end of the file: ${seekTo} > ${contentLength}`,
		);
	}

	if (mode === 'download') {
		Log.verbose(
			logLevel,
			`Skipping over video data from position ${iterator.counter.getOffset()} -> ${seekTo}. Fetching but not reading all the data inbetween because in download mode`,
		);
		iterator.discard(seekTo - iterator.counter.getOffset());
		return;
	}

	await controller._internals.checkForAbortAndPause();

	const alreadyAtByte = iterator.counter.getOffset() === seekTo;
	if (alreadyAtByte) {
		Log.verbose(logLevel, `Already at the desired position, seeking done`);
		controller._internals.performedSeeksSignal.markLastSeekAsUserInitiated();
		return;
	}

	const skippingForward = seekTo > iterator.counter.getOffset();
	controller._internals.performedSeeksSignal.recordSeek({
		from: iterator.counter.getOffset(),
		to: seekTo,
		type: userInitiated ? 'user-initiated' : 'internal',
	});
	if (skippingForward) {
		await seekForward({
			seekTo,
			userInitiated,
			iterator,
			fields,
			logLevel,
			currentReader,
			readerInterface,
			src,
			controller,
			discardReadBytes,
			prefetchCache,
		});
	} else {
		await seekBackwards({
			controller,
			seekTo,
			iterator,
			logLevel,
			currentReader,
			readerInterface,
			src,
			prefetchCache,
		});
	}

	if (userInitiated) {
		isoState.flatSamples.updateAfterSeek(seekTo);
	}

	await controller._internals.checkForAbortAndPause();
};
