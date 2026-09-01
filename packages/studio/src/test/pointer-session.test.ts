import {expect, test} from 'bun:test';
import {
	observePointerRelease,
	type PointerSessionEndReason,
	startCapturedPointerSession,
} from '../helpers/pointer-session';

class CaptureTarget extends EventTarget {
	private readonly capturedPointers = new Set<number>();
	public releasedPointers: number[] = [];

	setPointerCapture(pointerId: number) {
		this.capturedPointers.add(pointerId);
	}

	hasPointerCapture(pointerId: number) {
		return this.capturedPointers.has(pointerId);
	}

	releasePointerCapture(pointerId: number) {
		this.capturedPointers.delete(pointerId);
		this.releasedPointers.push(pointerId);
	}
}

class FakeDocument extends EventTarget {
	public visibilityState: DocumentVisibilityState = 'visible';
}

const makePointerEvent = (
	type: string,
	{
		pointerId,
		button = 0,
		buttons = 1,
	}: {
		pointerId: number;
		button?: number;
		buttons?: number;
	},
) => {
	return Object.assign(new Event(type), {
		pointerId,
		button,
		buttons,
	}) as PointerEvent;
};

test('pointer sessions filter their pointer and clean up every termination path', () => {
	const originalWindow = globalThis.window;
	const originalDocument = globalThis.document;
	const fakeWindow = new EventTarget() as Window & typeof globalThis;
	const fakeDocument = new FakeDocument();
	Object.defineProperty(globalThis, 'window', {
		configurable: true,
		value: fakeWindow,
	});
	Object.defineProperty(globalThis, 'document', {
		configurable: true,
		value: fakeDocument,
	});

	try {
		const target = new CaptureTarget();
		const moves: number[] = [];
		const endings: PointerSessionEndReason[] = [];
		startCapturedPointerSession({
			event: {button: 0, pointerId: 4},
			captureTarget: target as unknown as Element,
			onMove: (event) => moves.push(event.pointerId),
			onEnd: (reason) => endings.push(reason),
		});

		fakeWindow.dispatchEvent(
			makePointerEvent('pointermove', {pointerId: 8, buttons: 1}),
		);
		fakeWindow.dispatchEvent(
			makePointerEvent('pointerup', {pointerId: 8, buttons: 0}),
		);
		fakeWindow.dispatchEvent(
			makePointerEvent('pointermove', {pointerId: 4, buttons: 1}),
		);
		expect(moves).toEqual([4]);
		expect(endings).toEqual([]);

		fakeWindow.dispatchEvent(
			makePointerEvent('pointermove', {pointerId: 4, buttons: 0}),
		);
		fakeWindow.dispatchEvent(
			makePointerEvent('pointercancel', {pointerId: 4, buttons: 0}),
		);
		expect(endings).toEqual(['buttons-released']);
		expect(target.releasedPointers).toEqual([4]);

		const terminationCases: {
			reason: PointerSessionEndReason;
			trigger: (sessionTarget: CaptureTarget, pointerId: number) => void;
		}[] = [
			{
				reason: 'pointerup',
				trigger: (_sessionTarget, pointerId) =>
					fakeWindow.dispatchEvent(
						makePointerEvent('pointerup', {pointerId, buttons: 0}),
					),
			},
			{
				reason: 'pointercancel',
				trigger: (_sessionTarget, pointerId) =>
					fakeWindow.dispatchEvent(
						makePointerEvent('pointercancel', {pointerId, buttons: 0}),
					),
			},
			{
				reason: 'lostpointercapture',
				trigger: (sessionTarget, pointerId) =>
					sessionTarget.dispatchEvent(
						makePointerEvent('lostpointercapture', {
							pointerId,
							buttons: 0,
						}),
					),
			},
			{
				reason: 'blur',
				trigger: () => fakeWindow.dispatchEvent(new Event('blur')),
			},
			{
				reason: 'visibilitychange',
				trigger: () => {
					fakeDocument.visibilityState = 'hidden';
					fakeDocument.dispatchEvent(new Event('visibilitychange'));
					fakeDocument.visibilityState = 'visible';
				},
			},
		];

		for (const [index, terminationCase] of terminationCases.entries()) {
			const sessionTarget = new CaptureTarget();
			const reasons: PointerSessionEndReason[] = [];
			const pointerId = index + 10;
			startCapturedPointerSession({
				event: {button: 0, pointerId},
				captureTarget: sessionTarget as unknown as Element,
				onEnd: (reason) => reasons.push(reason),
			});
			terminationCase.trigger(sessionTarget, pointerId);
			terminationCase.trigger(sessionTarget, pointerId);
			expect(reasons).toEqual([terminationCase.reason]);
			expect(sessionTarget.releasedPointers).toEqual([pointerId]);
		}
	} finally {
		Object.defineProperty(globalThis, 'window', {
			configurable: true,
			value: originalWindow,
		});
		Object.defineProperty(globalThis, 'document', {
			configurable: true,
			value: originalDocument,
		});
	}
});

test('release observers do not capture the element under the pointer', () => {
	const originalWindow = globalThis.window;
	const originalDocument = globalThis.document;
	const fakeWindow = new EventTarget() as Window & typeof globalThis;
	const fakeDocument = new FakeDocument();
	Object.defineProperty(globalThis, 'window', {
		configurable: true,
		value: fakeWindow,
	});
	Object.defineProperty(globalThis, 'document', {
		configurable: true,
		value: fakeDocument,
	});

	try {
		const elementUnderPointer = new CaptureTarget();
		const endings: PointerSessionEndReason[] = [];
		const pointerDownEvent = {
			button: 0,
			pointerId: 20,
			target: elementUnderPointer,
		} as unknown as PointerEvent;
		observePointerRelease({
			event: pointerDownEvent,
			onEnd: (reason) => endings.push(reason),
		});

		elementUnderPointer.dispatchEvent(
			makePointerEvent('lostpointercapture', {
				pointerId: 20,
				buttons: 0,
			}),
		);
		fakeWindow.dispatchEvent(
			makePointerEvent('pointermove', {pointerId: 20, buttons: 1}),
		);
		expect(endings).toEqual([]);
		expect(elementUnderPointer.releasedPointers).toEqual([]);

		fakeWindow.dispatchEvent(
			makePointerEvent('pointerup', {pointerId: 20, buttons: 0}),
		);
		expect(endings).toEqual(['pointerup']);
	} finally {
		Object.defineProperty(globalThis, 'window', {
			configurable: true,
			value: originalWindow,
		});
		Object.defineProperty(globalThis, 'document', {
			configurable: true,
			value: originalDocument,
		});
	}
});
