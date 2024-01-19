import {SourceMapConsumer} from 'source-map';
import {getOriginalPosition} from '../../../error-overlay/react-overlay/utils/get-source-map';
import {getLocationOfSequence} from '../../../helpers/get-location-of-sequence';

type Waiter = {
	id: string;
	forFileName: string;
	resolve: (consumer: SourceMapConsumer) => void;
};

const waiters: Waiter[] = [];

const sourceMapConsumerCache: Record<string, SourceMapConsumer> = {};
const isCreating: Record<string, boolean> = {};

const getSourceMapCache = async (fileName: string) => {
	if (sourceMapConsumerCache[fileName]) {
		return sourceMapConsumerCache[fileName];
	}

	if (isCreating[fileName]) {
		return new Promise<SourceMapConsumer>((resolve) => {
			waiters.push({
				id: String(Math.random()),
				forFileName: fileName,
				resolve,
			});
		});
	}

	isCreating[fileName] = true;
	const res = await fetch(`${fileName}.map`);
	const json = await res.json();

	const map = await new Promise<SourceMapConsumer>((resolve) => {
		SourceMapConsumer.with(json, null, (consumer) => {
			resolve(consumer);
		});
	});
	waiters.filter((w) => {
		if (w.forFileName === fileName) {
			w.resolve(map);
			return false;
		}

		return true;
	});
	sourceMapConsumerCache[fileName] = map;
	isCreating[fileName] = false;
	return map;
};

export const getOriginalLocationFromStack = async (stack: string) => {
	const location = getLocationOfSequence(stack);

	if (!location) {
		return null;
	}

	const map = await getSourceMapCache(location.fileName);
	const originalPosition = getOriginalPosition(
		map,
		location.lineNumber as number,
		location.columnNumber as number,
	);
	return originalPosition;
};
