import type {IsoBaseMediaBox} from '../../containers/iso-base-media/base-media-box';
import {getMfraSeekingBox} from '../../containers/iso-base-media/get-mfra-seeking-box';
import type {MediaParserController} from '../../controller/media-parser-controller';
import {Log, type LogLevel} from '../../log';
import type {ParseMediaSrc} from '../../options';
import type {ReaderInterface} from '../../readers/reader';

export const lazyMfraLoad = ({
	contentLength,
	controller,
	readerInterface,
	src,
	logLevel,
}: {
	contentLength: number;
	controller: MediaParserController;
	readerInterface: ReaderInterface;
	src: ParseMediaSrc;
	logLevel: LogLevel;
}) => {
	let prom: Promise<IsoBaseMediaBox[] | null> | null = null;

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
		}).then((boxes) => {
			Log.verbose(logLevel, 'Lazily found mfra atom.');
			return boxes;
		});
		return prom;
	};

	return {
		triggerLoad,
	};
};
