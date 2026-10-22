import {expect, test} from 'bun:test';
import {startThresholdPointerSession} from '../helpers/start-threshold-pointer-session';

test.each(['held', 'released'] as const)(
	'handles a %s drag synchronously after the movement threshold',
	(state) => {
		const events: string[] = [];
		const stop = startThresholdPointerSession({
			event: new PointerEvent('pointerdown', {
				pointerId: 1,
				button: 0,
				buttons: 1,
			}),
			captureTarget: document.createElement('div'),
			minimumMovement: 4,
			onStart: () => {
				events.push('start');
				return {
					onMove: (event) => events.push(`move:${event.clientX}`),
					onEnd: (reason, event) => events.push(`${reason}:${event?.clientX}`),
				};
			},
			onCancel: () => events.push('cancel'),
		});
		try {
			window.dispatchEvent(
				new PointerEvent('pointermove', {
					pointerId: 1,
					buttons: 1,
					clientX: 3,
				}),
			);
			expect(events).toEqual([]);
			if (state === 'held') {
				for (const clientX of [10, 20])
					window.dispatchEvent(
						new PointerEvent('pointermove', {
							pointerId: 1,
							buttons: 1,
							clientX,
						}),
					);
				expect(events).toEqual(['start', 'move:10', 'move:20']);
			}

			window.dispatchEvent(
				new PointerEvent('pointerup', {
					pointerId: 1,
					buttons: 0,
					clientX: 30,
				}),
			);
			expect(events).toEqual(
				state === 'held'
					? ['start', 'move:10', 'move:20', 'pointerup:30']
					: ['start', 'pointerup:30'],
			);
		} finally {
			stop();
		}
	},
);

test('cancelling before the movement threshold cannot restart a completed gesture', () => {
	for (const cancellation of ['manual', 'pointercancel', 'blur'] as const) {
		const events: string[] = [];
		const stop = startThresholdPointerSession({
			event: new PointerEvent('pointerdown', {
				pointerId: 1,
				button: 0,
				buttons: 1,
			}),
			captureTarget: document.createElement('div'),
			minimumMovement: 4,
			onStart: () => {
				events.push('start');
				return {
					onMove: () => events.push('move'),
					onEnd: () => events.push('end'),
				};
			},
			onCancel: () => events.push('cancel'),
		});
		if (cancellation === 'manual') stop();
		else if (cancellation === 'blur') window.dispatchEvent(new Event('blur'));
		else
			window.dispatchEvent(new PointerEvent('pointercancel', {pointerId: 1}));
		window.dispatchEvent(
			new PointerEvent('pointermove', {pointerId: 1, buttons: 1, clientX: 30}),
		);
		stop();
		expect(events).toEqual(['cancel']);
	}
});
