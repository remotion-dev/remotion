import {expect, test} from 'bun:test';
import {getDesiredPort} from '../get-port';

test('Port selection should only be freed once the previous result has been used', async () => {
	let ports = 0;

	const {port, unlockPort} = await getDesiredPort({
		desiredPort: undefined,
		from: 3100,
		to: 3200,
		hostsToTry: ['::', '::1'],
	});
	const secondPort = getDesiredPort({
		desiredPort: port,
		from: 3100,
		to: 3200,
		hostsToTry: ['::', '::1'],
	}).then(({unlockPort: unlock}) => {
		ports++;
		unlock();
	});

	await new Promise<void>((resolve) => {
		setTimeout(resolve, 2000);
	});

	expect(ports).toBe(0);
	unlockPort();
	await secondPort;

	expect(ports).toBe(1);
});
