import {getMetadata} from './metadata/get-metadata';
import type {ParserState} from './state/parser-state';

export type MediaParserLocation = {
	latitude: number;
	longitude: number;
	altitude: number | null;
	horizontalAccuracy: number | null;
};

export function parseLocation(locationString: string) {
	const locationPattern =
		/^([+-]\d{2}\.?\d{0,10})([+-]\d{3}\.?\d{0,10})([+-]\d+(\.\d+)?)?\/$/;
	const match = locationString.match(locationPattern);

	if (!match) {
		return null;
	}

	// Extract latitude, longitude, and altitude
	const latitude = parseFloat(match[1]);
	const longitude = parseFloat(match[2]);
	const altitude = match[3] ? parseFloat(match[3]) : null;

	return {
		latitude,
		longitude,
		altitude,
	};
}

export const getLocation = (state: ParserState): MediaParserLocation | null => {
	const metadata = getMetadata(state);
	const locationEntry = metadata.find(
		(entry) => entry.key === 'com.apple.quicktime.location.ISO6709',
	);
	const horizontalAccuracy = metadata.find(
		(entry) => entry.key === 'com.apple.quicktime.location.accuracy.horizontal',
	);

	if (locationEntry) {
		const parsed = parseLocation(locationEntry.value as string);
		if (parsed === null) {
			return null;
		}

		return {
			...parsed,
			horizontalAccuracy: horizontalAccuracy?.value
				? parseFloat(String(horizontalAccuracy.value))
				: null,
		};
	}

	return null;
};
