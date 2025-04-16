import type {Idx1Entry} from '../../containers/riff/riff-box';
import {fetchIdx1} from '../../containers/riff/seek/fetch-idx1';
import type {RiffSeekingHints} from '../../containers/riff/seeking-hints';
import type {MediaParserController} from '../../controller/media-parser-controller';
import type {LogLevel} from '../../log';
import type {ParseMediaSrc} from '../../options';
import type {ReaderInterface} from '../../readers/reader';

export const lazyIdx1Fetch = ({
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
	let prom: Promise<Idx1Entry[]> | null = null;
	let result: Idx1Entry[] | null = null;

	const triggerLoad = (position: number) => {
		if (result) {
			return Promise.resolve(result);
		}

		if (prom) {
			return prom;
		}

		prom = fetchIdx1({
			controller,
			logLevel,
			position,
			readerInterface,
			src,
		}).then((entries) => {
			prom = null;
			result = entries;
			return entries;
		});

		return prom;
	};

	const getLoadedIdx1 = async () => {
		if (!prom) {
			return null;
		}

		const entries = await prom;

		return entries;
	};

	const getIfAlreadyLoaded = () => {
		if (result) {
			return result;
		}

		return null;
	};

	const setFromSeekingHints = (hints: RiffSeekingHints) => {
		if (hints.idx1Entries) {
			result = hints.idx1Entries;
		}
	};

	return {
		triggerLoad,
		getLoadedIdx1,
		getIfAlreadyLoaded,
		setFromSeekingHints,
	};
};

export type LazyIdx1Fetch = ReturnType<typeof lazyIdx1Fetch>;
