import {SourceMapConsumer} from 'source-map';
import {getOriginalPosition} from '../../../error-overlay/react-overlay/utils/get-source-map';
import {getLocationOfSequence} from '../../../helpers/get-location-of-sequence';

export const getOriginalLocationFromStack = async (stack: string) => {
	const location = getLocationOfSequence(stack);
	if (!location) {
		return null;
	}

	const res = await fetch(`${location.fileName}.map`);
	const json = await res.json();

	const map = await new Promise((resolve) => {
		SourceMapConsumer.with(json, null, (consumer) => {
			resolve(consumer);
		});
	});
	const originalPosition = getOriginalPosition(
		map as SourceMapConsumer,
		location.lineNumber as number,
		location.columnNumber as number,
	);
	return originalPosition;
};
