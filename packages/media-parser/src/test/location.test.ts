import {expect, test} from 'bun:test';
import {parseLocation} from '../get-location';

// https://en.wikipedia.org/wiki/ISO_6709#Examples
test('Should format location data', () => {
	expect(parseLocation('+47.3915+008.5121+404.680/')).toEqual({
		latitude: 47.3915,
		longitude: 8.5121,
		altitude: 404.68,
	});
	expect(parseLocation('something')).toEqual(null);
	expect(parseLocation('+90+000/')).toEqual({
		latitude: 90,
		longitude: 0,
		altitude: null,
	});
	expect(parseLocation('+40.6894-074.0447/')).not.toEqual(null);

	const data = parseLocation('+34.4243-118.4786+405.987/');
	expect(data).toEqual({
		altitude: 405.987,
		latitude: 34.4243,
		longitude: -118.4786,
	});
});
