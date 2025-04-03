import {fetchWebmCues} from '../../containers/webm/fetch-web-cues';
import type {PossibleEbml} from '../../containers/webm/segments/all-segments';
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
	let prom: Promise<PossibleEbml[] | null> | null = null;

	const triggerLoad = (position: number) => {
		if (prom) {
			return prom;
		}

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

	return {
		triggerLoad,
	};
};
