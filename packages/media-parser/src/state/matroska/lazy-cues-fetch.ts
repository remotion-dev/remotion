import {fetchWebmCues} from '../../containers/webm/seek/fetch-web-cues';
import type {MatroskaCue} from '../../containers/webm/seek/format-cues';
import type {MediaParserController} from '../../controller/media-parser-controller';
import type {LogLevel} from '../../log';
import {Log} from '../../log';
import type {ParseMediaSrc} from '../../options';
import type {ReaderInterface} from '../../readers/reader';

export const lazyCuesFetch = ({
	controller,
	logLevel,
	readerInterface,
	src,
}: {
	controller: MediaParserController;
	logLevel: LogLevel;
	readerInterface: ReaderInterface;
	src: ParseMediaSrc;
}) => {
	let prom: Promise<MatroskaCue[] | null> | null = null;
	let sOffset: number | null = null;

	const triggerLoad = (position: number, segmentOffset: number) => {
		if (prom) {
			return prom;
		}

		if (sOffset && sOffset !== segmentOffset) {
			throw new Error('Segment offset mismatch');
		}

		sOffset = segmentOffset;

		Log.verbose(logLevel, 'Cues box found, trying to lazy load cues');

		prom = fetchWebmCues({
			controller,
			logLevel,
			position,
			readerInterface,
			src,
		}).then((cues) => {
			Log.verbose(logLevel, 'Cues loaded');
			return cues;
		});

		return prom;
	};

	const getLoadedCues = async () => {
		if (!prom) {
			return null;
		}

		const cues = await prom;
		if (!cues) {
			return null;
		}

		if (!sOffset) {
			throw new Error('Segment offset not set');
		}

		return {
			cues,
			segmentOffset: sOffset,
		};
	};

	return {
		triggerLoad,
		getLoadedCues,
	};
};

export type LazyCuesFetch = ReturnType<typeof lazyCuesFetch>;
export type LazyCuesLoaded = Awaited<
	ReturnType<LazyCuesFetch['getLoadedCues']>
>;
