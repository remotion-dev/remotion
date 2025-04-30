import type {IsoBaseMediaBox} from '../../containers/iso-base-media/base-media-box';
import {getMfraSeekingBox} from '../../containers/iso-base-media/get-mfra-seeking-box';
import type {TfraBox} from '../../containers/iso-base-media/mfra/tfra';
import type {MediaParserController} from '../../controller/media-parser-controller';
import type {PrefetchCache} from '../../fetch';
import {Log, type LogLevel} from '../../log';
import type {ParseMediaSrc} from '../../options';
import type {ReaderInterface} from '../../readers/reader';
import type {IsoBaseMediaSeekingHints} from '../../seeking-hints';
import {truthy} from '../../truthy';
import type {MediaSectionState} from '../video-section';

export const lazyMfraLoad = ({
	contentLength,
	controller,
	readerInterface,
	src,
	logLevel,
	prefetchCache,
	mediaSectionState,
}: {
	contentLength: number;
	controller: MediaParserController;
	readerInterface: ReaderInterface;
	src: ParseMediaSrc;
	logLevel: LogLevel;
	prefetchCache: PrefetchCache;
	mediaSectionState: MediaSectionState;
}) => {
	let prom: Promise<IsoBaseMediaBox[] | null> | null = null;
	let result: IsoBaseMediaBox[] | null = null;

	const triggerLoad = () => {
		if (prom) {
			return prom;
		}

		Log.verbose(logLevel, 'Moof box found, trying to lazy load mfra');

		prom = getMfraSeekingBox({
			contentLength,
			controller,
			readerInterface,
			src,
			logLevel,
			prefetchCache,
		}).then((boxes) => {
			Log.verbose(logLevel, 'Lazily found mfra atom.');
			result = boxes;
			if (boxes) {
				const tfras = boxes.filter((b) => b.type === 'tfra-box') as TfraBox[];
				const lastMoofOffsets = tfras.map((f) => {
					if (f.entries.length <= 1) {
						return null;
					}

					return f.entries[f.entries.length - 1].moofOffset;
				});

				if (lastMoofOffsets.length > 0) {
					const maxOffset = Math.max(...lastMoofOffsets.filter(truthy));

					// Mark a tiny section as video section
					// In mdat.ts, we skip to the last media section when samples are not needed
					mediaSectionState.addMediaSection({
						start: maxOffset - 16,
						size: 16,
					});
				}
			}

			return boxes;
		});
		return prom;
	};

	const getIfAlreadyLoaded = () => {
		if (result) {
			return result;
		}

		return null;
	};

	const setFromSeekingHints = (hints: IsoBaseMediaSeekingHints) => {
		result = hints.mfraAlreadyLoaded;
	};

	return {
		triggerLoad,
		getIfAlreadyLoaded,
		setFromSeekingHints,
	};
};
