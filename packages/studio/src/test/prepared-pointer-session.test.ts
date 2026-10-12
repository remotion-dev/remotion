import {expect, test} from 'bun:test';
import {startPreparedPointerSession} from '../helpers/start-prepared-pointer-session';

test.each(['held', 'released'] as const)(
	'buffers a %s drag until preparation finishes',
	async (state) => {
		const releaseEarly = state === 'released';
		const target = document.createElement('div');
		let ready!: (value: number) => void;
		const preparation = new Promise<number>((resolve) => {
			ready = resolve;
		});
		const events: string[] = [];
		const stop = startPreparedPointerSession({
			event: new PointerEvent('pointerdown', {
				pointerId: 1,
				button: 0,
				buttons: 1,
			}),
			captureTarget: target,
			prepare: () => preparation,
			onReady: (minimum) => {
				events.push(`ready:${minimum}`);
				return {
					onMove: (event) => events.push(`move:${event.clientX}`),
					onEnd: (reason, event) => events.push(`${reason}:${event?.clientX}`),
				};
			},
			onCancel: () => events.push('cancel'),
			onError: () => events.push('error'),
		});
		try {
			for (const clientX of [10, 20])
				window.dispatchEvent(
					new PointerEvent('pointermove', {pointerId: 1, buttons: 1, clientX}),
				);
			if (releaseEarly)
				window.dispatchEvent(
					new PointerEvent('pointerup', {
						pointerId: 1,
						buttons: 0,
						clientX: 30,
					}),
				);
			expect(events).toEqual([]);
			ready(40);
			await preparation;
			expect(events).toEqual(
				releaseEarly ? ['ready:40', 'pointerup:30'] : ['ready:40', 'move:20'],
			);
			if (!releaseEarly)
				window.dispatchEvent(
					new PointerEvent('pointerup', {
						pointerId: 1,
						buttons: 0,
						clientX: 30,
					}),
				);
			expect(events.at(-1)).toBe('pointerup:30');
		} finally {
			stop();
		}
	},
);

test('cancelling pending preparation cannot restart a completed gesture', async () => {
	for (const cancellation of ['manual', 'pointercancel', 'blur'] as const) {
		let ready!: (value: number) => void;
		const preparation = new Promise<number>((resolve) => {
			ready = resolve;
		});
		const events: string[] = [];
		const stop = startPreparedPointerSession({
			event: new PointerEvent('pointerdown', {
				pointerId: 1,
				button: 0,
				buttons: 1,
			}),
			captureTarget: document.createElement('div'),
			prepare: () => preparation,
			onReady: () => {
				events.push('ready');
				return {
					onMove: () => events.push('move'),
					onEnd: () => events.push('end'),
				};
			},
			onCancel: () => events.push('cancel'),
			onError: () => events.push('error'),
		});
		if (cancellation === 'manual') stop();
		else if (cancellation === 'blur') window.dispatchEvent(new Event('blur'));
		else
			window.dispatchEvent(new PointerEvent('pointercancel', {pointerId: 1}));
		ready(40);
		await preparation;
		stop();
		expect(events).toEqual(['cancel']);
	}
});

test('failed preparation cancels once and reports the error after an early release', async () => {
	let fail!: (error: Error) => void;
	const preparation = new Promise<never>((_resolve, reject) => {
		fail = reject;
	});
	const events: unknown[] = [];
	const error = new Error('Source unavailable');
	const stop = startPreparedPointerSession({
		event: new PointerEvent('pointerdown', {
			pointerId: 1,
			button: 0,
			buttons: 1,
		}),
		captureTarget: document.createElement('div'),
		prepare: () => preparation,
		onReady: () => {
			throw new Error('Must not begin a failed drag');
		},
		onCancel: () => events.push('cancel'),
		onError: (failure) => events.push(failure),
	});
	window.dispatchEvent(
		new PointerEvent('pointerup', {pointerId: 1, buttons: 0}),
	);
	fail(error);
	await preparation.catch(() => undefined);
	await Promise.resolve();
	stop();
	expect(events).toEqual(['cancel', error]);
});
