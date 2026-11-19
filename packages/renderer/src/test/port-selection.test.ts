import {expect, test} from 'bun:test';
import net from 'node:net';
import {getDesiredPort} from '../get-port';
import {createMutex} from '../locks';

test(
	'Port selection should only be freed once the previous result has been used',
	async () => {
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
	},
	{timeout: 10000},
);

test(
	'Port selection should be released when onPortUnavailable throws',
	async () => {
		const {port, unlockPort} = await getDesiredPort({
			desiredPort: undefined,
			from: 3100,
			to: 3200,
			hostsToTry: ['::', '::1'],
		});
		const server = net.createServer().listen(port);
		await new Promise((resolve) => {
			server.once('listening', resolve);
		});
		unlockPort();

		try {
			await expect(
				getDesiredPort({
					desiredPort: port,
					from: 3100,
					to: 3200,
					hostsToTry: ['::', '::1'],
					onPortUnavailable: () =>
						Promise.reject(new Error('Detection failed')),
				}),
			).rejects.toThrow('Detection failed');

			const start = performance.now();
			const next = await getDesiredPort({
				desiredPort: undefined,
				from: 3100,
				to: 3200,
				hostsToTry: ['::', '::1'],
			});
			next.unlockPort();

			expect(performance.now() - start).toBeLessThan(5000);
		} finally {
			server.close();
		}
	},
	{timeout: 15000},
);

test('A selection that timed out should keep later selections waiting', async () => {
	const mutex = createMutex({timeout: 100});
	const releaseFirst = await mutex.acquire();
	const releaseTimedOut = await mutex.acquire();
	releaseFirst();

	let thirdAcquired = false;
	const third = mutex.acquire().then((release) => {
		thirdAcquired = true;
		return release;
	});
	await new Promise((resolve) => {
		setTimeout(resolve, 50);
	});
	expect(thirdAcquired).toBe(false);

	releaseTimedOut();
	(await third)();
	expect(thirdAcquired).toBe(true);
});
